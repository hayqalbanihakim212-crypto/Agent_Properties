const pool = require("../config/db");

// POST /api/documents/generate  [admin only]
const generateDocument = async (req, res) => {
  const { docType, pihak1, pihak2, propertyAddress, nominal } = req.body;

  const dateStr = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const nominalFormatted = Number(nominal).toLocaleString("id-ID");
  let draftText = "";

  if (docType === "sewa") {
    draftText = `
SURAT PERJANJIAN SEWA MENYEWA PROPERTI
=======================================

Pada hari ini, ${dateStr}, kami yang bertanda tangan di bawah ini:

1. PIHAK PERTAMA (Pemilik)  : ${pihak1}
2. PIHAK KEDUA   (Penyewa)  : ${pihak2}

Telah sepakat untuk mengadakan Perjanjian Sewa Menyewa dengan ketentuan sebagai berikut:

PASAL 1 - OBJEK SEWA
Pihak Pertama menyewakan properti yang berlokasi di:
${propertyAddress}
kepada Pihak Kedua untuk dipergunakan sebagai tempat tinggal atau usaha.

PASAL 2 - HARGA DAN JANGKA WAKTU SEWA
Harga sewa disepakati sebesar Rp ${nominalFormatted} per tahun.
Jangka waktu sewa dihitung sejak tanggal penandatanganan perjanjian ini.

PASAL 3 - KEWAJIBAN PENYEWA
- Membayar sewa tepat waktu sesuai kesepakatan.
- Menjaga kebersihan dan tidak merusak fasilitas.
- Tidak mengalihkan sewa kepada pihak lain tanpa izin tertulis dari Pihak Pertama.

PASAL 4 - HAK DAN KEWAJIBAN PEMILIK
- Menyerahkan objek sewa dalam kondisi layak huni.
- Tidak mengusir Pihak Kedua selama masa sewa masih berlaku.

PASAL 5 - PENYELESAIAN SENGKETA
Apabila terjadi perselisihan, kedua belah pihak sepakat untuk menyelesaikannya
secara musyawarah mufakat terlebih dahulu. Apabila tidak tercapai kesepakatan,
akan diselesaikan melalui Pengadilan Negeri setempat.

Demikian surat perjanjian ini dibuat dengan sadar, tanpa paksaan, dan dalam
keadaan sehat jasmani maupun rohani.

Medan, ${dateStr}

PIHAK PERTAMA                         PIHAK KEDUA


(${pihak1})                           (${pihak2})
`.trim();
  } else {
    draftText = `
PERJANJIAN PENGIKATAN JUAL BELI (PPJB)
=======================================

Pada hari ini, ${dateStr}:

PIHAK PENJUAL  : ${pihak1}
PIHAK PEMBELI  : ${pihak2}

Dengan ini menyatakan bahwa telah terjadi kesepakatan Jual Beli atas:

OBJEK JUAL BELI
Properti yang berlokasi di: ${propertyAddress}

HARGA DAN PEMBAYARAN
Harga jual beli disepakati sebesar Rp ${nominalFormatted}
(${terbilang(Number(nominal))} rupiah)

PASAL 1 - JAMINAN PENJUAL
Penjual menjamin bahwa objek tanah atau bangunan tersebut:
- Bebas dari sengketa hukum dengan pihak manapun.
- Memiliki legalitas yang sah dan tidak dalam kondisi dijaminkan.
- Bukan merupakan tanah yang dikuasai atau milik negara.

PASAL 2 - KEWAJIBAN PEMBELI
- Membayar harga sesuai kesepakatan pada waktu yang telah ditentukan.
- Mengurus balik nama sertifikat atas biaya sendiri.

PASAL 3 - PENYELESAIAN SENGKETA
Apabila terjadi perselisihan, kedua belah pihak sepakat menyelesaikannya
melalui jalur musyawarah, dan jika tidak tercapai kesepakatan, melalui
Pengadilan Negeri setempat.

Demikian perjanjian ini dibuat dan ditandatangani oleh kedua belah pihak
dalam keadaan sadar dan tanpa tekanan dari pihak manapun.

Medan, ${dateStr}

PIHAK PENJUAL                         PIHAK PEMBELI


(${pihak1})                           (${pihak2})
`.trim();
  }

  try {
    // Simpan ke database dengan referensi admin yang membuat
    await pool.query(
      `INSERT INTO documents (doc_type, pihak1, pihak2, property_address, nominal, draft_text, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [docType, pihak1, pihak2, propertyAddress, Number(nominal), draftText, req.user.id]
    );
  } catch (err) {
    console.error("[DOCUMENT] Gagal menyimpan ke DB:", err.message);
    // Tetap kembalikan draft meski penyimpanan gagal
  }

  res.json({ success: true, draft: draftText });
};

// GET /api/documents  [admin only] - riwayat dokumen
const getDocuments = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT d.id, d.doc_type, d.pihak1, d.pihak2, d.property_address,
              d.nominal, d.created_at, u.username as created_by
       FROM documents d
       LEFT JOIN users u ON d.created_by = u.id
       ORDER BY d.created_at DESC
       LIMIT 100`
    );
    res.json({ success: true, total: result.rowCount, data: result.rows });
  } catch (err) {
    console.error("[DOCUMENT] getDocuments:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Fungsi terbilang (bilangan ke kata Bahasa Indonesia)
function terbilang(angka) {
  if (angka === 0) return "nol";
  if (angka < 0) return "minus " + terbilang(-angka);

  const satuan = ["", "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan", "sembilan", "sepuluh", "sebelas"];
  if (angka < 12) return satuan[angka];
  if (angka < 20) return satuan[angka - 10] + " belas";
  if (angka < 100) return satuan[Math.floor(angka / 10)] + " puluh" + (angka % 10 ? " " + satuan[angka % 10] : "");
  if (angka < 200) return "seratus" + (angka - 100 ? " " + terbilang(angka - 100) : "");
  if (angka < 1000) return satuan[Math.floor(angka / 100)] + " ratus" + (angka % 100 ? " " + terbilang(angka % 100) : "");
  if (angka < 2000) return "seribu" + (angka - 1000 ? " " + terbilang(angka - 1000) : "");
  if (angka < 1000000) return terbilang(Math.floor(angka / 1000)) + " ribu" + (angka % 1000 ? " " + terbilang(angka % 1000) : "");
  if (angka < 1000000000) return terbilang(Math.floor(angka / 1000000)) + " juta" + (angka % 1000000 ? " " + terbilang(angka % 1000000) : "");
  return terbilang(Math.floor(angka / 1000000000)) + " miliar" + (angka % 1000000000 ? " " + terbilang(angka % 1000000000) : "");
}

module.exports = { generateDocument, getDocuments };
