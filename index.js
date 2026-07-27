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

  // 🌍 Greetings in multiple languages
  const greetings = [
    "hi",
    "hii",
    "hiii",
    "hello",
    "hey",
    "heyy",
    "yo",
    "hola",
    "bonjour",
    "namaste",
    "namaskar",
    "नमस्ते",
    "नमस्कार",
    "राम राम",
    "जय श्री राम",
    "good morning",
    "good afternoon",
    "good evening",
    "good night",
    "salaam",
    "ciao",
    "konnichiwa",
    "annyeong",
    "ni hao",
    "marhaba"
  ];

  // 👋 Welcome Message
  if (greetings.includes(msg)) {
    return `👋 Hello! नमस्ते!

Welcome to *Ashutosh AI Assistant* 🤖

I'm Ashutosh's AI portfolio assistant.

📋 Available options:

1️⃣ About Me
2️⃣ My Projects
3️⃣ Skills
4️⃣ Resume
5️⃣ Contact
6️⃣ GitHub
7️⃣ LinkedIn

💬 Reply with a number or type *menu* anytime.`;
  }

  switch (msg) {
    case "1":
      return `👨‍💻 *About Me*

Hi! I'm Ashutosh, a Full Stack Developer from India.

💻 I specialize in:
• React.js
• Node.js
• Laravel
• PHP
• MySQL
• JavaScript

🤖 Currently building AI-powered applications and e-commerce websites.`;

    case "2":
  return `🚀 *My Projects*

1️⃣ 🤖 Hospital WhatsApp Chatbot
   Tech: Node.js • Express • WhatsApp Cloud API

2️⃣ 🗳️ Online Voting System
   Tech: PHP • MySQL • Bootstrap

3️⃣ 🌐 Personal Portfolio
   Tech: React.js • GSAP • Tailwind CSS

4️⃣ 🤖 AI Chatbot Projects
   Tech: OpenAI API • Node.js

5️⃣ 🏨 Banquet Management System
   Tech: Laravel • PHP • MySQL

6️⃣ 📝 Blog Management System
   Tech: Laravel • PHP • MySQL

7️⃣ 📋 Task Pilot
   Tech: React.js • Node.js • MongoDB

💻 Want to see the source code?
Reply *6* to open my GitHub profile.
`;

    case "3":
      return `💻 *Technical Skills*

✔ React.js
✔ Node.js
✔ Laravel
✔ PHP
✔ MySQL
✔ JavaScript
✔ REST APIs
✔ Git & GitHub
✔ HTML/CSS
✔ Bootstrap`;

    case "4":
      return `📄 *Resume*

I'm currently updating my resume.

It will be available soon. 😊`;

    case "5":
      return `📞 *Contact Information*

📧 Email:
ap3940862@email.com

📱 Phone:
+91 96387 76815`;

    case "6":
      return `🔗 *GitHub*

https://github.com/ashutosh7556`;

    case "7":
      return `💼 *LinkedIn*

(Add your LinkedIn profile here)

https://www.linkedin.com/in/ashutosh-pandey-b3470b35a/`;

    case "menu":
      return `📋 *Main Menu*

1️⃣ About Me
2️⃣ My Projects
3️⃣ Skills
4️⃣ Resume
5️⃣ Contact
6️⃣ GitHub
7️⃣ LinkedIn

Reply with the corresponding number.`;

    default:
      return `🤔 Sorry, I couldn't understand your message.

💡 Try one of these:

👋 Hi
👋 Hello
🙏 Namaste
📋 Menu

Or reply with:

1️⃣ About Me
2️⃣ My Projects
3️⃣ Skills
4️⃣ Resume
5️⃣ Contact
6️⃣ GitHub
7️⃣ LinkedIn

😊 I'm here to help!`;
  }
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
