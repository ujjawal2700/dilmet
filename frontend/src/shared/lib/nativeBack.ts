const IN_APP_WINDOW_MS = 800;

let lastInteraction = -Infinity;
let lastPopWasNative = false;
let installed = false;

export function installNativeBackDetection() {
  if (installed || typeof window === "undefined") return;
  installed = true;
  const mark = () => {
    lastInteraction = performance.now();
  };
  window.addEventListener("click", mark, true);
  window.addEventListener("keydown", mark, true);

  window.addEventListener(
    "popstate",
    (e) => {
      // Set by Safari 18+ / Chrome 123+ when the browser has already animated the page back
      const uaTransition = (e as PopStateEvent & { hasUAVisualTransition?: boolean }).hasUAVisualTransition;
      lastPopWasNative = uaTransition === true || performance.now() - lastInteraction > IN_APP_WINDOW_MS;
    },
    true,
  );
}

export function wasNativeBack() {
  return lastPopWasNative;
}
