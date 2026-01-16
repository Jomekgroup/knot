
import { GoogleGenAI, Type } from "@google/genai";

export interface GlobalEvent {
    id: string;
    message: string;
    location: string;
    timestamp: Date;
}

export const fetchRecentGlobalActivity = async (): Promise<GlobalEvent[]> => {
    if (!process.env.API_KEY) {
        return [
            { id: '1', message: "New marriage-minded match found", location: "London, UK", timestamp: new Date() },
            { id: '2', message: "User profile verified", location: "Toronto, CA", timestamp: new Date() }
        ];
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = 'gemini-3-flash-preview';

    const prompt = `
        Generate 5 "Live Community Events" for a global marriage matchmaking app called "Knot".
        Events should sound realistic and professional (e.g., "A new match was made", "User verified", "Wedding date set by Knot couple").
        Be diverse with locations.
        Return as a JSON array of objects with 'message' and 'location'.
    `;

    const executeRequest = async (retries = 2, delay = 1000): Promise<any> => {
        try {
            return await ai.models.generateContent({
                model: model,
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                message: { type: Type.STRING },
                                location: { type: Type.STRING }
                            },
                            required: ["message", "location"]
                        }
                    }
                }
            });
        } catch (error: any) {
            if (retries > 0 && (error?.status === 'UNKNOWN' || error?.code === 500)) {
                await new Promise(resolve => setTimeout(resolve, delay));
                return executeRequest(retries - 1, delay * 2);
            }
            throw error;
        }
    };

    try {
        const response = await executeRequest();
        const data = JSON.parse(response.text || '[]');
        return data.map((item: any, idx: number) => ({
            id: `event_${Date.now()}_${idx}`,
            message: item.message,
            location: item.location,
            timestamp: new Date()
        }));
    } catch (e) {
        console.error("Global Activity Error:", e);
        return [
            { id: 'fallback_1', message: "A new couple connected", location: "Mumbai, IN", timestamp: new Date() },
            { id: 'fallback_2', message: "Match verified successfully", location: "NYC, USA", timestamp: new Date() }
        ];
    }
};
