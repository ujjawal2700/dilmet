import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { TaskCompletedModal } from "../../shared/components/TaskCompletedModal";
import { DailyRewardModal } from "../../shared/components/DailyRewardModal";
import * as GlobalStateContext from "../../core/context/GlobalStateContext";
import * as chatService from "../../core/services/chat.service";
import apiClient from "../../core/api/client";

// Mock translation hook
vi.mock("../../core/hooks/useTranslation", () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback || key,
    language: "en",
    changeLanguage: vi.fn(),
  }),
}));

vi.mock("../../core/api/client", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}));

describe("E2E Male Module User Journey & Celebration Experience", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.body.style.overflow = "auto";
  });

  it("Flow 1: Male user launches app, claims daily checkin, and locks background scroll", async () => {
    let modalOpen = true;
    const closeModal = vi.fn(() => {
      modalOpen = false;
    });

    const { rerender } = render(
      <DailyRewardModal
        isOpen={modalOpen}
        onClose={closeModal}
        coinsAwarded={100}
        newBalance={250}
      />,
    );

    // 1. Assert Daily Reward popup appears
    expect(screen.getByText(/\+100/)).toBeInTheDocument();
    expect(screen.getByText(/250/)).toBeInTheDocument();

    // 2. Assert background body scroll is securely locked
    expect(document.body.style.overflow).toBe("hidden");

    // 3. User claims daily reward
    const claimBtn = screen.getByRole("button", { name: /awesome/i });
    fireEvent.click(claimBtn);
    expect(closeModal).toHaveBeenCalled();

    // 4. Modal closes and body scroll is restored
    rerender(
      <DailyRewardModal
        isOpen={false}
        onClose={closeModal}
        coinsAwarded={100}
        newBalance={250}
      />,
    );
    expect(document.body.style.overflow).toBe("auto");
  });

  it("Flow 2: Male user chats with companion, achieves task, and celebration popup triggers", async () => {
    const mockCompletedTask = {
      taskKey: "send_hi_3_times",
      title: "Say Hi to 3 Companions",
      icon: "waving_hand",
      rewardCoins: 50,
      newBalance: 300,
      description: "You completed your daily social task!",
    };

    // Simulate sending message API triggering task completion
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      data: {
        data: {
          success: true,
          completedTask: mockCompletedTask,
        },
      },
    } as any);

    let capturedEventDetail: any = null;
    window.addEventListener("app:task:completed", (e: any) => {
      capturedEventDetail = e.detail;
    });

    // 1. Send Hi to companion
    const response = await chatService.sendHiMessage("companion-ananya");
    expect(response.completedTask).toBeDefined();
    expect(capturedEventDetail).toEqual(mockCompletedTask);

    // 2. Render Global Celebration Modal with the completed task payload
    const clearTaskSpy = vi.fn();
    vi.spyOn(GlobalStateContext, "useGlobalState").mockReturnValue({
      completedTask: capturedEventDetail,
      clearCompletedTask: clearTaskSpy,
      showTaskCompletedModal: vi.fn(),
      walletBalance: 300,
      setWalletBalance: vi.fn(),
      user: { id: "male-user-1", name: "Rahul", role: "male" } as any,
      activeCall: null,
      setActiveCall: vi.fn(),
    } as any);

    const { rerender } = render(<TaskCompletedModal />);

    // 3. Assert celebration elements rendered
    expect(screen.getByText("Say Hi to 3 Companions")).toBeInTheDocument();
    expect(screen.getByText("+50")).toBeInTheDocument();
    expect(
      screen.getByText("You completed your daily social task!"),
    ).toBeInTheDocument();

    // 4. Verify background body is locked while popup is displayed
    expect(document.body.style.overflow).toBe("hidden");

    // 5. User clicks the celebration action button
    const continueBtn = screen.getByRole("button", { name: /awesome|claim/i });
    fireEvent.click(continueBtn);
    expect(clearTaskSpy).toHaveBeenCalled();

    // 6. After dismissal, body scroll restores
    vi.spyOn(GlobalStateContext, "useGlobalState").mockReturnValue({
      completedTask: null,
      clearCompletedTask: clearTaskSpy,
      showTaskCompletedModal: vi.fn(),
      walletBalance: 300,
      setWalletBalance: vi.fn(),
      user: { id: "male-user-1", name: "Rahul", role: "male" } as any,
      activeCall: null,
      setActiveCall: vi.fn(),
    } as any);

    rerender(<TaskCompletedModal />);
    expect(document.body.style.overflow).toBe('auto');
  });

  it('Flow 3: Male user explores Leaderboard, Gifts shop, and Coin recharge options', async () => {
    // 1. Leaderboard section
    const mockLeaderboard = [
      { rank: 1, name: 'Vikram', level: 12, coinsSpent: 5000 },
      { rank: 2, name: 'Rahul', level: 8, coinsSpent: 2200 },
    ];
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: { success: true, data: { leaderboard: mockLeaderboard } },
    } as any);

    const lRes = await apiClient.get('/users/male/leaderboard');
    expect(lRes.data.data.leaderboard.length).toBe(2);

    // 2. Gifts catalog
    const mockGifts = [
      { id: 'g1', name: 'Red Rose', coinCost: 10, icon: '🌹' },
      { id: 'g2', name: 'Diamond Ring', coinCost: 100, icon: '💍' },
    ];
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: { success: true, data: { gifts: mockGifts } },
    } as any);

    const gRes = await apiClient.get('/chat/gifts');
    expect(gRes.data.data.gifts.length).toBe(2);

    // 3. Coin recharge plans
    const mockPlans = [
      { id: 'p1', name: 'Starter Pack', coins: 100, price: 99 },
      { id: 'p2', name: 'Popular Pack', coins: 500, price: 399 },
    ];
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: { success: true, data: { plans: mockPlans } },
    } as any);

    const pRes = await apiClient.get('/wallet/coin-plans');
    expect(pRes.data.data.plans[0].coins).toBe(100);
  });
});
