<div align="center">

# 🏠 Agent Properties
### *Platform Manajemen Properti Berbasis AI — PropTech & Legal Agent*

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

> Aplikasi web untuk manajemen dan pencarian properti dengan fitur **agent AI**, autentikasi **JWT**, dan upload gambar via **Cloudinary**  dirancang untuk kebutuhan PropTech & Legal modern.

### 🌐 [Lihat Demo Frontend →](https://hayqalbanihakim212-crypto.github.io/Agent_Properties/)

</div>

---

## Fitur Utama

| Fitur | Deskripsi |
|-------|-----------|
| **Listing Properti** | Tambah, edit, hapus, dan cari properti secara lengkap |
| **Agent AI** | Asisten cerdas untuk kebutuhan PropTech & Legal |
| **Autentikasi JWT** | Login & register aman dengan token berbatas waktu |
| **Upload Gambar** | Upload foto properti langsung ke Cloudinary |
| **Rate Limiting** | Proteksi API dari penyalahgunaan |
| **Keamanan HTTP** | Header keamanan dengan Helmet.js |

---

## 🏗️ Arsitektur Sistem

```
┌─────────────────────────────────────────────────────┐
│              FRONTEND (React + Vite)                │
│                                                     │
│  Pages              Components         Lib          │
│  ├── Home           ├── PropertyCard   ├── api.js   │
│  ├── Listing        ├── AgentChat      └── auth.js  │
│  ├── Detail         ├── ImageUpload                 │
│  └── Auth           └── Navbar                      │
│                                                     │
│              React Router DOM + Fetch API           │
└──────────────────────┬──────────────────────────────┘
                       │ /api (port 5000)
┌──────────────────────▼──────────────────────────────┐
│              BACKEND (Node.js + Express)            │
│                                                     │
│  Routes: /api/*                                     │
│  ├── auth/          → Register & Login (JWT)        │
│  ├── properties/    → CRUD Properti                 │
│  └── agent/         → AI Agent Handler              │
│                                                     │
│  bcryptjs · jsonwebtoken · express-rate-limit       │
│  helmet · cors · dotenv                             │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│           PostgreSQL + Cloudinary (External)        │
│         Database Properti · Storage Gambar          │
└─────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Frontend | React 19, Vite 8 |
| Backend | Node.js, Express 4 |
| Database | PostgreSQL |
| Auth | JWT (jsonwebtoken), bcryptjs |
| Storage | Cloudinary |
| Keamanan | Helmet, express-rate-limit, CORS |
| Dev Tools | Nodemon, ESLint |

---

## 🚀 Cara Menjalankan Lokal

### Backend

```bash
cd backend
npm install
cp .env.example .env    # isi DATABASE_URL, JWT_SECRET, PORT
npm run migrate         # migrasi database (pertama kali)
npm run dev
# → http://localhost:5000
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env    # isi VITE_API_URL, VITE_CLOUDINARY_*
npm run dev
# → http://localhost:5173
```

---

## ⚙️ Konfigurasi Environment

### `frontend/.env`
```env
VITE_API_URL=http://localhost:5000/api
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

### `backend/.env`
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/agent_properties

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRY=8h

# Server
PORT=5000
FRONTEND_URL=http://localhost:5173
```

---

## 📡 API Endpoint

| Method | Endpoint | Auth | Keterangan |
|--------|----------|------|------------|
| POST | `/api/auth/register` | ✗ | Daftar akun baru |
| POST | `/api/auth/login` | ✗ | Login & dapat token |
| GET | `/api/properties` | ✗ | Daftar semua properti |
| GET | `/api/properties/:id` | ✗ | Detail properti |
| POST | `/api/properties` | ✓ | Tambah properti |
| PUT | `/api/properties/:id` | ✓ | Update properti |
| DELETE | `/api/properties/:id` | ✓ | Hapus properti |

---

## 📁 Struktur Proyek

```
agent_property/
├── frontend/
│   ├── src/
│   │   ├── components/      # PropertyCard, AgentChat, Navbar, ...
│   │   ├── pages/           # Home, Listing, Detail, Auth
│   │   └── lib/             # api.js, auth.js
│   ├── index.html
│   └── vite.config.js
└── backend/
    ├── src/
    │   └── config/
    │       └── migrate.js
    └── server.js
```

---

<div align="center">

*Project ini dalam tahap pengembangan aktif. Demo akan tersedia segera.*

---
Made by [hayqalbanihakim212-crypto](https://github.com/hayqalbanihakim212-crypto)

</div>
