/**
 * Global State Context - Centralized state management with Socket.IO sync
 * @purpose: Cache user data, balance, and sync via WebSocket for real-time updates
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
  useMemo,
  useRef,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { CHAT_KEYS } from "../queries/useChatQuery";
import { UserProfile } from "../types/global";
import socketService from "../services/socket.service";
import walletService from "../services/wallet.service";
import indexedDBCache from "../services/indexedDB.service";
import { useAuth } from "./AuthContext";
import { mapUserToProfile } from "../utils/auth";
import { audioManager } from "../utils/audioManager";

interface GlobalState {
  user: UserProfile | null;
  coinBalance: number;
  isConnected: boolean;

  // Actions
  setUser: (user: any | null) => void;
  updateBalance: (balance: number) => void;
  refreshBalance: () => Promise<void>;
  logout: () => void;
  addNotification: (
    notification: Omit<InAppNotification, "id" | "timestamp" | "isRead">,
  ) => void;
  clearNotification: (id: string) => void;
  notifications: InAppNotification[]; // Toast/Temporary
  persistentNotifications: InAppNotification[]; // List/Persistent
  unreadCount: number;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  deletePersistentNotification: (id: string) => void;
  clearAllPersistentNotifications: () => void;
  chatCache: Record<string, any[]>;
  saveToChatCache: (chatId: string, messages: any[]) => void;
  loadFromChatCache: (chatId: string) => Promise<any[]>;
  appSettings: any | null;
  sessionStartTime: Date;
  completedTask:
    | import("../../shared/components/TaskCompletedModal").CompletedTaskInfo
    | null;
  clearCompletedTask: () => void;
  showTaskCompletedModal: (
    task: import("../../shared/components/TaskCompletedModal").CompletedTaskInfo,
  ) => void;
}

export interface InAppNotification {
  id: string;
  title: string;
  message: string;
  type: "message" | "system" | "gift" | "match" | "payment";
  chatId?: string;
  userId?: string;
  avatar?: string;
  timestamp: Date;
  isRead: boolean;
}

const GlobalStateContext = createContext<GlobalState | undefined>(undefined);

// Local storage keys
const STORAGE_KEYS = {
  USER: "dil_mate_user",
  TOKEN: "dil_mate_auth_token",
  BALANCE_CACHE: "dil_mate_balance_cache",
  CHAT_CACHE: "dil_mate_chat_cache",
  NOTIFICATIONS: "dil_mate_notifications_persistent",
};

interface GlobalStateProviderProps {
  children: ReactNode;
}

export const GlobalStateProvider = ({ children }: GlobalStateProviderProps) => {
  const { user, updateUser } = useAuth();
  const queryClient = useQueryClient();

  const [coinBalance, setCoinBalance] = useState<number>(() => {
    // Initialize from cache
    try {
      const cached = localStorage.getItem(STORAGE_KEYS.BALANCE_CACHE);
      return cached ? parseInt(cached, 10) : 0;
    } catch {
      return 0;
    }
  });

  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<InAppNotification[]>([]); // Toasts
  const [persistentNotifications, setPersistentNotifications] = useState<
    InAppNotification[]
  >(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      if (cached) {
        const parsed = JSON.parse(cached);
        return parsed.map((n: any) => ({
          ...n,
          title:
            typeof n.title === "string" && n.title !== "[object Object]"
              ? n.title
              : n.senderName || "Notification",
          message:
            typeof n.message === "string" && n.message !== "[object Object]"
              ? n.message
              : n.message?.content ||
                n.message?.text ||
                "You received a new message",
          timestamp: new Date(n.timestamp),
        }));
      }
    } catch (e) {
      console.error("Failed to load notifications from cache:", e);
    }
    return [];
  });
  const [sessionStartTime] = useState(() => new Date());
  const [chatCache, setChatCache] = useState<Record<string, any[]>>({});
  const [appSettings, setAppSettings] = useState<any | null>(null);
  const [completedTask, setCompletedTask] = useState<
    | import("../../shared/components/TaskCompletedModal").CompletedTaskInfo
    | null
  >(null);
  const clearCompletedTask = useCallback(() => setCompletedTask(null), []);

  // Fetch app settings
  const refreshSettings = useCallback(async () => {
    try {
      const { configService } = await import("../services/config.service");
      // getConfig() respects the 5-minute in-memory cache - avoids an
      // unnecessary /users/config network call if settings were already
      // fetched recently (e.g. on a provider remount).
      const config = await configService.getConfig();
      setAppSettings(config);
    } catch (error) {
      console.error("Failed to refresh app settings:", error);
    }
  }, []);

  // Load chat cache from IndexedDB on mount (non-blocking)
  useEffect(() => {
    // This runs in background, doesn't block UI
    const loadChatCache = async () => {
      try {
        const stats = await indexedDBCache.getStats();
        console.log(
          `📦 IndexedDB cache: ${stats.chatCount} chats, ${stats.messageCount} messages`,
        );
      } catch (e) {
        console.warn("IndexedDB not available, using memory-only cache");
      }
    };
    loadChatCache();
    refreshSettings();
  }, [refreshSettings]);

  const addNotification = useCallback(
    (notification: Omit<InAppNotification, "id" | "timestamp" | "isRead">) => {
      const id = Math.random().toString(36).substr(2, 9);
      const newNotif: InAppNotification = {
        ...notification,
        id,
        timestamp: new Date(),
        isRead: false,
      };

      // Add to toasts
      setNotifications((prev) => [...prev, newNotif]);

      // Add to persistent list (Limit to 10 latest)
      setPersistentNotifications((prev) => {
        const updated = [newNotif, ...prev].slice(0, 10);
        localStorage.setItem(
          STORAGE_KEYS.NOTIFICATIONS,
          JSON.stringify(updated),
        );
        return updated;
      });

      // Play notification sound
      audioManager.playNotification();

      // Auto-remove toast after 5 seconds
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }, 5000);
    },
    [],
  );

  const clearNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const markNotificationAsRead = useCallback((id: string) => {
    setPersistentNotifications((prev) => {
      const updated = prev.map((n) =>
        n.id === id ? { ...n, isRead: true } : n,
      );
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setPersistentNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, isRead: true }));
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const deletePersistentNotification = useCallback((id: string) => {
    setPersistentNotifications((prev) => {
      const updated = prev.filter((n) => n.id !== id);
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearAllPersistentNotifications = useCallback(() => {
    setPersistentNotifications([]);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
  }, []);

  const unreadCount = persistentNotifications.filter((n) => !n.isRead).length;

  const saveToChatCache = useCallback((chatId: string, messages: any[]) => {
    const trimmedMessages = messages.slice(-100); // Keep last 100 messages

    // Update in-memory state
    setChatCache((prev) => ({
      ...prev,
      [chatId]: trimmedMessages,
    }));

    // Persist to IndexedDB (non-blocking)
    indexedDBCache.saveChatMessages(chatId, trimmedMessages).catch((e) => {
      console.warn("Failed to persist chat to IndexedDB:", e);
    });
  }, []);

  // Function to load messages from IndexedDB cache
  const loadFromChatCache = useCallback(
    async (chatId: string): Promise<any[]> => {
      // First check in-memory cache
      if (chatCache[chatId]) {
        return chatCache[chatId];
      }

      // Then try IndexedDB
      try {
        const messages = await indexedDBCache.getChatMessages(chatId);
        if (messages.length > 0) {
          // Update in-memory cache
          setChatCache((prev) => ({ ...prev, [chatId]: messages }));
        }
        return messages;
      } catch (e) {
        return [];
      }
    },
    [chatCache],
  );

  // Update user and persist to localStorage
  // setUser mapping
  const setUser = useCallback(
    (newUser: any | null) => {
      if (newUser) {
        updateUser(mapUserToProfile(newUser));
      }
    },
    [updateUser],
  );

  // Update balance and cache
  const updateBalance = useCallback((balance: number) => {
    setCoinBalance(balance);
    localStorage.setItem(STORAGE_KEYS.BALANCE_CACHE, String(balance));
  }, []);

  // Fetch fresh balance from API
  const refreshBalance = useCallback(async () => {
    try {
      const data = await walletService.getBalance();
      // Backend returns { balance: number }, not { coinBalance }
      updateBalance(data.balance || data.coinBalance || 0);
    } catch (error) {
      console.error("Failed to refresh balance:", error);
    }
  }, [updateBalance]);

  // Logout
  const logoutAction = useCallback(() => {
    socketService.disconnect();
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.BALANCE_CACHE);
    setCoinBalance(0);
    // AuthContext.logout will be handled by the logout button in components
  }, []);

  // 1. Handle balance updates - backend sends { balance: number }
  const handleBalanceUpdate = useCallback(
    (data: { balance: number }) => {
      updateBalance(data.balance);
    },
    [updateBalance],
  );

  // 2. Handle user updates
  const handleUserUpdate = useCallback(
    (data: any) => {
      if (data.userId === user?.id) {
        updateUser(mapUserToProfile(data));
      }
    },
    [user?.id, updateUser],
  );

  const lastCompletedTaskKeyRef = useRef<string>("");

  // Handle daily task completion - fires regardless of which page the
  // user is on, since the action that completes a task (sending a
  // message, a gift, etc.) can happen anywhere in the app.
  const handleTaskCompleted = useCallback(
    (
      data: import("../../shared/components/TaskCompletedModal").CompletedTaskInfo,
    ) => {
      if (!data || !data.taskKey) return;
      // Avoid duplicate triggers within 4 seconds
      if (lastCompletedTaskKeyRef.current === data.taskKey) return;
      lastCompletedTaskKeyRef.current = data.taskKey;
      setTimeout(() => {
        if (lastCompletedTaskKeyRef.current === data.taskKey) {
          lastCompletedTaskKeyRef.current = "";
        }
      }, 4000);

      if (typeof data.newBalance === "number") {
        setCoinBalance(data.newBalance);
      }
      setCompletedTask(data);
    },
    [],
  );

  // 3. Handle incoming messages/notifications (Optimized & Robust)
  const handleNewMessage = useCallback(
    (data: any) => {
      if (!user || !data) return;

      // Backend socket events can be:
      // { chatId, message: { _id, content, senderId, ... } }
      // or flat message { _id, content, chatId, senderId, ... }
      const msg =
        data.message && typeof data.message === "object" ? data.message : data;
      const chatId = data.chatId || msg.chatId || data._id || msg._id;

      // Extract sender info
      const senderObj = msg.senderId || msg.sender || data.sender;
      const senderId =
        (typeof senderObj === "object" ? senderObj?._id : senderObj) ||
        data.senderId ||
        msg.senderId;

      // Don't notify sender of their own messages
      if (senderId && String(senderId) === String(user.id)) return;

      // Extract sender name
      let senderName = "New Message";
      if (typeof senderObj === "object" && senderObj !== null) {
        senderName = senderObj.profile?.name || senderObj.name || senderName;
        if (senderObj.isAiCompanion) {
          senderName = senderObj.profile?.name || "AI Companion";
        }
      } else if (data.senderName && typeof data.senderName === "string") {
        senderName = data.senderName;
      }

      // Extract sender avatar
      let senderAvatar: string | undefined = undefined;
      if (typeof senderObj === "object" && senderObj !== null) {
        senderAvatar =
          senderObj.profile?.avatarUrl ||
          senderObj.profile?.photos?.find((p: any) => p.isPrimary)?.url ||
          senderObj.profile?.photos?.[0]?.url ||
          senderObj.avatarUrl ||
          senderObj.avatar;
      } else if (data.senderAvatar && typeof data.senderAvatar === "string") {
        senderAvatar = data.senderAvatar;
      }

      // Extract readable text content based on messageType
      let content = "You received a new message";
      const messageType = msg.messageType || data.messageType;
      if (messageType === "image") {
        content = "📷 Sent a photo";
      } else if (messageType === "gift") {
        const giftNames = (msg.gifts || msg.metadata?.gifts || [])
          .map((g: any) => g.giftName || g.name)
          .filter(Boolean);
        content =
          giftNames.length > 0
            ? `🎁 Sent ${giftNames.join(", ")}`
            : "🎁 Sent a gift";
      } else if (messageType === "video_call") {
        content = "📞 Video call";
      } else {
        const rawContent =
          msg.content !== undefined
            ? msg.content
            : data.content !== undefined
              ? data.content
              : typeof data.message === "string"
                ? data.message
                : "";
        if (
          typeof rawContent === "string" &&
          rawContent.trim().length > 0 &&
          rawContent !== "[object Object]"
        ) {
          content = rawContent.trim();
        } else if (typeof rawContent === "object" && rawContent !== null) {
          content =
            rawContent.content ||
            rawContent.text ||
            rawContent.message ||
            "You received a new message";
        }
      }

      const isInsideThisChat = window.location.pathname.includes(
        `/chat/${chatId}`,
      );

      if (!isInsideThisChat) {
        addNotification({
          title: senderName,
          message: content,
          type: messageType === "gift" ? "gift" : "message",
          chatId: chatId,
          avatar: senderAvatar,
        });
      }

      queryClient.invalidateQueries({ queryKey: CHAT_KEYS.lists() });
      if (chatId) {
        queryClient.invalidateQueries({ queryKey: CHAT_KEYS.messages(chatId) });
      }
    },
    [user, addNotification, queryClient],
  );

  // 4. Handle generic push/system notifications over socket
  const handleGenericNotification = useCallback(
    (data: any) => {
      if (!user || !data) return;
      const notif = data.notification || data;
      if (!notif) return;

      const title =
        typeof notif.title === "string" && notif.title !== "[object Object]"
          ? notif.title
          : "Notification";
      let message = "New update received";
      if (
        typeof notif.message === "string" &&
        notif.message !== "[object Object]"
      ) {
        message = notif.message;
      } else if (typeof notif.message === "object" && notif.message !== null) {
        message =
          notif.message.content || notif.message.text || "New update received";
      } else if (typeof notif.content === "string") {
        message = notif.content;
      }

      addNotification({
        title,
        message,
        type: notif.type || "system",
        chatId: notif.relatedChatId || notif.chatId,
        userId: notif.relatedUserId || notif.userId,
        avatar: notif.avatar,
      });
    },
    [user, addNotification],
  );

  // REAL-TIME DEFERRAL: Move socket connection to a separate, delayed effect
  // This prevents socket initialization from competing with the dashboard layout engine
  useEffect(() => {
    if (!user) {
      socketService.disconnect();
      setIsConnected(false);
      return;
    }

    let isMounted = true;
    let timeoutId: ReturnType<typeof setTimeout>;

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    // PHASED BOOT: Register listeners at 100ms — well before socket connects at 500ms.
    // This guarantees no event delivery gap on session start.
    timeoutId = setTimeout(() => {
      if (!isMounted) return;

      socketService.on("connect", handleConnect);
      socketService.on("disconnect", handleDisconnect);
      socketService.on("balance:update", handleBalanceUpdate);
      socketService.on("user:update", handleUserUpdate);
      socketService.on("message", handleNewMessage);
      socketService.on("chat:message", handleNewMessage);
      socketService.on("message:new", handleNewMessage);
      socketService.on("message:notification", handleNewMessage);
      socketService.on("notification:new", handleGenericNotification);
      socketService.on("notification", handleGenericNotification);
      socketService.on("task:completed", handleTaskCompleted);
    }, 100);

    const handleCustomTaskCompleted = (e: any) => {
      if (e.detail) handleTaskCompleted(e.detail);
    };
    window.addEventListener("app:task:completed", handleCustomTaskCompleted);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      window.removeEventListener(
        "app:task:completed",
        handleCustomTaskCompleted,
      );
      socketService.off("connect", handleConnect);
      socketService.off("disconnect", handleDisconnect);
      socketService.off("balance:update", handleBalanceUpdate);
      socketService.off("user:update", handleUserUpdate);
      socketService.off("message", handleNewMessage);
      socketService.off("chat:message", handleNewMessage);
      socketService.off("message:new", handleNewMessage);
      socketService.off("message:notification", handleNewMessage);
      socketService.off("notification:new", handleGenericNotification);
      socketService.off("notification", handleGenericNotification);
      socketService.off("task:completed", handleTaskCompleted);
    };
  }, [
    user?.id,
    handleBalanceUpdate,
    handleUserUpdate,
    handleNewMessage,
    handleGenericNotification,
    handleTaskCompleted,
  ]);

  // Background profile/balance sync - move to a lower priority (2 seconds delay)
  useEffect(() => {
    if (!user) return;
    const timeout = setTimeout(() => {
      refreshBalance();
    }, 2000);
    return () => clearTimeout(timeout);
  }, [user?.id, refreshBalance]);

  // Daily Tasks check-in - fired once per app load for male users, well
  // after the socket has connected (~100-600ms) so a same-instant
  // task-completion popup (e.g. the check-in task itself) can arrive live.
  useEffect(() => {
    if (!user || user.role !== "male") return;
    const timeout = setTimeout(() => {
      import("../services/task.service").then(({ default: taskService }) => {
        taskService
          .checkin()
          .then((res: any) => {
            if (res?.completedTask) {
              handleTaskCompleted(res.completedTask);
            }
          })
          .catch((e) => console.error("Daily task check-in failed:", e));
      });
    }, 2200);
    return () => clearTimeout(timeout);
  }, [user?.id, user?.role, handleTaskCompleted]);

  const value = useMemo(
    () => ({
      user,
      coinBalance,
      isConnected,
      setUser,
      updateBalance,
      refreshBalance,
      logout: logoutAction,
      notifications,
      persistentNotifications,
      unreadCount,
      addNotification,
      clearNotification,
      markNotificationAsRead,
      markAllNotificationsRead,
      deletePersistentNotification,
      clearAllPersistentNotifications,
      chatCache,
      saveToChatCache,
      loadFromChatCache,
      appSettings,
      sessionStartTime,
      completedTask,
      clearCompletedTask,
      showTaskCompletedModal: handleTaskCompleted,
    }),
    [
      user,
      coinBalance,
      isConnected,
      setUser,
      updateBalance,
      refreshBalance,
      logoutAction,
      notifications,
      persistentNotifications,
      unreadCount,
      addNotification,
      clearNotification,
      markNotificationAsRead,
      markAllNotificationsRead,
      deletePersistentNotification,
      clearAllPersistentNotifications,
      chatCache,
      saveToChatCache,
      loadFromChatCache,
      appSettings,
      sessionStartTime,
      completedTask,
      clearCompletedTask,
      handleTaskCompleted,
    ],
  );

  return (
    <GlobalStateContext.Provider value={value}>
      {children}
    </GlobalStateContext.Provider>
  );
};

export const useGlobalState = (): GlobalState => {
  const context = useContext(GlobalStateContext);
  if (context === undefined) {
    throw new Error("useGlobalState must be used within a GlobalStateProvider");
  }
  return context;
};

export default GlobalStateContext;
