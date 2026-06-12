// =============================================
//  LaunchPad — Saved Jobs Page JS
// =============================================

// ── USER INFO ─────────────────────────────────
const user = JSON.parse(localStorage.getItem("launchpad_user") || "null");
if (!user) window.location.href = "Signin.html";

document.querySelector(".user h5").textContent = user.name;
const parts = user.name.split(" ");
document.querySelector(".avatar").textContent =
  (parts[0]?.[0] || "") + (parts[1]?.[0] || "");

// ── HELPERS ───────────────────────────────────
function getSavedJobs() {
  return JSON.parse(localStorage.getItem("launchpad_saved_jobs") || "[]");
}

function unsaveJob(jobId) {
  const updated = getSavedJobs().filter((j) => j.id !== jobId);
  localStorage.setItem("launchpad_saved_jobs", JSON.stringify(updated));
}

function getAppliedJobs() {
  return JSON.parse(localStorage.getItem("launchpad_applied_jobs") || "[]");
}

function isApplied(jobId) {
  return getAppliedJobs().some((id) => id === jobId);
}

// ── RENDER ────────────────────────────────────
const container = document.getElementById("savedJobsList");

function renderSavedJobs(filter = "all") {
  const savedJobs = getSavedJobs();

  // Apply filter
  let jobs = savedJobs;
  if (filter === "applied") {
    jobs = savedJobs.filter((j) => isApplied(j.id));
  } else if (filter === "not-applied") {
    jobs = savedJobs.filter((j) => !isApplied(j.id));
  }

  container.innerHTML = "";

  // Empty state
  if (jobs.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding: 60px 20px; color: #888;">
        <p style="font-size:18px; font-weight:500; margin-bottom:8px;">No saved jobs here</p>
        <p style="font-size:14px;">
          ${
            filter === "applied"
              ? "You haven't applied to any saved jobs yet."
              : filter === "not-applied"
                ? "All your saved jobs have been applied to!"
                : "Browse jobs and click the save icon to add them here."
          }
        </p>
        <a href="Browse-job.html" style="display:inline-block; margin-top:20px; color:#1d4edb; font-weight:600;">
          Browse Jobs →
        </a>
      </div>`;
    return;
  }

  jobs.forEach((job) => {
    const applied = isApplied(job.id);
    const card = document.createElement("div");
    card.className = "main-aplication";
    card.innerHTML = `
      <div class="first-application">
        <div class="Logo"><p>${job.company[0]}</p></div>
        <div class="job-description">
          <div class="job-title"><h4>${job.title}</h4></div>
          <div class="job-details">
            <p class="pay">${job.company}</p>
            <p class="pay">${job.location}</p>
            <p>• Posted ${job.posted}</p>
          </div>
          <div class="stack">
            ${job.skills.map((s) => `<p>${s}</p>`).join("")}
          </div>
        </div>
      </div>
      <div class="Apply-sec">
        <h4>${job.salary}</h4>
        <p class="time" style="color:${applied ? "#16a34a" : "#888"};">
          ${applied ? "✓ Applied" : job.jobType}
        </p>
        <div>
          <img
            src="loginImages/saved-icon.png"
            alt="unsave"
            class="unsave-icon"
            data-job-id="${job.id}"
            style="cursor:pointer;"
            title="Remove from saved"
          />
          <button
            type="button"
            ${applied ? 'style="background-color:#16a34a; cursor:default;"' : ""}
            onclick="${applied ? "" : `window.location.href='Applypage.html?jobId=${job.id}'`}"
          >
            <a href="${applied ? "#" : `Applypage.html?jobId=${job.id}`}"
               style="color:#fff; text-decoration:none; pointer-events:${applied ? "none" : "auto"};">
              ${applied ? "Applied" : "Apply"}
            </a>
          </button>
        </div>
      </div>
    `;
    container.appendChild(card);
    // ── SAVE ICON CLICK HANDLER ──────────────────
    document.querySelectorAll(".save-icon").forEach((icon) => {
      icon.addEventListener("click", () => {
        const jobId = icon.dataset.jobId;
        const job = allJobs.find((j) => j.id === jobId);

        if (isJobSaved(jobId)) {
          unsaveJob(jobId);
          icon.src = "loginImages/Unsaved-icon.png";
          icon.closest(".main-aplication").querySelector(".time").textContent =
            job.jobType;
        } else {
          saveJob(job);
          icon.src = "loginImages/saved-icon.png";
          icon.closest(".main-aplication").querySelector(".time").textContent =
            "Saved ✓";
        }
      });
    });
  });

  // ── UNSAVE CLICK ────────────────────────────
  // Clicking the save icon removes it from saved jobs and re-renders
  document.querySelectorAll(".unsave-icon").forEach((icon) => {
    icon.addEventListener("click", () => {
      const jobId = icon.dataset.jobId;
      unsaveJob(jobId);
      renderSavedJobs(currentFilter); // re-render same filter after removal
    });
  });
}

// ── FILTER NAV ────────────────────────────────
let currentFilter = "all";

// Set active style on clicked tab, remove from others
function setActiveTab(clickedEl) {
  document.querySelectorAll(".profile-nav a").forEach((a) => {
    a.style.borderBottom = "none";
    a.style.color = "#000";
  });
  clickedEl.style.borderBottom = "2px solid #0f1ef3";
  clickedEl.style.color = "#1d4ed8";
}

document.getElementById("filterAll").addEventListener("click", (e) => {
  e.preventDefault();
  currentFilter = "all";
  setActiveTab(e.target);
  renderSavedJobs("all");
});

document.getElementById("filterNotApplied").addEventListener("click", (e) => {
  e.preventDefault();
  currentFilter = "not-applied";
  setActiveTab(e.target);
  renderSavedJobs("not-applied");
});

document.getElementById("filterApplied").addEventListener("click", (e) => {
  e.preventDefault();
  currentFilter = "applied";
  setActiveTab(e.target);
  renderSavedJobs("applied");
});

// ── ACTIVE SIDEBAR NAV ────────────────────────
document.querySelectorAll(".navbar div").forEach((navItem) => {
  navItem.addEventListener("click", () => {
    document
      .querySelectorAll(".navbar div")
      .forEach((n) => n.classList.remove("home"));
    navItem.classList.add("home");
  });
});

// Mark Saved Jobs as active on load
document.querySelector(".Saved-job").classList.add("home");
document.querySelector(".home").classList.remove("home");

// ── LOGOUT ────────────────────────────────────
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("launchpad_token");
  localStorage.removeItem("launchpad_user");
  window.location.href = "Signin.html";
});
const navHome = document.getElementById("navHome");
const navBrowse = document.getElementById("navBrowse");
const navSaved = document.getElementById("navSaved");
const navApplication = document.getElementById("navApplication");
const navProfile = document.getElementById("navProfile");

if (navHome)
  navHome.addEventListener(
    "click",
    () => (window.location.href = "JobSeeker-Dashboard.html"),
  );
if (navBrowse)
  navBrowse.addEventListener(
    "click",
    () => (window.location.href = "Browse-job.html"),
  );
if (navSaved)
  navSaved.addEventListener(
    "click",
    () => (window.location.href = "Saved-jobs.html"),
  );
if (navApplication)
  navApplication.addEventListener(
    "click",
    () => (window.location.href = "Appllication.html"),
  );
if (navProfile)
  navProfile.addEventListener(
    "click",
    () => (window.location.href = "profile.html"),
  );

// ── INITIAL RENDER ────────────────────────────
renderSavedJobs("all");
