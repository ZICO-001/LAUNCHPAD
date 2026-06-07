// =============================================
//  LaunchPad — Sign Up Page JavaScript
//  Targets: #jobSeekerBtn, #employerBtn,
//           #firstName, #lastName,
//           #email, #password,
//           #termsCheckbox, #signUpBtn,
//           #signUpForm
// =============================================

// ── BASE URL ──────────────────────────────────
// Replace with your actual backend base URL
const BASE_URL = "https://your-api-domain.com/api";

// ── STATE ─────────────────────────────────────
// Tracks which role the user selected
let selectedRole = null; // "job_seeker" | "employer"

// ── ELEMENT REFERENCES ────────────────────────
const jobSeekerBtn = document.getElementById("jobSeekerBtn");
const employerBtn = document.getElementById("employerBtn");
const firstNameInput = document.getElementById("firstName");
const lastNameInput = document.getElementById("lastName");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const termsCheckbox = document.getElementById("termsCheckbox");
const signUpBtn = document.getElementById("signUpBtn");
const signUpForm = document.getElementById("signUpForm");

// ── ROLE SELECTION ────────────────────────────
// Highlights the active role button and stores the selection

function setActiveRole(role) {
  selectedRole = role;

  // Reset both buttons to default style
  jobSeekerBtn.style.backgroundColor = "";
  jobSeekerBtn.style.color = "";
  employerBtn.style.backgroundColor = "";
  employerBtn.style.color = "";

  // Highlight the selected button
  if (role === "job_seeker") {
    jobSeekerBtn.style.backgroundColor = "#2563eb";
    jobSeekerBtn.style.color = "#fff";
  } else if (role === "employer") {
    employerBtn.style.backgroundColor = "#2563eb";
    employerBtn.style.color = "#fff";
    jobSeekerBtn.style.backgroundColor = "transparent";
    jobSeekerBtn.style.color = "#000";
  }
}

jobSeekerBtn.addEventListener("click", () => setActiveRole("job_seeker"));
employerBtn.addEventListener("click", () => setActiveRole("employer"));

// ── PASSWORD VISIBILITY TOGGLE ────────────────
// Clicking the eye icon inside .password toggles visibility
const passwordToggleIcon = document.querySelector(".password img");

if (passwordToggleIcon) {
  passwordToggleIcon.addEventListener("click", () => {
    const isHidden = passwordInput.type === "password";
    passwordInput.type = isHidden ? "text" : "password";

    // Optional: swap icon src to open/closed eye if you have both assets
    // passwordToggleIcon.src = isHidden
    //   ? "loginImages/password-icon-open.png"
    //   : "loginImages/password-icon.png";
  });
}

// ── FORM VALIDATION ───────────────────────────
function validateForm() {
  const firstName = firstNameInput.value.trim();
  const lastName = lastNameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!selectedRole) {
    showError("Please select a role: Job Seeker or Employer.");
    return false;
  }
  if (!firstName) {
    showError("Please enter your first name.");
    firstNameInput.focus();
    return false;
  }
  if (!lastName) {
    showError("Please enter your last name.");
    lastNameInput.focus();
    return false;
  }
  if (!email || !isValidEmail(email)) {
    showError("Please enter a valid email address.");
    emailInput.focus();
    return false;
  }
  if (!password || password.length < 8) {
    showError("Password must be at least 8 characters.");
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

// ── UI HELPERS ──────────────────────────────
function showError(message) {
  // Reuse existing error element or create one
  let errorEl = document.getElementById("formError");
  if (!errorEl) {
    errorEl = document.createElement("p");
    errorEl.id = "formError";
    errorEl.style.cssText =
      "color:#dc2626; font-size:14px; margin-top:10px; text-align:center;";
    signUpForm.prepend(errorEl);
  }
  errorEl.textContent = message;
  errorEl.style.display = "block";
}

function clearError() {
  const errorEl = document.getElementById("formError");
  if (errorEl) errorEl.style.display = "none";
}

function setLoading(isLoading) {
  signUpBtn.disabled = isLoading;
  signUpBtn.textContent = isLoading ? "Creating account…" : "Sign Up";
}

// ── SIGN UP API CALL ──────────────────────────
// POST /api/auth/register
// Body: { first_name, last_name, email, password, role }
// Expected success response: { token, user: { id, email, role } }

async function registerUser(payload) {
  const response = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    // Backend should return { message: "..." } on errors
    throw new Error(data.message || "Registration failed. Please try again.");
  }

  return data; // { token, user }
}

// ── SIGN UP SUBMIT HANDLER ────────────────────
signUpBtn.addEventListener("click", async () => {
  clearError();

  if (!validateForm()) return;

  const payload = {
    first_name: firstNameInput.value.trim(),
    last_name: lastNameInput.value.trim(),
    email: emailInput.value.trim(),
    password: passwordInput.value,
    role: selectedRole, // "job_seeker" | "employer"
  };

  setLoading(true);

  try {
    const data = await registerUser(payload);

    // Save token to localStorage for authenticated requests later
    localStorage.setItem("launchpad_token", data.token);
    localStorage.setItem("launchpad_user", JSON.stringify(data.user));

    // Redirect based on role
    if (data.user.role === "employer") {
      window.location.href = "EmployerDashboard.html";
    } else {
      window.location.href = "JobSeekerDashboard.html";
    }
  } catch (error) {
    showError(error.message);
  } finally {
    setLoading(false);
  }
});

// ── SOCIAL AUTH PLACEHOLDERS ──────────────────
// Wire up Apple / Google login buttons when OAuth is ready
const [appleBtn, googleBtn] = document.querySelectorAll(".acc_icon div");

appleBtn.addEventListener("click", () => {
  // TODO: Redirect to your backend Apple OAuth endpoint
  // window.location.href = `${BASE_URL}/auth/apple`;
  alert("Apple Sign-In coming soon!");
});

googleBtn.addEventListener("click", () => {
  // TODO: Redirect to your backend Google OAuth endpoint
  // window.location.href = `${BASE_URL}/auth/google`;
  alert("Google Sign-In coming soon!");
});
