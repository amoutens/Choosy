# Choosy

**Choosy** — вебзастосунок для спільного вибору фільмів у реальному часі. Кілька людей заходять в одну кімнату, свайпають фільми, а система знаходить варіанти, які сподобались усім.

---

## Як це працює

1. Хост створює кімнату та отримує код
2. Друзі приєднуються за кодом
3. Хост задає фільтри (жанр, рейтинг, рік, тип) та запускає голосування
4. Кожен учасник свайпає фільми — лайк або дизлайк
5. Алгоритм ранжує фільми за вподобаннями групи та показує спільні результати

---

## Стек

| Шар                | Технології                                       |
| ------------------ | ------------------------------------------------ |
| **Frontend**       | React 19, TypeScript, Vite, Tailwind CSS v4, MUI |
| **Backend**        | NestJS 11, TypeORM, Socket.IO                    |
| **База даних**     | PostgreSQL                                       |
| **Автентифікація** | JWT (Passport.js)                                |
| **API фільмів**    | [IMDb API](https://api.imdbapi.dev)              |
| **i18n**           | i18next (підтримка кількох мов)                  |

---

## Структура проєкту

```
Choosy/
├── backend/          # NestJS API
│   └── src/
│       ├── auth/     # JWT-автентифікація
│       ├── users/    # Профілі користувачів
│       ├── rooms/    # Логіка кімнат, голосування, WebSocket
│       └── movies/   # Інтеграція з IMDb API
└── vite-project/     # React SPA
    └── src/
        ├── pages/    # Home, Login, Register, Room, Swipe, Results…
        └── components/
```

---

## Локальний запуск

### Вимоги

- Node.js 20+
- PostgreSQL 15+

### Backend

```bash
cd backend
cp .env.example .env   # заповніть змінні середовища
npm install
npm run start:dev
```

Сервер запуститься на `http://localhost:4000`.

### Frontend

```bash
cd vite-project
npm install
npm run dev
```

Застосунок буде доступний на `http://localhost:5173`.

---

## Змінні середовища (backend)

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=choosy

JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d

PORT=4000
```

---

## Команди

### Backend

| Команда             | Опис                |
| ------------------- | ------------------- |
| `npm run start:dev` | Запуск з hot-reload |
| `npm run build`     | Продакшн-збірка     |
| `npm run test`      | Юніт-тести          |
| `npm run test:cov`  | Тести з покриттям   |

### Frontend

| Команда         | Опис              |
| --------------- | ----------------- |
| `npm run dev`   | Dev-сервер        |
| `npm run build` | Продакшн-збірка   |
| `npm run test`  | Юніт-тести (Jest) |
| `npm run lint`  | ESLint            |
