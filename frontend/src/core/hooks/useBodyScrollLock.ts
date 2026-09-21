import { useEffect } from 'react';

let lockCount = 0;
let originalOverflow = '';
let originalPaddingRight = '';

/**
 * Locks background body scrolling when a modal / popup is open.
 * Supports multiple nested modals via reference counting.
 */
export const useBodyScrollLock = (isLocked: boolean = true) => {
  useEffect(() => {
    if (!isLocked) return;

    if (lockCount === 0) {
      originalOverflow = document.body.style.overflow;
      originalPaddingRight = document.body.style.paddingRight;

      // Prevent content shift when scrollbar disappears
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      if (scrollBarWidth > 0) {
        document.body.style.paddingRight = `${scrollBarWidth}px`;
      }
    }
    lockCount++;

    return () => {
      lockCount = Math.max(0, lockCount - 1);
      if (lockCount === 0) {
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = originalPaddingRight;
      }
    };
  }, [isLocked]);
};

/**
 * Global hook to automatically detect any active modal/popup in the DOM
 * and lock body scroll so the page behind cannot be scrolled.
 */
export const useGlobalModalScrollLock = () => {
  useEffect(() => {
    let currentLocked = false;

    const checkModalState = () => {
      // Look for any fixed inset-0 elements that act as modal backdrops/overlays
      const candidates = document.querySelectorAll<HTMLElement>(
        '.fixed.inset-0:not(.pointer-events-none):not(.z-0):not([aria-hidden="true"])'
      );

      const hasVisibleModal = Array.from(candidates).some((el) => {
        // Skip hidden or zero-size elements
        if (el.offsetWidth === 0 && el.offsetHeight === 0) return false;
        const style = window.getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false;

        // Verify z-index is at least 30 (typical for modal overlays in this app: 40, 50, 60, 100, 9999, 10000)
        const zIndex = parseInt(style.zIndex, 10);
        return !isNaN(zIndex) && zIndex >= 30;
      });

      if (hasVisibleModal && !currentLocked) {
        currentLocked = true;
        originalOverflow = document.body.style.overflow;
        originalPaddingRight = document.body.style.paddingRight;
        const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
        document.body.style.overflow = 'hidden';
        if (scrollBarWidth > 0) {
          document.body.style.paddingRight = `${scrollBarWidth}px`;
        }
      } else if (!hasVisibleModal && currentLocked && lockCount === 0) {
        currentLocked = false;
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = originalPaddingRight;
      }
    };

    // Run initial check
    checkModalState();

    // Observe DOM changes (modals mounting/unmounting or changing visibility)
    const observer = new MutationObserver(() => {
      checkModalState();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style', 'aria-hidden'],
    });

    return () => {
      observer.disconnect();
      if (currentLocked && lockCount === 0) {
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = originalPaddingRight;
      }
    };
  }, []);
};

export default useBodyScrollLock;

