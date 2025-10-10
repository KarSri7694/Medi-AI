import lmstudio as lms
import asyncio
import json
from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import logging

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

# @app.post("/chat")
# def new_chat():
    
#     pass
#     raw = request.get_data(as_text=True)
#     try:
#         data = request.get_json(force=True)
#     except Exception as e:
#         app.logger.warning("Failed to parse JSON: %s; raw=%r", e, raw)
#         return jsonify({"error": "invalid json", "details": str(e), "raw": raw}), 400

#     user_message = data.get("message", "")
#     conversation_id = data.get("conversation_id", "default")

#     with lms.Client() as client:
#         model = client.llm.model(model_name)
#         chat = lms.Chat("")
#         chat.add_user_message(user_message)
#         prediction_stream = model.respond_stream(chat, on_message=chat.append)

#         response_text = ""
#         for fragment in prediction_stream:
#             response_text += fragment.content

#     return jsonify({
#         "bot_name": Bot_name,
#         "response": response_text,
#         "conversation_id": conversation_id
#     })


async def chat(context:json):
    async with lms.AsyncClient(api_host=SERVER_API_HOST) as client:
        model = await client.llm.model(model_name)
        response = await model.respond_stream(context["message"])
        async for fragment in response:
            yield fragment.content
    # Yield each part of the text with a small delay to simulate

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

# @app.get("/stream")
# async def stream_endpoint(request: Request):
#     """
#     The main API endpoint that the frontend will connect to.
#     """
    
#     return StreamingResponse(sse_text_streamer(), media_type="text/event-stream")

@app.post("/input")
async def receive_input(request: Request):
    data = await request.json()
    user_input = data.get("input", "")
    #to be implemented later
    return StreamingResponse(sse_text_streamer(context={"message": user_input}), media_type="text/event-stream")