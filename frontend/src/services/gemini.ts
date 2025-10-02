const API_URL = import.meta.env.VITE_GEMINI_API_URL;
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const API_BASE = import.meta.env.VITE_API_BASE || '';

async function postToLLM(body: Record<string, unknown>) {
    const target = API_URL || `${API_BASE}/api/ai/respond`;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
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
export async function generateTagsFromBackend(
    content: string,
    userId?: string,
    userName?: string
): Promise<string[]> {
    try {
        const response = await fetch(`${API_BASE}/api/generate-tags`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                content: content.trim(),
                userId: userId || 'anonymous',
                userName: userName || 'anonymous'
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.tags || [];
    } catch (error) {
        console.error('Failed to generate tags:', error);
        throw error;
    }
}

// askAgent: ask the agent to respond to a user's request. Returns plain text.
export async function askAgent(promptText: string): Promise<string> {
    const prompt = `You are an assistant. Respond concisely and helpfully to the user request below.\n\nRequest:\n${promptText}`;
    const resp = await postToLLM({ prompt, mode: 'reply' });

    if (resp.text) return resp.text;
    if (resp.reply) return resp.reply;
    // try other shapes
    return String(resp);
}

