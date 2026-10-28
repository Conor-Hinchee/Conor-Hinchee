// Globals the site shares with Google Tag Manager.

// GTM reads plain objects as events and `arguments` objects as gtag commands.
type DataLayerEntry = Record<string, unknown> | IArguments;

interface Window {
  dataLayer?: DataLayerEntry[];
  // Google's per-property opt-out flag, e.g. window["ga-disable-G-XXXX"].
  [gaDisable: `ga-disable-${string}`]: boolean | undefined;
}
