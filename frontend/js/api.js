const API_BASE = "http://localhost:8000/api/v1";

const api = {
  _token: () => localStorage.getItem("tf_token"),

  _headers(auth = true) {
    const h = { "Content-Type": "application/json" };
    if (auth) h["Authorization"] = `Bearer ${this._token()}`;
    return h;
  },

  async _fetch(url, opts = {}) {
    try {
      const res = await fetch(API_BASE + url, opts);
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Request failed");
      return data;
    } catch (err) {
      throw err;
    }
  },

  // Auth
  register: (body) =>
    api._fetch("/auth/register", { method: "POST", headers: api._headers(false), body: JSON.stringify(body) }),
  login: (body) =>
    api._fetch("/auth/login", { method: "POST", headers: api._headers(false), body: JSON.stringify(body) }),

  // Tasks
  getTasks: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return api._fetch(`/tasks${q ? "?" + q : ""}`, { headers: api._headers() });
  },
  createTask: (body) =>
    api._fetch("/tasks", { method: "POST", headers: api._headers(), body: JSON.stringify(body) }),
  updateTask: (id, body) =>
    api._fetch(`/tasks/${id}`, { method: "PUT", headers: api._headers(), body: JSON.stringify(body) }),
  deleteTask: (id) =>
    api._fetch(`/tasks/${id}`, { method: "DELETE", headers: api._headers() }),

  // Users (admin)
  getUsers: () => api._fetch("/users", { headers: api._headers() }),
  updateRole: (id, role) =>
    api._fetch(`/users/${id}/role`, { method: "PATCH", headers: api._headers(), body: JSON.stringify({ role }) }),
  deleteUser: (id) =>
    api._fetch(`/users/${id}`, { method: "DELETE", headers: api._headers() }),
};
