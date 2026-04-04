from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from api.routes import router
from config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler."""
    print("🚀 LiveRisk AI - Starting up...")
    print(f"📊 Model Version: 1.0.0")
    print(f"⚡ STP Auto-Approve Threshold: {settings.STP_AUTO_APPROVE_RISK}")
    yield
    print("👋 LiveRisk AI - Shutting down...")


app = FastAPI(
    title="LiveRisk AI",
    description="Intelligent Automated Underwriting Platform",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(router)

# ✅ ADD AGENT ROUTES DIRECTLY IN MAIN.PY
from fastapi import HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, List
from agents.risk_agent import risk_agent

class ChatRequest(BaseModel):
    message: str
    user_profile: Optional[Dict] = None
    risk_context: Optional[Dict] = None
    conversation_history: Optional[List[Dict]] = None

@app.post("/api/v1/agent/chat")
async def chat_with_agent(request: ChatRequest):
    """Chat with AI Risk Agent"""
    try:
        print(f"📨 Chat request: {request.message[:50]}...")
        print(f"👤 User profile: {request.user_profile is not None}")
        print(f"📊 Risk context: {request.risk_context is not None}")
        
        response = await risk_agent.chat(
            message=request.message,
            user_profile=request.user_profile,
            risk_context=request.risk_context,
            conversation_history=request.conversation_history
        )
        
        print(f"✅ Response generated: {len(response.get('response', ''))} chars")
        return response
        
    except Exception as e:
        print(f"❌ Chat error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "name": "LiveRisk AI",
        "description": "Intelligent Automated Underwriting Platform",
        "version": "1.0.0",
        "problem_statements": ["PS0103", "PS0101", "PS0102"],
        "endpoints": {
            "underwrite": "/api/v1/underwrite",
            "risk_calculate": "/api/v1/risk/calculate",
            "scenario_simulate": "/api/v1/simulate/scenario",
            "future_predict": "/api/v1/predict/future",
            "analytics": "/api/v1/analytics/summary",
            "chat": "/api/v1/agent/chat",
            "docs": "/docs"
        }
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    from datetime import datetime
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)