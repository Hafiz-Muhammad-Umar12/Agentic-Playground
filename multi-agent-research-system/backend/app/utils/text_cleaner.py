import re

def clean_text(text: str) -> str:
    """Removes excessive whitespace and standardizes text format."""
    text = re.sub(r'\s+', ' ', text)
    return text.strip()