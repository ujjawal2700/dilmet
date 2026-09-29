import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MaterialSymbol } from "./MaterialSymbol";
import {
  getCookieConsent,
  OPEN_COOKIE_PREFERENCES_EVENT,
  saveCookieConsent,
} from "../../core/utils/cookieConsent";

export const CookieConsentBanner = () => {
  const [visible, setVisible] = useState(() => getCookieConsent() === null);
  const [reopened, setReopened] = useState(false);

  useEffect(() => {
    const openPreferences = () => {
      setReopened(true);
      setVisible(true);
    };
    window.addEventListener(OPEN_COOKIE_PREFERENCES_EVENT, openPreferences);
    return () => window.removeEventListener(OPEN_COOKIE_PREFERENCES_EVENT, openPreferences);
  }, []);

  if (!visible) return null;

  const choose = (analytics: boolean) => {
    saveCookieConsent(analytics);
    setVisible(false);
    setReopened(false);
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-[10000] p-3 sm:p-5 pointer-events-none">
      <section
        role="dialog"
        aria-modal="false"
        aria-labelledby="cookie-consent-title"
        aria-describedby="cookie-consent-description"
        className="pointer-events-auto mx-auto max-w-3xl rounded-3xl border border-pink-100 bg-white/95 p-5 shadow-[0_-10px_50px_rgba(30,20,40,0.16)] backdrop-blur-xl sm:p-6"
      >
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-pink-50 text-pink-600">
            <MaterialSymbol name="cookie" size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <h2 id="cookie-consent-title" className="text-base font-black text-gray-900">
                Your privacy choices
              </h2>
              {reopened && (
                <button
                  type="button"
                  onClick={() => setVisible(false)}
                  aria-label="Close cookie preferences"
                  className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                >
                  <MaterialSymbol name="close" size={20} />
                </button>
              )}
            </div>
            <p id="cookie-consent-description" className="mt-1 text-sm leading-5 text-gray-600">
              Dil Mate uses essential browser storage for login sessions, security, language and your
              preferences. It cannot be switched off because the app will not work without it. You can
              also allow optional analytics; none is active unless enabled and configured.
            </p>
            <p className="mt-2 text-xs font-semibold text-gray-500">
              Read our{" "}
              <Link className="text-pink-600 underline underline-offset-2" to="/legal/cookie-policy">
                Cookie Policy
              </Link>{" "}
              and{" "}
              <Link className="text-pink-600 underline underline-offset-2" to="/legal/privacy-policy">
                Privacy Policy
              </Link>.
            </p>
          </div>
        </div>
        <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => choose(false)}
            className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-black text-gray-700 hover:bg-gray-50"
          >
            Essential only
          </button>
          <button
            type="button"
            onClick={() => choose(true)}
            className="rounded-xl bg-premium-pink px-4 py-2.5 text-sm font-black text-white shadow-lg hover:opacity-90"
          >
            Accept all
          </button>
        </div>
      </section>
    </div>
  );
};
