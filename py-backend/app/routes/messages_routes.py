from fastapi import Depends, HTTPException, APIRouter
from fastapi.responses import JSONResponse
import os
from app.utils.database import get_db
from app.models.schemas import Message
from app.utils.auth import get_current_user

router = APIRouter()

# Ensure only authenticated users can access these routes
def authenticated_user():
    return Depends(get_current_user)

@router.get("/messages/{chat_id}")
async def get_messages(chat_id: int, db=Depends(get_db), user_id=authenticated_user()):
    """
    Retrieve all messages for a specific chat.
    """
    query = """
        SELECT id, chat_id, role, content, created_at
        FROM messages
        WHERE chat_id = $1
        ORDER BY created_at ASC
    """
    result = await db.fetch(query, chat_id)
    return JSONResponse(content=[dict(row) for row in result])

@router.post("/messages/send")
async def save_message(message: Message, db=Depends(get_db), user_id=authenticated_user()):
    """
    Save a new message for a chat.
    """
    if not message.chat_id or not message.content or message.content.strip() == "":
        raise HTTPException(status_code=400, detail="chatId and content are required")
    
    if message.role == "assistant":
        query = """
            INSERT INTO messages (chat_id, role, content, code)
            VALUES ($1, $2, $3, $4)
            RETURNING id, chat_id, role, content, code, created_at
        """
        params = [message.chat_id, message.role, message.content, message.code]
    else:
        query = """
            INSERT INTO messages (chat_id, role, content)
            VALUES ($1, $2, $3)
            RETURNING id, chat_id, role, content, created_at
        """
        params = [message.chat_id, message.role, message.content]
    
    result = await db.fetchrow(query, *params)
    return JSONResponse(content=dict(result), status_code=201)