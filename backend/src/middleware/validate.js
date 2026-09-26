/**
 * Sanitasi string: hapus karakter berbahaya untuk mencegah XSS / SQL-injection level aplikasi.
 * (Parameterized query di controller adalah perlindungan utama SQL injection.)
 */
const sanitizeString = (val) => {
  if (typeof val !== "string") return val;
  return val
    .trim()
    .replace(/<[^>]*>/g, "") // strip HTML tags
    .slice(0, 2000);         // batas panjang
};

/**
 * Sanitasi rekursif untuk objek req.body
 */
const sanitizeBody = (req, res, next) => {
  if (req.body && typeof req.body === "object") {
    for (const key of Object.keys(req.body)) {
      if (typeof req.body[key] === "string") {
        req.body[key] = sanitizeString(req.body[key]);
      }
    }
  }
  next();
};

/**
 * Validasi property body
 */
const validateProperty = (req, res, next) => {
  const { title, price, type, status_legal, location, contact } = req.body;
  const errors = [];

  if (!title || title.length < 5)
    errors.push("Judul minimal 5 karakter");
  if (!price || isNaN(Number(price)) || Number(price) <= 0)
    errors.push("Harga harus angka positif");
  if (!["Jual", "Sewa (Per Tahun)", "Sewa (Per Bulan)"].includes(type))
    errors.push("Tipe penawaran tidak valid");
  if (
    !["SHM (Sertifikat Hak Milik)", "HGB (Hak Guna Bangunan)", "AJB (Akta Jual Beli)", "SHGB (Sertifikat HGB)", "Girik / Letter C"].includes(status_legal)
  )
    errors.push("Status legalitas tidak valid");
  if (!location || location.length < 2)
    errors.push("Lokasi wajib diisi");
  if (!contact || contact.length < 5)
    errors.push("Kontak wajib diisi");

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join("; ") });
  }
  next();
};

/**
 * Validasi document body
 */
const validateDocument = (req, res, next) => {
  const { docType, pihak1, pihak2, propertyAddress, nominal } = req.body;
  const errors = [];

  if (!["sewa", "ppjb"].includes(docType))
    errors.push("Jenis dokumen tidak valid");
  if (!pihak1 || pihak1.length < 3)
    errors.push("Nama Pihak I minimal 3 karakter");
  if (!pihak2 || pihak2.length < 3)
    errors.push("Nama Pihak II minimal 3 karakter");
  if (!propertyAddress || propertyAddress.length < 10)
    errors.push("Alamat properti minimal 10 karakter");
  if (!nominal || isNaN(Number(nominal)) || Number(nominal) <= 0)
    errors.push("Nominal harus angka positif");

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join("; ") });
  }
  next();
};

module.exports = { sanitizeBody, validateProperty, validateDocument };
