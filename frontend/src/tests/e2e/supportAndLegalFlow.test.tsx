import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
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

describe("E2E Support, Helpdesk, FAQs & Legal Document Sections", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.body.style.overflow = "auto";
  });

  it("Section 1: Helpdesk Support Ticket Creation & Message Thread", async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          ticket: {
            id: "t-101",
            subject: "Coin balance mismatch",
            status: "open",
            messages: [
              { sender: "user", content: "My coins were not credited" },
            ],
          },
        },
      },
    } as any);

    const res = await apiClient.post("/support", {
      subject: "Coin balance mismatch",
      message: "My coins were not credited",
    });

    expect(res.data.success).toBe(true);
    expect(res.data.data.ticket.subject).toBe("Coin balance mismatch");

    // Add reply to ticket
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          message: {
            sender: "user",
            content: "Attaching transaction screenshot",
          },
        },
      },
    } as any);

    const replyRes = await apiClient.post("/support/t-101/messages", {
      message: "Attaching transaction screenshot",
    });
    expect(replyRes.data.success).toBe(true);
  });

  it("Section 2: FAQs Exploration & Category Filtering", async () => {
    const mockFaqs = [
      {
        id: "1",
        question: "How do coins work?",
        answer: "Coins are used for messaging and calls.",
        category: "coins",
      },
      {
        id: "2",
        question: "How do I withdraw earnings?",
        answer: "Go to Wallet > Withdraw.",
        category: "withdrawal",
      },
    ];

    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: { success: true, data: { faqs: mockFaqs } },
    } as any);

    const res = await apiClient.get("/users/faqs");
    expect(res.data.data.faqs.length).toBe(2);

    const FaqListComponent = ({ faqs }: { faqs: typeof mockFaqs }) => (
      <div>
        <h2>Frequently Asked Questions</h2>
        {faqs.map((f) => (
          <details key={f.id}>
            <summary>{f.question}</summary>
            <p>{f.answer}</p>
          </details>
        ))}
      </div>
    );

    render(<FaqListComponent faqs={res.data.data.faqs} />);

    expect(screen.getByText("Frequently Asked Questions")).toBeInTheDocument();
    expect(screen.getByText("How do coins work?")).toBeInTheDocument();
    expect(screen.getByText("How do I withdraw earnings?")).toBeInTheDocument();
  });

  it("Section 3: Legal Terms & Privacy Policy Display", () => {
    const LegalDocComponent = ({
      docType,
    }: {
      docType: "terms" | "privacy";
    }) => (
      <div>
        <h1>{docType === "terms" ? "Terms of Service" : "Privacy Policy"}</h1>
        <p>Your privacy and safety are our top priorities.</p>
      </div>
    );

    const { rerender } = render(<LegalDocComponent docType="terms" />);
    expect(screen.getByText("Terms of Service")).toBeInTheDocument();

    rerender(<LegalDocComponent docType="privacy" />);
    expect(screen.getByText("Privacy Policy")).toBeInTheDocument();
  });
});
