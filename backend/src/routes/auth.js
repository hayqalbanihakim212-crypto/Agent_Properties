const express = require("express");
const router = express.Router();
const { login, me, changePassword } = require("../controllers/authController");
const { requireAuth } = require("../middleware/auth");

// POST /api/auth/login
router.post("/login", login);

// GET /api/auth/me  [protected]
router.get("/me", requireAuth, me);

// POST /api/auth/change-password  [protected]
router.post("/change-password", requireAuth, changePassword);

module.exports = router;
