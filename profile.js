// =============================================
//  LaunchPad — Profile Page JS
// =============================================

const BASE_URL = "https://lunchpad-backend-1.onrender.com/api";

// ── GET LOGGED IN USER ────────────────────────
const user = JSON.parse(localStorage.getItem("launchpad_user") || "null");
if (!user) window.location.href = "SignIn.html";

const token = localStorage.getItem("launchpad_token");

// ── HEADER: show name and initials ────────────
document.getElementById("userName").textContent =
  user.firstName + " " + user.lastName;
const initials = (user.firstName?.[0] || "") + (user.lastName?.[0] || "");
document.getElementById("userAvatar").textContent = initials;

// ── PROFILE DATA (stored locally as fallback) ─
// This holds everything the user fills in
function getProfileData() {
  const saved = localStorage.getItem("launchpad_profile_" + user.id);
  return saved
    ? JSON.parse(saved)
    : {
        name: user.firstName + " " + user.lastName,
        role: "",
        location: "",
        bio: "",
        skills: [],
        experience: [],
        education: [],
        portfolio: [],
        photo: null,
      };
}

function saveProfileData(data) {
  localStorage.setItem("launchpad_profile_" + user.id, JSON.stringify(data));
}

// ── LOAD PROFILE FROM API ─────────────────────
async function loadProfile() {
  try {
    const res = await fetch(`${BASE_URL}/user/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("API unavailable");
    const data = await res.json();
    // Merge API data into local storage
    saveProfileData(data);
    return data;
  } catch {
    // Fall back to localStorage
    return getProfileData();
  }
}

// ── SAVE PROFILE TO API ───────────────────────
async function saveProfileToAPI(data) {
  try {
    const res = await fetch(`${BASE_URL}/user/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("API save failed");
  } catch {
    // Silently fall back — localStorage already saved below
  }
  saveProfileData(data);
}

// ── PROFILE PHOTO UPLOAD ──────────────────────
document.getElementById("profilePhoto").addEventListener("click", () => {
  document.getElementById("photoUpload").click();
});

document.getElementById("photoUpload").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (ev) => {
    const dataUrl = ev.target.result;

    // Show preview immediately
    document.getElementById("profilePhoto").src = dataUrl;

    // Save to profile data
    const profile = getProfileData();
    profile.photo = dataUrl;
    saveProfileData(profile);
  };
  reader.readAsDataURL(file);
});

// ── PROFILE STRENGTH CALCULATOR ───────────────
// Each completed section adds to the score
function calcStrength(profile) {
  let score = 0;
  if (profile.photo) score += 20;
  if (profile.name) score += 10;
  if (profile.role && profile.location) score += 10;
  if (profile.bio) score += 15;
  if (profile.skills.length > 0) score += 15;
  if (profile.experience.length > 0) score += 15;
  if (profile.education.length > 0) score += 10;
  if (profile.portfolio.length > 0) score += 5;
  return Math.min(score, 100);
}

function updateStrengthBar(profile) {
  const pct = calcStrength(profile);
  document.getElementById("strengthPercent").textContent = pct + "% completion";
  document.getElementById("strengthBar").style.width = pct + "%";
}

