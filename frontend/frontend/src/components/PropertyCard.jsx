import { useState } from "react";

export default function PropertyCard({ item, onHubungi }) {
  const images = Array.isArray(item.images) ? item.images.filter(Boolean) : [];
  const [activeImg, setActiveImg] = useState(0);

  return (
    <div className="card property-card">
      {/* Gallery foto */}
      {images.length > 0 ? (
        <div className="card-gallery">
          <img
            src={images[activeImg]}
            alt={item.title}
            className="card-gallery-main"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
          {images.length > 1 && (
            <div className="card-gallery-dots">
              {images.map((_, i) => (
                <button
                  key={i}
                  className={`gallery-dot${i === activeImg ? " active" : ""}`}
                  onClick={() => setActiveImg(i)}
                  aria-label={`Foto ${i + 1}`}
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

      <div className="card-body">
        <div className="card-badges">
          <span className="badge badge-type">{item.type}</span>
          <span className="badge badge-legal">{item.status_legal}</span>
        </div>
        <h4 className="card-title">{item.title}</h4>
        <p className="price">Rp {Number(item.price).toLocaleString("id-ID")}</p>
        {item.size && <p className="card-meta">{item.size}</p>}
        <p className="card-meta">{item.location}</p>
        {item.owner && <p className="card-meta">{item.owner}</p>}
        {item.description && <p className="card-desc">{item.description}</p>}
        <div className="card-footer">
          <p className="card-contact">{item.contact}</p>
          {onHubungi && (
            <button className="btn-hubungi" onClick={() => onHubungi(item)}>
              Hubungi Agen
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
