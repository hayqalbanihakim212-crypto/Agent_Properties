import { useState } from "react";
import PropertyCard from "../components/PropertyCard";

function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-badge-row">
        <div className="skeleton skeleton-badge" />
        <div className="skeleton skeleton-badge" />
      </div>
      <div className="skeleton skeleton-title" />
      <div className="skeleton skeleton-price" />
      <div className="skeleton skeleton-line" />
      <div className="skeleton skeleton-line-short" />
      <div className="skeleton skeleton-desc" />
      <div className="skeleton skeleton-desc" style={{ width: "75%" }} />
      <div className="skeleton-footer">
        <div className="skeleton skeleton-contact" />
      </div>
    </div>
  );
}

export default function Katalog({
  properties,
  loading,
  onRefresh,
  onHubungi,
  onDetail,
}) {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("semua");

  const filtered = properties.filter((p) => {
    const matchSearch =
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.location?.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "semua" || p.type?.includes(filterType);
    return matchSearch && matchType;
  });

  return (
    <div className="page-katalog">
      <div className="katalog-header">
        <div>
          <h2>Daftar Properti Tersedia</h2>
          <p className="subtitle">
            {loading
              ? "Memuat data..."
              : `${filtered.length} properti ditemukan`}
          </p>
        </div>
        <button className="btn-refresh" onClick={onRefresh} disabled={loading}>
          Perbarui
        </button>
      </div>

      <div className="filter-bar">
        <input
          type="text"
          placeholder="Cari judul atau lokasi..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
          disabled={loading}
        />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="filter-select"
          disabled={loading}
        >
          <option value="semua">Semua Tipe</option>
          <option value="Jual">Dijual</option>
          <option value="Sewa">Disewa</option>
        </select>
      </div>

      {loading ? (
        <div className="card-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <p>Belum ada properti yang terdaftar.</p>
          <small>Silakan hubungi agen kami untuk informasi lebih lanjut.</small>
        </div>
      ) : (
        <div className="card-grid">
          {filtered.map((item) => (
            <PropertyCard
              key={item.id}
              item={item}
              onHubungi={onHubungi}
              onDetail={onDetail}
            />
          ))}
        </div>
      )}
    </div>
  );
}
