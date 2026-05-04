from fastapi import FastAPI, Request, Response
import requests
import os

app = FastAPI(title="WhatsApp Bot")

# ─────────────────────────────
# ENV (use .env or system env)
# ─────────────────────────────
WHATSAPP_TOKEN = os.getenv("META_ACCESS_TOKEN")
PHONE_NUMBER_ID = os.getenv("META_PHONE_NUMBER_ID")
VERIFY_TOKEN = os.getenv("WEBHOOK_VERIFY_TOKEN")


# ─────────────────────────────
# HEALTH CHECK
# ─────────────────────────────
@app.get("/")
def home():
    return {"status": "Bot running ✅"}


# ─────────────────────────────
# WEBHOOK VERIFY (Meta)
# ─────────────────────────────
@app.get("/webhook")
def verify(request: Request):
    params = request.query_params

    mode = params.get("hub.mode")
    token = params.get("hub.verify_token")
    challenge = params.get("hub.challenge")

    print("VERIFY TOKEN RECEIVED:", token)
    print("VERIFY TOKEN EXPECTED:", VERIFY_TOKEN)

    if mode == "subscribe" and token == VERIFY_TOKEN:
        return Response(content=challenge, media_type="text/plain")

    return Response(content="Forbidden", status_code=403)


# ─────────────────────────────
# EXTRACT MESSAGE
# ─────────────────────────────
def extract_message(payload):
    try:
        entry = payload["entry"][0]
        changes = entry["changes"][0]["value"]

        messages = changes.get("messages")
        if not messages:
            return None

        msg = messages[0]
        phone = msg["from"]
        text = msg["text"]["body"]

        return phone, text

    except Exception as e:
        print("❌ Extract error:", e)
        return None


# ─────────────────────────────
# SEND MESSAGE
# ─────────────────────────────
def send_message(to, text):
    url = f"https://graph.facebook.com/v19.0/{PHONE_NUMBER_ID}/messages"

    headers = {
        "Authorization": f"Bearer {WHATSAPP_TOKEN}",
        "Content-Type": "application/json"
    }

    payload = {
        "messaging_product": "whatsapp",
        "to": to,
        "type": "text",
        "text": {"body": text}
    }

    res = requests.post(url, headers=headers, json=payload)

    print("📤 STATUS:", res.status_code)
    print("📤 RESPONSE:", res.text)


# ─────────────────────────────
# MAIN WEBHOOK
# ─────────────────────────────
@app.post("/webhook")
async def webhook(request: Request):
    payload = await request.json()

    print("\n🔥 RAW PAYLOAD:")
    print(payload)

    data = extract_message(payload)

    if not data:
        print("⚠️ No user message (likely status update)")
        return {"status": "ignored"}

    phone, text = data

    print("👤 FROM:", phone)
    print("💬 MESSAGE:", text)

    # simple AI reply (replace with Claude/OpenAI later)
    reply = f"You said: {text}"

    print("🤖 REPLY:", reply)

    send_message(phone, reply)

    return {"status": "ok"}