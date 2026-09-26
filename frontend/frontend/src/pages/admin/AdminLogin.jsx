import { useState } from "react";
import { login as apiLogin } from "../../services/api";
import { saveSession } from "../../services/auth";

export default function AdminLogin({ onLogin }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await apiLogin(form.username, form.password);
      saveSession(data.token, data.user);
      onLogin(data.token, data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-box card">
        <div className="login-header">
          <h2>Panel Admin</h2>
          <p>PropTech &amp; Agen Hukum</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              name="username"
              autoComplete="username"
              required
              value={form.username}
              onChange={handleChange}
              placeholder="Username admin"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              required
              value={form.password}
              onChange={handleChange}
              placeholder="Password"
            />
          </div>

          {error && <div className="alert-error">{error}</div>}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Masuk..." : "Masuk ke Dashboard"}
          </button>
        </form>

        <div className="login-footer">
          <a href="/">Kembali ke Katalog</a>
        </div>
      </div>
    </div>
  );
}
