# 🦅 EAGLE EXAM | Assessment Center

Project link: "https://onlineexam08.vercel.app/"

> **Institutional-Grade Online Examination & Intelligence Platform**

Eagle Exam is a high-fidelity, production-ready assessment ecosystem designed for secure, real-time academic evaluations. Featuring a "Command Bridge" UI aesthetic, advanced scoring synchronization, and a global intelligence search engine.

---

## 🚀 Core Infrastructure

### 🔍 Global Intelligence Search
Permission-aware fuzzy search across **Exams**, **Students**, and **Results**. Features a 500ms debounced backend query system with glassmorphic suggestions.

### 🔔 Real-Time Event Ledger
Persistent notification architecture that synchronizes **Exam Publications** and **Result Readiness** across the master database with 15-second auto-polling.

### 🎯 Super-Match Scoring Engine
Bulletproof normalization protocol that strips hidden control characters and whitespace to ensure 100% accuracy between student submissions and institutional keys.

### 💻 Tactical Dashboards
- **Student Terminal**: Real-time deployment view, proficiency analytics, and detailed verification logs.
- **Admin Controller**: Institutional management, assessment creation, and global identity monitoring.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide Icons |
| **Backend** | Node.js, Express, JWT Authentication |
| **Database** | SQLite (LibSQL / Turso) |
| **Styling** | Custom Glassmorphism, Premium Animations |

---

## 📥 Installation & Deployment

### 1. Repository Synchronization
```bash
git clone <repository-url>
cd online-test
```

### 2. Backend Initialization
```bash
cd backend
npm install
npm start
```
*Port: `http://localhost:5000`*

### 3. Frontend Terminal Startup
```bash
cd frontend
npm install
npm run dev
```
*Access: `http://localhost:5173`*

---

## 🔐 Security Protocols
- **JWT Authorization**: Encrypted identity fragments for secure session persistence.
- **Role-Based Access**: Strict isolation between Administrative Controllers and Student Terminals.
- **Data Integrity**: Atomic persistence of assessment answers during submission.

## 🎨 UI/UX Aesthetic
The platform utilizes a **Command Bridge** design philosophy:
- Dark-mode optimized with high-contrast accents.
- Modern typography via the `Outfit` font family.
- Reactive background mesh-shaders and glassmorphic depth.

---

© 2026 Eagle Exam Institutional Systems. All rights reserved.
