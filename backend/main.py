from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import os
from agent import get_agent_executor

# Load environment variables
load_dotenv()

app = FastAPI(title="Aiven SQL Chatbot API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str

@app.get("/")
async def root():
    return {"message": "Aiven SQL Chatbot API is running"}

def extract_text_from_output(output):
    """Recursively extract text content from agent output, filtering out metadata."""
    if output is None:
        return ""
    
    if isinstance(output, str):
        return output
    
    if isinstance(output, dict):
        # If it has a 'text' key, use that (common in Gemini responses)
        if 'text' in output:
            return output['text']
        # If it has a 'content' key, use that
        if 'content' in output:
            return extract_text_from_output(output['content'])
        # Otherwise, skip known metadata keys and extract remaining text
        text_parts = []
        for key, value in output.items():
            if key not in ('type', 'thought_signature', 'metadata', 'id'):
                extracted = extract_text_from_output(value)
                if extracted:
                    text_parts.append(extracted)
        return " ".join(text_parts)
    
    if isinstance(output, list):
        text_parts = []
        for item in output:
            extracted = extract_text_from_output(item)
            if extracted:
                text_parts.append(extracted)
        return " ".join(text_parts)
    
    # For objects with content attribute (LangChain messages)
    if hasattr(output, 'content'):
        return extract_text_from_output(output.content)
    
    # Fallback: convert to string but avoid [object Object] equivalents
    result = str(output)
    if result.startswith('{') or result.startswith('['):
        return ""  # Skip raw object representations
    return result


@app.post("/chat")
async def chat(request: ChatRequest):
    try:
        agent = get_agent_executor()
        response = agent.invoke({"input": request.message})
        output = response.get("output", "")
        
        # Extract clean text from the output
        final_output = extract_text_from_output(output)
        
        # Fallback if extraction returned empty
        if not final_output.strip():
            final_output = "I processed your request but couldn't generate a response."
        
        return {"response": final_output}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
