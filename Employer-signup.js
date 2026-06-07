// =============================================
//  LaunchPad — Employer SignUp Page JS
//  Handles: animated page transition back to
//           SignUp.html on role switch
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
const roleInput = document.getElementById("field-group");
const passwordInput = document.getElementById("password");
const termsCheckbox = document.getElementById("termsCheckbox");
const signUpBtn = document.getElementById("signUpBtn");
const signUpForm = document.getElementById("signUpForm");

// ── SET EMPLOYER AS ACTIVE BY DEFAULT ─────────
employerBtn.classList.add("active");

// ── CHECK IF ARRIVING FROM JOB SEEKER PAGE ────
// Animate in from the right when coming from SignUp.html
window.addEventListener("DOMContentLoaded", () => {
  const from = sessionStorage.getItem("launchpad_nav_from");
  if (from === "jobseeker") {
    document.querySelector(".main_container").classList.add("animate-in-right");
    sessionStorage.removeItem("launchpad_nav_from");
  }
});

// ── SWITCH TO JOB SEEKER (animated exit) ──────
jobSeekerBtn.addEventListener("click", () => {
  // Slide panels out to the right
  //   container1.style.transition =
  //     "transform 0.5s cubic-bezier(0.77,0,0.18,1), opacity 0.5s ease";
  //   container2.style.transition =
  //     "transform 0.5s cubic-bezier(0.77,0,0.18,1), opacity 0.5s ease";

  container1.style.transform = "translateX(110%)";
  container1.style.opacity = "0";
  container2.style.transform = "translateX(-110%)";
  container2.style.opacity = "0";

  setTimeout(() => {
    sessionStorage.setItem("launchpad_nav_from", "employer");
    window.location.href = "SignUp.html";
  }, 520);
});

// Keep employer button active (already on this page)
employerBtn.addEventListener("click", () => {
  employerBtn.classList.add("active");
  jobSeekerBtn.classList.remove("active");
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
  if (!roleInput.value.trim()) {
    showError("Please enter your role e.g HR Manager, Recruiter.");
    roleInput.focus();
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
// Body:    { first_name, last_name, email, password, role: "employer", user_role }
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
    role: "employer",
    user_role: roleInput.value.trim(),
  };

  setLoading(true);
  try {
    const data = await registerUser(payload);
    localStorage.setItem("launchpad_token", data.token);
    localStorage.setItem("launchpad_user", JSON.stringify(data.user));
    window.location.href = "EmployerDashboard.html";
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
