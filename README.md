# TaskFlow – Task Management System

A full-stack task management application built with **FastAPI**, **MongoDB**, and **Vanilla JavaScript**.

This project includes:
- JWT Authentication
- Role-Based Access Control
- Task CRUD Operations
- API Validation
- Swagger Documentation

---

# Features

## Authentication
- User Registration
- User Login
- JWT Authentication
- Password Hashing using bcrypt

## Role-Based Access
- User Role
- Admin Role

## Task Management
- Create Task
- View Tasks
- Update Task
- Delete Task

## Security & Validation
- Protected APIs using JWT
- Input validation with Pydantic
- Error handling
- Secure password storage

## API Documentation
- Swagger UI Documentation

---

# Tech Stack

| Layer | Technology |
|---|---|
| Backend | FastAPI |
| Database | MongoDB |
| Frontend | HTML, CSS, JavaScript |
| Authentication | JWT |
| Password Hashing | bcrypt |
| API Docs | Swagger |

---

# Project Structure

```txt
taskflow/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── db/
│   │   ├── schemas/
│   │   └── controllers/
│   ├── main.py
│   └── requirements.txt
│
├── frontend/
│   ├── index.html
│   ├── register.html
│   ├── dashboard.html
│   ├── css/
│   └── js/
│
├── .env
└── README.md
```

---

# API Endpoints

## Authentication

| Method | Endpoint |
|---|---|
| POST | `/api/v1/auth/register` |
| POST | `/api/v1/auth/login` |

---

## Tasks

| Method | Endpoint |
|---|---|
| GET | `/api/v1/tasks` |
| POST | `/api/v1/tasks` |
| PUT | `/api/v1/tasks/{id}` |
| DELETE | `/api/v1/tasks/{id}` |

---

## Users (Admin Only)

| Method | Endpoint |
|---|---|
| GET | `/api/v1/users` |
| PATCH | `/api/v1/users/{id}/role` |
| DELETE | `/api/v1/users/{id}` |

---

# Database Schema

## Users Collection

```json
{
  "name": "John",
  "email": "john@example.com",
  "password_hash": "hashed_password",
  "role": "user"
}
```

## Tasks Collection

```json
{
  "title": "Complete Assignment",
  "description": "Backend internship task",
  "priority": "high",
  "status": "todo",
  "owner_id": "user_id"
}
```

---

# Setup Instructions

## 1. Clone Repository

```bash
git clone https://github.com/yourusername/taskflow.git
cd taskflow
```

---

## 2. Create `.env`

```env
MONGODB_URL=mongodb://localhost:27017/taskflow
JWT_SECRET=your_secret_key
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

---

## 3. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

---

## 4. Run Backend

```bash
uvicorn main:app --reload
```

Backend runs on:

```txt
http://localhost:8000
```

---

## 5. Run Frontend

```bash
cd frontend
python -m http.server 5500
```

Frontend runs on:

```txt
http://localhost:5500
```

---

# Swagger Documentation

Open:

```txt
http://localhost:8000/docs
```

---

# Authentication Flow

1. User registers or logs in
2. Backend returns JWT token
3. Frontend stores token in localStorage
4. Protected APIs require Bearer token

Example:

```txt
Authorization: Bearer your_token
```

---

# Role-Based Access

## User
- Manage own tasks

## Admin
- Manage all tasks
- View all users
- Change user roles

---

# Scalability Notes

- Modular backend structure
- API versioning using `/api/v1`
- JWT stateless authentication
- MongoDB indexing support
- Can be scaled using Redis, Docker, and Load Balancers

---

# Future Improvements

- Redis caching
- Docker deployment
- Email notifications
- Task reminders
- Pagination & search

---
