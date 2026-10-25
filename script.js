"use strict";

const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector("#nav-links");
const backToTop = document.querySelector(".back-to-top");
const contactForm = document.querySelector("#contact-form");
const formStatus = document.querySelector("#form-status");
const submitButton = contactForm.querySelector(".form-submit");
const submitButtonLabel = submitButton.querySelector(".form-submit-label");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const EMAILJS_PUBLIC_KEY = "hOpIoGCeeiQ5ZwfL5";
const EMAILJS_SERVICE_ID = "service_opcckwg";
const EMAILJS_TEMPLATE_ID = "template_j2vzoim";

if (typeof emailjs !== "undefined") {
  emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
}

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
    requiredMessage: "Please enter your full name.",
    message: "Please enter at least 2 characters.",
    validate: (value) => value.trim().length >= 2,
  },
  email: {
    requiredMessage: "Please enter your email address.",
    message: "Please enter a valid email address.",
    validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()),
  },
  subject: {
    requiredMessage: "Please enter a subject.",
    message: "Please enter a subject of at least 2 characters.",
    validate: (value) => value.trim().length >= 2,
  },
  message: {
    requiredMessage: "Please enter a message.",
    message: "Please enter a message of at least 10 characters.",
    validate: (value) => value.trim().length >= 10,
  },
};

function validateField(fieldName) {
  const field = contactForm.elements.namedItem(fieldName);
  const errorMessage = document.querySelector(`#${fieldName}-error`);
  const rule = validationRules[fieldName];
  const value = field.value.trim();
  const isValid = value.length > 0 && rule.validate(value);

  field.setAttribute("aria-invalid", String(!isValid));
  errorMessage.textContent = isValid ? "" : value.length === 0 ? rule.requiredMessage : rule.message;
  return isValid;
}

Object.keys(validationRules).forEach((fieldName) => {
  contactForm.elements.namedItem(fieldName).addEventListener("input", () => {
    if (contactForm.elements.namedItem(fieldName).hasAttribute("aria-invalid")) {
      validateField(fieldName);
    }
  });
});

let isSending = false;

contactForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (isSending) {
    return;
  }

  formStatus.textContent = "";
  formStatus.className = "form-status";

  const invalidFields = Object.keys(validationRules).filter((fieldName) => !validateField(fieldName));
  if (invalidFields.length > 0) {
    formStatus.textContent = "Please review the highlighted fields and try again.";
    formStatus.classList.add("error");
    contactForm.elements.namedItem(invalidFields[0]).focus();
    return;
  }

  if (typeof emailjs === "undefined") {
    formStatus.textContent = "The email service could not load. Please try again later or email me directly at aniketlakade4098@gmail.com.";
    formStatus.classList.add("error");
    return;
  }

  isSending = true;
  submitButton.disabled = true;
  submitButton.setAttribute("aria-busy", "true");
  submitButtonLabel.textContent = "Sending...";
  formStatus.textContent = "Sending your message...";

  Promise.resolve().then(() => emailjs.sendForm(
    EMAILJS_SERVICE_ID,
    EMAILJS_TEMPLATE_ID,
    contactForm,
  )).then(() => {
    formStatus.textContent = "Your message was sent successfully. Thank you for getting in touch!";
    formStatus.classList.add("success");
  }).catch((error) => {
    console.error("EmailJS contact form submission failed:", error);
    formStatus.textContent = "We couldn't send your message. Please try again shortly or email me directly at aniketlakade4098@gmail.com.";
    formStatus.classList.add("error");
  }).finally(() => {
    isSending = false;
    submitButton.disabled = false;
    submitButton.removeAttribute("aria-busy");
    submitButtonLabel.textContent = "Send Message";
  });
});