// ── OVERVIEW TAB ──────────────────────────────
function renderOverview(profile) {
  return `
    <div class="profile-strength">
      <div class="profile-head">
        <h4>Profile strength</h4>
        <span id="strengthPercent">${calcStrength(profile)}% completion</span>
      </div>
      <div class="progress-bar">
        <div class="progress" id="strengthBar" style="width:${calcStrength(profile)}%"></div>
      </div>
      <p>Complete your profile to increase your chances of getting hired by 3x.</p>
      <ul>
        <li><a href="#" onclick="switchTab('navPersonalInfo')">Add basic details</a></li>
        <li><a href="#" onclick="switchTab('navSkills')">Add skills</a></li>
        <li><a href="#" onclick="switchTab('navExperience')">Add working Experience</a></li>
        <li><a href="#" onclick="switchTab('navEducation')">Add Education</a></li>
        <li><a href="#" onclick="switchTab('navPortfolio')">Add portfolio link</a></li>
      </ul>
      <button type="button" onclick="switchTab('navPersonalInfo')">
        <a href="#">Improve Profile →</a>
      </button>
    </div>

    <div class="profile-details">
      <div class="details-head">
        <p>profile preview</p>
        <p><a href="#" onclick="switchTab('navPersonalInfo')">Edit profile</a></p>
      </div>
      <div class="main-details">
        <div class="profile-intro">
          <img
            src="${profile.photo || "loginImages/Profile-img.png"}"
            alt=""
            id="profilePhoto"
            style="cursor:pointer; width:128px; height:132px; object-fit:cover; border-radius:8px;"
          />
          <input type="file" id="photoUpload" accept="image/*" style="display:none;" />
          <div>
            <p class="name" id="profileName">${profile.name || user.first_name + " " + user.last_name}</p>
            <p class="stack" id="profileRole" style="color:#1d4ed8;">${profile.role || "Add your role"}</p>
            <p class="location" id="profileLocation">${profile.location || "Add your location"}</p>
            <p class="bio" id="profileBio">${profile.bio || "Add a short bio about yourself."}</p>
          </div>
        </div>

        <div class="skills">
          <div class="skill-headline">
            <p>Skills</p>
            <div class="hr-line"></div>
          </div>
          <div class="skills-list" id="skillsList">
            ${
              profile.skills.length > 0
                ? profile.skills.map((s) => `<span>${s}</span>`).join("")
                : "<p style='color:#888; font-size:13px;'>No skills added yet.</p>"
            }
          </div>
        </div>

        <div class="Experience">
          <div class="experience-headline">
            <p>Experience</p>
            <div class="hr-line"></div>
          </div>
          <div class="project-field">
            ${
              profile.experience.length > 0
                ? profile.experience
                    .map(
                      (e) => `
                  <div style="text-align:left; margin-bottom:12px;">
                    <p style="font-weight:700;">${e.title} at ${e.company}</p>
                    <p style="font-size:13px; color:#666;">${e.duration}</p>
                    <p style="font-size:13px;">${e.description}</p>
                  </div>`,
                    )
                    .join("")
                : `<p>No experience added yet. Add internships, projects, volunteer work past roles to strengthen your profile</p>
                   <button type="button" onclick="switchTab('navExperience')">
                     <a href="#">Add Experience</a>
                   </button>`
            }
          </div>
        </div>
      </div>
    </div>
  `;
}

// ── PERSONAL INFO TAB ─────────────────────────
function renderPersonalInfo(profile) {
  return `
    <div class="profile-details" style="width:100%; padding:32px;">
      <h3 style="margin-bottom:24px;">Personal Information</h3>

      <div style="display:flex; flex-direction:column; gap:16px; max-width:600px;">

        <div style="display:flex; flex-direction:column; gap:6px;">
          <label style="font-weight:600;">Full Name</label>
          <input id="piName" type="text" value="${profile.name}" 
            style="padding:12px; border-radius:8px; border:1px solid #c3c6d7; font-size:15px;" />
        </div>

        <div style="display:flex; flex-direction:column; gap:6px;">
          <label style="font-weight:600;">Role / Title</label>
          <input id="piRole" type="text" value="${profile.role}" placeholder="e.g UI/UX Designer"
            style="padding:12px; border-radius:8px; border:1px solid #c3c6d7; font-size:15px;" />
        </div>

        <div style="display:flex; flex-direction:column; gap:6px;">
          <label style="font-weight:600;">Location</label>
          <input id="piLocation" type="text" value="${profile.location}" placeholder="e.g Lagos, Nigeria"
            style="padding:12px; border-radius:8px; border:1px solid #c3c6d7; font-size:15px;" />
        </div>

        <div style="display:flex; flex-direction:column; gap:6px;">
          <label style="font-weight:600;">Bio</label>
          <textarea id="piBio" rows="4" placeholder="Tell employers a bit about yourself..."
            style="padding:12px; border-radius:8px; border:1px solid #c3c6d7; font-size:15px; resize:vertical;"
          >${profile.bio}</textarea>
        </div>

        <p id="piMsg" style="color:#16a34a; font-size:13px; display:none;">✓ Saved successfully!</p>

        <button onclick="savePersonalInfo()"
          style="width:200px; padding:12px; background:#1d4edb; color:#fff; border:none; border-radius:8px; font-size:15px; cursor:pointer;">
          Save Changes
        </button>
      </div>
    </div>
  `;
}

