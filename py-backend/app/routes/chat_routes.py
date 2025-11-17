from fastapi import Depends, HTTPException, Query, APIRouter
from fastapi.responses import JSONResponse
import asyncpg
import os
from app.utils.database import get_db
from app.utils.models.schemas import Chat
from app.utils.auth import get_current_user

router = APIRouter()

# Ensure only authenticated users can access these routes
def authenticated_user():
    return Depends(get_current_user)


@router.get("/search")
async def search_chat(query: str = Query(..., min_length=1), db=Depends(get_db), user_id=authenticated_user()):
    """
    Search for chats based on the query parameter.
    """
    if not query or query.strip() == "":
        raise HTTPException(status_code=400, detail="Query parameter is required.")
    
    search_term = f"%{query}%"
    query = """
        SELECT DISTINCT c.id, c.title, c.created_at
        FROM chats c
        LEFT JOIN messages m ON m.chat_id = c.id
        WHERE 
              c.title ILIKE $1
           OR m.content ILIKE $1
           OR m.code ILIKE $1
        ORDER BY c.created_at DESC;
    """
    result = await db.fetch(query, search_term)
    return JSONResponse(content=[dict(row) for row in result])


@router.get("/")
async def get_chats(q: str = None, limit: int = 50, offset: int = 0, db=Depends(get_db), user_id=authenticated_user()):
    """
    Retrieve a list of chats with optional query parameters for filtering and pagination.
    """
    query = "SELECT id, title, created_at FROM chats"
    params = []
    
    if q:
        params.append(f"%{q}%")
        query += " WHERE title ILIKE $1"
    
    params.extend([limit, offset])
    query += f" ORDER BY created_at DESC LIMIT ${len(params)} OFFSET ${len(params) + 1}"
    
    result = await db.fetch(query, *params)
    return JSONResponse(content=[dict(row) for row in result])



@router.post("/")
async def save_chat(chat: Chat, db=Depends(get_db), user_id=authenticated_user()):
    """
    Create a new chat.
    """
    query = "INSERT INTO chats (title) VALUES ($1) RETURNING id, title, created_at"
    result = await db.fetchrow(query, chat.title)
    return JSONResponse(content=dict(result), status_code=201)



@router.put("/{chat_id}")
async def update_chat(chat_id: int, chat: Chat, db=Depends(get_db), user_id=authenticated_user()):
    """
    Update an existing chat.
    """
    if not chat.title or chat.title.strip() == "":
        raise HTTPException(status_code=400, detail="Title is required")
    
    query = "UPDATE chats SET title = $1 WHERE id = $2 RETURNING id, title, created_at"
    result = await db.fetchrow(query, chat.title, chat_id)
    
    if not result:
        raise HTTPException(status_code=404, detail="Chat not found")
    
    return JSONResponse(content=dict(result))



@router.delete("/{chat_id}")
async def delete_chat(chat_id: int, db=Depends(get_db), user_id=authenticated_user()):
    """
    Delete a chat and its associated messages.
    """
    async with db.transaction():
        await db.execute("DELETE FROM messages WHERE chat_id = $1", chat_id)
        result = await db.fetchrow("DELETE FROM chats WHERE id = $1 RETURNING id, title", chat_id)
        
        if not result:
            raise HTTPException(status_code=404, detail="Chat not found")
    
    return JSONResponse(content={"message": "Chat deleted", "chat": dict(result)})