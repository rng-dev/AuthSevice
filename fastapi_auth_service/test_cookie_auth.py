import requests

# 1. Авторизация (получение cookie)
s = requests.Session()
resp = s.post(
    "http://localhost:8000/token",
    data={"username": "user1", "password": "yourpassword"},
    headers={"Content-Type": "application/x-www-form-urlencoded"},
)
print("Set-Cookie:", resp.headers.get("set-cookie"))

# 2. Проверка, что cookie установлена
assert "access_token=" in resp.headers.get("set-cookie", ""), "JWT не установлен в cookie!"

# 3. Запрос к защищённому эндпоинту без передачи токена явно
resp2 = s.get("http://localhost:8000/me")
print("User info:", resp2.json())
assert resp2.status_code == 200, "Не удалось получить данные пользователя через cookie!"

# 4. Проверка, что Authorization не используется
assert "Authorization" not in resp2.request.headers, "Токен не должен передаваться в Authorization!"