window.savePersonalInfo = async function () {
  const profile = getProfileData();
  profile.name = document.getElementById("piName").value.trim();
  profile.role = document.getElementById("piRole").value.trim();
  profile.location = document.getElementById("piLocation").value.trim();
  profile.bio = document.getElementById("piBio").value.trim();
  await saveProfileToAPI(profile);

  // Show confirmation
  const msg = document.getElementById("piMsg");
  msg.style.display = "block";
  setTimeout(() => (msg.style.display = "none"), 3000);
};

// ── SKILLS TAB ────────────────────────────────
function renderSkills(profile) {
  return `
    <div class="profile-details" style="width:100%; padding:32px;">
      <h3 style="margin-bottom:24px;">Skills</h3>

      <div style="display:flex; flex-wrap:wrap; gap:10px; margin-bottom:20px;" id="skillTags">
        ${profile.skills
          .map(
            (s) => `
          <span style="padding:6px 14px; background:#2563eb26; border:1px solid #c3c6d7;
            border-radius:8px; color:#1d4edb; font-weight:500; display:flex; align-items:center; gap:8px;">
            ${s}
            <span onclick="removeSkill('${s}')"
              style="cursor:pointer; color:#dc2626; font-weight:700;">✕</span>
          </span>`,
          )
          .join("")}
      </div>

      <div style="display:flex; gap:10px; max-width:500px;">
        <input id="newSkillInput" type="text" placeholder="e.g. React, Figma, Python"
          style="flex:1; padding:12px; border-radius:8px; border:1px solid #c3c6d7; font-size:15px;" />
        <button onclick="addSkill()"
          style="padding:12px 20px; background:#1d4edb; color:#fff; border:none;
          border-radius:8px; font-size:15px; cursor:pointer;">
          Add
        </button>
      </div>
      <p id="skillMsg" style="color:#16a34a; font-size:13px; margin-top:10px; display:none;">✓ Skill saved!</p>
    </div>
  `;
}

window.addSkill = async function () {
  const input = document.getElementById("newSkillInput");
  const skill = input.value.trim();
  if (!skill) return;

  const profile = getProfileData();
  if (!profile.skills.includes(skill)) {
    profile.skills.push(skill);
    await saveProfileToAPI(profile);
  }
  input.value = "";
  switchTab("navSkills"); // re-render with new skill
};

window.removeSkill = async function (skill) {
  const profile = getProfileData();
  profile.skills = profile.skills.filter((s) => s !== skill);
  await saveProfileToAPI(profile);
  switchTab("navSkills");
};

// ── EXPERIENCE TAB ────────────────────────────
function renderExperience(profile) {
  return `
    <div class="profile-details" style="width:100%; padding:32px;">
      <h3 style="margin-bottom:24px;">Experience</h3>

      ${profile.experience
        .map(
          (e, i) => `
        <div style="border:1px solid #c3c6d7; border-radius:8px; padding:16px; margin-bottom:16px;">
          <div style="display:flex; justify-content:space-between;">
            <p style="font-weight:700;">${e.title} — ${e.company}</p>
            <span onclick="removeExperience(${i})"
              style="cursor:pointer; color:#dc2626; font-weight:700;">✕ Remove</span>
          </div>
          <p style="font-size:13px; color:#666; margin:4px 0;">${e.duration}</p>
          <p style="font-size:14px;">${e.description}</p>
          ${e.file ? `<p style="font-size:12px; color:#1d4edb; margin-top:6px;">📎 ${e.fileName}</p>` : ""}
        </div>`,
        )
        .join("")}

      <div style="border:1px dashed #1d4edb; border-radius:8px; padding:24px; margin-top:16px;">
        <h4 style="margin-bottom:16px;">Add New Experience</h4>
        <div style="display:flex; flex-direction:column; gap:12px; max-width:560px;">

          <input id="expTitle" type="text" placeholder="Job Title e.g Frontend Developer Intern"
            style="padding:12px; border-radius:8px; border:1px solid #c3c6d7; font-size:14px;" />

          <input id="expCompany" type="text" placeholder="Company Name"
            style="padding:12px; border-radius:8px; border:1px solid #c3c6d7; font-size:14px;" />

          <input id="expDuration" type="text" placeholder="Duration e.g Jan 2024 – Mar 2024"
            style="padding:12px; border-radius:8px; border:1px solid #c3c6d7; font-size:14px;" />

          <textarea id="expDesc" rows="3" placeholder="Brief description of your role..."
            style="padding:12px; border-radius:8px; border:1px solid #c3c6d7; font-size:14px; resize:vertical;"></textarea>

          <div>
            <label style="font-size:13px; font-weight:600; display:block; margin-bottom:6px;">
              Attach file (optional — certificate, offer letter)
            </label>
            <input type="file" id="expFile" accept=".pdf,.doc,.docx,.png,.jpg"
              style="font-size:13px;" />
          </div>

          <p id="expMsg" style="color:#dc2626; font-size:13px; display:none;"></p>

          <button onclick="addExperience()"
            style="width:180px; padding:12px; background:#1d4edb; color:#fff;
            border:none; border-radius:8px; font-size:15px; cursor:pointer;">
            Save Experience
          </button>
        </div>
      </div>
    </div>
  `;
}

