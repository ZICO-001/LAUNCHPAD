// =============================================
//  LaunchPad — Browse Jobs Page JS
// =============================================

// ── USER INFO ─────────────────────────────────
const user = JSON.parse(localStorage.getItem("launchpad_user") || "null");
if (!user) window.location.href = "Signin.html";

document.getElementById("userName").textContent = user.name;
const parts = user.name.split(" ");
document.getElementById("userAvatar").textContent =
  (parts[0]?.[0] || "") + (parts[1]?.[0] || "");

// ── SAVED JOBS HELPERS ────────────────────────
function getSavedJobs() {
  return JSON.parse(localStorage.getItem("launchpad_saved_jobs") || "[]");
}

function saveJob(job) {
  const saved = getSavedJobs();
  const alreadySaved = saved.find((s) => s.id === job.id);
  if (alreadySaved) return; // already saved, do nothing
  saved.push(job);
  localStorage.setItem("launchpad_saved_jobs", JSON.stringify(saved));
}

function unsaveJob(jobId) {
  const saved = getSavedJobs().filter((s) => s.id !== jobId);
  localStorage.setItem("launchpad_saved_jobs", JSON.stringify(saved));
}

function isJobSaved(jobId) {
  return getSavedJobs().some((s) => s.id === jobId);
}

// ── DUMMY JOBS ────────────────────────────────
const allJobs = [
  {
    id: "1",
    title: "Frontend Developer Intern",
    company: "Paystack",
    location: "Remote",
    workMode: "Remote",
    jobType: "Internship",
    salary: "$300 / month",
    skills: ["React", "Next.js", "TypeScript"],
    posted: "2hrs ago",
  },
  {
    id: "2",
    title: "UI/UX Design Intern",
    company: "TechCorp Ng",
    location: "Remote • Lagos",
    workMode: "Remote",
    jobType: "Internship",
    salary: "$300 / month",
    skills: ["Figma", "Adobe XD"],
    posted: "4hrs ago",
  },
  {
    id: "3",
    title: "Backend Developer Intern",
    company: "Flutterwave",
    location: "Hybrid • Lagos",
    workMode: "Hybrid",
    jobType: "Internship",
    salary: "$350 / month",
    skills: ["Node.js", "Express", "MongoDB"],
    posted: "6hrs ago",
  },
  {
    id: "4",
    title: "Data Analyst Intern",
    company: "Kuda Bank",
    location: "Hybrid",
    workMode: "Hybrid",
    jobType: "Internship",
    salary: "$200 - $300",
    skills: ["Excel", "SQL"],
    posted: "5hrs ago",
  },
  {
    id: "5",
    title: "DevOps Intern",
    company: "StackHQ",
    location: "Remote",
    workMode: "Remote",
    jobType: "Contract",
    salary: "$180 - $300",
    skills: ["Docker", "AWS"],
    posted: "7hrs ago",
  },
  {
    id: "6",
    title: "QA Engineer Intern",
    company: "Carbon",
    location: "Lagos, Nigeria",
    workMode: "On-site",
    jobType: "Full-time",
    salary: "$200 - $300",
    skills: ["Selenium", "JIRA"],
    posted: "7hrs ago",
  },
];

// ── RENDER JOBS ───────────────────────────────
const jobsList = document.getElementById("jobsList");
const jobCount = document.getElementById("jobCount");

function renderJobs(jobs) {
  jobsList.innerHTML = "";
  jobCount.textContent = `${jobs.length} Job Found`;

  if (jobs.length === 0) {
    jobsList.innerHTML =
      "<p style='padding:20px;color:#888'>No jobs match your filter.</p>";
    return;
  }

  jobs.forEach((job) => {
    const saved = isJobSaved(job.id);

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
        <p class="time">${job.jobType}</p>
        <div>
          <img
            src="${saved ? "loginImages/saved-icon.png" : "loginImages/Unsaved-icon.png"}"
            alt="save job"
            class="save-icon"
            data-job-id="${job.id}"
            style="cursor:pointer;"
          />
          <button type="button" onclick="window.location.href='Applypage.html?jobId=${job.id}'">Apply</button>
        </div>
      </div>
    `;

    jobsList.appendChild(card);
  });

  // ── SAVE ICON CLICK HANDLER ──────────────────
  // Runs after cards are in the DOM
  document.querySelectorAll(".save-icon").forEach((icon) => {
    icon.addEventListener("click", () => {
      const jobId = icon.dataset.jobId;
      const job = allJobs.find((j) => j.id === jobId);

      if (isJobSaved(jobId)) {
        // Already saved → unsave it and swap icon back
        unsaveJob(jobId);
        icon.src = "loginImages/Unsaved-icon.png";
      } else {
        // Not saved → save it, swap icon, then remove card from page
        saveJob(job);
        icon.src = "loginImages/saved-icon.png";

        // Find the parent card and fade it out then remove it
        const card = icon.closest(".main-aplication");
        card.style.transition = "opacity 0.4s ease, transform 0.4s ease";
        card.style.opacity = "0";
        card.style.transform = "translateX(30px)";

        setTimeout(() => {
          card.remove();
          // Update the job count shown at the top
          const remaining =
            document.querySelectorAll(".main-aplication").length;
          document.getElementById("jobCount").textContent =
            remaining + " Job Found";
        }, 400);
      }
    });
  });
}

// Initial render
renderJobs(allJobs);

// ── FILTER TOGGLE ─────────────────────────────
const filterToggle = document.getElementById("filterToggle");
const filterCard = document.getElementById("filterCard");
const mainContent = document.getElementById("mainContent");
const header = document.getElementById("head");
const sideView = document.getElementById("sidebar");

filterToggle.addEventListener("click", () => {
  filterCard.style.display = "block";
  mainContent.style.filter = "blur(3px)";
  header.style.filter = "blur(3px)";
  sideView.style.filter = "blur(3px)";
});

document.getElementById("close").addEventListener("click", () => {
  filterCard.style.display = "none";
  header.style.filter = "none";
  sideView.style.filter = "none";
  mainContent.style.filter = "none";
});

// ── APPLY FILTER ──────────────────────────────
document.getElementById("applyFilterBtn").addEventListener("click", () => {
  const jobType = document.querySelector('input[name="jobtype"]:checked');
  const workMode = document.querySelector('input[name="workmode"]:checked');

  let filtered = allJobs;

  if (jobType) {
    filtered = filtered.filter(
      (j) => j.jobType.toLowerCase() === jobType.value.toLowerCase(),
    );
  }
  if (workMode) {
    filtered = filtered.filter(
      (j) => j.workMode.toLowerCase() === workMode.value.toLowerCase(),
    );
  }

  filterCard.style.display = "none";
  mainContent.style.filter = "none";
  header.style.filter = "none";
  sideView.style.filter = "none";
  renderJobs(filtered);
});

// ── ACTIVE NAV ────────────────────────────────
document.querySelectorAll(".navbar div").forEach((navItem) => {
  navItem.addEventListener("click", () => {
    document
      .querySelectorAll(".navbar div")
      .forEach((n) => n.classList.remove("home"));
    navItem.classList.add("home");
  });
});

document.querySelector(".browse").classList.add("home");
document.querySelector(".home").classList.remove("home");

// ── LOGOUT ────────────────────────────────────
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("launchpad_token");
  localStorage.removeItem("launchpad_user");
  window.location.href = "Signin.html";
});
