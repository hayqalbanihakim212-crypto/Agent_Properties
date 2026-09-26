/**
 * Generator template pesan WhatsApp untuk agen properti.
 * Semua fungsi mengembalikan URL wa.me yang siap dibuka.
 */

const formatRupiah = (n) => `Rp ${Number(n).toLocaleString("id-ID")}`;

const buildWaUrl = (phone, message) => {
  const cleaned = phone.replace(/[\s\-().]/g, "").replace(/^0/, "62");
  const encoded = encodeURIComponent(message.trim());
  return `https://wa.me/${cleaned}?text=${encoded}`;
};

// --- Template untuk menjawab request klien ---

export const waBalasRequest = ({ request, property }) => {
  const prop = property
    ? `\n\nProperti yang Anda tanyakan:\n- ${property.title}\n- Lokasi: ${property.location}\n- Harga: ${formatRupiah(property.price)}\n- Legalitas: ${property.status_legal}`
    : "";

  const msg = `Halo Bapak/Ibu *${request.nama}*,

Saya dari Tim Agen PropTech menghubungi Anda terkait permintaan *${labelJenis(request.jenis_request)}* yang Anda sampaikan.${prop}

Kami siap membantu Anda. Kapan waktu yang tepat untuk berdiskusi lebih lanjut?

Terima kasih.
*PropTech & Agen Hukum*`;

  return buildWaUrl(request.telepon, msg);
};

// --- Template konfirmasi survei ---

export const waKonfirmasiSurvei = ({ request, property, tanggal, jam }) => {
  const prop = property
    ? `*${property.title}*\nLokasi: ${property.location}`
    : "properti yang Anda minati";

  const msg = `Halo Bapak/Ibu *${request.nama}*,

Kami mengkonfirmasi jadwal survei properti berikut:

Properti : ${prop}
Tanggal  : *${tanggal}*
Pukul    : *${jam} WIB*

Mohon hadir tepat waktu. Jika ada kendala, segera informasikan kepada kami.

*PropTech & Agen Hukum*
Tim Survei Properti`;

  return buildWaUrl(request.telepon, msg);
};

// --- Template penawaran harga ---

export const waPenawaran = ({ request, property, hargaTawar }) => {
  const msg = `Halo Bapak/Ibu *${request.nama}*,

Berikut informasi penawaran untuk properti yang Anda minati:

Properti  : *${property.title}*
Lokasi    : ${property.location}
Legalitas : ${property.status_legal}
Harga List: ${formatRupiah(property.price)}${hargaTawar ? `\nHarga Nego: *${formatRupiah(hargaTawar)}*` : ""}

Penawaran ini berlaku selama 3 hari kerja. Apakah Anda berminat untuk melanjutkan ke tahap berikutnya?

*PropTech & Agen Hukum*`;

  return buildWaUrl(request.telepon, msg);
};

// --- Template update status request ---

export const waUpdateStatus = ({ request, status, catatan }) => {
  const statusLabel = {
    diproses: "sedang kami proses",
    selesai: "telah selesai ditangani",
    ditolak: "tidak dapat kami proses saat ini",
  }[status] || status;

  const msg = `Halo Bapak/Ibu *${request.nama}*,

Kami informasikan bahwa permintaan *${labelJenis(request.jenis_request)}* Anda ${statusLabel}.${catatan ? `\n\nKeterangan: ${catatan}` : ""}

Jika ada pertanyaan lebih lanjut, jangan ragu menghubungi kami kembali.

*PropTech & Agen Hukum*`;

  return buildWaUrl(request.telepon, msg);
};

// --- Template follow-up umum ---

export const waFollowUp = ({ request }) => {
  const msg = `Halo Bapak/Ibu *${request.nama}*,

Kami dari Tim PropTech ingin menindaklanjuti permintaan ${labelJenis(request.jenis_request)} yang Anda sampaikan beberapa waktu lalu.

Apakah Anda masih membutuhkan bantuan kami? Kami siap membantu proses selanjutnya.

*PropTech & Agen Hukum*
Hubungi kami kapan saja.`;

  return buildWaUrl(request.telepon, msg);
};

// Helper
export const labelJenis = (jenis) => ({
  tanya: "Pertanyaan Properti",
  survei: "Jadwal Survei",
  penawaran: "Penawaran Harga",
  sewa: "Permohonan Sewa",
  beli: "Permohonan Pembelian",
}[jenis] || jenis);

export const labelStatus = (status) => ({
  baru: "Baru",
  diproses: "Diproses",
  selesai: "Selesai",
  ditolak: "Ditolak",
}[status] || status);

export const badgeStatus = (status) => ({
  baru: "status-baru",
  diproses: "status-diproses",
  selesai: "status-selesai",
  ditolak: "status-ditolak",
}[status] || "");
