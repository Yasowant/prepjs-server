// Sends email via Resend HTTP API (no SDK needed).
// If RESEND_API_KEY is missing, logs the email to the console instead
// so you can still test the flow locally.
export async function sendEmail({ to, subject, html }) {
  if (!process.env.RESEND_API_KEY) {
    console.log("📧 [DEV — no RESEND_API_KEY] Email that would be sent:");
    console.log("To:", to, "| Subject:", subject);
    console.log(html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
    return { dev: true };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || "onboarding@resend.dev",
      to,
      subject,
      html,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Resend error:", err);
    throw new Error("Failed to send email");
  }
  return res.json();
}

export function resetEmailHtml(name, link) {
  return `
  <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;background:#0b0f1a;color:#e6ebf5;border-radius:14px;padding:36px">
    <h1 style="margin:0 0 8px">⚡ Prep<span style="color:#facc15">JS</span></h1>
    <h2 style="margin:0 0 16px;font-size:20px">Reset your password, ${name}</h2>
    <p style="color:#94a3b8;line-height:1.6">
      Someone (hopefully you) requested a password reset. Click below to choose a new password.
    </p>
    <a href="${link}"
       style="display:inline-block;margin:20px 0;padding:14px 28px;background:#facc15;color:#1a1a06;font-weight:bold;border-radius:10px;text-decoration:none">
      Reset my password
    </a>
    <p style="color:#94a3b8;font-size:13px">
      Or copy this link:<br/><a href="${link}" style="color:#38bdf8">${link}</a>
    </p>
    <p style="color:#64748b;font-size:12px;margin-top:24px">
      Link expires in 1 hour. If you didn't request this, ignore this email — your password is unchanged.
    </p>
  </div>`;
}

export function verificationEmailHtml(name, link) {
  return `
  <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;background:#0b0f1a;color:#e6ebf5;border-radius:14px;padding:36px">
    <h1 style="margin:0 0 8px">⚡ Prep<span style="color:#facc15">JS</span></h1>
    <h2 style="margin:0 0 16px;font-size:20px">Verify your email, ${name} 👋</h2>
    <p style="color:#94a3b8;line-height:1.6">
      One click and you're in — ${""}76+ JavaScript concepts, quizzes, a VS Code playground and your AI coach are waiting.
    </p>
    <a href="${link}"
       style="display:inline-block;margin:20px 0;padding:14px 28px;background:#facc15;color:#1a1a06;font-weight:bold;border-radius:10px;text-decoration:none">
      Verify my email
    </a>
    <p style="color:#94a3b8;font-size:13px">
      Or copy this link:<br/><a href="${link}" style="color:#38bdf8">${link}</a>
    </p>
    <p style="color:#64748b;font-size:12px;margin-top:24px">
      Link expires in 24 hours. If you didn't create a PrepJS account, ignore this email.
    </p>
  </div>`;
}
