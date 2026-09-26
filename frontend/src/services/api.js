const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Terjadi kesalahan pada server");
  return data;
};

const authHeaders = (token) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
});

// ===== AUTH =====
export const login = async (username, password) => {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  return handleResponse(res);
};

export const getMe = async (token) => {
  const res = await fetch(`${BASE_URL}/auth/me`, {
    headers: authHeaders(token),
  });
  return handleResponse(res);
};

export const changePassword = async (token, currentPassword, newPassword) => {
  const res = await fetch(`${BASE_URL}/auth/change-password`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  return handleResponse(res);
};

// ===== PROPERTIES (publik) =====
export const getProperties = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const res = await fetch(`${BASE_URL}/properties${params ? "?" + params : ""}`);
  return handleResponse(res);
};

export const getPropertyById = async (id) => {
  const res = await fetch(`${BASE_URL}/properties/${id}`);
  return handleResponse(res);
};

// ===== PROPERTIES (admin) =====
export const createProperty = async (token, data) => {
  const res = await fetch(`${BASE_URL}/properties`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

export const updateProperty = async (token, id, data) => {
  const res = await fetch(`${BASE_URL}/properties/${id}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

export const deleteProperty = async (token, id) => {
  const res = await fetch(`${BASE_URL}/properties/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  return handleResponse(res);
};

// ===== DOCUMENTS (admin) =====
export const generateDocument = async (token, data) => {
  const res = await fetch(`${BASE_URL}/documents/generate`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

export const getDocuments = async (token) => {
  const res = await fetch(`${BASE_URL}/documents`, {
    headers: authHeaders(token),
  });
  return handleResponse(res);
};

// ===== CLIENT REQUESTS =====
// Publik — klien mengirim
export const submitRequest = async (data) => {
  const res = await fetch(`${BASE_URL}/requests`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

// Admin — kelola request
export const getRequests = async (token, filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const res = await fetch(`${BASE_URL}/requests${params ? "?" + params : ""}`, {
    headers: authHeaders(token),
  });
  return handleResponse(res);
};

export const getRequestById = async (token, id) => {
  const res = await fetch(`${BASE_URL}/requests/${id}`, {
    headers: authHeaders(token),
  });
  return handleResponse(res);
};

export const updateRequestStatus = async (token, id, status, catatan_admin = "") => {
  const res = await fetch(`${BASE_URL}/requests/${id}/status`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify({ status, catatan_admin }),
  });
  return handleResponse(res);
};

export const deleteRequest = async (token, id) => {
  const res = await fetch(`${BASE_URL}/requests/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  return handleResponse(res);
};
