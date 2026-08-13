import { Resend } from "resend";

let cachedClient: Resend | null | undefined;

function getClient() {
  if (cachedClient !== undefined) return cachedClient;
  const apiKey = process.env.RESEND_API_KEY;
  cachedClient = apiKey ? new Resend(apiKey) : null;
  return cachedClient;
}

export async function sendVerificationEmail(to: string, token: string) {
  const appUrl = process.env.APP_URL || "http://localhost:3000";
  const link = `${appUrl}/api/auth/verify?token=${token}`;
  const client = getClient();

  if (!client) {
    console.log("\n=== ССЫЛКА ДЛЯ ПОДТВЕРЖДЕНИЯ ПОЧТЫ (RESEND_API_KEY не задан) ===");
    console.log(`Кому: ${to}`);
    console.log(link);
    console.log("==================================================================\n");
    return;
  }

  const from = process.env.MAIL_FROM;
  if (!from) {
    throw new Error(
      "MAIL_FROM не задан в .env — укажите адрес на верифицированном в Resend домене"
    );
  }

  const { error } = await client.emails.send({
    from,
    to,
    subject: "Подтвердите почту — Синеклуб",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color:#0F1115;">Добро пожаловать в Синеклуб 🎬</h2>
        <p>Чтобы завершить регистрацию, подтвердите свой email:</p>
        <p>
          <a href="${link}" style="background:#E8B54A;color:#0F1115;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block;">
            Подтвердить почту
          </a>
        </p>
        <p style="color:#888;font-size:13px;">Ссылка действительна 24 часа. Если вы не регистрировались — просто проигнорируйте это письмо.</p>
      </div>
    `,
  });

  if (error) {
    throw new Error(`Resend error: ${error.message}`);
  }
}
