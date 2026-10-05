type MessageLike = {
  _id?: string;
  id?: string;
  createdAt?: string | Date;
  senderId?: string | { _id?: string; id?: string };
  content?: string;
  messageType?: string;
  type?: string;
};

const messageId = (message: MessageLike): string =>
  String(message?._id || message?.id || "");

const senderId = (message: MessageLike): string =>
  String(
    typeof message.senderId === "object"
      ? message.senderId?._id || message.senderId?.id || ""
      : message.senderId || "",
  );

const isMatchingOptimisticMessage = (
  optimistic: MessageLike,
  persisted: MessageLike,
): boolean =>
  messageId(optimistic).startsWith("temp_") &&
  senderId(optimistic) === senderId(persisted) &&
  optimistic.content === persisted.content &&
  (optimistic.messageType || optimistic.type) ===
    (persisted.messageType || persisted.type);

/**
 * Merge an HTTP snapshot with messages that may have arrived over the socket
 * while that request was in flight. The snapshot wins for matching IDs (it can
 * contain newer delivery/read state), while socket-only and optimistic entries
 * are retained.
 */
export const mergeChatMessages = <T extends MessageLike>(
  snapshot: T[],
  current: T[],
): T[] => {
  const merged = new Map<string, T>();

  current.forEach((message, index) => {
    const id = messageId(message) || `current:${index}`;
    merged.set(id, message);
  });

  snapshot.forEach((message, index) => {
    const id = messageId(message) || `snapshot:${index}`;
    for (const [existingId, existing] of merged) {
      if (isMatchingOptimisticMessage(existing, message)) {
        merged.delete(existingId);
        break;
      }
    }
    merged.set(id, message);
  });

  return Array.from(merged.values()).sort((a, b) => {
    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return aTime - bTime;
  });
};
