<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1H3GHFQDv-nCDZgnDOxEJeaXitSKCCK6l

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Gemini API proxy (Netlify Functions)

This project includes a server-side proxy to call Google Gemini/GenAI securely without exposing API keys in the browser.

Files added:
- `netlify/functions/gemini-proxy.js` - Serverless function that forwards prompt to Gemini.
- `services/geminiService.ts` - Frontend wrapper that calls the function.

### How to configure (IMPORTANT - do not commit secrets)
1. In Netlify dashboard, set these environment variables under Site settings -> Build & deploy -> Environment:
   - `GEMINI_API_KEY` = <your new API key (rotate the one you leaked)>
   - `GEMINI_ENDPOINT` = <the exact Gemini endpoint URL for your model, e.g. https://generativelanguage.googleapis.com/v1/models/YOUR_MODEL:generateText>

2. Deploy or trigger a new build on Netlify. The function will use the env vars at runtime.

### Local testing with netlify dev
1. Install netlify CLI: `npm i -g netlify-cli`
2. Create a local `.env` with the same `GEMINI_API_KEY` and `GEMINI_ENDPOINT` (do not commit this file).
3. Run: `netlify dev` and call the function from your frontend code at `/.netlify/functions/gemini-proxy`

### Example use (frontend)
```ts
import { callGemini } from './services/geminiService';

const out = await callGemini('Summarize the following product: ...');
console.log(out);
```

Security note: Keep your API key secret. Rotate keys you leaked immediately.

### CURL test (local netlify dev)
After `netlify dev` is running, test the function with:
```
curl -X POST http://localhost:8888/.netlify/functions/gemini-proxy \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Explain how AI works in a few words"}'
```
For production, replace the URL with `https://your-site.netlify.app/.netlify/functions/gemini-proxy`
