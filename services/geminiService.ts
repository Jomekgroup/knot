
import { GoogleGenAI, Type } from "@google/genai";
import { User, Match } from '../types';

export const generateConversationStarters = async (user: User, match: Match): Promise<string[]> => {
    if (!process.env.API_KEY) {
        return [
            `Hey ${match.name}! I saw you're into ${match.interests[0] || 'cool things'}. What's your favorite thing about it?`,
            "What's the most interesting thing you've done recently?",
            "If you could travel anywhere right now, where would you go?"
        ];
    }
    
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = 'gemini-3-flash-preview';

    const userInterests = user.interests.join(', ');
    const matchInterests = match.interests.join(', ');

    const prompt = `
        Based on these two dating profiles, generate 3 creative and engaging conversation starters.
        The user is ${user.name}, and their match is ${match.name}.

        ${user.name}'s Profile:
        - Bio: "${user.bio}"
        - Interests: ${userInterests}

        ${match.name}'s Profile:
        - Bio: "${match.bio}"
        - Interests: ${matchInterests}

        The conversation starters should be unique, open-ended, and refer to shared or complementary interests.
        Return the response as a JSON array of strings.
    `;

    const executeWithRetry = async (retries = 2, delay = 1000): Promise<any> => {
        try {
            return await ai.models.generateContent({
                model: model,
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.STRING
                        }
                    }
                }
            });
        } catch (error: any) {
            if (retries > 0 && (error?.status === 'UNKNOWN' || error?.code === 500)) {
                await new Promise(resolve => setTimeout(resolve, delay));
                return executeWithRetry(retries - 1, delay * 2);
            }
            throw error;
        }
    };

    try {
        const response = await executeWithRetry();
        const starters = JSON.parse(response.text?.trim() || '[]');
        return Array.isArray(starters) && starters.length > 0 ? starters : ["Hi! I'd love to know more about your journey towards marriage."];
    } catch (error) {
        console.error("Error generating starters:", error);
        return [`Hi ${match.name}, I'm really interested in your profile and values!`];
    }
};
