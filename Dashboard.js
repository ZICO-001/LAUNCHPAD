// =============================================
//  LaunchPad — Employer Dashboard JavaScript
//  Targets:
//    #greetingName, #userAvatar, #userName,
//    #searchInput, #postJobBtn,
//    #totalApplicants, #newApplicants,
//    #shortlisted, #conversionRate, #conversionFill,
//    #jobPostsBody, #viewAllJobs,
//    #topJobTitle, #topApplicantsCount, #topTrend,
//    #activityList, #logoutBtn,
//    #nav-home, #nav-jobs, #nav-applicants,
//    #nav-pipeline, #nav-profile
// =============================================

const BASE_URL = "https://your-api-domain.com/api";

// ── AUTH GUARD ────────────────────────────────
const token = localStorage.getItem("launchpad_token");
const user = JSON.parse(localStorage.getItem("launchpad_user") || "null");

// if (!token || !user || user.role !== "employer") {
//   window.location.href = "Signin.html";
// }

// ── ELEMENT REFS ──────────────────────────────
const greetingName = document.getElementById("greetingName");
const userAvatar = document.getElementById("userAvatar");
const userNameEl = document.getElementById("userName");
const searchInput = document.getElementById("searchInput");
const postJobBtn = document.getElementById("postJobBtn");
const totalApplicants = document.getElementById("totalApplicants");
const newApplicants = document.getElementById("newApplicants");
const shortlistedEl = document.getElementById("shortlisted");
const conversionRate = document.getElementById("conversionRate");
const conversionFill = document.getElementById("conversionFill");
const jobPostsBody = document.getElementById("jobPostsBody");
const viewAllJobs = document.getElementById("viewAllJobs");
const topJobTitle = document.getElementById("topJobTitle");
const topApplicants = document.getElementById("topApplicantsCount");
const topTrend = document.getElementById("topTrend");
const activityList = document.getElementById("activityList");
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

  if (greetingName) greetingName.textContent = firstName;
  if (userAvatar) userAvatar.textContent = initials;
  if (userNameEl) userNameEl.textContent = `${firstName} ${lastName}`.trim();
}

// ── NAVIGATION ────────────────────────────────
// Highlights the active nav item and handles page routing

const navItems = {
  "nav-home": null, // current page
  "nav-jobs": "EmployerJobs.html",
  "nav-applicants": "EmployerApplicants.html",
  "nav-pipeline": "EmployerPipeline.html",
  "nav-profile": "EmployerProfile.html",
};

Object.keys(navItems).forEach((id) => {
  const el = document.getElementById(id);
  if (!el) return;

  el.addEventListener("click", () => {
    // Remove active from all
    document
      .querySelectorAll(".navbar div")
      .forEach((d) => d.classList.remove("active-nav"));
    // Set active on clicked
    el.classList.add("active-nav");

    const href = navItems[id];
    if (href) window.location.href = href;
  });
});

// ── FETCH EMPLOYER STATS ──────────────────────
// GET /api/employer/stats
// Returns: {
//   total_applicants, applicants_trend,
//   new_applicants, shortlisted,
//   conversion_rate
// }

