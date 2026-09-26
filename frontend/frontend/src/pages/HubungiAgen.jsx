import { useState } from "react";
import { submitRequest } from "../services/api";
import FormGroup from "../components/FormGroup";

const INITIAL = {
  nama: "",
  telepon: "",
  email: "",
  jenis_request: "tanya",
  pesan: "",
  property_id: "",
};

export default function HubungiAgen({ properties = [], prefillProperty = null }) {
  const [form, setForm] = useState(() => ({
    ...INITIAL,
    property_id: prefillProperty?.id?.toString() || "",
    pesan: prefillProperty
      ? `Saya tertarik dengan properti "${prefillProperty.title}" di ${prefillProperty.location}. Mohon informasi lebih lanjut.`
      : "",
  }));
  const [loading, setLoading] = useState(false);
  const [sukses, setSukses] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await submitRequest(form);
      setSukses(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (sukses) {
    return (
      <div className="page-form card">
        <div className="sukses-box">
          <div className="sukses-icon">&#10003;</div>
          <h3>Permintaan Terkirim</h3>
          <p>
            Terima kasih, <strong>{form.nama}</strong>. Agen kami akan
            menghubungi Anda melalui WhatsApp dalam waktu dekat.
          </p>
          <button
            className="btn-primary"
            onClick={() => {
              setSukses(false);
              setForm(INITIAL);
            }}
          >
            Kirim Permintaan Lain
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-form card">
      <div className="form-header">
        <h2>Hubungi Agen</h2>
        <p className="subtitle">
          Isi formulir di bawah ini. Agen kami akan menghubungi Anda via
          WhatsApp segera setelah menerima permintaan.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <FormGroup label="Nama Lengkap" required>
            <input
              type="text"
              name="nama"
              required
              value={form.nama}
              onChange={handleChange}
              placeholder="Nama Anda"
            />
          </FormGroup>
          <FormGroup
            label="Nomor WhatsApp"
            required
            hint="Contoh: 0812-3456-7890"
          >
            <input
              type="tel"
              name="telepon"
              required
              value={form.telepon}
              onChange={handleChange}
              placeholder="0812-3456-7890"
            />
          </FormGroup>
        </div>

        <div className="form-row">
          <FormGroup label="Email">
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="email@contoh.com"
            />
          </FormGroup>
          <FormGroup label="Jenis Permintaan" required>
            <select
              name="jenis_request"
              value={form.jenis_request}
              onChange={handleChange}
            >
              <option value="tanya">Pertanyaan Umum</option>
              <option value="survei">Jadwal Survei Properti</option>
              <option value="penawaran">Penawaran Harga</option>
              <option value="sewa">Permohonan Sewa</option>
              <option value="beli">Permohonan Pembelian</option>
            </select>
          </FormGroup>
        </div>

        {properties.length > 0 && (
          <FormGroup label="Properti yang Diminati">
            <select
              name="property_id"
              value={form.property_id}
              onChange={handleChange}
            >
              <option value="">-- Tidak spesifik --</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} — {p.location}
                </option>
              ))}
            </select>
          </FormGroup>
        )}

        <FormGroup label="Pesan" required>
          <textarea
            name="pesan"
            rows="4"
            required
            value={form.pesan}
            onChange={handleChange}
            placeholder="Tuliskan kebutuhan atau pertanyaan Anda..."
          />
        </FormGroup>

        {error && <div className="alert-error">{error}</div>}

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Mengirim..." : "Kirim Permintaan"}
          </button>
        </div>
      </form>
    </div>
  );
}
