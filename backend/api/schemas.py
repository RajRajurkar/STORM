from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from enum import Enum
from datetime import datetime

class Gender(str, Enum):
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"


class SmokingStatus(str, Enum):
    NEVER = "never"
    FORMER = "former"
    CURRENT = "current"


class AlcoholConsumption(str, Enum):
    NONE = "none"
    OCCASIONAL = "occasional"
    MODERATE = "moderate"
    HEAVY = "heavy"


class OccupationType(str, Enum):
    SEDENTARY = "sedentary"          # Office work
    LIGHT = "light"                   # Teaching, retail
    MODERATE = "moderate"             # Healthcare, trades
    HEAVY = "heavy"                   # Construction, mining
    HAZARDOUS = "hazardous"           # Military, firefighting


class RiskCategory(str, Enum):
    LOW = "LOW"
    MODERATE = "MODERATE"
    MODERATE_HIGH = "MODERATE_HIGH"
    HIGH = "HIGH"


class STPDecision(str, Enum):
    AUTO_APPROVE = "AUTO_APPROVE"
    QUICK_REVIEW = "QUICK_REVIEW"
    MANUAL_REVIEW = "MANUAL_REVIEW"
    DECLINE = "DECLINE"
    FRAUD_HOLD = "FRAUD_HOLD"


class TraditionalData(BaseModel):
    """Traditional underwriting data (standard form data)."""
    
    # Personal Information
    age: int = Field(..., ge=18, le=100, description="Applicant age")
    gender: Gender = Field(..., description="Gender")
    annual_income: float = Field(..., ge=0, description="Annual income in USD")
    occupation: OccupationType = Field(..., description="Occupation type")
    
    # Medical Information
    height_cm: float = Field(..., ge=100, le=250, description="Height in cm")
    weight_kg: float = Field(..., ge=30, le=300, description="Weight in kg")
    blood_pressure_systolic: int = Field(..., ge=80, le=200, description="Systolic BP")
    blood_pressure_diastolic: int = Field(..., ge=50, le=130, description="Diastolic BP")
    
    # Health History
    smoking_status: SmokingStatus = Field(..., description="Smoking status")
    alcohol_consumption: AlcoholConsumption = Field(..., description="Alcohol consumption")
    chronic_conditions: int = Field(0, ge=0, le=5, description="Number of chronic conditions")
    family_history_conditions: int = Field(0, ge=0, le=5, description="Family history conditions")
    previous_claims: int = Field(0, ge=0, le=10, description="Previous insurance claims")
    hospitalizations_last_5_years: int = Field(0, ge=0, le=10, description="Recent hospitalizations")
    
    @property
    def bmi(self) -> float:
        """Calculate BMI from height and weight."""
        height_m = self.height_cm / 100
        return round(self.weight_kg / (height_m ** 2), 1)


class AlternativeData(BaseModel):
    """Alternative data sources (wearables, lifestyle, behavioral)."""
    
    # Wearable Device Data (simulated)
    daily_steps_avg: int = Field(5000, ge=0, le=30000, description="Average daily steps")
    resting_heart_rate: int = Field(70, ge=40, le=120, description="Resting heart rate BPM")
    sleep_hours_avg: float = Field(7.0, ge=3, le=12, description="Average sleep hours")
    active_minutes_daily: int = Field(30, ge=0, le=300, description="Active minutes per day")
    
    # Lifestyle Indicators
    exercise_days_per_week: int = Field(3, ge=0, le=7, description="Exercise days per week")
    diet_quality_score: int = Field(5, ge=1, le=10, description="Diet quality 1-10")
    stress_level: int = Field(5, ge=1, le=10, description="Stress level 1-10")
    work_life_balance: int = Field(5, ge=1, le=10, description="Work-life balance 1-10")
    
    # Behavioral Indicators
    regular_checkups: bool = Field(True, description="Regular health checkups")
    gym_membership: bool = Field(False, description="Active gym membership")
    meditation_practice: bool = Field(False, description="Regular meditation")
    
    # Environmental
    location_risk_score: int = Field(5, ge=1, le=10, description="Location health risk 1-10")
    air_quality_score: int = Field(7, ge=1, le=10, description="Air quality score 1-10")


