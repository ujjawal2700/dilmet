/**
 * AI Client - Multi-provider wrapper supporting Gemini, Groq, and OpenAI
 * @purpose: Single place for AI generation with model cascading and graceful fallback
 */

import { GoogleGenAI } from '@google/genai';
import axios from 'axios';
import logger from '../../utils/logger.js';

const CANDIDATE_GEMINI_MODELS = [
    process.env.GEMINI_MODEL,
    'gemini-3-flash-preview',
    'gemini-flash-latest',
    'gemini-3.6-flash',
    'gemini-2.5-pro',
    'gemini-pro-latest',
].filter(Boolean);

const REQUEST_TIMEOUT_MS = 25000;

let geminiClient = null;

export const isGeminiConfigured = () => Boolean(process.env.GEMINI_API_KEY);
export const isGroqConfigured = () => Boolean(process.env.GROQ_API_KEY);
export const isOpenAiConfigured = () => Boolean(process.env.OPENAI_API_KEY);

export const isAnyAiConfigured = () => isGeminiConfigured() || isGroqConfigured() || isOpenAiConfigured();

const getGeminiClient = () => {
    if (!isGeminiConfigured()) return null;
    if (!geminiClient) {
        geminiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    }
    return geminiClient;
};

/**
 * Call Groq API (OpenAI compatible) if GROQ_API_KEY is available
 */
const callGroq = async ({ systemInstruction, prompt, temperature }) => {
    if (!isGroqConfigured()) return null;
    try {
        const response = await axios.post(
            'https://api.groq.com/openai/v1/chat/completions',
            {
                model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: systemInstruction },
                    { role: 'user', content: prompt }
                ],
                temperature: temperature || 0.8,
                max_tokens: 500,
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                timeout: REQUEST_TIMEOUT_MS,
            }
        );
        const text = response.data?.choices?.[0]?.message?.content?.trim();
        if (text) {
            return {
                text,
                inputTokens: response.data?.usage?.prompt_tokens || 0,
                outputTokens: response.data?.usage?.completion_tokens || 0,
            };
        }
    } catch (err) {
        logger.warn(`[AI-GROQ] Call failed: ${err.message}`);
    }
    return null;
};

/**
 * Call OpenAI API if OPENAI_API_KEY is available
 */
const callOpenAi = async ({ systemInstruction, prompt, temperature }) => {
    if (!isOpenAiConfigured()) return null;
    try {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: systemInstruction },
                    { role: 'user', content: prompt }
                ],
                temperature: temperature || 0.8,
                max_tokens: 500,
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                timeout: REQUEST_TIMEOUT_MS,
            }
        );
        const text = response.data?.choices?.[0]?.message?.content?.trim();
        if (text) {
            return {
                text,
                inputTokens: response.data?.usage?.prompt_tokens || 0,
                outputTokens: response.data?.usage?.completion_tokens || 0,
            };
        }
    } catch (err) {
        logger.warn(`[AI-OPENAI] Call failed: ${err.message}`);
    }
    return null;
};

/**
 * Generate a single text response with model cascading across available providers.
 * @param {Object} params
 * @param {string} params.systemInstruction - Persona + rules
 * @param {string} params.prompt - The user-turn content
 * @param {number} [params.temperature]
 * @returns {Promise<{ text: string, inputTokens: number, outputTokens: number } | null>}
 */
export const generateText = async ({ systemInstruction, prompt, temperature = 0.9 }) => {
    // 1. Try Groq if configured (lightning fast)
    if (isGroqConfigured()) {
        const groqRes = await callGroq({ systemInstruction, prompt, temperature });
        if (groqRes && groqRes.text) return groqRes;
    }

    // 2. Try Gemini with candidate models
    if (isGeminiConfigured()) {
        const client = getGeminiClient();
        if (client) {
            for (const model of CANDIDATE_GEMINI_MODELS) {
                try {
                    const response = await client.models.generateContent({
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

                    if (text) {
                        return {
                            text,
                            inputTokens: usage.promptTokenCount || 0,
                            outputTokens: usage.candidatesTokenCount || 0,
                        };
                    }
                } catch (err) {
                    // If error is 403 Permission Denied, no model will work with this key; break early
                    const isPermissionDenied = err.message && err.message.includes('PERMISSION_DENIED');
                    logger.warn(`[GEMINI] Model ${model} failed: ${err.message?.slice(0, 120)}`);
                    if (isPermissionDenied) {
                        break;
                    }
                }
            }
        }
    }

    // 3. Try OpenAI if configured
    if (isOpenAiConfigured()) {
        const openAiRes = await callOpenAi({ systemInstruction, prompt, temperature });
        if (openAiRes && openAiRes.text) return openAiRes;
    }

    return null;
};

export default { generateText, isGeminiConfigured, isGroqConfigured, isOpenAiConfigured, isAnyAiConfigured };
