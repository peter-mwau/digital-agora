// Lightweight Gemini client wrapper.
// This file calls a configurable LLM HTTP endpoint. The endpoint must accept
// a JSON POST with { prompt } and return { text } or { tags: string[] } depending
// on the helper used. Configure the endpoint and API key in your Vite env:
// VITE_GEMINI_API_URL and VITE_GEMINI_API_KEY

const API_URL = import.meta.env.VITE_GEMINI_API_URL;
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const API_BASE = import.meta.env.VITE_API_BASE || '';

async function postToLLM(body) {
    const target = API_URL || `${API_BASE}/api/ai/respond`;
    const headers = { 'Content-Type': 'application/json' };
    if (API_URL && API_KEY) headers.Authorization = `Bearer ${API_KEY}`;

    const res = await fetch(target, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`LLM request failed: ${res.status} ${text}`);
    }

    return res.json();
}

// analyzeForTags: ask the model to return at least two short tags for text
export async function analyzeForTags(text) {
    const prompt = `Extract at least two short topic tags (single words or short phrases) from the following discussion text. Return JSON with a top-level key "tags" whose value is an array of lowercase strings. Text: """${text}"""`;
    const resp = await postToLLM({ prompt, mode: 'tags' });

    // Expect resp.tags || try to parse resp.text as JSON
    if (resp.tags && Array.isArray(resp.tags)) return resp.tags.slice(0, 10);
    if (resp.text) {
        try {
            const parsed = JSON.parse(resp.text);
            if (parsed.tags && Array.isArray(parsed.tags)) return parsed.tags.slice(0, 10);
        } catch (e) {
            // noop
        }
    }

    // fallback: simple heuristic
    const words = (text || '')
        .replace(/[^a-zA-Z0-9\s]/g, ' ')
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean);
    const freq = {};
    words.forEach((w) => (freq[w] = (freq[w] || 0) + 1));
    const tags = Object.keys(freq)
        .sort((a, b) => freq[b] - freq[a])
        .slice(0, 3);
    return tags;
}

// askAgent: ask the agent to respond to a user's request. Returns plain text.
export async function askAgent(promptText) {
    const prompt = `You are an assistant. Respond concisely and helpfully to the user request below.\n\nRequest:\n${promptText}`;
    const resp = await postToLLM({ prompt, mode: 'reply' });

    if (resp.text) return resp.text;
    if (resp.reply) return resp.reply;
    // try other shapes
    return String(resp);
}

export default { analyzeForTags, askAgent };
