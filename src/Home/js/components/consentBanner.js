// import { Mobile_Width } from "../constants";
import { DEBUG_LOG } from "../constants";

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

// const showConsentBannerPeak = () => {
//   const banner = document.getElementById("consentBanner");
//   banner.style.opacity = "1";
//   banner.addEventListener("transitionend", () => {
//     const event = new Event("consentBannerPeak");
//     banner.dispatchEvent(event);
//   }, { once: true });
// };

const showConsentBannerBar = () => {
  const banner = document.getElementById("consentBanner");
  banner.style.transitionDuration = "1s";
  banner.style.opacity = "1";
  banner.addEventListener("transitionend", () => {
    const event = new Event("consentBannerBar");
    banner.dispatchEvent(event);
  }, { once: true });
};

const showConsentBannerFull = () => {

  const banner = document.getElementById("consentBanner");
  const consentTitle = document.getElementById("consentTitle");

  // Add smooth easing to banner expansion
  banner.style.transition = "height 0.5s ease-in-out, background-color 0.3s, color 0.3s, border-color 0.3s";
  
  // Fade out title quickly
  consentTitle.style.transitionDuration = "0.2s";
  consentTitle.style.opacity = "0";

  // Expand banner height with easing
  banner.style.height = "250px";
  
  // Mark banner as expanded and lock it to page theme
  bannerIsExpanded = true;
  setBannerToPageTheme();

  banner.addEventListener("transitionend", () => {
    const event = new Event("consentBannerFull");
    banner.dispatchEvent(event);
  }, { once: true });
};

const showConsentContent = () => {
  const consentTitle = document.getElementById("consentTitle");
  consentTitle.style.display = "none";
  const consentContent = document.getElementById("consentContent");

  consentContent.classList.remove("hidden");
  
  // Add smooth transition and fade in content
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
  // Don't change colors if banner is expanded
  if (bannerIsExpanded) {
    return;
  }
  
  const currentScrollY = window.scrollY;
  const isScrollingDown = currentScrollY > lastScrollY;
  
  lastScrollY = currentScrollY;
  
  // Update page theme status
  pageIsDarkMode = document.documentElement.classList.contains("dark");
  
  // If scrolling down
  if (isScrollingDown) {
    // Check if we should invert (first time past 400px OR already passed threshold)
    if (currentScrollY > 400 || hasPassedThreshold) {
      setBannerToInverseTheme();
      hasPassedThreshold = true;
    }
  }
  // If scrolling up, return to page theme
  else if (!isScrollingDown) {
    // Check if banner is in inverse mode
    const bannerIsInverse = pageIsDarkMode ? bannerInLightMode : !bannerInLightMode;
    if (bannerIsInverse) {
      setBannerToPageTheme();
    }
  }
};

const scrollListener = () => {
  if (window.scrollY > 200) {
    showConsentBannerBar();
    window.removeEventListener("scroll", scrollListener);
    
    // Set initial banner state based on current scroll position
    if (window.scrollY > 400) {
      // Spawning in past the threshold, start in inverse theme
      setBannerToInverseTheme();
      hasPassedThreshold = true;
    } else {
      // Spawning in before threshold, start with page theme
      setBannerToPageTheme();
    }
    
    // Add the color transition scroll listener after banner appears
    window.addEventListener("scroll", updateBannerColorOnScroll);
  }
};

const eventConductorSteve = (event) => {
  DEBUG_LOG({ logLevel: "info", message: `EVENT CONDUCTOR STEVE 🗣️ :  Consent Banner State is now =  ${event.type}` });

  if (event.type === "consentBannerFull") {
    showConsentContent();
  }
};

const track = (args) => {
  // ensure that the data layer is defined
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(args);
};

const initConsentListeners = () => {
  const banner = document.querySelector("#consentBanner");

  document.getElementById("cookieConsent").addEventListener("click", () => {
    track("consent", "update", { ...CONSENT_ACCEPTED });
    localStorage.setItem("trackConsent", JSON.stringify(CONSENT_ACCEPTED));
    banner.style.display = "none";
  });

  document.getElementById("cookieDecline").addEventListener("click", () => {
    track("consent", "update", { ...CONSENT_DECLINED });
    localStorage.setItem("trackConsent", JSON.stringify(CONSENT_DECLINED));
    banner.style.display = "none";
  });

  banner.addEventListener("click", () => {
    showConsentBannerFull();
  });
  banner.addEventListener("consentBannerBar", eventConductorSteve);
  banner.addEventListener("consentBannerFull", eventConductorSteve);

};

const initConsentBanner = () => {
  // Define dataLayer and the track function.
  window.dataLayer = window.dataLayer || [];

  // User has been here before
  const localStorageConsent = localStorage.getItem("trackConsent");
  if (localStorageConsent !== null) {
    const consent = JSON.parse(localStorageConsent);
    DEBUG_LOG({ logLevel: "info", message: `Loaded consent from localStorage: ${JSON.stringify(consent)}` });
    track("consent", "update", { ...consent });
    return;
  }

  // init with declined consent and show the banner
  track("consent", "default", { ...CONSENT_DECLINED });

  initConsentListeners();

  // if scroll y is already greater than 200, show the banner
  if (window.scrollY > 200) {
    showConsentBannerBar();
    
    // Set initial banner state based on current scroll position
    if (window.scrollY > 400) {
      // Already scrolled past threshold, start in inverse theme
      setBannerToInverseTheme();
      hasPassedThreshold = true;
    } else {
      // Before threshold, start with page theme
      setBannerToPageTheme();
    }
    
    // Add the color transition scroll listener
    window.addEventListener("scroll", updateBannerColorOnScroll);
    return;
  }

  window.addEventListener("scroll", scrollListener);

};

export default initConsentBanner;
