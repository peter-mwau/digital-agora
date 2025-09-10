export function analyzeForTags(text: string): Promise<string[]>;
export function askAgent(promptText: string): Promise<string>;

export default { analyzeForTags, askAgent };