window.addExperience = async function () {
  const title = document.getElementById("expTitle").value.trim();
  const company = document.getElementById("expCompany").value.trim();
  const duration = document.getElementById("expDuration").value.trim();
  const description = document.getElementById("expDesc").value.trim();
  const fileInput = document.getElementById("expFile");
  const msg = document.getElementById("expMsg");

  if (!title || !company || !duration) {
    msg.textContent = "Please fill in title, company and duration.";
    msg.style.color = "#dc2626";
    msg.style.display = "block";
    return;
  }

  const profile = getProfileData();
  const newExp = {
    title,
    company,
    duration,
    description,
    file: null,
    fileName: "",
  };

  // Handle optional file
  if (fileInput.files[0]) {
    const file = fileInput.files[0];
    newExp.fileName = file.name;
    // Read as base64 so it saves to localStorage
    newExp.file = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsDataURL(file);
    });
  }

  profile.experience.push(newExp);
  await saveProfileToAPI(profile);
  switchTab("navExperience");
};

window.removeExperience = async function (index) {
  const profile = getProfileData();
  profile.experience.splice(index, 1);
  await saveProfileToAPI(profile);
  switchTab("navExperience");
};

// ── EDUCATION TAB ─────────────────────────────
function renderEducation(profile) {
  return `
    <div class="profile-details" style="width:100%; padding:32px;">
      <h3 style="margin-bottom:24px;">Education</h3>

      ${profile.education
        .map(
          (e, i) => `
        <div style="border:1px solid #c3c6d7; border-radius:8px; padding:16px; margin-bottom:16px;">
          <div style="display:flex; justify-content:space-between;">
            <p style="font-weight:700;">${e.degree} — ${e.school}</p>
            <span onclick="removeEducation(${i})"
              style="cursor:pointer; color:#dc2626; font-weight:700;">✕ Remove</span>
          </div>
          <p style="font-size:13px; color:#666;">${e.year}</p>
        </div>`,
        )
        .join("")}

      <div style="border:1px dashed #1d4edb; border-radius:8px; padding:24px; margin-top:16px;">
        <h4 style="margin-bottom:16px;">Add Education</h4>
        <div style="display:flex; flex-direction:column; gap:12px; max-width:560px;">

          <input id="eduSchool" type="text" placeholder="School / University name"
            style="padding:12px; border-radius:8px; border:1px solid #c3c6d7; font-size:14px;" />

          <input id="eduDegree" type="text" placeholder="Degree / Certificate e.g B.Sc Computer Science"
            style="padding:12px; border-radius:8px; border:1px solid #c3c6d7; font-size:14px;" />

          <input id="eduYear" type="text" placeholder="Year e.g 2020 – 2024"
            style="padding:12px; border-radius:8px; border:1px solid #c3c6d7; font-size:14px;" />

          <p id="eduMsg" style="color:#dc2626; font-size:13px; display:none;"></p>

          <button onclick="addEducation()"
            style="width:180px; padding:12px; background:#1d4edb; color:#fff;
            border:none; border-radius:8px; font-size:15px; cursor:pointer;">
            Save Education
          </button>
        </div>
      </div>
    </div>
  `;
}

window.addEducation = async function () {
  const school = document.getElementById("eduSchool").value.trim();
  const degree = document.getElementById("eduDegree").value.trim();
  const year = document.getElementById("eduYear").value.trim();
  const msg = document.getElementById("eduMsg");

  if (!school || !degree || !year) {
    msg.textContent = "Please fill in all fields.";
    msg.style.display = "block";
    return;
  }

  const profile = getProfileData();
  profile.education.push({ school, degree, year });
  await saveProfileToAPI(profile);
  switchTab("navEducation");
};

window.removeEducation = async function (index) {
  const profile = getProfileData();
  profile.education.splice(index, 1);
  await saveProfileToAPI(profile);
  switchTab("navEducation");
};

