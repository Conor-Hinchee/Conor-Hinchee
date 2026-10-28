import { DEBUG_LOG } from "../constants";
import {
  GRANTED,
  DENIED,
  getStoredConsent,
  clearLegacyConsent,
  updateConsent,
} from "../consent";

const showConsentBannerBar = () => {
  const banner = document.getElementById("consentBanner");
  if (!banner) return;
  banner.style.transitionDuration = "1s";
  banner.style.opacity = "1";
  banner.addEventListener(
    "transitionend",
    () => {
      const event = new Event("consentBannerBar");
      banner.dispatchEvent(event);
    },
    { once: true }
  );
};

const showConsentBannerFull = () => {
  const banner = document.getElementById("consentBanner");
  const consentTitle = document.getElementById("consentTitle");
  if (!banner) return;

  banner.style.transition =
    "height 0.5s ease-in-out, background-color 0.3s, color 0.3s, border-color 0.3s";
  if (!consentTitle) return;
  consentTitle.style.transitionDuration = "0.2s";
  consentTitle.style.opacity = "0";
  banner.style.height = "250px";

  bannerIsExpanded = true;
  setBannerToPageTheme();

  banner.addEventListener(
    "transitionend",
    () => {
      const event = new Event("consentBannerFull");
      banner.dispatchEvent(event);
    },
    { once: true }
  );
};

const showConsentContent = () => {
  const consentTitle = document.getElementById("consentTitle");
  if (!consentTitle) return;
  consentTitle.style.display = "none";
  const consentContent = document.getElementById("consentContent");
  if (!consentContent) return;

  consentContent.classList.remove("hidden");
  consentContent.style.transition = "opacity 0.4s ease-in";
  consentContent.style.opacity = "1";
};

let lastScrollY = window.scrollY;
let bannerInLightMode = false;
let hasPassedThreshold = false;
let pageIsDarkMode = document.documentElement.classList.contains("dark");
let bannerIsExpanded = false;

const setBannerToDarkMode = () => {
  const banner = document.getElementById("consentBanner");
  if (!banner) return;
  banner.style.backgroundColor = "black";
  banner.style.color = "white";
  banner.style.borderColor = "white";
  bannerInLightMode = false;
};

const setBannerToLightMode = () => {
  const banner = document.getElementById("consentBanner");
  if (!banner) return;
  banner.style.backgroundColor = "white";
  banner.style.color = "black";
  banner.style.borderColor = "black";
  bannerInLightMode = true;
};

const setBannerToPageTheme = () => {
  pageIsDarkMode = document.documentElement.classList.contains("dark");
  if (pageIsDarkMode) {
    setBannerToDarkMode();
  } else {
    setBannerToLightMode();
  }
};

const setBannerToInverseTheme = () => {
  pageIsDarkMode = document.documentElement.classList.contains("dark");
  if (pageIsDarkMode) {
    setBannerToLightMode();
  } else {
    setBannerToDarkMode();
  }
};

const updateBannerColorOnScroll = () => {
  if (bannerIsExpanded) return;

  const currentScrollY = window.scrollY;
  const isScrollingDown = currentScrollY > lastScrollY;
  lastScrollY = currentScrollY;
  pageIsDarkMode = document.documentElement.classList.contains("dark");

  if (isScrollingDown) {
    if (currentScrollY > 400 || hasPassedThreshold) {
      setBannerToInverseTheme();
      hasPassedThreshold = true;
    }
  } else {
    const bannerIsInverse = pageIsDarkMode
      ? bannerInLightMode
      : !bannerInLightMode;
    if (bannerIsInverse) {
      setBannerToPageTheme();
    }
  }
};

const scrollListener = () => {
  if (window.scrollY > 200) {
    showConsentBannerBar();
    window.removeEventListener("scroll", scrollListener);
    if (window.scrollY > 400) {
      setBannerToInverseTheme();
      hasPassedThreshold = true;
    } else {
      setBannerToPageTheme();
    }
    window.addEventListener("scroll", updateBannerColorOnScroll);
  }
};

const eventConductorSteve = (event: Event) => {
  DEBUG_LOG({
    logLevel: "info",
    message: `EVENT CONDUCTOR STEVE 🗣️ : Consent Banner State = ${event.type}`,
  });
  if (event.type === "consentBannerFull") showConsentContent();
};

// ========== LISTENERS & LOGIC ========== //

const recordChoice = (analyticsStorage: typeof GRANTED | typeof DENIED) => {
  updateConsent(analyticsStorage);
  DEBUG_LOG({
    logLevel: "info",
    message: `Consent updated: analytics_storage=${analyticsStorage}`,
  });
  const banner = document.getElementById("consentBanner");
  if (!banner) return;
  banner.style.display = "none";
};

const initConsentListeners = () => {
  const banner = document.querySelector("#consentBanner");
  const consentButton = document.getElementById("cookieConsent");
  const declineButton = document.getElementById("cookieDecline");
  if (!banner || !consentButton || !declineButton) return;

  consentButton.addEventListener("click", (event) => {
    event.stopPropagation();
    recordChoice(GRANTED);
  });

  declineButton.addEventListener("click", (event) => {
    event.stopPropagation();
    recordChoice(DENIED);
  });

  banner.addEventListener("click", showConsentBannerFull);
  banner.addEventListener("consentBannerBar", eventConductorSteve);
  banner.addEventListener("consentBannerFull", eventConductorSteve);
};

// Consent defaults (and any stored choice) are already applied by blocking.js
// before GTM loads. The banner only needs to ask visitors who haven't chosen.
const initConsentBanner = () => {
  if (!document.getElementById("consentBanner")) return;

  clearLegacyConsent();

  if (getStoredConsent()) {
    DEBUG_LOG({
      logLevel: "info",
      message: `Stored consent found: analytics_storage=${getStoredConsent()}`,
    });
    return;
  }

  initConsentListeners();

  if (window.scrollY > 200) {
    showConsentBannerBar();
    if (window.scrollY > 400) {
      setBannerToInverseTheme();
      hasPassedThreshold = true;
    } else {
      setBannerToPageTheme();
    }
    window.addEventListener("scroll", updateBannerColorOnScroll);
    return;
  }

  window.addEventListener("scroll", scrollListener);
};

export default initConsentBanner;
