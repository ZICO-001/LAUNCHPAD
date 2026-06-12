// =============================================
//  LaunchPad — Job Seeker Dashboard JS
// =============================================

// ── GET LOGGED IN USER ────────────────────────
const user = JSON.parse(localStorage.getItem("launchpad_user") || "null");
console.log("User from localStorage:", user); // remove after confirming
// console.log(user.first_name.split);

// If no user found, redirect to sign in
if (!user) {
  window.location.href = "Signin.html";
}

// ── SHOW FIRST NAME IN GREETING ───────────────
const greetingName = document.getElementById("greetingName");
if (greetingName && user) {
  const firstName = user.firstName || user.name?.split(" ")[0] || "thereB";
  greetingName.textContent = firstName;
}

// ── SHOW USER INFO IN HEADER ──────────────────
const userName = document.getElementById("userName");
const userAvatar = document.getElementById("userAvatar");

if (userName && user) {
  const first = user.firstName || user.first_name || "";
  const last = user.lastName || user.last_name || "";
  const fullName = `${first} ${last}`.trim() || user.name || "User";
  userName.textContent = fullName;
}

if (userAvatar && user) {
  const first =
    user.firstName || user.first_name || user.name?.split(" ")[0] || "";
  const last =
    user.lastName || user.last_name || user.name?.split(" ")[1] || "";
  userAvatar.textContent =
    `${first.charAt(0)}${last.charAt(0)}`.toUpperCase() || "U";
}

// ── DUMMY JOBS DATA ───────────────────────────
const dummyJobs = [
  {
    id: "1",
    title: "Frontend Developer Intern",
    company: "Paystack",
    location: "Remote • Lagos",
    salary: "$300 / month",
    posted: "2hrs ago",
    skills: ["React", "Next.js", "TypeScript"],
    logo: "P",
  },
  {
    id: "2",
    title: "UI/UX Design Intern",
    company: "TechCorp Ng",
    location: "Remote • Lagos",
    salary: "$300 / month",
    posted: "4hrs ago",
    skills: ["Figma", "Adobe XD"],
    logo: "T",
  },
  {
    id: "3",
    title: "Backend Developer Intern",
    company: "Flutterwave",
    location: "Hybrid • Lagos",
    salary: "$350 / month",
    posted: "6hrs ago",
    skills: ["Node.js", "Express", "MongoDB"],
    logo: "F",
  },
  {
    id: "4",
    title: "Data Analyst Intern",
    company: "Kuda Bank",
    location: "Hybrid",
    salary: "$200 - $300",
    posted: "5hrs ago",
    skills: ["Excel", "SQL"],
    logo: "K",
  },
  {
    id: "5",
    title: "DevOps Intern",
    company: "StackHQ",
    location: "Remote",
    salary: "$180 - $300",
    posted: "7hrs ago",
    skills: ["Docker", "AWS"],
    logo: "S",
  },
  {
    id: "6",
    title: "QA Engineer Intern",
    company: "Carbon",
    location: "Lagos, Nigeria",
    salary: "$200 - $300",
    posted: "7hrs ago",
    skills: ["Selenium", "JIRA"],
    logo: "C",
  },
];

// ── RENDER OPPORTUNITY CARDS ──────────────────
const opportunityCards = document.getElementById("opportunityCards");

function renderCards(jobs) {
  if (!opportunityCards) return;
  opportunityCards.innerHTML = "";

  jobs.slice(0, 3).forEach((job) => {
    const card = document.createElement("div");
    card.className = "card1";
    card.innerHTML = `
      <div class="head">
        <p class="Logo">${job.logo}</p>
        <div class="verified">
          <img src="images/verified-icon.png" alt="" />
          <p>verified</p>
        </div>
      </div>
      <h4>${job.title}</h4>
      <p class="pay">${job.company}</p>
      <p class="pay">${job.location}</p>
      <h3>${job.salary}</h3>
      <div class="stack">
        ${job.skills.map((s) => `<p>${s}</p>`).join("")}
      </div>
      <div class="Apply-sec">
        <p class="time">posted ${job.posted}</p>
        <button type="button" class="apply-btn" data-id="${job.id}">Apply</button>
      </div>
    `;
    opportunityCards.appendChild(card);
  });

  wireApplyButtons();
}

// ── RENDER TABLE ROWS ─────────────────────────
const jobsTableBody = document.getElementById("jobsTableBody");

function renderTable(jobs) {
  if (!jobsTableBody) return;
  jobsTableBody.innerHTML = "";

  jobs.slice(0, 3).forEach((job) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${job.title}</td>
      <td>${job.company}</td>
      <td>${job.location}</td>
      <td>${job.salary}</td>
      <td>${job.posted}</td>
      <td>
        <button type="button" class="apply-btn" data-id="${job.id}"
          style="
            background-color:#1d4edb;
            color:#fff;
            padding:6px 16px;
            border-radius:8px;
            border:none;
            cursor:pointer;
            font-size:14px;
          ">
          Apply
        </button>
      </td>
    `;
    jobsTableBody.appendChild(row);
  });

  wireApplyButtons();
}

// ── APPLY BUTTON HANDLER ──────────────────────
function wireApplyButtons() {
  document.querySelectorAll(".apply-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const jobId = e.target.dataset.id;
      window.location.href = `Applypage.html?jobId=${jobId}`;
    });
  });
}

// ── LOAD JOBS ─────────────────────────────────
renderCards(dummyJobs);
renderTable(dummyJobs);

// ── VIEW ALL JOBS LINKS ───────────────────────
const viewAllVerified = document.getElementById("viewAllVerified");
const viewAllJobs = document.getElementById("viewAllJobs");

if (viewAllVerified) {
  viewAllVerified.addEventListener("click", (e) => {
    e.preventDefault();
    window.location.href = "Browse-job.html";
  });
}

if (viewAllJobs) {
  viewAllJobs.addEventListener("click", (e) => {
    e.preventDefault();
    window.location.href = "Browse-job.html";
  });
}

// ── LOGOUT ────────────────────────────────────
const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("launchpad_token");
    localStorage.removeItem("launchpad_user");
    window.location.href = "Signin.html";
  });
}

// ── NAVIGATION ────────────────────────────────
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
