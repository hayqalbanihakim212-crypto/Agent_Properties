require("dotenv").config();
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const run = async () => {
  const createQueries = [
    `CREATE TABLE IF NOT EXISTS properties (
      id           SERIAL PRIMARY KEY,
      title        VARCHAR(255) NOT NULL,
      price        BIGINT NOT NULL,
      type         VARCHAR(50)  NOT NULL DEFAULT 'Jual',
      status_legal VARCHAR(100) NOT NULL DEFAULT 'SHM (Sertifikat Hak Milik)',
      location     VARCHAR(255) NOT NULL DEFAULT 'Medan',
      description  TEXT,
      contact      VARCHAR(50),
      owner        VARCHAR(150),
      size         VARCHAR(50),
      images       TEXT[] DEFAULT '{}',
      created_at   TIMESTAMP DEFAULT NOW(),
      updated_at   TIMESTAMP DEFAULT NOW()
    );`,
    `CREATE TABLE IF NOT EXISTS users (
      id         SERIAL PRIMARY KEY,
      username   VARCHAR(100) UNIQUE NOT NULL,
      password   VARCHAR(255) NOT NULL,
      role       VARCHAR(50)  DEFAULT 'admin',
      is_active  BOOLEAN      DEFAULT TRUE,
      last_login TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW()
    );`,
    `CREATE TABLE IF NOT EXISTS documents (
      id               SERIAL PRIMARY KEY,
      doc_type         VARCHAR(50)  NOT NULL,
      pihak1           VARCHAR(255) NOT NULL,
      pihak2           VARCHAR(255) NOT NULL,
      property_address TEXT         NOT NULL,
      nominal          BIGINT       NOT NULL,
      draft_text       TEXT         NOT NULL,
      created_by       INTEGER REFERENCES users(id) ON DELETE SET NULL,
      created_at       TIMESTAMP DEFAULT NOW()
    );`,
    `CREATE TABLE IF NOT EXISTS client_requests (
      id            SERIAL PRIMARY KEY,
      nama          VARCHAR(255) NOT NULL,
      telepon       VARCHAR(50)  NOT NULL,
      email         VARCHAR(255),
      jenis_request VARCHAR(50)  NOT NULL,
      pesan         TEXT         NOT NULL,
      property_id   INTEGER REFERENCES properties(id) ON DELETE SET NULL,
      status        VARCHAR(50)  DEFAULT 'baru',
      catatan_admin TEXT,
      created_at    TIMESTAMP DEFAULT NOW(),
      updated_at    TIMESTAMP DEFAULT NOW()
    );`,
  ];

  console.log("Membuat tabel...");
  for (const q of createQueries) await pool.query(q);
  console.log("Tabel selesai.");

  const alterQueries = [
    `ALTER TABLE users      ADD COLUMN IF NOT EXISTS is_active   BOOLEAN   DEFAULT TRUE;`,
    `ALTER TABLE users      ADD COLUMN IF NOT EXISTS last_login  TIMESTAMP;`,
    `ALTER TABLE properties ADD COLUMN IF NOT EXISTS updated_at  TIMESTAMP DEFAULT NOW();`,
    `ALTER TABLE properties ADD COLUMN IF NOT EXISTS images      TEXT[]    DEFAULT '{}';`,
    `ALTER TABLE documents  ADD COLUMN IF NOT EXISTS created_by  INTEGER REFERENCES users(id) ON DELETE SET NULL;`,
  ];

  console.log("Menambah kolom...");
  for (const q of alterQueries) await pool.query(q);
  console.log("Kolom selesai.");

  const { rows } = await pool.query("SELECT COUNT(*) FROM users;");
  if (parseInt(rows[0].count, 10) === 0) {
    const hash = await bcrypt.hash("Admin@1234", 12);
    await pool.query(
      `INSERT INTO users (username, password, role, is_active) VALUES ('admin', $1, 'admin', TRUE)`,
      [hash],
    );
    console.log("User admin dibuat (password: Admin@1234)");
  } else {
    console.log("User sudah ada, seed dilewati.");
  }

  console.log("\nMigrasi selesai.");
  process.exit(0);
};

run().catch((err) => {
  console.error("Migrasi gagal:", err.message);
  process.exit(1);
});
