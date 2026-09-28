<div align="center">

# 🏠 Agent Properties
### *Platform PropTech & Legal Agent Berbasis AI*

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

> Aplikasi web untuk membantu proses **pencarian properti**, **analisis legalitas**, dan **konsultasi agen** secara cerdas — didukung backend aman dengan autentikasi JWT dan database PostgreSQL.

### 🌐 [Lihat Frontend →](https://agent-properties.vercel.app/) &nbsp;|&nbsp; 🔧 [Backend API →](https://backendproperties-agent.vercel.app/)

</div>

---

## ✨ Fitur Utama

| Fitur | Deskripsi |
|-------|-----------|
| **Pencarian Properti** | Temukan properti berdasarkan lokasi, harga, dan tipe |
| **Legal Agent** | Analisis dokumen dan legalitas properti secara otomatis |
| **Autentikasi JWT** | Sistem login aman dengan JSON Web Token |
| **Rate Limiting** | Perlindungan API dari penyalahgunaan |
| **Manajemen Pengguna** | Register, login, dan profil pengguna |

---

## 🏗️ Arsitektur Sistem

```
┌─────────────────────────────────────────────────────┐
│              FRONTEND (React + Vite)                │
│                                                     │
│  Pages              Components        Config        │
│  ├── Home           ├── PropertyCard  ├── vite      │
│  ├── Search         ├── AgentPanel   └── vercel.json│
│  ├── Detail         ├── AuthForm                    │
│  └── Dashboard      └── LegalViewer                 │
│                                                     │
│         React 19 + Babel React Compiler             │
└──────────────────────┬──────────────────────────────┘
                       │ REST API
┌──────────────────────▼──────────────────────────────┐
│              BACKEND (Node.js + Express)            │
│                                                     │
│  Routes: /api/*                                     │
│  ├── auth         → Register / Login (JWT)          │
│  ├── properties   → CRUD Properti                   │
│  ├── agents       → Manajemen Agen                  │
│  └── legal        → Analisis Legal                  │
│                                                     │
│  Security: Helmet · CORS · Rate Limit · bcryptjs    │
└──────────────────────┬──────────────────────────────┘
                       │ SQL
┌──────────────────────▼──────────────────────────────┐
│                  PostgreSQL Database                │
│          Properti · Users · Transaksi · Dokumen     │
└─────────────────────────────────────────────────────┘
```

---

## 🔐 Keamanan

Sistem ini menerapkan beberapa lapisan keamanan:

| Mekanisme | Library | Fungsi |
|-----------|---------|--------|
| Autentikasi | `jsonwebtoken` | Token berbasis JWT |
| Enkripsi Password | `bcryptjs` | Hash password aman |
| Header Security | `helmet` | Proteksi HTTP headers |
| Rate Limiting | `express-rate-limit` | Cegah brute force & abuse |
| CORS | `cors` | Kontrol akses cross-origin |

---

## 🛠️ Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Frontend | React 19, Vite 8, Babel React Compiler |
| Routing | React Router DOM |
| Backend | Node.js, Express 4 |
| Database | PostgreSQL (`pg`) |
| Auth | JWT + bcryptjs |
| Security | Helmet, CORS, express-rate-limit |
| Deploy Frontend | GitHub Pages (`gh-pages`) |
| Deploy Backend | Node.js server |

---

## 🚀 Cara Menjalankan Lokal

### Frontend

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

### Backend

```bash
cd backend
cp .env.example .env    # isi DATABASE_URL, JWT_SECRET, PORT
npm install
npm run migrate         # jalankan migrasi database
npm run dev
# → http://localhost:3000
```

> Vite akan otomatis proxy `/api` → backend Express

---

## 📁 Struktur Proyek

```
Agent_Properties/
├── frontend/
│   ├── src/
│   │   ├── components/      # PropertyCard, AgentPanel, AuthForm, ...
│   │   ├── pages/           # Home, Search, Detail, Dashboard
│   │   └── lib/             # api.js, auth.js
│   ├── vite.config.js
│   └── vercel.json
└── backend/
    └── src/
        ├── config/          # migrate.js, db config
        ├── middleware/       # auth.js, rateLimiter.js
        ├── routes/          # auth.js, properties.js, agents.js
        └── server.js
```

---

## ⚙️ Environment Variables

Buat file `.env` di folder `backend/`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/agent_properties
JWT_SECRET=your_jwt_secret_key
PORT=3000
```

---

## 🚢 Deploy

### Frontend — Vercel

Live di: [https://agent-properties.vercel.app](https://agent-properties.vercel.app)

Sudah dikonfigurasi via `vercel.json` — semua route diarahkan ke `index.html` untuk mendukung React Router:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### Backend — Vercel

Live di: [https://backendproperties-agent.vercel.app](https://backendproperties-agent.vercel.app)

Deploy sebagai serverless function di Vercel. Pastikan environment variables (`DATABASE_URL`, `JWT_SECRET`) sudah diset di dashboard Vercel.

### Frontend (GitHub Pages) — Opsional

```bash
cd frontend
npm run deploy
```

---

<div align="center">

*Platform ini ditujukan untuk keperluan edukasi dan demonstrasi teknis.*

---

Made by [hayqalbanihakim212-crypto](https://github.com/hayqalbanihakim212-crypto)

</div>
