from fastapi import APIRouter, HTTPException, Query
from typing import Optional, Dict, Any
from datetime import datetime
import random

from api.schemas import (
    ApplicationInput,
    UnderwritingDecision,
    ScenarioInput,
    ScenarioResult,
    AnalyticsSummary
)
from core.underwriting import underwriting_engine
from core.risk_engine import risk_engine
from core.premium_calculator import premium_calculator
from core.predictor import future_predictor
from core.explainer import explainer


router = APIRouter(prefix="/api/v1", tags=["Underwriting"])




@router.post("/underwrite", response_model=UnderwritingDecision)
async def process_application(application: ApplicationInput):
    """
    🎯 MAIN ENDPOINT: Process a complete insurance application.
    
    This endpoint orchestrates the entire underwriting process:
    - Risk Assessment (hybrid ML + domain rules)
    - Fraud Detection
    - STP (Straight-Through Processing) Decision
    - Premium Calculation
    - Future Risk Prediction
    - Explainable AI Output
    
    Returns a comprehensive underwriting decision.
    """
    try:
        result = underwriting_engine.process_application(application)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/risk/calculate")
async def calculate_risk_only(application: ApplicationInput):
    """
    Calculate risk score without full underwriting decision.
    Useful for real-time updates in the UI.
    """
    try:
        risk_result = risk_engine.calculate_risk(application)
        explanation = explainer.explain_risk_score(risk_result)
        
        return {
            "risk_score": risk_result.risk_score,
            "risk_category": risk_result.risk_category.value,
            "risk_label": risk_result.risk_label,
            "confidence": risk_result.confidence_score,
            "explanation": explanation
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/simulate/scenario", response_model=ScenarioResult)
async def simulate_scenario(scenario: ScenarioInput):
    """
    🎮 SCENARIO SIMULATION: What-if analysis.
    
    Allows users to modify factors and see how risk changes.
    """
    try:
        # Calculate original risk
        original_result = risk_engine.calculate_risk(scenario.base_application)
        original_premium = premium_calculator.calculate(original_result)
        
        # Apply modifications to create new application
        modified_app = _apply_modifications(
            scenario.base_application, 
            scenario.modified_factors
        )
        
        # Calculate new risk
        modified_result = risk_engine.calculate_risk(modified_app)
        modified_premium = premium_calculator.calculate(modified_result)
        
        # Calculate impacts
        factor_impacts = _calculate_factor_impacts(
            scenario.modified_factors,
            original_result,
            modified_result
        )
        
        # Generate recommendation
        risk_change = modified_result.risk_score - original_result.risk_score
        if risk_change > 0.1:
            recommendation = "This change significantly increases your risk. Consider alternatives."
        elif risk_change < -0.1:
            recommendation = "This change would significantly improve your risk profile!"
        else:
            recommendation = "This change has minimal impact on your overall risk."
        
        return ScenarioResult(
            original_risk=original_result.risk_score,
            simulated_risk=modified_result.risk_score,
            risk_change=round(risk_change, 3),
            risk_change_percentage=round(risk_change * 100, 1),
            original_premium=original_premium.final_premium,
            simulated_premium=modified_premium.final_premium,
            premium_change=round(modified_premium.final_premium - original_premium.final_premium, 2),
            factor_impacts=factor_impacts,
            recommendation=recommendation
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/predict/future")
async def predict_future_risk(application: ApplicationInput):
    """
    🔮 FUTURE PREDICTION: Risk trajectory over time.
    """
    try:
        current_risk = risk_engine.calculate_risk(application)
        future_prediction = future_predictor.predict(application, current_risk)
        
        return {
            "current_risk": current_risk.risk_score,
            "predictions": future_prediction.predictions,
            "trend": future_prediction.trend,
            "trend_confidence": future_prediction.trend_confidence,
            "warning": future_prediction.warning_message,
            "recommendation": future_prediction.recommendation
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/analytics/summary", response_model=AnalyticsSummary)
async def get_analytics_summary():
    """
    📊 ANALYTICS: Get summary statistics for the dashboard.
    
    Returns STP rates, processing times, and risk distribution.
    """
    # Simulated analytics data
    return AnalyticsSummary(
        total_applications=random.randint(140, 160),
        stp_rate=round(random.uniform(65, 72), 1),
        auto_approved=random.randint(95, 110),
        quick_review=random.randint(25, 35),
        manual_review=random.randint(10, 15),
        declined=random.randint(3, 8),
        fraud_flagged=random.randint(1, 3),
        avg_processing_time_ms=round(random.uniform(150, 250), 1),
        avg_stp_time_ms=round(random.uniform(50, 100), 1),
        avg_review_time_minutes=round(random.uniform(8, 15), 1),
        risk_distribution={
            "LOW": random.randint(45, 55),
            "MODERATE": random.randint(30, 40),
            "MODERATE_HIGH": random.randint(15, 25),
            "HIGH": random.randint(5, 12)
        },
        model_accuracy=round(random.uniform(93, 97), 1),
        fraud_detection_rate=round(random.uniform(88, 95), 1)
    )


@router.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    }


# HELPER FUNCTIONS 

def _apply_modifications(
    base_app: ApplicationInput, 
    modifications: Dict[str, Any]
) -> ApplicationInput:
    """Apply modifications to create a new application for simulation."""
    
    
    app_dict = base_app.model_dump()
    
    
    if "traditional" in modifications:
        for key, value in modifications["traditional"].items():
            if key in app_dict["traditional_data"]:
                app_dict["traditional_data"][key] = value
    
    
    if "alternative" in modifications and app_dict.get("alternative_data"):
        for key, value in modifications["alternative"].items():
            if key in app_dict["alternative_data"]:
                app_dict["alternative_data"][key] = value
    
    return ApplicationInput(**app_dict)


def _calculate_factor_impacts(
    modifications: Dict[str, Any],
    original: Any,
    modified: Any
) -> list:
    """Calculate the impact of each modified factor."""
    
    impacts = []
    total_change = modified.risk_score - original.risk_score
    
    for category in ["traditional", "alternative"]:
        if category in modifications:
            for factor, new_value in modifications[category].items():
                impacts.append({
                    "factor": factor,
                    "new_value": new_value,
                    "estimated_impact": round(total_change / len(modifications.get(category, {})), 3)
                })
    
    return impacts