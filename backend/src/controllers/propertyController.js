const pool = require("../config/db");

const ALLOWED_SORT = ["created_at", "price", "title"];
const ALLOWED_ORDER = ["ASC", "DESC"];
const MAX_IMAGES = 5;

const sanitizeImages = (images) => {
  if (!Array.isArray(images)) return [];
  return images
    .filter((url) => typeof url === "string" && url.startsWith("http"))
    .slice(0, MAX_IMAGES);
};

// GET /api/properties
const getAllProperties = async (req, res) => {
  try {
    const {
      type,
      location,
      min_price,
      max_price,
      sort = "created_at",
      order = "DESC",
      page = 1,
      limit = 50,
    } = req.query;

    const safeSort = ALLOWED_SORT.includes(sort) ? sort : "created_at";
    const safeOrder = ALLOWED_ORDER.includes(order.toUpperCase())
      ? order.toUpperCase()
      : "DESC";
    const safePage = Math.max(1, parseInt(page, 10) || 1);
    const safeLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
    const offset = (safePage - 1) * safeLimit;

    const conditions = [];
    const values = [];
    let idx = 1;

    if (type) {
      conditions.push(`type ILIKE $${idx++}`);
      values.push(`%${type}%`);
    }
    if (location) {
      conditions.push(`location ILIKE $${idx++}`);
      values.push(`%${location}%`);
    }
    if (min_price && !isNaN(Number(min_price))) {
      conditions.push(`price >= $${idx++}`);
      values.push(Number(min_price));
    }
    if (max_price && !isNaN(Number(max_price))) {
      conditions.push(`price <= $${idx++}`);
      values.push(Number(max_price));
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM properties ${whereClause}`,
      values,
    );
    const total = parseInt(countResult.rows[0].count, 10);

    values.push(safeLimit, offset);
    const result = await pool.query(
      `SELECT id, title, price, type, status_legal, location, description,
              contact, owner, size, images, created_at
       FROM properties ${whereClause}
       ORDER BY ${safeSort} ${safeOrder}
       LIMIT $${idx++} OFFSET $${idx++}`,
      values,
    );

    res.json({
      success: true,
      total,
      page: safePage,
      limit: safeLimit,
      data: result.rows,
    });
  } catch (err) {
    console.error("[PROPERTY] getAllProperties:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/properties/:id
const getPropertyById = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id))
      return res
        .status(400)
        .json({ success: false, message: "ID tidak valid" });

    const result = await pool.query("SELECT * FROM properties WHERE id = $1", [
      id,
    ]);
    if (result.rowCount === 0)
      return res
        .status(404)
        .json({ success: false, message: "Properti tidak ditemukan" });

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("[PROPERTY] getPropertyById:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// POST /api/properties  [admin only]
const createProperty = async (req, res) => {
  try {
    const {
      title,
      price,
      type,
      status_legal,
      location,
      description,
      contact,
      owner,
      size,
      images,
    } = req.body;

    const safeImages = sanitizeImages(images);

    const result = await pool.query(
      `INSERT INTO properties
         (title, price, type, status_legal, location, description, contact, owner, size, images)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING *`,
      [
        title,
        Number(price),
        type,
        status_legal,
        location,
        description || "",
        contact,
        owner || "",
        size || "",
        safeImages,
      ],
    );

    res.status(201).json({
      success: true,
      message: "Properti berhasil ditambahkan",
      data: result.rows[0],
    });
  } catch (err) {
    console.error("[PROPERTY] createProperty:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// PUT /api/properties/:id  [admin only]
const updateProperty = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id))
      return res
        .status(400)
        .json({ success: false, message: "ID tidak valid" });

    const {
      title,
      price,
      type,
      status_legal,
      location,
      description,
      contact,
      owner,
      size,
      images,
    } = req.body;

    const safeImages = sanitizeImages(images);

    const result = await pool.query(
      `UPDATE properties
       SET title=$1, price=$2, type=$3, status_legal=$4, location=$5,
           description=$6, contact=$7, owner=$8, size=$9, images=$10,
           updated_at=NOW()
       WHERE id=$11
       RETURNING *`,
      [
        title,
        Number(price),
        type,
        status_legal,
        location,
        description || "",
        contact,
        owner || "",
        size || "",
        safeImages,
        id,
      ],
    );

    if (result.rowCount === 0)
      return res
        .status(404)
        .json({ success: false, message: "Properti tidak ditemukan" });

    res.json({
      success: true,
      message: "Properti berhasil diupdate",
      data: result.rows[0],
    });
  } catch (err) {
    console.error("[PROPERTY] updateProperty:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// DELETE /api/properties/:id  [admin only]
const deleteProperty = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id))
      return res
        .status(400)
        .json({ success: false, message: "ID tidak valid" });

    const result = await pool.query(
      "DELETE FROM properties WHERE id = $1 RETURNING id, title",
      [id],
    );
    if (result.rowCount === 0)
      return res
        .status(404)
        .json({ success: false, message: "Properti tidak ditemukan" });

    res.json({ success: true, message: "Properti berhasil dihapus" });
  } catch (err) {
    console.error("[PROPERTY] deleteProperty:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  getAllProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
};
