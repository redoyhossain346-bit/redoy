let genAI: any = null;

const getAI = async () => {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "undefined" || apiKey === "null") {
      return null;
    }
    try {
      const { GoogleGenAI } = await import("@google/genai");
      genAI = new GoogleGenAI({ apiKey });
    } catch (err) {
      console.error("Failed to load Gemini SDK:", err);
      return null;
    }
  }
  return genAI;
};

export const getGeminiResponse = async (prompt: string, history: { role: 'user' | 'model', content: string }[] = []) => {
  try {
    const ai = await getAI();
    if (!ai) {
      return "The AI assistant is not configured. Please set the GEMINI_API_KEY environment variable to enable this feature.";
    }
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
