// =============================================
//  LaunchPad — Landing Page JS
// =============================================

// ── ANIMATED NAVIGATION ───────────────────────
// Fades and slides the page out before navigating
function animateOut(destination) {
  document.body.style.transition = "opacity 0.4s ease, transform 0.4s ease";
  document.body.style.opacity = "0";
  document.body.style.transform = "translateY(-20px)";

  setTimeout(() => {
    window.location.href = destination;
  }, 400);
}

// ── FADE IN ON LOAD ───────────────────────────
// Page fades in smoothly when it loads
window.addEventListener("DOMContentLoaded", () => {
  document.body.style.opacity = "0";
  document.body.style.transform = "translateY(20px)";
  document.body.style.transition = "opacity 0.5s ease, transform 0.5s ease";

  // Small delay so browser registers the starting state first
  setTimeout(() => {
    document.body.style.opacity = "1";
    document.body.style.transform = "translateY(0)";
  }, 50);
});

// ── NAV BUTTONS ───────────────────────────────
// Sign In button (first button in nav-btn)
const navButtons = document.querySelectorAll(".nav-btn button");

navButtons[0].addEventListener("click", () => {
  animateOut("Signin.html");
});

// Sign Up button (second button in nav-btn)
navButtons[1].addEventListener("click", () => {
  animateOut("SignUp.html");
});

// ── MAIN BUTTONS ──────────────────────────────
// Find Jobs button (first button in .container)
const mainButtons = document.querySelectorAll(".container button");

mainButtons[0].addEventListener("click", () => {
  animateOut("Signin.html");
});

// Create Account button (second button in .container)
mainButtons[1].addEventListener("click", () => {
  animateOut("SignUp.html");
});

// ── MOBILE MENU ───────────────────────────────
const menuIcon = document.querySelector(".menu");
const closeIcon = document.querySelector(".close");
const responsiveNav = document.querySelector(".responsive-nav");

if (menuIcon) {
  menuIcon.addEventListener("click", () => {
    responsiveNav.style.display = "flex";
    menuIcon.style.display = "none";
    closeIcon.style.display = "block";
  });
}

if (closeIcon) {
  closeIcon.addEventListener("click", () => {
    responsiveNav.style.display = "none";
    closeIcon.style.display = "none";
    menuIcon.style.display = "block";
  });
}

// ── RESPONSIVE NAV LINKS ──────────────────────
// Sign in / sign up from mobile menu too
const responsiveLinks = document.querySelectorAll(".responsive-nav a");
responsiveLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
    // Close menu first then navigate normally
    responsiveNav.style.display = "none";
    closeIcon.style.display = "none";
    menuIcon.style.display = "block";
  });
});
