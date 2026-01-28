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

@app.post("/chat")
async def chat(request: ChatRequest):
    try:
        agent = get_agent_executor()
        response = agent.invoke({"input": request.message})
        output = response.get("output", "")
        
        # Ensure output is always a string
        if isinstance(output, str):
            final_output = output
        elif isinstance(output, dict):
            # If it's a dict, extract 'text' or 'content' if available, else stringify
            final_output = output.get("text") or output.get("content") or str(output)
        elif isinstance(output, list):
            # If it's a list, join string parts and stringify objects
            parts = []
            for item in output:
                if isinstance(item, str):
                    parts.append(item)
                elif hasattr(item, 'content'):
                    parts.append(str(item.content))
                else:
                    parts.append(str(item))
            final_output = "".join(parts)
        else:
            final_output = str(output)
        
        return {"response": final_output}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
