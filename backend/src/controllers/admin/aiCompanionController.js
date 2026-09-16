/**
 * AI Companion Admin Controller
 * @purpose: Admin CRUD for AI companion accounts and their personas
 */

import aiCompanionService from '../../services/ai/aiCompanionService.js';
import { isGeminiConfigured } from '../../services/ai/geminiClient.js';
import * as imageUploadService from '../../services/upload/imageUploadService.js';
import { BadRequestError, NotFoundError } from '../../utils/errors.js';

const LANGUAGE_STYLES = ['mirror', 'hinglish', 'hindi', 'english'];

// Upload any base64 photos to Cloudinary; keep plain URLs as they are
const resolvePhotos = async (photos) => {
    if (!Array.isArray(photos)) return undefined;
    const urls = await Promise.all(photos.slice(0, 6).map(async (p) => {
        if (typeof p !== 'string' || !p) return null;
        if (p.startsWith('data:image/')) {
            const result = await imageUploadService.uploadImageToCloudinary(p, 'ai-companions');
            return result.url;
        }
        return p;
    }));
    return urls.filter(Boolean);
};

const validateBody = (body, { isCreate }) => {
    if (isCreate && (!body.name || !String(body.name).trim())) {
        throw new BadRequestError('Name is required');
    }
    if (body.age !== undefined && (Number(body.age) < 18 || Number(body.age) > 100)) {
        throw new BadRequestError('Age must be between 18 and 100');
    }
    if (body.languageStyle !== undefined && !LANGUAGE_STYLES.includes(body.languageStyle)) {
        throw new BadRequestError('Invalid language style');
    }
    const min = body.replyDelayMinSeconds;
    const max = body.replyDelayMaxSeconds;
    if (min != null && min !== '' && max != null && max !== '' && Number(min) > Number(max)) {
        throw new BadRequestError('Minimum reply delay cannot be greater than maximum');
    }
};

const toServiceData = async (body) => {
    const data = { ...body };
    if (data.name !== undefined) data.name = String(data.name).trim();
    if (data.age !== undefined) data.age = Number(data.age);
    for (const key of ['replyDelayMinSeconds', 'replyDelayMaxSeconds']) {
        if (data[key] !== undefined) data[key] = data[key] === '' || data[key] === null ? '' : Number(data[key]);
    }
    if (data.photos !== undefined) data.photos = await resolvePhotos(data.photos);
    return data;
};

export const listAiCompanions = async (req, res, next) => {
    try {
        const companions = await aiCompanionService.listCompanions();
        res.status(200).json({
            status: 'success',
            data: { companions, geminiConfigured: isGeminiConfigured() },
        });
    } catch (error) {
        next(error);
    }
};

export const getAiCompanion = async (req, res, next) => {
    try {
        const companion = await aiCompanionService.getCompanion(req.params.id);
        if (!companion) throw new NotFoundError('AI companion not found');
        res.status(200).json({ status: 'success', data: { companion } });
    } catch (error) {
        next(error);
    }
};

export const createAiCompanion = async (req, res, next) => {
    try {
        validateBody(req.body, { isCreate: true });
        const companion = await aiCompanionService.createCompanion(await toServiceData(req.body));
        res.status(201).json({ status: 'success', data: { companion } });
    } catch (error) {
        next(error);
    }
};

export const updateAiCompanion = async (req, res, next) => {
    try {
        validateBody(req.body, { isCreate: false });
        const companion = await aiCompanionService.updateCompanion(req.params.id, await toServiceData(req.body));
        if (!companion) throw new NotFoundError('AI companion not found');
        res.status(200).json({ status: 'success', data: { companion } });
    } catch (error) {
        next(error);
    }
};

export const deleteAiCompanion = async (req, res, next) => {
    try {
        const deleted = await aiCompanionService.deleteCompanion(req.params.id);
        if (!deleted) throw new NotFoundError('AI companion not found');
        res.status(200).json({ status: 'success', message: 'AI companion deleted' });
    } catch (error) {
        next(error);
    }
};
