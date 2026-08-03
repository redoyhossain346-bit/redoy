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

// AI Auto-Categorization Endpoint for TransactionForm
app.post("/api/suggest-category", async (req, res) => {
  try {
    const { note = '', customerName = '', customerPhone = '', items = [] } = req.body;
    const ai = getAI();

    if (!ai) {
      const fallback = suggestCategoryHeuristic(note, customerName, items);
      return res.json({
        success: true,
        data: {
          ...fallback,
          isAiPowered: false
        }
      });
    }

    const prompt = `
Analyze this repair shop transaction entry and suggest the best primary Category from the following list:
['Repair', 'Accessory', 'Service', 'Screen replacement', 'Back glass', 'Other fix', 'Labor', 'Unlocking', 'Phone sell', 'Tablet Sell', 'Perfume', 'Doll', 'Case', 'Water Bottle', 'Drinks', 'Noodles', 'Coffee', 'Snacks', 'Stanley cup', 'Earbud case', 'Fan', 'Speaker', 'Charging cord', 'Adapter', 'Cable', 'Bag', 'Custom Name', 'Accessories', 'Parts Sell', 'Toy sell', 'Tempered Glass', 'Battery', 'Camera Protector', 'Watch Belt', 'Watch Protector', 'Carrier sell', 'Uber', 'Income', 'Food', 'Transport', 'Rent', 'Utilities', 'Shopping', 'Others']

TRANSACTION DETAILS:
- Note / Internal Log: "${note}"
- Customer Name: "${customerName}"
- Customer Phone: "${customerPhone}"
- Existing Items in Bill: ${JSON.stringify(items)}

Choose the most accurate category (e.g., 'Repair' for general repairs or specific like 'Screen replacement', 'Accessory' for cases/chargers/glass, or 'Service' for software/diagnostics/labor). Also provide 2-3 relevant alternative suggestions and a brief 1-sentence explanation of why this category was selected.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an AI transaction categorizer for 'All Cellular & Repair Tempe'. Analyze the notes and customer text to accurately suggest whether the transaction is a 'Repair', 'Accessory', 'Service', 'Screen replacement', or other store category. Be concise and accurate.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestedCategory: { type: Type.STRING, description: "Primary recommended category" },
            confidence: { type: Type.NUMBER, description: "Confidence score between 0.0 and 1.0" },
            reason: { type: Type.STRING, description: "Short 1-sentence reason for this suggestion" },
            allSuggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Array of 3-4 top category suggestions"
            }
          },
          required: ["suggestedCategory", "confidence", "reason", "allSuggestions"]
        }
      }
    });

    const parsedData = JSON.parse(response.text || '{}');
    res.json({
      success: true,
      data: {
        suggestedCategory: parsedData.suggestedCategory || 'Repair',
        confidence: parsedData.confidence ?? 0.9,
        reason: parsedData.reason || "Analyzed from transaction notes and customer fields.",
        allSuggestions: parsedData.allSuggestions || ['Repair', 'Accessory', 'Service'],
        isAiPowered: true
      }
    });
  } catch (error: any) {
    console.error("Suggest Category Error:", error);
    const { note = '', customerName = '', items = [] } = req.body;
    const fallback = suggestCategoryHeuristic(note, customerName, items);
    res.json({
      success: true,
      data: {
        ...fallback,
        isAiPowered: false,
        error: error.message
      }
    });
  }
});

// Heuristic fallback function for category suggestion
function suggestCategoryHeuristic(note: string = '', customerName: string = '', items: any[] = []): {
  suggestedCategory: string;
  confidence: number;
  reason: string;
  allSuggestions: string[];
} {
  const text = `${note} ${customerName} ${(items || []).map(i => `${i.category || ''} ${i.brand || ''} ${i.model || ''}`).join(' ')}`.toLowerCase().trim();

  // Keyword matching
  if (/\b(screen|lcd|display|glass|crack|touch|digitizer|oled|battery|charge|port|speaker|camera|back glass|fix|repair|broken|water damage|unlock|unlocking|sim)\b/i.test(text)) {
    if (/\b(screen|lcd|display|digitizer|oled)\b/i.test(text)) {
      return {
        suggestedCategory: 'Screen replacement',
        confidence: 0.94,
        reason: "Detected keywords ('screen' / display repair) in notes or customer details.",
        allSuggestions: ['Screen replacement', 'Repair', 'Other fix', 'Back glass']
      };
    }
    if (/\b(back glass)\b/i.test(text)) {
      return {
        suggestedCategory: 'Back glass',
        confidence: 0.93,
        reason: "Detected keywords ('back glass') in notes or customer details.",
        allSuggestions: ['Back glass', 'Repair', 'Other fix']
      };
    }
    if (/\b(unlock|sim|network)\b/i.test(text)) {
      return {
        suggestedCategory: 'Unlocking',
        confidence: 0.91,
        reason: "Detected unlocking or network carrier keywords.",
        allSuggestions: ['Unlocking', 'Service', 'Carrier sell']
      };
    }
    return {
      suggestedCategory: 'Repair',
      confidence: 0.92,
      reason: "Detected device hardware fix or repair terms in notes or customer details.",
      allSuggestions: ['Repair', 'Other fix', 'Service', 'Labor']
    };
  }

  if (/\b(case|cover|protector|tempered|charger|cable|adapter|plug|earphone|headphone|airpod|belt|watch|accessory|accessories|bottle|perfume|doll|toy)\b/i.test(text)) {
    if (/\b(tempered|screen protector)\b/i.test(text)) {
      return {
        suggestedCategory: 'Tempered Glass',
        confidence: 0.92,
        reason: "Detected tempered glass / protector keyword.",
        allSuggestions: ['Tempered Glass', 'Accessory', 'Accessories']
      };
    }
    if (/\b(case|cover)\b/i.test(text)) {
      return {
        suggestedCategory: 'Case',
        confidence: 0.91,
        reason: "Detected phone case / protective cover keyword.",
        allSuggestions: ['Case', 'Accessory', 'Accessories']
      };
    }
    return {
      suggestedCategory: 'Accessory',
      confidence: 0.90,
      reason: "Detected accessory or retail add-on keywords in notes or customer details.",
      allSuggestions: ['Accessory', 'Accessories', 'Case', 'Tempered Glass']
    };
  }

  if (/\b(service|labor|fee|diagnostic|check|clean|software|update|backup|install|transfer|setup)\b/i.test(text)) {
    return {
      suggestedCategory: 'Service',
      confidence: 0.89,
      reason: "Detected service, diagnostic, or labor keywords in notes.",
      allSuggestions: ['Service', 'Labor', 'Repair', 'Other fix']
    };
  }

  if (/\b(sell|sold|purchase|bought|iphone|samsung|ipad|tablet|macbook|laptop|phone)\b/i.test(text)) {
    if (/\b(ipad|tablet)\b/i.test(text)) {
      return {
        suggestedCategory: 'Tablet Sell',
        confidence: 0.88,
        reason: "Detected tablet / iPad transaction in notes.",
        allSuggestions: ['Tablet Sell', 'Phone sell', 'Income']
      };
    }
    return {
      suggestedCategory: 'Phone sell',
      confidence: 0.88,
      reason: "Detected mobile device sale or trade-in keywords.",
      allSuggestions: ['Phone sell', 'Tablet Sell', 'Income']
    };
  }

  if (/\b(drink|drinks|soda|water|coke|pepsi|juice|redbull|monster|coffee|tea|latte|snack|snacks|candy|chip|chips|cookie|chocolate|noodle|noodles|ramen)\b/i.test(text)) {
    if (/\b(noodle|noodles|ramen)\b/i.test(text)) {
      return {
        suggestedCategory: 'Noodles',
        confidence: 0.93,
        reason: "Detected noodles / ramen item keyword in transaction details.",
        allSuggestions: ['Noodles', 'Snacks', 'Food']
      };
    }
    if (/\b(coffee|tea|latte)\b/i.test(text)) {
      return {
        suggestedCategory: 'Coffee',
        confidence: 0.92,
        reason: "Detected coffee / beverage keyword in transaction details.",
        allSuggestions: ['Coffee', 'Drinks', 'Snacks', 'Food']
      };
    }
    if (/\b(snack|snacks|candy|chip|chips|cookie|chocolate)\b/i.test(text)) {
      return {
        suggestedCategory: 'Snacks',
        confidence: 0.91,
        reason: "Detected snack / food item keyword in transaction details.",
        allSuggestions: ['Snacks', 'Drinks', 'Food']
      };
    }
    return {
      suggestedCategory: 'Drinks',
      confidence: 0.93,
      reason: "Detected drink / beverage keyword in transaction details.",
      allSuggestions: ['Drinks', 'Coffee', 'Snacks', 'Food']
    };
  }

  if (/\b(stanley|earbud case|fan|speaker|charging cord|adapter|cable|bag)\b/i.test(text)) {
    if (/\bstanley\b/i.test(text)) {
      return {
        suggestedCategory: 'Stanley cup',
        confidence: 0.93,
        reason: "Detected Stanley cup item keyword in transaction details.",
        allSuggestions: ['Stanley cup', 'Water Bottle', 'Accessories']
      };
    }
    if (/\bearbud case\b/i.test(text)) {
      return {
        suggestedCategory: 'Earbud case',
        confidence: 0.92,
        reason: "Detected Earbud case keyword in transaction details.",
        allSuggestions: ['Earbud case', 'Case', 'Accessories']
      };
    }
    if (/\bfan\b/i.test(text)) {
      return {
        suggestedCategory: 'Fan',
        confidence: 0.92,
        reason: "Detected fan keyword in transaction details.",
        allSuggestions: ['Fan', 'Accessories', 'Parts Sell']
      };
    }
    if (/\bspeaker\b/i.test(text)) {
      return {
        suggestedCategory: 'Speaker',
        confidence: 0.92,
        reason: "Detected speaker keyword in transaction details.",
        allSuggestions: ['Speaker', 'Accessories', 'Parts Sell']
      };
    }
    if (/\b(charging cord|cable)\b/i.test(text)) {
      return {
        suggestedCategory: 'Charging cord',
        confidence: 0.92,
        reason: "Detected charging cord or cable keyword in transaction details.",
        allSuggestions: ['Charging cord', 'Cable', 'Adapter', 'Accessories']
      };
    }
    if (/\badapter\b/i.test(text)) {
      return {
        suggestedCategory: 'Adapter',
        confidence: 0.92,
        reason: "Detected adapter keyword in transaction details.",
        allSuggestions: ['Adapter', 'Charging cord', 'Cable', 'Accessories']
      };
    }
    if (/\bbag\b/i.test(text)) {
      return {
        suggestedCategory: 'Bag',
        confidence: 0.92,
        reason: "Detected bag keyword in transaction details.",
        allSuggestions: ['Bag', 'Case', 'Accessories']
      };
    }
  }

  // Default fallback
  return {
    suggestedCategory: 'Repair',
    confidence: 0.75,
    reason: "Default recommendation based on standard repair shop transaction activity.",
    allSuggestions: ['Repair', 'Accessory', 'Service', 'Screen replacement']
  };
}

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
