import { useState, useEffect, useRef, useCallback } from "react";
import {
  getProperties,
  createProperty,
  updateProperty,
  deleteProperty,
} from "../../services/api";
import FormGroup from "../../components/FormGroup";

const CLOUDINARY_CLOUD = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const MAX_IMAGES = 5;

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
  images: [],
};

function buildForm(d) {
  if (!d) return INITIAL_FORM;
  return {
    title: d.title || "",
    price: d.price || "",
    type: d.type || "Jual",
    status_legal: d.status_legal || "SHM (Sertifikat Hak Milik)",
    location: d.location || "Medan",
    description: d.description || "",
    contact: d.contact || "",
    owner: d.owner || "",
    size: d.size || "",
    images: Array.isArray(d.images) ? d.images : [],
  };
}

/* ── Komponen upload foto ke Cloudinary ─────────────────── */
function ImageUploader({ images, onChange }) {
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const remaining = MAX_IMAGES - images.length;
    if (remaining <= 0) {
      alert(`Maksimal ${MAX_IMAGES} foto.`);
      return;
    }

    const toUpload = files.slice(0, remaining);
    setUploading(true);

    try {
      const uploaded = await Promise.all(
        toUpload.map(async (file) => {
          const fd = new FormData();
          fd.append("file", file);
          fd.append("upload_preset", UPLOAD_PRESET);
          fd.append("folder", "properties");

          const res = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`,
            { method: "POST", body: fd },
          );
          const data = await res.json();
          if (!data.secure_url)
            throw new Error(data.error?.message || "Upload gagal");
          return data.secure_url;
        }),
      );
      onChange([...images, ...uploaded]);
    } catch (err) {
      alert("Gagal upload foto: " + err.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const removeImage = (idx) => onChange(images.filter((_, i) => i !== idx));

  return (
    <div className="image-uploader">
      <label className="form-label">
        Foto Properti
        <span className="form-hint-inline">
          {" "}
          (upload langsung, maks {MAX_IMAGES})
        </span>
      </label>

      {images.length > 0 && (
        <div className="image-preview-grid">
          {images.map((url, i) => (
            <div key={i} className="image-thumb-wrap">
              <img
                src={url}
                alt={`Foto ${i + 1}`}
                className="image-thumb"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
              <button
                type="button"
                className="image-remove-btn"
                onClick={() => removeImage(i)}
                title="Hapus foto"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {images.length < MAX_IMAGES && (
        <label className={`upload-btn${uploading ? " uploading" : ""}`}>
          {uploading
            ? `Mengupload...`
            : `+ Pilih Foto (${images.length}/${MAX_IMAGES})`}
          <input
            type="file"
            accept="image/*"
            multiple
            hidden
            disabled={uploading}
            onChange={handleFile}
          />
        </label>
      )}
    </div>
  );
}

/* ── Form tambah/edit ────────────────────────────────────── */
function PropertyForm({ editData, onSuccess, onCancel, token }) {
  const [form, setForm] = useState(() => buildForm(editData));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const isEdit = !!editData;
  const prevId = useRef(editData?.id);

  useEffect(() => {
    if (editData?.id !== prevId.current) {
      prevId.current = editData?.id;
      setForm(buildForm(editData));
    }
  }, [editData]);

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isEdit) {
        await updateProperty(token, editData.id, form);
      } else {
        await createProperty(token, form);
      }
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-form card">
      <div className="form-header">
        <h2>{isEdit ? "Edit Properti" : "Tambah Listing Baru"}</h2>
        <p className="subtitle">
          {isEdit
            ? "Perbarui informasi properti."
            : "Isi detail properti dari pemilik."}
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
            {form.price && (
              <small className="form-hint">
                Rp {Number(form.price).toLocaleString("id-ID")}
              </small>
            )}
          </FormGroup>
          <FormGroup label="Luas Bangunan / Tanah">
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

        <div className="form-row">
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
        </div>

        <FormGroup label="Deskripsi Properti">
          <textarea
            name="description"
            rows="3"
            value={form.description}
            onChange={handleChange}
            placeholder="Kondisi, fasilitas, dan informasi lain..."
          />
        </FormGroup>

        <FormGroup label="Nomor Kontak" required>
          <input
            type="text"
            name="contact"
            value={form.contact}
            onChange={handleChange}
            placeholder="0812-3456-7890"
          />
        </FormGroup>

        <ImageUploader
          images={form.images}
          onChange={(imgs) => setForm((p) => ({ ...p, images: imgs }))}
        />

        {error && <div className="alert-error">{error}</div>}

        <div className="form-actions">
          {isEdit && (
            <button type="button" className="btn-secondary" onClick={onCancel}>
              Batal
            </button>
          )}
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading
              ? "Menyimpan..."
              : isEdit
                ? "Simpan Perubahan"
                : "Tambah Listing"}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ── Tabel properti ──────────────────────────────────────── */
function PropertiesTable({ properties, onEdit, onDelete }) {
  if (properties.length === 0)
    return (
      <div className="empty-state">
        <p>Belum ada properti.</p>
        <small>Tambahkan listing pertama menggunakan form di atas.</small>
      </div>
    );

  return (
    <div className="table-wrap">
      <table className="req-table">
        <thead>
          <tr>
            <th>Foto</th>
            <th>Judul</th>
            <th>Harga</th>
            <th>Tipe</th>
            <th>Lokasi</th>
            <th>Legalitas</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {properties.map((p) => {
            const firstImg = Array.isArray(p.images) && p.images[0];
            return (
              <tr key={p.id}>
                <td>
                  {firstImg ? (
                    <img
                      src={firstImg}
                      alt={p.title}
                      className="table-thumb"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="table-thumb-empty">—</div>
                  )}
                </td>
                <td>
                  <div className="req-nama">{p.title}</div>
                  {p.owner && <div className="req-telepon">{p.owner}</div>}
                </td>
                <td>Rp {Number(p.price).toLocaleString("id-ID")}</td>
                <td>
                  <span className="jenis-badge">{p.type}</span>
                </td>
                <td>{p.location}</td>
                <td>{p.status_legal}</td>
                <td>
                  <div className="req-actions">
                    <button className="btn-edit-sm" onClick={() => onEdit(p)}>
                      Edit
                    </button>
                    <button
                      className="btn-delete-sm"
                      onClick={() => onDelete(p.id, p.title)}
                    >
                      Hapus
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ── Halaman utama ───────────────────────────────────────── */
export default function AdminProperties({ token }) {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editData, setEditData] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getProperties();
      setProperties(data.data || []);
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSuccess = () => {
    fetchData();
    setShowForm(false);
    setEditData(null);
  };
  const handleEdit = (item) => {
    setEditData(item);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const handleDelete = async (id, title) => {
    if (!window.confirm(`Hapus properti "${title}"?`)) return;
    try {
      await deleteProperty(token, id);
      setProperties((p) => p.filter((x) => x.id !== id));
    } catch (err) {
      alert("Gagal: " + err.message);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h2>Kelola Properti</h2>
          <p className="subtitle">
            {loading ? "Memuat..." : `${properties.length} properti terdaftar`}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            className="btn-refresh"
            onClick={fetchData}
            disabled={loading}
          >
            Perbarui
          </button>
          {!showForm && (
            <button
              className="btn-primary-sm"
              onClick={() => {
                setEditData(null);
                setShowForm(true);
              }}
            >
              + Tambah Listing
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <div style={{ marginBottom: 28 }}>
          <PropertyForm
            editData={editData}
            token={token}
            onSuccess={handleSuccess}
            onCancel={() => {
              setShowForm(false);
              setEditData(null);
            }}
          />
        </div>
      )}

      {loading ? (
        <div className="loading-text">Memuat data...</div>
      ) : (
        <PropertiesTable
          properties={properties}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
