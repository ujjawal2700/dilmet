import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { DailyRewardModal } from "../shared/components/DailyRewardModal";

// Mock translation hook
vi.mock("../core/hooks/useTranslation", () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback || key,
    language: "en",
    changeLanguage: vi.fn(),
  }),
}));

describe("DailyRewardModal Component", () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    document.body.style.overflow = "auto";
  });

  it("renders nothing when isOpen is false", () => {
    const { container } = render(
      <DailyRewardModal
        isOpen={false}
        onClose={mockOnClose}
        coinsAwarded={50}
        newBalance={150}
      />,
    );
    expect(container.firstChild).toBeNull();
    expect(document.body.style.overflow).toBe("auto");
  });

  it("renders reward details, locks body scroll, and calls onClose when action clicked", () => {
    render(
      <DailyRewardModal
        isOpen={true}
        onClose={mockOnClose}
        coinsAwarded={50}
        newBalance={150}
      />,
    );

    // Check reward text
    expect(screen.getByText(/\+50/)).toBeInTheDocument();
    expect(screen.getByText(/150/)).toBeInTheDocument();

    // Body scroll must be locked
    expect(document.body.style.overflow).toBe("hidden");

    // Click Continue / Awesome button
    const claimButton = screen.getByRole("button", { name: /awesome/i });
    fireEvent.click(claimButton);
    expect(mockOnClose).toHaveBeenCalled();
  });
});
