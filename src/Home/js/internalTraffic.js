// Keeps your own visits out of Google Analytics.
//
//   conorhinchee.com/?internal=1   stop sending analytics from this browser
//   conorhinchee.com/?internal=0   start sending again
//
// The choice is remembered per browser. When it's on, we set Google's official
// opt-out flag (window["ga-disable-<measurement id>"]) before GTM loads, so
// gtag never sends a hit. Nothing shows up in GA at all, not even a cookieless
// ping, which is what makes it different from declining consent.

const MEASUREMENT_ID = "G-0440Q7V3FG";
const OPT_OUT_KEY = "analytics_opt_out";
const PARAM = "internal";

const readFlag = () => {
  try {
    return localStorage.getItem(OPT_OUT_KEY) === "1";
  } catch (e) {
    // Private modes can throw on access; treat that as "not opted out".
    return false;
  }
};

const writeFlag = (optedOut) => {
  try {
    if (optedOut) {
      localStorage.setItem(OPT_OUT_KEY, "1");
    } else {
      localStorage.removeItem(OPT_OUT_KEY);
    }
  } catch (e) {
    // Nothing to persist to; the flag still applies to this page load.
  }
};

// "1", "true" and "yes" turn it on; "0", "false" and "no" turn it off.
const readParam = () => {
  const value = new URLSearchParams(window.location.search).get(PARAM);
  if (value === null) return null;
  if (["0", "false", "no"].includes(value.toLowerCase())) return false;
  return true;
};

const initInternalTraffic = () => {
  const requested = readParam();
  const optedOut = requested === null ? readFlag() : requested;

  if (requested !== null) {
    writeFlag(optedOut);
    console.info(
      optedOut
        ? `Analytics off for this browser. Visit ?${PARAM}=0 to turn it back on.`
        : "Analytics back on for this browser."
    );
  }

  window[`ga-disable-${MEASUREMENT_ID}`] = optedOut;
  return optedOut;
};

export { MEASUREMENT_ID, OPT_OUT_KEY, initInternalTraffic };
export default initInternalTraffic;
