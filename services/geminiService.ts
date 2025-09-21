// services/geminiService.ts
// Frontend wrapper to call the Netlify function proxy for Gemini (gemini-2.0-flash).
export type GeminiResponse = any;

export async function callGemini(prompt: string, opts?: { max_output_tokens?: number; temperature?: number }): Promise<GeminiResponse> {
  const body = {
    prompt,
    ...(opts || {})
  };
  const resp = await fetch('/.netlify/functions/gemini-proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Gemini proxy error: ${resp.status} ${text}`);
  }
  const ct = resp.headers.get('content-type') || '';
  if (ct.includes('application/json')) {
    return resp.json();
  }
  return resp.text();
}


export async function getFinancialInsight(prompt: string) {
  return callGemini(`Provide financial insights: ${prompt}`, { max_output_tokens: 200 });
}

export async function getChatSuggestions(prompt: string) {
  return callGemini(`You are an assistant. Suggest chat responses for: ${prompt}`, { max_output_tokens: 150 });
}

export async function getTaxEstimation(details: string) {
  return callGemini(`Estimate tax for: ${details}`, { max_output_tokens: 200 });
}

export async function suggestCategory(description: string) {
  return callGemini(`Suggest a category for this expense: ${description}`, { max_output_tokens: 80 });
}
