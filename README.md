# AME Website — Association of Mechanical Engineering ⚙️
> Official Monorepo for the College Mechanical Engineering Club Web Portal (Day 1, Day 2 & Day 3 Implementation)

---

## 📌 Architecture Overview

This project is structured as a clean JavaScript monorepo (no TypeScript):

```
project AME/
├── client/                     # Frontend (React 19, Vite, Tailwind CSS v4, Framer Motion)
│   ├── src/
│   │   ├── api/axios.js        # Axios instance with JWT interceptor & auto-401 logout
│   │   ├── components/
│   │   │   ├── common/         # Button, Input, Select, GlassCard, Skeleton loaders
│   │   │   ├── Navbar.jsx      # Sticky glass navbar, responsive mobile drawer & user dropdown, theme toggle
│   │   │   ├── AnnouncementsSection.jsx # Home announcements section (real notices or clean empty state)
│   │   │   ├── ProtectedRoute.jsx # Route guard requiring student/member authentication
│   │   │   └── AdminRoute.jsx     # Route guard requiring admin privileges (403 check)
│   │   ├── context/
│   │   │   └── AuthContext.jsx # Global user auth state, login, register, logout, profile update
│   │   ├── pages/
│   │   │   ├── Home.jsx        # Member dashboard with real stats, announcements, & gallery preview
│   │   │   ├── Login.jsx       # Email or Roll Number login with branding panel
│   │   │   ├── Register.jsx    # 2-step registration with progress bar & password strength meter
│   │   │   ├── Profile.jsx     # Student profile view, profile updater, & Change Password card
│   │   │   ├── Announcements.jsx # Category filter chips, target year badges, relative dates, pagination
│   │   │   ├── Gallery.jsx     # Album cards, photo counts, cover previews, empty state
│   │   │   ├── AlbumDetail.jsx # Interactive photo grid + Lightbox with arrow/Esc/touch navigation
│   │   │   ├── NotFound.jsx    # Styled 404 page with return home action
│   │   │   └── admin/
│   │   │       ├── Dashboard.jsx     # Live stats & quick navigation to students, announcements, gallery
│   │   │       ├── Students.jsx      # Directory with role promotion/demotion modal & CSV export
│   │   │       ├── Announcements.jsx # Notice publishing form, table with Edit and Delete modal
│   │   │       └── Gallery.jsx       # Album creation, multi-photo staging, cover picker, delete modal
│   │   ├── App.jsx             # React router setup with route protection & dark toasts
│   │   ├── index.css           # Tailwind v4, CSS theme tokens, mechanical grid pattern, glass styling
│   │   └── main.jsx            # App bootstrapping with console signature badge
│   ├── public/
│   │   └── humans.txt          # Developer signature file
│   ├── .env.example
│   └── package.json
│
├── server/                     # Backend (Node.js, Express, MongoDB Atlas, Mongoose, Cloudinary, Multer)
│   ├── config/
│   │   ├── db.js               # MongoDB Atlas connection with Google/Cloudflare DNS fallback
│   │   └── cloudinary.js       # Cloudinary SDK with stream upload & asset removal helpers
│   ├── controllers/
│   │   ├── authController.js   # register, login, getMe, updateProfile, changePassword, getClubStats
│   │   ├── announcementController.js # getAnnouncements (batch-filtered), create, update, delete
│   │   └── galleryController.js# getAlbums, getAlbumById, createAlbum, uploadPhotos, updateAlbum, deletePhoto, deleteAlbum
│   ├── middleware/
│   │   ├── auth.js             # JWT Bearer token authentication (protect)
│   │   ├── isAdmin.js          # Role check middleware (403 Forbidden for non-admins)
│   │   └── upload.js           # Multer memoryStorage, 5 MB limit, jpeg/png/webp, max 10 files
│   ├── models/
│   │   ├── User.js             # Mongoose schema, bcrypt salt 10 pre-save hook, comparePassword
│   │   ├── Announcement.js     # Title, description, category, targetYear (0=all, 1-4), createdBy
│   │   └── Gallery.js          # Event name, description, date, coverImage, images array, createdBy
│   ├── routes/
│   │   ├── auth.js             # Auth routes with rate-limit, validator, change-password, stats (admin only)
│   │   ├── admin.js            # Admin stats, student management, role management & native CSV export
│   │   ├── announcements.js    # Batch-filtered circulars, admin CRUD
│   │   └── gallery.js          # Protected album viewer, admin CRUD & multi-photo upload
│   ├── scripts/
│   │   └── seedAdmin.js        # Idempotent admin user seeder
│   ├── utils/
│   │   └── generateToken.js    # JWT token generator
│   ├── testAuth.js             # Day 1 automated end-to-end API test harness
│   ├── testDay2Backend.js      # Day 2 automated backend verification suite
│   ├── testAnnouncements.js    # Day 3A automated announcements test harness
│   ├── testGallery.js          # Day 3B automated gallery & Cloudinary test harness
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
NODE_ENV=development
# MongoDB Atlas Connection URI:
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/ame_website?retryWrites=true&w=majority
JWT_SECRET=your_strong_jwt_secret_min_32_characters_long
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173

# Admin Seed Credentials
ADMIN_EMAIL=admin@ame.club
ADMIN_PASSWORD=your_secure_admin_password
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
- Creates an admin user with the email and password specified in your environment variables (`ADMIN_EMAIL` and `ADMIN_PASSWORD`).
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

### Day 3A Announcements API Test Suite
Run the Day 3A automated test runner in `server/`:
```bash
npm --prefix server run test:announcements
# or: cd server && node testAnnouncements.js
```
**Test suite coverage verified:**
1. ✔ Admin login & JWT verification
2. ✔ Year 2 student registration
3. ✔ Security: Student blocked with `403 Forbidden` on POST/PUT/DELETE
4. ✔ Admin creates global (targetYear: 0) and batch-targeted (targetYear: 3) circulars
5. ✔ Privacy Isolation: Year 2 student cannot see Year 3 circulars
6. ✔ Admin view: Sees all circulars across all batches
7. ✔ Admin updates announcement details
8. ✔ Automatic DB cleanup ensuring zero lingering test records

### Day 3B Gallery & Cloudinary API Test Suite
Run the Day 3B automated test runner in `server/`:
```bash
npm --prefix server run test:gallery
# or: cd server && node testGallery.js
```
**Test suite coverage verified:**
1. ✔ Admin login & student registration
2. ✔ Security: Student blocked with `403 Forbidden` on album creation, photo upload, update, and deletion
3. ✔ Admin creates album with title, description, and event date
4. ✔ Student fetches album list with accurate photo count
5. ✔ Admin updates album metadata
6. ✔ Cloudinary multi-upload test with auto-format and auto-quality optimization
7. ✔ Admin deletes individual photo with Cloudinary asset cleanup and DB array pull
8. ✔ Admin deletes entire album with Cloudinary cleanup and MongoDB document removal
9. ✔ Automatic DB cleanup maintaining pristine production state

### Frontend Production Build
Run the Vite production build in `client/`:
```bash
npm run build:client
# or: cd client && npm run build
```
- Built successfully with 0 errors across all routes, dark/light themes, and image lightboxes.

---

## 📡 API Endpoints Reference

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register student with 2-step validation |
| POST | `/api/auth/login` | Public | Login via Email or Roll Number |
| GET | `/api/auth/me` | Protected | Fetch current authenticated user |
| PUT | `/api/auth/profile` | Protected | Update profile (mobile, branch) |
| PUT | `/api/auth/change-password`| Protected | Update password with current password verification |
| GET | `/api/auth/stats` | Admin | Total registered member count (Restricted from students) |

### 🛠️ Admin Operations (`/api/admin`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/admin/stats` | Admin | Dashboard metrics (students, year-wise distribution, admins) |
| GET | `/api/admin/students` | Admin | Filterable, searchable student directory |
| GET | `/api/admin/students/export` | Admin | Native RFC 4180 CSV export |
| PUT | `/api/admin/students/:id/role` | Admin | Promote/demote student/admin role (Self & last-admin protected) |

