import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { installNativeBackDetection, wasNativeBack } from '../shared/lib/nativeBack';
import { installNoLongPressMenus } from '../shared/lib/noLongPressMenus';

describe('nativeMobileUtils', () => {
  const originalMatchMedia = window.matchMedia;

  beforeEach(() => {
    installNativeBackDetection();
    installNoLongPressMenus();
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  describe('nativeBack', () => {
    it('initializes and reports false initially if user interacted', () => {
      // Dispatch click to mark user interaction
      window.dispatchEvent(new MouseEvent('click'));
      window.dispatchEvent(new PopStateEvent('popstate', { state: null }));
      expect(wasNativeBack()).toBe(false);
    });

    it('detects native back if hasUAVisualTransition is true', () => {
      const popEvent = new PopStateEvent('popstate', { state: null });
      Object.defineProperty(popEvent, 'hasUAVisualTransition', {
        value: true,
        writable: true,
      });
      window.dispatchEvent(popEvent);
      expect(wasNativeBack()).toBe(true);
    });
  });

  describe('noLongPressMenus', () => {
    it('prevents contextmenu on touch devices for interactive elements', () => {
      window.matchMedia = (query: string) => ({
        matches: query.includes('pointer: coarse'),
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      });

      const button = document.createElement('button');
      document.body.appendChild(button);

      const event = new MouseEvent('contextmenu', {
        bubbles: true,
        cancelable: true,
      });

      button.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(true);

      document.body.removeChild(button);
    });

    it('allows contextmenu when pointer is not coarse', () => {
      window.matchMedia = (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      });

      const button = document.createElement('button');
      document.body.appendChild(button);

      const event = new MouseEvent('contextmenu', {
        bubbles: true,
        cancelable: true,
      });

      button.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(false);

      document.body.removeChild(button);
    });

    it('prevents dragstart on anchor or image elements', () => {
      const link = document.createElement('a');
      link.href = '#';
      document.body.appendChild(link);

      const dragEvent = new Event('dragstart', {
        bubbles: true,
        cancelable: true,
      });

      link.dispatchEvent(dragEvent);
      expect(dragEvent.defaultPrevented).toBe(true);

      document.body.removeChild(link);
    });
  });
});
