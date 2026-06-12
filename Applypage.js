// =============================================
//  LaunchPad — Apply Page JS
// =============================================

// ── USER INFO ─────────────────────────────────
const user = JSON.parse(localStorage.getItem("launchpad_user") || "null");
if (!user) window.location.href = "Signin.html";

document.getElementById("userName").textContent =
  user.firstName + " " + user.lastName;
document.getElementById("userAvatar").textContent =
  (user.firstName?.[0] || "") + (user.lastName?.[0] || "");

// ── JOB INFO FROM URL ─────────────────────────
const urlParams = new URLSearchParams(window.location.search);
const jobId = urlParams.get("jobId");

const allJobs = JSON.parse(localStorage.getItem("launchpad_jobs") || "[]");
const job = allJobs.find((j) => j.id === jobId) || {
  id: jobId || "0",
  title: "UI/UX Design Intern",
  company: "TechCorp NG",
  location: "Lagos, Nigeria",
};

// ── PROFILE DATA ──────────────────────────────
const profile = JSON.parse(
  localStorage.getItem("launchpad_profile_" + user.id) || "{}",
);

// ── RESUME STATE ──────────────────────────────
// Tracks whichever resume the user picks or uploads
let resumeFile = null;
let resumeFileName = "";
let coverLetter = "";
let usingSavedResume = false;

// ── AUTO FILL STEP 1 ──────────────────────────
document.getElementById("appFullName").value =
  profile.name || user.firstName + " " + user.lastName;
document.getElementById("appEmail").value = user.email || "";
document.getElementById("appLocation").value = profile.location || "";

// ── STEP MANAGER ──────────────────────────────
function goToStep(step) {
  // Hide all steps
  document.getElementById("step1Content").style.display = "none";
  document.getElementById("step2Content").style.display = "none";
  document.getElementById("step3Content").style.display = "none";
  document.getElementById("step4Content").style.display = "none";

  // Show the target step
  document.getElementById("step" + step + "Content").style.display = "block";

  // Update indicators
  updateStepIndicators(step);

  // If going to preview, populate it
  if (step === 3) populatePreview();
}

function updateStepIndicators(activeStep) {
  for (let i = 1; i <= 3; i++) {
    const num = document.getElementById("num" + i);
    const card = document.getElementById("stepCard" + i);
    const link = card.querySelector("a");

    if (i < activeStep) {
      // Completed step — green checkmark
      num.style.backgroundColor = "#16a34a";
      num.textContent = "✓";
      link.style.color = "#16a34a";
      card.style.borderBottom = "none";
    } else if (i === activeStep) {
      // Active step — blue
      num.style.backgroundColor = "#1d4edb";
      num.textContent = i;
      link.style.color = "#1d4edb";
      card.style.borderBottom = "2px solid #1d4edb";
    } else {
      // Future step — grey
      num.style.backgroundColor = "#d1d1d1";
      num.textContent = i;
      link.style.color = "#d1d1d1";
      card.style.borderBottom = "none";
    }
  }
}

// ── STEP 1 — NEXT BUTTON ──────────────────────
document.getElementById("nextStepBtn").addEventListener("click", () => {
  const name = document.getElementById("appFullName").value.trim();
  const email = document.getElementById("appEmail").value.trim();
  const phone = document.getElementById("appPhone").value.trim();
  const location = document.getElementById("appLocation").value.trim();
  const errorEl = document.getElementById("step1Error");

  if (!name || !email || !phone || !location) {
    errorEl.textContent =
      "Please fill in Full Name, Email, Phone and Location.";
    return;
  }

  errorEl.textContent = "";
  goToStep(2);
  setupStep2();
});

