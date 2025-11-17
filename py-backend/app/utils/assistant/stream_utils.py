# app/utils/assistant/stream_utils.py (FIXED)

from typing import List, Dict, Any, AsyncGenerator, TYPE_CHECKING
# Import the actual types for type checking
if TYPE_CHECKING:
    from ollama import AsyncClient as OllamaAsyncClient
    from google import genai
    from google.genai.types import Content, Part, GenerateContentResponse

# Import for runtime
try:
    from ollama import AsyncClient as OllamaAsyncClient
except ImportError:
    # Use a dummy class as a placeholder type for environments without ollama
    class OllamaAsyncClient: pass

try:
    from google import genai
    from google.genai.types import Content, Part, GenerateContentResponse
    
except ImportError:
    # Use a dummy class as a placeholder type for environments without google-genai
    genai = None
    class Content: pass
    class Part: pass
    class GenerateContentResponse: pass

# Type hint for a message as stored in the database
DbMessage = Dict[str, Any]

# --- Helper Functions for Message Conversion ---

def _to_ollama_messages(history: List[DbMessage], user_message: str) -> List[Dict[str, str]]:
    """
    Converts database history and the new user message into Ollama's message format.
    Ollama expects a list of dictionaries with 'role' and 'content' keys.
    """
    ollama_messages = []
    for msg in history:
        # Ollama supports 'user' and 'assistant' roles for chat history
        role = msg.get('role')
        content = msg.get('content')
        if role in ['user', 'assistant'] and content:
            ollama_messages.append({'role': role, 'content': content})
    
    # Add the latest user message
    ollama_messages.append({'role': 'user', 'content': user_message})
    return ollama_messages

def _to_gemini_contents(history: List[DbMessage], user_message: str) -> List[Content]:
    """
    Converts database history and the new user message into Gemini's Content format.
    Gemini expects a list of Content objects, alternating 'user' and 'model' roles.
    """
    if genai is None:
        raise RuntimeError("Google GenAI SDK is not installed or configured.")

    gemini_contents = []
    for msg in history:
        role = msg.get('role')
        content = msg.get('content')
        
        # Gemini uses 'user' and 'model' roles
        gemini_role = 'user' if role == 'user' else 'model' if role == 'assistant' else None
        
        if gemini_role and content:
            gemini_contents.append(
                Content(
                    role=gemini_role,
                    parts=[Part.from_text(content)]
                )
            )

    # Add the latest user message (always 'user' role)
    gemini_contents.append(
        Content(
            role='user',
            parts=[Part.from_text(user_message)]
        )
    )
    return gemini_contents

async def get_ollama_stream(
    llm_client: OllamaAsyncClient, 
    model_name: str, 
    history: List[DbMessage], 
    user_message: str
) -> AsyncGenerator[Dict[str, Any], None]:
    """
    Generates an asynchronous stream of response chunks from the Ollama model.
    This function is exported and used by assistant_routes.py.
    """
    messages = _to_ollama_messages(history, user_message)
    
    stream = await llm_client.chat(
        model=model_name,
        messages=messages,
        stream=True
    )
    
    async for chunk in stream:
        yield chunk

async def get_gemini_stream(
    llm_client: genai.Client, 
    model_name: str, 
    history: List[DbMessage], 
    user_message: str
) -> AsyncGenerator[genai.types.GenerateContentResponse, None]:
    """
    Generates an asynchronous stream of response chunks from the Gemini model.
    This function is exported and used by assistant_routes.py.
    """
    if genai is None:
        # Raise if genai client is used without the library installed
        raise ImportError("google-genai library not found. Please install it.")
        
    contents = _to_gemini_contents(history, user_message)
    
    stream = await llm_client.models.generate_content_stream(
        model=model_name,
        contents=contents,
    )

    # The stream itself is an async iterator
    async for chunk in stream:
        yield chunk

# FastAPI endpoint code
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
import json
# Import necessary components
from app.utils.database import get_db
from app.utils.auth import get_current_user
from app.models.schemas import ChatRequest
from app.utils.assistant.model_selector import llm_service
from app.utils.assistant.chat_utils import get_chat_history, build_context_prompt
from app.utils.assistant.parser import parse_llm_response
from app.utils.assistant.stream_utils import get_ollama_stream, get_gemini_stream # <--- NEW IMPORT

router = APIRouter()

def authenticated_user():
    return Depends(get_current_user)

