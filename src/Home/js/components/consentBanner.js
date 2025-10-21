// import { Mobile_Width } from "../constants";
import { DEBUG_LOG } from "../constants";

const COOKIE_NAME = "cookie-consent";
const COOKIE_EXPIRATION_DAYS = 180; 

const CONSENT_DECLINED = {
  ad_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied",
  analytics_storage: "denied",
};

const CONSENT_ACCEPTED = {
  ad_storage: "granted",
  ad_user_data: "granted",
  ad_personalization: "granted",
  analytics_storage: "granted",
};

const setCookie = (name, value, days) => {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(
    JSON.stringify(value)
  )}; expires=${expires}; path=/; SameSite=Lax`;
};

const getCookie = (name) => {
  const cookies = document.cookie.split("; ");
  for (const cookie of cookies) {
    const [key, val] = cookie.split("=");
    if (key === name) return JSON.parse(decodeURIComponent(val));
  }
  return null;
};

const notifyGTM = (consent) => {
  window.dataLayer = window.dataLayer || [];
  
  // Use GTM's consent mode API
  window.dataLayer.push({
    event: "consent_update",
    ...consent,
  });
  
  // Also trigger the gtag consent update if available
  if (typeof window.gtag === "function") {
    window.gtag("consent", "update", consent);
  }
  
  DEBUG_LOG({
    logLevel: "info",
    message: `Pushed consent update to GTM: ${JSON.stringify(consent)}`,
  });
};

const showConsentBannerBar = () => {
  const banner = document.getElementById("consentBanner");
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

  banner.style.transition =
    "height 0.5s ease-in-out, background-color 0.3s, color 0.3s, border-color 0.3s";
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
  consentTitle.style.display = "none";
  const consentContent = document.getElementById("consentContent");

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
  banner.style.backgroundColor = "black";
  banner.style.color = "white";
  banner.style.borderColor = "white";
  bannerInLightMode = false;
};

const setBannerToLightMode = () => {
  const banner = document.getElementById("consentBanner");
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

const eventConductorSteve = (event) => {
  DEBUG_LOG({
    logLevel: "info",
    message: `EVENT CONDUCTOR STEVE 🗣️ : Consent Banner State = ${event.type}`,
  });
  if (event.type === "consentBannerFull") showConsentContent();
};

// ========== LISTENERS & LOGIC ========== //

const initConsentListeners = () => {
  const banner = document.querySelector("#consentBanner");

  document.getElementById("cookieConsent").addEventListener("click", () => {
    setCookie(COOKIE_NAME, CONSENT_ACCEPTED, COOKIE_EXPIRATION_DAYS);
    localStorage.setItem("trackConsent", JSON.stringify(CONSENT_ACCEPTED));
    notifyGTM(CONSENT_ACCEPTED);
    banner.style.display = "none";
  });

  document.getElementById("cookieDecline").addEventListener("click", () => {
    setCookie(COOKIE_NAME, CONSENT_DECLINED, COOKIE_EXPIRATION_DAYS);
    localStorage.setItem("trackConsent", JSON.stringify(CONSENT_DECLINED));
    notifyGTM(CONSENT_DECLINED);
    banner.style.display = "none";
  });

  banner.addEventListener("click", showConsentBannerFull);
  banner.addEventListener("consentBannerBar", eventConductorSteve);
  banner.addEventListener("consentBannerFull", eventConductorSteve);
};

const initConsentBanner = () => {
  window.dataLayer = window.dataLayer || [];

  // 🧠 check if GTM template cookie exists
  const cookieConsent = getCookie(COOKIE_NAME);
  if (cookieConsent) {
    DEBUG_LOG({
      logLevel: "info",
      message: `Loaded consent from cookie: ${JSON.stringify(cookieConsent)}`,
    });
    localStorage.setItem("trackConsent", JSON.stringify(cookieConsent));
    notifyGTM(cookieConsent);
    return;
  }

  // fallback to localStorage or show banner
  const localStorageConsent = localStorage.getItem("trackConsent");
  if (localStorageConsent !== null) {
    const consent = JSON.parse(localStorageConsent);
    setCookie(COOKIE_NAME, consent, COOKIE_EXPIRATION_DAYS);
    notifyGTM(consent);
    return;
  }

  // default state
  setCookie(COOKIE_NAME, CONSENT_DECLINED, COOKIE_EXPIRATION_DAYS);
  notifyGTM(CONSENT_DECLINED);
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
