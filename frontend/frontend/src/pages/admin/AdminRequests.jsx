import { useState, useEffect, useCallback } from "react";
import {
  getRequests,
  updateRequestStatus,
  deleteRequest,
} from "../../services/api";
import {
  waBalasRequest,
  waKonfirmasiSurvei,
  waPenawaran,
  waFollowUp,
  waUpdateStatus,
  labelJenis,
  labelStatus,
  badgeStatus,
} from "../../services/whatsapp";

const STATUS_OPTIONS = ["baru", "diproses", "selesai", "ditolak"];

function WaPanel({ request, property, onClose }) {
  const [mode, setMode] = useState("balas");
  const [tanggal, setTanggal] = useState("");
  const [jam, setJam] = useState("10.00");
  const [hargaTawar, setHargaTawar] = useState("");
  const [newStatus, setNewStatus] = useState("diproses");
  const [catatan, setCatatan] = useState("");

  const generate = () => {
    switch (mode) {
      case "balas":
        return waBalasRequest({ request, property });
      case "survei":
        return waKonfirmasiSurvei({ request, property, tanggal, jam });
      case "penawaran":
        return waPenawaran({ request, property, hargaTawar });
      case "status":
        return waUpdateStatus({ request, status: newStatus, catatan });
      case "followup":
        return waFollowUp({ request });
      default:
        return "#";
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Kirim Pesan WhatsApp</h3>
          <button className="modal-close" onClick={onClose}>
            &#215;
          </button>
        </div>

        <div className="modal-body">
          <div className="wa-mode-tabs">
            {[
              { key: "balas", label: "Balas Request" },
              { key: "survei", label: "Konfirmasi Survei" },
              { key: "penawaran", label: "Kirim Penawaran" },
              { key: "status", label: "Update Status" },
              { key: "followup", label: "Follow Up" },
            ].map((t) => (
              <button
                key={t.key}
                className={`wa-tab${mode === t.key ? " active" : ""}`}
                onClick={() => setMode(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="wa-form">
            {mode === "survei" && (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label>Tanggal Survei</label>
                    <input
                      type="date"
                      value={tanggal}
                      onChange={(e) => setTanggal(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Pukul (WIB)</label>
                    <input
                      type="text"
                      value={jam}
                      onChange={(e) => setJam(e.target.value)}
                      placeholder="10.00"
                    />
                  </div>
                </div>
              </>
            )}

            {mode === "penawaran" && (
              <div className="form-group">
                <label>Harga Tawaran (opsional)</label>
                <input
                  type="number"
                  value={hargaTawar}
                  onChange={(e) => setHargaTawar(e.target.value)}
                  placeholder="Kosongkan jika sesuai harga list"
                />
                {hargaTawar && (
                  <small className="form-hint">
                    Rp {Number(hargaTawar).toLocaleString("id-ID")}
                  </small>
                )}
              </div>
            )}

            {mode === "status" && (
              <>
                <div className="form-group">
                  <label>Status Baru</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                  >
                    {STATUS_OPTIONS.slice(1).map((s) => (
                      <option key={s} value={s}>
                        {labelStatus(s)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Keterangan (opsional)</label>
                  <textarea
                    rows="2"
                    value={catatan}
                    onChange={(e) => setCatatan(e.target.value)}
                  />
                </div>
              </>
            )}

            <div className="wa-target">
              <span className="wa-target-label">Tujuan:</span>
              <span className="wa-target-name">{request.nama}</span>
              <span className="wa-target-phone">{request.telepon}</span>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Batal
          </button>
          <a
            className="btn-wa"
            href={generate()}
            target="_blank"
            rel="noopener noreferrer"
          >
            Buka WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  return (
    <span className={`status-badge ${badgeStatus(status)}`}>
      {labelStatus(status)}
    </span>
  );
}

function RequestRow({ req, onStatusChange, onDelete, onOpenWa }) {
  const [open, setOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  return (
    <>
      <tr className={`req-row${open ? " req-row-open" : ""}`}>
        <td>
          <button className="btn-toggle" onClick={() => setOpen(!open)}>
            {open ? "&#9650;" : "&#9660;"}
          </button>
        </td>
        <td>
          <div className="req-nama">{req.nama}</div>
          <div className="req-telepon">{req.telepon}</div>
        </td>
        <td>
          <span className="jenis-badge">{labelJenis(req.jenis_request)}</span>
        </td>
        <td>{req.property_title || <span className="text-muted">—</span>}</td>
        <td>
          <StatusBadge status={req.status} />
        </td>
        <td className="req-date">
          {new Date(req.created_at).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </td>
        <td>
          <div className="req-actions">
            <button
              className="btn-wa-sm"
              onClick={() => onOpenWa(req)}
              title="Kirim pesan WhatsApp"
            >
              WA
            </button>
          </div>
        </td>
      </tr>

      {open && (
        <tr className="req-detail-row">
          <td colSpan="7">
            <div className="req-detail">
              <div className="req-detail-pesan">
                <strong>Pesan:</strong>
                <p>{req.pesan}</p>
              </div>

              {req.catatan_admin && (
                <div className="req-detail-catatan">
                  <strong>Catatan Admin:</strong>
                  <p>{req.catatan_admin}</p>
                </div>
              )}

              <div className="req-detail-actions">
                <div className="status-update-group">
                  <label>Ubah status:</label>
                  <select
                    value={req.status}
                    disabled={updatingStatus}
                    onChange={async (e) => {
                      setUpdatingStatus(true);
                      await onStatusChange(req.id, e.target.value);
                      setUpdatingStatus(false);
                    }}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {labelStatus(s)}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  className="btn-delete-sm"
                  onClick={() => onDelete(req.id, req.nama)}
                >
                  Hapus
                </button>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function AdminRequests({ token }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterJenis, setFilterJenis] = useState("");
  const [waTarget, setWaTarget] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const filters = {};
      if (filterStatus) filters.status = filterStatus;
      if (filterJenis) filters.jenis_request = filterJenis;
      const data = await getRequests(token, filters);
      setRequests(data.data || []);
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, filterStatus, filterJenis]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const handleStatusChange = async (id, status) => {
    try {
      await updateRequestStatus(token, id, status);
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r)),
      );
    } catch (err) {
      alert("Gagal mengubah status: " + err.message);
    }
  };

  const handleDelete = async (id, nama) => {
    if (!window.confirm(`Hapus request dari ${nama}?`)) return;
    try {
      await deleteRequest(token, id);
      setRequests((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      alert("Gagal menghapus: " + err.message);
    }
  };

  const counts = requests.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h2>Permintaan Klien</h2>
          <p className="subtitle">
            {loading ? "Memuat..." : `${requests.length} permintaan`}
            {counts.baru ? ` — ${counts.baru} baru` : ""}
          </p>
        </div>
        <button className="btn-refresh" onClick={fetch} disabled={loading}>
          Perbarui
        </button>
      </div>

      <div className="stat-row">
        {STATUS_OPTIONS.map((s) => (
          <div key={s} className={`stat-card stat-${s}`}>
            <span className="stat-num">{counts[s] || 0}</span>
            <span className="stat-label">{labelStatus(s)}</span>
          </div>
        ))}
      </div>

      <div className="filter-bar">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="filter-select"
        >
          <option value="">Semua Status</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {labelStatus(s)}
            </option>
          ))}
        </select>
        <select
          value={filterJenis}
          onChange={(e) => setFilterJenis(e.target.value)}
          className="filter-select"
        >
          <option value="">Semua Jenis</option>
          <option value="tanya">Pertanyaan</option>
          <option value="survei">Survei</option>
          <option value="penawaran">Penawaran</option>
          <option value="sewa">Sewa</option>
          <option value="beli">Beli</option>
        </select>
      </div>

      {loading ? (
        <div className="loading-text">Memuat data...</div>
      ) : requests.length === 0 ? (
        <div className="empty-state">
          <p>Belum ada permintaan masuk.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="req-table">
            <thead>
              <tr>
                <th style={{ width: 32 }}></th>
                <th>Klien</th>
                <th>Jenis</th>
                <th>Properti</th>
                <th>Status</th>
                <th>Tanggal</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <RequestRow
                  key={req.id}
                  req={req}
                  onStatusChange={handleStatusChange}
                  onDelete={handleDelete}
                  onOpenWa={(r) => setWaTarget(r)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {waTarget && (
        <WaPanel
          request={waTarget}
          property={
            waTarget.property_title
              ? {
                  title: waTarget.property_title,
                  location: waTarget.property_location,
                  price: waTarget.property_price,
                  status_legal: waTarget.status_legal,
                  type: waTarget.property_type,
                }
              : null
          }
          onClose={() => setWaTarget(null)}
        />
      )}
    </div>
  );
}
