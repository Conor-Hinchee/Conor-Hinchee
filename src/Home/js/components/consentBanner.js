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
//   banner.style.transitionDuration = "1.3s";
//   banner.style.opacity = "1";
//   banner.addEventListener("transitionend", () => {
//     const event = new Event("consentBannerPeak");
//     banner.dispatchEvent(event);
//   }, { once: true });
// };

const showConsentBannerBar = () => {
  const banner = document.getElementById("consentBanner");
  banner.style.width = "100%";
  banner.style.opacity = "1";
  banner.style.transitionDuration = "1.3s";
  banner.addEventListener("transitionend", () => {
    const event = new Event("consentBannerBar");
    banner.dispatchEvent(event);
  }, { once: true });
};

const showConsentBannerFull = () => {
  window.removeEventListener("scroll", scrollListener);

  const banner = document.getElementById("consentBanner");
  const consentTitle = document.getElementById("consentTitle");
  // const consentContent = document.getElementById("consentContent");
  // consentContent.style.width = "50%";

  // consentTitle.style.transitionDelay = "1s";
  consentTitle.style.transitionDuration = "1.5s";
  // consentTitle.style.width = "50%";
  consentTitle.style.opacity = "0";

  banner.style.transitionDuration = ".5s";
  banner.style.height = "250px";
  banner.style.width = "100%";
  banner.addEventListener("transitionend", () => {
    const event = new Event("consentBannerFull");
    banner.dispatchEvent(event);
  }, { once: true });

};

const showConsentContent = () => {
  const consentContent = document.getElementById("consentContent");

  consentContent.classList.remove("hidden");
  // consentContent.style.transitionDuration = "1.5s";
  consentContent.style.opacity = "1";
};

const scrollListener = () => {
  if (window.scrollY > 500) {
    // showConsentBannerBar();
    showConsentBannerFull();
    window.removeEventListener("scroll", scrollListener);
  }

  // if (window.scrollY > 500) {
  //   showConsentBannerFull();
  //   window.removeEventListener("scroll", scrollListener);
  // }
};

const eventConductorSteve = (event) => {
  DEBUG_LOG({ logLevel: "info", message: `EVENT CONDUCTOR STEVE 🗣️ :  Consent Banner State is now =  ${event.type}` });

  if (event.type === "consentBannerPeakComplete") {
    // placeholder for future animations.
  }

  if (event.type === "consentBannerFullComplete") {
    // setTimeout(showConsentBannerFull, 2000);
    showConsentContent();
  }
};

const gtag = (args) => {
  // ensure that the data layer is defined
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(args);
};

const initConsentBanner = () => {
  // Define dataLayer and the gtag function.
  window.dataLayer = window.dataLayer || [];

  const localStorageConsent = localStorage.getItem("gtagConsent");
  if (localStorageConsent !== null) {
    const consent = JSON.parse(localStorageConsent);
    DEBUG_LOG({ logLevel: "info", message: `Loaded consent from localStorage: ${JSON.stringify(consent)}` });
    gtag("consent", "update", { ...consent });
    return;
  }

  // init with declined consent and show the banner
  gtag("consent", "default", { ...CONSENT_DECLINED });

  // const timestamp = new Date().getTime();

  window.addEventListener("scroll", scrollListener);

  const banner = document.querySelector("#consentBanner");
  setTimeout(showConsentBannerBar, 1000);

  document.getElementById("cookieConsent").addEventListener("click", () => {
    gtag("consent", "update", { ...CONSENT_ACCEPTED });
    localStorage.setItem("gtagConsent", JSON.stringify(CONSENT_ACCEPTED));
    banner.style.display = "none";
  });

  document.getElementById("cookieDecline").addEventListener("click", () => {
    gtag("consent", "update", { ...CONSENT_DECLINED });
    localStorage.setItem("gtagConsent", JSON.stringify(CONSENT_DECLINED));
    banner.style.display = "none";
  });


  banner.addEventListener("click", () => {
    showConsentBannerFull();
  });
  banner.addEventListener("consentBannerPeakComplete", eventConductorSteve);
  banner.addEventListener("consentBannerBarComplete", eventConductorSteve);
  banner.addEventListener("consentBannerFullComplete", eventConductorSteve);

};

export default initConsentBanner;
