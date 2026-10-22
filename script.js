/* ============================================================================
   Habiba Shoaib — Portfolio Interactions
   ---------------------------------------------------------------------------
   Vanilla JavaScript only (no frameworks, no libraries).

   Modules
     00. CONFIG        – editable placeholders (email, social links, roles)
     01. Utilities     – small helpers
     02. Theme         – dark / light toggle with localStorage
     03. Navigation    – smooth scroll, mobile drawer, active link, progress
     04. Typing        – hero role typing animation
     05. Particles     – canvas particle field reacting to the mouse
     06. Reveal        – IntersectionObserver scroll reveals + counters
     07. Cursor        – cursor glow follower + magnetic buttons
     08. Parallax      – scroll-linked background movement
     09. Projects      – details modal
     10. Contact form  – client-side validation (opens the email app)
     11. Toast         – small status messages
   ========================================================================== */

(function () {
  "use strict";

  /* ==========================================================================
     00. CONFIG — EDIT YOUR DETAILS HERE
     Leave the social URLs empty and the buttons will show a friendly
     "link coming soon" message instead of pointing nowhere.
     ======================================================================== */
  const CONFIG = {
    email: "habibashoaib460@gmail.com",
    location: "Islamabad, Pakistan",
    linkedin: "",   // e.g. "https://www.linkedin.com/in/your-profile/"
    github: "",     // e.g. "https://github.com/your-username"
    roles: [
      "Project Management Student",
      "Aspiring Project Manager",
      "Web Development Enthusiast",
      "Creative Problem Solver"
    ]
  };

  /* ==========================================================================
     01. UTILITIES
     ======================================================================== */
  const $  = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

  /** Trailing-edge debounce. */
  function debounce(fn, wait) {
    let t;
    return function () {
      const args = arguments;
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  /* ==========================================================================
     02. THEME TOGGLE
     ======================================================================== */
  const Theme = (function () {
    const STORAGE_KEY = "habiba-theme";
    const root = document.documentElement;
    const button = $("#theme-toggle");

    function apply(theme) {
      root.setAttribute("data-theme", theme);
      if (!button) return;
      const isLight = theme === "light";
      button.setAttribute("aria-pressed", String(isLight));
      button.setAttribute("aria-label", isLight ? "Switch to dark theme" : "Switch to light theme");
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute("content", isLight ? "#eef1fb" : "#05060f");
    }

    function init() {
      // 1) the visitor's saved choice, 2) the portfolio's signature dark theme
      let stored = null;
      try { stored = localStorage.getItem(STORAGE_KEY); } catch (e) { /* private mode */ }
      apply(stored || "dark");

      if (!button) return;
      button.addEventListener("click", function () {
        const next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
        apply(next);
        try { localStorage.setItem(STORAGE_KEY, next); } catch (e) { /* ignore */ }
      });
    }

    return { init: init };
  })();

  /* ==========================================================================
     03. NAVIGATION
     ======================================================================== */
  const Navigation = (function () {
    const header   = $("#site-header");
    const nav      = $("#primary-nav");
    const overlay  = $("#nav-overlay");
    const burger   = $("#hamburger");
    const progress = $("#scroll-progress");
    const toTop    = $("#to-top");
    const links    = $$(".nav__link");
    const sections = links
      .map(link => document.querySelector(link.getAttribute("href")))
      .filter(Boolean);

    let menuOpen = false;

    function headerHeight() {
      return header ? header.offsetHeight : 72;
    }

    /* --- Mobile drawer ---------------------------------------------------- */
    function openMenu() {
      if (!nav || !burger) return;
      menuOpen = true;
      nav.classList.add("is-open");
      burger.setAttribute("aria-expanded", "true");
      burger.setAttribute("aria-label", "Close menu");
      document.body.classList.add("is-locked");
      if (overlay) {
        overlay.hidden = false;
        requestAnimationFrame(() => overlay.classList.add("is-open"));
      }
    }

    function closeMenu() {
      if (!nav || !burger) return;
      menuOpen = false;
      nav.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");
      burger.setAttribute("aria-label", "Open menu");
      document.body.classList.remove("is-locked");
      if (overlay) {
        overlay.classList.remove("is-open");
        setTimeout(() => { if (!menuOpen) overlay.hidden = true; }, 350);
      }
    }

    function toggleMenu() { menuOpen ? closeMenu() : openMenu(); }

    /* --- Smooth scrolling -------------------------------------------------- */
    function scrollToTarget(target) {
      const top = target.getBoundingClientRect().top + window.scrollY - headerHeight() + 2;
      window.scrollTo({
        top: Math.max(top, 0),
        behavior: reduceMotion.matches ? "auto" : "smooth"
      });
    }

    function init() {
      // Hamburger
      if (burger) burger.addEventListener("click", toggleMenu);
      if (overlay) overlay.addEventListener("click", closeMenu);

      // Anchor links (nav + footer + in-page buttons)
      $$('a[href^="#"]').forEach(link => {
        link.addEventListener("click", function (event) {
          const hash = this.getAttribute("href");
          if (!hash || hash === "#" || hash.length < 2) return;
          const target = document.querySelector(hash);
          if (!target) return;

          event.preventDefault();
          if (menuOpen) closeMenu();
          scrollToTarget(target);

          // Keep the URL tidy without a jump
          if (history.replaceState) history.replaceState(null, "", hash);
        });
      });

      // Escape closes the drawer / modal
      document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && menuOpen) closeMenu();
      });

      // Close the drawer when resizing back to desktop
      window.addEventListener("resize", debounce(function () {
        if (window.innerWidth > 900 && menuOpen) closeMenu();
      }, 150));

      // Scroll-driven UI: header state, progress bar, active link, back-to-top
      let ticking = false;
      function onScroll() {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(function () {
          const y = window.scrollY;
          const docHeight = document.documentElement.scrollHeight - window.innerHeight;

          if (header) header.classList.toggle("is-scrolled", y > 24);
          if (progress) progress.style.width = (docHeight > 0 ? clamp((y / docHeight) * 100, 0, 100) : 0) + "%";
          if (toTop) toTop.classList.toggle("is-visible", y > 420);

          setActiveLink(y);
          ticking = false;
        });
      }

      function setActiveLink(y) {
        const line = y + headerHeight() + 120;
        let currentId = sections.length ? sections[0].id : "";
        sections.forEach(section => {
          if (section.offsetTop <= line) currentId = section.id;
        });
        // Bottom of the page → last section
        if (window.innerHeight + y >= document.body.scrollHeight - 4 && sections.length) {
          currentId = sections[sections.length - 1].id;
        }
        links.forEach(link => {
          link.classList.toggle("is-active", link.getAttribute("href") === "#" + currentId);
        });
      }

      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();

      // Back to top
      if (toTop) {
        toTop.addEventListener("click", function () {
          window.scrollTo({ top: 0, behavior: reduceMotion.matches ? "auto" : "smooth" });
        });
      }
    }

    return { init: init, scrollToTarget: scrollToTarget };
  })();

  /* ==========================================================================
     04. TYPING EFFECT
     ======================================================================== */
  const Typing = (function () {
    const target = $("#typing-text");
    if (!target) return { init: function () {} };

    let roleIndex = 0;
    let charIndex = 0;
    let deleting = false;
    let timer = null;

    function tick() {
      const current = CONFIG.roles[roleIndex];
      const text = deleting
        ? current.substring(0, --charIndex)
        : current.substring(0, ++charIndex);

      target.textContent = text;

      let delay = deleting ? 45 : 85;

      if (!deleting && charIndex === current.length) {
        deleting = true;
        delay = 1700; // hold the completed word
      } else if (deleting && charIndex === 0) {
        deleting = false;
        roleIndex = (roleIndex + 1) % CONFIG.roles.length;
        delay = 420; // short pause before the next word
      }

      timer = setTimeout(tick, delay);
    }

    function init() {
      if (reduceMotion.matches) {
        // No animation: show a stable, readable value instead.
        target.textContent = CONFIG.roles[0];
        return;
      }
      target.textContent = "";
      timer = setTimeout(tick, 700);
    }

    return { init: init };
  })();

  /* ==========================================================================
     05. PARTICLE FIELD (canvas)
     Interactive glowing dots that drift, react to the mouse and drift
     slightly with the page (parallax).
     ======================================================================== */
  const Particles = (function () {
    const canvas = $("#particle-canvas");
    if (!canvas) return { init: function () {} };

    const ctx = canvas.getContext("2d");
    const PALETTE = ["168,85,247", "56,189,248", "99,102,241", "192,132,252"];

    let particles = [];
    let width = 0;
    let height = 0;
    let dpr = 1;
    let rafId = null;
    let running = false;

    const pointer = { x: -9999, y: -9999, active: false };
    const MOUSE_RADIUS = 130;

    /* Pre-rendered glow sprites keep the animation fast (no per-frame gradients) */
    const sprites = PALETTE.map(function (rgb) {
      const c = document.createElement("canvas");
      c.width = c.height = 64;
      const g = c.getContext("2d");
      const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, "rgba(" + rgb + ",0.95)");
      grad.addColorStop(0.25, "rgba(" + rgb + ",0.42)");
      grad.addColorStop(1, "rgba(" + rgb + ",0)");
      g.fillStyle = grad;
      g.fillRect(0, 0, 64, 64);
      return c;
    });

    function createParticle() {
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.32,
        vy: (Math.random() - 0.5) * 0.32,
        size: 1.4 + Math.random() * 3.4,
        alpha: 0.28 + Math.random() * 0.5,
        sprite: Math.floor(Math.random() * sprites.length),
        depth: 0.25 + Math.random() * 0.85, // parallax factor
        pulse: Math.random() * Math.PI * 2
      };
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Density scales with the viewport, capped for performance
      const count = clamp(Math.floor((width * height) / 16000), 26, 96);
      particles = [];
      for (let i = 0; i < count; i++) particles.push(createParticle());
    }

    function draw(staticFrame) {
      ctx.clearRect(0, 0, width, height);

      const scrollOffset = window.scrollY * 0.06;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (!staticFrame) {
          p.pulse += 0.015;
          p.x += p.vx;
          p.y += p.vy;
        }

        /* Parallax: particles with a greater depth travel further with the page */
        let y = p.y - scrollOffset * p.depth;
        // ...and wrap back into the viewport so the field never leaves gaps
        if (y < -60) y += height + 120;
        else if (y > height + 60) y -= height + 120;

        /* Mouse interaction: particles drift away from the cursor.
           The force is applied to the raw position, which shifts the rendered
           position by the same amount — so the push always matches the cursor. */
        if (!staticFrame && pointer.active) {
          const dx = p.x - pointer.x;
          const dy = y - pointer.y;
          const dist = Math.hypot(dx, dy);
          if (dist < MOUSE_RADIUS && dist > 0.001) {
            const force = (1 - dist / MOUSE_RADIUS) * 0.9;
            p.x += (dx / dist) * force;
            p.y += (dy / dist) * force;
          }
        }

        // Keep the raw position inside the viewport as well
        if (!staticFrame) {
          if (p.x < -60) p.x = width + 60;
          if (p.x > width + 60) p.x = -60;
          if (p.y < -60) p.y = height + 60;
          if (p.y > height + 60) p.y = -60;
        }

        const twinkle = staticFrame ? 1 : 0.72 + Math.sin(p.pulse) * 0.28;
        const alpha = p.alpha * twinkle;
        const size = p.size * (staticFrame ? 1 : 1 + Math.sin(p.pulse) * 0.12);

        ctx.globalAlpha = alpha;
        ctx.drawImage(sprites[p.sprite], p.x - size * 5, y - size * 5, size * 10, size * 10);
      }

      ctx.globalAlpha = 1;
    }

    function loop() {
      draw(false);
      rafId = requestAnimationFrame(loop);
    }

    function start() {
      if (running || reduceMotion.matches) return;
      running = true;
      rafId = requestAnimationFrame(loop);
    }

    function stop() {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
    }

    function init() {
      resize();
      window.addEventListener("resize", debounce(resize, 180));

      // Mouse / touch tracking
      window.addEventListener("pointermove", function (event) {
        pointer.x = event.clientX;
        pointer.y = event.clientY;
        pointer.active = true;
      }, { passive: true });

      window.addEventListener("pointerleave", function () { pointer.active = false; });
      window.addEventListener("pointerdown", function (event) {
        pointer.x = event.clientX;
        pointer.y = event.clientY;
        pointer.active = true;
      }, { passive: true });

      // Stop the loop when the tab is hidden to save battery
      document.addEventListener("visibilitychange", function () {
        document.hidden ? stop() : start();
      });

      if (reduceMotion.matches) {
        // Static, decorative single frame instead of an animation
        draw(true);
      } else {
        start();
      }
    }

    return { init: init };
  })();

  /* ==========================================================================
     06. SCROLL REVEAL + COUNTERS
     ======================================================================== */
  const Reveal = (function () {
    const items = $$("[data-reveal]");
    const counters = $$("[data-count]");

    /* Manual viewport check — a safety net so content can never stay
       hidden if IntersectionObserver notifications are delayed (e.g. the
       page was opened in a background tab). */
    function revealInView() {
      const vh = window.innerHeight;
      items.forEach(item => {
        if (item.classList.contains("is-visible")) return;
        const rect = item.getBoundingClientRect();
        if (rect.top < vh * 0.92 && rect.bottom > 0) item.classList.add("is-visible");
      });
      counters.forEach(function (el) {
        if (el.dataset.counted === "1") return;
        const rect = el.getBoundingClientRect();
        if (rect.top < vh && rect.bottom > 0) {
          el.dataset.counted = "1";
          countUp(el);
        }
      });
    }

    function init() {
      // Apply stagger delays declared in the markup
      items.forEach(item => {
        const delay = item.getAttribute("data-reveal-delay");
        if (delay) item.style.setProperty("--reveal-delay", delay + "ms");
      });

      // Anything already on screen shows straight away
      revealInView();

      if (!("IntersectionObserver" in window)) {
        items.forEach(item => item.classList.add("is-visible"));
        counters.forEach(countUp);
        return;
      }

      const observer = new IntersectionObserver(function (entries) {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      }, { threshold: 0.14, rootMargin: "0px 0px -8% 0px" });

      items.forEach(item => observer.observe(item));

      // Animate the statistic numbers once they scroll into view
      if (counters.length) {
        const counterObserver = new IntersectionObserver(function (entries) {
          entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.dataset.counted = "1";
            countUp(entry.target);
            counterObserver.unobserve(entry.target);
          });
        }, { threshold: 0.5 });
        counters.forEach(el => counterObserver.observe(el));
      }

      // Re-check whenever the tab becomes visible again
      document.addEventListener("visibilitychange", function () {
        if (!document.hidden) revealInView();
      });
      window.addEventListener("pageshow", revealInView);
      window.addEventListener("load", revealInView);
    }

    function countUp(el) {
      const target = parseInt(el.getAttribute("data-count"), 10) || 0;
      if (reduceMotion.matches) { el.textContent = String(target); return; }

      const duration = 1100;
      const startTime = performance.now();
      function step(now) {
        const progress = clamp((now - startTime) / duration, 0, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = String(Math.round(target * eased));
        if (progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    return { init: init };
  })();

  /* ==========================================================================
     07. CURSOR GLOW + MAGNETIC BUTTONS
     ======================================================================== */
  const Cursor = (function () {
    const glow = $(".cursor-glow");
    const supportsHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    function init() {
      if (!glow || !supportsHover || reduceMotion.matches) return;

      let targetX = 0, targetY = 0, currentX = 0, currentY = 0;
      let rafId = null;

      window.addEventListener("pointermove", function (event) {
        targetX = event.clientX;
        targetY = event.clientY;
        glow.classList.add("is-active");
        if (!rafId) rafId = requestAnimationFrame(loop);
      }, { passive: true });

      window.addEventListener("pointerleave", function () {
        glow.classList.remove("is-active");
      });

      function loop() {
        currentX += (targetX - currentX) * 0.12;
        currentY += (targetY - currentY) * 0.12;
        glow.style.transform = "translate3d(" + currentX + "px," + currentY + "px,0)";
        if (Math.abs(targetX - currentX) > 0.5 || Math.abs(targetY - currentY) > 0.5) {
          rafId = requestAnimationFrame(loop);
        } else {
          rafId = null;
        }
      }

      /* Magnetic pull on primary buttons */
      $$(".btn").forEach(function (btn) {
        btn.addEventListener("pointermove", function (event) {
          if (reduceMotion.matches) return;
          const rect = btn.getBoundingClientRect();
          const x = event.clientX - rect.left - rect.width / 2;
          const y = event.clientY - rect.top - rect.height / 2;
          btn.style.transform = "translate(" + (x * 0.16).toFixed(2) + "px," + (y * 0.22).toFixed(2) + "px)";
        });
        btn.addEventListener("pointerleave", function () {
          btn.style.transform = "";
        });
      });
    }

    return { init: init };
  })();

  /* ==========================================================================
     08. PARALLAX BACKGROUND
     ======================================================================== */
  const Parallax = (function () {
    const orbs = $(".bg-orbs");
    const grid = $(".bg-grid");

    function init() {
      if (!orbs && !grid) return;
      if (reduceMotion.matches) return;

      let ticking = false;
      function update() {
        const y = window.scrollY;
        if (orbs) orbs.style.transform = "translate3d(0," + (-y * 0.035).toFixed(2) + "px,0)";
        if (grid) grid.style.transform = "translate3d(0," + (-y * 0.06).toFixed(2) + "px,0)";
        ticking = false;
      }

      window.addEventListener("scroll", function () {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(update);
        }
      }, { passive: true });

      update();
    }

    return { init: init };
  })();

  /* ==========================================================================
     09. PROJECT DETAILS MODAL
     ======================================================================== */
  const ProjectModal = (function () {
    const modal = $("#project-modal");
    if (!modal) return { init: function () {} };

    const titleEl = $("#modal-title");
    const descEl  = $("#modal-desc");
    const tagsEl  = $("#modal-tags");
    const statusEl = $("#modal-status");
    let lastFocused = null;

    function open(project) {
      const data = project.dataset;
      titleEl.textContent = data.title || "Project";
      descEl.textContent = data.description || "";
      statusEl.textContent = data.status || "Project";

      tagsEl.innerHTML = "";
      (data.tags || "").split("|").filter(Boolean).forEach(function (tag) {
        const li = document.createElement("li");
        li.textContent = tag.trim();
        tagsEl.appendChild(li);
      });

      lastFocused = document.activeElement;
      modal.hidden = false;
      document.body.classList.add("is-locked");
      requestAnimationFrame(function () {
        modal.classList.add("is-open");
        const close = $(".modal__close", modal);
        if (close) close.focus();
      });
    }

    function close() {
      modal.classList.remove("is-open");
      document.body.classList.remove("is-locked");
      setTimeout(function () { modal.hidden = true; }, 320);
      if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
    }

    function init() {
      $$("[data-project-open]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          const project = this.closest(".project");
          if (project) open(project);
        });
      });

      $$("[data-modal-close]", modal).forEach(el => el.addEventListener("click", close));

      document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && !modal.hidden) close();
      });

      // Simple focus trap while the dialog is open
      modal.addEventListener("keydown", function (event) {
        if (event.key !== "Tab") return;
        const focusables = $$('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])', modal)
          .filter(el => !el.hasAttribute("disabled"));
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault(); last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault(); first.focus();
        }
      });
    }

    return { init: init };
  })();

  /* ==========================================================================
     10. CONTACT FORM — CLIENT-SIDE VALIDATION
     The form has no backend. On a valid submission it opens the visitor's
     email client with the message pre-filled (mailto:), and clearly says so.
     ======================================================================== */
  const ContactForm = (function () {
    const form = $("#contact-form");
    if (!form) return { init: function () {} };

    const status = $("#form-status");
    const submitBtn = $("#submit-btn");
    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    const FIELDS = [
      { id: "name",    error: "name-error",    test: v => v.trim().length >= 2,            message: "Please enter your name (at least 2 characters)." },
      { id: "email",   error: "email-error",   test: v => EMAIL_RE.test(v.trim()),          message: "Please enter a valid email address." },
      { id: "message", error: "message-error", test: v => v.trim().length >= 10,           message: "Please write a message of at least 10 characters." }
    ];

    function fieldWrap(input) { return input.closest(".field"); }

    function showError(field, message) {
      const input = document.getElementById(field.id);
      if (!input) return;
      const wrap = fieldWrap(input);
      const errorEl = document.getElementById(field.error);
      if (wrap) wrap.classList.add("is-invalid");
      if (errorEl) errorEl.textContent = message;
      input.setAttribute("aria-invalid", "true");
    }

    function clearError(field) {
      const input = document.getElementById(field.id);
      if (!input) return;
      const wrap = fieldWrap(input);
      const errorEl = document.getElementById(field.error);
      if (wrap) wrap.classList.remove("is-invalid");
      if (errorEl) errorEl.textContent = "";
      input.removeAttribute("aria-invalid");
    }

    function validateField(field) {
      const input = document.getElementById(field.id);
      if (!input) return true;
      const value = input.value;
      if (field.test(value)) { clearError(field); return true; }
      showError(field, field.message);
      return false;
    }

    function setStatus(text, isError) {
      if (!status) return;
      status.textContent = text;
      status.classList.toggle("is-error", !!isError);
    }

    function init() {
      FIELDS.forEach(function (field) {
        const input = document.getElementById(field.id);
        if (!input) return;
        input.addEventListener("blur", function () { validateField(field); });
        input.addEventListener("input", function () {
          const wrap = fieldWrap(input);
          if (wrap && wrap.classList.contains("is-invalid")) validateField(field);
        });
      });

      form.addEventListener("submit", function (event) {
        event.preventDefault();

        let valid = true;
        let firstInvalid = null;
        FIELDS.forEach(function (field) {
          const input = document.getElementById(field.id);
          if (!input) return;
          const ok = validateField(field);
          if (!ok) {
            valid = false;
            if (!firstInvalid) firstInvalid = input;
          }
        });

        if (!valid) {
          setStatus("Please fix the highlighted fields and try again.", true);
          if (firstInvalid) firstInvalid.focus();
          return;
        }

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const subjectInput = document.getElementById("subject");
        const subject = subjectInput && subjectInput.value.trim()
          ? subjectInput.value.trim()
          : "Portfolio enquiry";
        const message = document.getElementById("message").value.trim();

        const body = [
          "Name: " + name,
          "Email: " + email,
          "",
          message
        ].join("\n");

        const mailto = "mailto:" + CONFIG.email +
          "?subject=" + encodeURIComponent(subject + " — " + name) +
          "&body=" + encodeURIComponent(body);

        // Open the visitor's email client with the message ready to send.
        window.location.href = mailto;

        setStatus("Your email app should now be open with the message pre-filled. " +
                  "Press send there to deliver it — nothing is sent from this page.");
        if (submitBtn) {
          const label = $(".btn__label", submitBtn);
          if (label) label.textContent = "Message prepared ✓";
        }
      });
    }

    return { init: init };
  })();

  /* ==========================================================================
     11. TOAST + SOCIAL PLACEHOLDERS
     ======================================================================== */
  const Toast = (function () {
    const el = $("#toast");
    let timer = null;

    function show(message) {
      if (!el) return;
      el.textContent = message;
      el.classList.add("is-visible");
      clearTimeout(timer);
      timer = setTimeout(function () { el.classList.remove("is-visible"); }, 4200);
    }

    return { show: show };
  })();

  function initSocialLinks() {
    const urls = { linkedin: CONFIG.linkedin, github: CONFIG.github };
    const labels = { linkedin: "LinkedIn", github: "GitHub" };

    $$("[data-social]").forEach(function (link) {
      const key = link.getAttribute("data-social");
      const url = (urls[key] || "").trim();

      if (url) {
        // Real URL available → make the link work normally.
        link.setAttribute("href", url);
        link.setAttribute("target", "_blank");
        link.setAttribute("rel", "noopener noreferrer");
        link.removeAttribute("aria-disabled");
      } else {
        // Placeholder: explain instead of linking to nowhere.
        link.setAttribute("href", "#");
        link.setAttribute("aria-disabled", "true");
        link.addEventListener("click", function (event) {
          event.preventDefault();
          Toast.show("The " + labels[key] + " link is a placeholder for now — add your URL in " +
                     "script.js (CONFIG) to activate it.");
        });
      }
    });
  }

  /* ==========================================================================
     BOOT
     ======================================================================== */
  function init() {
    Theme.init();
    Navigation.init();
    Typing.init();
    Particles.init();
    Reveal.init();
    Cursor.init();
    Parallax.init();
    ProjectModal.init();
    ContactForm.init();
    initSocialLinks();

    // Footer year
    const year = $("#year");
    if (year) year.textContent = String(new Date().getFullYear());
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