// ── STEP 2 — SETUP ────────────────────────────
function setupStep2() {
  // Show saved resume card if user has one in their profile
  const savedSection = document.getElementById("savedResumeSection");
  const savedTitle = document.getElementById("savedResumeTitle");

  if (profile.resumeName) {
    savedSection.style.display = "block";
    savedTitle.textContent = profile.resumeName;
  }

  // Browse files button
  document.getElementById("browseFilesBtn").addEventListener("click", () => {
    document.getElementById("resumeFileInput").click();
  });

  // File input change
  document.getElementById("resumeFileInput").addEventListener("change", (e) => {
    handleResumeUpload(e.target.files[0]);
  });

  // Drag and drop
  const dropZone = document.getElementById("dropZone");

  dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.style.borderColor = "#1d4edb";
    dropZone.style.background = "#eff4ff";
  });

  dropZone.addEventListener("dragleave", () => {
    dropZone.style.borderColor = "#bfc8d6";
    dropZone.style.background = "#fff";
  });

  dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleResumeUpload(file);
  });

  // Saved resume card click
  document.getElementById("savedResumeCard").addEventListener("click", () => {
    const check = document.getElementById("savedResumeCheck");

    if (usingSavedResume) {
      // Deselect
      usingSavedResume = false;
      resumeFile = null;
      resumeFileName = "";
      document.getElementById("savedResumeCard").style.borderColor = "#bfc8d6";
      check.style.background = "#fff";
      check.style.borderColor = "#bfc8d6";
      check.textContent = "";
    } else {
      // Select saved resume
      usingSavedResume = true;
      resumeFile = profile.resume || "saved";
      resumeFileName = profile.resumeName;
      document.getElementById("savedResumeCard").style.borderColor = "#1d4edb";
      check.style.background = "#1d4edb";
      check.style.borderColor = "#1d4edb";
      check.style.color = "#fff";
      check.textContent = "✓";
    }
  });

  // Clear uploaded file button
  document.getElementById("clearUploadBtn").addEventListener("click", () => {
    resumeFile = null;
    resumeFileName = "";
    document.getElementById("uploadedFileTag").style.display = "none";
    document.getElementById("resumeFileInput").value = "";
    document.getElementById("dropZone").style.borderColor = "#bfc8d6";
    document.getElementById("dropZone").style.background = "#fff";
  });

  // Cover letter toolbar buttons
  document.querySelector(".bold-btn").addEventListener("click", () => {
    document.getElementById("coverLetterBox").focus();
    document.execCommand("bold", false, null);
  });
  document.querySelector(".italic-btn").addEventListener("click", () => {
    document.getElementById("coverLetterBox").focus();
    document.execCommand("italic", false, null);
  });
  document.querySelector(".list-btn").addEventListener("click", () => {
    document.getElementById("coverLetterBox").focus();
    document.execCommand("insertUnorderedList", false, null);
  });

  // Back button
  document.getElementById("backToStep1Btn").addEventListener("click", () => {
    goToStep(1);
  });

  // Submit / go to preview button
  document.getElementById("toPreviewBtn").addEventListener("click", () => {
    const errorEl = document.getElementById("step2Error");
    coverLetter = document.getElementById("coverLetterBox").innerText.trim();

    if (!resumeFileName) {
      errorEl.textContent =
        "Please select or upload a resume before continuing.";
      return;
    }

    errorEl.textContent = "";
    goToStep(3);
  });
}

// ── HANDLE RESUME FILE UPLOAD ─────────────────
function handleResumeUpload(file) {
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    alert("File is too large. Maximum size is 5MB.");
    return;
  }

  resumeFileName = file.name;
  usingSavedResume = false;

  // Deselect saved resume card if it was selected
  const check = document.getElementById("savedResumeCheck");
  const savedCard = document.getElementById("savedResumeCard");
  if (savedCard) {
    savedCard.style.borderColor = "#bfc8d6";
    check.style.background = "#fff";
    check.textContent = "";
  }

  // Read file as base64
  const reader = new FileReader();
  reader.onload = (ev) => {
    resumeFile = ev.target.result;
  };
  reader.readAsDataURL(file);

  // Show uploaded file tag
  document.getElementById("uploadedFileName").textContent = file.name;
  document.getElementById("uploadedFileTag").style.display = "flex";

  // Highlight drop zone
  document.getElementById("dropZone").style.borderColor = "#1d4edb";
  document.getElementById("dropZone").style.background = "#eff4ff";
}

