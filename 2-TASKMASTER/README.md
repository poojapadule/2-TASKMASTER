# TaskMaster — Internship Project
**Pooja Padule | NexoraTech Internship**

A full-stack Task Management Web Application built with Node.js (Express) backend and vanilla HTML/CSS/JS frontend.

---

## 📁 Project Structure

```
taskmaster/
├── backend/
│   ├── config/
│   │   └── database.js       # In-memory DB with demo seed data
│   ├── middleware/
│   │   └── auth.js           # JWT authentication middleware
│   ├── routes/
│   │   ├── auth.js           # Login, Register, /me endpoints
│   │   └── tasks.js          # Full CRUD + filter/sort/search
│   ├── .env                  # Environment variables
│   ├── package.json
│   └── server.js             # Express app entry point
│
└── frontend/
    ├── css/
    │   ├── auth.css          # Login/Register styles
    │   └── dashboard.css     # Dashboard styles
    ├── js/
    │   ├── config.js         # API base URL + fetch helper
    │   ├── auth.js           # Login/Register logic
    │   └── dashboard.js      # Full dashboard + CRUD logic
    ├── index.html            # Login / Register page
    └── dashboard.html        # Main dashboard
```

---

## 🚀 Getting Started

### Step 1 — Start the Backend

```bash
cd backend
npm install
npm run dev    # uses nodemon for auto-reload
```

Server starts at → `http://localhost:5000`

### Step 2 — Open the Frontend

Open `frontend/index.html` directly in your browser, OR use Live Server (VS Code extension).

> ⚠️ If using Live Server, make sure `CONFIG.API_BASE` in `frontend/js/config.js` matches your backend URL.

---

## 🔐 Demo Login

```
Email:    pooja@taskmaster.com
Password: demo1234
```

---

## 🌐 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Create account |
| POST | /api/auth/login | Login |
| GET  | /api/auth/me | Get current user |

### Tasks (All require Bearer token)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | /api/tasks | List tasks (filter/sort/search via query params) |
| GET    | /api/tasks/:id | Get single task |
| POST   | /api/tasks | Create task |
| PUT    | /api/tasks/:id | Update task |
| PATCH  | /api/tasks/:id/status | Quick status update |
| DELETE | /api/tasks/:id | Delete task |
| DELETE | /api/tasks | Delete all completed tasks |

### Query Parameters (GET /api/tasks)
- `status` — filter by status (todo / in-progress / completed / cancelled)
- `priority` — filter by priority (low / medium / high / urgent)
- `search` — search in title and description
- `sortBy` — field to sort by (createdAt / title / dueDate)
- `order` — asc or desc

---

## ✅ Features Implemented

- [x] User Registration & Login with JWT
- [x] Protected routes (Auth middleware)
- [x] Create, Read, Update, Delete tasks
- [x] Quick status toggle from task card
- [x] Filter by status, priority, search
- [x] Sort by date, title
- [x] Responsive design (mobile + desktop)
- [x] Sidebar navigation with live counts
- [x] Stats bar with clickable filters
- [x] Toast notifications
- [x] Demo seed data on startup
- [x] Input validation (frontend + backend)
- [x] Password hashing with bcryptjs

---

## 🛠 Tech Stack

**Backend**
- Node.js + Express
- JWT (jsonwebtoken)
- bcryptjs (password hashing)
- express-validator
- In-memory store (no external DB needed)

**Frontend**
- Vanilla HTML / CSS / JavaScript
- Google Fonts (Syne + DM Sans)
- Responsive CSS Grid + Flexbox

---

## 🔄 Production Upgrade Path

To upgrade for production, replace the in-memory store in `backend/config/database.js` with:
- **MySQL** using `mysql2` package
- **MongoDB** using `mongoose`

The routes stay the same — only the data layer changes.

---

*Built for NexoraTech Internship Program*
