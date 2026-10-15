/**
 * MAISON ROYAL — GRAND CHAUFFEUR & LIMOUSINE SERVICE
 * Core Script: Theme Toggle (Emoji Alone), RTL Toggle (No Emoji),
 * Centered Navigation Dropdown, Working Interactive Map,
 * Open Executive Dashboard (No Login Required), and Booking Engine
 */

(() => {
  "use strict";

  const AUTH_KEY = "maisonRideDemoUser";
  const BOOKINGS_KEY = "maisonRideDemoBookings";
  const THEME_KEY = "maison_theme";
  const DIR_KEY = "maison_dir";

  /* ==========================================================================
     1. THEME TOGGLE — EMOJI ALONE (🌙 / ☀️), NO TEXT
     ========================================================================== */
  const initTheme = () => {
    const savedTheme = localStorage.getItem(THEME_KEY);
    const systemPrefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = savedTheme || (systemPrefersDark ? "dark" : "light");

    document.documentElement.setAttribute("data-theme", initialTheme);
    updateThemeToggleUI(initialTheme);

    document.querySelectorAll(".theme-toggle").forEach((btn) => {
      btn.addEventListener("click", () => {
        const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
        const newTheme = currentTheme === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", newTheme);
        localStorage.setItem(THEME_KEY, newTheme);
        updateThemeToggleUI(newTheme);
      });
    });
  };

  const updateThemeToggleUI = (theme) => {
    document.querySelectorAll(".theme-toggle").forEach((btn) => {
      const icon = btn.querySelector(".theme-icon") || btn;
      // Keep emoji alone!
      icon.textContent = theme === "dark" ? "☀️" : "🌙";
      btn.setAttribute("title", `Switch to ${theme === "dark" ? "light" : "dark"} theme`);
      btn.setAttribute("aria-label", `Switch to ${theme === "dark" ? "light" : "dark"} theme`);
    });
  };

  /* ==========================================================================
     2. RTL TOGGLE — NO EMOJI, CLEAN TEXT ALONE (RTL / LTR)
     ========================================================================== */
  const initRTL = () => {
    const savedDir = localStorage.getItem(DIR_KEY) || "ltr";
    document.documentElement.setAttribute("dir", savedDir);
    updateRTLToggleUI(savedDir);

    document.querySelectorAll(".rtl-toggle").forEach((btn) => {
      btn.addEventListener("click", () => {
        const currentDir = document.documentElement.getAttribute("dir") || "ltr";
        const newDir = currentDir === "rtl" ? "ltr" : "rtl";
        document.documentElement.setAttribute("dir", newDir);
        localStorage.setItem(DIR_KEY, newDir);
        updateRTLToggleUI(newDir);
      });
    });
  };

  const updateRTLToggleUI = (dir) => {
    document.querySelectorAll(".rtl-toggle").forEach((btn) => {
      const text = btn.querySelector(".ctrl-text") || btn;
      // No emoji! Clean text alone
      text.textContent = dir === "rtl" ? "LTR" : "RTL";
      btn.setAttribute("title", `Switch to ${dir === "rtl" ? "LTR (Left-to-Right)" : "RTL (Right-to-Left)"}`);
      btn.setAttribute("aria-label", `Switch to ${dir === "rtl" ? "Left-to-Right" : "Right-to-Left"}`);
      if (dir === "rtl") {
        btn.classList.add("is-active");
      } else {
        btn.classList.remove("is-active");
      }
    });
  };

  /* ==========================================================================
     3. NAVIGATION: DROPDOWN & ANCHORED MOBILE HAMBURGER
     ========================================================================== */
  const initNavigation = () => {
    const menuToggle = document.querySelector(".menu-toggle");
    const primaryNav = document.querySelector(".primary-nav");

    if (menuToggle && primaryNav) {
      menuToggle.addEventListener("click", (e) => {
        e.stopPropagation();
        const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
        menuToggle.setAttribute("aria-expanded", String(!isOpen));
        menuToggle.setAttribute("aria-label", isOpen ? "Open navigation menu" : "Close navigation menu");
        primaryNav.classList.toggle("is-open", !isOpen);
      });

      // Close mobile menu on regular link click
      primaryNav.addEventListener("click", (e) => {
        if (e.target instanceof HTMLAnchorElement && !e.target.closest(".nav-dropdown-toggle")) {
          primaryNav.classList.remove("is-open");
          menuToggle.setAttribute("aria-expanded", "false");
        }
      });
    }

    // Home Dropdown Support (Click & Keyboard)
    document.querySelectorAll(".nav-dropdown").forEach((dropdown) => {
      const toggle = dropdown.querySelector(".nav-dropdown-toggle");
      if (!toggle) return;

      toggle.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const isOpen = dropdown.classList.contains("is-active");
        dropdown.classList.toggle("is-active", !isOpen);
        toggle.setAttribute("aria-expanded", String(!isOpen));
      });

      // Close dropdown when any item is clicked
      dropdown.querySelectorAll(".dropdown-item").forEach((item) => {
        item.addEventListener("click", () => {
          dropdown.classList.remove("is-active");
          toggle.setAttribute("aria-expanded", "false");
          if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
          }
        });
      });

      // Close on outside click
      document.addEventListener("click", (e) => {
        if (!dropdown.contains(e.target)) {
          dropdown.classList.remove("is-active");
          toggle.setAttribute("aria-expanded", "false");
        }
      });

      // Close on Escape
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && dropdown.classList.contains("is-active")) {
          dropdown.classList.remove("is-active");
          toggle.setAttribute("aria-expanded", "false");
          toggle.focus();
        }
      });
    });
  };

  /* ==========================================================================
     4. INTERACTIVE WORKING MAP IN CONTACT PAGE
     ========================================================================== */
  const initInteractiveMap = () => {
    const cityButtons = document.querySelectorAll(".map-tab-btn");
    const mapFrame = document.getElementById("interactive-map-frame");
    const cityTitle = document.getElementById("city-title");
    const cityAddress = document.getElementById("city-address");
    const cityCoords = document.getElementById("city-coords");
    const cityPhone = document.getElementById("city-phone");
    const cityFbo = document.getElementById("city-fbo");
    const cityEta = document.getElementById("city-eta");

    if (!cityButtons.length || !mapFrame) return;

    // Database of luxury dispatch hubs
    const cityData = {
      ny: {
        title: "New York Executive Headquarters",
        address: "<strong>Address:</strong> 767 Fifth Avenue, Midtown Manhattan, New York, NY 10153",
        coords: "<strong>Coordinates:</strong> 40.7638° N, 73.9725° W (Manhattan Dispatch)",
        phone: "+1 (800) 555-MAISON / +1 (212) 555-0199",
        fbo: "Teterboro (TEB), JFK General Aviation, Westchester (HPN)",
        eta: "4 to 6 minutes in Manhattan",
        mapUrl: "https://www.openstreetmap.org/export/embed.html?bbox=-73.9850%2C40.7580%2C-73.9650%2C40.7720&layer=mapnik&marker=40.7640%2C-73.9720"
      },
      london: {
        title: "London Mayfair Chauffeur Salon",
        address: "<strong>Address:</strong> 14 Berkeley Square, Mayfair, London W1J 6BQ, United Kingdom",
        coords: "<strong>Coordinates:</strong> 51.5090° N, 0.1465° W (Mayfair VIP Standby)",
        phone: "+44 (20) 7946 0912 / +1 (800) 555-0199",
        fbo: "Farnborough (FAB), London RAF Northolt (NHT), Biggin Hill (BQH)",
        eta: "5 to 7 minutes in West End & City of London",
        mapUrl: "https://www.openstreetmap.org/export/embed.html?bbox=-0.1550%2C51.5030%2C-0.1380%2C51.5140&layer=mapnik&marker=51.5090%2C-0.1465"
      },
      paris: {
        title: "Paris Champs-Élysées Chauffeur Hub",
        address: "<strong>Address:</strong> 34 Avenue des Champs-Élysées, 8e Arrondissement, 75008 Paris, France",
        coords: "<strong>Coordinates:</strong> 48.8708° N, 2.3080° E (Parisian Diplomatic Corps)",
        phone: "+33 (1) 42 68 55 00 / +1 (800) 555-0199",
        fbo: "Paris Le Bourget (LBG), Charles de Gaulle VIP (CDG)",
        eta: "5 to 8 minutes in 8th & 16th Arrondissements",
        mapUrl: "https://www.openstreetmap.org/export/embed.html?bbox=2.2980%2C48.8650%2C2.3180%2C48.8760&layer=mapnik&marker=48.8708%2C2.3080"
      },
      dubai: {
        title: "Dubai World Central VIP Aviation Terminal",
        address: "<strong>Address:</strong> Al Maktoum International Airport, VIP Aviation Pavilion, Dubai, UAE",
        coords: "<strong>Coordinates:</strong> 24.8967° N, 55.1614° E (Emirates VIP Fleet)",
        phone: "+971 (4) 388 9200 / +1 (800) 555-0199",
        fbo: "DWC VIP Terminal, Dubai International Jet Aviation (DXB)",
        eta: "8 to 10 minutes in Downtown Dubai & DIFC",
        mapUrl: "https://www.openstreetmap.org/export/embed.html?bbox=55.1450%2C24.8850%2C55.1780%2C24.9080&layer=mapnik&marker=24.8967%2C55.1614"
      }
    };

    cityButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const cityKey = btn.getAttribute("data-city");
        const data = cityData[cityKey];
        if (!data) return;

        // Switch active tab
        cityButtons.forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");

        // Smoothly update iframe map
        mapFrame.src = data.mapUrl;

        // Update information card
        if (cityTitle) cityTitle.textContent = data.title;
        if (cityAddress) cityAddress.innerHTML = data.address;
        if (cityCoords) cityCoords.innerHTML = data.coords;
        if (cityPhone) {
          cityPhone.textContent = data.phone;
          cityPhone.href = `tel:${data.phone.split(" / ")[0].replace(/[^0-9+]/g, "")}`;
        }
        if (cityFbo) cityFbo.textContent = data.fbo;
        if (cityEta) cityEta.textContent = data.eta;
      });
    });
  };

  /* ==========================================================================
     5. DASHBOARD (NO LOGIN REQUIRED — FULLY ACCESSIBLE)
     ========================================================================== */
  const initDashboard = () => {
    const isDashboardPage = document.body.classList.contains("dashboard-page");
    if (!isDashboardPage) return;

    const bookingForm = document.querySelector("[data-booking-form]");
    const upcomingList = document.querySelector("[data-upcoming-list]");
    const counter = document.querySelector("[data-booking-count]");

    const updateCount = () => {
      if (!upcomingList || !counter) return;
      const count = upcomingList.querySelectorAll(".upcoming-ride").length;
      counter.textContent = `${count} ${count === 1 ? "journey" : "journeys"}`;
    };

    const createRideElement = (booking) => {
      const article = document.createElement("article");
      article.className = "upcoming-ride";

      let dateFormatted = "Today";
      let timeFormatted = "12:00 PM";
      if (booking.date && booking.time) {
        try {
          const d = new Date(`${booking.date}T${booking.time}`);
          dateFormatted = d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
          timeFormatted = d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
        } catch (_) {
          dateFormatted = booking.date;
          timeFormatted = booking.time;
        }
      }

      article.innerHTML = `
        <div class="ride-date">
          <strong>${dateFormatted}</strong>
          <span>${timeFormatted}</span>
        </div>
        <div class="upcoming-details">
          <strong>${booking.pickup}</strong>
          <span>to ${booking.dropoff}</span>
          <small>${booking.vehicle} · ${booking.id || "MR-9821"}</small>
        </div>
        <span class="status-pill">Confirmed</span>
      `;
      return article;
    };

    // Load saved bookings
    if (upcomingList) {
      try {
        const saved = JSON.parse(localStorage.getItem(BOOKINGS_KEY) || "[]");
        if (Array.isArray(saved) && saved.length > 0) {
          saved.forEach((b) => {
            if (b && b.pickup && b.dropoff) {
              upcomingList.prepend(createRideElement(b));
            }
          });
        }
      } catch (_) {}
      updateCount();
    }

    // Real-time telemetry and upcoming itineraries
    updateCount();

    // Refresh telemetry button
    const refreshBtn = document.querySelector("[data-refresh-status]");
    if (refreshBtn) {
      refreshBtn.addEventListener("click", () => {
        const updateText = document.querySelector("[data-ride-update]");
        const timeNow = new Date().toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
        if (updateText) {
          updateText.textContent = `GPS telemetry updated ${timeNow} · Active Route`;
        }
        refreshBtn.innerHTML = 'Status Refreshed <span aria-hidden="true">✓</span>';
        setTimeout(() => {
          refreshBtn.innerHTML = 'Refresh telemetry <span aria-hidden="true">↻</span>';
        }, 2000);
      });
    }

    // Driver Interactive Actions
    document.querySelectorAll("[data-driver-call]").forEach((btn) => {
      btn.addEventListener("click", () => {
        alert("Connecting to Chauffeur Marcus Vance (VIP Secure Line: +1 212-555-0198)...");
      });
    });

    document.querySelectorAll("[data-driver-msg]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const note = prompt("Send instructions to chauffeur Marcus Vance:", "I am waiting at the main entrance.");
        if (note) {
          alert(`Message dispatched to vehicle MR-2048: "${note}"`);
        }
      });
    });
  };

  /* ==========================================================================
     6. LOGIN PAGE
     ========================================================================== */
  /* ==========================================================================
     FORM VALIDATION ENGINE (NAME ALONE, PHONE DIGITS, STRICT EMAIL)
     ========================================================================== */
  const validateField = (input) => {
    const validateType = input.getAttribute("data-validate") || input.type || input.name;
    const value = (input.value || "").trim();
    let isValid = true;
    let errorMsg = "";

    // Locate field container
    const parent = input.closest(".form-field-group") || input.parentElement;
    const existingError = parent ? parent.querySelector(".field-error-msg") : null;
    if (existingError) {
      existingError.remove();
    }
    input.classList.remove("is-invalid", "is-valid");

    // Required check
    if (input.required && !value) {
      isValid = false;
      errorMsg = "This field is required.";
    } else if (value) {
      if (validateType === "name" || input.name === "name" || (input.id && input.id.includes("name"))) {
        // Name section: Name alone (Letters, spaces, hyphens, apostrophes; reject numbers and symbols)
        const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]{2,50}$/;
        if (!nameRegex.test(value)) {
          isValid = false;
          errorMsg = "Please enter letters only (no numbers or symbols).";
        }
      } else if (validateType === "phone" || input.type === "tel" || input.name === "phone" || (input.id && input.id.includes("phone"))) {
        // Contact / Phone section: digits and phone punctuation, at least 7 digits, no alphabetic characters
        const digitsOnly = value.replace(/\D/g, "");
        const phoneRegex = /^[\d\s+\-()]{7,25}$/;
        if (!phoneRegex.test(value) || digitsOnly.length < 7) {
          isValid = false;
          errorMsg = "Please enter a valid phone number (at least 7 digits, no letters).";
        }
      } else if (validateType === "email" || input.type === "email" || input.name === "email" || (input.id && input.id.includes("email"))) {
        // Mail section: standard strict email format
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(value)) {
          isValid = false;
          errorMsg = "Please enter a valid email address (e.g. name@domain.com).";
        }
      } else if (validateType === "required" || input.required) {
        if (value.length < 2) {
          isValid = false;
          errorMsg = "Please enter at least 2 characters.";
        }
      }
    }

    if (!isValid) {
      input.classList.add("is-invalid");
      const errEl = document.createElement("span");
      errEl.className = "field-error-msg";
      errEl.setAttribute("role", "alert");
      errEl.textContent = errorMsg;
      if (parent) {
        parent.appendChild(errEl);
      } else {
        input.insertAdjacentElement("afterend", errEl);
      }
      return false;
    } else if (value) {
      input.classList.add("is-valid");
      return true;
    }
    return true;
  };

  const bindFormValidation = (form) => {
    const inputs = form.querySelectorAll("input, select, textarea");
    inputs.forEach((input) => {
      // Validate on blur
      input.addEventListener("blur", () => {
        validateField(input);
      });

      // Clear or update validation on input
      input.addEventListener("input", () => {
        if (input.classList.contains("is-invalid")) {
          validateField(input);
        }
      });
    });
  };

  const validateAllFormFields = (form) => {
    const inputs = form.querySelectorAll("input, select, textarea");
    let allValid = true;
    let firstInvalid = null;

    inputs.forEach((input) => {
      const valid = validateField(input);
      if (!valid && !firstInvalid) {
        firstInvalid = input;
        allValid = false;
      }
    });

    if (firstInvalid) {
      firstInvalid.focus();
    }
    return allValid;
  };

  /* ==========================================================================
     TOAST NOTIFICATION UTILITY
     ========================================================================== */
  const showToast = (title, message, duration = 4500) => {
    let container = document.getElementById("toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "toast-container";
      container.className = "toast-container";
      document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = "toast-item";
    toast.setAttribute("role", "alert");
    toast.setAttribute("aria-live", "assertive");

    toast.innerHTML = `
      <div class="toast-icon" aria-hidden="true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </div>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        <div class="toast-body">${message}</div>
      </div>
      <button class="toast-close" type="button" aria-label="Close notification">&times;</button>
      <div class="toast-progress" style="animation-duration: ${duration}ms;"></div>
    `;

    const closeToast = () => {
      if (toast.classList.contains("is-hiding")) return;
      toast.classList.add("is-hiding");
      setTimeout(() => {
        if (toast.parentElement) {
          toast.remove();
        }
      }, 300);
    };

    const closeBtn = toast.querySelector(".toast-close");
    if (closeBtn) {
      closeBtn.addEventListener("click", closeToast);
    }

    const timer = setTimeout(closeToast, duration);
    toast.addEventListener("mouseenter", () => clearTimeout(timer));

    container.appendChild(toast);
  };

  // Expose globally if needed
  window.showToast = showToast;

  /* ==========================================================================
     6. LOGIN PAGE
     ========================================================================== */
  const initLogin = () => {
    const loginForm = document.querySelector("[data-login-form]");
    if (!loginForm) return;

    bindFormValidation(loginForm);

    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const isValid = validateAllFormFields(loginForm);
      const msg = loginForm.querySelector(".form-message");
      const submitBtn = loginForm.querySelector(".login-submit");

      if (!isValid) {
        if (msg) {
          msg.className = "form-message is-error";
          msg.textContent = "Please provide a valid corporate email and password.";
        }
        return;
      }

      const formData = new FormData(loginForm);
      const email = String(formData.get("email") || "").trim();
      let formattedName = "Executive Client";
      try {
        const namePart = email.split("@")[0].replace(/[._]/g, " ");
        formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
        sessionStorage.setItem(AUTH_KEY, JSON.stringify({ email, name: formattedName }));
      } catch (_) {
        // preserve session fallback
      }

      // NO REDIRECT: Show luxury toast message only!
      showToast(
        "Signed In Successfully",
        `Welcome back, ${formattedName}. You are authenticated in the executive portal.`
      );

      // Inline feedback on form
      if (msg) {
        msg.className = "form-message is-success";
        msg.textContent = `✓ Authenticated as ${formattedName}. Session active.`;
      }

      // Button feedback state
      if (submitBtn) {
        const originalHtml = submitBtn.innerHTML;
        submitBtn.innerHTML = `✓ Authenticated &middot; ${formattedName}`;
        submitBtn.classList.remove("button-dark");
        submitBtn.classList.add("button-gold");
        setTimeout(() => {
          submitBtn.innerHTML = originalHtml;
          submitBtn.classList.remove("button-gold");
          submitBtn.classList.add("button-dark");
        }, 4000);
      }
    });

    document.querySelectorAll(".cred-chip").forEach((chip) => {
      chip.style.cursor = "pointer";
      chip.addEventListener("click", () => {
        const emailInput = document.getElementById("email");
        const passInput = document.getElementById("password");
        if (emailInput && passInput) {
          emailInput.value = "alexander.wright@maisonride.com";
          passInput.value = "executive2026";
          validateField(emailInput);
          validateField(passInput);
        }
      });
    });
  };

  /* ==========================================================================
     7. CONTACT FORMS & DYNAMIC YEAR
     ========================================================================== */
  const initForms = () => {
    // Pre-fill fleet/service/hub/route from URL parameters if redirected
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const fleetParam = urlParams.get("fleet");
      const serviceParam = urlParams.get("service");
      const hubParam = urlParams.get("hub");
      const pickupParam = urlParams.get("pickup");
      const dropoffParam = urlParams.get("dropoff");
      const fareParam = urlParams.get("fare");

      const hubSelect = document.getElementById("contact-hub");
      if (hubSelect && hubParam) {
        for (let i = 0; i < hubSelect.options.length; i++) {
          if (hubSelect.options[i].value.toLowerCase().includes(hubParam.toLowerCase()) ||
              hubSelect.options[i].text.toLowerCase().includes(hubParam.toLowerCase())) {
            hubSelect.selectedIndex = i;
            break;
          }
        }
      }

      const msgInput = document.getElementById("contact-message");
      if (msgInput && !msgInput.value) {
        if (pickupParam && dropoffParam) {
          const fleetMap = {
            "maybach": "Mercedes-Maybach S680",
            "escalade": "Cadillac Escalade Platinum ESV",
            "sprinter": "Mercedes Sprinter VIP Jet Edition",
            "s-class": "Mercedes-Benz S-Class S580",
            "rolls-royce": "Rolls-Royce Ghost VIP"
          };
          const vehicleTitle = fleetParam ? (fleetMap[fleetParam.toLowerCase()] || fleetParam) : "Executive Chauffeur";
          msgInput.value = `Priority reservation request for ${vehicleTitle}.\nRoute: ${pickupParam} → ${dropoffParam}.\nEstimated Tariff: ${fareParam || "Guaranteed Fixed Quote"}.\nPlease confirm chauffeur assignment and arrival radar.`;
        } else if (fleetParam) {
          const fleetMap = {
            "maybach": "Mercedes-Maybach S680 First Class",
            "escalade": "Cadillac Escalade Platinum ESV",
            "sprinter": "Mercedes Sprinter VIP Jet Edition",
            "s-class": "Mercedes-Benz S-Class S580",
            "rolls-royce": "Rolls-Royce Ghost VIP"
          };
          const fleetName = fleetMap[fleetParam.toLowerCase()] || fleetParam;
          msgInput.value = `Priority reservation request for ${fleetName}. Please confirm immediate vehicle availability and chauffeur assignment.`;
        } else if (serviceParam) {
          const serviceMap = {
            "airport": "Commercial & Private FBO Airport Transfer",
            "city": "Dedicated Executive City Chauffeur (Hourly / As-Directed)",
            "events": "Gala, Premiere & Milestone Event Convoy",
            "roadshows": "Financial & Corporate Roadshow Chauffeur Delegation",
            "intercity": "Intercity Sanctuary & Long-Distance Private Transit"
          };
          const serviceName = serviceMap[serviceParam.toLowerCase()] || serviceParam;
          msgInput.value = `Reservation request for ${serviceName}. Please confirm dispatch schedule and chauffeur details.`;
        } else if (hubParam) {
          msgInput.value = `Dispatch request from ${hubParam} Hub. Please confirm immediate vehicle standby availability.`;
        }
      }
    } catch (_) {}

    document.querySelectorAll("[data-contact-form]").forEach((form) => {
      bindFormValidation(form);

      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const isValid = validateAllFormFields(form);
        const msg = form.querySelector(".form-message");

        if (!isValid) {
          if (msg) {
            msg.className = "form-message is-error";
            msg.textContent = "Please correct the highlighted fields with valid information.";
          }
          return;
        }

        const formData = new FormData(form);
        const clientName = formData.get("name") || "Valued Client";
        if (msg) {
          msg.className = "form-message is-success";
          msg.innerHTML = `✓ Thank you, <strong>${clientName}</strong>. Your priority dispatch reservation has been transmitted to our 24/7 command center. An executive dispatcher will confirm your chauffeur within 15 minutes.`;
        }

        // Reset form and remove valid states
        form.reset();
        form.querySelectorAll(".is-valid, .is-invalid").forEach((el) => {
          el.classList.remove("is-valid", "is-invalid");
        });
      });
    });

    document.querySelectorAll(".newsletter-form").forEach((form) => {
      bindFormValidation(form);

      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const isValid = validateAllFormFields(form);
        if (!isValid) return;

        const input = form.querySelector("input");
        if (input && input.value) {
          const emailVal = input.value;
          if (typeof showToast === "function") {
            showToast("Dispatch Subscription Active", `Quarterly Maison Dispatch briefings will be sent to ${emailVal}.`);
          } else if (typeof window.showToast === "function") {
            window.showToast("Dispatch Subscription Active", `Quarterly Maison Dispatch briefings will be sent to ${emailVal}.`);
          } else {
            alert(`Thank you. Quarterly Maison Dispatch briefings will be sent to ${emailVal}.`);
          }
          input.value = "";
          input.classList.remove("is-valid", "is-invalid");
        }
      });
    });

    document.querySelectorAll("[data-year]").forEach((el) => {
      el.textContent = String(new Date().getFullYear());
    });
  };

  /* ==========================================================================
     8. BLOG & EDITORIAL JOURNAL (Filtering, Search & Article Reader Modal)
     ========================================================================== */
  const initBlog = () => {
    const searchInput = document.getElementById("blog-search");
    const filterTabs = document.querySelectorAll(".filter-tab");
    const blogCards = document.querySelectorAll(".blog-card");
    const featuredCard = document.querySelector(".featured-article-card");
    const emptyState = document.getElementById("blog-empty-state");

    let currentFilter = "all";
    let searchQuery = "";

    const applyBlogFilters = () => {
      let visibleCount = 0;

      blogCards.forEach((card) => {
        const cat = card.getAttribute("data-category") || "";
        const title = (card.querySelector(".blog-card-title")?.textContent || "").toLowerCase();
        const excerpt = (card.querySelector(".blog-card-excerpt")?.textContent || "").toLowerCase();
        const tag = (card.querySelector(".blog-tag")?.textContent || "").toLowerCase();

        const matchesCat = currentFilter === "all" || cat.toLowerCase().includes(currentFilter.toLowerCase());
        const matchesSearch = !searchQuery || title.includes(searchQuery) || excerpt.includes(searchQuery) || tag.includes(searchQuery);

        if (matchesCat && matchesSearch) {
          card.style.display = "flex";
          visibleCount++;
        } else {
          card.style.display = "none";
        }
      });

      if (featuredCard) {
        const featWrap = featuredCard.closest(".featured-article-wrap");
        const featCat = featuredCard.getAttribute("data-category") || "";
        const featTitle = (featuredCard.querySelector("h2")?.textContent || "").toLowerCase();
        const featExcerpt = (featuredCard.querySelector("p")?.textContent || "").toLowerCase();
        const featMatchesCat = currentFilter === "all" || featCat.toLowerCase().includes(currentFilter.toLowerCase());
        const featMatchesSearch = !searchQuery || featTitle.includes(searchQuery) || featExcerpt.includes(searchQuery);

        if (featWrap) {
          if (featMatchesCat && featMatchesSearch) {
            featWrap.style.display = "block";
            visibleCount++;
          } else {
            featWrap.style.display = "none";
          }
        }
      }

      if (emptyState) {
        emptyState.style.display = visibleCount === 0 ? "block" : "none";
      }
    };

    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        searchQuery = e.target.value.trim().toLowerCase();
        applyBlogFilters();
      });
    }

    filterTabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        filterTabs.forEach((t) => t.classList.remove("is-active"));
        tab.classList.add("is-active");
        currentFilter = tab.getAttribute("data-filter") || "all";
        applyBlogFilters();
      });
    });

    // Article Reading Modal
    const modal = document.getElementById("article-modal");
    if (!modal) return;

    const modalClose = modal.querySelector(".article-modal-close");
    const modalCategory = document.getElementById("modal-category");
    const modalTitle = document.getElementById("modal-title");
    const modalMeta = document.getElementById("modal-meta");
    const modalImage = document.getElementById("modal-image");
    const modalBody = document.getElementById("modal-body");

    const openArticleModal = (articleData) => {
      if (modalCategory) modalCategory.textContent = articleData.category;
      if (modalTitle) modalTitle.textContent = articleData.title;
      if (modalMeta) modalMeta.textContent = articleData.meta;
      if (modalImage) {
        modalImage.src = articleData.image;
        modalImage.alt = articleData.title;
      }
      if (modalBody) modalBody.innerHTML = articleData.content;

      modal.classList.add("is-open");
      document.body.style.overflow = "hidden";
    };

    const closeArticleModal = () => {
      modal.classList.remove("is-open");
      document.body.style.overflow = "";
    };

    if (modalClose) {
      modalClose.addEventListener("click", closeArticleModal);
    }

    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        closeArticleModal();
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal.classList.contains("is-open")) {
        closeArticleModal();
      }
    });

    document.querySelectorAll("[data-article-btn]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const articleCard = btn.closest("[data-article-data]");
        if (!articleCard) return;

        try {
          const raw = articleCard.getAttribute("data-article-data");
          const data = JSON.parse(raw);
          openArticleModal(data);
        } catch (err) {
          console.error("Error opening article modal:", err);
        }
      });
    });
  };

  /* ==========================================================================
     8. JOURNEY FARE & ROUTE ESTIMATOR (INDEX.HTML)
     ========================================================================== */
  const initFareEstimator = () => {
    const citySelect = document.getElementById("est-city");
    const pickupSelect = document.getElementById("est-pickup");
    const dropoffSelect = document.getElementById("est-dropoff");
    const vehicleSelect = document.getElementById("est-vehicle");
    const priceDisplay = document.getElementById("est-price-display");
    const etaDisplay = document.getElementById("est-eta-display");
    const reserveBtn = document.getElementById("est-reserve-btn");

    if (!citySelect || !pickupSelect || !dropoffSelect || !vehicleSelect || !priceDisplay) return;

    const cityRoutes = {
      india: {
        currency: "₹ ",
        pickups: [
          { val: "del", label: "Indira Gandhi International VIP FBO (DEL)", basePrice: 18500, eta: "35–45 mins" },
          { val: "bom", label: "Mumbai Chhatrapati Shivaji VIP Terminal (BOM)", basePrice: 22000, eta: "40–55 mins" },
          { val: "blr", label: "Kempegowda International VIP Lounge (BLR)", basePrice: 24500, eta: "45–60 mins" },
          { val: "delhi_hotel", label: "The Leela Palace / Diplomatic Enclave", basePrice: 14500, eta: "20–30 mins" }
        ],
        dropoffs: [
          { val: "connaught", label: "Connaught Place / Central Diplomatic Enclave", mult: 1.0 },
          { val: "gurugram", label: "Cyber City & Golf Course Road (Gurugram)", mult: 1.25 },
          { val: "bkc", label: "Bandra Kurla Complex (BKC / South Mumbai)", mult: 1.35 },
          { val: "agra", label: "Agra Taj VIP Expressway Corridor", mult: 3.2 }
        ]
      },
      nyc: {
        currency: "₹ ",
        pickups: [
          { val: "jfk", label: "JFK International (All Terminals)", basePrice: 24500, eta: "45–55 mins" },
          { val: "teb", label: "Teterboro Private Aviation (TEB FBO)", basePrice: 29000, eta: "35–45 mins" },
          { val: "lga", label: "LaGuardia Airport (LGA)", basePrice: 18500, eta: "30–40 mins" },
          { val: "manhattan", label: "Midtown Manhattan Hotel / Residence", basePrice: 16500, eta: "15–25 mins" }
        ],
        dropoffs: [
          { val: "midtown", label: "Midtown Manhattan (5th Ave / Central Park)", mult: 1.0 },
          { val: "wallst", label: "Wall Street / Financial District", mult: 1.1 },
          { val: "greenwich", label: "Greenwich, Connecticut", mult: 1.6 },
          { val: "hamptons", label: "The Hamptons (East Hampton / Southampton)", mult: 2.8 }
        ]
      },
      london: {
        currency: "£",
        pickups: [
          { val: "lhr", label: "London Heathrow VIP Windsor Suite (LHR)", basePrice: 220, eta: "40–50 mins" },
          { val: "fab", label: "Farnborough Private Aviation (EGLF)", basePrice: 310, eta: "55–70 mins" },
          { val: "lgw", label: "Gatwick Airport (LGW)", basePrice: 260, eta: "60–75 mins" },
          { val: "mayfair", label: "Mayfair / Knightsbridge Residence", basePrice: 180, eta: "20–30 mins" }
        ],
        dropoffs: [
          { val: "mayfair", label: "Mayfair / Berkeley Square", mult: 1.0 },
          { val: "city", label: "City of London (Bank / Canary Wharf)", mult: 1.15 },
          { val: "oxford", label: "Oxfordshire & The Cotswolds", mult: 2.2 },
          { val: "ascot", label: "Ascot / Windsor Great Park", mult: 1.5 }
        ]
      },
      paris: {
        currency: "€",
        pickups: [
          { val: "cdg", label: "Paris Charles de Gaulle Salon 200 (CDG)", basePrice: 240, eta: "45–60 mins" },
          { val: "lbg", label: "Paris Le Bourget Private Aviation (LBG)", basePrice: 270, eta: "35–45 mins" },
          { val: "ory", label: "Paris Orly Airport (ORY)", basePrice: 210, eta: "35–50 mins" },
          { val: "vendome", label: "Place Vendôme / 8th Arrondissement", basePrice: 175, eta: "15–25 mins" }
        ],
        dropoffs: [
          { val: "vendome", label: "Place Vendôme / Champs-Élysées", mult: 1.0 },
          { val: "ladefense", label: "La Défense Business District", mult: 1.2 },
          { val: "versailles", label: "Palace of Versailles", mult: 1.6 },
          { val: "champagne", label: "Épernay / Champagne Region", mult: 2.9 }
        ]
      },
      dubai: {
        currency: "AED ",
        pickups: [
          { val: "dxb", label: "Dubai International Executive VIP (DXB)", basePrice: 650, eta: "25–35 mins" },
          { val: "dwc", label: "Al Maktoum International VIP (DWC)", basePrice: 850, eta: "40–55 mins" },
          { val: "difc", label: "DIFC Gate Precinct / Downtown", basePrice: 450, eta: "15–20 mins" },
          { val: "palm", label: "Palm Jumeirah Luxury Resort", basePrice: 550, eta: "30–40 mins" }
        ],
        dropoffs: [
          { val: "difc", label: "DIFC / Downtown Dubai (Burj Khalifa)", mult: 1.0 },
          { val: "palm", label: "Palm Jumeirah & Atlantis The Royal", mult: 1.2 },
          { val: "abudhabi", label: "Abu Dhabi (Emirates Palace / Saadiyat)", mult: 2.6 },
          { val: "jebelali", label: "Jebel Ali Port & Free Zone", mult: 1.4 }
        ]
      }
    };

    const vehicleMultipliers = {
      "s-class": { mult: 1.0, name: "Mercedes-Benz S-Class" },
      "maybach": { mult: 1.55, name: "Mercedes-Maybach S680" },
      "escalade": { mult: 1.25, name: "Cadillac Escalade ESV" },
      "sprinter": { mult: 1.70, name: "Mercedes Sprinter Jet" }
    };

    const calculateFare = () => {
      const cityKey = citySelect.value || "india";
      const config = cityRoutes[cityKey] || cityRoutes.india;
      const pickupVal = pickupSelect.value;
      const dropoffVal = dropoffSelect.value;
      const vehicleKey = vehicleSelect.value || "s-class";

      const pickupObj = config.pickups.find((p) => p.val === pickupVal) || config.pickups[0];
      const dropoffObj = config.dropoffs.find((d) => d.val === dropoffVal) || config.dropoffs[0];
      const vehicleObj = vehicleMultipliers[vehicleKey] || vehicleMultipliers["s-class"];

      const calculated = Math.round(pickupObj.basePrice * dropoffObj.mult * vehicleObj.mult);
      const formattedFare = `${config.currency}${calculated.toLocaleString("en-IN")}`;

      priceDisplay.textContent = formattedFare;
      if (etaDisplay) {
        etaDisplay.textContent = `Estimated Transit: ${pickupObj.eta}`;
      }

      if (reserveBtn) {
        const queryParams = new URLSearchParams({
          fleet: vehicleKey,
          pickup: pickupObj.label,
          dropoff: dropoffObj.label,
          fare: formattedFare
        });
        reserveBtn.href = `contact.html?${queryParams.toString()}#dispatch-form`;
      }
    };

    const updateLocations = () => {
      const cityKey = citySelect.value || "india";
      const config = cityRoutes[cityKey] || cityRoutes.india;

      pickupSelect.innerHTML = config.pickups.map((p) => `<option value="${p.val}">${p.label}</option>`).join("");
      dropoffSelect.innerHTML = config.dropoffs.map((d) => `<option value="${d.val}">${d.label}</option>`).join("");
      calculateFare();
    };

    citySelect.addEventListener("change", updateLocations);
    pickupSelect.addEventListener("change", calculateFare);
    dropoffSelect.addEventListener("change", calculateFare);
    vehicleSelect.addEventListener("change", calculateFare);

    // Initial populate & calculation
    updateLocations();
  };

  /* ==========================================================================
     9. FLEET CATEGORY FILTER (FLEET.HTML)
     ========================================================================== */
  const initFleetFilters = () => {
    const filterBtns = document.querySelectorAll(".fleet-filter-btn");
    const fleetCards = document.querySelectorAll(".fleet-card");

    if (!filterBtns.length || !fleetCards.length) return;

    filterBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        filterBtns.forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");

        const targetFilter = btn.getAttribute("data-fleet-filter") || "all";

        fleetCards.forEach((card) => {
          const category = card.getAttribute("data-category");
          if (targetFilter === "all" || category === targetFilter) {
            card.style.display = "";
            card.style.opacity = "1";
          } else {
            card.style.display = "none";
          }
        });
      });
    });
  };

  /* ==========================================================================
     10. ACCORDIONS (CORPORATE.HTML & CONTACT.HTML)
     ========================================================================== */
  const initFaqAccordion = () => {
    document.querySelectorAll(".faq-accordion").forEach((accordion) => {
      accordion.querySelectorAll(".faq-question").forEach((btn) => {
        btn.addEventListener("click", () => {
          const item = btn.closest(".faq-item");
          if (!item) return;
          const wasOpen = item.classList.contains("is-open");

          accordion.querySelectorAll(".faq-item").forEach((other) => {
            other.classList.remove("is-open");
          });

          if (!wasOpen) {
            item.classList.add("is-open");
          }
        });
      });
    });
  };

  /* ==========================================================================
     11. CORPORATE TIER CALCULATOR (CORPORATE.HTML)
     ========================================================================== */
  const initTierCalculator = () => {
    const tierBtns = document.querySelectorAll(".tier-btn");
    const discountEl = document.getElementById("tier-discount");
    const slaEl = document.getElementById("tier-sla");
    const managerEl = document.getElementById("tier-manager");
    const graceEl = document.getElementById("tier-grace");

    if (!tierBtns.length || !discountEl) return;

    const tierData = {
      silver: { discount: "10% Off", sla: "15 Mins", manager: "Senior Desk", grace: "60 Mins" },
      gold: { discount: "18% Off", sla: "10 Mins", manager: "Dedicated VP", grace: "90 Mins" },
      platinum: { discount: "25% Off", sla: "5 Mins", manager: "Partner Lead", grace: "120 Mins" },
      enterprise: { discount: "32% Off", sla: "Guaranteed Standby", manager: "Executive Board", grace: "Unlimited" }
    };

    tierBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        tierBtns.forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");

        const tierKey = btn.getAttribute("data-tier") || "silver";
        const data = tierData[tierKey] || tierData.silver;

        if (discountEl) discountEl.textContent = data.discount;
        if (slaEl) slaEl.textContent = data.sla;
        if (managerEl) managerEl.textContent = data.manager;
        if (graceEl) graceEl.textContent = data.grace;
      });
    });
  };

  /* ==========================================================================
     INITIALIZATION
     ========================================================================== */
  const init = () => {
    initTheme();
    initRTL();
    initNavigation();
    initInteractiveMap();
    initDashboard();
    initLogin();
    initForms();
    initBlog();
    initFareEstimator();
    initFleetFilters();
    initFaqAccordion();
    initTierCalculator();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
