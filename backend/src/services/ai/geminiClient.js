/**
 * Gemini Client - Thin wrapper around @google/genai
 * @purpose: Single place for Gemini configuration (API key, model, timeouts)
 */

import { GoogleGenAI } from '@google/genai';
import logger from '../../utils/logger.js';

const DEFAULT_MODEL = 'gemini-flash-latest';
const REQUEST_TIMEOUT_MS = 30000;

let client = null;

export const isGeminiConfigured = () => Boolean(process.env.GEMINI_API_KEY);

const getClient = () => {
    if (!isGeminiConfigured()) {
        throw new Error('GEMINI_API_KEY is not set');
    }
    if (!client) {
        client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    }
    return client;
};

/**
 * Generate a single text response.
 * @param {Object} params
 * @param {string} params.systemInstruction - Persona + rules
 * @param {string} params.prompt - The user-turn content
 * @param {number} [params.temperature]
 * @returns {Promise<{ text: string, inputTokens: number, outputTokens: number }>}
 */
export const generateText = async ({ systemInstruction, prompt, temperature = 0.9 }) => {
    const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;

    const response = await getClient().models.generateContent({
        model,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
            systemInstruction,
            temperature,
            maxOutputTokens: 1024,
            httpOptions: { timeout: REQUEST_TIMEOUT_MS },
        },
    });

    const text = (response.text || '').trim();
    const usage = response.usageMetadata || {};

    if (!text) {
        const reason = response.candidates?.[0]?.finishReason || response.promptFeedback?.blockReason || 'empty';
        logger.warn(`[GEMINI] Empty response (${reason})`);
    }

    return {
        text,
        inputTokens: usage.promptTokenCount || 0,
        outputTokens: usage.candidatesTokenCount || 0,
    };
};

export default { generateText, isGeminiConfigured };
