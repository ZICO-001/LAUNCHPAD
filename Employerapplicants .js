// =============================================
//  LaunchPad — Employer Applicants Page JS
//  Targets:
//    #userAvatar, #userName, #searchInput,
//    #applicantsMeta, #filterBtn, #filterPanel,
//    #filterStatus, #filterLocation, #filterRole,
//    #applyFilterBtn, #clearFilterBtn,
//    #applicantsList, #loadingState, #emptyState,
//    #logoutBtn,
//    #nav-home, #nav-jobs, #nav-applicants,
//    #nav-pipeline, #nav-profile
// =============================================

const BASE_URL = "https://your-api-domain.com/api";

// ── AUTH GUARD ────────────────────────────────
const token = localStorage.getItem("launchpad_token");
const user = JSON.parse(localStorage.getItem("launchpad_user") || "null");

if (!token || !user || user.role !== "employer") {
  window.location.href = "Signin.html";
}

// ── ELEMENT REFS ──────────────────────────────
const userAvatar = document.getElementById("userAvatar");
const userNameEl = document.getElementById("userName");
const searchInput = document.getElementById("searchInput");
const applicantsMeta = document.getElementById("applicantsMeta");
const filterBtn = document.getElementById("filterBtn");
const filterPanel = document.getElementById("filterPanel");
const filterStatus = document.getElementById("filterStatus");
const filterLocation = document.getElementById("filterLocation");
const filterRole = document.getElementById("filterRole");
const applyFilterBtn = document.getElementById("applyFilterBtn");
const clearFilterBtn = document.getElementById("clearFilterBtn");
const applicantsList = document.getElementById("applicantsList");
const loadingState = document.getElementById("loadingState");
const emptyState = document.getElementById("emptyState");
const logoutBtn = document.getElementById("logoutBtn");

// ── AUTH HEADERS ──────────────────────────────
function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

// ── POPULATE USER INFO ────────────────────────
function populateUserInfo() {
  if (!user) return;
  const firstName = user.first_name || "";
  const lastName = user.last_name || "";
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  if (userAvatar) userAvatar.textContent = initials;
  if (userNameEl) userNameEl.textContent = `${firstName} ${lastName}`.trim();
}

// ── NAVIGATION ────────────────────────────────
const navItems = {
  "nav-home": "EmployerDashboard.html",
  "nav-jobs": "EmployerJobs.html",
  "nav-applicants": null, // current page
  "nav-pipeline": "EmployerPipeline.html",
  "nav-profile": "EmployerProfile.html",
};

Object.keys(navItems).forEach((id) => {
  const el = document.getElementById(id);
  if (!el) return;
  el.addEventListener("click", () => {
    document
      .querySelectorAll(".navbar div")
      .forEach((d) => d.classList.remove("active-nav"));
    el.classList.add("active-nav");
    const href = navItems[id];
    if (href) window.location.href = href;
  });
});

// ── FETCH APPLICANTS ──────────────────────────
// GET /api/employer/applicants
// Optional query params: ?status=&location=&role=&search=
// Returns: {
//   total: number,
//   updated_at: string,
//   applicants: [{
//     id, first_name, last_name, role,
//     location, applied_at, status
//   }]
// }

async function fetchApplicants(params = {}) {
  showLoading(true);

  try {
    const query = new URLSearchParams();
    if (params.status) query.set("status", params.status);
    if (params.location) query.set("location", params.location);
    if (params.role) query.set("role", params.role);
    if (params.search) query.set("search", params.search);

    const url = `${BASE_URL}/employer/applicants${query.toString() ? "?" + query : ""}`;
    const res = await fetch(url, { headers: authHeaders() });
    const data = await res.json();

    if (!res.ok) throw new Error(data.message || "Failed to load applicants.");

    // Update meta text
    if (applicantsMeta) {
      applicantsMeta.textContent = `${data.total ?? 0} Applicants • updated ${formatTimeAgo(data.updated_at)}`;
    }

    renderApplicants(data.applicants || data);
  } catch (err) {
    console.error("Applicants error:", err);
    showLoading(false);
    showEmpty(true, "Could not load applicants. Please try again.");
  }
}

// ── RENDER APPLICANTS ─────────────────────────
// Builds one row per applicant and injects into #applicantsList

const avatarColors = [
  "avatar-color-0",
  "avatar-color-1",
  "avatar-color-2",
  "avatar-color-3",
  "avatar-color-4",
  "avatar-color-5",
];

