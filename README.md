# Association of Mechanical Engineering (AME) Web Portal ⚙️

[![React 19](https://img.shields.io/badge/React-19.0-61dafb?logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-06b6d4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-5.x-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB_Atlas-Database-47a248?logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-Media_CDN-3448c5?logo=cloudinary&logoColor=white)](https://cloudinary.com/)
[![License: ISC](https://img.shields.io/badge/License-ISC-ff6b2c.svg)](LICENSE)

An official full-stack web platform built for the college **Association of Mechanical Engineering (AME)** club. Designed to streamline departmental communication, member authentication, academic year-targeted announcements, and high-resolution event media archiving with a high-performance, responsive engineering design system.

---

## 📖 About The Project

College technical clubs often struggle with scattered communication channels, insecure spreadsheets for student records, and slow, unorganized photo sharing. 

The **AME Web Portal** solves this by providing a unified, secure hub for mechanical engineering students, club members, and administrators:
- **Centralized Circulars:** Students only see official circulars and notices relevant to their specific academic year or campus-wide events.
- **Event Archiving:** High-resolution event photography optimized on-the-fly through Cloudinary CDN.
- **Member Directory:** Administration tools for role elevation, directory exports, and real-time demographic analytics.
- **Modern Aesthetic:** Built with an industrial mechanical dark/light theme, glassmorphism cards, and fluid motion micro-interactions.

---

## ✨ Key Features

### 🔐 Member Authentication & Security
- **Two-Step Registration:** Progressive form with real-time field validation, college roll number checks, and dynamic password strength evaluation.
- **Dual Identifier Login:** Students can authenticate using either their registered **Email** or **College Roll Number**.
- **Role-Based Access Control (RBAC):** Strict JWT-based authorization protecting administrative routes (`protect` + `isAdmin` middleware).
- **Self-Service Profile:** Members can update personal contact details and change passwords with current-password verification.

### 📢 Targeted Announcements Engine
- **Academic Year Filtering:** Administrators can broadcast notices globally (`All Batches`) or isolate them to specific cohorts (`1st`, `2nd`, `3rd`, or `4th` Year).
- **Batch Privacy:** Database queries enforce that students cannot see circulars directed to other batches.
- **Rich Categorization:** Tagging system for seminars, orientation, technical workshops, and general alerts with relative date badges.

### 🖼️ Event Gallery & Cloudinary Media CDN
- **Cloud-Optimized Storage:** Images are streamed directly to Cloudinary using Multer in-memory buffers (no temp disk bloat).
- **Automatic Asset Transformation:** Automatic WebP/AVIF format selection (`fetch_format: auto`) and quality compression (`quality: auto`).
- **Interactive Lightbox:** Fullscreen image viewing with keyboard arrows, touch swipe, Escape close, and cover photo selectors.
- **Cascade Deletion:** Removing an album or photo automatically purges the corresponding remote asset from Cloudinary CDN and MongoDB.

### 🛠️ Administrative Control Center
- **Live Club Metrics:** Real-time dashboards visualizing total student membership, year-wise distribution, and active admin counts.
- **Member Management:** Instant student search, role promotion (`Make Admin`) / demotion (`Remove Admin`), and safety locks preventing self-demotion or removing the last remaining admin.
- **Native CSV Export:** RFC 4180 compliant member roster export for departmental record keeping.

### 🎨 Industrial UI Design System
- **Dual Themes:** Near-black industrial dark theme (`#0a0e1a`) and crisp light theme (`#f6f7fb`) powered by unified CSS variables with high-contrast accessibility (>15:1 ratio).
- **Typography:** Space Grotesk for bold engineering headers, paired with Inter for clear body readability.
- **Micro-Interactions:** Custom spinners, mechanical gear motifs, animated transitions with Framer Motion, and dark toast alerts.

---

## 💻 Tech Stack

### Frontend
- **Framework:** [React 19](https://react.dev/) + [Vite](https://vite.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **HTTP Client:** [Axios](https://axios-http.com/) (with automatic 401 interceptors)
- **Notifications:** [React Hot Toast](https://react-hot-toast.com/)

### Backend
- **Runtime:** [Node.js](https://nodejs.org/) (v18+)
- **Framework:** [Express.js 5](https://expressjs.com/)
- **Database:** [MongoDB Atlas](https://www.mongodb.com/atlas) with [Mongoose 9](https://mongoosejs.com/)
- **Authentication:** [JSON Web Tokens (JWT)](https://jwt.io/) & [bcryptjs](https://github.com/dcodeIO/bcrypt.js)
- **Media Uploads:** [Multer](https://github.com/expressjs/multer) & [Cloudinary SDK v2](https://cloudinary.com/documentation/node_integration)
- **Security:** [Helmet](https://helmetjs.github.io/), [express-rate-limit](https://github.com/express-rate-limit/express-rate-limit), and [express-validator](https://express-validator.github.io/)

---

## 📁 Repository Structure

```
project AME/
├── client/                     # Frontend Single Page Application (React 19 + Vite)
│   ├── src/
│   │   ├── api/                # Axios instance & JWT response interceptors
│   │   ├── components/         # Reusable UI: Buttons, Inputs, GlassCard, Navbar, Footer
│   │   ├── context/            # AuthContext (global user state) & ThemeContext
│   │   ├── pages/              # Home, Login, Register, Profile, Announcements, Gallery
│   │   │   └── admin/          # Admin Dashboard, Student Management, CMS
│   │   ├── App.jsx             # Route definitions & ProtectedRoute guards
│   │   ├── index.css           # Tailwind v4 imports & CSS theme tokens
│   │   └── main.jsx            # React root mount & developer signature
│   ├── public/                 # Static assets, favicon & humans.txt
│   ├── vercel.json             # Vercel SPA route rewrite rules
│   └── package.json
│
├── server/                     # Backend REST API (Node.js + Express)
│   ├── config/
│   │   ├── db.js               # MongoDB Atlas connection & resilient DNS fallback
│   │   └── cloudinary.js       # Cloudinary streaming upload & asset removal helpers
│   ├── controllers/            # Request handlers: auth, admin, announcements, gallery
│   ├── middleware/             # auth (JWT), isAdmin, upload (Multer memoryStorage)
│   ├── models/                 # Mongoose schemas: User, Announcement, Gallery
│   ├── routes/                 # Express route definitions with input validators
│   ├── scripts/                # Database seeding utilities (seedAdmin.js)
│   ├── testAuth.js             # Authentication & user lifecycle test harness
│   ├── testDay2Backend.js      # Admin stats, role permissions & password test harness
│   ├── testAnnouncements.js    # Batch-targeting & announcement isolation tests
│   ├── testGallery.js          # Cloudinary upload, album CRUD & asset cleanup tests
│   └── package.json
│
├── start-dev.bat               # Windows one-click local server launcher
├── package.json                # Monorepo root script runner (Concurrently)
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** `v18.0.0` or higher
- **npm** `v9.0.0` or higher
- A **MongoDB Atlas** cluster URI
- A **Cloudinary** account (Cloud Name, API Key, API Secret)

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/ayush110109mishra/AME-web.git
cd AME-web

# Install root dependencies
npm install

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
cd ..
```

### 2. Environment Configuration

#### Backend Configuration (`server/.env`)
Create a `.env` file in the `server` directory (reference `server/.env.example`):

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/ame_website?retryWrites=true&w=majority
JWT_SECRET=your_strong_jwt_secret_min_32_characters_long
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173

# Master Administrator Seed Credentials
ADMIN_EMAIL=admin@ame.club
ADMIN_PASSWORD=your_secure_admin_password

# Cloudinary Storage Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

#### Frontend Configuration (`client/.env`)
Create a `.env` file in the `client` directory (reference `client/.env.example`):

```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Initialize Admin Account

Seed the initial administrator credentials into MongoDB:

```bash
npm run seed:admin
```

### 4. Run Development Servers

Start both frontend and backend concurrently in one terminal:

```bash
npm run dev
```

*Or use the Windows one-click launcher by double-clicking `start-dev.bat`.*

- **Client Application:** `http://localhost:5173`
- **Backend API:** `http://localhost:5000`

---

## 🧪 Testing & Quality Assurance

The codebase includes comprehensive, automated end-to-end test runners verifying API contracts, authorization rules, and database integrity.

```bash
# Run Auth & Profile Test Suite (13 tests)
npm --prefix server run test

# Run Admin Operations & Security Test Suite (14 tests)
npm --prefix server run test:day2

# Run Announcements Batch Isolation Test Suite (8 tests)
npm --prefix server run test:announcements

# Run Gallery & Cloudinary Media Test Suite (9 tests)
npm --prefix server run test:gallery
```

### What The Test Suites Validate:
1. **Authentication:** 2-step validation, duplicate rollNo/email rejection, password hashing, and token issuance.
2. **Access Control:** Verified that student tokens receive strict `403 Forbidden` on all `/api/admin/*` and CMS modification endpoints.
3. **Batch Isolation:** Proved that students in Year 2 cannot view announcements targeted to Year 3.
4. **Cloud Media Management:** Uploads mock assets to Cloudinary, verifies automatic WebP optimization, tests individual photo removal, and confirms complete cloud purge on album deletion.
5. **Database Teardown:** Tests clean up their test users and documents automatically after execution.

---

## 🌐 Production Deployment

### Backend (Render Web Service)
1. Create a new **Web Service** on [Render](https://render.com/) and connect this repository.
2. Settings:
   - **Root Directory:** `server`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
3. Add Environment Variables in the Render dashboard:
   - `NODE_ENV`: `production`
   - `MONGO_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: Secure 32+ character key
   - `JWT_EXPIRES_IN`: `7d`
   - `CLIENT_URL`: Your Vercel frontend URL (e.g. `https://ame-web.vercel.app`)
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
   - `ADMIN_EMAIL`, `ADMIN_PASSWORD`

### Frontend (Vercel)
1. Import the repository into [Vercel](https://vercel.com/).
2. Settings:
   - **Framework Preset:** `Vite`
   - **Root Directory:** `client`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. Add Environment Variable:
   - `VITE_API_URL`: `https://your-render-service.onrender.com/api`
4. The included `client/vercel.json` automatically handles client-side routing rewrites for deep links like `/admin` and `/gallery`.

---

## 📡 API Reference Summary

| Module | Method | Endpoint | Access | Description |
|---|---|---|---|---|
| **Auth** | `POST` | `/api/auth/register` | Public | Student registration with validation |
| **Auth** | `POST` | `/api/auth/login` | Public | Login via Email or Roll Number |
| **Auth** | `GET` | `/api/auth/me` | Protected | Retrieve authenticated member profile |
| **Auth** | `PUT` | `/api/auth/profile` | Protected | Update contact & branch info |
| **Auth** | `PUT` | `/api/auth/change-password` | Protected | Change password with current verification |
| **Auth** | `GET` | `/api/auth/stats` | Admin | Total registered members count |
| **Admin** | `GET` | `/api/admin/stats` | Admin | Dashboard breakdown (Year-wise, students, admins) |
| **Admin** | `GET` | `/api/admin/students` | Admin | Filterable, searchable student list |
| **Admin** | `GET` | `/api/admin/students/export` | Admin | RFC 4180 CSV student export |
| **Admin** | `PUT` | `/api/admin/students/:id/role` | Admin | Promote or demote user roles |
| **Notices** | `GET` | `/api/announcements` | Protected | Fetch circulars (filtered to user's batch) |
| **Notices** | `POST` | `/api/announcements` | Admin | Publish notice for all or targeted year |
| **Notices** | `PUT` | `/api/announcements/:id` | Admin | Update existing notice |
| **Notices** | `DELETE` | `/api/announcements/:id` | Admin | Delete notice |
| **Gallery** | `GET` | `/api/gallery` | Protected | List all event albums with cover photos |
| **Gallery** | `GET` | `/api/gallery/:id` | Protected | View album details and full image list |
| **Gallery** | `POST` | `/api/gallery` | Admin | Create new album |
| **Gallery** | `POST` | `/api/gallery/:id/images` | Admin | Upload up to 10 photos (Multer + Cloudinary) |
| **Gallery** | `PUT` | `/api/gallery/:id` | Admin | Update album info or assign cover photo |
| **Gallery** | `DELETE` | `/api/gallery/:id/images/:publicId` | Admin | Remove photo from album & Cloudinary CDN |
| **Gallery** | `DELETE` | `/api/gallery/:id` | Admin | Delete album & purge all images from CDN |

---

## 👨‍💻 Author & Connect

Developed and architected with precision by **Ayush Mishra**.

- **Portfolio & Works:** [Through My Frames](https://ayush110109mishra.github.io/Through-My-Frames/)
- **GitHub:** [@ayush110109mishra](https://github.com/ayush110109mishra)
- **Project Repository:** [AME-web](https://github.com/ayush110109mishra/AME-web)

If you have questions, suggestions, or would like to contribute to the AME Web Portal, feel free to open an issue or reach out directly!

---

## 📄 License

This project is licensed under the [ISC License](LICENSE).
