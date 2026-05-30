
import twilio from "twilio";
import dotenv from "dotenv";

dotenv.config();

// Variáveis de ambiente
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

// Verifica se as variáveis existem
if (!accountSid || !authToken) {
  throw new Error(
    "TWILIO_ACCOUNT_SID ou TWILIO_AUTH_TOKEN não definidos no arquivo .env"
  );
}

// Cliente Twilio
const client = twilio(accountSid, authToken);

async function sendWhatsAppMessage(): Promise<void> {
  try {
    const message = await client.messages.create({
      body: "Olá! Esta é uma mensagem enviada via Twilio e Node.js com TypeScript.",
      
      // Número do Sandbox ou número oficial Twilio
      from: "whatsapp:+14155238886",

      // Número destino
      to: "whatsapp:+555399132170",
    });

    console.log("Mensagem enviada com sucesso!");
    console.log("SID:", message.sid);

  } catch (error) {
    console.error("Erro ao enviar mensagem:");

    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error(error);
    }
  }
}

sendWhatsAppMessage();
