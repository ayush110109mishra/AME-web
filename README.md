# AME Website — Association of Mechanical Engineering ⚙️
> Official Monorepo for the College Mechanical Engineering Club Web Portal (Day 1 & Day 2 Part A Implementation)

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
│   │   │   ├── Navbar.jsx      # Sticky glass navbar, responsive mobile drawer & user dropdown
│   │   │   ├── AnnouncementsSection.jsx # Home announcements section with mock toggle & Part B slot
│   │   │   ├── ProtectedRoute.jsx # Route guard requiring student/member authentication
│   │   │   └── AdminRoute.jsx     # Route guard requiring admin privileges (403 check)
│   │   ├── context/
│   │   │   └── AuthContext.jsx # Global user auth state, login, register, logout, profile update
│   │   ├── mocks/
│   │   │   └── announcements.js# Development mock data with USE_MOCK_DATA flag (default: false)
│   │   ├── pages/
│   │   │   ├── Home.jsx        # Member dashboard with real stats, announcements, & gallery preview
│   │   │   ├── Login.jsx       # Email or Roll Number login with branding panel
│   │   │   ├── Register.jsx    # 2-step registration with progress bar & password strength meter
│   │   │   ├── Profile.jsx     # Student profile view, profile updater, & Change Password card
│   │   │   ├── Announcements.jsx # Protected placeholder page (empty state for Part B)
│   │   │   ├── Gallery.jsx     # Protected placeholder page (empty state for Part B)
│   │   │   └── admin/
│   │   │       ├── Dashboard.jsx # Admin dashboard with live stats & quick navigation
│   │   │       └── Students.jsx# Admin directory with role promotion/demotion modal & CSV export
│   │   ├── App.jsx             # React router setup with route protection & dark toasts
│   │   ├── index.css           # Tailwind v4 import, mechanical grid pattern, glass styling
│   │   └── main.jsx            # App bootstrapping with console signature badge
│   ├── public/
│   │   └── humans.txt          # Developer signature file
│   ├── .env.example
│   └── package.json
│
├── server/                     # Backend (Node.js, Express, MongoDB Atlas, Mongoose)
│   ├── config/
│   │   └── db.js               # MongoDB Atlas connection with Google/Cloudflare DNS fallback
│   ├── controllers/
│   │   └── authController.js   # register, login, getMe, updateProfile, changePassword, getClubStats
│   ├── middleware/
│   │   ├── auth.js             # JWT Bearer token authentication (protect)
│   │   └── isAdmin.js          # Role check middleware (403 Forbidden for non-admins)
│   ├── models/
│   │   └── User.js             # Mongoose schema, bcrypt salt 10 pre-save hook, comparePassword
│   ├── routes/
│   │   ├── auth.js             # Auth routes with rate-limit, validator, change-password, stats
│   │   └── admin.js            # Admin stats, student management, role management & native CSV export
│   ├── scripts/
│   │   └── seedAdmin.js        # Idempotent admin user seeder
│   ├── utils/
│   │   └── generateToken.js    # JWT token generator
│   ├── testAuth.js             # Day 1 automated end-to-end API test harness
│   ├── testDay2Backend.js      # Day 2 automated backend verification suite
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
# MongoDB Atlas Connection URI:
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/ame_website?retryWrites=true&w=majority
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

### Day 1 Backend API Test Suite
Run the Day 1 automated test runner in `server/`:
```bash
npm run test:server
# or: cd server && node testAuth.js
```
- Validates student registration, duplicate detection, email/rollNo login, token issuance, 403 authorization checks, and CSV export.

### Day 2 (Part A) Backend API Test Suite
Run the Day 2 automated test runner in `server/`:
```bash
npm run test:day2
# or: cd server && node testDay2Backend.js
```
**Test suite coverage verified:**
1. ✔ Admin login via email & password
2. ✔ Dynamic student registration
3. ✔ Change password rejection on incorrect current password
4. ✔ Change password success (`PUT /api/auth/change-password`)
5. ✔ Immediate login verification with new password
6. ✔ Public club stats endpoint (`GET /api/auth/stats`) returning real member count
7. ✔ Student access to `/api/admin/stats` blocked with `403 Forbidden`
8. ✔ Admin stats fetched successfully (`totalStudents`, `totalAdmins`, `yearWise` 1st-4th)
9. ✔ Student blocked with `403` on role modification attempts
10. ✔ Admin self-demotion blocked with `400 Bad Request`
11. ✔ Last remaining admin demotion blocked with `400 Bad Request`
12. ✔ Student promoted to Admin role successfully (`PUT /api/admin/students/:id/role`)
13. ✔ Secondary Admin demoted back to Student successfully
14. ✔ Password hash strictly omitted from all JSON responses

### Frontend Production Build
Run the Vite production build in `client/`:
```bash
npm run build:client
# or: cd client && npm run build
```
- Built successfully with 0 errors.

---

## 🔌 Where Part B Connects (Integration Guide)

Part B developers (Announcements & Gallery) have ready-made integration points prepared:

### 1. Home Page Announcements Slot
- **File:** `client/src/components/AnnouncementsSection.jsx`
- **Location:** Embedded in `client/src/pages/Home.jsx`.
- **Note:** Comment `/* B ka AnnouncementsList yahan judega */` marks the exact container.
- When Part B's API is ready, replace mock fetch / empty state with the announcements fetcher.
- **Mock Toggle:** `client/src/mocks/announcements.js` has `export const USE_MOCK_DATA = false;`. Toggling this to `true` allows rendering sample announcement cards during local UI testing.

### 2. Standalone Announcements Page
- **File:** `client/src/pages/Announcements.jsx`
- **Route:** `/announcements` (Protected, accessible to logged-in members from Navbar).
- Currently presents a polished empty state ready to receive the full announcements feed and search/filter controls.

### 3. Standalone Gallery Page
- **File:** `client/src/pages/Gallery.jsx`
- **Route:** `/gallery` (Protected, accessible to logged-in members from Navbar).
- Currently presents an empty state ready to receive media albums, category filters, and image lightboxes.

### 4. Admin Management Links
- The Admin Dashboard (`client/src/pages/admin/Dashboard.jsx`) includes Quick Action cards for **Manage Announcements** and **Upload Media** pointing to `/admin/announcements` and `/admin/gallery` once created in Part B.

---

## 👥 Contributors

- **Ayush Mishra** — Full Stack Engineering, Architecture, Security & UI Design  
  *Portfolio:* [Through My Frames](https://ayush110109mishra.github.io/Through-My-Frames/)
