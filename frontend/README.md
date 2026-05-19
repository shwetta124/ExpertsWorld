# ExpertsWorld 🌐

> A full-stack Expert Consultation Marketplace where users connect with verified experts for paid real-time consultations via video, audio, chat, and screen sharing.

![ExpertsWorld](https://img.shields.io/badge/ExpertsWorld-Live%20Platform-1A56DB?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.2-61DAFB?style=flat&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-22-339933?style=flat&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat&logo=mongodb)
![Socket.io](https://img.shields.io/badge/Socket.io-4.7-010101?style=flat&logo=socket.io)
![Razorpay](https://img.shields.io/badge/Razorpay-Payment-02042B?style=flat&logo=razorpay)

---

## 🌐 Live Demo

| | Link |
|--|------|
| 🖥️ Frontend | https://expertsworld.vercel.app |
| ⚙️ Backend API | https://expertsworld-api.onrender.com |
| 📡 Health Check | https://expertsworld-api.onrender.com/api/health |
| 💻 GitHub | https://github.com/YOUR_USERNAME/expertsworld |

> ⚠️ Note: Replace the above links with your actual deployment URLs after deploying to Vercel and Render.

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Live Demo](#-live-demo)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Test Credentials](#-test-login-credentials)
- [Environment Variables](#-environment-variables)
- [API Endpoints](#-api-endpoints)
- [Socket.io Events](#-socketio-events)
- [Payment Testing](#-razorpay-test-cards)
- [Deployment](#-deployment)
- [Screenshots](#-screenshots)
- [Author](#-author)

---

## 🎯 Overview

ExpertsWorld is a real-time expert consultation platform that allows:

- **Users** to search, find, and book verified experts for paid sessions
- **Experts** to manage session requests, track earnings, and set availability
- **Admins** to approve expert applications, monitor sessions, and manage users

The platform supports real-time notifications via Socket.io, secure payments via Razorpay, and Google OAuth for seamless authentication.

---

## ✨ Features

### 👤 User Features
- Register and Login with Email or Google OAuth
- AI-powered expert search with filters (category, price, rating, online status)
- View detailed expert profiles with reviews, tags, and session types
- Pay for sessions via Razorpay with escrow-protection
- Real-time session request and response notifications
- Session history with ratings and receipt download
- In-app wallet balance display
- Forgot password with 6-digit OTP via email
- Email verification after registration

### 🧑‍💼 Expert Features
- Expert dashboard with earnings, session stats, and rating overview
- Real-time incoming request notifications via Socket.io
- Accept or Reject session requests with instant user notification
- Online / Offline availability toggle with socket broadcast
- Session history and weekly earnings breakdown
- Apply to become an expert with document upload
- Profile management with bio, location, and payment details

### 🔐 Admin Features
- Admin panel with platform-wide statistics
- Manual expert approval and rejection workflow
- View and manage all experts with suspend option
- View all registered users with ban option
- Session monitoring and category breakdown charts
- Pending approvals with real-time badge count
- Activity feed showing recent platform events

### ⚡ Real-Time Features (Socket.io)
- Live session request notifications for experts
- Instant accept/reject notifications for users
- Expert online/offline status updates across all clients
- Session completion notifications with rating prompt
- In-app notification center with unread count badge
- Socket connection status indicator on expert dashboard

---

## 🚀 Tech Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 18.2 | UI framework |
| Vite | 5.1 | Build tool |
| React Router | v6 | Client-side routing |
| Lucide React | 0.344 | Icon library |
| React Hot Toast | 2.4 | Toast notifications |
| Socket.io Client | 4.7 | Real-time communication |
| Axios | 1.6 | HTTP requests |
| @react-oauth/google | Latest | Google OAuth |

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| Node.js | 22 | Runtime |
| Express | 4.18 | REST API server |
| MongoDB + Mongoose | 8.2 | Database |
| Socket.io | 4.7 | Real-time events |
| JSON Web Token | 9.0 | Authentication |
| bcryptjs | 2.4 | Password hashing |
| Razorpay | 2.9 | Payment processing |
| Nodemailer | 6.9 | Email (OTP, verification) |
| Multer | 1.4 | File uploads |
| crypto | Built-in | Payment signature verification |

### Infrastructure
| Service | Purpose |
|---------|---------|
| MongoDB Atlas | Cloud database (free tier) |
| Vercel | Frontend deployment |
| Render | Backend deployment |
| Google Cloud Console | OAuth 2.0 credentials |

---

## 📁 Project Structure

```
Expert-User MarketplaceProject/
│
├── README.md                          ← You are here
│
├── frontend/                          # React + Vite frontend
│   ├── public/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx        # Home with hero, search, features
│   │   │   ├── LoginPage.jsx          # Email + Google login
│   │   │   ├── SignupPage.jsx         # Registration with password strength
│   │   │   ├── ForgotPasswordPage.jsx # 6-digit OTP password reset
│   │   │   ├── DashboardPage.jsx      # Expert listing with filters + search
│   │   │   ├── ExpertDetailPage.jsx   # Expert profile + Razorpay payment
│   │   │   ├── ExpertDashboardPage.jsx# Expert: requests + earnings + toggle
│   │   │   ├── AdminPanelPage.jsx     # Admin: stats + approvals + tables
│   │   │   ├── BecomeExpertPage.jsx   # Multi-step expert application
│   │   │   ├── SessionHistoryPage.jsx # User session history with filters
│   │   │   └── ProfilePage.jsx        # Profile settings + wallet
│   │   │
│   │   ├── components/
│   │   │   ├── shared/
│   │   │   │   └── Navbar.jsx         # Sticky nav + notification bell
│   │   │   ├── expert/
│   │   │   │   └── ExpertCard.jsx     # Expert listing card component
│   │   │   └── payment/
│   │   │       └── PaymentModal.jsx   # Razorpay 3-step payment flow
│   │   │
│   │   ├── context/
│   │   │   ├── AuthContext.jsx        # Auth state + login/signup/Google
│   │   │   └── SocketContext.jsx      # Socket.io + notification state
│   │   │
│   │   ├── hooks/
│   │   │   └── useSocket.js           # Socket connection custom hook
│   │   │
│   │   ├── services/
│   │   │   └── api.js                 # Axios instance + all API methods
│   │   │
│   │   ├── data/
│   │   │   └── mockData.js            # Category data + color maps
│   │   │
│   │   ├── styles/
│   │   │   └── global.css             # CSS variables + dark mode support
│   │   │
│   │   ├── App.jsx                    # Router + protected routes
│   │   └── main.jsx                   # Entry + GoogleOAuthProvider
│   │
│   ├── .env                           # Frontend environment variables
│   ├── .gitignore
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── backend/                           # Node.js + Express backend
│   ├── config/
│   │   └── db.js                      # MongoDB Atlas connection
│   │
│   ├── controllers/
│   │   ├── authController.js          # Register, login, OTP, Google OAuth
│   │   ├── expertController.js        # List, apply, approve, reviews, admin
│   │   └── sessionController.js       # Razorpay orders, verify, sessions
│   │
│   ├── middleware/
│   │   ├── auth.js                    # JWT protect + role-based authorize
│   │   └── errorHandler.js            # Central error handling middleware
│   │
│   ├── models/
│   │   ├── User.js                    # User schema + bcrypt pre-save hook
│   │   ├── Expert.js                  # Expert schema + calcRating method
│   │   └── Session.js                 # Session + payment tracking schema
│   │
│   ├── routes/
│   │   ├── authRoutes.js              # /api/auth/* routes
│   │   ├── expertRoutes.js            # /api/experts/* routes
│   │   └── sessionRoutes.js           # /api/sessions/* + /api/payments/*
│   │
│   ├── utils/
│   │   └── email.js                   # OTP email, verification, approval
│   │
│   ├── seedData.js                    # Database seeder (run once)
│   ├── server.js                      # Main server + Socket.io setup
│   ├── .env                           # Backend environment variables
│   ├── .gitignore
│   └── package.json
```

---

## 🛠️ Getting Started

### Prerequisites

- Node.js v18 or higher (v22 recommended)
- MongoDB Atlas account (free tier available)
- Razorpay account (test mode — free)
- Google Cloud Console account (for OAuth)
- Gmail account (for email OTP)

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/expertsworld.git
cd expertsworld
```

### 2. Setup Backend

```bash
cd backend
npm install
```

Create your `.env` file (see Environment Variables section below) then:

```bash
npm run dev
```

Backend runs on → `http://localhost:4000`

### 3. Seed the Database

Run this once to create sample experts and test accounts:

```bash
cd backend
node seedData.js
```

Output:
```
✅ MongoDB Connected
✅ Created 8 users
✅ Created 6 experts
👤 User:   user@test.com     / Test@1234
🧑‍💼 Expert: arjun@test.com   / Test@1234
🔐 Admin:  admin@expertsworld.com / Admin@1234
```

### 4. Setup Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env`:
```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
```

Then run:
```bash
npm run dev
```

Frontend runs on → `http://localhost:5173`

### 5. Open in Browser

```
http://localhost:5173
```

---

## 🔐 Test Login Credentials

| Role | Email | Password | Dashboard |
|------|-------|----------|-----------|
| 👤 User | `user@test.com` | `Test@1234` | `/dashboard` |
| 🧑‍💼 Expert | `arjun@test.com` | `Test@1234` | `/expert-dashboard` |
| 🔐 Admin | `admin@expertsworld.com` | `Admin@1234` | `/admin` |

---

## ⚙️ Environment Variables

### `backend/.env`

```env
# ── Server ──────────────────────────────────
PORT=4000
NODE_ENV=development

# ── MongoDB Atlas ────────────────────────────
# Get from: https://cloud.mongodb.com
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/expertsworld

# ── JWT ─────────────────────────────────────
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=7d

# ── Email (Gmail + App Password) ─────────────
# Get App Password from: myaccount.google.com/apppasswords
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_16_char_app_password
EMAIL_FROM=ExpertsWorld <your_email@gmail.com>

# ── Razorpay (Test Mode) ─────────────────────
# Get from: https://dashboard.razorpay.com
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx

# ── Google OAuth ─────────────────────────────
# Get from: https://console.cloud.google.com
GOOGLE_CLIENT_ID=xxxxxxxxxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxx

# ── Frontend URL ─────────────────────────────
CLIENT_URL=http://localhost:5173
# Production: CLIENT_URL=https://expertsworld.vercel.app
```

### `frontend/.env`

```env
# Google OAuth Client ID (same as backend)
VITE_GOOGLE_CLIENT_ID=xxxxxxxxxxxx.apps.googleusercontent.com
```

---

## 📡 API Endpoints

### Auth Routes — `/api/auth`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Register new user | ❌ |
| POST | `/login` | Login with email + password | ❌ |
| POST | `/google` | Google OAuth login | ❌ |
| GET | `/me` | Get current logged-in user | ✅ |
| POST | `/forgot-password` | Send 6-digit OTP to email | ❌ |
| POST | `/verify-otp` | Verify OTP code | ❌ |
| POST | `/reset-password` | Reset password with OTP | ❌ |
| GET | `/verify-email` | Verify email via token | ❌ |
| PUT | `/update-profile` | Update name, bio, location | ✅ |
| PUT | `/change-password` | Change current password | ✅ |

### Expert Routes — `/api/experts`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | List all approved experts | ❌ |
| GET | `/:id` | Get expert by MongoDB ID | ❌ |
| POST | `/apply` | Apply to become an expert | ✅ User |
| POST | `/:id/reviews` | Add review to expert | ✅ User |
| PUT | `/availability` | Set online / offline status | ✅ Expert |
| GET | `/dashboard/me` | Get expert dashboard data | ✅ Expert |
| GET | `/admin/stats` | Get platform statistics | ✅ Admin |
| GET | `/admin/pending` | Get pending applications | ✅ Admin |
| PATCH | `/admin/:id/approve` | Approve expert application | ✅ Admin |
| PATCH | `/admin/:id/reject` | Reject expert application | ✅ Admin |

### Payment & Session Routes — `/api`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/payments/create-order` | Create Razorpay order | ✅ User |
| POST | `/payments/verify` | Verify payment + create session | ✅ User |
| GET | `/sessions/my` | Get user's session history | ✅ User |
| GET | `/sessions/expert-requests` | Get expert's incoming requests | ✅ Expert |
| PATCH | `/sessions/:id/respond` | Accept or reject a request | ✅ Expert |
| PATCH | `/sessions/:id/complete` | Mark session as completed | ✅ |
| POST | `/sessions/:id/rate` | Rate a completed session | ✅ User |

---

## ⚡ Socket.io Events

### Client → Server (emit)

| Event | Payload | Description |
|-------|---------|-------------|
| `join_user` | `userId` | Register user socket room |
| `join_expert` | `expertId` | Register expert socket room |
| `set_availability` | `{ expertId, online }` | Broadcast availability change |
| `respond_request` | `{ sessionId, userId, action, expertName }` | Notify user of response |
| `send_message` | `{ sessionId, senderId, text, timestamp }` | Send chat message |
| `join_session` | `sessionId` | Join session chat room |

### Server → Client (on)

| Event | Payload | Description |
|-------|---------|-------------|
| `new_request` | Request object | New session request for expert |
| `request_response` | `{ sessionId, action, message }` | Expert's accept/reject to user |
| `expert_online` | `{ expertId, online }` | Expert status update |
| `receive_message` | `{ text, senderName, timestamp }` | Chat message received |
| `session_completed` | `{ sessionId, message }` | Session ended — prompt rating |
| `pending_requests` | Array of requests | Queued requests on reconnect |

---

## 💳 Razorpay Test Cards

Use these in test mode — no real money is charged.

| Card Number | Expiry | CVV | OTP |
|------------|--------|-----|-----|
| `4111 1111 1111 1111` | Any future date | Any 3 digits | `1234` |
| `5267 3181 8797 5449` | Any future date | Any 3 digits | `1234` |
| `4000 0000 0000 0002` | Any future date | Any 3 digits | `1234` |

> ℹ️ When Razorpay popup opens → enter card number → any future expiry → any CVV → OTP: 1234

---

## ☁️ Deployment

### Frontend → Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Build and deploy
cd frontend
npm run build
vercel
```

Add `frontend/vercel.json` for SPA routing:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

After deploying update `frontend/src/services/api.js`:
```js
baseURL: 'https://expertsworld-api.onrender.com/api'
```

Add environment variable in Vercel dashboard:
```
VITE_GOOGLE_CLIENT_ID = your_google_client_id
```

---

### Backend → Render

1. Go to **https://render.com** → Sign up free
2. Click **New Web Service**
3. Connect your GitHub repository
4. Settings:
   - Root directory: `backend`
   - Build command: `npm install`
   - Start command: `npm start`
5. Add all backend `.env` variables in the **Environment** tab
6. Click **Deploy**

Update backend `.env` for production:
```env
NODE_ENV=production
CLIENT_URL=https://expertsworld.vercel.app
```

---

### After Deployment — Update Google OAuth

Go to **https://console.cloud.google.com** → Credentials → Edit OAuth Client

Add to **Authorized JavaScript origins**:
```
https://expertsworld.vercel.app
```

Add to **Authorized redirect URIs**:
```
https://expertsworld.vercel.app
https://expertsworld.vercel.app/dashboard
```

---

### After Deployment — Update MongoDB Atlas

Go to **https://cloud.mongodb.com** → Network Access

Make sure `0.0.0.0/0` is added so Render backend can connect.

---

## 🚀 Deployment Links

| Service | URL |
|---------|-----|
| 🖥️ Frontend (Vercel) | https://expertsworld.vercel.app |
| ⚙️ Backend (Render) | https://expertsworld-api.onrender.com |
| 📦 GitHub Repository | https://github.com/YOUR_USERNAME/expertsworld |
| 🗄️ Database | MongoDB Atlas (Cloud hosted) |

> ⚠️ Replace above URLs with your actual deployment URLs after deploying.

---

## 📱 All Pages & Routes

| Route | Page | Access Level |
|-------|------|-------------|
| `/` | Landing page with hero + search | Public |
| `/login` | Email and Google login | Public |
| `/signup` | Registration with password strength | Public |
| `/forgot-password` | OTP-based password reset | Public |
| `/dashboard` | Expert listing with filters | User |
| `/expert/:id` | Expert profile + payment | User |
| `/expert-dashboard` | Expert requests + earnings | Expert only |
| `/admin` | Admin panel + approvals | Admin only |
| `/become-expert` | Multi-step expert application | User |
| `/history` | Session history with receipts | User |
| `/profile` | Profile settings + wallet | User |

---

## 📸 Screenshots

### 🏠 Landing Page
> Hero section with AI search, stats, how it works, featured experts

### 📊 User Dashboard
> Expert cards with filters, category pills, online toggle, sort options

### 👤 Expert Detail Page
> Full profile, tags, session types, reviews, sticky payment card

### 💳 Payment Flow
> Razorpay integration with topic input, trust badges, processing, success

### 🧑‍💼 Expert Dashboard
> Real-time requests, accept/decline, earnings stats, session history

### 🔐 Admin Panel
> Stats overview, pending approvals, expert table, user management

> 📷 Add actual screenshots here after deployment by uploading images to your GitHub repo and linking them.

---

## 🧪 Local Development Commands

```bash
# Start backend (Terminal 1)
cd backend
npm run dev

# Start frontend (Terminal 2)
cd frontend
npm run dev

# Seed database (run once)
cd backend
node seedData.js

# Test backend health
curl http://localhost:4000/api/health

# Test experts API
curl http://localhost:4000/api/experts
```

---

## 🔧 Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| `SSL error` on MongoDB | Add `0.0.0.0/0` to Atlas Network Access |
| `next is not a function` | Remove `next` param from async pre-save hook |
| `Invalid hook call` | Delete `node_modules` and run `npm install` |
| `Blank page after login` | Check `setLoading(false)` is in `useEffect` |
| `Expert ID not found` | Ensure using `_id` from MongoDB not mock `id: 1` |
| `npm run dev` not found | Add `"dev": "vite"` to `package.json` scripts |
| `ECONNRESET` on npm install | Switch to mobile hotspot and retry |
| `Google login failed` | Check `VITE_GOOGLE_CLIENT_ID` in `.env` + restart Vite |

---

## 👩‍💻 Author

**Shwetta Shindde**

- 🎓 BSc Blockchain — SYBS (Second Year)
- 🏫 Savitribai Phule Pune University
- 🏢 Department of Technology


---

## 📄 License

This project is developed for academic purposes as part of the BSc Blockchain program at Savitribai Phule Pune University. All rights reserved.

---

## 🙏 Acknowledgments

- **Razorpay** — Payment gateway for India
- **MongoDB Atlas** — Free cloud database
- **Socket.io** — Real-time bidirectional communication
- **Google Cloud** — OAuth 2.0 authentication
- **Vercel** — Frontend hosting and deployment
- **Render** — Backend hosting and deployment
- **Lucide React** — Beautiful open-source icons

---

