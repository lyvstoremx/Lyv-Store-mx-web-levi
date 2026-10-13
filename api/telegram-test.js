export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      ok: false,
      error: "Método no permitido"
    });
  }
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  const receivedSecret = req.headers["x-lyv-webhook-secret"];
  if (!secret || receivedSecret !== secret) {
    return res.status(401).json({
      ok: false,
      error: "No autorizado"
    });
  }
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    return res.status(500).json({
      ok: false,
      error: "Falta configurar Telegram en Vercel"
    });
  }
  try {
    const payload = req.body || {};
    const record = payload.record || payload;
    // Solo avisar cuando se crea una recarga.
    if (
      payload.type &&
      payload.type !== "INSERT"
    ) {
      return res.status(200).json({
        ok: true,
        skipped: true
      });
    }
    const status = String(
      record.status || "PENDING"
    ).toUpperCase();
    if (status !== "PENDING") {
      return res.status(200).json({
        ok: true,
        skipped: true
      });
    }
    const money = Number(record.amount_mxn || 0);
    const message = [
      "🔔 NUEVA RECARGA — LYV STORE MX",
      "",
      `👤 Usuario: ${record.lyv_user_id || "No disponible"}`,
      `💰 Monto: $${money.toFixed(2)} MXN`,
      `💳 Método: ${record.payment_method || "No disponible"}`,
      `🔑 Código: ${record.payment_code || "No disponible"}`,
      `🧾 Referencia: ${record.transaction_id || "No proporcionada"}`,
      "",
      "⏳ Estado: PENDIENTE",
      "",
      "⚠️ Verifica el pago directamente antes de aprobar la recarga."
    ].join("\n");
    const response = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message
        })
      }
    );
    const result = await response.json();
    if (!response.ok || !result.ok) {
      console.error("Telegram error:", result);
      return res.status(502).json({
        ok: false,
        error: "Telegram no pudo enviar el mensaje"
      });
    }
    return res.status(200).json({
      ok: true,
      message: "Alerta enviada"
    });
  } catch (error) {
    console.error("Recharge alert error:", error);
    return res.status(500).json({
      ok: false,
      error: "Error interno al enviar la alerta"
    });
  }
}
