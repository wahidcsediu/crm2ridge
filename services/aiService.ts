
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateAIAnalysis = async (prompt: string, contextData: any) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `
        You are an advanced Real Estate Intelligence AI for "Ridge Park CRM".
        
        CONTEXT DATA:
        ${JSON.stringify(contextData, null, 2)}
        
        TASK:
        ${prompt}
        
        Formatting Rules:
        - Use professional, executive-level language.
        - Use clear headings and bullet points.
        - Highlight key metrics.
        - Keep it concise (under 200 words unless specified).
        - If recommending actions, be specific.
      `,
    });
    return response.text;
  } catch (error) {
    console.error("AI Generation Error:", error);
    return "AI Analysis is currently unavailable. Please check your connection or API configuration.";
  }
};
