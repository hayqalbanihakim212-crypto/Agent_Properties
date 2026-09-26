export default function Header({ tab, setTab }) {
  return (
    <header className="app-header">
      <div className="header-brand">
        <h1>PropTech &amp; Agen Hukum</h1>
        <small>Platform Agen Properti &amp; Legalitas Digital</small>
      </div>
      <nav className="header-right">
        <button
          className={`nav-btn${tab === "katalog" ? " active" : ""}`}
          onClick={() => setTab("katalog")}
        >
          Katalog Properti
        </button>
        <button
          className={`nav-btn${tab === "hubungi" ? " active" : ""}`}
          onClick={() => setTab("hubungi")}
        >
          Hubungi Agen
        </button>
        <a href="/admin" className="header-admin-link">
          Admin
        </a>
      </nav>
    </header>
  );
}
