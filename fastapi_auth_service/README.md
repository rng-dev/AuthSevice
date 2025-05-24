# FastAPI Auth Service

## Как запустить FastAPI

1. Установите зависимости:
   ```
   pip install -r requirements.txt
   ```

2. Запустите сервер FastAPI:
   ```
   uvicorn main:app --reload
   ```

   По умолчанию сервер будет доступен на http://127.0.0.1:8000

3. Документация API будет доступна по адресу:
   - Swagger UI: http://127.0.0.1:8000/docs
   - Redoc: http://127.0.0.1:8000/redoc

**Убедитесь, что база данных PostgreSQL запущена и настройки подключения корректны.**
