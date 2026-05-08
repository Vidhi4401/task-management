// ── Guard ─────────────────────────────────────────────────────────────────────
const token = localStorage.getItem("tf_token");
const userStr = localStorage.getItem("tf_user");
if (!token || !userStr) {
  window.location.href = "index.html";
}
const currentUser = JSON.parse(userStr || "{}");

// ── Populate sidebar user info ────────────────────────────────────────────────
document.getElementById("sidebar-name").textContent = currentUser.name || "User";
document.getElementById("sidebar-avatar").textContent = (currentUser.name || "U")[0].toUpperCase();
const roleEl = document.getElementById("sidebar-role");
roleEl.textContent = currentUser.role;
if (currentUser.role === "admin") roleEl.classList.add("admin");

// Show admin nav item
if (currentUser.role === "admin") {
  document.getElementById("nav-users").style.display = "flex";
}

// ── Logout ────────────────────────────────────────────────────────────────────
document.getElementById("logout-btn").addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "index.html";
});

// ── Navigation ────────────────────────────────────────────────────────────────
const navItems = document.querySelectorAll(".nav-item");
const sections = document.querySelectorAll(".section");

function showSection(name) {
  navItems.forEach((n) => n.classList.toggle("active", n.dataset.section === name));
  sections.forEach((s) => s.classList.toggle("active", s.id === "section-" + name));
  if (name === "tasks") loadTasks();
  if (name === "users" && currentUser.role === "admin") loadUsers();
}

navItems.forEach((item) => {
  item.addEventListener("click", () => showSection(item.dataset.section));
});

// ── Utility ───────────────────────────────────────────────────────────────────
function statusBadge(s) {
  const map = { todo: "badge-todo", in_progress: "badge-inprog", done: "badge-done" };
  const label = { todo: "To Do", in_progress: "In Progress", done: "Done" };
  return `<span class="badge ${map[s] || ""}">${label[s] || s}</span>`;
}
function priorityBadge(p) {
  const map = { low: "badge-low", medium: "badge-medium", high: "badge-high" };
  return `<span class="badge ${map[p] || ""}">${p}</span>`;
}
function fmtDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ── Stats ─────────────────────────────────────────────────────────────────────
function updateStats(tasks) {
  document.getElementById("stat-total").textContent = tasks.length;
  document.getElementById("stat-todo").textContent = tasks.filter((t) => t.status === "todo").length;
  document.getElementById("stat-inprog").textContent = tasks.filter((t) => t.status === "in_progress").length;
  document.getElementById("stat-done").textContent = tasks.filter((t) => t.status === "done").length;
}

// ── Load tasks ────────────────────────────────────────────────────────────────
async function loadTasks() {
  const statusF = document.getElementById("filter-status").value;
  const priorityF = document.getElementById("filter-priority").value;
  const params = {};
  if (statusF) params.status = statusF;
  if (priorityF) params.priority = priorityF;

  const grid = document.getElementById("tasks-grid");
  grid.innerHTML = `<div style="color:var(--muted);padding:40px;grid-column:1/-1;text-align:center;"><span class="spinner"></span> Loading tasks…</div>`;

  try {
    const tasks = await api.getTasks(params);
    updateStats(tasks);
    if (!tasks.length) {
      grid.innerHTML = `<div class="empty-state"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg><p>No tasks yet. Create your first task!</p></div>`;
      return;
    }
    grid.innerHTML = tasks.map((t) => taskCard(t)).join("");
    grid.querySelectorAll(".edit-btn").forEach((b) => b.addEventListener("click", () => openEditModal(b.dataset.id, tasks.find((t) => t.id === b.dataset.id))));
    grid.querySelectorAll(".del-btn").forEach((b) => b.addEventListener("click", () => deleteTask(b.dataset.id)));
  } catch (err) {
    grid.innerHTML = `<div class="empty-state" style="color:var(--danger)">${err.message}</div>`;
  }
}

function taskCard(t) {
  const canEdit = currentUser.role === "admin" || t.owner_id === currentUser.id;
  const ownerTag = currentUser.role === "admin" ? `<span class="task-owner">👤 ${t.owner_name || "—"}</span>` : "";
  const dueTag = t.due_date ? `<span class="task-date">📅 ${fmtDate(t.due_date)}</span>` : "";
  const actions = canEdit
    ? `<button class="btn btn-ghost btn-sm edit-btn" data-id="${t.id}" title="Edit">✏️</button>
       <button class="btn btn-danger btn-sm del-btn" data-id="${t.id}" title="Delete">🗑</button>`
    : "";
  return `
    <div class="task-card">
      <div class="task-header">
        <div class="task-title">${escHtml(t.title)}</div>
        <div class="task-actions">${actions}</div>
      </div>
      ${t.description ? `<div class="task-desc">${escHtml(t.description)}</div>` : ""}
      <div class="task-meta">
        ${statusBadge(t.status)}
        ${priorityBadge(t.priority)}
        ${dueTag}
        ${ownerTag}
      </div>
    </div>`;
}

