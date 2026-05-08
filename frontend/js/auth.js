// ── Auth page helpers ────────────────────────────────────────────────────────

function showAlert(el, msg, type = "error") {
  el.className = `alert alert-${type} show`;
  el.innerHTML = `<span>${type === "error" ? "⚠" : "✓"}</span> ${msg}`;
}

function setLoading(btn, loading) {
  btn.disabled = loading;
  btn.innerHTML = loading
    ? `<span class="spinner"></span> Please wait...`
    : btn.dataset.label;
}

// ── Register ─────────────────────────────────────────────────────────────────
const regForm = document.getElementById("register-form");
if (regForm) {
  const btn = regForm.querySelector("button[type=submit]");
  btn.dataset.label = btn.innerHTML;
  const alert = document.getElementById("reg-alert");

  regForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    setLoading(btn, true);
    const { name, email, password, confirm } = Object.fromEntries(new FormData(regForm));

    if (password !== confirm) {
      showAlert(alert, "Passwords do not match");
      setLoading(btn, false);
      return;
    }
    try {
      const data = await api.register({ name, email, password });
      localStorage.setItem("tf_token", data.access_token);
      localStorage.setItem("tf_user", JSON.stringify(data.user));
      showAlert(alert, "Account created! Redirecting…", "success");
      setTimeout(() => (window.location.href = "dashboard.html"), 900);
    } catch (err) {
      showAlert(alert, err.message);
      setLoading(btn, false);
    }
  });
}

// ── Login ─────────────────────────────────────────────────────────────────────
const loginForm = document.getElementById("login-form");
if (loginForm) {
  const btn = loginForm.querySelector("button[type=submit]");
  btn.dataset.label = btn.innerHTML;
  const alert = document.getElementById("login-alert");

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    setLoading(btn, true);
    const { email, password } = Object.fromEntries(new FormData(loginForm));
    try {
      const data = await api.login({ email, password });
      localStorage.setItem("tf_token", data.access_token);
      localStorage.setItem("tf_user", JSON.stringify(data.user));
      window.location.href = "dashboard.html";
    } catch (err) {
      showAlert(alert, err.message);
      setLoading(btn, false);
    }
  });
}
