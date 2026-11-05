# AME Website — Association of Mechanical Engineering ⚙️
> Official Monorepo for the College Mechanical Engineering Club Web Portal (Day 1 Implementation)

---

## 📌 Architecture Overview

This project is structured as a clean JavaScript monorepo (no TypeScript):

```
project AME/
├── client/                     # Frontend (React 19, Vite, Tailwind CSS v4, Framer Motion)
│   ├── src/
│   │   ├── api/axios.js        # Axios instance with JWT interceptor & auto-401 logout
│   │   ├── components/
│   │   │   ├── common/         # Button, Input, Select, GlassCard
│   │   │   ├── Navbar.jsx      # Sticky glass navbar with responsive mobile drawer & user dropdown
│   │   │   ├── ProtectedRoute.jsx # Route guard requiring student/member authentication
│   │   │   └── AdminRoute.jsx     # Route guard requiring admin privileges (403 check)
│   │   ├── context/
│   │   │   └── AuthContext.jsx # Global user auth state, login, register, logout, profile update
│   │   ├── pages/
│   │   │   ├── Home.jsx        # Member dashboard with stats & dedicated Part B announcements slot
│   │   │   ├── Login.jsx       # Email or Roll Number login with branding panel
│   │   │   ├── Register.jsx    # 2-step registration with progress bar & password strength meter
│   │   │   ├── Profile.jsx     # Student profile view and permitted fields updater
│   │   │   └── admin/
│   │   │       └── Students.jsx# Admin directory with search, filters, pagination, & CSV export
│   │   ├── App.jsx             # React router setup with route protection & dark toasts
│   │   ├── index.css           # Tailwind v4 import, mechanical grid pattern, glass styling
│   │   └── main.jsx
│   ├── .env.example
│   └── package.json
│
├── server/                     # Backend (Node.js, Express, MongoDB Atlas, Mongoose)
│   ├── config/
│   │   └── db.js               # MongoDB connection with MongoMemoryServer dev fallback
│   ├── controllers/
│   │   └── authController.js   # register, login (email/rollNo), getMe, updateProfile
│   ├── middleware/
│   │   ├── auth.js             # JWT Bearer token authentication (protect)
│   │   └── isAdmin.js          # Role check middleware (403 Forbidden for non-admins)
│   ├── models/
│   │   └── User.js             # Mongoose schema, bcrypt salt 10 pre-save hook, comparePassword
│   ├── routes/
│   │   ├── auth.js             # Auth routes with express-rate-limit & express-validator
│   │   └── admin.js            # Admin student management & native CSV export
│   ├── scripts/
│   │   └── seedAdmin.js        # Idempotent admin user seeder
│   ├── utils/
│   │   └── generateToken.js    # JWT token generator
│   ├── testAuth.js             # Automated end-to-end API test harness
│   ├── .env.example
│   └── package.json
│
├── package.json                # Root monorepo scripts runner
└── README.md
```

---

## 🎨 UI & Design Direction

- **Dark Theme:** Near-black navy (`#0a0e1a`) with glassmorphic cards (`backdrop-blur-xl`, `border-white/10`).
- **Mechanical Gradient Accent:** Orange-to-amber gradient (`#ff6b2c` → `#ffb020`).
- **Typography:** Google Fonts **"Space Grotesk"** for headings, **"Inter"** for clean body readability.
- **Engineering Aesthetics:** Subtle isometric grid patterns, rotating gear animations, and smooth transitions powered by **Framer Motion**.
- **Interactive Feedback:** Dark-styled toasts via `react-hot-toast` and loading spinners.

---

## 🚀 Getting Started

### 1. Environment Variables Configuration

#### Backend (`server/.env`)
Copy `server/.env.example` to `server/.env`:
```bash
PORT=5000
# To connect to MongoDB Atlas, paste your Atlas URI below:
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/ame_website?retryWrites=true&w=majority
# (Note: If left empty or set to 'memory', it automatically runs an in-memory database for testing)
JWT_SECRET=ame_super_secret_jwt_key_2026_secure
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173

# Default Admin Credentials for Seeding
ADMIN_EMAIL=admin@ame.club
ADMIN_PASSWORD=Admin@123456
```

#### Frontend (`client/.env`)
Copy `client/.env.example` to `client/.env`:
```bash
VITE_API_URL=http://localhost:5000/api
```

---

### 2. Seeding the Admin User

Run the admin seeding script from the root or inside `server/`:
```bash
npm run seed:admin
# or: cd server && npm run seed:admin
```
- Creates an admin user with email `admin@ame.club` and password `Admin@123456`.
- If an admin user already exists, it safely skips creation without duplicates.

