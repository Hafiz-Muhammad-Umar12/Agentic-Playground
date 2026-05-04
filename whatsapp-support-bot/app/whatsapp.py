import httpx
from config.settings import settings

# Meta API base URL
META_API_URL = "https://graph.facebook.com/v19.0"

async def send_whatsapp_message(to: str, message: str) -> bool:
    """
    Customer ko WhatsApp message bhejo
    
    Args:
        to: Customer ka phone number (international format: 923001234567)
        message: Bhejne wala message
    
    Returns:
        True agar message send hua, False agar error aaya
    """
    
    url = f"{META_API_URL}/{settings.meta_phone_number_id}/messages"
    
    headers = {
        "Authorization": f"Bearer {settings.meta_access_token}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": to,
        "type": "text",
        "text": {
            "preview_url": False,
            "body": message
        }
    }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                url,
                headers=headers,
                json=payload,
                timeout=10.0
            )
            
            if response.status_code == 200:
                print(f"✅ Message sent to {to}")
                return True
            else:
                print(f"❌ Meta API Error: {response.text}")
                return False
                
    except Exception as e:
        print(f"❌ Send Error: {e}")
        return False


def extract_message_data(payload: dict) -> tuple[str, str] | None:
    try:
        entry = payload["entry"][0]
        changes = entry["changes"][0]
        value = changes["value"]

        if "messages" not in value:
            return None

        message = value["messages"][0]

        if message["type"] != "text":
            return None

        phone_number = message["from"]
        message_text = message["text"]["body"]

        return phone_number, message_text

    except (KeyError, IndexError) as e:
        print(f"❌ Extract Error: {e}")
        return None