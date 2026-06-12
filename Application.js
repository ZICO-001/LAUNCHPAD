// =============================================
//  LaunchPad — My Applications Page JS
// =============================================

// ── USER INFO ─────────────────────────────────
const user = JSON.parse(localStorage.getItem("launchpad_user") || "null");
if (!user) window.location.href = "Signin.html";

const fullName = user.name || user.first_name + " " + user.last_name;
document.getElementById("userName").textContent = fullName;
const parts = fullName.split(" ");
document.getElementById("userAvatar").textContent =
  (parts[0]?.[0] || "") + (parts[1]?.[0] || "");

// ── HELPERS ───────────────────────────────────
function getApplications() {
  return JSON.parse(localStorage.getItem("launchpad_applications") || "[]");
}

function saveApplications(apps) {
  localStorage.setItem("launchpad_applications", JSON.stringify(apps));
}

// ── STATUS CLASS MAP ──────────────────────────
// Maps each status to a CSS class defined in the CSS file
function getStatusClass(status) {
  const map = {
    "Under Review": "status-review",
    Interview: "status-interview",
    Offered: "status-offered",
    Rejected: "status-rejected",
  };
  return map[status] || "status-review";
}

// ── RENDER APPLICATIONS ───────────────────────
const container = document.getElementById("applicationsList");
let currentFilter = "all";

function renderApplications(filter) {
  const apps = getApplications();

  // Apply filter
  let filtered = apps;
  if (filter !== "all") {
    filtered = apps.filter(
      (a) => a.status.toLowerCase() === filter.toLowerCase(),
    );
  }

  container.innerHTML = "";

  // Empty state
  if (filtered.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.innerHTML = `
      <h3>No applications here</h3>
      <p>${
        filter === "all"
          ? "You haven't applied to any jobs yet."
          : "No applications with status: " + filter
      }</p>
      <a href="Browse-job.html">Browse Jobs →</a>
    `;
    container.appendChild(empty);
    return;
  }

  filtered.forEach((app) => {
    const statusClass = getStatusClass(app.status);

    const card = document.createElement("div");
    card.className = "app-card";

    // Left side
    const left = document.createElement("div");
    left.className = "app-card-left";

    const logo = document.createElement("div");
    logo.className = "app-logo";
    logo.textContent = app.company[0];

    const info = document.createElement("div");

    const title = document.createElement("p");
    title.className = "app-job-title";
    title.textContent = app.jobTitle;

    const meta = document.createElement("div");
    meta.className = "app-job-meta";

    const company = document.createElement("p");
    company.textContent = app.company;

    const location = document.createElement("p");
    location.textContent = app.location;

    const date = document.createElement("p");
    date.className = "meta-date";
    date.textContent = "• Applied " + app.appliedDate;

    meta.appendChild(company);
    meta.appendChild(location);
    meta.appendChild(date);
    info.appendChild(title);
    info.appendChild(meta);
    left.appendChild(logo);
    left.appendChild(info);

    // Right side
    const right = document.createElement("div");
    right.className = "app-card-right";

    // Status badge
    const badge = document.createElement("div");
    badge.className = "status-badge " + statusClass;

    const dot = document.createElement("span");
    dot.className = "status-dot";

    const statusText = document.createElement("span");
    statusText.textContent = app.status;

    badge.appendChild(dot);
    badge.appendChild(statusText);

    // Action buttons
    const actions = document.createElement("div");
    actions.className = "app-actions";

    const viewBtn = document.createElement("button");
    viewBtn.className = "btn-view";
    viewBtn.textContent = "View";
    viewBtn.addEventListener("click", () => openModal(app.id));

    const withdrawBtn = document.createElement("button");
    withdrawBtn.className = "btn-withdraw";
    withdrawBtn.textContent = "Withdraw";
    withdrawBtn.addEventListener("click", () => withdrawApplication(app.id));

    actions.appendChild(viewBtn);
    actions.appendChild(withdrawBtn);

    right.appendChild(badge);
    right.appendChild(actions);

    card.appendChild(left);
    card.appendChild(right);
    container.appendChild(card);
  });
}

