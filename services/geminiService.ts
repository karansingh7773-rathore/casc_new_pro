import { GoogleGenAI } from "@google/genai";
import { config } from "../config";

// Helper to convert file to base64
const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = reader.result as string;
      const base64Content = base64Data.split(',')[1];
      resolve({
        inlineData: {
          data: base64Content,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const analyzeVideoWithGemini = async (
  prompt: string,
  videoFile: File,
  chatHistory: { role: string; parts: { text: string }[] }[] = []
): Promise<string> => {
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || config.geminiApiKey;

    // DEBUG: Check if key is loaded
    console.log("DEBUG: API Key Status:", {
      exists: !!apiKey,
      length: apiKey?.length || 0,
      source: import.meta.env.VITE_GEMINI_API_KEY ? 'env' : 'config',
      firstChar: apiKey ? apiKey[0] : 'N/A'
    });

    if (!apiKey || apiKey.includes("GEMINI_API_KEY")) {
      console.error("CRITICAL: API Key is missing or is still the placeholder.");
      return "Error: API Key is not configured. Please check your .env file and restart the server.";
    }

    const ai = new GoogleGenAI({ apiKey });

    // Using gemini-1.5-flash as it is the current stable fast multimodal model. 
    // 'gemini-2.5-flash' is not a valid public model ID yet.
    const model = 'gemini-2.5-flash';

    const videoPart = await fileToGenerativePart(videoFile);

    console.log("Sending request to Gemini...", { model, promptLength: prompt.length });

    const result = await ai.models.generateContent({
      model: model,
      contents: [
        {
          role: 'user',
          parts: [
            videoPart,
            { text: "Analyze this video footage carefully. " + prompt }
          ]
        }
      ]
    });

    console.log("Gemini Response:", result);
    return result.text || "No analysis could be generated.";

  } catch (error: any) {
    console.error("Gemini API Full Error:", error);
    if (error.message?.includes("API_KEY")) {
      return "Error: Invalid or missing API Key. Check your .env file.";
    }
    if (error.message?.includes("not found")) {
      return "Error: Model not found. Attempted to use: gemini-1.5-flash";
    }
    return `Analysis failed: ${error.message || "Unknown error"}`;
  }
};