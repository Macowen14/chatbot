from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class User(BaseModel):
    username: str
    email: str
    imageurl: str

class UserCreate(BaseModel):
    username: str
    password: str
    email: str
    imageurl: Optional[str]

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class Chat(BaseModel):
    title: str

class Message(BaseModel):
    # This is for messages coming from the user or saved to the DB
    chat_id: int
    role: str = Field(default="user", pattern="^(user|assistant)$")
    content: str
    code: Optional[str] = None # Only populated for assistant messages when code is present


class ChatRequest(BaseModel):
    """
    Schema for the incoming POST request to the /assistant/send endpoint.
    """
    chat_id: str = Field(..., description="The unique ID of the current chat conversation.")
    message: str = Field(..., description="The user's message content.")
    model: str = Field(..., description="The model identifier (e.g., 'gemini:gemini-2.5-flash').")
    is_cloud: bool = Field(..., description="Boolean indicating if a cloud-hosted model should be used.")


class LLMConfig(BaseModel):
    # Configuration for different LLM types
    type: str = Field(pattern="^(ollama|gemini)$")
    model_name: str
    host: Optional[str] = None # For Ollama
    api_key: Optional[str] = None # For Gemini/Cloud Ollama
    
    
class DocumentUploadResponse(BaseModel):
    """
    Schema for the successful response from the /assistant/upload-document endpoint.
    """
    document_id: str = Field(..., description="The unique ID assigned to the saved document.")
    file_name: str = Field(..., description="The original name of the uploaded file.")


class DocumentBase(BaseModel):
    """Base schema for a document, containing core fields."""
    file_name: str = Field(..., description="The original name of the file.")
    file_path: Optional[str] = Field(None, description="The saved path or storage information for the file.")
    content: Optional[str] = Field(None, description="The extracted text content of the file.")
    

class Document(DocumentBase):
    """Full schema for a document, including IDs and timestamps (if applicable)."""
    user_id: str = Field(..., description="The ID of the user who owns the document.")
    chat_id: str =  Field(..., description="The ID of the chat session which contains the document.")
    
    class Config:
        """Allows conversion from ORM objects (like DB row results)."""
        from_attributes = True 

