
import { GoogleGenAI } from "@google/genai";

if (!process.env.API_KEY) {
    console.warn("API_KEY environment variable not set. AI features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateBattleSummary = async (battleLog: string): Promise<string> => {
    if (!process.env.API_KEY) {
        return "AI features are disabled because the API key is not configured.";
    }
    
    const prompt = `
        You are an epic fantasy storyteller. Based on the following battle log from a game simulation, write a short, dramatic, and narrative summary of the fight. Do not just list the events; weave them into an exciting story.

        Battle Log:
        ---
        ${battleLog}
        ---

        Now, tell the tale of this battle.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-04-17",
            contents: prompt,
        });
        
        return response.text;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("The AI storyteller is resting and could not narrate the battle.");
    }
};
