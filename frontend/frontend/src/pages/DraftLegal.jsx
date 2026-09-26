import { useState } from "react";
import { generateDocument } from "../services/api";
import FormGroup from "../components/FormGroup";

const INITIAL_FORM = {
  docType: "sewa",
  pihak1: "",
  pihak2: "",
  propertyAddress: "",
  nominal: "",
};

export default function DraftLegal() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await generateDocument(form);
      setDraft(data.draft);
    } catch (err) {
      alert("❌ Gagal generate dokumen: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(draft);
    alert("✅ Draf berhasil disalin!");
  };

  const handleDownload = () => {
    const blob = new Blob([draft], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const fileName =
      form.docType === "sewa" ? "perjanjian_sewa.txt" : "ppjb.txt";
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page-form card">
      <div className="form-header">
        <h2>📝 Generator Draf Dokumen Hukum</h2>
        <p className="subtitle">
          Buat draf Surat Perjanjian Sewa atau PPJB otomatis untuk klien Anda.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <FormGroup label="Jenis Dokumen" required>
          <select name="docType" value={form.docType} onChange={handleChange}>
            <option value="sewa">Surat Perjanjian Sewa Menyewa</option>
            <option value="ppjb">Perjanjian Pengikatan Jual Beli (PPJB)</option>
          </select>
        </FormGroup>

        <div className="form-row">
          <FormGroup
            label={form.docType === "sewa" ? "Nama Pemilik" : "Nama Penjual"}
            required
          >
            <input
              type="text"
              name="pihak1"
              required
              value={form.pihak1}
              onChange={handleChange}
              placeholder="Nama Lengkap Pihak I"
            />
          </FormGroup>
          <FormGroup
            label={form.docType === "sewa" ? "Nama Penyewa" : "Nama Pembeli"}
            required
          >
            <input
              type="text"
              name="pihak2"
              required
              value={form.pihak2}
              onChange={handleChange}
              placeholder="Nama Lengkap Pihak II"
            />
          </FormGroup>
        </div>

        <FormGroup label="Alamat Lengkap Properti" required>
          <input
            type="text"
            name="propertyAddress"
            required
            value={form.propertyAddress}
            onChange={handleChange}
            placeholder="Jl. Gatot Subroto No. 45, Medan Baru"
          />
        </FormGroup>

        <FormGroup label="Nominal Transaksi (Rp)" required>
          <input
            type="number"
            name="nominal"
            required
            value={form.nominal}
            onChange={handleChange}
            placeholder="50000000"
          />
          {form.nominal && (
            <small className="price-preview">
              = Rp {Number(form.nominal).toLocaleString("id-ID")}
            </small>
          )}
        </FormGroup>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Membuat Draf..." : "⚡ Generate Draf Surat"}
        </button>
      </form>

      {draft && (
        <div className="draft-result">
          <div className="draft-toolbar">
            <h4>Hasil Draf Dokumen</h4>
            <div className="draft-actions">
              <button className="btn-secondary" onClick={handleCopy}>
                📋 Salin
              </button>
              <button className="btn-secondary" onClick={handleDownload}>
                ⬇️ Download
              </button>
            </div>
          </div>
          <textarea className="document-output" readOnly value={draft} />
        </div>
      )}
    </div>
  );
}
