// =============================================
//  LaunchPad — Sign In Page JavaScript
//  Targets: #jobSeekerBtn, #employerBtn,
//           #signInEmail, #signInPassword,
//           #termsCheckbox, #signInBtn,
//           #signInForm, #passwordToggle
// =============================================

// ── BASE URL ──────────────────────────────────
// Replace with your actual backend base URL
const BASE_URL = "https://your-api-domain.com/api";

// ── STATE ─────────────────────────────────────
let selectedRole = null; // "job_seeker" | "employer"

// ── ELEMENT REFERENCES ────────────────────────
const jobSeekerBtn = document.getElementById("jobSeekerBtn");
const employerBtn = document.getElementById("employerBtn");
const emailInput = document.getElementById("signInEmail");
const passwordInput = document.getElementById("signInPassword");
const termsCheckbox = document.getElementById("termsCheckbox");
const signInBtn = document.getElementById("signInBtn");
const signInForm = document.getElementById("signInForm");
const passwordToggle = document.getElementById("passwordToggle");

// ── ROLE SELECTION ────────────────────────────
// Highlights the chosen role button and saves selection

function setActiveRole(role) {
  selectedRole = role;

  // Reset both to default
  jobSeekerBtn.style.backgroundColor = "";
  jobSeekerBtn.style.color = "";
  employerBtn.style.backgroundColor = "";
  employerBtn.style.color = "";

  // Highlight selected
  if (role === "job_seeker") {
    jobSeekerBtn.style.backgroundColor = "#1d4edb";
    jobSeekerBtn.style.color = "#fff";
  } else if (role === "employer") {
    employerBtn.style.backgroundColor = "#1d4edb";
    employerBtn.style.color = "#fff";
  }
}

jobSeekerBtn.addEventListener("click", () => setActiveRole("job_seeker"));
employerBtn.addEventListener("click", () => setActiveRole("employer"));

// ── PASSWORD VISIBILITY TOGGLE ────────────────
// Clicking the eye icon toggles password visibility

if (passwordToggle) {
  passwordToggle.addEventListener("click", () => {
    const isHidden = passwordInput.type === "password";
    passwordInput.type = isHidden ? "text" : "password";
    // Swap icon if you have open/closed eye assets:
    passwordToggle.src = isHidden
      ? "loginImages/password-icon.png"
      : "loginImages/password-icon-open.png";
  });
}

// ── FORM VALIDATION ───────────────────────────
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

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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

// ── SIGN IN API CALL ──────────────────────────
// POST /api/auth/login
// Body:     { email, password, role }
// Success:  { token, user: { id, email, role, first_name, last_name } }
// Failure:  { message: "Invalid credentials" }

async function loginUser(payload) {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    // 401 → wrong credentials, 404 → account not found, etc.
    throw new Error(data.message || "Sign in failed. Please try again.");
  }

  return data; // { token, user }
}

// ── REDIRECT BASED ON ROLE ────────────────────
// After a successful login, send the user to the right dashboard

function redirectToDashboard(role) {
  if (role === "employer") {
    window.location.href = "EmployerDashboard.html";
  } else {
    window.location.href = "JobSeekerDashboard.html";
  }
}

// ── SIGN IN SUBMIT HANDLER ────────────────────
signInBtn.addEventListener("click", async () => {
  clearError();

  if (!validateForm()) return;

  const payload = {
    email: emailInput.value.trim(),
    password: passwordInput.value,
    role: selectedRole, // "job_seeker" | "employer"
  };

  setLoading(true);

  try {
    const data = await loginUser(payload);

    // ── Save auth data to localStorage ──
    localStorage.setItem("launchpad_token", data.token);
    localStorage.setItem("launchpad_user", JSON.stringify(data.user));

    // ── Redirect to the correct dashboard ──
    redirectToDashboard(data.user.role);
  } catch (error) {
    // Show friendly error messages for common cases
    if (error.message.toLowerCase().includes("invalid")) {
      showError("Incorrect email or password. Please try again.");
    } else if (error.message.toLowerCase().includes("not found")) {
      showError("No account found with that email. Please sign up first.");
    } else {
      showError(error.message);
    }
  } finally {
    setLoading(false);
  }
});

// ── SOCIAL AUTH PLACEHOLDERS ──────────────────
const [appleBtn, googleBtn] = document.querySelectorAll(".acc_icon div");

appleBtn.addEventListener("click", () => {
  // window.location.href = `${BASE_URL}/auth/apple`;
  alert("Apple Sign-In coming soon!");
});

googleBtn.addEventListener("click", () => {
  // window.location.href = `${BASE_URL}/auth/google`;
  alert("Google Sign-In coming soon!");
});

// ── AUTO REDIRECT IF ALREADY LOGGED IN ────────
// If a token already exists, skip sign in and go straight to dashboard

(function checkExistingSession() {
  const token = localStorage.getItem("launchpad_token");
  const user = JSON.parse(localStorage.getItem("launchpad_user") || "null");

  if (token && user) {
    redirectToDashboard(user.role);
  }
})();
