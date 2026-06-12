// =============================================
//  LaunchPad — Employer SignUp Page JS
//  Handles: animated page transition back to
//           SignUp.html on role switch
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
const roleInput = document.getElementById("field-group");
const passwordInput = document.getElementById("password");
const termsCheckbox = document.getElementById("termsCheckbox");
const signUpBtn = document.getElementById("signUpBtn");
const signUpForm = document.getElementById("signUpForm");

// ── SET EMPLOYER AS ACTIVE BY DEFAULT ─────────
employerBtn.classList.add("active");

// ── CHECK IF ARRIVING FROM JOB SEEKER PAGE ────
window.addEventListener("DOMContentLoaded", () => {
  const from = sessionStorage.getItem("launchpad_nav_from");
  if (from === "jobseeker") {
    document.querySelector(".main_container").classList.add("animate-in-right");
    sessionStorage.removeItem("launchpad_nav_from");
  }
});

// ── SWITCH TO JOB SEEKER (animated exit) ──────
jobSeekerBtn.addEventListener("click", () => {
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
  const firstName = firstNameInput.value.trim();
  const lastName = lastNameInput.value.trim();
  const email = emailInput.value.trim();
  const role = roleInput.value.trim();
  const password = passwordInput.value;

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
  if (!isValidEmail(email)) {
    showError("Please enter a valid email address.");
    emailInput.focus();
    return false;
  }
  if (!role) {
    showError("Please enter your role e.g HR Manager, Recruiter.");
    roleInput.focus();
    return false;
  }
  if (!password || password.length < 8) {
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

// ── LOCAL SAVE FALLBACK ───────────────────────
function registerLocally(payload) {
  const existingUsers = JSON.parse(
    localStorage.getItem("launchpad_users") || "[]",
  );

  const emailTaken = existingUsers.find((u) => u.email === payload.email);
  if (emailTaken) {
    throw new Error(
      "An account with this email already exists. Please sign in.",
    );
  }

  const newUser = {
    id: Date.now().toString(),
    first_name: payload.first_name,
    last_name: payload.last_name,
    name: `${payload.first_name} ${payload.last_name}`,
    email: payload.email,
    password: payload.password,
    role: "employer",
    user_role: payload.user_role,
  };

  existingUsers.push(newUser);
  localStorage.setItem("launchpad_users", JSON.stringify(existingUsers));

  return {
    token: "local-token-" + newUser.id,
    user: newUser,
  };
}

// ── SIGN UP CLICK ─────────────────────────────
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
    // Try real API first
    const data = await registerUser(payload);
    localStorage.setItem("launchpad_token", data.token);
    localStorage.setItem("launchpad_user", JSON.stringify(data.user));
    window.location.href = "EmployerDashboard.html";
  } catch (err) {
    // API unavailable — fall back to localStorage
    try {
      const data = registerLocally(payload);
      localStorage.setItem("launchpad_token", data.token);
      localStorage.setItem("launchpad_user", JSON.stringify(data.user));
      window.location.href = "EmployerDashboard.html";
    } catch (localErr) {
      showError(localErr.message);
    }
  } finally {
    setLoading(false);
  }
});

// ── SOCIAL AUTH ───────────────────────────────
const [appleBtn, googleBtn] = document.querySelectorAll(".acc_icon div");
appleBtn.addEventListener("click", () => alert("Apple Sign-Up coming soon!"));
googleBtn.addEventListener("click", () => alert("Google Sign-Up coming soon!"));
