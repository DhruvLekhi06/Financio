import { GoogleGenAI, Type } from "@google/genai";
import type { Handler } from "@netlify/functions";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("Gemini API key is not configured in environment variables.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST' || !event.body) {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    const { action, payload } = JSON.parse(event.body);

    switch (action) {
      case 'getFinancialInsight': {
        const { prompt, dataSummary } = payload;
        const systemInstruction = `You are FinancioAI, a friendly and insightful AI financial assistant for a small business owner. Your tone is professional, encouraging, and clear. Use the provided data summary to answer the user's question. Keep your answers concise and actionable. Do not mention that you are an AI. Data summary: ${dataSummary}`;
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: { systemInstruction, temperature: 0.5 }
        });
        return { statusCode: 200, body: JSON.stringify({ text: response.text }) };
      }
      
      case 'getAIForecast': {
        const { historicalData, revenueGrowth, expenseChange } = payload;
        const systemInstruction = `You are a financial forecasting AI. Your task is to project the next 6 months of cash flow based on historical data and user-provided assumptions. Analyze the trends, seasonality, and amounts from the historical data to make realistic monthly projections. Return ONLY the 6 projected months. Do not include the historical data in your response. You must return the data in the specified JSON format.`;
        const prompt = `Historical Cash Flow Data (last 6 months): ${JSON.stringify(historicalData, null, 2)}\n\nUser Assumptions for the next 6 months:\n- Monthly Revenue Growth: ${revenueGrowth}%\n- Monthly Expense Change: ${expenseChange}%\n\nPlease generate a 6-month forecast based on this data and the assumptions.`;
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
          config: {
            systemInstruction, temperature: 0.3, responseMimeType: "application/json",
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: { month: { type: Type.STRING }, inflow: { type: Type.NUMBER }, outflow: { type: Type.NUMBER }, net: { type: Type.NUMBER } },
                required: ["month", "inflow", "outflow", "net"],
              },
            },
          },
        });
        return { statusCode: 200, body: JSON.stringify({ data: JSON.parse(response.text.trim()) }) };
      }
      
      case 'generateClientReportSummary': {
         const { prompt } = payload;
         const systemInstruction = `You are an AI financial analyst. Your task is to generate a concise, professional summary of a client's financial history with the business. - The tone should be objective and factual. - Start with a summary sentence. - Use bullet points for key metrics, formatted with hyphens (-). Do not use markdown. - End with a concluding sentence about their overall standing. - Be concise. The entire summary should be 2-4 sentences long plus a few bullet points.`;
         const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { systemInstruction, temperature: 0.4 }
         });
         return { statusCode: 200, body: JSON.stringify({ text: response.text }) };
      }

      case 'getChatSuggestions': {
        const { prompt } = payload;
        const systemInstruction = `You are an AI assistant helping a business owner understand their finances. Based on the provided data summary and the recent conversation history, generate 3 concise and relevant follow-up questions the user might ask. The questions should be things that can be answered with the available data. Return ONLY a JSON array of strings. Example: ["What is my biggest expense?", "Which client pays the fastest?"]`;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction, temperature: 0.7, responseMimeType: "application/json",
                responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
        });
        return { statusCode: 200, body: JSON.stringify({ data: JSON.parse(response.text.trim()) }) };
      }
      
      case 'getTaxEstimation': {
        const { prompt } = payload;
        const systemInstruction = `You are an AI Tax Estimator. Your task is to provide an estimated US federal income tax liability based on user inputs. - You MUST return a JSON object that strictly follows the provided schema. - Do NOT include any introductory text, just the JSON object. - Calculate the estimated tax based on the most recent tax brackets you have knowledge of. - Provide a brief, helpful note, including a disclaimer that this is not financial advice.`;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction, temperature: 0.1, responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        estimatedTax: { type: Type.NUMBER, description: "Total estimated federal tax liability." },
                        effectiveRate: { type: Type.NUMBER, description: "The effective tax rate as a percentage." },
                        breakdown: {
                            type: Type.ARRAY, description: "A breakdown of tax owed per bracket.",
                            items: {
                                type: Type.OBJECT, properties: { bracket: { type: Type.STRING }, tax: { type: Type.NUMBER } }
                            }
                        },
                        notes: { type: Type.STRING, description: "A brief note and disclaimer." }
                    },
                    required: ["estimatedTax", "effectiveRate", "breakdown", "notes"],
                }
            }
        });
        return { statusCode: 200, body: JSON.stringify({ data: JSON.parse(response.text.trim()) }) };
      }
      
      case 'suggestCategory': {
        const { prompt } = payload;
        const systemInstruction = `You are an AI assistant that categorizes expenses. Based on the expense description, choose the most appropriate category from the provided list. Respond with ONLY the category name. Do not add any other text or punctuation. If no category seems appropriate, respond with "Uncategorized".`;
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: { systemInstruction, temperature: 0 }
        });
        return { statusCode: 200, body: JSON.stringify({ text: response.text.trim() }) };
      }
      
      default:
        return { statusCode: 400, body: JSON.stringify({ error: 'Invalid action' }) };
    }
  } catch (error: any) {
    console.error('Gemini Proxy Error:', error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message || 'An internal server error occurred.' }) };
  }
};

export { handler };
