const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on("error", (err) => {
  console.error("[DB] Unexpected error on idle client:", err.message);
});

pool.connect((err, client, release) => {
  if (err) {
    console.error("[DB] Gagal koneksi:", err.message);
  } else {
    console.log("[DB] Terhubung ke PostgreSQL");
    release();
  }
});

module.exports = pool;
