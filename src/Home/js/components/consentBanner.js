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

  consentTitle.style.transitionDuration = "1.5s";
  consentTitle.style.opacity = "0";

  banner.style.transitionDuration = "1.5s";
  banner.style.height = "250px";

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
  consentContent.style.opacity = "1";
};

const scrollListener = () => {
  if (window.scrollY > 200) {
    showConsentBannerBar();
    window.removeEventListener("scroll", scrollListener);
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

  // if scroll y is already greater than 200, show the full banner
  if (window.scrollY > 200) {
    showConsentBannerBar();
    return;
  }

  window.addEventListener("scroll", scrollListener);

};

export default initConsentBanner;
