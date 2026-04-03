import numpy as np
from typing import List, Dict, Any
from api.schemas import (
    ApplicationInput,
    RiskAssessmentResult,
    FutureRiskPrediction
)


class FutureRiskPredictor:
    """
    Future Risk Prediction Engine
    
    Predicts how risk will evolve over time based on:
    - Current risk factors
    - Age progression
    - Lifestyle trends
    - Statistical models
    """
    
    def __init__(self):
        self.time_horizons = [3, 6, 12, 24, 36]  # months
    
    def predict(
        self, 
        application: ApplicationInput,
        current_risk: RiskAssessmentResult
    ) -> FutureRiskPrediction:
        """
        Predict future risk trajectory.
        """
        
        current_score = current_risk.risk_score
        traditional = application.traditional_data
        alternative = application.alternative_data
        
        predictions = []
        
        for months in self.time_horizons:
            # Base progression (age effect)
            age_factor = self._calculate_age_progression(
                traditional.age, 
                months
            )
            
            # Lifestyle trend factor
            lifestyle_factor = self._calculate_lifestyle_trend(
                alternative,
                months
            )
            
            # Claims pattern factor
            claims_factor = self._calculate_claims_trend(
                traditional.previous_claims,
                months
            )
            
            # Combined prediction
            future_risk = current_score * (1 + age_factor + lifestyle_factor + claims_factor)
            future_risk = np.clip(future_risk, 0, 1)
            
            # Add some realistic variance
            variance = np.random.normal(0, 0.02)
            future_risk = np.clip(future_risk + variance, 0, 1)
            
            predictions.append({
                "months": months,
                "risk_score": round(future_risk, 3),
                "confidence": round(max(0.5, 0.95 - months * 0.015), 2)
            })
        
        # Determine trend
        trend = self._determine_trend(predictions)
        trend_confidence = self._calculate_trend_confidence(predictions)
        
        # Generate warning if needed
        warning = self._generate_warning(current_score, predictions, traditional)
        
        # Generate recommendation
        recommendation = self._generate_recommendation(trend, current_risk)
        
        return FutureRiskPrediction(
            predictions=predictions,
            trend=trend,
            trend_confidence=trend_confidence,
            warning_message=warning,
            recommendation=recommendation
        )
    
    def _calculate_age_progression(self, current_age: int, months: int) -> float:
        """Calculate risk increase due to aging."""
        years = months / 12
        
        # Risk increases faster after 50
        if current_age > 50:
            return years * 0.015  # 1.5% per year
        elif current_age > 40:
            return years * 0.008  # 0.8% per year
        else:
            return years * 0.003  # 0.3% per year
    
    def _calculate_lifestyle_trend(self, alternative, months: int) -> float:
        """Calculate risk change based on lifestyle factors."""
        if alternative is None:
            return 0.0
        
        years = months / 12
        
        # Good lifestyle = slight improvement
        if (alternative.exercise_days_per_week >= 4 and 
            alternative.diet_quality_score >= 7):
            return -years * 0.02  # Improve 2% per year
        
        # Poor lifestyle = decline
        if (alternative.exercise_days_per_week <= 1 and 
            alternative.stress_level >= 7):
            return years * 0.03  # Worsen 3% per year
        
        return years * 0.005  # Slight natural increase
    
    def _calculate_claims_trend(self, previous_claims: int, months: int) -> float:
        """Calculate expected claims impact."""
        years = months / 12
        
        if previous_claims >= 3:
            return years * 0.02  # History suggests more claims
        elif previous_claims == 0:
            return -years * 0.005  # Good history
        
        return 0.0
    
    def _determine_trend(self, predictions: List[Dict]) -> str:
        """Determine overall trend direction."""
        if len(predictions) < 2:
            return "STABLE"
        
        first_risk = predictions[0]["risk_score"]
        last_risk = predictions[-1]["risk_score"]
        change = last_risk - first_risk
        
        if change > 0.1:
            return "INCREASING"
        elif change < -0.05:
            return "DECREASING"
        else:
            return "STABLE"
    
    def _calculate_trend_confidence(self, predictions: List[Dict]) -> float:
        """Calculate confidence in trend prediction."""
        # Average of individual confidences
        return round(np.mean([p["confidence"] for p in predictions]), 2)
    
    def _generate_warning(
        self, 
        current: float, 
        predictions: List[Dict],
        traditional
    ) -> str:
        """Generate warning message if risk trajectory is concerning."""
        
        # Find when risk crosses high threshold
        for pred in predictions:
            if current < 0.7 and pred["risk_score"] >= 0.7:
                return (
                    f"WARNING: At current trajectory, you may enter "
                    f"HIGH RISK category in approximately {pred['months']} months."
                )
        
        # Age-specific warnings
        if traditional.age > 55 and predictions[-1]["risk_score"] > 0.6:
            return (
                "Note: Age-related factors may accelerate risk increase. "
                "Regular health monitoring recommended."
            )
        
        return None
    
    def _generate_recommendation(
        self, 
        trend: str, 
        current_risk: RiskAssessmentResult
    ) -> str:
        """Generate actionable recommendation."""
        
        if trend == "INCREASING":
            top_factor = current_risk.top_risk_factors[0] if current_risk.top_risk_factors else "lifestyle factors"
            return (
                f"To improve your trajectory, focus on addressing {top_factor}. "
                f"Small improvements in this area could significantly reduce future risk."
            )
        elif trend == "DECREASING":
            return (
                "Your healthy habits are paying off! Continue your current lifestyle "
                "to maintain this positive trajectory."
            )
        else:
            return (
                "Your risk profile is stable. Consider preventive measures "
                "to actively improve your health trajectory."
            )


# Singleton instance
future_predictor = FutureRiskPredictor()