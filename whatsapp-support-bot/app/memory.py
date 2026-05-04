from collections import defaultdict
from typing import List, Dict

# Har user ka conversation history alag store hoga
conversation_store: Dict[str, List[dict]] = defaultdict(list)

def get_history(user_id: str) -> List[dict]:
    """User ki purani conversation lo"""
    return conversation_store[user_id]

def add_message(user_id: str, role: str, content: str):
    """Naya message history mein add karo"""
    conversation_store[user_id].append({
        "role": role,
        "content": content
    })

def clear_history(user_id: str):
    """Conversation reset karo"""
    conversation_store[user_id] = []