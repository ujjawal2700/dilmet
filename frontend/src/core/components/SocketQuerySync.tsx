import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import socketService from '../services/socket.service';
import { CHAT_KEYS } from '../queries/useChatQuery';
import { DISCOVERY_KEYS } from '../queries/useDiscoveryQuery';

/**
 * SocketQuerySync - Global component to sync real-time socket events with TanStack Query cache.
 * This ensures that online status updates are reflected across all components instantly
 * without requiring a full page refresh or query invalidation (surgical updates).
 */
export const SocketQuerySync = () => {
    const queryClient = useQueryClient();

    useEffect(() => {
        // Handle user going online
        const handleUserOnline = (data: { userId: string }) => {
            const userId = String(data?.userId || '');
            if (!userId) return;

            console.log(`[SocketQuerySync] User online: ${userId}`);

            // 1. Update Chat List Cache
            queryClient.setQueriesData({ queryKey: CHAT_KEYS.lists() }, (oldData: any) => {
                if (!oldData || !Array.isArray(oldData)) return oldData;
                return oldData.map((chat: any) => {
                    const otherId = String(chat.otherUser?._id || chat.otherUser?.id || chat.userId || '');
                    if (otherId === userId) {
                        return {
                            ...chat,
                            isOnline: true,
                            otherUser: { ...chat.otherUser, isOnline: true }
                        };
                    }
                    return chat;
                });
            });

            // 2. Update Discovery List Cache
            queryClient.setQueriesData({ queryKey: DISCOVERY_KEYS.all }, (oldData: any) => {
                if (!oldData) return oldData;

                const updateProfiles = (profiles: any[]) => {
                    return profiles.map((p: any) => {
                        const pid = String(p.id || p._id || '');
                        if (pid === userId) {
                            return { ...p, isOnline: true };
                        }
                        return p;
                    });
                };

                if (Array.isArray(oldData)) return updateProfiles(oldData);
                if (oldData.profiles && Array.isArray(oldData.profiles)) {
                    return { ...oldData, profiles: updateProfiles(oldData.profiles) };
                }
                return oldData;
            });

            // 3. Update specific Chat Detail if it exists
            queryClient.setQueriesData({ queryKey: ['chats', 'detail'] }, (oldData: any) => {
                if (!oldData || !oldData.otherUser) return oldData;
                const otherId = String(oldData.otherUser._id || oldData.otherUser.id || '');
                if (otherId === userId) {
                    return {
                        ...oldData,
                        isOnline: true,
                        otherUser: { ...oldData.otherUser, isOnline: true }
                    };
                }
                return oldData;
            });
        };

        // Handle user going offline
        const handleUserOffline = (data: { userId: string; lastSeen?: string }) => {
            const userId = String(data?.userId || '');
            if (!userId) return;

            console.log(`[SocketQuerySync] User offline: ${userId}`);

            const lastSeenDate = data.lastSeen || new Date().toISOString();

            // 1. Update Chat List Cache
            queryClient.setQueriesData({ queryKey: CHAT_KEYS.lists() }, (oldData: any) => {
                if (!oldData || !Array.isArray(oldData)) return oldData;
                return oldData.map((chat: any) => {
                    const otherId = String(chat.otherUser?._id || chat.otherUser?.id || chat.userId || '');
                    if (otherId === userId) {
                        return {
                            ...chat,
                            isOnline: false,
                            otherUser: { ...chat.otherUser, isOnline: false, lastSeen: lastSeenDate }
                        };
                    }
                    return chat;
                });
            });

            // 2. Update Discovery List Cache
            queryClient.setQueriesData({ queryKey: DISCOVERY_KEYS.all }, (oldData: any) => {
                if (!oldData) return oldData;

                const updateProfiles = (profiles: any[]) => {
                    return profiles.map((p: any) => {
                        const pid = String(p.id || p._id || '');
                        if (pid === userId) {
                            return { ...p, isOnline: false, lastSeen: lastSeenDate };
                        }
                        return p;
                    });
                };

                if (Array.isArray(oldData)) return updateProfiles(oldData);
                if (oldData.profiles && Array.isArray(oldData.profiles)) {
                    return { ...oldData, profiles: updateProfiles(oldData.profiles) };
                }
                return oldData;
            });

            // 3. Update specific Chat Detail if it exists
            queryClient.setQueriesData({ queryKey: ['chats', 'detail'] }, (oldData: any) => {
                if (!oldData || !oldData.otherUser) return oldData;
                const otherId = String(oldData.otherUser._id || oldData.otherUser.id || '');
                if (otherId === userId) {
                    return {
                        ...oldData,
                        isOnline: false,
                        otherUser: { ...oldData.otherUser, isOnline: false, lastSeen: lastSeenDate }
                    };
                }
                return oldData;
            });
        };

        // Handle real-time status response query
        const handleUserStatusResponse = (data: { userId: string; isOnline: boolean; lastSeen?: string }) => {
            if (!data?.userId) return;
            if (data.isOnline) {
                handleUserOnline({ userId: data.userId });
            } else {
                handleUserOffline({ userId: data.userId, lastSeen: data.lastSeen });
            }
        };

        // Handle new message (implicitly means sender is online & update chat previews)
        const handleNewMessage = (data: { chatId: string; message: any }) => {
            if (!data?.message) return;
            const senderId = typeof data.message.senderId === 'object'
                ? data.message.senderId._id || data.message.senderId.id
                : data.message.senderId;

            if (senderId) {
                handleUserOnline({ userId: String(senderId) });
            }

            const chatId = String(data.chatId || data.message.chatId || '');
            if (chatId) {
                // Update chat item in list cache
                queryClient.setQueriesData({ queryKey: CHAT_KEYS.lists() }, (oldData: any) => {
                    if (!oldData || !Array.isArray(oldData)) return oldData;
                    return oldData.map((chat: any) => {
                        if (String(chat._id || chat.id) === chatId) {
                            return {
                                ...chat,
                                lastMessage: data.message,
                                lastMessageAt: data.message.createdAt || new Date().toISOString(),
                                hasUnread: true,
                                unreadCount: (chat.unreadCount || 0) + 1,
                            };
                        }
                        return chat;
                    });
                });
                queryClient.invalidateQueries({ queryKey: CHAT_KEYS.lists() });
            }
        };

        // Subscribe to socket events
        socketService.on('user:online', handleUserOnline);
        socketService.on('user:offline', handleUserOffline);
        socketService.on('user:status:response', handleUserStatusResponse);
        socketService.on('message:new', handleNewMessage);
        socketService.on('message:notification', handleNewMessage);

        return () => {
            // Unsubscribe on unmount
            socketService.off('user:online', handleUserOnline);
            socketService.off('user:offline', handleUserOffline);
            socketService.off('user:status:response', handleUserStatusResponse);
            socketService.off('message:new', handleNewMessage);
            socketService.off('message:notification', handleNewMessage);
        };
    }, [queryClient]);

    return null; // This component doesn't render anything
};
