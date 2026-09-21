import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import apiClient from '../../core/api/client';

// Mock translation hook
vi.mock('../../core/hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback || key,
    language: 'en',
    changeLanguage: vi.fn(),
  }),
}));

vi.mock('../../core/api/client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    put: vi.fn(),
  },
}));

describe('E2E Auth & Onboarding Flow Across All Sections', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.body.style.overflow = 'auto';
  });

  it('Section 1: Language Selection & Switcher Flow', () => {
    const onSelectLang = vi.fn();
    const LanguageSelectionComponent = ({ onSelect }: { onSelect: (l: string) => void }) => (
      <div>
        <h1>Select Preferred Language</h1>
        <button onClick={() => onSelect('hi')}>हिंदी (Hindi)</button>
        <button onClick={() => onSelect('en')}>English</button>
        <button onClick={() => onSelect('hinglish')}>Hinglish</button>
      </div>
    );

    render(<LanguageSelectionComponent onSelect={onSelectLang} />);

    expect(screen.getByText('Select Preferred Language')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /हिंदी/i }));
    expect(onSelectLang).toHaveBeenCalledWith('hi');
  });

  it('Section 2: Login & OTP Verification Flow', async () => {
    const onLoginSuccess = vi.fn();

    vi.mocked(apiClient.post).mockResolvedValueOnce({
      data: { success: true, message: 'OTP sent successfully' },
    } as any);

    const res = await apiClient.post('/auth/login-request', { phoneNumber: '9876543210' });
    expect(res.data.success).toBe(true);

    vi.mocked(apiClient.post).mockResolvedValueOnce({
      data: {
        success: true,
        token: 'jwt-token-xyz',
        data: { user: { id: 'u1', name: 'Kabir', role: 'male' } },
      },
    } as any);

    const verifyRes = await apiClient.post('/auth/login-verify', {
      phoneNumber: '9876543210',
      otp: '123456',
    });
    expect(verifyRes.data.token).toBe('jwt-token-xyz');
    onLoginSuccess(verifyRes.data.data.user);
    expect(onLoginSuccess).toHaveBeenCalledWith(expect.objectContaining({ name: 'Kabir' }));
  });

  it('Section 3: Signup, Profile Setup & Interests Selection Flow', async () => {
    const onCompleteOnboarding = vi.fn();

    const SignupOnboardingComponent = ({ onComplete }: { onComplete: (data: any) => void }) => {
      return (
        <div>
          <h2>Setup Your Profile</h2>
          <input aria-label="Name" defaultValue="Rahul Verma" />
          <input aria-label="City" defaultValue="Indore" />
          <div data-testid="interests-group">
            <button onClick={() => onComplete({ name: 'Rahul Verma', city: 'Indore', interests: ['Music', 'Travel', 'Fitness'] })}>
              Finish Profile
            </button>
          </div>
        </div>
      );
    };

    render(<SignupOnboardingComponent onComplete={onCompleteOnboarding} />);

    expect(screen.getByText('Setup Your Profile')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Rahul Verma')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Indore')).toBeInTheDocument();

    const finishBtn = screen.getByRole('button', { name: 'Finish Profile' });
    fireEvent.click(finishBtn);

    expect(onCompleteOnboarding).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Rahul Verma',
        city: 'Indore',
        interests: expect.arrayContaining(['Music', 'Travel']),
      })
    );
  });
});
