import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Home, Compass, MessageCircle, User } from 'lucide-react';
import { LiquidTabBar, type LiquidTab } from '../shared/components/LiquidTabBar';

describe('LiquidTabBar', () => {
  const tabs: LiquidTab[] = [
    { to: '/home', label: 'Home', icon: Home, end: true },
    { to: '/explore', label: 'Explore', icon: Compass },
    { to: '/messages', label: 'Messages', icon: MessageCircle, badge: true },
    { to: '/premium', label: 'Premium', icon: User, locked: true },
  ];

  it('renders all tab labels and navigation container', () => {
    render(
      <MemoryRouter initialEntries={['/home']}>
        <LiquidTabBar tabs={tabs} testId="liquid-bar" />
      </MemoryRouter>
    );

    expect(screen.getByTestId('liquid-bar')).toBeInTheDocument();
    expect(screen.getAllByText('Home').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Explore').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Messages').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Premium').length).toBeGreaterThan(0);
  });

  it('sets aria-current="page" on the active tab route', () => {
    render(
      <MemoryRouter initialEntries={['/explore']}>
        <LiquidTabBar tabs={tabs} />
      </MemoryRouter>
    );

    const exploreLink = screen.getByRole('link', { name: /explore/i });
    expect(exploreLink).toHaveAttribute('aria-current', 'page');
  });

  it('triggers onLockedPress callback when clicking a locked tab', () => {
    const handleLockedPress = vi.fn();
    render(
      <MemoryRouter initialEntries={['/home']}>
        <LiquidTabBar tabs={tabs} onLockedPress={handleLockedPress} />
      </MemoryRouter>
    );

    const lockedButton = screen.getByRole('button', { name: /premium — login required/i });
    fireEvent.click(lockedButton);

    expect(handleLockedPress).toHaveBeenCalledWith('/premium');
  });
});
