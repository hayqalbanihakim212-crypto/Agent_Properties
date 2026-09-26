import { clearSession } from "../../services/auth";

export default function AdminLayout({ user, activeTab, setTab, onLogout, children }) {
  const nav = [
    { key: "requests",   label: "Permintaan Klien" },
    { key: "properties", label: "Kelola Properti" },
    { key: "documents",  label: "Draft Legal" },
    { key: "settings",   label: "Pengaturan" },
  ];

  const handleLogout = () => {
    clearSession();
    onLogout();
  };

  return (
    <div className="admin-wrapper">
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <span className="sidebar-brand-title">PropTech Admin</span>
          <span className="sidebar-brand-sub">{user?.username}</span>
        </div>

        <nav className="sidebar-nav">
          {nav.map((item) => (
            <button
              key={item.key}
              className={`sidebar-btn${activeTab === item.key ? " active" : ""}`}
              onClick={() => setTab(item.key)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <a href="/" className="sidebar-link">Lihat Situs</a>
          <button className="sidebar-logout" onClick={handleLogout}>
            Keluar
          </button>
        </div>
      </aside>

      <main className="admin-main">
        {children}
      </main>
    </div>
  );
}
