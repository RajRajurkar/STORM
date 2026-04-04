from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, List
from agents.risk_agent import risk_agent

router = APIRouter(prefix="/api/v1/agent", tags=["AI Agent"])


class ChatRequest(BaseModel):
    message: str
    user_profile: Optional[Dict] = None
    risk_context: Optional[Dict] = None
    conversation_history: Optional[List[Dict]] = None


@router.post("/chat")
async def chat_with_agent(request: ChatRequest):
    """
    Chat with the AI Risk Agent
    """
    try:
        response = await risk_agent.chat(
            message=request.message,
            user_profile=request.user_profile,
            risk_context=request.risk_context,
            conversation_history=request.conversation_history
        )
        return response
    except Exception as e:
        print(f"❌ Chat error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/risk-summary")
async def generate_risk_summary(risk_context: Dict, explanations: List[Dict]):
    """
    Generate AI-powered risk summary
    """
    try:
        summary = risk_agent.generate_risk_summary(risk_context, explanations)
        return {"summary": summary}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))