---

### 3. Running the Development Servers

You can run both or either service:

#### Option A: Running from Root Monorepo
```bash
# Terminal 1 - Start Server (Node / nodemon)
npm run dev:server

# Terminal 2 - Start Client (Vite dev server)
npm run dev:client
```

#### Option B: Running from Respective Folders
```bash
# Server
cd server
npm run dev

# Client
cd client
npm run dev
```

- Backend API: `http://localhost:5000`
- Frontend Application: `http://localhost:5173`

---

## 🧪 Verification & Testing

### Backend API Test Suite
Run the automated test runner in `server/`:
```bash
npm run test:server
# or: cd server && npm test
```

**Test results verified:**
1. ✔ Admin login via email & password
2. ✔ Student registration with validation
3. ✔ Security: Registration body role injection prevented (forced to "student")
4. ✔ Duplicate email rejection with 400 Bad Request
5. ✔ Duplicate roll number rejection with 400 Bad Request
6. ✔ Login via email
7. ✔ Login via Roll Number (`ME2024001`)
8. ✔ Invalid credentials rejection with generic 401
9. ✔ Protected route `GET /api/auth/me` with Bearer token
10. ✔ Unauthenticated request rejection with 401
11. ✔ Restricted profile update `PUT /api/auth/profile` (name, college, year, semester, mobile)
12. ✔ Security: Attempt to update role/rollNo ignored
13. ✔ Student attempting admin route blocked with `403 Forbidden`
14. ✔ Admin `GET /api/admin/students` with query filtering, search, & pagination
15. ✔ Admin `GET /api/admin/students/export` native CSV generation & download

### Frontend Production Build
Run the Vite production build in `client/`:
```bash
npm run build:client
# or: cd client && npm run build
```
- Built successfully in 2.78s without errors.

---

## 📋 Summary of Day 1 Deliverables

| Area | Component / Feature | Status | Details |
|---|---|---|---|
| **Backend** | `models/User.js` | ✅ Completed | Name, unique uppercase RollNo, college, branch, year (1-4), semester (1-8), email, 10-digit mobile, select: false password, bcrypt salt 10 pre-save hook, comparePassword method. |
| **Backend** | `controllers/authController.js` | ✅ Completed | `register`, `login` (email/rollNo), `getMe`, `updateProfile` with uniform `{ success, message, data }` responses. |
| **Backend** | Security & Middleware | ✅ Completed | Helmet, CORS, Express-validator, Express-rate-limit (20 requests / 15 min on auth routes), JWT `protect`, `isAdmin` (403). |
| **Backend** | `routes/admin.js` | ✅ Completed | Protected student directory (search, year/semester filter, pagination), native CSV export. |
| **Backend** | `scripts/seedAdmin.js` | ✅ Completed | Idempotent admin creation script (`npm run seed:admin`). |
| **Frontend** | Dark Theme & Mechanical Aesthetic | ✅ Completed | Tailwind CSS v4, Google Fonts ("Space Grotesk" & "Inter"), glassmorphism (`.glass-panel`, `.glass-input`), rotating gears animation. |
| **Frontend** | Common UI Kit | ✅ Completed | `Button` (loading, variants, framer-motion), `Input` (icon, show/hide password, errors), `Select`, `GlassCard`. |
| **Frontend** | `AuthContext` & `axios.js` | ✅ Completed | JWT storage in `localStorage`, session restore from `/auth/me`, automatic 401 logout, toasts. |
| **Frontend** | `Register.jsx` | ✅ Completed | 2-Step wizard with progress bar, password strength meter, inline client validation, desktop branding panel. |
| **Frontend** | `Login.jsx` | ✅ Completed | Single sign-on with Email or Roll Number, "Welcome back" branding split view. |
| **Frontend** | `Home.jsx` | ✅ Completed | Personalized welcome greeting, stats cards, and dedicated reserved slot for **Part B Announcements**. |
| **Frontend** | `Profile.jsx` | ✅ Completed | Student details display, locked immutable records, live profile updater. |
| **Frontend** | `admin/Students.jsx` | ✅ Completed | Student table, search, year/semester filters, pagination, and one-click CSV download. |

---

## 🔮 What’s Next (Day 2 / Part B)

1. **Announcements Module:**
   - Admin CRUD for publishing notices and circulars.
   - Plug into the marked slot inside `src/pages/Home.jsx`.
2. **Gallery Module:**
   - Department event media display, category filtering (Workshops, Competitions, Industrial Visits).
   - Lightbox image preview modal.
