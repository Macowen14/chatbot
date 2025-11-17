from app.utils.models.schemas import Message

SYSTEM_PROMPT = """
You are a helpful and concise assistant. Your task is to respond to the user's latest question.
Use the provided chat history as context to determine if the user's question is related to previous turns.
If related, use the context for a more informed and appropriate answer.
If your response contains code, you MUST format it in a Markdown fenced code block (e.g., ```python ... ```).

Chat History:
---
{history_context}
---

User's current question: "{current_message}"
"""

async def get_chat_history(db, chat_id: int, limit: int = 10) -> list[Message]:
    """Retrieves the last N messages for a chat."""
    query = """
        SELECT role, content, code
        FROM messages
        WHERE chat_id = $1
        ORDER BY created_at DESC
        LIMIT $2
    """
    rows = await db.fetch(query, chat_id, limit)
    # Reverse to maintain chronological order for the prompt
    return [Message(**dict(row)) for row in reversed(rows)]

def build_context_prompt(history: list[Message], current_message: str) -> str:
    """Formats the history into a single context string for the prompt."""
    history_context = ""
    for msg in history:
        # Format the message for the model context
        content = msg.content
        if msg.role == "assistant" and msg.code:
            # Include code for context if it was an assistant message
            content += f"\n```\n{msg.code}\n```"
        
        history_context += f"- **{msg.role.capitalize()}**: {content}\n"

    return SYSTEM_PROMPT.format(
        history_context=history_context.strip() or "No previous context.",
        current_message=current_message
    )