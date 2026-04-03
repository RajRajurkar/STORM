from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from api.routes import router
from config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler."""
    # Startup
    print("LiveRisk AI - Starting up...")
    print(f"Model Version: 1.0.0")
    print(f"STP Auto-Approve Threshold: {settings.STP_AUTO_APPROVE_RISK}")
    yield
    print("LiveRisk AI - Shutting down...")


# Create FastAPI application
app = FastAPI(
    title="LiveRisk AI",
    description="""
    ## Intelligent Automated Underwriting Platform
    
    LiveRisk AI is a comprehensive insurance underwriting system that combines:
    
    - **Traditional Data Analysis**: Age, health history, medical conditions
    - **Alternative Data Integration**: Wearables, lifestyle, behavioral patterns
    - **Hybrid ML Risk Engine**: Domain knowledge + Machine Learning
    - **Straight-Through Processing**: Automated decision routing
    - **Fraud Detection**: Anomaly detection and pattern analysis
    - **Explainable AI**: Clear reasoning for all decisions
    
    ### Problem Statement Addressed
    
    **PS0103**: Automated Risk Assessment and Underwriting Platform
    
    With integrated elements from:
    - **PS0101**: Straight-Through Processing (STP)
    - **PS0102**: Fraud Detection
    
    ### Key Features
    
    1. **Real-time Risk Assessment** - Instant risk scoring
    2. **Auto-Approval Pipeline** - 68%+ STP rate
    3. **What-If Simulation** - Interactive scenario testing
    4. **Future Risk Prediction** - Trajectory forecasting
    5. **Complete Transparency** - Every decision explained
    """,
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
            "docs": "/docs"
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)