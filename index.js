require("dotenv").config();

const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

// ---- Keyword-based reply logic ----
function getReply(text) {
  const msg = (text || "").trim().toLowerCase();

  if (msg === "hi" || msg === "hello") {
    return "Hi, hello from Ashutosh!";
  }

  if (msg === "menu") {
    return (
      "Welcome to CityHospital. Please choose an option:\n" +
      "1. Book Appointment\n" +
      "2. Contact Support\n" +
      "3. Hospital Info"
    );
  }

  return `You said: "${text}". Type "menu" to see what I can do.`;
}

// ---- Send a WhatsApp text message back via the Cloud API ----
async function sendMessage(to, body) {
  const url = `https://graph.facebook.com/v20.0/${PHONE_NUMBER_ID}/messages`;

  await axios.post(
    url,
    {
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body },
    },
    {
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
    }
  );
}

// ---- Webhook verification (GET) ----
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Webhook verified.");
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
});

// ---- Incoming messages (POST) ----
app.post("/webhook", async (req, res) => {
  try {
    const value = req.body?.entry?.[0]?.changes?.[0]?.value;
    const message = value?.messages?.[0];
    const status = value?.statuses?.[0];

    // Status callbacks (sent/delivered/read receipts) — no reply needed.
    if (status) {
      console.log(`Status update: ${status.status} for ${status.recipient_id}`);
      if (status.errors) {
        console.error("Status error detail:", JSON.stringify(status.errors));
      }
    }

    if (message && message.type === "text") {
      const from = message.from; // sender's WhatsApp number
      const text = message.text.body;

      console.log(`Incoming message from ${from}: ${text}`);

      const reply = getReply(text);
      await sendMessage(from, reply);
    }
  } catch (err) {
    console.error("Error handling webhook:", err.response?.data || err.message);
  }

  // Always ack Meta with 200 so it doesn't retry.
  res.sendStatus(200);
});

app.get("/", (_req, res) => res.send("CityHospital WhatsApp bot is running."));

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
