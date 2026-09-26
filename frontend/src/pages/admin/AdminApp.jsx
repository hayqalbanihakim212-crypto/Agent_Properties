import { useState, useEffect } from "react";
import AdminLogin from "./AdminLogin";
import AdminLayout from "./AdminLayout";
import AdminRequests from "./AdminRequests";
import AdminProperties from "./AdminProperties";
import AdminDocuments from "./AdminDocuments";
import AdminSettings from "./AdminSettings";
import { getToken, getUser, clearSession, saveSession } from "../../services/auth";
import { getMe } from "../../services/api";

export default function AdminApp() {
  const [token, setToken] = useState(getToken);
  const [user, setUser] = useState(getUser);
  const [tab, setTab] = useState("requests");
  const [verifying, setVerifying] = useState(!!getToken());

  // Verifikasi token saat pertama kali buka
  useEffect(() => {
    if (!token) { setVerifying(false); return; }
    getMe(token)
      .then((data) => {
        setUser(data.data);
        saveSession(token, data.data);
      })
      .catch(() => {
        clearSession();
        setToken(null);
        setUser(null);
      })
      .finally(() => setVerifying(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLogin = (t, u) => {
    setToken(t);
    setUser(u);
  };

  const handleLogout = () => {
    clearSession();
    setToken(null);
    setUser(null);
  };

  if (verifying) {
    return (
      <div className="verify-screen">
        <p>Memeriksa sesi...</p>
      </div>
    );
  }

  if (!token || !user) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  const renderPage = () => {
    switch (tab) {
      case "requests":   return <AdminRequests token={token} />;
      case "properties": return <AdminProperties token={token} />;
      case "documents":  return <AdminDocuments token={token} />;
      case "settings":   return <AdminSettings token={token} user={user} onLogout={handleLogout} />;
      default:           return <AdminRequests token={token} />;
    }
  };

  return (
    <AdminLayout user={user} activeTab={tab} setTab={setTab} onLogout={handleLogout}>
      {renderPage()}
    </AdminLayout>
  );
}
