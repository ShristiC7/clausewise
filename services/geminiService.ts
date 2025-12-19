
import { GoogleGenAI, Type } from "@google/genai";
import { ANALYSIS_SYSTEM_PROMPT, CHAT_SYSTEM_PROMPT } from "../constants";
import { AnalysisResult, SupportedLanguage } from "../types";

export class GeminiService {
  private model = 'gemini-3-pro-preview';

  private async fetchWithRetry(fn: () => Promise<any>, retries = 3, delay = 2000): Promise<any> {
    try {
      return await fn();
    } catch (error: any) {
      if (retries > 0 && (error.status === 429 || error.status >= 500)) {
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.fetchWithRetry(fn, retries - 1, delay * 2);
      }
      throw error;
    }
  }

  async analyzeContract(text: string, language: SupportedLanguage = 'en'): Promise<AnalysisResult> {
    const fn = async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const languageLabel = language === 'hi' ? 'Hindi' : 'English';
      
      const response = await ai.models.generateContent({
        model: this.model,
        contents: `Contract text to analyze:\n\n${text.substring(0, 30000)}`,
        config: {
          systemInstruction: ANALYSIS_SYSTEM_PROMPT.replace('{LANGUAGE}', languageLabel),
          responseMimeType: "application/json",
          temperature: 0.1,
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              riskScore: { type: Type.STRING },
              summary: { type: Type.STRING },
              plainEnglishExplanation: { type: Type.STRING },
              obligations: { type: Type.ARRAY, items: { type: Type.STRING } },
              penalties: { type: Type.ARRAY, items: { type: Type.STRING } },
              negotiablePoints: { type: Type.ARRAY, items: { type: Type.STRING } },
              clauses: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    text: { type: Type.STRING },
                    riskLevel: { type: Type.STRING },
                    explanation: { type: Type.STRING },
                    negotiationSuggestion: { type: Type.STRING }
                  },
                  required: ["text", "riskLevel", "explanation"]
                }
              }
            },
            required: ["riskScore", "summary", "plainEnglishExplanation", "clauses", "obligations", "penalties", "negotiablePoints"]
          }
        }
      });
      return JSON.parse(response.text || "{}");
    };

    return this.fetchWithRetry(fn);
  }

  createChat(analysisContext: AnalysisResult, language: SupportedLanguage = 'en') {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    const languageLabel = language === 'hi' ? 'Hindi' : 'English';

    return ai.chats.create({
      model: this.model,
      config: {
        systemInstruction: CHAT_SYSTEM_PROMPT
          .replace('{LANGUAGE}', languageLabel)
          .concat(`\n\nCONTRACT ANALYSIS DATA:\n${JSON.stringify(analysisContext)}`),
        temperature: 0.2
      }
    });
  }
}

export const geminiService = new GeminiService();
