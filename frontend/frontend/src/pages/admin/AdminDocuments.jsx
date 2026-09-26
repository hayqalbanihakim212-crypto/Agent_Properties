import { useState } from "react";
import { generateDocument } from "../../services/api";
import FormGroup from "../../components/FormGroup";

const INITIAL = {
  docType: "sewa",
  pihak1: "",
  pihak2: "",
  propertyAddress: "",
  nominal: "",
};

export default function AdminDocuments({ token }) {
  const [form, setForm] = useState(INITIAL);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await generateDocument(token, form);
      setDraft(data.draft);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(draft).then(() => alert("Draf berhasil disalin."));
  };

  const handleDownload = () => {
    const blob = new Blob([draft], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = form.docType === "sewa" ? "perjanjian_sewa.txt" : "ppjb.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h2>Generator Draft Legal</h2>
          <p className="subtitle">
            Buat draft Surat Perjanjian Sewa atau PPJB secara otomatis.
          </p>
        </div>
      </div>

      <div className="page-form card">
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
              <small className="form-hint">
                Rp {Number(form.nominal).toLocaleString("id-ID")}
              </small>
            )}
          </FormGroup>

          {error && <div className="alert-error">{error}</div>}

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Membuat Draft..." : "Generate Draft Surat"}
            </button>
            {draft && (
              <button type="button" className="btn-secondary" onClick={() => { setDraft(""); setForm(INITIAL); }}>
                Buat Baru
              </button>
            )}
          </div>
        </form>

        {draft && (
          <div className="draft-result">
            <div className="draft-toolbar">
              <h4>Hasil Draft Dokumen</h4>
              <div className="draft-actions">
                <button className="btn-secondary" onClick={handleCopy}>
                  Salin
                </button>
                <button className="btn-secondary" onClick={handleDownload}>
                  Unduh .txt
                </button>
              </div>
            </div>
            <textarea className="document-output" readOnly value={draft} />
          </div>
        )}
      </div>
    </div>
  );
}
