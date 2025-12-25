import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateHolidayGreeting = async (theme: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Write a short, warm, and magical 2-sentence holiday greeting card message. Theme: ${theme}. Keep it under 30 words. No emojis inside the text.`,
      config: {
        maxOutputTokens: 100,
        temperature: 1.2, // High creativity
      }
    });
    return response.text || "Wishing you a season filled with light and wonder!";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "";
  }
};