import os
from ollama import AsyncClient as OllamaAsyncClient
from google import genai  
# The Ollama cloud models use the Ollama API, but require authentication and a specific host.

# --- Configuration Constants ---
# Ollama Local: Standard default host
OLLAMA_LOCAL_HOST = "http://localhost:11434"

# Ollama Cloud: Official host for their hosted models (requires API key)
OLLAMA_CLOUD_HOST = "https://ollama.com" 
OLLAMA_CLOUD_API_KEY = os.environ.get("OLLAMA_CLOUD_API_KEY")

# Gemini: Uses the official SDK and requires the API key
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")

class LLMService:
    """
    A service class to manage different LLM clients (local Ollama, cloud Ollama, Gemini).
    
    This handles proper authentication setup for each service.
    """
    def __init__(self):
        # 1. Initialize Ollama Local Client (no auth needed, typically)
        self.ollama_local_client = OllamaAsyncClient(host=OLLAMA_LOCAL_HOST)
        print(f"Ollama Local Client initialized for host: {OLLAMA_LOCAL_HOST}")

        # 2. Initialize Ollama Cloud Client (requires API key and specific host)
        ollama_cloud_headers = {}
        if OLLAMA_CLOUD_API_KEY:
            # For the official Ollama Cloud API, authentication is via a Bearer token
            ollama_cloud_headers['Authorization'] = f'Bearer {OLLAMA_CLOUD_API_KEY}'
        
        # NOTE: The client will still be initialized even if the key is missing, 
        # but API calls will fail, which is handled in the get_llm_client method.
        self.ollama_cloud_client = OllamaAsyncClient(
            host=OLLAMA_CLOUD_HOST, 
            headers=ollama_cloud_headers
        )
        if OLLAMA_CLOUD_API_KEY:
             print(f"Ollama Cloud Client initialized for host: {OLLAMA_CLOUD_HOST} (Authenticated)")
        else:
             print(f"Ollama Cloud Client initialized for host: {OLLAMA_CLOUD_HOST} (API Key MISSING)")


        # 3. Initialize the Gemini client
        if not GEMINI_API_KEY:
            print("WARNING: GEMINI_API_KEY environment variable is missing.")

        self.gemini_client = genai.Client(api_key=GEMINI_API_KEY)
        print("Gemini Client initialized.")


    def get_llm_client(self, model_identifier: str, is_cloud: bool):
        """Returns the appropriate LLM client based on model and configuration."""
        print(f"\n--- Requesting Client ---\nModel: {model_identifier}, Cloud: {is_cloud}")
        
        # 1. Ollama Models
        if model_identifier.startswith("ollama:"):
            if is_cloud:
                if not OLLAMA_CLOUD_API_KEY:
                    raise ValueError(
                        "Ollama Cloud API Key is missing. Set the OLLAMA_CLOUD_API_KEY environment variable."
                    )
                print("Returning authenticated Ollama Cloud client.")
                return self.ollama_cloud_client 
            else:
                print("Returning local Ollama client.")
                return self.ollama_local_client

        # 2. Gemini Models
        elif model_identifier.startswith("gemini:"):
            if not GEMINI_API_KEY:
                 raise ValueError(
                    "Gemini API Key is missing. Set the GEMINI_API_KEY environment variable."
                )
            print("Returning Gemini client.")
            return self.gemini_client
        
        # 3. Handle unknown models
        else:
            raise ValueError(f"Unknown model identifier prefix: {model_identifier}. Must start with 'ollama:' or 'gemini:'.")

llm_service = LLMService()

# Example Usage (You would typically run these asynchronously)
# llm_service = LLMService()
# try:
#     # Example 1: Use a local Ollama model
#     local_ollama = llm_service.get_llm_client("ollama:llama3", is_cloud=False)
    
#     # Example 2: Use an Ollama Cloud model
#     cloud_ollama = llm_service.get_llm_client("ollama:gpt-oss:120b-cloud", is_cloud=True)
    
#     # Example 3: Use a Gemini model
#     gemini = llm_service.get_llm_client("gemini:gemini-2.5-flash", is_cloud=True)

# except ValueError as e:
#     print(f"ERROR: {e}")