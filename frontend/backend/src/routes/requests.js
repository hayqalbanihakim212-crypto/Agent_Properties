const express = require("express");
const router = express.Router();
const {
  createRequest,
  getAllRequests,
  getRequestById,
  updateRequestStatus,
  deleteRequest,
} = require("../controllers/requestController");
const { requireAuth } = require("../middleware/auth");

// Publik — klien mengirim request
router.post("/", createRequest);

// Admin only
router.get("/", requireAuth, getAllRequests);
router.get("/:id", requireAuth, getRequestById);
router.patch("/:id/status", requireAuth, updateRequestStatus);
router.delete("/:id", requireAuth, deleteRequest);

module.exports = router;
