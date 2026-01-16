
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { User, Match, SmokingHabits, DrinkingHabits, MaritalStatus, ChildrenStatus, WillingToRelocate, ChildrenPreference } from '../types';

async function callGeminiWithRetry(
  ai: any, 
  params: any, 
  retries = 3, 
  delay = 1000
): Promise<GenerateContentResponse> {
  try {
    return await ai.models.generateContent(params);
  } catch (error: any) {
    if (retries > 0 && (error?.status === 'UNKNOWN' || error?.code === 500 || error?.code === 503)) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return callGeminiWithRetry(ai, params, retries - 1, delay * 2);
    }
    throw error;
  }
}

export const getCompatibilityInsight = async (user: User, match: Match): Promise<{ score: number, insight: string }> => {
    if (!process.env.API_KEY) {
        return { score: 85, insight: "You both share a passion for career growth and value deep connection." };
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = 'gemini-3-pro-preview';

    const prompt = `
        Act as a professional marriage matchmaker. Analyze the compatibility between two individuals for a long-term, marriage-oriented relationship.
        
        User (${user.name}):
        - Marital History: ${user.maritalStatus}
        - Current Children: ${user.childrenStatus}
        - Bio: ${user.bio}
        - Values: ${user.personalValues.join(', ')}
        - Religion: ${user.religion}
        - Marriage Timeline: ${user.marriageTimeline}
        - Children Preference (Future): ${user.childrenPreference}

        Match (${match.name}):
        - Marital History: ${match.maritalStatus}
        - Current Children: ${match.childrenStatus}
        - Bio: ${match.bio}
        - Values: ${match.personalValues.join(', ')}
        - Religion: ${match.religion}
        - Marriage Timeline: ${match.marriageTimeline}
        - Children Preference (Future): ${match.childrenPreference}

        Provide:
        1. A compatibility score (0-100) based strictly on marriage-critical factors (especially children and marital history alignment).
        2. A concise 2-sentence "Match Insight" explaining why they are a good fit.

        Return JSON format: { "score": number, "insight": string }
    `;

    try {
        const response = await callGeminiWithRetry(ai, {
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        score: { type: Type.INTEGER },
                        insight: { type: Type.STRING }
                    },
                    required: ["score", "insight"]
                }
            }
        });

        return JSON.parse(response.text || '{"score": 75, "insight": "Stable connection predicted."}');
    } catch (error) {
        console.error("Matchmaking error:", error);
        return { score: 75, insight: "AI analysis currently processing. You both appear to have highly compatible life goals." };
    }
};

export const generateAIReply = async (match: Match, conversationHistory: string[]): Promise<string> => {
     if (!process.env.API_KEY) return "That's really interesting! Tell me more.";

     const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
     const model = 'gemini-3-flash-preview';

     const prompt = `
        You are ${match.name}. Your profile: "${match.bio}".
        Conversation history:
        ${conversationHistory.join('\n')}
        
        Write a brief, friendly, and engaging reply to the last message that moves the conversation towards getting to know each other for marriage. Keep it under 20 words.
     `;

     try {
         const response = await callGeminiWithRetry(ai, {
             model: model,
             contents: prompt
         });
         return response.text?.trim() || "I'd love to hear more about your day!";
     } catch (e) {
         return "That's wonderful! I'm really enjoying getting to know you.";
     }
};

export const queryGlobalRegistry = async (count: number = 3): Promise<Match[]> => {
    if (!process.env.API_KEY) return [];

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = 'gemini-3-flash-preview';

    const prompt = `
        Generate ${count} highly detailed, realistic profiles for a marriage-oriented matchmaking app called "Knot".
        
        Requirements for each profile:
        - Unique name and realistic age (24-45).
        - Marital History (Must choose from: "Never Married", "Divorced", "Widowed").
        - Current Children (Must choose from: "No children at all", "Has child / children").
        - Detailed bio reflecting maturity and marriage intent.
        - Occupation, City, and Country.
        - Marriage Timeline.
        - Future Children Preference.
        
        Return a JSON array of objects.
    `;

    try {
        const response = await callGeminiWithRetry(ai, {
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.STRING },
                            name: { type: Type.STRING },
                            age: { type: Type.INTEGER },
                            bio: { type: Type.STRING },
                            occupation: { type: Type.STRING },
                            city: { type: Type.STRING },
                            country: { type: Type.STRING },
                            marriageTimeline: { type: Type.STRING },
                            interests: { type: Type.ARRAY, items: { type: Type.STRING } },
                            profileImageUrls: { type: Type.ARRAY, items: { type: Type.STRING } },
                            religion: { type: Type.STRING },
                            personalValues: { type: Type.ARRAY, items: { type: Type.STRING } },
                            childrenPreference: { type: Type.STRING },
                            childrenStatus: { type: Type.STRING },
                            maritalStatus: { type: Type.STRING },
                            isVerified: { type: Type.BOOLEAN },
                            isPremium: { type: Type.BOOLEAN },
                            willingToRelocate: { type: Type.STRING },
                            marriageExpectations: { type: Type.STRING }
                        },
                        required: ["id", "name", "age", "bio", "maritalStatus", "childrenStatus", "profileImageUrls"]
                    }
                }
            }
        });

        const rawMatches = JSON.parse(response.text || '[]');
        
        return rawMatches.map((m: any) => ({
            ...m,
            id: `global_${m.id || Math.random().toString(36).substr(2, 9)}`,
            smoking: SmokingHabits.NonSmoker,
            drinking: DrinkingHabits.Socially,
            maritalStatus: m.maritalStatus as MaritalStatus || MaritalStatus.NeverMarried,
            childrenStatus: m.childrenStatus as ChildrenStatus || ChildrenStatus.None,
            willingToRelocate: m.willingToRelocate || WillingToRelocate.Maybe,
            childrenPreference: m.childrenPreference || ChildrenPreference.OpenToChildren,
            languages: m.languages || ["English"],
            education: m.education || "University Graduate",
            isVerified: m.isVerified ?? Math.random() > 0.3,
            isPremium: m.isPremium ?? false,
            idealPartnerTraits: m.idealPartnerTraits || ["Kind", "Supportive"],
            culturalBackground: m.culturalBackground || "Diverse",
            nationality: m.country,
            careerGoals: "Continuing to grow and provide."
        }));
    } catch (error) {
        console.error("Global Registry Error:", error);
        return [];
    }
};
