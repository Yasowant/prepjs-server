// Email diagnostic — run from the server folder:
//   node test-email.js you@example.com
import dotenv from "dotenv";
dotenv.config();

const to = process.argv[2];
const key = process.env.RESEND_API_KEY;
const from = process.env.EMAIL_FROM || "onboarding@resend.dev";

if (!to) {
  console.log("Usage: node test-email.js your@email.com");
  process.exit(1);
}
if (!key) {
  console.log("❌ RESEND_API_KEY missing from .env");
  process.exit(1);
}

console.log(`Key: ${key.slice(0, 8)}…  |  From: ${from}  |  To: ${to}\nSending test email…\n`);

const res = await fetch("https://api.resend.com/emails", {
  method: "POST",
  headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
  body: JSON.stringify({
    from,
    to,
    subject: "PrepJS email test ✅",
    html: "<h2>It works!</h2><p>Your Resend setup is delivering emails.</p>",
  }),
});
const data = await res.json().catch(() => ({}));

if (res.ok) {
  console.log("✅ SUCCESS — Resend accepted it (id:", data.id + ")");
  console.log("Check the inbox (and spam). Also see resend.com → Logs for delivery status.");
} else if (res.status === 401) {
  console.log("❌ 401 — API KEY INVALID/REVOKED.");
  console.log("This key was shared publicly — create a fresh one: resend.com → API Keys.");
} else if (res.status === 403 || JSON.stringify(data).includes("domain")) {
  console.log("❌ DOMAIN NOT VERIFIED for:", from);
  console.log("Fix options:");
  console.log("  1. resend.com → Domains → add esscentra.in → add the DNS records it shows → verify");
  console.log("  2. OR set EMAIL_FROM=onboarding@resend.dev — BUT that only delivers to the");
  console.log("     email address that owns the Resend account (testing only).");
} else if (res.status === 422) {
  console.log("❌ 422 — Invalid request:", data?.message);
  console.log("Common cause: using onboarding@resend.dev but sending to an email that ISN'T your Resend account email.");
} else {
  console.log(`❌ HTTP ${res.status}:`, JSON.stringify(data));
}