// ── PORTFOLIO TAB ─────────────────────────────
function renderPortfolio(profile) {
  return `
    <div class="profile-details" style="width:100%; padding:32px;">
      <h3 style="margin-bottom:24px;">Portfolio</h3>

      ${profile.portfolio
        .map(
          (p, i) => `
        <div style="border:1px solid #c3c6d7; border-radius:8px; padding:16px; margin-bottom:12px;
          display:flex; justify-content:space-between; align-items:center;">
          <div>
            <p style="font-weight:600;">${p.title}</p>
            ${
              p.link
                ? `<a href="${p.link}" target="_blank"
              style="color:#1d4edb; font-size:13px;">${p.link}</a>`
                : ""
            }
            ${p.file ? `<p style="font-size:12px; color:#1d4edb; margin-top:4px;">📎 ${p.fileName}</p>` : ""}
          </div>
          <span onclick="removePortfolio(${i})"
            style="cursor:pointer; color:#dc2626; font-weight:700;">✕</span>
        </div>`,
        )
        .join("")}

      <div style="border:1px dashed #1d4edb; border-radius:8px; padding:24px; margin-top:16px;">
        <h4 style="margin-bottom:16px;">Add Portfolio Item</h4>
        <div style="display:flex; flex-direction:column; gap:12px; max-width:560px;">

          <input id="portTitle" type="text" placeholder="Project title"
            style="padding:12px; border-radius:8px; border:1px solid #c3c6d7; font-size:14px;" />

          <input id="portLink" type="url" placeholder="Link e.g https://myproject.com (optional)"
            style="padding:12px; border-radius:8px; border:1px solid #c3c6d7; font-size:14px;" />

          <div>
            <label style="font-size:13px; font-weight:600; display:block; margin-bottom:6px;">
              Or upload a file (PDF, image)
            </label>
            <input type="file" id="portFile" accept=".pdf,.png,.jpg,.jpeg"
              style="font-size:13px;" />
          </div>

          <p id="portMsg" style="color:#dc2626; font-size:13px; display:none;"></p>

          <button onclick="addPortfolio()"
            style="width:180px; padding:12px; background:#1d4edb; color:#fff;
            border:none; border-radius:8px; font-size:15px; cursor:pointer;">
            Save Item
          </button>
        </div>
      </div>
    </div>
  `;
}

window.addPortfolio = async function () {
  const title = document.getElementById("portTitle").value.trim();
  const link = document.getElementById("portLink").value.trim();
  const fileInput = document.getElementById("portFile");
  const msg = document.getElementById("portMsg");

  if (!title) {
    msg.textContent = "Please enter a project title.";
    msg.style.display = "block";
    return;
  }

  const profile = getProfileData();
  const newItem = { title, link, file: null, fileName: "" };

  if (fileInput.files[0]) {
    const file = fileInput.files[0];
    newItem.fileName = file.name;
    newItem.file = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsDataURL(file);
    });
  }

  profile.portfolio.push(newItem);
  await saveProfileToAPI(profile);
  switchTab("navPortfolio");
};

window.removePortfolio = async function (index) {
  const profile = getProfileData();
  profile.portfolio.splice(index, 1);
  await saveProfileToAPI(profile);
  switchTab("navPortfolio");
};

// ── SETTINGS TAB ──────────────────────────────
function renderSettings(profile) {
  return `
    <div class="profile-details" style="width:100%; padding:32px;">
      <h3 style="margin-bottom:24px;">Settings</h3>
      <div style="display:flex; flex-direction:column; gap:20px; max-width:500px;">

        <div style="border:1px solid #c3c6d7; border-radius:8px; padding:20px;">
          <h4 style="margin-bottom:12px;">Change Password</h4>
          <div style="display:flex; flex-direction:column; gap:10px;">
            <input id="setOldPw" type="password" placeholder="Current password"
              style="padding:12px; border-radius:8px; border:1px solid #c3c6d7; font-size:14px;" />
            <input id="setNewPw" type="password" placeholder="New password"
              style="padding:12px; border-radius:8px; border:1px solid #c3c6d7; font-size:14px;" />
            <p id="setMsg" style="font-size:13px; display:none;"></p>
            <button onclick="changePassword()"
              style="width:180px; padding:12px; background:#1d4edb; color:#fff;
              border:none; border-radius:8px; cursor:pointer;">
              Update Password
            </button>
          </div>
        </div>

        <div style="border:1px solid #fee2e2; border-radius:8px; padding:20px; background:#fff5f5;">
          <h4 style="color:#dc2626; margin-bottom:8px;">Danger Zone</h4>
          <p style="font-size:13px; margin-bottom:12px; color:#666;">
            Logging out will clear your session.
          </p>
          <button onclick="logOut()"
            style="padding:12px 20px; background:#dc2626; color:#fff;
            border:none; border-radius:8px; cursor:pointer;">
            Log Out
          </button>
        </div>
      </div>
    </div>
  `;
}

