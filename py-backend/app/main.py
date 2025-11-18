from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import chat_routes, auth_routes, messages_routes, assistant_routes

app = FastAPI(title="Chatbot API", version="1.0")

# Enable CORS to allow requests from any origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers for different parts of the API
app.include_router(auth_routes.auth_router, prefix="/api/auth", tags=["Authentication"])
app.include_router(chat_routes.router, prefix="/api/chat", tags=["Chat Lists"])
app.include_router(messages_routes.router, prefix='/api/message', tags=['Messages'])
app.include_router(assistant_routes.router, prefix='/api/assistant', tags=['AI assistant'])

# Health check route to show the server is live
@app.get("/", tags=["Health Check"])
def read_root():
    """
    Health check endpoint to verify the server is live.
    
    Returns:
        dict: A dictionary containing a welcome message and API details.
    """
    return {
        "message": "Chatbot API is live!",
        "details": {
            "title": app.title,
            "version": app.version,
            "description": "This is a chatbot API providing authentication, chat lists, and message handling."
        }
    }