from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import StreamingResponse
import json
# Import necessary components (assuming these are available in your project structure)
from app.utils.database import get_db
from app.utils.auth import get_current_user
from app.models.schemas import ChatRequest
from app.utils.assistant.model_selector import llm_service
from app.utils.assistant.stream_utils import get_ollama_stream, get_gemini_stream
from app.utils.assistant.chat_utils import get_chat_history, build_context_prompt
from app.utils.assistant.parser import parse_llm_response
from app.utils.extract.file_extract import extract_text_from_file
import uuid # For generating unique file IDs
import os # For local file operations

router = APIRouter(prefix="/assistant", tags=["assistant"])

# --- Helper function for text extraction (Placeholder for complexity) ---

def authenticated_user():
    return Depends(get_current_user)

@router.post("/upload-document")
async def upload_document(
    file: UploadFile = File(...), # The uploaded file
    db=Depends(get_db),
    user_id=authenticated_user() # Dependency to ensure authentication
):
    """
    Handles file upload, extracts text content, saves document metadata/content 
    to the database, and returns the unique document ID.
    """
    print(f"Processing document upload for user: {user_id}")
    
    try:
        # 1. Extract Text Content
        extracted_content = await extract_text_from_file(file)
        
        # 2. Generate a unique ID for the document entry
        document_id = str(uuid.uuid4())
        
        # 3. Save Document Metadata/Content to DB (using user_id, file_name, and content)
        # Assuming the 'documents' table exists with columns: id, user_id, file_name, content
        # If your table has a file_path, you would save the file to a cloud storage (S3/GCS) 
        # or local disk and save the path here. For now, we save content directly.
        
        # NOTE: Your schema requested user_id, file_name, file_path.
        # We'll use the 'content' column to hold the extracted text for simplicity.
        # If you must stick to file_path, you'd save the file locally here:
        
        # --- Local File Saving Placeholder (if needed to match your requested schema) ---
        # file_location = f"./uploaded_files/{user_id}_{document_id}_{file.filename}"
        # os.makedirs(os.path.dirname(file_location), exist_ok=True)
        # with open(file_location, "wb") as f:
        #     f.write(await file.read())
        # file_path = file_location 
        
        # For this example, let's use the extracted text as the main stored data:
        file_path = f"Text content saved: {len(extracted_content)} bytes." # Placeholder for path
        
        await db.execute(
            """
            INSERT INTO documents (id, user_id, file_name, file_path, content) 
            VALUES ($1, $2, $3, $4, $5)
            """,
            document_id, user_id, file.filename, file_path, extracted_content
        )
        
        print(f"Document saved with ID: {document_id}")
        
        return {"document_id": document_id, "file_name": file.filename}

    except Exception as e:
        print(f"Error during file upload: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to process file upload: {str(e)}")

@router.post("/send")
async def send_chat_stream(
    request_data: ChatRequest, 
    db=Depends(get_db), 
    user_id=authenticated_user()  # Dependency to ensure authentication
):
    """
    Endpoint for streaming AI responses via Server-Sent Events (SSE).
    (Existing streaming logic)
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
                 # Gemini chunks may not always contain 'text'
                    content_chunk = getattr(chunk, "text", "") or ""

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
        print(f"Error processing chat request: {e}")
        # Send an error message to the client before raising the HTTP exception
        return StreamingResponse(
            (f"data: {json.dumps({'content': 'An error occurred during streaming.', 'error': str(e)})}\n\n",
             f"data: {json.dumps({'content': '[DONE]', 'db_saved': False})}\n\n"),
            media_type="text/event-stream",
            status_code=500
        )