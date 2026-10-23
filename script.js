"use strict";

const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector("#nav-links");
const backToTop = document.querySelector(".back-to-top");
const contactForm = document.querySelector("#contact-form");
const formStatus = document.querySelector("#form-status");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function closeMenu() {
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open navigation menu");
  navLinks.classList.remove("open");
}

menuToggle.addEventListener("click", () => {
  const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isExpanded));
  menuToggle.setAttribute("aria-label", isExpanded ? "Open navigation menu" : "Close navigation menu");
  navLinks.classList.toggle("open", !isExpanded);
});

navLinks.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", closeMenu);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && navLinks.classList.contains("open")) {
    closeMenu();
    menuToggle.focus();
  }
});

function updateBackToTop() {
  backToTop.classList.toggle("visible", window.scrollY > 420);
}

window.addEventListener("scroll", updateBackToTop, { passive: true });
updateBackToTop();

backToTop.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
});

document.querySelector("#current-year").textContent = String(new Date().getFullYear());

const revealElements = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window && !reduceMotion) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealElements.forEach((element) => revealObserver.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add("is-visible"));
}

const validationRules = {
  name: {
    message: "Please enter at least 2 characters.",
    validate: (value) => value.trim().length >= 2,
  },
  email: {
    message: "Please enter a valid email address.",
    validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()),
  },
  subject: {
    message: "Please enter a subject of at least 2 characters.",
    validate: (value) => value.trim().length >= 2,
  },
  message: {
    message: "Please enter a message of at least 10 characters.",
    validate: (value) => value.trim().length >= 10,
  },
};

function validateField(fieldName) {
  const field = contactForm.elements.namedItem(fieldName);
  const errorMessage = document.querySelector(`#${fieldName}-error`);
  const rule = validationRules[fieldName];
  const isValid = rule.validate(field.value);

  field.setAttribute("aria-invalid", String(!isValid));
  errorMessage.textContent = isValid ? "" : rule.message;
  return isValid;
}

Object.keys(validationRules).forEach((fieldName) => {
  contactForm.elements.namedItem(fieldName).addEventListener("input", () => {
    if (contactForm.elements.namedItem(fieldName).hasAttribute("aria-invalid")) {
      validateField(fieldName);
    }
  });
});

contactForm.addEventListener("submit", (event) => {
  event.preventDefault();
  formStatus.textContent = "";
  formStatus.className = "form-status";

  const invalidFields = Object.keys(validationRules).filter((fieldName) => !validateField(fieldName));
  if (invalidFields.length > 0) {
    formStatus.textContent = "Please review the highlighted fields and try again.";
    formStatus.classList.add("error");
    contactForm.elements.namedItem(invalidFields[0]).focus();
    return;
  }

  formStatus.textContent = "Your message is valid. This demo does not send it; connect a backend or email service to enable delivery.";
  formStatus.classList.add("success");
});
