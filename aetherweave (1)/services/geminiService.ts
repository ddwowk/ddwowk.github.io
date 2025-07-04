
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Character, Combatant } from '../types';

if (!process.env.API_KEY) {
  // In a real app, you'd want to handle this more gracefully.
  // For this context, we will throw an error to make it clear.
  throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const parseJsonResponse = <T,>(text: string): T | null => {
  let jsonStr = text.trim();
  const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
  const match = jsonStr.match(fenceRegex);
  if (match && match[2]) {
    jsonStr = match[2].trim();
  }
  try {
    return JSON.parse(jsonStr) as T;
  } catch (e) {
    console.error("Failed to parse JSON response:", e, "Original text:", text);
    return null;
  }
};

export const balanceCreation = async (type: string, description: string): Promise<{ feedback: string; suggestion: string } | null> => {
  const prompt = `
    Analyze the following Tabletop RPG creation for game balance. It is for a new character.
    Provide constructive feedback and a balanced alternative if it is overpowered or unclear.
    The creation is a ${type}.
    Description: "${description}"

    Respond in JSON format with the following structure: { "feedback": "Your analysis here.", "suggestion": "Your balanced suggestion here." }
  `;
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-04-17',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
    });
    return parseJsonResponse<{ feedback: string; suggestion: string }>(response.text);
  } catch (error) {
    console.error("Error balancing creation:", error);
    return { feedback: "Error connecting to AI balancer. Please try again later.", suggestion: "" };
  }
};

export const generateScenario = async (gmPrompt: string): Promise<string> => {
  const systemInstruction = `You are a master storyteller for a tabletop role-playing game. Expand the following scene prompt from a Game Master into a rich, detailed, and atmospheric description for the players. Engage multiple senses (sight, sound, smell, touch). Do not give away secrets or plot points, just describe the immediate environment.`;
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-04-17',
        contents: gmPrompt,
        config: {
            systemInstruction
        }
    });
    return response.text;
  } catch (error) {
    console.error("Error generating scenario:", error);
    return "The air shimmers with magical interference. The GM's vision is clouded. (Error connecting to AI Narrator)";
  }
};

export const generateSceneImage = async (prompt: string): Promise<string> => {
  const imagePrompt = `Epic fantasy digital painting of: ${prompt}. Cinematic lighting, high detail.`;
  try {
    const response = await ai.models.generateImages({
        model: 'imagen-3.0-generate-002',
        prompt: imagePrompt,
        config: { numberOfImages: 1, outputMimeType: 'image/jpeg' },
    });
    
    if (response.generatedImages && response.generatedImages.length > 0) {
      const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
      return `data:image/jpeg;base64,${base64ImageBytes}`;
    }
    return '';
  } catch (error) {
    console.error("Error generating image:", error);
    return '';
  }
};

interface CombatResolution {
    success: boolean;
    damage_dealt: number;
    target_id: string;
    description: string;
    effects_applied: string[];
}

export const resolveCombatAction = async (actionText: string, character: Character, enemies: Combatant[]): Promise<CombatResolution | null> => {
    const prompt = `
    You are a combat resolution engine for a TRPG. Based on the player's action and their character sheet, determine the outcome.

    Player: ${character.name}
    Character Sheet: ${JSON.stringify(character)}
    Enemies: ${JSON.stringify(enemies)}
    Player's Action: "${actionText}"

    Analyze the action. Identify the skill/item used, the intended target, and the action type.
    Based on the descriptions, calculate a plausible outcome.
    - If attacking, determine if it hits and calculate damage.
    - If using a skill, describe its effect.
    - Be creative but fair.

    Respond in JSON with the following structure:
    {
      "success": boolean,
      "damage_dealt": number (0 if no damage),
      "target_id": "ID of the target enemy from the list" | "self" | "multiple",
      "description": "A narrative string describing what happened.",
      "effects_applied": ["effect name", "another effect"] (empty array if none)
    }
    `;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash-preview-04-17',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            }
        });
        return parseJsonResponse<CombatResolution>(response.text);
    } catch (error) {
        console.error("Error resolving combat action:", error);
        return {
            success: false,
            damage_dealt: 0,
            target_id: "none",
            description: "A surge of wild magic erupts, fizzling the action! (Error connecting to AI Combat Engine)",
            effects_applied: [],
        };
    }
};
