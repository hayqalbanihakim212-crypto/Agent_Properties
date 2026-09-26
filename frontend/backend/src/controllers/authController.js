const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { JWT_SECRET, JWT_EXPIRY } = require("../middleware/auth");

// Pelacak brute force sederhana (in-memory, cukup untuk single-instance)
const loginAttempts = new Map();
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 menit

const checkBruteForce = (ip) => {
  const entry = loginAttempts.get(ip);
  if (!entry) return false;
  if (Date.now() - entry.firstAttempt > LOCKOUT_MS) {
    loginAttempts.delete(ip);
    return false;
  }
  return entry.count >= MAX_ATTEMPTS;
};

const recordFailedAttempt = (ip) => {
  const entry = loginAttempts.get(ip) || { count: 0, firstAttempt: Date.now() };
  entry.count += 1;
  loginAttempts.set(ip, entry);
};

const clearAttempts = (ip) => loginAttempts.delete(ip);

// POST /api/auth/login
const login = async (req, res) => {
  const ip = req.ip || req.connection.remoteAddress;

  if (checkBruteForce(ip)) {
    return res.status(429).json({
      success: false,
      message: "Terlalu banyak percobaan login. Coba lagi dalam 15 menit.",
    });
  }

  const { username, password } = req.body;

  if (
    !username ||
    !password ||
    typeof username !== "string" ||
    typeof password !== "string"
  ) {
    return res
      .status(400)
      .json({ success: false, message: "Username dan password wajib diisi" });
  }

  // Batasi panjang input untuk mencegah timing attack pada string besar
  if (username.length > 100 || password.length > 128) {
    return res
      .status(400)
      .json({ success: false, message: "Input tidak valid" });
  }

  try {
    const result = await pool.query(
      "SELECT id, username, password, role, is_active FROM users WHERE username = $1",
      [username.trim()],
    );

    // Selalu jalankan bcrypt.compare agar tidak bocor informasi via timing
    const dummyHash =
      "$2a$12$invalidhashtopreventtimingattackonusernameenumeration";
    const user = result.rows[0] || null;
    const hashToCompare = user ? user.password : dummyHash;

    const valid = await bcrypt.compare(password, hashToCompare);

    if (!user || !valid || !user.is_active) {
      recordFailedAttempt(ip);
      return res
        .status(401)
        .json({ success: false, message: "Username atau password salah" });
    }

    clearAttempts(ip);

    await pool.query("UPDATE users SET last_login = NOW() WHERE id = $1", [
      user.id,
    ]);

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY, issuer: "agent-property" },
    );

    res.json({
      success: true,
      token,
      user: { id: user.id, username: user.username, role: user.role },
    });
  } catch (err) {
    console.error("[AUTH] Login error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/auth/me
const me = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, username, role, last_login, created_at FROM users WHERE id = $1 AND is_active = TRUE",
      [req.user.id],
    );
    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User tidak ditemukan" });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("[AUTH] Me error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// POST /api/auth/change-password (admin mengubah password sendiri)
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res
      .status(400)
      .json({ success: false, message: "Semua field wajib diisi" });
  }
  if (newPassword.length < 8) {
    return res
      .status(400)
      .json({ success: false, message: "Password baru minimal 8 karakter" });
  }

  try {
    const result = await pool.query(
      "SELECT password FROM users WHERE id = $1",
      [req.user.id],
    );
    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User tidak ditemukan" });
    }

    const valid = await bcrypt.compare(
      currentPassword,
      result.rows[0].password,
    );
    if (!valid) {
      return res
        .status(401)
        .json({ success: false, message: "Password lama salah" });
    }

    const hash = await bcrypt.hash(newPassword, 12);
    await pool.query("UPDATE users SET password = $1 WHERE id = $2", [
      hash,
      req.user.id,
    ]);

    res.json({ success: true, message: "Password berhasil diubah" });
  } catch (err) {
    console.error("[AUTH] Change password error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { login, me, changePassword };
