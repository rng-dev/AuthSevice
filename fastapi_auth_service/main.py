import os
from datetime import datetime, timedelta
from typing import Optional

from fastapi import FastAPI, HTTPException, Depends, status, Response, Request
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel
import psycopg2
import smtplib
from email.mime.text import MIMEText
import random
import requests

from dotenv import load_dotenv
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))

SECRET_KEY = os.getenv("JWT_SECRET")
if not SECRET_KEY:
    raise RuntimeError("JWT_SECRET environment variable is not set!")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 часа

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:1234@localhost:5432/AuthService")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # !!!указать конкретные адреса в продакшене
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic модели
class User(BaseModel):
    id: int
    username: str
    is_active: bool
    email: str = ''
    country: str = ''
    phone: str = ''
    email_confirmed: bool = False

class UserInDB(User):
    hashed_password: str

class UserCreate(BaseModel):
    username: str
    password: str
    email: str
    country: str
    phone: str

class Token(BaseModel):
    access_token: str
    token_type: str

class ConfirmMailRequest(BaseModel):
    email: str
    code: str

# Вспомогательные функции
def get_db():
    conn = psycopg2.connect(DATABASE_URL)
    return conn

def get_user(username: str) -> Optional[UserInDB]:
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT id, username, password, is_active, email, country, phone, email_confirmed FROM auth_service_user WHERE username=%s", (username,))
    row = cur.fetchone()
    cur.close()
    conn.close()
    if row:
        return UserInDB(
            id=row[0],
            username=row[1],
            hashed_password=row[2],
            is_active=row[3],
            email=row[4] or '',
            country=row[5] or '',
            phone=row[6] or '',
            email_confirmed=row[7] if len(row) > 7 else False
        )
    return None

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def authenticate_user(username: str, password: str):
    user = get_user(username)
    if not user or not user.is_active:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def triple_jwt_check(token: str):
    # 1. Проверка подписи и срока действия
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    # 2. Проверка пользователя в базе
    user = get_user(username)
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found or inactive")
    # 3. Проверка last_login
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT last_login FROM auth_service_user WHERE username=%s", (username,))
    row = cur.fetchone()
    cur.close()
    conn.close()
    if not row or not row[0]:
        raise HTTPException(status_code=401, detail="Token expired by last_login")
    last_login = row[0]
    # Привести last_login к naive datetime
    if last_login.tzinfo is not None:
        last_login = last_login.replace(tzinfo=None)
    if (datetime.utcnow() - last_login).total_seconds() > 60*60*24:
        raise HTTPException(status_code=401, detail="Token expired by last_login")
    return user

# Для хранения кодов подтверждения email
pending_email_confirm = {}

def send_email(to_email, subject, body):
    django_url = os.getenv("DJANGO_EMAIL_API_URL", "http://localhost:8001/api/send-email/")
    try:
        resp = requests.post(
            django_url,
            json={"to_email": to_email, "subject": subject, "body": body},
            timeout=10
        )
        resp.raise_for_status()
    except Exception as e:
        raise RuntimeError(f"Ошибка отправки email через Django: {e}")

# --- Регистрация ---
@app.post("/register", response_model=User)
def register(user: UserCreate):
    if get_user(user.username):
        raise HTTPException(status_code=400, detail="Username already registered")
    hashed_password = get_password_hash(user.password)
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO auth_service_user (username, password, is_active, is_staff, is_superuser, date_joined, first_name, last_name, email, country, phone, email_confirmed) VALUES (%s, %s, true, false, false, now(), %s, %s, %s, %s, %s, false) RETURNING id",
        (user.username, hashed_password, '', '', user.email, user.country, user.phone)
    )
    user_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()
    return User(id=user_id, username=user.username, is_active=True, email=user.email, country=user.country, phone=user.phone, email_confirmed=False)

# --- Авторизация ---
@app.post("/token")
def login_for_access_token(response: Response, form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    # Обновляем last_login
    conn = get_db()
    cur = conn.cursor()
    cur.execute("UPDATE auth_service_user SET last_login=now() WHERE id=%s", (user.id,))
    conn.commit()
    cur.close()
    conn.close()
    access_token = create_access_token(
        data={"sub": user.username},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=True,
        samesite="Lax",
        max_age=60*60*24
    )
    return {"access_token": access_token, "token_type": "bearer"}

# --- Отправка кода подтверждения email ---
@app.post("/send-confirm-mail")
def send_confirm_mail(request: Request):
    data = request.json() if hasattr(request, "json") else None
    # Получаем пользователя из токена cookie
    access_token = request.cookies.get("access_token")
    if not access_token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    user = triple_jwt_check(access_token)
    if not user.email:
        raise HTTPException(status_code=400, detail="Нет email для подтверждения")
    code = str(random.randint(100000, 999999))
    pending_email_confirm[user.email] = code
    send_email(
        user.email,
        "Подтверждение почты",
        f"Ваш код подтверждения: {code}"
    )
    return {"detail": "Код отправлен на почту"}

@app.post("/confirm-mail")
def confirm_mail(data: ConfirmMailRequest, request: Request):
    # Получаем пользователя из токена cookie
    access_token = request.cookies.get("access_token")
    if not access_token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    user = triple_jwt_check(access_token)
    email = user.email
    code = data.code
    if pending_email_confirm.get(email) != code:
        raise HTTPException(status_code=400, detail="Неверный код подтверждения")
    # Подтверждаем email
    conn = get_db()
    cur = conn.cursor()
    cur.execute("UPDATE auth_service_user SET email_confirmed=true WHERE email=%s", (email,))
    conn.commit()
    cur.close()
    conn.close()
    pending_email_confirm.pop(email, None)
    return {"detail": "Почта подтверждена"}

# Для /me и других защищённых эндпоинтов — получать токен из cookie:
from fastapi import Cookie

@app.get("/me", response_model=User)
def read_users_me(access_token: str = Cookie(None)):
    if not access_token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    user = triple_jwt_check(access_token)
    return User(
        id=user.id,
        username=user.username,
        is_active=user.is_active,
        email=getattr(user, 'email', ''),
        country=getattr(user, 'country', ''),
        phone=getattr(user, 'phone', ''),
        email_confirmed=getattr(user, 'email_confirmed', False)
    )
