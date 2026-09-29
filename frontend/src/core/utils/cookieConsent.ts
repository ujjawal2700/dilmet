export const COOKIE_CONSENT_KEY = "dil_mate_cookie_consent";
export const COOKIE_CONSENT_VERSION = "2026-09-29";
export const COOKIE_CONSENT_EVENT = "dil-mate-cookie-consent-updated";
export const OPEN_COOKIE_PREFERENCES_EVENT = "dil-mate-open-cookie-preferences";

export interface CookieConsentPreference {
  version: string;
  essential: true;
  analytics: boolean;
  savedAt: string;
}

export const getCookieConsent = (): CookieConsentPreference | null => {
  try {
    const raw = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!raw) return null;
    const preference = JSON.parse(raw) as CookieConsentPreference;
    if (
      preference.version !== COOKIE_CONSENT_VERSION ||
      preference.essential !== true ||
      typeof preference.analytics !== "boolean"
    ) {
      return null;
    }
    return preference;
  } catch {
    return null;
  }
};

export const saveCookieConsent = (analytics: boolean): CookieConsentPreference => {
  const preference: CookieConsentPreference = {
    version: COOKIE_CONSENT_VERSION,
    essential: true,
    analytics,
    savedAt: new Date().toISOString(),
  };
  localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(preference));
  window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_EVENT, { detail: preference }));
  return preference;
};

export const openCookiePreferences = (): void => {
  window.dispatchEvent(new Event(OPEN_COOKIE_PREFERENCES_EVENT));
};
