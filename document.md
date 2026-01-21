# Aiven SQL Chatbot Project Documentation

This project is a full-stack AI-powered SQL Assistant that allows users to query an Aiven PostgreSQL database using natural language. It leverages Google's **Gemini 3 Pro Preview** model via Vertex AI to translate user questions into SQL queries.

## 🏗️ Architecture Overiew

The project is structured as a **Monorepo** with two main components:

### 1. Frontend (`/frontend`)
- **Framework**: Next.js 15
- **Styling**: Tailwind CSS
- **Key Features**: 
  - Real-time chat interface.
  - Safe hydration handling to prevent SSR/CSR mismatches.
  - Dynamic API configuration via environment variables.

### 2. Backend (`/backend`)
- **Framework**: FastAPI (Python)
- **Agent Framework**: LangChain
- **LLM**: Gemini 3 Pro Preview (Vertex AI)
- **Database**: PostgreSQL (Aiven)
- **Deployment**: Configured for Railway with a `Procfile` and `nixpacks.toml`.

---

## 🛠️ Technology Stack

| Component | Technology |
| :--- | :--- |
| **Logic** | Python 3.9+, Node.js 18+ |
| **Frontend** | React 19, Lucide Icons, Axios |
| **Backend** | Uvicorn, Pydantic, SQLAlchemy |
| **AI/LLM** | Vertex AI API, LangChain SQL Agent |
| **Database** | Aiven Managed PostgreSQL |

---

## 🔑 Environment Variables

To run this project, you need to configure the following variables:

### Backend (`/backend/.env` or Railway Variables)
- `GOOGLE_CLOUD_PROJECT`: Your Google Cloud Project ID.
- `GOOGLE_CLOUD_LOCATION`: The Vertex AI region (e.g., `us-central1` or `global`).
- `DATABASE_URL`: Your PostgreSQL connection string (starts with `postgresql://`).
- `GOOGLE_CREDENTIALS_BASE64`: A Base64-encoded string of your Google Service Account JSON key (for cloud deployment).
- `GOOGLE_APPLICATION_CREDENTIALS`: Path to your service account JSON (for local development).

### Frontend (`/frontend/.env.local` or Railway Variables)
- `NEXT_PUBLIC_API_URL`: The public URL of your Backend service.

---

## 🚀 Deployment (Railway)

The project is configured to be deployed as two separate services from the same GitHub repository:

1.  **Backend Service**:
    - Set **Root Directory** to `/backend`.
    - Add all Backend environment variables.
    - Railway uses the `Procfile` to start the server on the correct `$PORT`.

2.  **Frontend Service**:
    - Set **Root Directory** to `/frontend`.
    - Add `NEXT_PUBLIC_API_URL` pointing to your Backend URL.
    - The build process automatically handles the Next.js build and start scripts.

---

## 🛡️ Security & Performance
- **Vertex AI**: Securely authenticated via Service Accounts.
- **CORS**: Configured in `main.py` to allow communication between the separate frontend and backend domains.
- **Next.js**: Upgraded to version `15.1.11+` to ensure all critical security patches are applied.

---
*Created on: 2026-01-21*
