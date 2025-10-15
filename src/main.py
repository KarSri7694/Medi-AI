import lmstudio as lms
import asyncio
import json
from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import logging
import sqlite3

# Initialize FastAPI app
app = FastAPI()
# Add CORS middleware to allow requests from your website's domain
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this to your actual domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SERVER_API_HOST = "localhost:1234"

Bot_name = "Medi-AI"
model_name = "qwen/qwen3-4b-thinking-2507"
full_context = ""

chat_history = lms.Chat(initial_prompt=f"You are {Bot_name}, a helpful AI assistant. You are specialised in anyalysing health data and giving useful insights.\n")

def connect_db():
    # Placeholder for database connection logic
    conn = sqlite3.connect('user_chats.db')
    return conn
    
async def chat(input:str):
    global chat
    async with lms.AsyncClient(api_host=SERVER_API_HOST) as client:
        model = await client.llm.model(model_name)
        chat_history.add_user_message(input)
        response = await model.respond_stream(chat_history, on_message=chat_history.append)
        async for fragment in response:
            yield fragment.content
    print(chat_history, flush=True)

async def sse_text_streamer(context):
    """
    This generator function streams the LLM's response in the SSE format.
    """

    async for chunk in chat(context=context):
        # SSE format requires data to be prefixed with "data: " and suffixed with "\n\n"
        # We'll wrap the chunk in a simple JSON for better structure
        json_data = json.dumps({'token': chunk})
        yield f"data: {json_data}\n\n"
        
    # Signal the end of the stream
    yield f"data: {json.dumps({'token': '[DONE]'})}\n\n"

@app.post("/input")
async def receive_input(request: Request):
    data = await request.json()
    global full_context
    user_id = data.get("user_id", "anonymous")
    user_input = data.get("input", "")
    return StreamingResponse(sse_text_streamer(user_input), media_type="text/event-stream")
