const pool = require("../config/db");

const clean = (val) =>
  typeof val === "string" ? val.replace(/<[^>]*>/g, "").trim().slice(0, 1000) : val;

const STATUS_VALID = ["baru", "diproses", "selesai", "ditolak"];

// POST /api/requests  — publik, klien mengajukan request
const createRequest = async (req, res) => {
  try {
    const { nama, telepon, email, jenis_request, pesan, property_id } = req.body;

    if (!nama || !telepon || !jenis_request || !pesan) {
      return res.status(400).json({
        success: false,
        message: "Field wajib: nama, telepon, jenis_request, pesan",
      });
    }

    if (!["tanya", "survei", "penawaran", "sewa", "beli"].includes(jenis_request)) {
      return res.status(400).json({ success: false, message: "Jenis request tidak valid" });
    }

    // Validasi nomor telepon sederhana
    const phoneClean = telepon.replace(/[\s\-().]/g, "");
    if (!/^(\+62|62|0)[0-9]{8,13}$/.test(phoneClean)) {
      return res.status(400).json({ success: false, message: "Format nomor telepon tidak valid" });
    }

    let propId = null;
    if (property_id) {
      propId = parseInt(property_id, 10);
      if (isNaN(propId)) propId = null;
      else {
        // Pastikan properti ada
        const check = await pool.query("SELECT id FROM properties WHERE id = $1", [propId]);
        if (check.rowCount === 0) propId = null;
      }
    }

    const result = await pool.query(
      `INSERT INTO client_requests
         (nama, telepon, email, jenis_request, pesan, property_id, status)
       VALUES ($1,$2,$3,$4,$5,$6,'baru')
       RETURNING id, nama, jenis_request, created_at`,
      [clean(nama), phoneClean, clean(email || ""), jenis_request, clean(pesan), propId]
    );

    res.status(201).json({
      success: true,
      message: "Permintaan Anda telah diterima. Agen kami akan menghubungi Anda segera.",
      data: result.rows[0],
    });
  } catch (err) {
    console.error("[REQUEST] createRequest:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/requests  [admin]
const getAllRequests = async (req, res) => {
  try {
    const { status, jenis_request, page = 1, limit = 30 } = req.query;
    const conditions = [];
    const values = [];
    let idx = 1;

    if (status && STATUS_VALID.includes(status)) {
      conditions.push(`r.status = $${idx++}`);
      values.push(status);
    }
    if (jenis_request) {
      conditions.push(`r.jenis_request = $${idx++}`);
      values.push(jenis_request);
    }

    const safePage = Math.max(1, parseInt(page, 10) || 1);
    const safeLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 30));
    const offset = (safePage - 1) * safeLimit;

    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const countRes = await pool.query(
      `SELECT COUNT(*) FROM client_requests r ${where}`,
      values
    );

    values.push(safeLimit, offset);
    const result = await pool.query(
      `SELECT r.id, r.nama, r.telepon, r.email, r.jenis_request, r.pesan,
              r.status, r.catatan_admin, r.created_at, r.updated_at,
              p.title AS property_title, p.location AS property_location
       FROM client_requests r
       LEFT JOIN properties p ON r.property_id = p.id
       ${where}
       ORDER BY
         CASE r.status WHEN 'baru' THEN 0 WHEN 'diproses' THEN 1 ELSE 2 END,
         r.created_at DESC
       LIMIT $${idx++} OFFSET $${idx++}`,
      values
    );

    res.json({
      success: true,
      total: parseInt(countRes.rows[0].count, 10),
      page: safePage,
      limit: safeLimit,
      data: result.rows,
    });
  } catch (err) {
    console.error("[REQUEST] getAllRequests:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/requests/:id  [admin]
const getRequestById = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ success: false, message: "ID tidak valid" });

    const result = await pool.query(
      `SELECT r.*, p.title AS property_title, p.price AS property_price,
              p.location AS property_location, p.contact AS property_contact,
              p.type AS property_type, p.status_legal
       FROM client_requests r
       LEFT JOIN properties p ON r.property_id = p.id
       WHERE r.id = $1`,
      [id]
    );

    if (result.rowCount === 0)
      return res.status(404).json({ success: false, message: "Request tidak ditemukan" });

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("[REQUEST] getRequestById:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// PATCH /api/requests/:id/status  [admin]
const updateRequestStatus = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ success: false, message: "ID tidak valid" });

    const { status, catatan_admin } = req.body;
    if (!STATUS_VALID.includes(status)) {
      return res.status(400).json({ success: false, message: "Status tidak valid" });
    }

    const result = await pool.query(
      `UPDATE client_requests
       SET status = $1, catatan_admin = $2, updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [status, clean(catatan_admin || ""), id]
    );

    if (result.rowCount === 0)
      return res.status(404).json({ success: false, message: "Request tidak ditemukan" });

    res.json({ success: true, message: "Status berhasil diperbarui", data: result.rows[0] });
  } catch (err) {
    console.error("[REQUEST] updateRequestStatus:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// DELETE /api/requests/:id  [admin]
const deleteRequest = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ success: false, message: "ID tidak valid" });

    const result = await pool.query(
      "DELETE FROM client_requests WHERE id = $1 RETURNING id",
      [id]
    );
    if (result.rowCount === 0)
      return res.status(404).json({ success: false, message: "Request tidak ditemukan" });

    res.json({ success: true, message: "Request berhasil dihapus" });
  } catch (err) {
    console.error("[REQUEST] deleteRequest:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { createRequest, getAllRequests, getRequestById, updateRequestStatus, deleteRequest };
