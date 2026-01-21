from langchain_community.utilities import SQLDatabase
from langchain_community.agent_toolkits import create_sql_agent
from langchain_google_vertexai import ChatVertexAI
from dotenv import load_dotenv
import os

load_dotenv()

def get_agent_executor():
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        raise ValueError("DATABASE_URL environment variable not set")
    
    # Fix for SQLAlchemy expecting postgresql:// scheme
    if database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql://", 1)
    
    # Initialize Database Connection
    db = SQLDatabase.from_uri(database_url)
    
    # Get Vertex AI configuration
    project_id = os.getenv("GOOGLE_CLOUD_PROJECT")
    location = os.getenv("GOOGLE_CLOUD_LOCATION", "global")
    
    # Set credentials: prefer base64 env var (for Railway), fallback to file path (local)
    import base64
    import tempfile

    encoded_creds = os.getenv("GOOGLE_CREDENTIALS_BASE64")
    if encoded_creds:
        # Decode base64 credentials to a temporary file
        creds_json = base64.b64decode(encoded_creds)
        with tempfile.NamedTemporaryFile(mode="wb", delete=False, suffix=".json") as temp_creds:
            temp_creds.write(creds_json)
            os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = temp_creds.name
    else:
        # Fallback to local file path
        credentials_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
        if credentials_path:
            os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = credentials_path
    
    # Initialize LLM (Gemini 3 Pro Preview via Vertex AI)
    llm = ChatVertexAI(
        model="gemini-3-pro-preview",
        project=project_id,
        location=location,
        temperature=0,
    )
    
    # Create the SQL Agent
    agent_executor = create_sql_agent(
        llm, 
        db=db, 
        agent_type="tool-calling", 
        verbose=True
    )
    
    return agent_executor
