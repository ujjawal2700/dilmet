import { renderHook } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useBodyScrollLock } from '../core/hooks/useBodyScrollLock';

describe('useBodyScrollLock Hook', () => {
  beforeEach(() => {
    document.body.style.overflow = 'auto';
    document.body.style.paddingRight = '';
  });

  afterEach(() => {
    document.body.style.overflow = 'auto';
    document.body.style.paddingRight = '';
  });

  it('locks body scroll by setting overflow: hidden when mounted with isLocked=true', () => {
    const { unmount } = renderHook(() => useBodyScrollLock(true));

    expect(document.body.style.overflow).toBe('hidden');

    unmount();
    expect(document.body.style.overflow).toBe('auto');
  });

  it('does not lock body scroll when isLocked=false', () => {
    renderHook(() => useBodyScrollLock(false));

    expect(document.body.style.overflow).toBe('auto');
  });

  it('handles reference counting with multiple nested modals correctly', () => {
    const hook1 = renderHook(() => useBodyScrollLock(true));
    expect(document.body.style.overflow).toBe('hidden');

    const hook2 = renderHook(() => useBodyScrollLock(true));
    expect(document.body.style.overflow).toBe('hidden');

    // Unmounting the first modal should still keep body locked because hook2 is open
    hook1.unmount();
    expect(document.body.style.overflow).toBe('hidden');

    // Unmounting the second modal restores original overflow
    hook2.unmount();
    expect(document.body.style.overflow).toBe('auto');
  });
});

