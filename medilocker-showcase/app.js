const API_BASE = window.localStorage.getItem("medilocker_showcase_api") || "http://127.0.0.1:8000/api/v1";
const HEALTH_BASE = API_BASE.replace(/\/api\/v1\/?$/, "");

const state = {
  mode: "login",
  token: window.localStorage.getItem("medilocker_showcase_token") || "",
  refreshToken: window.localStorage.getItem("medilocker_showcase_refresh") || "",
  user: readJson("medilocker_showcase_user"),
};

const elements = {
  authForm: document.querySelector("#authForm"),
  loginTab: document.querySelector("#loginTab"),
  registerTab: document.querySelector("#registerTab"),
  registerFields: document.querySelector("#registerFields"),
  sessionButton: document.querySelector("#sessionButton"),
  healthButton: document.querySelector("#healthButton"),
  profileButton: document.querySelector("#profileButton"),
  submitButton: document.querySelector("#submitButton"),
  formMessage: document.querySelector("#formMessage"),
  healthBadge: document.querySelector("#healthBadge"),
  healthText: document.querySelector("#healthText"),
  apiBaseText: document.querySelector("#apiBaseText"),
  roleBadge: document.querySelector("#roleBadge"),
  userEmail: document.querySelector("#userEmail"),
  userId: document.querySelector("#userId"),
  dataBadge: document.querySelector("#dataBadge"),
  dataOutput: document.querySelector("#dataOutput"),
};

const roleFields = [...document.querySelectorAll(".role-only")];
const roleSelect = elements.authForm.elements.role;

elements.apiBaseText.textContent = API_BASE;

elements.loginTab.addEventListener("click", () => setMode("login"));
elements.registerTab.addEventListener("click", () => setMode("register"));
elements.authForm.addEventListener("submit", handleSubmit);
elements.sessionButton.addEventListener("click", handleSessionAction);
elements.healthButton.addEventListener("click", checkHealth);
elements.profileButton.addEventListener("click", loadRoleData);
roleSelect.addEventListener("change", syncRoleFields);

setMode(state.mode);
syncRoleFields();
syncSessionUi();
checkHealth();

if (state.token && !state.user) {
  loadCurrentUser();
}

