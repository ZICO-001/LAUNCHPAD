// =============================================
//  LaunchPad — Sign In Page JavaScript
// =============================================

const BASE_URL = "https://lunchpad-backend-1.onrender.com/api";

// ── STATE ─────────────────────────────────────
let selectedRole = null;

// ── ELEMENT REFERENCES ────────────────────────
const jobSeekerBtn = document.getElementById("jobSeekerBtn");
const employerBtn = document.getElementById("employerBtn");
const emailInput = document.getElementById("signInEmail");
const passwordInput = document.getElementById("signInPassword");
const termsCheckbox = document.getElementById("termsCheckbox");
const signInBtn = document.getElementById("signInBtn");
const signInForm = document.getElementById("signInForm");
const passwordToggle = document.getElementById("passwordToggle");

// ── PREVENT FORM DEFAULT SUBMIT ───────────────
// This stops the form from clearing/refreshing the page
if (signInForm) {
  signInForm.addEventListener("submit", (e) => e.preventDefault());
}

// ── ROLE SELECTION ────────────────────────────
function setActiveRole(role) {
  selectedRole = role;

  jobSeekerBtn.style.backgroundColor = "";
  jobSeekerBtn.style.color = "";
  employerBtn.style.backgroundColor = "";
  employerBtn.style.color = "";

  if (role === "applicant") {
    jobSeekerBtn.style.backgroundColor = "#1d4edb";
    jobSeekerBtn.style.color = "#fff";
  } else if (role === "employer") {
    employerBtn.style.backgroundColor = "#1d4edb";
    employerBtn.style.color = "#fff";
  }
}

jobSeekerBtn.addEventListener("click", () => setActiveRole("applicant"));
employerBtn.addEventListener("click", () => setActiveRole("employer"));

// ── PASSWORD TOGGLE ────────────────────────────
if (passwordToggle) {
  passwordToggle.addEventListener("click", () => {
    const isHidden = passwordInput.type === "password";
    passwordInput.type = isHidden ? "text" : "password";
    passwordToggle.src = isHidden
      ? "loginImages/password-icon-open.png"
      : "loginImages/password-icon.png";
  });
}

// ── VALIDATION ────────────────────────────────
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateForm() {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!selectedRole) {
    showError("Please select a role: Job Seeker or Employer.");
    return false;
  }
  if (!email || !isValidEmail(email)) {
    showError("Please enter a valid email address.");
    emailInput.focus();
    return false;
  }
  if (!password) {
    showError("Please enter your password.");
    passwordInput.focus();
    return false;
  }
  if (!termsCheckbox.checked) {
    showError("You must agree to the Terms of Service and Privacy Policy.");
    return false;
  }
  return true;
}

// ── UI HELPERS ────────────────────────────────
function showError(message) {
  let errorEl = document.getElementById("formError");
  if (!errorEl) {
    errorEl = document.createElement("p");
    errorEl.id = "formError";
    errorEl.style.cssText =
      "color:#dc2626; font-size:14px; margin-bottom:10px; text-align:center;";
    signInForm.prepend(errorEl);
  }
  errorEl.textContent = message;
  errorEl.style.display = "block";
}

function clearError() {
  const errorEl = document.getElementById("formError");
  if (errorEl) errorEl.style.display = "none";
}

function setLoading(isLoading) {
  signInBtn.disabled = isLoading;
  signInBtn.textContent = isLoading ? "Signing in…" : "Sign In";
}

// ── REDIRECT ──────────────────────────────────
function redirectToDashboard(role) {
  if (role === "employer") {
    window.location.href = "EmployerDashboard.html";
  } else {
    window.location.href = "JobSeeker-Dashboard.html";
  }
}

// ── LOGIN API ─────────────────────────────────
// POST /api/auth/login
// Body:    { email, password }
// Returns: { success, message, data: { token, firstName, lastName, email, role, _id } }

async function loginUser(email, password) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const contentType = res.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    throw new Error("Server error. Please try again later.");
  }

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Sign in failed. Please try again.");
  }

  return json.data;
}

// ── SIGN IN CLICK ─────────────────────────────
signInBtn.addEventListener("click", async (e) => {
  e.preventDefault(); // extra safety — stops any form submit
  clearError();
  if (!validateForm()) return;

  setLoading(true);
  try {
    const data = await loginUser(emailInput.value.trim(), passwordInput.value);
    // alert(data);

    console.log("Login response:", data); // remove after confirming

    // Check role matches selection
    if (data.role !== selectedRole) {
      const roleName = selectedRole === "employer" ? "Employer" : "Job Seeker";
      throw new Error(`This account is not registered as a ${roleName}.`);
    }

    // ── Save user — fallback to email prefix if name is empty ──
    const emailPrefix = data.email?.split("@")[0] || "";
    const firstName = data.firstName || data.firstName || emailPrefix || "";
    const lastName = data.lastName || data.lastName || "";

    const user = {
      _id: data._id || data.id || "",
      firstName,
      lastName,
      name: `${firstName} ${lastName}`.trim() || emailPrefix,
      email: data.email || "",
      role: data.role || "applicant",
    };

    localStorage.setItem("launchpad_token", data.token);
    localStorage.setItem("launchpad_user", JSON.stringify(user));

    redirectToDashboard(data.role);
  } catch (error) {
    showError(error.message);
  } finally {
    setLoading(false);
  }
});

// ── SOCIAL AUTH ───────────────────────────────
const [appleBtn, googleBtn] = document.querySelectorAll(".acc_icon div");
appleBtn.addEventListener("click", () => alert("Apple Sign-In coming soon!"));
googleBtn.addEventListener("click", () => alert("Google Sign-In coming soon!"));
