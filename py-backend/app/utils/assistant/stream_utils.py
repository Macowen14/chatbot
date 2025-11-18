from typing import List, Dict, Any, AsyncGenerator, TYPE_CHECKING
from app.models.schemas import Message
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

def _to_ollama_messages(history: List[Message], user_message: str) -> List[Dict[str, str]]:
    """
    Converts database history and the new user message into Ollama's message format.
    Ollama expects a list of dictionaries with 'role' and 'content' keys.
    """
    ollama_messages = []
    for msg in history:
        # Ollama supports 'user' and 'assistant' roles for chat history
        role = msg.role
        content = msg.content
        if role in ['user', 'assistant'] and content:
            ollama_messages.append({'role': role, 'content': content})
    
    # Add the latest user message
    ollama_messages.append({'role': 'user', 'content': user_message})
    return ollama_messages


def _to_gemini_contents(history: List[Message], user_message: str) -> List[Content]:
    """
    Converts database history and the new user message into Gemini's Content format.
    Gemini expects a list of Content objects, alternating 'user' and 'model' roles.
    """
    if genai is None:
        raise RuntimeError("Google GenAI SDK is not installed or configured.")

    gemini_contents = []
    for msg in history:
        role = msg.role
        content = msg.content
        
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
    llm_client: "genai.Client", 
    model_name: str, 
    history: List[Message], 
    user_message: str
) -> AsyncGenerator["genai.types.GenerateContentResponse", None]:
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

