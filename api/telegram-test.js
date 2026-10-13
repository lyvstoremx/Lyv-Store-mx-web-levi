
export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return res.status(500).json({
      error: "Faltan variables de Telegram en Vercel"
    });
  }

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: "✅ ¡Lyv Store Mx conectado! El bot de alertas funciona."
        })
      }
    );

    const result = await response.json();

    if (!response.ok || !result.ok) {
      return res.status(502).json({
        error: "Telegram no pudo enviar el mensaje"
      });
    }

    return res.status(200).json({
      ok: true,
      message: "Mensaje enviado a Telegram"
    });
  } catch {
    return res.status(500).json({
      error: "No se pudo conectar con Telegram"
    });
  }
}
