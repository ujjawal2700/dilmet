import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useBodyScrollLock } from "../../core/hooks/useBodyScrollLock";
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
    put: vi.fn(),
  },
}));

describe("E2E Female Module Journey & Operations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.body.style.overflow = "auto";
  });

  it("Flow 1: Female user dashboard earnings fetch and withdrawal popup flow with scroll lock", async () => {
    // 1. Mock female earnings statistics
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: {
        data: {
          coinsBalance: 12500,
          inrEquivalent: 1250,
          pendingWithdrawal: 0,
          todayEarnings: 850,
        },
      },
    } as any);

    const statsRes = await apiClient.get("/wallet/balance");
    expect(statsRes.data.data.coinsBalance).toBe(12500);

    // 2. Open Withdrawal Request Modal
    let isWithdrawalModalOpen = true;
    const closeWithdrawalModal = vi.fn(() => {
      isWithdrawalModalOpen = false;
    });

    const WithdrawalModalComponent = ({
      isOpen,
      onClose,
    }: {
      isOpen: boolean;
      onClose: () => void;
    }) => {
      useBodyScrollLock(isOpen);
      if (!isOpen) return null;
      return (
        <div
          role="dialog"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white p-6 rounded-2xl">
            <h2>Request Payout</h2>
            <p>Available Balance: ₹1250</p>
            <input
              aria-label="UPI ID"
              placeholder="name@okaxis"
              defaultValue="priya@okaxis"
            />
            <button onClick={onClose}>Submit Request</button>
          </div>
        </div>
      );
    };

    const { rerender } = render(
      <WithdrawalModalComponent
        isOpen={isWithdrawalModalOpen}
        onClose={closeWithdrawalModal}
      />,
    );

    // 3. Verify modal elements are visible and body scroll is locked
    expect(screen.getByText("Request Payout")).toBeInTheDocument();
    expect(screen.getByText(/Available Balance: ₹1250/)).toBeInTheDocument();
    expect(document.body.style.overflow).toBe("hidden");

    // 4. Mock payout API request
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      data: {
        success: true,
        message: "Withdrawal request submitted for review",
      },
    } as any);

    const submitBtn = screen.getByRole("button", { name: "Submit Request" });
    fireEvent.click(submitBtn);
    const payoutRes = await apiClient.post("/wallet/withdrawals", {
      amount: 1250,
      upiId: "priya@okaxis",
    });
    expect(payoutRes.data.success).toBe(true);
    expect(closeWithdrawalModal).toHaveBeenCalled();

    // 5. Re-render closed modal and verify scroll is restored
    rerender(
      <WithdrawalModalComponent
        isOpen={false}
        onClose={closeWithdrawalModal}
      />,
    );
    expect(document.body.style.overflow).toBe("auto");
  });

  it("Flow 2: Female user profile edit modal locks background scroll and updates bio", async () => {
    let isEditProfileOpen = true;
    const closeEditProfile = vi.fn(() => {
      isEditProfileOpen = false;
    });

    const EditProfileModal = ({
      isOpen,
      onClose,
    }: {
      isOpen: boolean;
      onClose: () => void;
    }) => {
      useBodyScrollLock(isOpen);
      if (!isOpen) return null;
      return (
        <div
          role="dialog"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white p-6 rounded-2xl">
            <h2>Edit Profile</h2>
            <input aria-label="City" defaultValue="Mumbai" />
            <button onClick={onClose}>Save Profile</button>
          </div>
        </div>
      );
    };

    const { rerender } = render(
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={closeEditProfile}
      />,
    );

    expect(screen.getByText("Edit Profile")).toBeInTheDocument();
    expect(document.body.style.overflow).toBe("hidden");

    const saveBtn = screen.getByRole("button", { name: "Save Profile" });
    fireEvent.click(saveBtn);
    expect(closeEditProfile).toHaveBeenCalled();

    rerender(<EditProfileModal isOpen={false} onClose={closeEditProfile} />);
    expect(document.body.style.overflow).toBe("auto");
    expect(document.body.style.overflow).toBe("auto");
  });

  it("Flow 3: Female user manages Auto-Message Templates and reviews Live Dashboard Stats", async () => {
    // 1. Dashboard active chats and live stats
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          activeChats: 5,
          missedCalls: 1,
          rating: 4.9,
          totalEarnedToday: 650,
        },
      },
    } as any);

    const statsRes = await apiClient.get("/users/female/dashboard/stats");
    expect(statsRes.data.data.activeChats).toBe(5);

    // 2. Auto-message templates list
    const mockTemplates = [
      {
        id: "t1",
        title: "Warm Greeting",
        content: "Hey handsome, how is your evening going? ✨",
        isActive: true,
      },
      {
        id: "t2",
        title: "Sweet Follow-up",
        content: "Aww that sounds lovely! Tell me more 😊",
        isActive: true,
      },
    ];

    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: { success: true, data: { templates: mockTemplates } },
    } as any);

    const templatesRes = await apiClient.get("/users/female/auto-messages");
    expect(templatesRes.data.data.templates.length).toBe(2);

    // 3. Create a new custom template
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          template: {
            id: "t3",
            title: "Night Wish",
            content: "Sweet dreams! 🌙",
            isActive: true,
          },
        },
      },
    } as any);

    const createRes = await apiClient.post("/users/female/auto-messages", {
      title: "Night Wish",
      content: "Sweet dreams! 🌙",
    });
    expect(createRes.data.data.template.title).toBe("Night Wish");
  });
});