// ── OPEN MODAL ────────────────────────────────
function openModal(appId) {
  const apps = getApplications();
  const app = apps.find((a) => a.id === appId);
  if (!app) return;

  const statusClass = getStatusClass(app.status);

  // Populate modal fields
  document.getElementById("modalJobLogo").textContent = app.company[0];
  document.getElementById("modalJobTitle").textContent = app.jobTitle;
  document.getElementById("modalJobSub").textContent =
    app.company + " • " + app.location;

  // Status badge
  const badge = document.getElementById("modalStatusBadge");
  badge.className = "status-badge " + statusClass;
  document.getElementById("modalStatusText").textContent = app.status;

  // Detail rows
  document.getElementById("modalApplicant").textContent = app.applicantName;
  document.getElementById("modalEmail").textContent = app.email;
  document.getElementById("modalPhone").textContent = app.phone;
  document.getElementById("modalAppliedDate").textContent = app.appliedDate;
  document.getElementById("modalResume").textContent =
    app.resume || "Not uploaded";

  // Cover letter
  const coverWrap = document.getElementById("modalCoverWrap");
  if (app.coverLetter) {
    document.getElementById("modalCoverText").textContent = app.coverLetter;
    coverWrap.style.display = "block";
  } else {
    coverWrap.style.display = "none";
  }

  // Show overlay
  document.getElementById("appDetailOverlay").style.display = "flex";
}

// ── CLOSE MODAL ───────────────────────────────
function closeModal() {
  document.getElementById("appDetailOverlay").style.display = "none";
}

document.getElementById("closeModalBtn").addEventListener("click", closeModal);

// Close when clicking outside the card
document.getElementById("appDetailOverlay").addEventListener("click", (e) => {
  if (e.target === document.getElementById("appDetailOverlay")) {
    closeModal();
  }
});

// ── WITHDRAW APPLICATION ──────────────────────
function withdrawApplication(appId) {
  const confirmed = confirm(
    "Are you sure you want to withdraw this application? This cannot be undone.",
  );
  if (!confirmed) return;

  let apps = getApplications();
  const app = apps.find((a) => a.id === appId);

  // Remove from applications list
  apps = apps.filter((a) => a.id !== appId);
  saveApplications(apps);

  // Remove from applied jobs so Saved Jobs page updates too
  if (app) {
    const appliedIds = JSON.parse(
      localStorage.getItem("launchpad_applied_jobs") || "[]",
    ).filter((id) => id !== app.jobId);
    localStorage.setItem("launchpad_applied_jobs", JSON.stringify(appliedIds));
  }

  renderApplications(currentFilter);
}

// ── FILTER NAV ────────────────────────────────
function setActiveTab(el) {
  document.querySelectorAll(".profile-nav a").forEach((a) => {
    a.classList.remove("active-tab");
  });
  el.classList.add("active-tab");
}

document.getElementById("filterAll").addEventListener("click", (e) => {
  e.preventDefault();
  currentFilter = "all";
  setActiveTab(e.target);
  renderApplications("all");
});

document.getElementById("filterReview").addEventListener("click", (e) => {
  e.preventDefault();
  currentFilter = "Under Review";
  setActiveTab(e.target);
  renderApplications("Under Review");
});

document.getElementById("filterInterview").addEventListener("click", (e) => {
  e.preventDefault();
  currentFilter = "Interview";
  setActiveTab(e.target);
  renderApplications("Interview");
});

document.getElementById("filterOffered").addEventListener("click", (e) => {
  e.preventDefault();
  currentFilter = "Offered";
  setActiveTab(e.target);
  renderApplications("Offered");
});

document.getElementById("filterRejected").addEventListener("click", (e) => {
  e.preventDefault();
  currentFilter = "Rejected";
  setActiveTab(e.target);
  renderApplications("Rejected");
});

// ── SIDEBAR NAV ───────────────────────────────
document.querySelectorAll(".navbar div").forEach((navItem) => {
  navItem.addEventListener("click", () => {
    document
      .querySelectorAll(".navbar div")
      .forEach((n) => n.classList.remove("home"));
    navItem.classList.add("home");
  });
});

document.querySelector(".My-Application").classList.add("home");

// ── LOGOUT ────────────────────────────────────
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("launchpad_token");
  localStorage.removeItem("launchpad_user");
  window.location.href = "Signin.html";
});

// ── INIT ──────────────────────────────────────
renderApplications("all");
