## Task Management 

A simple Task Mangement System

### What's included
- React + Vite frontend 
- Express backend 
- MongoDB via Docker Compose
- Swagger UI at `/api/docs`

### Prerequisites
- Node.js 18+ and npm
- Docker & Docker Compose

### Quick start (Docker)
From project root:
```bash
docker-compose up --build
```
Open:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`
- Swagger UI: `http://localhost:5000/api/docs`
- Health: `http://localhost:5000/api/health`

### Local development (without Docker)
1) Backend
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```
2) Frontend (new terminal)
```bash
cd frontend
npm install
npm run dev
```

### API docs (Swagger)
- Visit `http://localhost:5000/api/docs`

### Common API flows
- Register
```http
POST /api/auth/register
Content-Type: application/json
{
  "email": "user@example.com",
  "password": "password123"
}
```
- Login
```http
POST /api/auth/login
Content-Type: application/json
{
  "email": "user@example.com",
  "password": "password123"
}
```
Response contains `token` to use in `Authorization` header.

- Create Task (with PDFs)
Use multipart/form-data with up to 3 PDF files under field name `attachments`.
Required fields: `title`, `description`, `dueDate` (YYYY-MM-DD), `assignedTo` (user id)

### Frontend configuration
- Frontend uses `VITE_API_URL` (set in `docker-compose.yml`) or defaults to `http://localhost:5000`
- Auth is stored in `localStorage` (`token` key)

### Testing (backend)
- Jest + Supertest scaffold present; add tests under `backend/src/tests` and run:
```bash
cd backend
npm test
```

