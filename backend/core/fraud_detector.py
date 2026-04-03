from typing import List
from api.schemas import (
    ApplicationInput,
    TraditionalData,
    AlternativeData,
    FraudIndicator
)
from config import settings


class FraudDetector:
    
    def __init__(self):
        self.flag_threshold = settings.FRAUD_FLAG_THRESHOLD
        self.review_threshold = settings.FRAUD_REVIEW_THRESHOLD
    
    def analyze(self, application: ApplicationInput) -> FraudIndicator:
        traditional = application.traditional_data
        alternative = application.alternative_data
        
        indicators = []
        fraud_score = 0.0
        
        # === CHECK 1: Income vs Claims Ratio ===
        if traditional.previous_claims > 0:
            claims_ratio = traditional.previous_claims / (traditional.annual_income / 50000)
            if claims_ratio > 2:
                indicators.append("High claims relative to income")
                fraud_score += 0.15
        
        # === CHECK 2: Age vs Health Inconsistency ===
        if traditional.age < 30 and traditional.chronic_conditions >= 3:
            indicators.append("Unusual chronic conditions for age")
            fraud_score += 0.1
        
        # === CHECK 3: Recent Hospitalizations Spike ===
        if traditional.hospitalizations_last_5_years >= 4:
            indicators.append("High recent hospitalization rate")
            fraud_score += 0.15
        
        # === CHECK 4: Lifestyle Data Inconsistency ===
        if alternative:
            # Claiming high exercise but poor health metrics
            if (alternative.exercise_days_per_week >= 6 and 
                traditional.bmi > 35):
                indicators.append("Exercise claims inconsistent with BMI")
                fraud_score += 0.2
            
            # Very low stress but high chronic conditions
            if (alternative.stress_level <= 2 and 
                traditional.chronic_conditions >= 3):
                indicators.append("Stress level inconsistent with health status")
                fraud_score += 0.1
        
        # === CHECK 5: Perfect Health Claims ===
        # Suspicious if EVERYTHING is perfect
        perfect_count = 0
        if traditional.smoking_status.value == "never":
            perfect_count += 1
        if traditional.alcohol_consumption.value == "none":
            perfect_count += 1
        if traditional.chronic_conditions == 0:
            perfect_count += 1
        if traditional.family_history_conditions == 0:
            perfect_count += 1
        if traditional.previous_claims == 0:
            perfect_count += 1
        
        if perfect_count == 5 and traditional.age > 50:
            indicators.append("Unusually perfect health profile for age")
            fraud_score += 0.1
        
        # === CHECK 6: BMI Extremes ===
        if traditional.bmi < 16 or traditional.bmi > 45:
            indicators.append("Extreme BMI value - verify measurements")
            fraud_score += 0.15
        
        # === CHECK 7: Claims Pattern ===
        if traditional.previous_claims >= 5:
            indicators.append("Excessive claim history")
            fraud_score += 0.2
        
        # Normalize fraud score
        fraud_score = min(fraud_score, 1.0)
        
        # Determine risk level and recommendation
        if fraud_score >= self.flag_threshold:
            risk_level = "HIGH"
            recommendation = "Hold for fraud investigation team"
        elif fraud_score >= self.review_threshold:
            risk_level = "MEDIUM"
            recommendation = "Review documentation carefully"
        else:
            risk_level = "LOW"
            recommendation = "No significant fraud indicators"
        
        return FraudIndicator(
            fraud_score=round(fraud_score, 3),
            is_flagged=fraud_score >= self.flag_threshold,
            risk_level=risk_level,
            indicators=indicators if indicators else ["No suspicious patterns detected"],
            recommendation=recommendation
        )


# Singleton instance
fraud_detector = FraudDetector()