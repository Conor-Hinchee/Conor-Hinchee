// Google Consent Mode v2 helpers.
// Shared by blocking.js (runs before GTM loads) and the consent banner.

// v2: the old "cookie-consent" cookie was written as "declined" before visitors
// ever chose, so it can't be trusted. A new name re-asks everyone once.
const CONSENT_COOKIE = "consent_v2";
const LEGACY_CONSENT_COOKIE = "cookie-consent";
const LEGACY_CONSENT_STORAGE_KEY = "trackConsent";
const CONSENT_COOKIE_DAYS = 180;

const GRANTED = "granted";
const DENIED = "denied";

// Opt-in regions: analytics stays off until the visitor consents.
// EU-27 + EEA (IS, LI, NO) + UK + Switzerland.
const OPT_IN_REGIONS = [
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU",
  "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES",
  "SE", "IS", "LI", "NO", "GB", "CH",
];

// No ads on this site, so ad-related storage is always denied.
const ADS_DENIED = {
  ad_storage: DENIED,
  ad_user_data: DENIED,
  ad_personalization: DENIED,
};

// GTM only understands consent commands pushed as an `arguments` object,
// so this must stay a regular function (no arrow function / rest params).
function gtag() {
  window.dataLayer = window.dataLayer || [];
  // eslint-disable-next-line prefer-rest-params
  window.dataLayer.push(arguments);
}

const getStoredConsent = () => {
  const match = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith(`${CONSENT_COOKIE}=`));
  if (!match) return null;
  const value = match.split("=")[1];
  return value === GRANTED || value === DENIED ? value : null;
};

const storeConsent = (analyticsStorage) => {
  const expires = new Date(
    Date.now() + CONSENT_COOKIE_DAYS * 864e5
  ).toUTCString();
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${CONSENT_COOKIE}=${analyticsStorage}; expires=${expires}; path=/; SameSite=Lax${secure}`;
};

const clearLegacyConsent = () => {
  document.cookie = `${LEGACY_CONSENT_COOKIE}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  try {
    localStorage.removeItem(LEGACY_CONSENT_STORAGE_KEY);
  } catch (e) {
    // localStorage can throw in some privacy modes; nothing to clean up then.
  }
};

// Must run before the GTM snippet. Region-specific defaults win over the
// global default, so opt-in regions start denied and everyone else granted.
const setDefaultConsent = () => {
  gtag("consent", "default", {
    ...ADS_DENIED,
    analytics_storage: DENIED,
    region: OPT_IN_REGIONS,
  });
  gtag("consent", "default", {
    ...ADS_DENIED,
    analytics_storage: GRANTED,
  });

  const stored = getStoredConsent();
  if (stored) {
    gtag("consent", "update", { analytics_storage: stored });
  }
};

const updateConsent = (analyticsStorage) => {
  storeConsent(analyticsStorage);
  gtag("consent", "update", { analytics_storage: analyticsStorage });
};

export {
  CONSENT_COOKIE,
  GRANTED,
  DENIED,
  OPT_IN_REGIONS,
  getStoredConsent,
  clearLegacyConsent,
  setDefaultConsent,
  updateConsent,
};