window.changePassword = function () {
  const msg = document.getElementById("setMsg");
  const oldPw = document.getElementById("setOldPw").value;
  const newPw = document.getElementById("setNewPw").value;

  if (!oldPw || !newPw) {
    msg.textContent = "Please fill in both fields.";
    msg.style.color = "#dc2626";
    msg.style.display = "block";
    return;
  }
  if (newPw.length < 8) {
    msg.textContent = "New password must be at least 8 characters.";
    msg.style.color = "#dc2626";
    msg.style.display = "block";
    return;
  }
  // Update password in localStorage users list
  const users = JSON.parse(localStorage.getItem("launchpad_users") || "[]");
  const idx = users.findIndex((u) => u.id === user.id);
  if (idx !== -1 && users[idx].password === oldPw) {
    users[idx].password = newPw;
    localStorage.setItem("launchpad_users", JSON.stringify(users));
    msg.textContent = "✓ Password updated!";
    msg.style.color = "#16a34a";
  } else {
    msg.textContent = "Current password is incorrect.";
    msg.style.color = "#dc2626";
  }
  msg.style.display = "block";
};

window.logOut = function () {
  localStorage.removeItem("launchpad_token");
  localStorage.removeItem("launchpad_user");
  window.location.href = "SignIn.html";
};

// ── TAB SWITCHER ──────────────────────────────
const tabs = {
  navOverview: renderOverview,
  navPersonalInfo: renderPersonalInfo,
  navSkills: renderSkills,
  navExperience: renderExperience,
  navEducation: renderEducation,
  navPortfolio: renderPortfolio,
  navSettings: renderSettings,
};

window.switchTab = function (tabId) {
  const profile = getProfileData();
  const space = document.getElementById("profileSpace");

  // Render the right tab
  space.innerHTML = tabs[tabId](profile);

  // Update active nav style
  document.querySelectorAll(".profile-nav a").forEach((a) => {
    a.style.borderBottom = "none";
    a.style.color = "#000";
  });
  const activeLink = document.getElementById(tabId);
  if (activeLink) {
    activeLink.style.borderBottom = "2px solid #0f1ef3";
    activeLink.style.color = "#1d4ed8";
  }

  // Re-attach photo upload on Overview tab
  if (tabId === "navOverview") {
    const photoEl = document.getElementById("profilePhoto");
    const uploadEl = document.getElementById("photoUpload");
    if (photoEl && uploadEl) {
      photoEl.addEventListener("click", () => uploadEl.click());
      uploadEl.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
          photoEl.src = ev.target.result;
          const p = getProfileData();
          p.photo = ev.target.result;
          saveProfileData(p);
        };
        reader.readAsDataURL(file);
      });
    }
  }
};

// ── SIDEBAR NAV ───────────────────────────────
document.querySelectorAll(".navbar div").forEach((navItem) => {
  navItem.addEventListener("click", () => {
    document
      .querySelectorAll(".navbar div")
      .forEach((n) => n.classList.remove("home"));
    navItem.classList.add("home");
  });
});

document.querySelector(".profile").classList.add("home");

// ── LOGOUT SIDEBAR ────────────────────────────
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("launchpad_token");
    localStorage.removeItem("launchpad_user");
    window.location.href = "SignIn.html";
  });
}

//
document.querySelectorAll(".navbar div").forEach((navItem) => {
  navItem.addEventListener("click", () => {
    document
      .querySelectorAll(".navbar div")
      .forEach((n) => n.classList.remove("home"));
    navItem.classList.add("home");
  });
});

// document.querySelector(".browse").classList.add("home");
document.querySelector(".home").classList.remove("home");

// ── INIT ──────────────────────────────────────
// Load profile then render Overview tab
loadProfile().then(() => {
  switchTab("navOverview");
});
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
