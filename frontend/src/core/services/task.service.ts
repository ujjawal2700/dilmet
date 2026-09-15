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
    return response.data.data.tasks;
};

export const checkin = async (): Promise<DailyTask[]> => {
    const response = await apiClient.post('/tasks/checkin');
    return response.data.data.tasks;
};

export default { getMyTasks, checkin };
