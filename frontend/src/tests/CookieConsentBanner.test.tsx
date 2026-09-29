import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { CookieConsentBanner } from '../shared/components/CookieConsentBanner';
import {
  COOKIE_CONSENT_KEY,
  COOKIE_CONSENT_VERSION,
  getCookieConsent,
  OPEN_COOKIE_PREFERENCES_EVENT,
} from '../core/utils/cookieConsent';

describe('CookieConsentBanner', () => {
  beforeEach(() => localStorage.clear());

  it('starts with no optional consent and records an essential-only choice', () => {
    render(
      <MemoryRouter>
        <CookieConsentBanner />
      </MemoryRouter>,
    );

    expect(screen.getByRole('dialog', { name: 'Your privacy choices' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Essential only' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(getCookieConsent()).toMatchObject({
      version: COOKIE_CONSENT_VERSION,
      essential: true,
      analytics: false,
    });
  });

  it('can be reopened after a preference has already been saved', () => {
    localStorage.setItem(
      COOKIE_CONSENT_KEY,
      JSON.stringify({
        version: COOKIE_CONSENT_VERSION,
        essential: true,
        analytics: true,
        savedAt: new Date().toISOString(),
      }),
    );

    render(
      <MemoryRouter>
        <CookieConsentBanner />
      </MemoryRouter>,
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    fireEvent(window, new Event(OPEN_COOKIE_PREFERENCES_EVENT));
    expect(screen.getByRole('dialog', { name: 'Your privacy choices' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Cookie Policy' })).toHaveAttribute(
      'href',
      '/legal/cookie-policy',
    );
  });
});
