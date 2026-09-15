/**
 * Auto Message Service
 * @owner: Sujal (User Domain)
 * @purpose: Handle auto-message template management for female users
 */

import apiClient from '../api/client';
import type { AutoMessageTemplate } from '../../module/female/types/female.types';

interface AutoMessageStats {
    templates: number;
    enabledTemplates: number;
    todaySent: number;
    remainingToday: number;
    totalSent: number;
}

interface CreateTemplateData {
    name: string;
    content: string;
    isEnabled?: boolean;
}

interface UpdateTemplateData {
    name?: string;
    content?: string;
    isEnabled?: boolean;
}

class AutoMessageService {
    /**
     * Get all auto-message templates for the current female user
     */
    async getTemplates(): Promise<AutoMessageTemplate[]> {
        try {
            const response = await apiClient.get('/users/female/auto-messages');
            return response.data.data;
        } catch (error) {
            console.error('Error fetching auto-message templates:', error);
            throw error;
        }
    }

    /**
     * Create a new auto-message template
     */
    async createTemplate(data: CreateTemplateData): Promise<AutoMessageTemplate> {
        try {
            const response = await apiClient.post('/users/female/auto-messages', data);
            return response.data.data;
        } catch (error) {
            console.error('Error creating auto-message template:', error);
            throw error;
        }
    }

    /**
     * Update an existing auto-message template
     */
    async updateTemplate(templateId: string, data: UpdateTemplateData): Promise<AutoMessageTemplate> {
        try {
            const response = await apiClient.put(`/users/female/auto-messages/${templateId}`, data);
            return response.data.data;
        } catch (error) {
            console.error('Error updating auto-message template:', error);
            throw error;
        }
    }

    /**
     * Delete an auto-message template
     */
    async deleteTemplate(templateId: string): Promise<void> {
        try {
            await apiClient.delete(`/users/female/auto-messages/${templateId}`);
        } catch (error) {
            console.error('Error deleting auto-message template:', error);
            throw error;
        }
    }

    /**
     * Get auto-message statistics
     */
    async getStats(): Promise<AutoMessageStats> {
        try {
            const response = await apiClient.get('/users/female/auto-messages/stats');
            return response.data.data;
        } catch (error) {
            console.error('Error fetching auto-message stats:', error);
            throw error;
        }
    }
}

export default new AutoMessageService();
