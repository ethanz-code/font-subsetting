import { GoogleGenAI } from "@google/genai";
import { Language } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateSampleText = async (type: 'common_cn' | 'ascii' | 'pangram' | 'marketing', lang: Language = 'zh'): Promise<string> => {
  try {
    const model = 'gemini-2.5-flash';
    let prompt = "";
    
    switch (type) {
      case 'common_cn':
        prompt = "Provide a string containing the 500 most frequently used Simplified Chinese characters combined into a coherent paragraph if possible, otherwise just a list. Return ONLY the characters.";
        break;
      case 'ascii':
        prompt = "Return a string containing all standard ASCII printable characters (letters, numbers, punctuation). Return ONLY the characters.";
        break;
      case 'pangram':
        if (lang === 'zh') {
           prompt = "Generate 5 unique, creative pangrams or complete sentence examples in Simplified Chinese that cover a wide range of characters. Return them as plain text.";
        } else {
           prompt = "Generate 5 unique, creative pangrams in English. Return them as plain text.";
        }
        break;
      case 'marketing':
        if (lang === 'zh') {
          prompt = "Generate a short, punchy, minimalist marketing slogan for a design portfolio website in Simplified Chinese. Provide 3 variations.";
        } else {
          prompt = "Generate a short, punchy, minimalist marketing slogan for a design portfolio website in English. 3 variations.";
        }
        break;
    }

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    return response.text || "";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return ""; // Fallback handled in UI
  }
};

export const suggestCssStack = async (fontName: string): Promise<string> => {
   try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a modern, safe CSS font-family stack for a font named "${fontName}". Return ONLY the CSS value string (e.g. "Inter, system-ui, sans-serif").`,
    });
    return response.text?.trim() || `"${fontName}", sans-serif`;
  } catch (error) {
    return `"${fontName}", sans-serif`;
  }
}