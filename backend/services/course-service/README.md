# Course Service

Сервис управляет курсами и их уроками: создание, редактирование, публикация, загрузка ассетов. Все ручки расположены под `/api/courses` и требуют JWT (кроме публичных GET, см. ниже).

## Авторизация и роли
- Публичные: `GET /api/courses`, `GET /api/courses/{id}`, а также `GET /api/courses/{courseId}/lessons` (когда курс опубликован). Если курс ещё закрыт, нужен токен автора/админа.
- Приватные: операции создания/редактирования/удаления курсов и уроков доступны ролям `TEACHER` или `ADMIN` (`@PreAuthorize("hasAnyRole('TEACHER','ADMIN')")`).
- Роли читаются из JWT (`sub` — UUID пользователя, `role` — строка роли).

## Swagger и роли
- UI доступен по `http://localhost:8083/swagger`.
- Все ручки получили дополнительный тег роли, чтобы в Swagger было проще фильтровать:
  - `Role · Public` — любая ручка каталога, которая работает без авторизации.
  - `Role · Student` — запись на курсы, прогресс и прохождение тестов (любой авторизованный пользователь).
  - `Role · Teacher/Admin` — конструктор курсов, уроков и тестов (требуется роль `TEACHER` или `ADMIN`).
- Тот же набор тегов описан в `OpenApiConfig` и виден в выпадающем списке Swagger UI.

## Модель данных
- `CourseRequest`: `title` (обязательное), `description`.
- `LessonRequest`: `title` (обяз.), `content` (любая JSON-структура с телом урока), `orderIndex` (целое для сортировки).

## Эндпоинты курсов

### Получить все курсы
- **GET** `/api/courses`
- **Query params (опционально)**:
  - `query` — поиск по названию/описанию.
  - `authorId` — UUID автора.
  - `minRating` — минимальный рейтинг (>=).
  - `sort` — `rating_desc` (default) | `rating_asc` | `newest` | `oldest`.
- **Response 200**
  ```json
  [
    {
      "id": "...",
      "title": "Kotlin для новичков",
      "description": "10 уроков",
      "previewUrl": "https://cdn/.../preview.png",
      "structureUrl": "https://s3/.../structure.json",
      "lessonsUrl": "https://s3/.../lessons.json",
      "published": true,
      "rating": 4.9
    }
  ]
  ```

### Получить курс по ID
- **GET** `/api/courses/{id}`
- Возвращает `CourseResponse`.

### Получить свои курсы
- **GET** `/api/courses/my`
- Требует роль `TEACHER`/`ADMIN` + JWT.

### Создать курс (multipart)
- **POST** `/api/courses`
- **Headers**: `Authorization: Bearer …`, `Content-Type: multipart/form-data`
- **Parts**:
  - `data` — JSON `CourseRequest` (строка).
  - `structure` — JSON (опционально) с древовидной структурой (записывается как raw string).
  - `lessons` — JSON (опционально) с заготовками уроков.
  - `preview` — файл изображения (опционально).
  - `assets` — список файлов (опционально).
- **Пример cURL**
  ```bash
  curl -X POST http://localhost:8080/api/courses \
    -H "Authorization: Bearer <token>" \
    -F 'data={"title":"Git с нуля","description":"мини-курс"};type=application/json' \
    -F 'structure={"modules":[]};type=application/json' \
    -F 'preview=@cover.png'
  ```
- **Response 200** — `CourseResponse` c новыми URL ассетов.

### Обновить курс (JSON)
- **PATCH** `/api/courses/{id}` (Content-Type `application/json`)
- **Body** — `CourseRequest`.
- Только автор курса или админ. Админ может редактировать любой курс.

### Обновить курс (multipart)
- **PATCH** `/api/courses/{id}` (multipart) — формат аналогичен созданию и позволяет менять файлы/структуру.

### Загрузить структуру отдельным JSON
- **PUT** `/api/courses/{id}/structure`
- **Body** — произвольный JSON (строка) с описанием структуры.

