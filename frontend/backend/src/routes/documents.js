const express = require("express");
const router = express.Router();
const { generateDocument, getDocuments } = require("../controllers/documentController");
const { requireAuth } = require("../middleware/auth");
const { validateDocument } = require("../middleware/validate");

// Semua endpoint dokumen wajib login
router.use(requireAuth);

router.post("/generate", validateDocument, generateDocument);
router.get("/", getDocuments);

module.exports = router;
