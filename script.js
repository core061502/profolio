const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const nav = document.querySelector("[data-nav]");
const navLinks = [...nav.querySelectorAll("a")];
const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);
const form = document.querySelector("#contact-form");
const status = document.querySelector("#form-status");

const setHeaderState = () => {
  header.classList.toggle("is-solid", window.scrollY > 24);
};

const closeMenu = () => {
  header.classList.remove("is-open");
  menuToggle.setAttribute("aria-expanded", "false");
  document.body.style.overflow = "";
};

menuToggle.addEventListener("click", () => {
  const open = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!open));
  header.classList.toggle("is-open", !open);
  document.body.style.overflow = open ? "" : "hidden";
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    closeMenu();
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMenu();
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 760) closeMenu();
});

const markActiveLink = (id) => {
  navLinks.forEach((link) => {
    link.classList.toggle("is-active", link.getAttribute("href") === `#${id}`);
  });
};

const sectionObserver = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (visible) markActiveLink(visible.target.id);
  },
  { rootMargin: "-40% 0px -45% 0px", threshold: [0.15, 0.4, 0.7] }
);

sections.forEach((section) => sectionObserver.observe(section));

const revealItems = document.querySelectorAll(".reveal");
const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  },
  { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
);

if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  revealItems.forEach((item) => item.classList.add("is-visible"));
} else {
  revealItems.forEach((item, index) => {
    item.style.transitionDelay = `${Math.min(index % 3, 2) * 90}ms`;
    revealObserver.observe(item);
  });
}

const fields = {
  name: {
    el: form.elements.name,
    message: "이름을 입력해 주세요.",
    valid: (value) => value.trim().length > 0,
  },
  email: {
    el: form.elements.email,
    message: "올바른 이메일을 입력해 주세요.",
    valid: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()),
  },
  message: {
    el: form.elements.message,
    message: "메시지를 입력해 주세요.",
    valid: (value) => value.trim().length > 0,
  },
};

const showError = (name, message) => {
  const error = form.querySelector(`[data-error-for="${name}"]`);
  error.textContent = message;
  fields[name].el.setAttribute("aria-invalid", message ? "true" : "false");
};

Object.entries(fields).forEach(([name, field]) => {
  field.el.addEventListener("input", () => {
    if (field.valid(field.el.value)) showError(name, "");
    status.textContent = "";
  });
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  let firstInvalid = null;

  Object.entries(fields).forEach(([name, field]) => {
    const ok = field.valid(field.el.value);
    showError(name, ok ? "" : field.message);
    if (!ok && !firstInvalid) firstInvalid = field.el;
  });

  if (firstInvalid) {
    status.textContent = "";
    firstInvalid.focus();
    return;
  }

  const name = fields.name.el.value.trim();
  form.reset();
  Object.keys(fields).forEach((key) => showError(key, ""));
  status.textContent = `${name}님, 메시지를 확인했습니다. 시연용 폼이라 실제로 전송되지는 않습니다.`;
});

setHeaderState();
window.addEventListener("scroll", setHeaderState, { passive: true });
