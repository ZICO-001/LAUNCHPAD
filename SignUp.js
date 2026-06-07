// =============================================
//  LaunchPad — Job Seeker SignUp Page JS
//  Handles: animated page transition to
//           Employer-signup.html on role switch
// =============================================

const BASE_URL = "https://your-api-domain.com/api";

// ── ELEMENT REFS ──────────────────────────────
const jobSeekerBtn = document.getElementById("jobSeekerBtn");
const employerBtn = document.getElementById("employerBtn");
const container1 = document.querySelector(".container1");
const container2 = document.querySelector(".container2");
const firstNameInput = document.getElementById("firstName");
const lastNameInput = document.getElementById("lastName");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const termsCheckbox = document.getElementById("termsCheckbox");
const signUpBtn = document.getElementById("signUpBtn");
const signUpForm = document.getElementById("signUpForm");
const passwordImg = document.querySelector(".password img");

// ── SET JOB SEEKER AS ACTIVE BY DEFAULT ───────
jobSeekerBtn.classList.add("active");

// ── CHECK IF ARRIVING FROM EMPLOYER PAGE ──────
// If so, animate in from the right
window.addEventListener("DOMContentLoaded", () => {
  const from = sessionStorage.getItem("launchpad_nav_from");
  if (from === "employer") {
    document.querySelector(".main_container").classList.add("animate-in-left");
    sessionStorage.removeItem("launchpad_nav_from");
  }
});

// ── SWITCH TO EMPLOYER (animated exit) ────────
employerBtn.addEventListener("click", () => {
  container1.style.transform = "translateX(-110%)";
  container1.style.opacity = "0";
  container2.style.transform = "translateX(110%)";
  container2.style.opacity = "0";

  // After animation completes, navigate to employer page
  setTimeout(() => {
    sessionStorage.setItem("launchpad_nav_from", "jobseeker");
    window.location.href = "Employer-signup.html";
  }, 920);
});

// Keep job seeker button active (already on this page)
jobSeekerBtn.addEventListener("click", () => {
  jobSeekerBtn.classList.add("active");
  employerBtn.classList.remove("active");
});

// ── PASSWORD TOGGLE ────────────────────────────
const passwordToggle = document.querySelector(".password img");
if (passwordToggle) {
  passwordToggle.addEventListener("click", () => {
    const isHidden = passwordInput.type === "password";
    passwordInput.type = isHidden ? "text" : "password";
  });
}

// ── VALIDATION ────────────────────────────────
function isValidEmail(e) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

function showError(msg) {
  let el = document.getElementById("formError");
  if (!el) {
    el = document.createElement("p");
    el.id = "formError";
    el.style.cssText =
      "color:#dc2626;font-size:13px;margin-bottom:10px;text-align:center;";
    signUpForm.prepend(el);
  }
  el.textContent = msg;
  el.style.display = "block";
}

function clearError() {
  const el = document.getElementById("formError");
  if (el) el.style.display = "none";
}

function validateForm() {
  if (!firstNameInput.value.trim()) {
    showError("Please enter your first name.");
    firstNameInput.focus();
    return false;
  }
  if (!lastNameInput.value.trim()) {
    showError("Please enter your last name.");
    lastNameInput.focus();
    return false;
  }
  if (!isValidEmail(emailInput.value.trim())) {
    showError("Please enter a valid email address.");
    emailInput.focus();
    return false;
  }
  if (!passwordInput.value || passwordInput.value.length < 8) {
    showError("Password must be at least 8 characters.");
    passwordInput.focus();
    return false;
  }
  if (!termsCheckbox.checked) {
    showError("Please agree to the Terms of Service and Privacy Policy.");
    return false;
  }
  return true;
}

function setLoading(loading) {
  signUpBtn.disabled = loading;
  signUpBtn.textContent = loading ? "Creating account…" : "Sign Up";
}

// ── REGISTER API ──────────────────────────────
// POST /api/auth/register
// Body:    { first_name, last_name, email, password, role: "job_seeker" }
// Success: { token, user: { id, email, role, first_name, last_name } }

async function registerUser(payload) {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Registration failed.");
  return data;
}

signUpBtn.addEventListener("click", async () => {
  clearError();
  if (!validateForm()) return;

  const payload = {
    first_name: firstNameInput.value.trim(),
    last_name: lastNameInput.value.trim(),
    email: emailInput.value.trim(),
    password: passwordInput.value,
    role: "job_seeker",
  };

  setLoading(true);
  try {
    const data = await registerUser(payload);
    localStorage.setItem("launchpad_token", data.token);
    localStorage.setItem("launchpad_user", JSON.stringify(data.user));
    window.location.href = "JobSeekerDashboard.html";
  } catch (err) {
    showError(err.message);
  } finally {
    setLoading(false);
  }
});

// ── SOCIAL AUTH ───────────────────────────────
const [appleBtn, googleBtn] = document.querySelectorAll(".acc_icon div");
appleBtn.addEventListener("click", () => alert("Apple Sign-Up coming soon!"));
googleBtn.addEventListener("click", () => alert("Google Sign-Up coming soon!"));