### 📢 Announcements (`/api/announcements`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/announcements` | Protected | Fetch notices (Student sees targetYear 0 or their academic year; Admin sees all) |
| POST | `/api/announcements` | Admin | Publish notice (title, description, category, targetYear) |
| PUT | `/api/announcements/:id` | Admin | Edit notice |
| DELETE | `/api/announcements/:id` | Admin | Delete notice |

### 🖼️ Gallery (`/api/gallery`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/gallery` | Protected | List all event albums with cover & photo counts |
| GET | `/api/gallery/:id` | Protected | Get album details and full image gallery |
| POST | `/api/gallery` | Admin | Create event album with optional cover |
| POST | `/api/gallery/:id/images` | Admin | Upload up to 10 photos (Multer memoryStorage + Cloudinary) |
| PUT | `/api/gallery/:id` | Admin | Update album info or set cover photo |
| DELETE | `/api/gallery/:id/images/:publicId` | Admin | Delete photo (Destroys Cloudinary asset & DB record) |
| DELETE | `/api/gallery/:id` | Admin | Delete album (Destroys all album photos from Cloudinary & DB) |

---

## 🚀 Production Deployment Guide

### 1. Backend Deployment (Render Web Service)

Deploy the Express API to **[Render](https://render.com/)**:
1. Click **New +** > **Web Service**.
2. Connect your GitHub repository (`AME-web`).
3. Set the following build and run settings:
   - **Name:** `ame-api` (or preferred name)
   - **Region:** Closest to your users (e.g., Singapore / Frankfurt)
   - **Branch:** `main`
   - **Root Directory:** `server`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. Add the required **Environment Variables** in the Render Dashboard (never commit secret values to git):
   - `NODE_ENV`: `production`
   - `PORT`: `10000` (Render will assign or default)
   - `MONGO_URI`: `mongodb+srv://<db_user>:<db_pass>@<cluster>.mongodb.net/ame_website?retryWrites=true&w=majority`
   - `JWT_SECRET`: High-entropy secret key (at least 32 characters)
   - `JWT_EXPIRES_IN`: `7d`
   - `CLIENT_URL`: Your Vercel frontend URL (e.g. `https://ame-web.vercel.app` — supports comma-separated URLs if custom domains are used)
   - `CLOUDINARY_CLOUD_NAME`: Cloudinary account cloud name
   - `CLOUDINARY_API_KEY`: Cloudinary API key
   - `CLOUDINARY_API_SECRET`: Cloudinary API secret
   - `ADMIN_EMAIL`: Club master administrator email
   - `ADMIN_PASSWORD`: Strong master administrator password

> [!NOTE]
> Render runs behind a reverse proxy. The server has `app.set('trust proxy', 1)` enabled, ensuring IP-based rate limiting functions accurately.

---

### 2. Frontend Deployment (Vercel)

Deploy the React client to **[Vercel](https://vercel.com/)**:
1. Click **Add New...** > **Project** and import your GitHub repository.
2. Configure Project Settings:
   - **Framework Preset:** `Vite`
   - **Root Directory:** `client`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
3. Add the required **Environment Variable**:
   - `VITE_API_URL`: `https://<your-render-backend-service>.onrender.com/api`
4. Deploy!

> [!TIP]
> The repository includes [`client/vercel.json`](file:///client/vercel.json) with client-side SPA rewrites (`"source": "/(.*)", "destination": "/index.html"`). This prevents `404 Not Found` errors when users reload deep routes like `/admin` or `/announcements`.

---

## 👥 Contributors

- **Ayush Mishra** — Full Stack Engineering, Architecture, Security & UI Design  
  *Portfolio:* [Through My Frames](https://ayush110109mishra.github.io/Through-My-Frames/)