const statusConfig = {
  under_review: { label: "Under Review", cls: "pill-review", icon: "🕐" },
  interview: { label: "Interview", cls: "pill-interview", icon: "📅" },
  shortlisted: { label: "Shortlisted", cls: "pill-shortlisted", icon: "✅" },
  rejected: { label: "Rejected", cls: "pill-rejected", icon: "✕" },
};

function renderApplicants(applicants) {
  showLoading(false);
  applicantsList.innerHTML = "";

  if (!applicants.length) {
    showEmpty(true);
    return;
  }

  showEmpty(false);

  applicants.forEach((applicant, index) => {
    const initials =
      `${applicant.first_name?.charAt(0) ?? ""}${applicant.last_name?.charAt(0) ?? ""}`.toUpperCase();
    const colorClass = avatarColors[index % avatarColors.length];
    const status =
      statusConfig[applicant.status] || statusConfig["under_review"];
    const timeAgo = formatTimeAgo(applicant.applied_at);

    const row = document.createElement("div");
    row.className = "applicant-row";
    row.dataset.id = applicant.id;

    row.innerHTML = `
      <div class="applicant-left">
        <div class="applicant-avatar ${colorClass}">${initials}</div>
        <div class="applicant-info">
          <h4>${applicant.first_name} ${applicant.last_name}</h4>
          <p>
            ${applicant.role || "—"}
            <span>•</span>
            ${applicant.location || "—"}
            <span>•</span>
            Applied ${timeAgo}
          </p>
        </div>
      </div>
      <div class="applicant-right">
        <span class="status-pill ${status.cls}">
          ${status.icon} ${status.label}
        </span>
        <span class="chevron">›</span>
      </div>
    `;

    // Click row → go to applicant detail page
    row.addEventListener("click", () => {
      window.location.href = `ApplicantDetail.html?id=${applicant.id}`;
    });

    applicantsList.appendChild(row);
  });
}

// ── FILTER TOGGLE ─────────────────────────────
if (filterBtn) {
  filterBtn.addEventListener("click", () => {
    filterPanel.classList.toggle("open");
  });
}

// Apply filter
if (applyFilterBtn) {
  applyFilterBtn.addEventListener("click", () => {
    fetchApplicants({
      status: filterStatus.value,
      location: filterLocation.value.trim(),
      role: filterRole.value.trim(),
    });
    filterPanel.classList.remove("open");
  });
}

// Clear filter
if (clearFilterBtn) {
  clearFilterBtn.addEventListener("click", () => {
    filterStatus.value = "";
    filterLocation.value = "";
    filterRole.value = "";
    fetchApplicants();
    filterPanel.classList.remove("open");
  });
}

// ── SEARCH ────────────────────────────────────
let searchTimeout = null;

if (searchInput) {
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      clearTimeout(searchTimeout);
      fetchApplicants({ search: searchInput.value.trim() });
    }
  });
  searchInput.addEventListener("input", () => {
    clearTimeout(searchTimeout);
    const q = searchInput.value.trim();
    if (q.length >= 3) {
      searchTimeout = setTimeout(() => fetchApplicants({ search: q }), 500);
    } else if (!q) {
      fetchApplicants();
    }
  });
}

// ── LOGOUT ────────────────────────────────────
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("launchpad_token");
    localStorage.removeItem("launchpad_user");
    window.location.href = "Signin.html";
  });
}

// ── UI STATE HELPERS ──────────────────────────
function showLoading(visible) {
  if (!loadingState) return;
  loadingState.style.display = visible ? "block" : "none";
  if (visible) applicantsList.innerHTML = "";
}

function showEmpty(visible, msg = "No applicants found.") {
  if (!emptyState) return;
  emptyState.textContent = msg;
  emptyState.style.display = visible ? "block" : "none";
}

// ── TIME AGO HELPER ───────────────────────────
function formatTimeAgo(dateString) {
  if (!dateString) return "recently";
  const now = new Date();
  const posted = new Date(dateString);
  const diffMs = now - posted;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHrs / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;
  if (diffHrs < 24) return `${diffHrs} hr${diffHrs > 1 ? "s" : ""} ago`;
  return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
}

// ── INIT ──────────────────────────────────────
function init() {
  populateUserInfo();
  fetchApplicants();
}

init();
