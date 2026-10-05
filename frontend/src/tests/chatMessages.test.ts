import { describe, expect, it } from "vitest";
import { mergeChatMessages } from "../core/utils/chatMessages";

describe("mergeChatMessages", () => {
  it("keeps a socket message that arrived while an older HTTP snapshot was loading", () => {
    const live = {
      _id: "m2",
      senderId: "female",
      content: "just arrived",
      messageType: "text",
      createdAt: "2026-10-05T10:00:02.000Z",
    };
    const snapshot = [
      {
        _id: "m1",
        senderId: "male",
        content: "older",
        messageType: "text",
        createdAt: "2026-10-05T10:00:01.000Z",
      },
    ];

    expect(mergeChatMessages(snapshot, [live]).map((message) => message._id)).toEqual([
      "m1",
      "m2",
    ]);
  });

  it("replaces the matching optimistic message with the persisted message", () => {
    const optimistic = {
      _id: "temp_1",
      senderId: "female",
      content: "hello",
      messageType: "text",
      createdAt: "2026-10-05T10:00:00.000Z",
    };
    const persisted = {
      _id: "server_1",
      senderId: { _id: "female" },
      content: "hello",
      messageType: "text",
      createdAt: "2026-10-05T10:00:01.000Z",
    };

    expect(mergeChatMessages<any>([persisted], [optimistic])).toEqual([
      persisted,
    ]);
  });
});
