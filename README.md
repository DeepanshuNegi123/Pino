# Pioneer - Practice & Knowledge Platform

> A minimal, fast, distraction-free practice platform for aptitude, reasoning, math, and engineering. Built with React 19, Express 5, and modular cloud architecture.

---

## 🌟 Key Features

- **No Login Required for Students**: Visitors land on the clean home page, pick a topic, practice questions, reveal step-by-step logic, read attached notes, and leave. Zero paywalls, zero friction.
- **Spacious, High-Contrast UI**: Designed for long problem-solving sessions without congestion or eye fatigue.
- **Dedicated Admin Studio (`#/admin`)**:
  - Upload and attach PDF notes and formula sheets.
  - Create and publish new multiple-choice questions with step-by-step solutions.
  - Manage existing materials across all categories.
- **Unified Production Server**: Express serves the React single-page application and the REST API from a single port without requiring complex web-server setups.

---

## 📂 Project Structure

```
Pioneer/
├── package.json          # Root scripts to install, build, and run the whole stack
├── .gitignore            # Clean gitignore excluding node_modules, dist, and secrets
│
├── user/                 # React 19 + Vite Frontend
│   ├── public/           # Static assets and local PDFs (user/public/docs/)
│   ├── src/
│   │   ├── components/   # LandingPage, QuestionCard, SidebarExplorer, MaterialViewer, AdminDashboard
│   │   ├── data/         # Mock question sets & initial topic data
│   │   ├── utils/        # Client-side persistent storage helpers (IndexedDB)
│   │   ├── App.jsx       # Client router (Landing, Practice, Notes, Admin)
│   │   └── App.css       # Clean, modern, spacious styling system
│   └── vite.config.js    # Vite dev server with automated /api proxy
│
└── backend/              # Node.js + Express 5 Backend
    ├── routes/           # Course, question, enrollment, and user routes
    ├── service/          # Database service & data store
    ├── uploads/          # Local static upload directory
    ├── app.js            # Express app configuration & static frontend serving
    └── server.js         # Entry point (reads process.env.PORT || 5000)
```

---

## 🚀 Quick Start (Local Development)

### 1. Install Dependencies
```bash
npm run install:all
```

### 2. Run in Development Mode
In terminal 1 (Backend):
```bash
npm run dev:backend
```

In terminal 2 (Frontend):
```bash
npm run dev:user
```

Open `http://localhost:5173` in your browser.

---

## 📦 Single-Command Production Mode

Build the frontend and run the complete app on a single port:

```bash
# 1. Build React frontend into user/dist
npm run build

# 2. Start the Express server
npm start
```

Visit `http://localhost:5000` to see your live platform!

---

## ⚙️ Routes

| Path | Description | Access |
| :--- | :--- | :--- |
| `#/` | Minimal Landing Page with Topic Explorer & Stats | Public (No login) |
| `#/practice` | Practice Questions with solutions & jump pills | Public (Read-only) |
| `#/notes` | Study Documents & Embedded PDF Viewer | Public (Read-only) |
| `#/admin` | Admin Management Studio (Upload PDFs, Add Q&A) | Admin Portal |



DEVOPS 

TERRAFORM 