@router.post("/send")
async def send_chat_stream(
    request_data: ChatRequest, 
    db=Depends(get_db), 
    user_id=authenticated_user()  # Dependency to ensure authentication
):
    """
    Endpoint for streaming AI responses via Server-Sent Events (SSE).
    Retrieves chat history, creates a context-aware prompt, and streams the response.
    """
    print("Processing chat request")
    chat_id = request_data.chat_id
    user_message = request_data.message
    model_identifier = request_data.model
    is_cloud = request_data.is_cloud

    if not user_message or not chat_id:
        raise HTTPException(status_code=400, detail="message and chat_id required")

    # 1. Save user message to DB
    print(f"Saving user message to DB: chat_id={chat_id}, role=user, content={user_message}")
    # Note: Use parameter binding ($1, $2, etc.) for SQL injection prevention
    await db.execute(
        """INSERT INTO messages (chat_id, role, content) VALUES ($1, $2, $3)""",
        chat_id, "user", user_message
    )

    # 2. Retrieve history and build context prompt
    # history will be used by the model stream helpers to build the full context
    history = await get_chat_history(db, chat_id, limit=10)
    # The build_context_prompt is not strictly needed here since the stream utilities will
    # handle building the context from the message history, but kept for future use if needed.
    prompt = build_context_prompt(history, user_message) 
    print(f"Built context prompt (truncated for display): {prompt[:100]}...")

    try:
        # 3. Get the correct LLM client
        llm_client = llm_service.get_llm_client(model_identifier, is_cloud)
        # Extract just the model name (e.g., "llama3" or "gemini-2.5-flash")
        model_name = model_identifier.split(":")[1] 

        # 4. Define the async generator for SSE
        async def event_generator():
            full_response_text = ""
            
            # --- Ollama Streaming Logic ---
            if model_identifier.startswith("ollama:"):
                print(f"Streaming from Ollama model: {model_name}")
                # get_ollama_stream is assumed to handle history and return an async iterable of dicts
                stream = await get_ollama_stream(
                    llm_client, 
                    model_name, # Ollama stream often takes just the model name
                    history, # Pass the history for the stream utility to construct messages
                    user_message # Pass the latest message
                )
                
                async for chunk in stream:
                    # Ollama chunks often contain the content under the 'content' key in the 'message' dict
                    content_chunk = chunk.get("message", {}).get("content", "")
                    if content_chunk:
                        full_response_text += content_chunk
                        # SSE format: data: <JSON object>\n\n
                        yield f"data: {json.dumps({'content': content_chunk})}\n\n"
                        
            # --- Gemini Streaming Logic ---
            elif model_identifier.startswith("gemini:"):
                print(f"Streaming from Gemini model: {model_name}")
                # get_gemini_stream is assumed to handle history and return an async iterable of Response objects
                stream = await get_gemini_stream(
                    llm_client,
                    model_name,
                    history, # Pass the history for the stream utility to construct contents
                    user_message # Pass the latest message
                )

                async for chunk in stream:
                    # Gemini chunks have the text content directly on the chunk object
                    # We must check if the chunk.text exists, as some intermediate chunks may not
                    content_chunk = getattr(chunk, 'text', '')
                    if content_chunk:
                        full_response_text += content_chunk
                        # SSE format: data: <JSON object>\n\n
                        yield f"data: {json.dumps({'content': content_chunk})}\n\n"
                    
            # 5. After the stream ends, parse and save the full assistant message
            
            # Use the markdown parser to separate content and code
            content, code = parse_llm_response(full_response_text)
            print(f"Parsed response: content={content[:50]}..., code={code[:50]}...")
            
            # Save the full assistant response
            print(f"Saving assistant response to DB: chat_id={chat_id}, role=assistant...")
            await db.execute(
                """INSERT INTO messages (chat_id, role, content, code) VALUES ($1, $2, $3, $4)""",
                chat_id, "assistant", content, code
            )
            
            # Send a 'done' message to the client
            yield f"data: {json.dumps({'content': '[DONE]', 'db_saved': True, 'has_code': bool(code)})}\n\n"

        # Return the StreamingResponse
        return StreamingResponse(
            event_generator(),
            media_type="text/event-stream"
        )

    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Error processing chat request: {e}")
        # Send an error message to the client before raising the HTTP exception
        return StreamingResponse(
            (f"data: {json.dumps({'content': 'An error occurred during streaming.', 'error': str(e)})}\n\n",
             f"data: {json.dumps({'content': '[DONE]', 'db_saved': False})}\n\n"),
            media_type="text/event-stream",
            status_code=500
        )
        
        
        