function escHtml(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Filters
document.getElementById("filter-status").addEventListener("change", loadTasks);
document.getElementById("filter-priority").addEventListener("change", loadTasks);

// ── Create task modal ─────────────────────────────────────────────────────────
const createModal = document.getElementById("create-modal");
document.getElementById("new-task-btn").addEventListener("click", () => openModal(createModal));
document.getElementById("create-close").addEventListener("click", () => closeModal(createModal));
createModal.addEventListener("click", (e) => { if (e.target === createModal) closeModal(createModal); });

document.getElementById("create-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = e.target.querySelector("button[type=submit]");
  btn.disabled = true;
  btn.innerHTML = `<span class="spinner"></span>`;
  const fd = new FormData(e.target);
  const body = {
    title: fd.get("title"),
    description: fd.get("description") || null,
    priority: fd.get("priority"),
    status: fd.get("status"),
    due_date: fd.get("due_date") ? new Date(fd.get("due_date")).toISOString() : null,
  };
  try {
    await api.createTask(body);
    closeModal(createModal);
    e.target.reset();
    loadTasks();
  } catch (err) {
    alert(err.message);
  } finally {
    btn.disabled = false;
    btn.innerHTML = "Create Task";
  }
});

// ── Edit task modal ───────────────────────────────────────────────────────────
const editModal = document.getElementById("edit-modal");
document.getElementById("edit-close").addEventListener("click", () => closeModal(editModal));
editModal.addEventListener("click", (e) => { if (e.target === editModal) closeModal(editModal); });

let editingId = null;
function openEditModal(id, task) {
  editingId = id;
  const f = document.getElementById("edit-form");
  f.querySelector("[name=title]").value = task.title;
  f.querySelector("[name=description]").value = task.description || "";
  f.querySelector("[name=priority]").value = task.priority;
  f.querySelector("[name=status]").value = task.status;
  f.querySelector("[name=due_date]").value = task.due_date
    ? new Date(task.due_date).toISOString().slice(0, 10)
    : "";
  openModal(editModal);
}

document.getElementById("edit-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = e.target.querySelector("button[type=submit]");
  btn.disabled = true;
  btn.innerHTML = `<span class="spinner"></span>`;
  const fd = new FormData(e.target);
  const body = {};
  if (fd.get("title")) body.title = fd.get("title");
  if (fd.get("description")) body.description = fd.get("description");
  if (fd.get("priority")) body.priority = fd.get("priority");
  if (fd.get("status")) body.status = fd.get("status");
  if (fd.get("due_date")) body.due_date = new Date(fd.get("due_date")).toISOString();

  try {
    await api.updateTask(editingId, body);
    closeModal(editModal);
    loadTasks();
  } catch (err) {
    alert(err.message);
  } finally {
    btn.disabled = false;
    btn.innerHTML = "Save Changes";
  }
});

async function deleteTask(id) {
  if (!confirm("Delete this task?")) return;
  try {
    await api.deleteTask(id);
    loadTasks();
  } catch (err) {
    alert(err.message);
  }
}

// ── Admin: Users ──────────────────────────────────────────────────────────────
async function loadUsers() {
  const tbody = document.getElementById("users-tbody");
  tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--muted);padding:30px"><span class="spinner"></span> Loading…</td></tr>`;
  try {
    const users = await api.getUsers();
    document.getElementById("stat-users").textContent = users.length;
    tbody.innerHTML = users
      .map(
        (u) => `
      <tr>
        <td>${escHtml(u.name)}</td>
        <td style="color:var(--muted)">${escHtml(u.email)}</td>
        <td>
          <select class="filter-select" data-uid="${u.id}" onchange="changeRole('${u.id}', this.value)" ${u.id === currentUser.id ? "disabled" : ""}>
            <option value="user" ${u.role === "user" ? "selected" : ""}>user</option>
            <option value="admin" ${u.role === "admin" ? "selected" : ""}>admin</option>
          </select>
        </td>
        <td style="color:var(--muted);font-size:12px">${fmtDate(u.created_at)}</td>
        <td>
          ${u.id !== currentUser.id
            ? `<button class="btn btn-danger btn-sm" onclick="deleteUser('${u.id}')">Delete</button>`
            : `<span style="color:var(--muted);font-size:12px">You</span>`}
        </td>
      </tr>`
      )
      .join("");
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="5" style="color:var(--danger);padding:20px">${err.message}</td></tr>`;
  }
}

async function changeRole(id, role) {
  try {
    await api.updateRole(id, role);
  } catch (err) {
    alert(err.message);
    loadUsers();
  }
}

async function deleteUser(id) {
  if (!confirm("Delete this user and all their tasks?")) return;
  try {
    await api.deleteUser(id);
    loadUsers();
    loadTasks();
  } catch (err) {
    alert(err.message);
  }
}

// ── Modal helpers ─────────────────────────────────────────────────────────────
function openModal(m) { m.classList.add("open"); }
function closeModal(m) { m.classList.remove("open"); }

// ── Init ──────────────────────────────────────────────────────────────────────
showSection("tasks");
