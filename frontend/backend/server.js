const express = require("express");
const cors = require("cors");
require("dotenv").config();

const propertyRoutes = require("./src/routes/properties");
const documentRoutes = require("./src/routes/documents");
const authRoutes = require("./src/routes/auth");
const requestRoutes = require("./src/routes/requests");

const app = express();
const PORT = process.env.PORT || 5000;

const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
app.use(
  cors({
    origin: [frontendUrl, "http://127.0.0.1:5173", "http://localhost:3000", "http://127.0.0.1:3000"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: false }));

app.use("/api/properties", propertyRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/requests", requestRoutes);

app.get("/", (req, res) => {
  res.json({ status: "OK", message: "PropTech API aktif", version: "1.0.0" });
});

app.use((req, res) => {
  res
    .status(404)
    .json({
      success: false,
      message: `Route ${req.originalUrl} tidak ditemukan`,
    });
});

app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(500).json({ success: false, message: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
