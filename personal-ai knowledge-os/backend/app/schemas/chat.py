from fastapi import APIRouter

router = APIRouter()

@router.post("/")
def chat_endpoint(data: dict):
    user_message = data.get("message", "")

    return {
        "input": user_message,
        "response": "Backend ready — next step me AI agent connect karenge 🤖"
    }

    @router.post("/")
def chat_endpoint(data: ChatRequest):
    result = handle_chat(data.message)

    return {
        "input": data.message,
        "plan": result["plan"],
        "response": result["answer"]
    }