class ApplicationInput(BaseModel):
    """Complete insurance application input."""
    
    applicant_name: str = Field(..., min_length=2, max_length=100)
    email: str = Field(..., description="Email address")
    phone: Optional[str] = Field(None, description="Phone number")
    
    traditional_data: TraditionalData
    alternative_data: Optional[AlternativeData] = None
    
    # Consent
    data_consent: bool = Field(True, description="Consent for data processing")
    wearable_data_connected: bool = Field(False, description="Wearable device connected")
    
    class Config:
        json_schema_extra = {
            "example": {
                "applicant_name": "John Smith",
                "email": "john.smith@email.com",
                "traditional_data": {
                    "age": 35,
                    "gender": "male",
                    "annual_income": 75000,
                    "occupation": "sedentary",
                    "height_cm": 175,
                    "weight_kg": 80,
                    "blood_pressure_systolic": 120,
                    "blood_pressure_diastolic": 80,
                    "smoking_status": "never",
                    "alcohol_consumption": "occasional",
                    "chronic_conditions": 0,
                    "family_history_conditions": 1,
                    "previous_claims": 1,
                    "hospitalizations_last_5_years": 0
                },
                "alternative_data": {
                    "daily_steps_avg": 8000,
                    "resting_heart_rate": 65,
                    "sleep_hours_avg": 7.5,
                    "active_minutes_daily": 45,
                    "exercise_days_per_week": 4,
                    "diet_quality_score": 7,
                    "stress_level": 4,
                    "work_life_balance": 7,
                    "regular_checkups": True,
                    "gym_membership": True,
                    "meditation_practice": False,
                    "location_risk_score": 3,
                    "air_quality_score": 8
                }
            }
        }


class ScenarioInput(BaseModel):
    """Input for scenario simulation."""
    
    base_application: ApplicationInput
    modified_factors: Dict[str, Any] = Field(..., description="Factors to modify")


class RiskContribution(BaseModel):
    """Individual factor contribution to risk."""
    
    factor: str
    display_name: str
    value: Any
    contribution: float  # Positive = increases risk, Negative = decreases
    percentage: float
    category: str  # "positive" (increases risk) or "negative" (decreases risk)


class FraudIndicator(BaseModel):
    """Fraud detection result."""
    
    fraud_score: float = Field(..., ge=0, le=1)
    is_flagged: bool
    risk_level: str  # "LOW", "MEDIUM", "HIGH"
    indicators: List[str]
    recommendation: str


class RiskAssessmentResult(BaseModel):
    """Complete risk assessment output."""
    
    # Core Risk Metrics
    risk_score: float = Field(..., ge=0, le=1)
    risk_category: RiskCategory
    risk_label: str
    confidence_score: float = Field(..., ge=0, le=1)
    
    # Risk Breakdown
    contributions: List[RiskContribution]
    top_risk_factors: List[str]
    top_protective_factors: List[str]
    
    # Explanation
    explanation_text: str
    
    # Timestamps
    assessed_at: datetime


class STPResult(BaseModel):
    """Straight-Through Processing decision."""
    
    decision: STPDecision
    decision_label: str
    decision_description: str
    
    # Timing
    processing_time_ms: float
    is_instant: bool  # True if auto-processed
    
    # Routing
    requires_review: bool
    review_priority: Optional[str] = None  # "HIGH", "MEDIUM", "LOW"
    review_reason: Optional[str] = None


class PremiumResult(BaseModel):
    """Premium calculation result."""
    
    base_premium: float
    risk_loading: float  # Additional premium due to risk
    discount: float  # Discounts applied
    final_premium: float
    
    premium_breakdown: Dict[str, float]
    payment_options: Dict[str, float]  # Monthly, quarterly, annual


class FutureRiskPrediction(BaseModel):
    """Future risk trajectory prediction."""
    
    predictions: List[Dict[str, Any]]
    trend: str 
    trend_confidence: float
    warning_message: Optional[str] = None
    recommendation: str


class UnderwritingDecision(BaseModel):
    """Complete underwriting decision output."""
    
    # Application Info
    application_id: str
    applicant_name: str
    
    # Risk Assessment
    risk_assessment: RiskAssessmentResult
    
    # Fraud Check
    fraud_check: FraudIndicator
    
    # STP Decision
    stp_result: STPResult
    
    # Premium (if approved)
    premium: Optional[PremiumResult] = None
    
    # Future Prediction
    future_risk: Optional[FutureRiskPrediction] = None
    
    # Final Recommendation
    final_decision: str
    policy_terms: Optional[Dict[str, Any]] = None
    
    # Metadata
    processed_at: datetime
    model_version: str


class ScenarioResult(BaseModel):
    """Scenario simulation result."""
    
    original_risk: float
    simulated_risk: float
    risk_change: float
    risk_change_percentage: float
    
    original_premium: float
    simulated_premium: float
    premium_change: float
    
    factor_impacts: List[Dict[str, Any]]
    recommendation: str


class AnalyticsSummary(BaseModel):
    """Analytics dashboard data."""
    
    # STP Metrics
    total_applications: int
    stp_rate: float  # Percentage auto-processed
    auto_approved: int
    quick_review: int
    manual_review: int
    declined: int
    fraud_flagged: int
    
    # Timing Metrics
    avg_processing_time_ms: float
    avg_stp_time_ms: float
    avg_review_time_minutes: float
    
    # Risk Distribution
    risk_distribution: Dict[str, int]
    
    # Accuracy (simulated)
    model_accuracy: float
    fraud_detection_rate: float