async function handleSubmit(event) {
  event.preventDefault();
  setMessage("Working on it...", "info");
  toggleSubmit(true);

  try {
    if (state.mode === "login") {
      const payload = {
        email: elements.authForm.elements.email.value.trim(),
        password: elements.authForm.elements.password.value,
      };

      const response = await request("/auth/login", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      persistSession(response);
      setMessage("Login successful. Your backend session is ready.", "success");
      await loadCurrentUser();
      await loadRoleData();
    } else {
      const payload = buildRegisterPayload();
      const createdUser = await request("/auth/register", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setMessage(`Account created for ${createdUser.email}. You can log in now.`, "success");
      setMode("login");
      elements.authForm.elements.email.value = payload.email;
      elements.authForm.elements.password.value = "";
    }
  } catch (error) {
    setMessage(normalizeError(error), "error");
  } finally {
    toggleSubmit(false);
  }
}

function buildRegisterPayload() {
  const role = roleSelect.value;
  const payload = {
    email: elements.authForm.elements.email.value.trim(),
    password: elements.authForm.elements.password.value,
    full_name: elements.authForm.elements.full_name.value.trim(),
    phone: elements.authForm.elements.phone.value.trim() || null,
    role,
  };

  if (!payload.full_name) {
    throw new Error("Full name is required for registration.");
  }

  if (role === "doctor") {
    payload.license_number = elements.authForm.elements.license_number.value.trim() || null;
    payload.specialization = elements.authForm.elements.specialization.value.trim() || null;
  }

  if (role === "hospital") {
    payload.hospital_name = elements.authForm.elements.hospital_name.value.trim() || null;
    payload.registration_number = elements.authForm.elements.registration_number.value.trim() || null;
  }

  return payload;
}

async function handleSessionAction() {
  if (!state.token) {
    setMode("login");
    setMessage("Enter your credentials to start a backend session.", "info");
    return;
  }

  clearSession();
  setMessage("Session cleared from this standalone app.", "info");
}

async function checkHealth() {
  elements.healthBadge.className = "badge info";
  elements.healthBadge.textContent = "Checking";
  elements.healthText.textContent = "Contacting backend...";

  try {
    const response = await fetch(`${HEALTH_BASE}/health`);

    if (!response.ok) {
      throw new Error(`Health check failed with ${response.status}`);
    }

    const data = await response.json();
    elements.healthBadge.className = "badge success";
    elements.healthBadge.textContent = "Online";
    elements.healthText.textContent = `${data.status} · version ${data.version}`;
  } catch (error) {
    elements.healthBadge.className = "badge error";
    elements.healthBadge.textContent = "Offline";
    elements.healthText.textContent = normalizeError(error);
  }
}

async function loadCurrentUser() {
  try {
    const me = await request("/auth/me", { method: "GET" }, true);
    state.user = me;
    window.localStorage.setItem("medilocker_showcase_user", JSON.stringify(me));
    syncSessionUi();
    return me;
  } catch (error) {
    clearSession();
    setMessage(`Session expired: ${normalizeError(error)}`, "warning");
    return null;
  }
}

async function loadRoleData() {
  if (!state.token) {
    setMessage("Log in first to load role-specific backend data.", "warning");
    return;
  }

  if (!state.user) {
    const me = await loadCurrentUser();
    if (!me) {
      return;
    }
  }

  elements.dataBadge.className = "badge info";
  elements.dataBadge.textContent = "Loading";
  elements.dataOutput.textContent = "Fetching live role data from the API...";

  try {
    let payload;
    if (state.user.role === "patient") {
      payload = await request("/patient/profile", { method: "GET" }, true);
    } else if (state.user.role === "doctor") {
      payload = await request("/doctor/appointments", { method: "GET" }, true);
    } else {
      payload = await request("/hospital/profile", { method: "GET" }, true);
    }

    elements.dataBadge.className = "badge success";
    elements.dataBadge.textContent = "Loaded";
    elements.dataOutput.textContent = JSON.stringify(payload, null, 2);
  } catch (error) {
    elements.dataBadge.className = "badge warning";
    elements.dataBadge.textContent = "Partial";
    elements.dataOutput.textContent = normalizeError(error);
  }
}

async function request(path, options = {}, authRequired = false) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (state.token) {
    headers.Authorization = `Bearer ${state.token}`;
  } else if (authRequired) {
    throw new Error("No access token available.");
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const text = await response.text();
  const data = text ? safeJson(text) : null;

  if (!response.ok) {
    const detail = data?.detail || data?.message || text || `Request failed with ${response.status}`;
    throw new Error(detail);
  }

  return data;
}

function persistSession(authResponse) {
  state.token = authResponse.access_token;
  state.refreshToken = authResponse.refresh_token;
  state.user = authResponse.user;
  window.localStorage.setItem("medilocker_showcase_token", state.token);
  window.localStorage.setItem("medilocker_showcase_refresh", state.refreshToken);
  window.localStorage.setItem("medilocker_showcase_user", JSON.stringify(state.user));
  syncSessionUi();
}

function clearSession() {
  state.token = "";
  state.refreshToken = "";
  state.user = null;
  window.localStorage.removeItem("medilocker_showcase_token");
  window.localStorage.removeItem("medilocker_showcase_refresh");
  window.localStorage.removeItem("medilocker_showcase_user");
  elements.dataBadge.className = "badge muted";
  elements.dataBadge.textContent = "No data";
  elements.dataOutput.textContent =
    "Sign in and click Load my data to fetch role-specific information from the API.";
  syncSessionUi();
}

function syncSessionUi() {
  if (state.user) {
    elements.roleBadge.className = "badge success";
    elements.roleBadge.textContent = state.user.role;
    elements.userEmail.textContent = state.user.email;
    elements.userId.textContent = state.user.id;
    elements.sessionButton.textContent = "Sign out";
  } else {
    elements.roleBadge.className = "badge muted";
    elements.roleBadge.textContent = "Signed out";
    elements.userEmail.textContent = "No active session";
    elements.userId.textContent = "-";
    elements.sessionButton.textContent = "Clear session";
  }
}

function setMode(mode) {
  state.mode = mode;
  const isRegister = mode === "register";
  elements.loginTab.classList.toggle("active", !isRegister);
  elements.registerTab.classList.toggle("active", isRegister);
  elements.registerFields.classList.toggle("hidden", !isRegister);
  elements.submitButton.textContent = isRegister ? "Create account" : "Login";
}

function syncRoleFields() {
  const role = roleSelect.value;
  roleFields.forEach((field) => {
    const shouldShow =
      (role === "doctor" && field.classList.contains("doctor-only")) ||
      (role === "hospital" && field.classList.contains("hospital-only"));

    field.classList.toggle("hidden", !shouldShow);
  });
}

function setMessage(message, tone) {
  elements.formMessage.textContent = message;
  elements.formMessage.className = "message";

  if (tone === "success") {
    elements.formMessage.classList.add("badge-success");
  }

  if (tone === "error") {
    elements.formMessage.style.color = "var(--error)";
  } else if (tone === "warning") {
    elements.formMessage.style.color = "var(--warning)";
  } else if (tone === "success") {
    elements.formMessage.style.color = "var(--success)";
  } else {
    elements.formMessage.style.color = "var(--text-secondary)";
  }
}

function toggleSubmit(disabled) {
  elements.submitButton.disabled = disabled;
  elements.submitButton.style.opacity = disabled ? "0.7" : "1";
}

function readJson(key) {
  try {
    return JSON.parse(window.localStorage.getItem(key) || "null");
  } catch {
    return null;
  }
}

function safeJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function normalizeError(error) {
  return error instanceof Error ? error.message : String(error);
}
