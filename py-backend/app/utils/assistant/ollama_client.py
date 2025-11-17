from ollama import AsyncClient
import os

ollama_local = AsyncClient(host="http://localhost:11434")
ollama_cloud = os.environ.get("OLLAMA_CLOUD_HOST") 

async def stream_ollama(model: str, messages: list):
    """
    Streams tokens from local or cloud models.
    """
    response = await ollama_local.chat(
        model=model,
        messages=messages,
        stream=True
    )

    async for part in response:
        yield part["message"]["content"]
