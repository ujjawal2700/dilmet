import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Home, Compass, MessageCircle, Coins, User } from 'lucide-react';
import { LiquidTabBar, type LiquidTab } from '../shared/components/LiquidTabBar';

const testTabs: LiquidTab[] = [
  { to: '/male/dashboard', label: 'Home', icon: Home, end: true },
  { to: '/male/discover', label: 'Discover', icon: Compass },
  { to: '/male/chats', label: 'Chats', icon: MessageCircle, badge: 3 },
  { to: '/male/wallet', label: 'Wallet', icon: Coins },
  { to: '/male/my-profile', label: 'Profile', icon: User, locked: true },
];

describe('LiquidTabBar', () => {
  it('renders all tab items with high contrast theme-adaptive styles', () => {
    render(
      <MemoryRouter initialEntries={['/male/dashboard']}>
        <LiquidTabBar tabs={testTabs} testId="liquid-bar" />
      </MemoryRouter>
    );

    const nav = screen.getByTestId('liquid-bar');
    expect(nav).toBeDefined();

    // Verify all labels are rendered
    expect(screen.getByText('Home')).toBeDefined();
    expect(screen.getByText('Discover')).toBeDefined();
    expect(screen.getByText('Chats')).toBeDefined();
    expect(screen.getByText('Wallet')).toBeDefined();
    expect(screen.getByText('Profile')).toBeDefined();

    // Verify badge is rendered
    expect(screen.getByText('3')).toBeDefined();

    // Active item (Home) has high-contrast pink active styling
    const homeLabel = screen.getByText('Home');
    expect(homeLabel.className).toContain('text-pink-600');

    // Inactive items (Discover, Wallet) have high-contrast slate styling (NOT white on white)
    const discoverLabel = screen.getByText('Discover');
    const classes = discoverLabel.className.split(' ');
    expect(classes).toContain('text-slate-500');
    expect(classes).not.toContain('text-white');
  });

  it('calls onLockedPress when a locked tab is clicked', () => {
    const handleLockedPress = vi.fn();
    render(
      <MemoryRouter initialEntries={['/male/dashboard']}>
        <LiquidTabBar tabs={testTabs} onLockedPress={handleLockedPress} />
      </MemoryRouter>
    );

    const lockedButton = screen.getByRole('button', { name: /Profile/i });
    fireEvent.click(lockedButton);
    expect(handleLockedPress).toHaveBeenCalledWith('/male/my-profile');
  });
});
