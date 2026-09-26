import { useState, useEffect, useRef } from "react";
import { createProperty, updateProperty } from "../services/api";
import FormGroup from "../components/FormGroup";

const INITIAL_FORM = {
  title: "",
  price: "",
  type: "Jual",
  status_legal: "SHM (Sertifikat Hak Milik)",
  location: "Medan",
  description: "",
  contact: "",
  owner: "",
  size: "",
};

function buildForm(editData) {
  if (!editData) return INITIAL_FORM;
  return {
    title: editData.title || "",
    price: editData.price || "",
    type: editData.type || "Jual",
    status_legal: editData.status_legal || "SHM (Sertifikat Hak Milik)",
    location: editData.location || "Medan",
    description: editData.description || "",
    contact: editData.contact || "",
    owner: editData.owner || "",
    size: editData.size || "",
  };
}

export default function TambahListing({ onSuccess, editData, onCancelEdit }) {
  const [form, setForm] = useState(() => buildForm(editData));
  const [loading, setLoading] = useState(false);
  const isEditMode = !!editData;
  const prevEditId = useRef(editData?.id);

  useEffect(() => {
    const currentId = editData?.id ?? null;
    if (currentId !== prevEditId.current) {
      prevEditId.current = currentId;
      setForm(buildForm(editData));
    }
  }, [editData]);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEditMode) {
        await updateProperty(editData.id, form);
        alert("Properti berhasil diupdate!");
        onCancelEdit();
      } else {
        await createProperty(form);
        alert("Properti berhasil ditambahkan!");
        setForm(INITIAL_FORM);
      }
      onSuccess();
    } catch (err) {
      alert("Gagal: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-form card">
      <div className="form-header">
        <h2>{isEditMode ? "Edit Properti" : "Tambah Listing Baru"}</h2>
        <p className="subtitle">
          {isEditMode
            ? "Perbarui informasi properti di bawah ini."
            : "Masukkan detail properti dari pemilik tanah/rumah."}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <FormGroup label="Judul Listing" required>
          <input
            type="text"
            name="title"
            required
            value={form.title}
            onChange={handleChange}
            placeholder="Contoh: Rumah 2 Lantai Dekat Kampus USU"
          />
        </FormGroup>

        <div className="form-row">
          <FormGroup label="Harga (Rp)" required>
            <input
              type="number"
              name="price"
              required
              value={form.price}
              onChange={handleChange}
              placeholder="350000000"
            />
          </FormGroup>
          <FormGroup label="Luas Bangunan/Tanah">
            <input
              type="text"
              name="size"
              value={form.size}
              onChange={handleChange}
              placeholder="72m² / 120m²"
            />
          </FormGroup>
        </div>

        <div className="form-row">
          <FormGroup label="Tipe Penawaran" required>
            <select name="type" value={form.type} onChange={handleChange}>
              <option value="Jual">Jual</option>
              <option value="Sewa (Per Tahun)">Sewa (Per Tahun)</option>
              <option value="Sewa (Per Bulan)">Sewa (Per Bulan)</option>
            </select>
          </FormGroup>
          <FormGroup label="Status Legalitas" required>
            <select
              name="status_legal"
              value={form.status_legal}
              onChange={handleChange}
            >
              <option value="SHM (Sertifikat Hak Milik)">
                SHM (Sertifikat Hak Milik)
              </option>
              <option value="HGB (Hak Guna Bangunan)">
                HGB (Hak Guna Bangunan)
              </option>
              <option value="AJB (Akta Jual Beli)">AJB (Akta Jual Beli)</option>
              <option value="SHGB (Sertifikat HGB)">
                SHGB (Sertifikat HGB)
              </option>
              <option value="Girik / Letter C">Girik / Letter C</option>
            </select>
          </FormGroup>
        </div>

        <FormGroup label="Lokasi / Kota" required>
          <input
            type="text"
            name="location"
            value={form.location}
            onChange={handleChange}
            placeholder="Medan, Sumatera Utara"
          />
        </FormGroup>

        <FormGroup label="Nama Pemilik">
          <input
            type="text"
            name="owner"
            value={form.owner}
            onChange={handleChange}
            placeholder="Nama lengkap pemilik"
          />
        </FormGroup>

        <FormGroup label="Deskripsi Properti">
          <textarea
            name="description"
            rows="3"
            value={form.description}
            onChange={handleChange}
            placeholder="Deskripsikan kondisi dan fasilitas properti..."
          />
        </FormGroup>

        <FormGroup label="Nomor Kontak Pemilik / Agen" required>
          <input
            type="text"
            name="contact"
            value={form.contact}
            onChange={handleChange}
            placeholder="0812-3456-7890"
          />
        </FormGroup>

        <div className="form-actions">
          {isEditMode && (
            <button
              type="button"
              className="btn-secondary"
              onClick={onCancelEdit}
            >
              Batal
            </button>
          )}
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading
              ? "Menyimpan..."
              : isEditMode
                ? "Update Properti"
                : "Simpan Listing"}
          </button>
        </div>
      </form>
    </div>
  );
}
