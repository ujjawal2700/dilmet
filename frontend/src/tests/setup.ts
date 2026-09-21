import '@testing-library/jest-dom/vitest';

// Polyfill window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => { },
    removeListener: () => { },
    addEventListener: () => { },
    removeEventListener: () => { },
    dispatchEvent: () => false,
  }),
});

// Polyfill Web Audio API for celebrations
class MockAudioContext {
  currentTime = 0;
  destination = {};
  createOscillator() {
    return {
      type: 'sine',
      frequency: {
        setValueAtTime: () => { },
        exponentialRampToValueAtTime: () => { },
      },
      connect: () => { },
      start: () => { },
      stop: () => { },
    };
  }
  createGain() {
    return {
      gain: {
        setValueAtTime: () => { },
        exponentialRampToValueAtTime: () => { },
      },
      connect: () => { },
    };
  }
}

// Attach Mock Audio Context
(window as unknown as { AudioContext: typeof MockAudioContext }).AudioContext = MockAudioContext;
(window as unknown as { webkitAudioContext: typeof MockAudioContext }).webkitAudioContext = MockAudioContext;

// Polyfill localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});
