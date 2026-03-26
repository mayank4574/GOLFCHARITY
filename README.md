# Golf Charity Platform - Subscription & Prize Draw

A full-stack subscription-based golf platform combining performance tracking, charity fundraising, and a monthly draw-based reward engine.

## 🚀 Live Demo

- **Frontend**: [Deployed on Vercel]
- **Backend API**: [Deployed on Render]
- **Admin Panel**: `/admin`

## 🔑 Test Credentials

| Role  | Email | Password |
|-------|-------|----------|
| Admin | `admin@golfcharity.com` | `Admin@123456` |
| User  | `test@golfcharity.com`  | `Test@123456`  |

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, TailwindCSS |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas |
| Auth | JWT (JSON Web Tokens) |
| Payments | Stripe + UPI + QR Code |

## ✨ Features

- **Monthly Prize Draws** — 5-number Stableford matching (3/4/5 match = prizes)
- **Multi-method Payments** — Card (Stripe), UPI ID, QR Code scan
- **Charity Selection** — 10% of each subscription goes to user's chosen charity
- **Live Countdown Timer** — Counts down to monthly draw
- **Admin Dashboard** — Manage users, draws, winners, charities, reports
- **Auto-seeding** — DB seeds itself on first run with admin + test user

## 🛠️ Local Development

### Backend
```bash
cd Server
npm install
cp .env.example .env   # Fill in your values
npm run dev            # Starts on port 5000
```

### Frontend
```bash
cd Forntend
npm install
npm run dev            # Starts on port 5173
```

## ⚙️ Environment Variables (Backend)

```
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_secret
STRIPE_SECRET_KEY=sk_test_...
FRONTEND_URL=http://localhost:5173
PORT=5000
```

## 📁 Project Structure

```
├── Forntend/              # React + Vite frontend
│   ├── src/
│   │   ├── Component/     # All UI components
│   │   ├── api/api.js     # Axios API client
│   │   ├── context/       # Auth context
│   │   └── App.jsx        # Routes
│   └── vercel.json        # Vercel SPA config
│
└── Server/                # Node.js + Express backend
    ├── models/            # Mongoose schemas
    ├── routes/            # API route handlers
    ├── middleware/        # Auth middleware
    ├── index.js           # Server entry + auto-seed
    └── db.js              # MongoDB connection
```

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/charities` | List charities (search/filter) |
| GET | `/api/draws/current` | Current draw info |
| POST | `/api/subscriptions/create-checkout` | Stripe checkout |
| POST | `/api/subscriptions/upi-request` | UPI payment request |
| GET | `/api/admin/users` | Admin: list users |

---

Built with ❤️ for Digital Heroes Full-Stack Trainee Selection
