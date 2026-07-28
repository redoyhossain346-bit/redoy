export interface RestockAlert {
  partId?: string;
  partName: string;
  category: string;
  currentStock: number;
  suggestedRestockQty: number;
  urgency: 'CRITICAL' | 'WARNING' | 'SUGGESTION';
  trendSummary: string;
  reason: string;
}

export interface RestockAnalysisResult {
  alerts: RestockAlert[];
  overallHealthSummary: string;
  isAiPowered?: boolean;
}

export const getGeminiResponse = async (prompt: string, history: { role: 'user' | 'model', content: string }[] = []) => {
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, history }),
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const data = await res.json();
    return data.reply || "No response generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I encountered an error communicating with the AI service. Please try again.";
  }
};

export const analyzeRestockNeeds = async (
  inventory: any[],
  usageHistory: any[],
  transactions: any[] = []
): Promise<RestockAnalysisResult> => {
  try {
    const res = await fetch("/api/restock-analysis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inventory, usageHistory, transactions }),
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const json = await res.json();
    if (json.success && json.data) {
      return json.data;
    }
    throw new Error(json.error || "Invalid response format");
  } catch (error) {
    console.error("Restock Analysis API error:", error);
    // Local fallback heuristic in client if fetch fails
    const alerts: RestockAlert[] = [];
    inventory.forEach((item) => {
      const threshold = item.minStock ?? 2;
      if (item.quantity <= threshold) {
        alerts.push({
          partId: item.id,
          partName: item.name,
          category: item.category,
          currentStock: item.quantity,
          suggestedRestockQty: Math.max(5, threshold * 2 - item.quantity),
          urgency: item.quantity === 0 ? 'CRITICAL' : 'WARNING',
          trendSummary: `Stock level (${item.quantity}) is at or below threshold (${threshold})`,
          reason: item.quantity === 0
            ? `Out of stock! High risk of missing repair jobs.`
            : `Low stock alert threshold reached.`,
        });
      }
    });

    return {
      alerts,
      overallHealthSummary: `Inventory scan complete. ${alerts.length} item(s) require attention.`,
      isAiPowered: false,
    };
  }
};
