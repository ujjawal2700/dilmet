/**
 * AI Persona Model - Personality for an AI companion account
 * @purpose: Drives Gemini prompts for AI companion users (User.isAiCompanion = true)
 */

import mongoose from 'mongoose';

const aiPersonaSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
            index: true,
        },
        // Free-text personality, e.g. "cheerful, loves chai and old Bollywood songs, teases playfully"
        personality: {
            type: String,
            trim: true,
            maxlength: [1000, 'Personality cannot exceed 1000 characters'],
            default: 'Friendly, warm and a little playful. Likes music, movies and food.',
        },
        // Character backstory used for small talk (the persona's hobbies, job, hometown)
        backstory: {
            type: String,
            trim: true,
            maxlength: [2000, 'Backstory cannot exceed 2000 characters'],
            default: '',
        },
        // hinglish | hindi | english | mirror (reply in whatever the user writes)
        languageStyle: {
            type: String,
            enum: ['mirror', 'hinglish', 'hindi', 'english'],
            default: 'mirror',
        },
        // Optional per-persona reply delay; falls back to AppSettings.aiCompanions
        replyDelayMinSeconds: { type: Number, min: 0, default: null },
        replyDelayMaxSeconds: { type: Number, min: 0, default: null },
        isActive: {
            type: Boolean,
            default: true,
            index: true,
        },
        stats: {
            openersSent: { type: Number, default: 0 },
            repliesSent: { type: Number, default: 0 },
            inputTokens: { type: Number, default: 0 },
            outputTokens: { type: Number, default: 0 },
        },
    },
    { timestamps: true }
);

const AiPersona = mongoose.model('AiPersona', aiPersonaSchema);

export default AiPersona;
