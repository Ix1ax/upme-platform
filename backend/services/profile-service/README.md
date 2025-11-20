# Profile Service

Сервис хранит и обновляет данные профиля пользователей (отображаемое имя, био, контакты, аватар). Публичных ручек нет — все запросы требуют авторизации и выполняются от имени текущего пользователя.

Базовый префикс: `/api/profile`.

## Авторизация
- Все методы читают `sub` и `role` из JWT (`@AuthenticationPrincipal Jwt`).
- Фронту нужно передавать заголовок `Authorization: Bearer <accessToken>` от Auth Service.
- Swagger UI: `http://localhost:8082/swagger`. Все ручки помечены тегом `Role · Authenticated`, чтобы сразу понимать, что нужен валидный JWT.

## Эндпоинты

### Получить мой профиль
- **GET** `/api/profile/me`
- **Response 200**
  ```json
  {
    "id": "c6aaf007-8ab1-4fbb-a7fc-6322c98dfc1f",
    "displayName": "Иван Иванов",
    "bio": "Преподаватель математики",
    "avatarUrl": "https://cdn/.../avatar.png",
    "city": "Москва",
    "phone": "+7 999 111-22-33",
    "role": "TEACHER"
  }
  ```

### Обновить профиль (без аватара)
- **POST** `/api/profile`
- **Body (application/json или form-urlencoded)** — отсутствующие поля не перезаписывают данные. Чтобы очистить значение, передайте пустую строку.
  ```json
  {
    "displayName": "Иван",
    "bio": "Пишу о backend",
    "city": "СПб",
    "phone": "+7 999 123-45-67"
  }
  ```
- **Response 200** — возвращает обновлённый `ProfileResponse`.

### Обновить аватар
- **POST** `/api/profile/avatar`
- **Headers**: `Content-Type: multipart/form-data`
- **Parts**:
  - `avatar` — файл изображения пользователя.
- **Response 200**
  ```json
  {
    "id": "...",
    "displayName": "Иван",
    "avatarUrl": "https://cdn/.../new-avatar.png",
    ...
  }
  ```

## Коды ответов
- `200 OK` — успешное выполнение.
- `400 Bad Request` — некорректные поля (валидация лежит в сервисе).
- `401 Unauthorized` — токен отсутствует/просрочен.

## Локальный запуск
1. Собрать `mvn clean package` и запустить `mvn spring-boot:run`.
2. Для загрузки аватаров требуется доступ к файловому/CDN-хранилищу, указанному в настройках приложения.
