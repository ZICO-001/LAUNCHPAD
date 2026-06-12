// =============================================
//  LaunchPad — Job Seeker SignUp Page JS
// =============================================

const BASE_URL = "https://lunchpad-backend-1.onrender.com/api";

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

// ── SET JOB SEEKER AS ACTIVE BY DEFAULT ───────
jobSeekerBtn.classList.add("active");

// ── CHECK IF ARRIVING FROM EMPLOYER PAGE ──────
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

  setTimeout(() => {
    sessionStorage.setItem("launchpad_nav_from", "jobseeker");
    window.location.href = "Employer-signup.html";
  }, 920);
});

// Keep job seeker button active
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
// Body:    { name, email, password, role }
// Returns: { success, message, data: { token, name, email, role, _id } }

async function registerUser(payload) {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  // Handle non-JSON responses (e.g. server HTML error pages)
  const contentType = res.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    throw new Error("Server error. Please try again later.");
  }

  const json = await res.json();

  if (!res.ok || !json.success) {
    throw new Error(json.message || "Registration failed.");
  }

  console.log(json.data);
  return json.data; // { token, name, email, role, _id }
}

// ── SIGN UP CLICK ──────────────────────────────
signUpBtn.addEventListener("click", async () => {
  clearError();
  if (!validateForm()) return;

  // Combine first + last name into one field for the backend
  const fullName = `${firstNameInput.value.trim()} ${lastNameInput.value.trim()}`;
  console.log(fullName);

  const payload = {
    firstName: firstNameInput.value.trim(),
    lastName: lastNameInput.value.trim(),
    email: emailInput.value.trim(),
    password: passwordInput.value,
    role: "applicant", // backend expects "applicant" not "job_seeker"
  };

  setLoading(true);
  try {
    const data = await registerUser(payload);
    console.log(data);
    const name = data.name || "";
    const parts = name.trim().split(" ");

    const user = {
      _id: data._id || data.id || "",
      firstName: data.firstName || data.firstName || payload.firstName || "",
      lastName: data.lastName || data.lastName || payload.lastName || "",
      name:
        data.name ||
        `${payload.firstName || ""} ${payload.lastName || ""}`.trim(),
      email: data.email || payload.email || "",
      role: data.role || "applicant",
    };

    console.log(user);

    localStorage.setItem("launchpad_token", data.token);
    localStorage.setItem("launchpad_user", JSON.stringify(user));

    // Build full name from whatever we have
    user.name = `${user.firstName} ${user.lastName}`.trim();

    localStorage.setItem("launchpad_token", data.token);
    localStorage.setItem("launchpad_user", JSON.stringify(user));

    // Redirect based on role from backend response
    if (data.role === "employer") {
      window.location.href = "EmployerDashboard.html";
    } else {
      window.location.href = "JobSeeker-Dashboard.html";
    }
  } catch (err) {
    // Handle duplicate email specifically
    if (
      err.message.toLowerCase().includes("exist") ||
      err.message.toLowerCase().includes("duplicate") ||
      err.message.toLowerCase().includes("already")
    ) {
      showError("An account with this email already exists. Please sign in.");
    } else {
      showError(err.message);
    }
  } finally {
    setLoading(false);
  }
});
document.getElementById("SignIn").addEventListener("click", () => {
  window.location.href = "SignIn.html";
});

// ── SOCIAL AUTH ───────────────────────────────
const [appleBtn, googleBtn] = document.querySelectorAll(".acc_icon div");
appleBtn.addEventListener("click", () => alert("Apple Sign-Up coming soon!"));
googleBtn.addEventListener("click", () => alert("Google Sign-Up coming soon!"));
