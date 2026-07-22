# CityHospital WhatsApp Bot

A simple WhatsApp chatbot for **CityHospital**, built with Node.js + Express and
Meta's **WhatsApp Cloud API** (free test number for now — no production number yet).

## Features

- Webhook verification for Meta.
- Keyword replies:
  - `hi` / `hello` → "Hi, hello from Ashutosh!"
  - `menu` → numbered options (Book Appointment, Contact Support, Hospital Info)
  - anything else → echoes your text and suggests typing `menu`

---

## Prerequisites

- [Node.js](https://nodejs.org/) 18+ installed.
- A Meta developer account with a WhatsApp app + free test number set up at
  [developers.facebook.com](https://developers.facebook.com/).

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create your `.env`

Copy the template and fill in your real values:

```bash
# macOS / Linux
cp .env.example .env

# Windows (PowerShell)
Copy-Item .env.example .env
```

Then edit `.env`:

| Variable          | Where to get it                                                                 |
| ----------------- | ------------------------------------------------------------------------------- |
| `VERIFY_TOKEN`    | You invent this. Any random string. Must match the one you enter in Meta.       |
| `WHATSAPP_TOKEN`  | Meta App Dashboard → **WhatsApp → API Setup → Temporary access token**.          |
| `PHONE_NUMBER_ID` | Meta App Dashboard → **WhatsApp → API Setup → Phone number ID**.                 |
| `PORT`            | Local port (default `3000`).                                                    |

> ⚠️ The temporary access token expires in ~24 hours. Regenerate it in API Setup
> when the bot stops sending replies.

### 3. Run the server locally

```bash
npm start
# or
node index.js
```

You should see: `Server listening on port 3000`.

---

## Connect to Meta

### 4. Expose your local server with ngrok

In a **second terminal**:

```bash
npx ngrok http 3000
```

Copy the HTTPS forwarding URL it prints, e.g. `https://abcd-1234.ngrok-free.app`.

### 5. Set the Callback URL in Meta

In the Meta App Dashboard → **WhatsApp → Configuration → Webhook → Edit**:

- **Callback URL:** `https://abcd-1234.ngrok-free.app/webhook`
  (your ngrok URL + `/webhook`)
- **Verify token:** the exact same value as `VERIFY_TOKEN` in your `.env`.

Click **Verify and Save**. Your server console should log `Webhook verified.`

Then **Subscribe** to the `messages` webhook field.

### 6. Test it

From the **WhatsApp > API Setup** page, add your personal number as a recipient,
then send a WhatsApp message to the **free test number**:

- Send `hi` → bot replies "Hi, hello from Ashutosh!"
- Send `menu` → bot replies with the numbered options.
- Send anything else → bot echoes it back.

---

## Notes

- This uses Meta's free test number, so you can only message numbers you've added
  as allowed recipients in API Setup.
- Keep ngrok running while testing; if you restart ngrok you get a new URL and
  must update the Callback URL again.