async function fetchStats() {
  try {
    const res = await fetch(`${BASE_URL}/employer/stats`, {
      headers: authHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    if (totalApplicants)
      totalApplicants.textContent = data.total_applicants ?? "—";
    if (newApplicants) newApplicants.textContent = data.new_applicants ?? "—";
    if (shortlistedEl) shortlistedEl.textContent = data.shortlisted ?? "—";

    const rate = data.conversion_rate ?? 0;
    if (conversionRate) conversionRate.textContent = `${rate}%`;
    if (conversionFill) conversionFill.style.width = `${rate}%`;

    const trend = document.getElementById("applicantsTrend");
    if (trend && data.applicants_trend) {
      trend.textContent = data.applicants_trend; // e.g "+4% from last month"
    }
  } catch (err) {
    console.error("Stats error:", err);
  }
}

// ── FETCH RECENT JOB POSTS ────────────────────
// GET /api/employer/jobs?limit=3
// Returns: [{
//   id, title, department, type,
//   posted_at, applicants_count, status
// }]

let showingAllPosts = false;

async function fetchJobPosts(showAll = false) {
  try {
    const limit = showAll ? "" : "?limit=3";
    const res = await fetch(`${BASE_URL}/employer/jobs${limit}`, {
      headers: authHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    renderJobPosts(data.jobs || data);
    if (showAll) {
      showingAllPosts = true;
      if (viewAllJobs) viewAllJobs.style.display = "none";
    }
  } catch (err) {
    console.error("Job posts error:", err);
    if (jobPostsBody) {
      jobPostsBody.innerHTML = `
        <tr>
          <td colspan="4" style="text-align:center;color:#dc2626;padding:20px;">
            Could not load job posts.
          </td>
        </tr>`;
    }
  }
}

function renderJobPosts(jobs) {
  if (!jobPostsBody) return;
  jobPostsBody.innerHTML = "";

  if (!jobs.length) {
    jobPostsBody.innerHTML = `
      <tr>
        <td colspan="4" style="text-align:center;padding:30px;color:#888;">
          No job posts yet. Click <strong>+ Post a Job</strong> to get started.
        </td>
      </tr>`;
    return;
  }

  jobs.forEach((job) => {
    const statusClass =
      {
        active: "status-active",
        closed: "status-closed",
        draft: "status-draft",
        paused: "status-paused",
      }[job.status?.toLowerCase()] || "status-draft";

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>
        <p class="job-role-title">${job.title}</p>
        <p class="job-role-sub">${job.department || ""} · ${job.type || ""}</p>
      </td>
      <td>${formatTimeAgo(job.posted_at)}</td>
      <td>
        <span class="applicant-badge">${job.applicants_count ?? 0}</span>
      </td>
      <td>
        <span class="status-badge ${statusClass}">
          ${capitalize(job.status || "Draft")}
        </span>
      </td>
    `;
    row.style.cursor = "pointer";
    row.addEventListener("click", () => {
      window.location.href = `EmployerApplicants.html?job=${job.id}`;
    });
    jobPostsBody.appendChild(row);
  });
}

// ── FETCH TOP PERFORMER ───────────────────────
// GET /api/employer/jobs/top-performer
// Returns: { title, applicants_this_week, trend_percent }

async function fetchTopPerformer() {
  try {
    const res = await fetch(`${BASE_URL}/employer/jobs/top-performer`, {
      headers: authHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    if (topJobTitle) topJobTitle.textContent = data.title || "—";
    if (topApplicants)
      topApplicants.textContent = data.applicants_this_week ?? "—";
    if (topTrend && data.trend_percent != null) {
      const up = data.trend_percent >= 0;
      topTrend.textContent = `${up ? "↑" : "↓"} ${Math.abs(data.trend_percent)}% ${up ? "more" : "less"} than last week`;
      topTrend.className = `trend ${up ? "green" : "red"}`;
    }
  } catch (err) {
    console.error("Top performer error:", err);
  }
}

// ── FETCH RECENT ACTIVITY ─────────────────────
// GET /api/employer/activity?limit=5
// Returns: [{
//   type: "application"|"moved"|"message",
//   message, highlight, time
// }]

async function fetchActivity() {
  try {
    const res = await fetch(`${BASE_URL}/employer/activity?limit=5`, {
      headers: authHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    renderActivity(data.activities || data);
  } catch (err) {
    console.error("Activity error:", err);
    if (activityList) {
      activityList.innerHTML = `<li style="padding:16px;color:#888;font-size:14px;">No recent activity.</li>`;
    }
  }
}

function renderActivity(activities) {
  if (!activityList) return;
  activityList.innerHTML = "";

  if (!activities.length) {
    activityList.innerHTML = `<li style="padding:16px;color:#888;font-size:14px;">No recent activity.</li>`;
    return;
  }

  const iconMap = {
    application: { emoji: "📋", cls: "dot-blue" },
    moved: { emoji: "🔀", cls: "dot-orange" },
    message: { emoji: "💬", cls: "dot-green" },
  };

  activities.forEach((item) => {
    const icon = iconMap[item.type] || { emoji: "📌", cls: "dot-blue" };

    // Replace highlight word in message with a blue <span>
    const message = item.highlight
      ? item.message.replace(item.highlight, `<span>${item.highlight}</span>`)
      : item.message;

    const li = document.createElement("li");
    li.className = "activity-item";
    li.innerHTML = `
      <div class="activity-dot ${icon.cls}">${icon.emoji}</div>
      <div class="activity-text">
        <p>${message}</p>
        <small>${formatTimeAgo(item.time)}</small>
      </div>
    `;
    activityList.appendChild(li);
  });
}

// ── VIEW ALL JOBS ─────────────────────────────
if (viewAllJobs) {
  viewAllJobs.addEventListener("click", (e) => {
    e.preventDefault();
    if (!showingAllPosts) fetchJobPosts(true);
  });
}

// ── POST A JOB BUTTON ─────────────────────────
// Redirects to the Post Job page
if (postJobBtn) {
  postJobBtn.addEventListener("click", () => {
    window.location.href = "PostJob.html";
  });
}

// ── SEARCH ────────────────────────────────────
// GET /api/employer/search?q=<query>
// Searches across jobs and applicants

let searchTimeout = null;

if (searchInput) {
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      clearTimeout(searchTimeout);
      const q = searchInput.value.trim();
      if (q) searchEmployer(q);
    }
  });
  searchInput.addEventListener("input", () => {
    clearTimeout(searchTimeout);
    const q = searchInput.value.trim();
    if (q.length >= 3) {
      searchTimeout = setTimeout(() => searchEmployer(q), 500);
    } else if (!q) {
      fetchJobPosts();
    }
  });
}

async function searchEmployer(query) {
  try {
    const res = await fetch(
      `${BASE_URL}/employer/search?q=${encodeURIComponent(query)}`,
      { headers: authHeaders() },
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    renderJobPosts(data.jobs || []);
  } catch (err) {
    console.error("Search error:", err);
  }
}

// ── LOGOUT ────────────────────────────────────
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("launchpad_token");
    localStorage.removeItem("launchpad_user");
    window.location.href = "Signin.html";
  });
}

// ── HELPERS ───────────────────────────────────
function formatTimeAgo(dateString) {
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

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// ── INIT ──────────────────────────────────────
function init() {
  populateUserInfo();
  fetchStats();
  fetchJobPosts();
  fetchTopPerformer();
  fetchActivity();
}

init();
