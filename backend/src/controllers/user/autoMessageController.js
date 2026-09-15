/**
 * Auto Message Controller
 * @owner: Sujal (User Domain)
 * @purpose: Handle auto-message template CRUD operations
 */

import autoMessageService from '../../services/user/autoMessageService.js';
import logger from '../../utils/logger.js';

class AutoMessageController {
    /**
     * GET /api/female/auto-messages
     * Get all auto-message templates for the authenticated female user
     */
    async getTemplates(req, res) {
        try {
            const userId = req.user.id;
            const templates = await autoMessageService.getTemplates(userId);

            res.status(200).json({
                success: true,
                data: templates,
            });
        } catch (error) {
            logger.error(`❌ Error in getTemplates: ${error.message}`);
            res.status(500).json({
                success: false,
                error: error.message,
            });
        }
    }

    /**
     * POST /api/female/auto-messages
     * Create a new auto-message template
     */
    async createTemplate(req, res) {
        try {
            const userId = req.user.id;
            const { name, content, isEnabled } = req.body;

            // Validation
            if (!name || !content) {
                return res.status(400).json({
                    success: false,
                    error: 'Name and content are required',
                });
            }

            if (content.length > 500) {
                return res.status(400).json({
                    success: false,
                    error: 'Content cannot exceed 500 characters',
                });
            }

            const template = await autoMessageService.createTemplate(userId, {
                name,
                content,
                isEnabled,
            });

            res.status(201).json({
                success: true,
                data: template,
            });
        } catch (error) {
            logger.error(`❌ Error in createTemplate: ${error.message}`);
            res.status(500).json({
                success: false,
                error: error.message,
            });
        }
    }

    /**
     * PUT /api/female/auto-messages/:id
     * Update an auto-message template
     */
    async updateTemplate(req, res) {
        try {
            const userId = req.user.id;
            const templateId = req.params.id;
            const updateData = req.body;

            // Validation
            if (updateData.content && updateData.content.length > 500) {
                return res.status(400).json({
                    success: false,
                    error: 'Content cannot exceed 500 characters',
                });
            }

            const template = await autoMessageService.updateTemplate(
                userId,
                templateId,
                updateData
            );

            res.status(200).json({
                success: true,
                data: template,
            });
        } catch (error) {
            logger.error(`❌ Error in updateTemplate: ${error.message}`);

            if (error.message.includes('not found') || error.message.includes('unauthorized')) {
                return res.status(404).json({
                    success: false,
                    error: error.message,
                });
            }

            res.status(500).json({
                success: false,
                error: error.message,
            });
        }
    }

    /**
     * DELETE /api/female/auto-messages/:id
     * Delete an auto-message template
     */
    async deleteTemplate(req, res) {
        try {
            const userId = req.user.id;
            const templateId = req.params.id;

            await autoMessageService.deleteTemplate(userId, templateId);

            res.status(200).json({
                success: true,
                message: 'Template deleted successfully',
            });
        } catch (error) {
            logger.error(`❌ Error in deleteTemplate: ${error.message}`);

            if (error.message.includes('not found') || error.message.includes('unauthorized')) {
                return res.status(404).json({
                    success: false,
                    error: error.message,
                });
            }

            res.status(500).json({
                success: false,
                error: error.message,
            });
        }
    }

    /**
     * GET /api/female/auto-messages/stats
     * Get auto-message statistics for the authenticated female user
     */
    async getStats(req, res) {
        try {
            const userId = req.user.id;
            const stats = await autoMessageService.getStats(userId);

            res.status(200).json({
                success: true,
                data: stats,
            });
        } catch (error) {
            logger.error(`❌ Error in getStats: ${error.message}`);
            res.status(500).json({
                success: false,
                error: error.message,
            });
        }
    }
}

export default new AutoMessageController();