### Загрузить уроки отдельным JSON
- **PUT** `/api/courses/{id}/lessons`
- **Body** — произвольный JSON (строка) с массивом/деревом уроков.

### Загрузить ассет
- **POST** `/api/courses/{id}/assets`
- **Parts**:
  - `file` — сам файл (обязателен).
  - `path` — строка с подпапкой внутри хранилища (опциональна).
- **Response 200**
  ```json
  { "url": "https://cdn/.../asset.png" }
  ```

### Публикация/скрытие курса
- **PATCH** `/api/courses/{id}/publish?published=true|false`
- Меняет флаг `published`.

### Удалить курс
- **DELETE** `/api/courses/{id}` — доступно автору или админу.

## Эндпоинты уроков (`/api/courses/{courseId}/lessons`)

### Получить уроки курса
- **GET** `/api/courses/{courseId}/lessons`
- Если курс опубликован — доступен всем. Если нет, `LessonService` проверяет, что запрашивающий автор/админ.
- **Response 200**
  ```json
  [
    {
      "id": "...",
      "courseId": "...",
      "title": "Введение",
      "content": {"blocks": []},
      "orderIndex": 1
    }
  ]
  ```

### Создать урок
- **POST** `/api/courses/{courseId}/lessons`
- **Body**
  ```json
  {
    "title": "Git init",
    "content": {
      "type": "doc",
      "blocks": ["text", "image"]
    },
    "orderIndex": 3
  }
  ```

### Обновить урок
- **PATCH** `/api/courses/{courseId}/lessons/{lessonId}` — тело как в создании.

### Удалить урок
- **DELETE** `/api/courses/{courseId}/lessons/{lessonId}`

## Прохождение курсов

### Записаться на курс
- **POST** `/api/courses/{courseId}/enroll`
- Требует авторизацию.
- Возвращает `EnrollmentResponse` с текущим статусом и прогрессом пользователя.

### Узнать статус записи
- **GET** `/api/courses/{courseId}/enrollment`
- 404 если пользователь ещё не записывался.

### Прогресс по урокам
- **GET** `/api/courses/{courseId}/progress`
- Возвращает количество пройденных уроков, процент прогресса, последний завершенный урок и последнюю попытку теста (если есть).

### Отметить урок пройденным
- **POST** `/api/courses/{courseId}/lessons/{lessonId}/complete`
- Пересчитывает прогресс и при необходимости завершает курс.

### Мои записи
- **GET** `/api/enrollments/my`
- Возвращает список всех курсов, на которые записан пользователь.

## Тесты и проверки знаний

### Создать/обновить тест курса
- **POST** `/api/courses/{courseId}/test`
- Только для автора курса или админа.
- Тело — `CourseTestRequest` (название, JSON с вопросами, порог прохождения).

### Получить тест с ответами (для редактирования)
- **GET** `/api/courses/{courseId}/test/manage`
- Только автор/админ.

### Получить тест для прохождения
- **GET** `/api/courses/{courseId}/test`
- Требует запись на курс. Правильные ответы из ответа удаляются.

### Отправить ответы
- **POST** `/api/courses/{courseId}/test/submit`
- Body:
  ```json
  {
    "answers": {
      "question-1": ["A"],
      "question-2": ["B","C"]
    }
  }
  ```
- Возвращает `TestAttemptResponse` с количеством правильных ответов и признаком прохождения.

### Последняя попытка
- **GET** `/api/courses/{courseId}/test/attempts/latest`
- Возвращает результат последней сдачи теста пользователя.

## Коды ответов
- `200 OK` — успешное выполнение (возвращает данные).
- `204 No Content` — для успешного удаления курсов/уроков.
- `400 Bad Request` — ошибки валидации (например, пустой `title`).
- `401/403` — неверный токен или недостаточно прав.
- `404 Not Found` — курс/урок не существует или недоступен.

## Запуск локально
1. `mvn clean package`
2. `mvn spring-boot:run`
3. Не забудьте настроить интеграции с S3/MinIO (для ассетов) и доступ к БД согласно `application.yml`.
