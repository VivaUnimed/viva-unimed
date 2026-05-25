import express, { Request, Response } from "express";
import twilio from "twilio";

const app = express();

const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Webhook WhatsApp
app.post("/whatsapp/callback", (req: Request, res: Response) => {
  try {
    const incomingMessage = req.body.Body;
    const senderPhone = req.body.From;

    console.log(
      `Mensagem recebida de ${senderPhone}: ${incomingMessage}`
    );

    // Cria resposta Twilio
    const twiml = new twilio.twiml.MessagingResponse();

    twiml.message(
      "Recebemos sua mensagem! Em breve um atendente falará com você."
    );

    res.set("Content-Type", "text/xml");
    res.status(200).send(twiml.toString());

  } catch (error) {
    console.error("Erro ao processar mensagem:", error);

    res.status(500).json({
      error: "Erro interno no servidor"
    });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
