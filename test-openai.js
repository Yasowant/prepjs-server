// Quick OpenAI diagnostic — run from the server folder:
//   node test-openai.js
import dotenv from "dotenv";
dotenv.config();

const key = process.env.OPENAI_API_KEY;
const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

if (!key) {
  console.log("❌ No OPENAI_API_KEY in .env");
  process.exit(1);
}
console.log(`Key found: ${key.slice(0, 14)}…${key.slice(-4)}`);
console.log(`Model: ${model}\nTesting connection…\n`);

try {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: "Say OK" }],
      max_tokens: 5,
    }),
  });

  const data = await res.json().catch(() => ({}));

  if (res.ok) {
    console.log("✅ SUCCESS — OpenAI replied:", data.choices?.[0]?.message?.content);
    console.log("Your key works. If the app still fails, restart the server (npm run dev).");
  } else if (res.status === 401) {
    console.log("❌ 401 — KEY IS INVALID OR REVOKED.");
    console.log("This key was shared publicly, and OpenAI auto-revokes leaked keys.");
    console.log("Fix: platform.openai.com → API keys → Create new secret key → paste into .env");
  } else if (res.status === 429) {
    console.log("❌ 429 — RATE LIMIT / NO CREDIT.");
    console.log("Check platform.openai.com → Settings → Billing. Add credit if balance is $0.");
  } else if (res.status === 404) {
    console.log(`❌ 404 — model "${model}" not available for this key. Try gpt-4o-mini.`);
  } else {
    console.log(`❌ HTTP ${res.status}:`, JSON.stringify(data).slice(0, 300));
  }
} catch (err) {
  console.log("❌ NETWORK ERROR:", err.message);
  console.log("Could not reach api.openai.com at all. Check:");
  console.log("  • Internet connection / VPN / proxy / firewall");
  console.log("  • Some ISPs/corporate networks block OpenAI — try a different network or hotspot");
}