// ── STEP 3 — POPULATE PREVIEW ─────────────────
function populatePreview() {
  const name = document.getElementById("appFullName").value;
  const email = document.getElementById("appEmail").value;
  const phone = document.getElementById("appPhone").value;
  const location = document.getElementById("appLocation").value;

  // Review card fields
  document.getElementById("previewName").textContent = name;
  document.getElementById("previewEmail").textContent = email;
  document.getElementById("previewPhone").textContent = phone;
  document.getElementById("previewLocation").textContent = location;
  document.getElementById("previewResume").textContent = resumeFileName || "—";

  // Summary card
  document.getElementById("summaryJobLogo").textContent = job.company[0];
  document.getElementById("summaryJobTitle").textContent = job.title;
  document.getElementById("summaryJobSub").textContent =
    job.company + " • " + job.location;
  document.getElementById("summaryApplicantName").textContent = name;
  document.getElementById("summaryApplicantEmail").textContent = email;
  document.getElementById("summaryPhone").textContent = phone;
  document.getElementById("summaryResume").textContent =
    "✓ " + (resumeFileName || "Not uploaded");
  document.getElementById("summaryCoverNote").textContent =
    coverLetter || "Not added yet";

  // Back and submit buttons
  document.getElementById("backToStep2Btn").addEventListener("click", () => {
    goToStep(2);
  });

  document.getElementById("submitAppBtn").addEventListener("click", () => {
    submitApplication();
  });
}

// ── SUBMIT APPLICATION ────────────────────────
function submitApplication() {
  const name = document.getElementById("appFullName").value;
  const email = document.getElementById("appEmail").value;
  const phone = document.getElementById("appPhone").value;
  const location = document.getElementById("appLocation").value;

  const appliedDate = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const newApp = {
    id: Date.now().toString(),
    jobId: job.id,
    jobTitle: job.title,
    company: job.company,
    location: location,
    applicantName: name,
    email: email,
    phone: phone,
    appliedDate: appliedDate,
    status: "Under Review",
    resume: resumeFileName,
    coverLetter: coverLetter,
  };

  // Save to applications list
  const applications = JSON.parse(
    localStorage.getItem("launchpad_applications") || "[]",
  );
  applications.push(newApp);
  localStorage.setItem("launchpad_applications", JSON.stringify(applications));

  // Save job ID to applied jobs (used by Saved Jobs page filter)
  const appliedIds = JSON.parse(
    localStorage.getItem("launchpad_applied_jobs") || "[]",
  );
  if (!appliedIds.includes(job.id)) {
    appliedIds.push(job.id);
    localStorage.setItem("launchpad_applied_jobs", JSON.stringify(appliedIds));
  }

  // Go to success screen
  goToStep(4);
  showSuccessScreen(newApp);
}

// ── STEP 4 — SUCCESS SCREEN ───────────────────
function showSuccessScreen(app) {
  // Update step 3 indicator to complete too
  updateStepIndicators(4);

  // Fill in success content
  document.getElementById("successMessage").innerHTML =
    "You have successfully applied for the <strong>" +
    app.jobTitle +
    "</strong> position at <strong>" +
    app.company +
    "</strong>.";

  document.getElementById("successRole").textContent = app.jobTitle;
  document.getElementById("successCompany").textContent = app.company;
  document.getElementById("successDate").textContent = app.appliedDate;

  // Button actions
  document
    .getElementById("viewApplicationsBtn")
    .addEventListener("click", () => {
      window.location.href = "Appllication.html";
    });

  document.getElementById("browseMoreBtn").addEventListener("click", () => {
    window.location.href = "Browse-job.html";
  });
}

// ── BACK ARROW ────────────────────────────────
document.getElementById("backArrow").addEventListener("click", () => {
  window.location.href = "Browse-job.html";
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

// ── LOGOUT ────────────────────────────────────
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("launchpad_token");
  localStorage.removeItem("launchpad_user");
  window.location.href = "Signin.html";
});

// ── INIT ──────────────────────────────────────
updateStepIndicators(1);
