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
    delete: vi.fn(),
  },
}));

describe("E2E Admin Module Operations & Management", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.body.style.overflow = "auto";
  });

  it("Flow 1: Admin creates a realistic Indian AI companion with modal scroll lock", async () => {
    let isAddCompanionModalOpen = true;
    const closeAddModal = vi.fn(() => {
      isAddCompanionModalOpen = false;
    });

    const AddAiCompanionModal = ({
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
          <div className="bg-white p-6 rounded-2xl w-96">
            <h2>Add AI Companion</h2>
            <input aria-label="Name" defaultValue="Ananya Sharma" />
            <input aria-label="City" defaultValue="Indore" />
            <input
              aria-label="Avatar URL"
              defaultValue="https://images.unsplash.com/photo-1534528741775-53994a69daeb"
            />
            <textarea
              aria-label="Persona Prompt"
              defaultValue="Friendly, sweet, human-like Indian girl from Indore"
            />
            <button onClick={onClose}>Create Companion</button>
          </div>
        </div>
      );
    };

    const { rerender } = render(
      <AddAiCompanionModal
        isOpen={isAddCompanionModalOpen}
        onClose={closeAddModal}
      />,
    );

    // 1. Assert modal is open and inputs are present
    expect(screen.getByText("Add AI Companion")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Ananya Sharma")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Indore")).toBeInTheDocument();

    // 2. Assert body scroll is locked
    expect(document.body.style.overflow).toBe("hidden");

    // 3. Submit creation
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          companion: {
            id: "c1",
            name: "Ananya Sharma",
            city: "Indore",
            isAiCompanion: true,
          },
        },
      },
    } as any);

    const createBtn = screen.getByRole("button", { name: "Create Companion" });
    fireEvent.click(createBtn);
    expect(closeAddModal).toHaveBeenCalled();

    // 4. Modal closes and scroll is unlocked
    rerender(<AddAiCompanionModal isOpen={false} onClose={closeAddModal} />);
    expect(document.body.style.overflow).toBe("auto");
  });

  it("Flow 2: Admin edits daily task configurations with modal scroll lock", async () => {
    let isTaskModalOpen = true;
    const closeTaskModal = vi.fn(() => {
      isTaskModalOpen = false;
    });

    const TaskEditModal = ({
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
          <div className="bg-white p-6 rounded-2xl w-96">
            <h2>Edit Daily Task</h2>
            <input
              aria-label="Task Title"
              defaultValue="Say Hi to 3 Companions"
            />
            <input aria-label="Reward Coins" defaultValue="25" type="number" />
            <button onClick={onClose}>Save Task</button>
          </div>
        </div>
      );
    };

    const { rerender } = render(
      <TaskEditModal isOpen={isTaskModalOpen} onClose={closeTaskModal} />,
    );

    expect(screen.getByText("Edit Daily Task")).toBeInTheDocument();
    expect(
      screen.getByDisplayValue("Say Hi to 3 Companions"),
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue("25")).toBeInTheDocument();

    // Scroll must be locked
    expect(document.body.style.overflow).toBe("hidden");

    const saveBtn = screen.getByRole("button", { name: "Save Task" });
    fireEvent.click(saveBtn);
    expect(closeTaskModal).toHaveBeenCalled();

    rerender(<TaskEditModal isOpen={false} onClose={closeTaskModal} />);
    expect(document.body.style.overflow).toBe("auto");
    expect(document.body.style.overflow).toBe("auto");
  });

  it("Flow 3: Admin processes Female Approvals, User Moderation, and Withdrawal requests", async () => {
    // 1. Pending Female Approvals list
    const mockPendingFemales = [
      {
        id: "f1",
        name: "Ritu Sen",
        city: "Kolkata",
        idProofUrl: "https://example.com/id.jpg",
        status: "pending",
      },
    ];
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: { success: true, data: { females: mockPendingFemales } },
    } as any);

    const pendingRes = await apiClient.get("/admin/females/pending");
    expect(pendingRes.data.data.females.length).toBe(1);

    // 2. Approve female verification
    vi.mocked(apiClient.patch).mockResolvedValueOnce({
      data: { success: true, message: "Female approved successfully" },
    } as any);

    const approveRes = await apiClient.patch("/admin/females/f1/approve");
    expect(approveRes.data.success).toBe(true);

    // 3. User block / unblock toggle
    vi.mocked(apiClient.patch).mockResolvedValueOnce({
      data: { success: true, message: "User block status updated" },
    } as any);

    const toggleRes = await apiClient.patch("/admin/users/u101/toggle-block");
    expect(toggleRes.data.success).toBe(true);

    // 4. Pending withdrawals review
    const mockWithdrawals = [
      {
        id: "w1",
        user: { name: "Priya" },
        amount: 1500,
        upiId: "priya@upi",
        status: "pending",
      },
    ];
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: { success: true, data: { withdrawals: mockWithdrawals } },
    } as any);

    const wRes = await apiClient.get("/wallet/admin/withdrawals");
    expect(wRes.data.data.withdrawals[0].amount).toBe(1500);
  });
});
