import { useState } from "react";
import { changePassword } from "../../services/api";
import { clearSession } from "../../services/auth";
import FormGroup from "../../components/FormGroup";

export default function AdminSettings({ token, user, onLogout }) {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg({ type: "", text: "" });

    if (form.newPassword !== form.confirmPassword) {
      return setMsg({ type: "error", text: "Password baru tidak cocok." });
    }
    if (form.newPassword.length < 8) {
      return setMsg({ type: "error", text: "Password baru minimal 8 karakter." });
    }

    setLoading(true);
    try {
      await changePassword(token, form.currentPassword, form.newPassword);
      setMsg({ type: "success", text: "Password berhasil diubah. Silakan login kembali." });
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => {
        clearSession();
        onLogout();
      }, 2000);
    } catch (err) {
      setMsg({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h2>Pengaturan Akun</h2>
          <p className="subtitle">Kelola keamanan akun admin Anda.</p>
        </div>
      </div>

      <div className="settings-grid">
        <div className="settings-card card">
          <div className="settings-card-header">
            <h4>Informasi Akun</h4>
          </div>
          <div className="settings-card-body">
            <div className="info-row">
              <span className="info-label">Username</span>
              <span className="info-value">{user?.username}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Role</span>
              <span className="info-value">{user?.role}</span>
            </div>
          </div>
        </div>

        <div className="settings-card card">
          <div className="settings-card-header">
            <h4>Ganti Password</h4>
          </div>
          <div className="settings-card-body">
            <form onSubmit={handleSubmit}>
              <FormGroup label="Password Sekarang" required>
                <input
                  type="password"
                  name="currentPassword"
                  required
                  value={form.currentPassword}
                  onChange={handleChange}
                  autoComplete="current-password"
                />
              </FormGroup>
              <FormGroup label="Password Baru" required>
                <input
                  type="password"
                  name="newPassword"
                  required
                  value={form.newPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                  placeholder="Minimal 8 karakter"
                />
              </FormGroup>
              <FormGroup label="Konfirmasi Password Baru" required>
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  value={form.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                />
              </FormGroup>

              {msg.text && (
                <div className={msg.type === "error" ? "alert-error" : "alert-success"}>
                  {msg.text}
                </div>
              )}

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? "Menyimpan..." : "Ganti Password"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
