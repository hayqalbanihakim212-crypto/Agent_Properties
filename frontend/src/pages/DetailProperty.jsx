import { useState, useEffect } from "react";
import { getPropertyById } from "../services/api";
import useShare from "../hooks/useShare";

function DetailContent({ item, onBack, onHubungi }) {
  const images = Array.isArray(item.images) ? item.images.filter(Boolean) : [];
  const [activeImg, setActiveImg] = useState(0);
  const { handleShare, shareStatus } = useShare(item);

  const rows = [
    ["Tipe Penawaran", item.type],
    ["Status Legalitas", item.status_legal],
    ["Luas", item.size],
    ["Lokasi", item.location],
    ["Pemilik", item.owner],
  ].filter(([, v]) => v);

  return (
    <div className="detail-page">
      <button className="btn-back" onClick={onBack}>
        ← Kembali ke Katalog
      </button>

      <div className="card detail-card">
        {images.length > 0 ? (
          <div className="detail-gallery">
            <img
              src={images[activeImg]}
              alt={item.title}
              className="detail-gallery-main"
            />
            {images.length > 1 && (
              <div className="detail-thumbs">
                {images.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt={`Foto ${i + 1}`}
                    className={`detail-thumb${i === activeImg ? " active" : ""}`}
                    onClick={() => setActiveImg(i)}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="card-gallery-empty">
            <span>Tidak ada foto</span>
          </div>
        )}

        <div className="detail-body">
          <div className="card-badges">
            <span className="badge badge-type">{item.type}</span>
            <span className="badge badge-legal">{item.status_legal}</span>
          </div>
          <h2 className="detail-title">{item.title}</h2>
          <p className="price detail-price">
            Rp {Number(item.price).toLocaleString("id-ID")}
          </p>

          <div className="detail-info">
            {rows.map(([label, value]) => (
              <div className="info-row" key={label}>
                <span className="info-label">{label}</span>
                <span className="info-value">{value}</span>
              </div>
            ))}
          </div>

          {item.description && (
            <div className="detail-desc">
              <h4>Deskripsi</h4>
              <p>{item.description}</p>
            </div>
          )}

          <div className="card-actions detail-actions">
            <button className="btn-share" onClick={handleShare}>
              {shareStatus === "copied"
                ? "Tersalin"
                : shareStatus === "error"
                  ? "Gagal"
                  : "Bagikan"}
            </button>
            <button className="btn-hubungi" onClick={() => onHubungi(item)}>
              Hubungi Agen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DetailProperty({ id, onBack, onHubungi }) {
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    getPropertyById(id)
      .then((res) => {
        if (alive) setItem(res.data);
      })
      .catch((err) => {
        if (alive) setError(err.message);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [id]);

  if (loading) return <div className="loading-text">Memuat properti...</div>;

  if (error || !item)
    return (
      <div className="empty-state">
        <p>{error || "Properti tidak ditemukan."}</p>
        <button className="btn-secondary" onClick={onBack}>
          Kembali ke Katalog
        </button>
      </div>
    );

  return <DetailContent item={item} onBack={onBack} onHubungi={onHubungi} />;
}
