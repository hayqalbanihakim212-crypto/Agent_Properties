const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRY = process.env.JWT_EXPIRY || "8h";

if (!JWT_SECRET) {
  console.error("[AUTH] FATAL: JWT_SECRET tidak di-set di environment variables.");
  process.exit(1);
}

/**
 * Middleware: wajib login
 */
const requireAuth = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Akses ditolak: token tidak ada" });
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    const msg =
      err.name === "TokenExpiredError"
        ? "Sesi telah berakhir, silakan login kembali"
        : "Token tidak valid";
    return res.status(401).json({ success: false, message: msg });
  }
};

/**
 * Middleware: wajib role tertentu
 */
const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: "Akses ditolak: hak akses tidak cukup" });
  }
  next();
};

module.exports = { requireAuth, requireRole, JWT_SECRET, JWT_EXPIRY };
