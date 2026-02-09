import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.warn('GEMINI_API_KEY is not defined in environment variables');
}

export const genAI = new GoogleGenerativeAI(apiKey || '');

// Default model to use
export const geminiModel = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash-lite',
});

/**
 * Generates a high-conversion meta description based on content and brand voice.
 */
export async function generateSEO(content: string, brandVoice?: string, keywords?: string[]) {
    const prompt = `
    You are an SEO expert. Generate a compelling meta description (max 160 characters) for a blog post.
    ${brandVoice ? `Brand Voice: ${brandVoice}` : ''}
    ${keywords && keywords.length > 0 ? `Target Keywords: ${keywords.join(', ')}` : ''}
    
    Content:
    ${content.substring(0, 2000)}
    
    Return only the meta description text.
  `;

    try {
        const result = await geminiModel.generateContent(prompt);
        const response = await result.response;
        return response.text().trim();
    } catch (error) {
        console.error('Error generating SEO:', error);
        return null;
    }
}

/**
 * Generates a list of relevant keywords based on content and brand voice.
 */
export async function generateKeywords(content: string, brandVoice?: string) {
    const prompt = `
    Analyze the following blog content and generate 5-8 relevant SEO keywords.
    ${brandVoice ? `Brand Voice context: ${brandVoice}` : ''}
    
    Content:
    ${content.substring(0, 2000)}
    
    Return the keywords as a comma-separated list.
  `;

    try {
        const result = await geminiModel.generateContent(prompt);
        const response = await result.response;
        return response.text().trim();
    } catch (error) {
        console.error('Error generating keywords:', error);
        return null;
    }
}

/**
 * Generates a full structured blog article in Markdown.
 */
export async function generateFullArticle(topic: string, brandVoice?: string) {
    const prompt = `
    You are a professional content creator. Generate a structured blog article in Markdown for the following topic.
    ${brandVoice ? `Brand Voice: ${brandVoice}` : ''}
    
    Topic: ${topic}
    
    Requirements:
    - Include an H1 title.
    - Use H2 subheadings.
    - Include bullet points where appropriate.
    - Professional and engaging tone.
    
    Return ONLY the Markdown content.
  `;

    try {
        const result = await geminiModel.generateContent(prompt);
        const response = await result.response;
        return response.text().trim();
    } catch (error) {
        console.error('Error generating full article:', error);
        return null;
    }
}
