import apiClient from '../api/client';

export interface DailyTask {
    id: string;
    taskKey: string;
    title: string;
    description: string;
    type: 'checkin' | 'message_distinct_users' | 'send_gift';
    targetCount: number;
    rewardCoins: number;
    icon: string;
    deepLink: string;
    progressCount: number;
    isCompleted: boolean;
    completedAt: string | null;
}

export const getMyTasks = async (): Promise<DailyTask[]> => {
    const response = await apiClient.get('/tasks');
    return response.data?.data?.tasks || [];
};

export const checkin = async (): Promise<{ tasks: DailyTask[]; completedTask?: any }> => {
    const response = await apiClient.post('/tasks/checkin');
    const data = response.data?.data;
    if (data?.completedTask) {
        window.dispatchEvent(new CustomEvent('app:task:completed', { detail: data.completedTask }));
    }
    if (data && Array.isArray(data.tasks)) {
        return data;
    }
    if (Array.isArray(data)) {
        return { tasks: data };
    }
    return { tasks: [] };
};

export default { getMyTasks, checkin };

