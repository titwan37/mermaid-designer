import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env manually to avoid depending on external dotenv package
const envPath = path.resolve(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf-8');

const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    const key = match[1];
    let val = match[2] || '';
    if (val.startsWith('"') && val.endsWith('"')) {
      val = val.substring(1, val.length - 1);
    } else if (val.startsWith("'") && val.endsWith("'")) {
      val = val.substring(1, val.length - 1);
    }
    env[key] = val.trim();
  }
});

async function testOpenRouter(key) {
  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'openrouter/auto',
        messages: [{ role: 'user', content: 'Hi' }]
      })
    });
    const data = await res.json();
    if (res.ok) console.log(`✅ OpenRouter Key (${key.substring(0, 15)}...): SUCCESS`);
    else console.error(`❌ OpenRouter Key: FAILED - ${JSON.stringify(data)}`);
  } catch (e) {
    console.error(`❌ OpenRouter Key: ERROR - ${e.message}`);
  }
}

async function testDashscope(key, endpoint, model) {
  try {
    const baseUrl = endpoint.endsWith('/chat/completions')
      ? endpoint
      : `${endpoint.replace(/\/+$/, '')}/chat/completions`;

    const res = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model || 'qwen3.6-plus-2026-04-02',
        messages: [{ role: 'user', content: 'Hi' }]
      })
    });
    const data = await res.json();
    if (res.ok) console.log(`✅ Dashscope Key (${key.substring(0, 15)}...): SUCCESS`);
    else console.error(`❌ Dashscope Key: FAILED - ${JSON.stringify(data)}`);
  } catch (e) {
    console.error(`❌ Dashscope Key: ERROR - ${e.message}`);
  }
}

async function main() {
  console.log("=== API Keys Diagnostic Test (Mermaid Designer) ===\n");

  const dashscopeKey = env.DASHSCOPE_API_KEY3 || env.DASHSCOPE_API_KEY;
  const dashscopeEndpoint = env.DASHSCOPE_OPENAI_COMPATIBLE_ENDPOINT;
  const openrouterKey = env.OPENROUTER_API_KEY;

  if (dashscopeKey) {
    console.log(`Testing Dashscope using endpoint: ${dashscopeEndpoint}...`);
    await testDashscope(dashscopeKey, dashscopeEndpoint);
  } else {
    console.log("⚠️ DASHSCOPE_API_KEY3/DASHSCOPE_API_KEY not found in .env");
  }

  if (openrouterKey) {
    console.log(`Testing OpenRouter...`);
    await testOpenRouter(openrouterKey);
  } else {
    console.log("⚠️ OPENROUTER_API_KEY not found in .env");
  }

  console.log("\n=== Diagnostic Complete ===");
}

main();
