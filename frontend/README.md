# ExpertsWorld 🌐

> A full-stack Expert Consultation Marketplace where users connect with verified experts for paid real-time consultations via video, audio, and chat.

![ExpertsWorld](https://img.shields.io/badge/ExpertsWorld-Live%20Platform-1A56DB?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.2-61DAFB?style=flat&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-22-339933?style=flat&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat&logo=mongodb)
![Socket.io](https://img.shields.io/badge/Socket.io-4.7-010101?style=flat&logo=socket.io)
![Razorpay](https://img.shields.io/badge/Razorpay-Payments-02042B?style=flat)
![Firebase](https://img.shields.io/badge/Firebase-FCM-FFCA28?style=flat&logo=firebase)

---

## 🌐 Live Demo

| | Link |
|--|------|
| 🖥️ Frontend | https://expertsworld.vercel.app |
| ⚙️ Backend API | https://expertsworld-api.onrender.com |
| 📡 Health Check | https://expertsworld-api.onrender.com/api/health |
| 💻 GitHub | https://github.com/shwetta124/ExpertsWorld |

> ⚠️ Replace links with your actual deployment URLs after deploying.

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Test Credentials](#-test-login-credentials)
- [Environment Variables](#-environment-variables)
- [API Endpoints](#-api-endpoints)
- [Socket.io Events](#-socketio-events)
- [Deployment](#-deployment)
- [Author](#-author)

---

## 🎯 Overview

ExpertsWorld is a real-time expert consultation platform that allows:

- **Users** to search, find, and book verified experts for paid sessions
- **Experts** to manage session requests, track earnings, and set availability
- **Admins** to approve expert applications, monitor sessions, and manage users

The platform supports real-time notifications via Socket.io, secure payments via Razorpay, video/audio calls via Agora, push notifications via Firebase, and Google OAuth authentication.

---

## ✨ Features

### 👤 User Features
- Register and Login with Email or Google OAuth
- AI-powered expert search with filters (category, price, rating, online status)
- View detailed expert profiles with reviews, tags, and session types
- Pay for sessions via Razorpay (escrow-protected)
- Real-time session request and response notifications
- In-session chat with message history stored in MongoDB
- Video and audio calls via Agora SDK
- Session booking with date and time picker
- Session history with ratings, receipts, and chat history
- Profile management with photo upload
- Dark mode toggle
- Firebase push notifications
- In-app wallet balance display
- Forgot password with 6-digit OTP via email

### 🧑‍💼 Expert Features
- Expert dashboard with earnings, session stats, and rating overview
- Real-time incoming request notifications via Socket.io
- Accept or Reject session requests with instant user notification
- Online / Offline availability toggle
- Session history and weekly earnings breakdown
- Apply to become an expert with multi-step form

### 🔐 Admin Features
- Admin panel with platform-wide statistics
- Manual expert approval and rejection workflow
- View and manage all experts and users
- Session monitoring and category breakdown
- Pending approvals with real-time badge count

### ⚡ Real-Time Features
- Live session request notifications
- Instant accept/reject notifications
- Expert online/offline status updates
- Session completion notifications with rating prompt
- In-app notification center with unread count badge
- Real-time chat with typing indicators

---

## 🚀 Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| React 18 + Vite | UI framework |
| React Router v6 | Client-side routing |
| Socket.io Client | Real-time communication |
| Agora RTC SDK | Video/audio calls |
| Firebase SDK | Push notifications |
| Axios | HTTP requests |
| Lucide React | Icons |
| React Hot Toast | Notifications |
| @react-oauth/google | Google OAuth |

### Backend
| Technology | Purpose |
|-----------|---------|
| Node.js + Express | REST API server |
| MongoDB + Mongoose | Database |
| Socket.io | Real-time events |
| JWT + bcryptjs | Authentication |
| Razorpay | Payment processing |
| Nodemailer | Email (OTP) |
| agora-token | Video call tokens |

### Infrastructure
| Service | Purpose |
|---------|---------|
| MongoDB Atlas | Cloud database |
| Vercel | Frontend hosting |
| Render | Backend hosting |
| Firebase | Push notifications |
| Google Cloud | OAuth 2.0 |
| Agora | Video/audio calls |

---

## 📁 Project Structure

```
Expert-User MarketplaceProject/
│
├── README.md
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── SignupPage.jsx
│   │   │   ├── ForgotPasswordPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── ExpertDetailPage.jsx
│   │   │   ├── ExpertDashboardPage.jsx
│   │   │   ├── AdminPanelPage.jsx
│   │   │   ├── BecomeExpertPage.jsx
│   │   │   ├── SessionHistoryPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   ├── ChatPage.jsx
│   │   │   ├── VideoCallPage.jsx
│   │   │   └── BookingPage.jsx
│   │   ├── components/
│   │   │   ├── shared/Navbar.jsx
│   │   │   ├── expert/ExpertCard.jsx
│   │   │   └── payment/PaymentModal.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   ├── SocketContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── hooks/
│   │   │   ├── useSocket.js
│   │   │   └── useFirebaseNotifications.js
│   │   ├── services/api.js
│   │   ├── utils/firebase.js
│   │   └── App.jsx
│   ├── public/firebase-messaging-sw.js
│   └── .env
│
└── backend/
    ├── config/db.js
    ├── controllers/
    │   ├── authController.js
    │   ├── expertController.js
    │   └── sessionController.js
    ├── middleware/
    │   ├── auth.js
    │   └── errorHandler.js
    ├── models/
    │   ├── User.js
    │   ├── Expert.js
    │   ├── Session.js
    │   └── Message.js
    ├── routes/
    │   ├── authRoutes.js
    │   ├── expertRoutes.js
    │   └── sessionRoutes.js
    ├── seedData.js
    ├── server.js
    └── .env
```

---

## 🛠️ Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (free)
- Razorpay account (test mode)
- Google Cloud Console (OAuth)
- Agora account (Testing Mode project)
- Firebase project

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/expertsworld.git
cd expertsworld
```

### 2. Setup Backend
```bash
cd backend
npm install
# Create .env file (see Environment Variables)
npm run dev
```

### 3. Seed Database
```bash
node seedData.js
```

### 4. Setup Frontend
```bash
cd frontend
npm install
# Create .env file (see Environment Variables)
npm run dev
```

---

## 🔐 Test Login Credentials

| Role | Email | Password |
|------|-------|----------|
| 👤 User | `user@test.com` | `Test@1234` |
| 🧑‍💼 Expert | `arjun@test.com` | `Test@1234` |
| 🔐 Admin | `admin@expertsworld.com` | `Admin@1234` |

---

## ⚙️ Environment Variables

### `backend/.env`
```env
PORT=4000
NODE_ENV=development
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/expertsworld
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=ExpertsWorld <your@gmail.com>
RAZORPAY_KEY_ID=rzp_test_xxxx
RAZORPAY_KEY_SECRET=xxxx
GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxx
AGORA_APP_ID=your_agora_app_id
AGORA_APP_CERTIFICATE=your_agora_certificate
CLIENT_URL=http://localhost:5173
```

### `frontend/.env`
```env
VITE_GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
VITE_AGORA_APP_ID=your_agora_app_id
VITE_FIREBASE_API_KEY=xxxx
VITE_FIREBASE_AUTH_DOMAIN=xxxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=xxxx
VITE_FIREBASE_STORAGE_BUCKET=xxxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=xxxx
VITE_FIREBASE_APP_ID=xxxx
VITE_FIREBASE_VAPID_KEY=xxxx
```

---

## 📡 API Endpoints

### Auth — `/api/auth`
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register new user |
| POST | `/login` | Email + password login |
| POST | `/google` | Google OAuth login |
| GET | `/me` | Get current user |
| POST | `/forgot-password` | Send OTP |
| POST | `/verify-otp` | Verify OTP |
| POST | `/reset-password` | Reset password |
| PUT | `/update-profile` | Update profile |
| POST | `/save-fcm-token` | Save Firebase token |

### Experts — `/api/experts`
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List all experts |
| GET | `/:id` | Get expert by ID |
| POST | `/apply` | Apply to become expert |
| POST | `/:id/reviews` | Add review |
| PUT | `/availability` | Set online/offline |
| GET | `/dashboard/me` | Expert dashboard data |
| GET | `/admin/stats` | Platform stats (Admin) |
| GET | `/admin/pending` | Pending approvals (Admin) |
| PATCH | `/admin/:id/approve` | Approve expert (Admin) |
| PATCH | `/admin/:id/reject` | Reject expert (Admin) |

### Sessions & Payments — `/api`
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/payments/create-order` | Create Razorpay order |
| POST | `/payments/verify` | Verify payment |
| GET | `/sessions/my` | User's sessions |
| GET | `/sessions/expert-requests` | Expert's requests |
| PATCH | `/sessions/:id/respond` | Accept/reject request |
| PATCH | `/sessions/:id/complete` | Complete session |
| POST | `/sessions/:id/rate` | Rate session |
| GET | `/sessions/:id/messages` | Get chat messages |
| GET | `/agora/token` | Get Agora video token |

---

## ⚡ Socket.io Events

### Client → Server
| Event | Description |
|-------|-------------|
| `join_user` | Register user room |
| `join_expert` | Register expert room |
| `join_session` | Join chat room |
| `send_message` | Send chat message |
| `user_typing` | Typing indicator |
| `set_availability` | Toggle online/offline |
| `respond_request` | Accept/reject request |

### Server → Client
| Event | Description |
|-------|-------------|
| `new_request` | New session request |
| `request_response` | Expert response |
| `receive_message` | Chat message |
| `user_typing` | Typing indicator |
| `expert_online` | Status update |
| `session_completed` | Session ended |

---

## 💳 Razorpay Test Cards

| Card Number | Expiry | CVV | OTP |
|------------|--------|-----|-----|
| `4111 1111 1111 1111` | Any future | Any 3 digits | `1234` |

---

## ☁️ Deployment

### Frontend → Vercel
```bash
cd frontend
npm run build
npm install -g vercel
vercel
```

Add `frontend/vercel.json`:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }]
}
```

### Backend → Render
1. Go to https://render.com → New Web Service
2. Connect GitHub repo
3. Root directory: `backend`
4. Build command: `npm install`
5. Start command: `npm start`
6. Add all `.env` variables

### After Deployment — Update these
1. Update `frontend/src/services/api.js` baseURL to Render URL
2. Update `backend/.env` CLIENT_URL to Vercel URL
3. Add Vercel URL to Google OAuth console
4. Add `0.0.0.0/0` to MongoDB Atlas Network Access

---

## 🚀 Deployment Links

| Service | URL |
|---------|-----|
| 🖥️ Frontend | https://expertsworld.vercel.app |
| ⚙️ Backend | https://expertsworld-api.onrender.com |
| 📦 GitHub | https://github.com/YOUR_USERNAME/expertsworld |

---

## 📱 All Routes

| Route | Page | Access |
|-------|------|--------|
| `/` | Landing page | Public |
| `/login` | Login | Public |
| `/signup` | Register | Public |
| `/dashboard` | Expert listing | User |
| `/expert/:id` | Expert profile | User |
| `/expert/:id/book` | Book session | User |
| `/chat/:sessionId` | Session chat | User |
| `/video/:sessionId/:channel` | Video call | User |
| `/history` | Session history | User |
| `/profile` | Profile settings | User |
| `/become-expert` | Expert application | User |
| `/expert-dashboard` | Expert panel | Expert |
| `/admin` | Admin panel | Admin |

---

## 🔧 Common Issues

| Issue | Fix |
|-------|-----|
| SSL error on MongoDB | Add `0.0.0.0/0` to Atlas Network Access |
| Blank page after login | Check `setLoading(false)` in AuthContext |
| Expert ID not found | Ensure using `_id` from MongoDB |
| Video call token error | Create new Agora project in Testing Mode |
| No camera device | Use chat instead — laptop has no camera |
| FCM token 404 | Create `backend/models/Message.js` |

---



## 🙏 Acknowledgments

- Razorpay — Payment gateway
- MongoDB Atlas — Cloud database
- Socket.io — Real-time communication
- Agora — Video/audio calls
- Firebase — Push notifications
- Google Cloud — OAuth 2.0
- Vercel + Render — Deployment

---

