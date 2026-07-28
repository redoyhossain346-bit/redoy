import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json({ limit: '10mb' }));

const PORT = 3000;

let aiClient: GoogleGenAI | null = null;
function getAI() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== "undefined" && apiKey !== "null") {
      aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    }
  }
  return aiClient;
}

// Health Check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// AI Restock Analysis Endpoint
app.post("/api/restock-analysis", async (req, res) => {
  try {
    const { inventory = [], usageHistory = [], transactions = [] } = req.body;
    const ai = getAI();

    if (!ai) {
      // Fallback heuristic if API key not available
      const fallbackAlerts = generateHeuristicRestockAlerts(inventory, usageHistory, transactions);
      return res.json({
        success: true,
        data: {
          alerts: fallbackAlerts,
          overallHealthSummary: `Stock Health Analysis complete (${fallbackAlerts.length} items flagged for attention based on inventory thresholds and usage history).`,
          isAiPowered: false
        }
      });
    }

    const inventoryPromptData = inventory.map((item: any) => ({
      id: item.id,
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      minStock: item.minStock,
      price: item.price,
      serialNumber: item.serialNumber || 'N/A'
    }));

    const recentUsage = (usageHistory || []).slice(0, 30).map((u: any) => ({
      partId: u.partId,
      quantity: u.quantity,
      reason: u.reason,
      timestamp: u.timestamp
    }));

    const recentTransactions = (transactions || []).slice(0, 40).map((t: any) => ({
      date: t.date,
      items: (t.items || []).map((i: any) => ({
        category: i.category,
        brand: i.brand,
        model: i.model,
        quantity: i.quantity
      }))
    }));

    const prompt = `
Analyze our repair shop's current inventory stock levels, recent movement log, and sales/repair transaction history.
Identify parts that are critically low, trending towards running out soon, or have high demand velocity (especially screens, batteries, charging ports, back glass, or common accessories).

CURRENT INVENTORY:
${JSON.stringify(inventoryPromptData, null, 2)}

RECENT PART MOVEMENT LOG (LAST 30 LOGS):
${JSON.stringify(recentUsage, null, 2)}

RECENT REPAIR & SALES TRANSACTIONS (LAST 40 TRANSACTIONS):
${JSON.stringify(recentTransactions, null, 2)}

Provide specific, practical restock recommendations.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an expert AI inventory and supply chain analyst for 'All Cellular & Repair'. Your goal is to analyze stock quantities, part usage logs, and repair order volume to alert technicians when parts (like screens, batteries, charging ports) are running low or trending towards stockouts. Be precise, practical, and highly helpful.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            alerts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  partId: { type: Type.STRING, description: "ID of matching inventory item if exists, or empty string" },
                  partName: { type: Type.STRING, description: "Name of the part or item needing restock" },
                  category: { type: Type.STRING, description: "Category of item" },
                  currentStock: { type: Type.INTEGER, description: "Current quantity in stock" },
                  suggestedRestockQty: { type: Type.INTEGER, description: "Recommended order quantity" },
                  urgency: { type: Type.STRING, description: "CRITICAL, WARNING, or SUGGESTION" },
                  trendSummary: { type: Type.STRING, description: "Usage velocity or consumption trend summary" },
                  reason: { type: Type.STRING, description: "Detailed reason for restock recommendation" }
                },
                required: ["partName", "category", "currentStock", "suggestedRestockQty", "urgency", "trendSummary", "reason"]
              }
            },
            overallHealthSummary: { type: Type.STRING, description: "Executive summary of current inventory health" }
          },
          required: ["alerts", "overallHealthSummary"]
        }
      }
    });

    const parsedData = JSON.parse(response.text || '{}');
    res.json({
      success: true,
      data: {
        ...parsedData,
        isAiPowered: true
      }
    });
  } catch (error: any) {
    console.error("Restock Analysis Error:", error);
    // Fallback to heuristic on error
    const { inventory = [], usageHistory = [], transactions = [] } = req.body;
    const fallbackAlerts = generateHeuristicRestockAlerts(inventory, usageHistory, transactions);
    res.json({
      success: true,
      data: {
        alerts: fallbackAlerts,
        overallHealthSummary: `Stock Health Analysis complete (${fallbackAlerts.length} items flagged for attention based on stock thresholds).`,
        isAiPowered: false,
        error: error.message
      }
    });
  }
});

// General AI Assistant Chat
app.post("/api/chat", async (req, res) => {
  try {
    const { prompt, history = [] } = req.body;
    const ai = getAI();

    if (!ai) {
      return res.json({
        reply: "The AI assistant is not configured. Set the GEMINI_API_KEY environment variable to enable this feature."
      });
    }

    const contents = history.map((h: any) => ({
      role: h.role === 'user' ? 'user' : 'model',
      parts: [{ text: h.content }]
    }));

    contents.push({
      role: 'user',
      parts: [{ text: prompt }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents,
      config: {
        systemInstruction: "You are a helpful assistant for 'All Cellular & Repair Tempe' management portal. Assist with repair tracking, inventory queries, sales insights, and store management."
      }
    });

    res.json({ reply: response.text || "No response generated." });
  } catch (error: any) {
    console.error("Chat Error:", error);
    res.status(500).json({ error: error.message || "Failed to process chat request." });
  }
});

// Heuristic fallback function for restock alerts
function generateHeuristicRestockAlerts(inventory: any[], usageHistory: any[], transactions: any[]) {
  const alerts: any[] = [];

  // Count usage in history
  const usageCountMap: Record<string, number> = {};
  (usageHistory || []).forEach(u => {
    if (u.partId && u.reason !== 'return') {
      usageCountMap[u.partId] = (usageCountMap[u.partId] || 0) + (u.quantity || 1);
    }
  });

  // Count repair transactions by brand/model/category
  const transactionCategoryCount: Record<string, number> = {};
  (transactions || []).forEach(t => {
    (t.items || []).forEach((item: any) => {
      const key = `${item.brand || ''} ${item.model || ''} ${item.category || ''}`.trim();
      if (key) {
        transactionCategoryCount[key] = (transactionCategoryCount[key] || 0) + (item.quantity || 1);
      }
    });
  });

  inventory.forEach(item => {
    const usedQty = usageCountMap[item.id] || 0;
    const threshold = item.minStock ?? 2;

    if (item.quantity <= threshold || usedQty >= 3) {
      let urgency = 'SUGGESTION';
      if (item.quantity === 0) urgency = 'CRITICAL';
      else if (item.quantity <= threshold) urgency = 'WARNING';
      else if (usedQty >= 3) urgency = 'SUGGESTION';

      const suggestedQty = Math.max(5, (threshold * 2) - item.quantity);

      alerts.push({
        partId: item.id,
        partName: item.name,
        category: item.category,
        currentStock: item.quantity,
        suggestedRestockQty: suggestedQty,
        urgency,
        trendSummary: usedQty > 0 
          ? `${usedQty} units withdrawn recently from registry`
          : `Stock (${item.quantity}) is at or below minimum threshold (${threshold})`,
        reason: item.quantity === 0
          ? `CRITICAL OUT OF STOCK: Active demand for this item. Zero remaining in inventory.`
          : `LOW STOCK ALERT: Inventory level (${item.quantity}) reached safety threshold (${threshold}).`
      });
    }
  });

  return alerts;
}

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
