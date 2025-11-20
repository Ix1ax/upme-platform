# Auth Service

Сервис отвечает за регистрацию, аутентификацию и управление JWT-токенами пользователей платформы. Все эндпоинты доступны по префиксу `/api/auth`.

## Авторизация

- `POST /register`, `/login`, `/refresh`, `/logout` доступны без токена.
- `GET /me` требует валидный `Authorization: Bearer <accessToken>` — токен проверяется фильтром `JwtAuthFilter`.
- Swagger UI: `http://localhost:8081/swagger`. Все ручки промаркированы по ролям:
  - `Role · Public` — регистрация, логин, refresh.
  - `Role · Authenticated` — logout и `/me`, требуют access token.

## Эндпоинты

### Регистрация пользователя
- **POST** `/api/auth/register`
- **Request JSON**
  ```json
  {
    "name": "Иван Иванов",
    "email": "ivan@example.com",
    "password": "P@ssw0rd",
    "confirmPassword": "P@ssw0rd",
    "role": "STUDENT",
    "isAcceptPolicy": true
  }
  ```
- **Response 200**
  ```json
  {
    "accessToken": "<jwt>",
    "refreshToken": "<refresh>",
    "tokenType": "Bearer"
  }
  ```

### Логин
- **POST** `/api/auth/login`
- **Request JSON**
  ```json
  {
    "email": "ivan@example.com",
    "password": "P@ssw0rd"
  }
  ```
- **Response 200** — та же структура `TokenResponse`, что и при регистрации.

### Обновление токена
- **POST** `/api/auth/refresh`
- **Request JSON**
  ```json
  {
    "refreshToken": "<refresh>"
  }
  ```
- **Response 200** — новая пара токенов (`TokenResponse`).

### Выход (инвалидация refresh токена)
- **POST** `/api/auth/logout`
- **Request JSON** — идентичен `/refresh`.
- **Response 204** — тело пустое.

### Получение профиля авторизованного пользователя
- **GET** `/api/auth/me`
- **Headers** `Authorization: Bearer <accessToken>`
- **Response 200**
  ```json
  {
    "id": "2cb5c0c9-1a8c-4d7f-98a8-3a657c989001",
    "name": "Иван Иванов",
    "email": "ivan@example.com",
    "role": "STUDENT"
  }
  ```
- **Response 401** — если токен не передан или просрочен.

## Типичные коды ответов
- `200 OK` — успешный запрос с телом.
- `201 Created` не используется (создание пользователя также возвращает `200`).
- `204 No Content` — успешный выход.
- `400 Bad Request` — ошибка валидации входных данных.
- `401 Unauthorized` — неверные/отсутствующие креды.
- `409 Conflict` — попытка зарегистрировать существующий email (обрабатывается сервисом).

## Запуск локально
1. Собрать `mvn clean package`.
2. Запустить `mvn spring-boot:run` (порт берётся из настроек `application.yml/properties`).
3. Для защищённых ручек требуются access токены, которые выдаёт сам сервис.
