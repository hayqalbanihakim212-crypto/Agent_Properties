/**
 * Auth state sederhana berbasis localStorage.
 * Tidak menyimpan data sensitif — hanya token + info user non-sensitif.
 */
const KEY = "ap_admin_token";
const USER_KEY = "ap_admin_user";

export const saveSession = (token, user) => {
  try {
    localStorage.setItem(KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (_) {}
};

export const getToken = () => {
  try { return localStorage.getItem(KEY) || null; } catch (_) { return null; }
};

export const getUser = () => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_) { return null; }
};

export const clearSession = () => {
  try {
    localStorage.removeItem(KEY);
    localStorage.removeItem(USER_KEY);
  } catch (_) {}
};

export const isLoggedIn = () => !!getToken();
