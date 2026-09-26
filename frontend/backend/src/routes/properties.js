const express = require("express");
const router = express.Router();
const {
  getAllProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
} = require("../controllers/propertyController");
const { requireAuth } = require("../middleware/auth");
const { validateProperty } = require("../middleware/validate");

// GET - publik (katalog properti bisa dilihat tanpa login)
router.get("/", getAllProperties);
router.get("/:id", getPropertyById);

// Mutasi - wajib login admin
router.post("/", requireAuth, validateProperty, createProperty);
router.put("/:id", requireAuth, validateProperty, updateProperty);
router.delete("/:id", requireAuth, deleteProperty);

module.exports = router;
