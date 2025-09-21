// netlify/functions/gemini-proxy.js
// Finalized ESM version for Gemini 2.0 Flash API calls
export const handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const body = event.body ? JSON.parse(event.body) : {};
    const prompt = body.prompt;
    if (!prompt || typeof prompt !== 'string') {
      return { statusCode: 400, body: JSON.stringify({ error: 'Invalid or missing prompt' }) };
    }

    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      temperature: body.temperature ?? 0.2,
      max_output_tokens: body.max_output_tokens ?? 256
    };

    const endpoint = process.env.GEMINI_ENDPOINT;
    const key = process.env.GEMINI_API_KEY;
    if (!endpoint || !key) {
      return { statusCode: 500, body: JSON.stringify({ error: 'Server not configured' }) };
    }

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': key
      },
      body: JSON.stringify(payload)
    });

    const text = await res.text();
    return {
      statusCode: res.status,
      headers: { 'Content-Type': res.headers.get('content-type') || 'application/json' },
      body: text
    };
  } catch (err) {
    console.error('Gemini proxy error', err);
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal server error' }) };
  }
};
