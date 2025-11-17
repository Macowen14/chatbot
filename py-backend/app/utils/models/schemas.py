from pydantic import BaseModel, Field
from typing import Optional

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
    # Schema for the /assistant/send route
    chat_id: int
    message: str
    model: str = "gemma3:4b" # Default to an Ollama model
    is_cloud: bool = False # Flag to determine if Ollama is local or cloud

class LLMConfig(BaseModel):
    # Configuration for different LLM types
    type: str = Field(pattern="^(ollama|gemini)$")
    model_name: str
    host: Optional[str] = None # For Ollama
    api_key: Optional[str] = None # For Gemini/Cloud Ollama