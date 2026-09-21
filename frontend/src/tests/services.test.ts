import { describe, it, expect, vi, beforeEach } from 'vitest';
import apiClient from '../core/api/client';
import * as taskService from '../core/services/task.service';
import * as chatService from '../core/services/chat.service';

vi.mock('../core/api/client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}));

describe('Frontend Services & Task Completion Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Task Service', () => {
    it('getMyTasks retrieves and returns user tasks', async () => {
      const mockTasks = [
        { id: '1', taskKey: 'daily_checkin', title: 'Daily Check-in', isCompleted: false },
      ];
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: { data: { tasks: mockTasks } },
      } as any);

      const tasks = await taskService.getMyTasks();
      expect(apiClient.get).toHaveBeenCalledWith('/tasks');
      expect(tasks).toEqual(mockTasks);
    });

    it('checkin dispatches app:task:completed when completedTask is returned', async () => {
      const completedTaskData = {
        taskKey: 'daily_checkin',
        title: 'Daily Check-in',
        rewardCoins: 20,
        newBalance: 120,
      };

      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: {
          data: {
            tasks: [],
            completedTask: completedTaskData,
          },
        },
      } as any);

      const eventSpy = vi.fn();
      window.addEventListener('app:task:completed', eventSpy);

      const res = await taskService.checkin();
      expect(apiClient.post).toHaveBeenCalledWith('/tasks/checkin');
      expect(res.completedTask).toEqual(completedTaskData);
      expect(eventSpy).toHaveBeenCalled();
      window.removeEventListener('app:task:completed', eventSpy);
    });
  });

  describe('Chat Service', () => {
    it('sendMessage posts message and dispatches app:task:completed if task was achieved', async () => {
      const completedTaskData = {
        taskKey: 'message_distinct_users',
        title: 'Message 3 Friends',
        rewardCoins: 30,
        newBalance: 150,
      };

      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: {
          data: {
            message: { id: 'm1', content: 'Hello' },
            completedTask: completedTaskData,
          },
        },
      } as any);

      const eventSpy = vi.fn();
      window.addEventListener('app:task:completed', eventSpy);

      const res = await chatService.sendMessage('chat-123', 'Hello');
      expect(apiClient.post).toHaveBeenCalledWith('/chat/messages', {
        chatId: 'chat-123',
        content: 'Hello',
        messageType: 'text',
      });
      expect(res.message.content).toBe('Hello');
      expect(eventSpy).toHaveBeenCalled();
      window.removeEventListener('app:task:completed', eventSpy);
    });

    it('sendHiMessage posts hi message and dispatches app:task:completed if completed', async () => {
      const completedTaskData = {
        taskKey: 'send_hi_3_times',
        title: 'Say Hi',
        rewardCoins: 15,
        newBalance: 135,
      };

      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: {
          data: {
            success: true,
            completedTask: completedTaskData,
          },
        },
      } as any);

      const eventSpy = vi.fn();
      window.addEventListener('app:task:completed', eventSpy);

      const res = await chatService.sendHiMessage('user-999');
      expect(apiClient.post).toHaveBeenCalledWith('/chat/messages/hi', { receiverId: 'user-999' });
      expect(res.success).toBe(true);
      expect(eventSpy).toHaveBeenCalled();
      window.removeEventListener('app:task:completed', eventSpy);
    });
  });
});

