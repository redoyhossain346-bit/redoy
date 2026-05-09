import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ 
  apiKey: (process.env.GEMINI_API_KEY as string) 
});

export const getGeminiResponse = async (prompt: string, history: { role: 'user' | 'model', content: string }[] = []) => {
  try {
    const contents = history.map(h => ({
      role: h.role === 'user' ? 'user' : 'model',
      parts: [{ text: h.content }]
    }));

    // Add current message
    contents.push({
      role: 'user',
      parts: [{ text: prompt }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: contents,
      config: {
        systemInstruction: "You are a helpful financial assistant for 'Glass Budget', a futuristic budgeting and transaction tracking application. Assist users with budgeting tips, financial advice, and how to use the app. Keep responses concise and friendly. If users ask about specific data, explain that you are an AI and don't have access to their real-time database yet, but you can help with general questions.",
      },
    });

    return response.text || "I'm sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I encountered an error. Please try again later.";
  }
};
