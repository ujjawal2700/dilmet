import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { TaskCompletedModal } from "../shared/components/TaskCompletedModal";
import * as GlobalStateContext from "../core/context/GlobalStateContext";

// Mock translation hook
vi.mock("../core/hooks/useTranslation", () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback || key,
    language: "en",
    changeLanguage: vi.fn(),
  }),
}));

describe("TaskCompletedModal Component", () => {
  const mockClearCompletedTask = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    document.body.style.overflow = "auto";
  });

  it("renders nothing when there is no completed task", () => {
    vi.spyOn(GlobalStateContext, "useGlobalState").mockReturnValue({
      completedTask: null,
      clearCompletedTask: mockClearCompletedTask,
      showTaskCompletedModal: vi.fn(),
      walletBalance: 100,
      setWalletBalance: vi.fn(),
      user: null,
      setUser: vi.fn(),
      activeCall: null,
      setActiveCall: vi.fn(),
    } as unknown as ReturnType<typeof GlobalStateContext.useGlobalState>);

    const { container } = render(<TaskCompletedModal />);
    expect(container.firstChild).toBeNull();
    expect(document.body.style.overflow).toBe("auto");
  });

  it("renders celebration modal with task title, coins, and locks body scroll", () => {
    vi.spyOn(GlobalStateContext, "useGlobalState").mockReturnValue({
      completedTask: {
        taskKey: "send_hi_3_times",
        title: "Say Hi to 3 Companions",
        icon: "waving_hand",
        rewardCoins: 25,
        newBalance: 125,
        description: "Completed morning greeting challenge",
      },
      clearCompletedTask: mockClearCompletedTask,
      showTaskCompletedModal: vi.fn(),
      walletBalance: 125,
      setWalletBalance: vi.fn(),
      user: null,
      setUser: vi.fn(),
      activeCall: null,
      setActiveCall: vi.fn(),
    } as unknown as ReturnType<typeof GlobalStateContext.useGlobalState>);

    render(<TaskCompletedModal />);

    // Assert task title and coins reward
    expect(screen.getByText("Say Hi to 3 Companions")).toBeInTheDocument();
    expect(screen.getByText("+25")).toBeInTheDocument();
    expect(screen.getAllByText(/Coins/i).length).toBeGreaterThan(0);
    expect(
      screen.getByText("Completed morning greeting challenge"),
    ).toBeInTheDocument();

    // Body scroll must be locked
    expect(document.body.style.overflow).toBe("hidden");

    // Clicking Claim / Continue dismisses the modal
    const closeBtn = screen.getByRole("button", { name: /awesome|claim/i });
    fireEvent.click(closeBtn);
    expect(mockClearCompletedTask).toHaveBeenCalled();
  });
});
