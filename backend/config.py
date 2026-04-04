from pydantic_settings import BaseSettings
from typing import Dict, List
import os


class Settings(BaseSettings):
    """Application settings and thresholds."""
    
    # API Settings
    APP_NAME: str = "LiveRisk AI"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    
    # Risk Thresholds
    LOW_RISK_THRESHOLD: float = 0.3 
    HIGH_RISK_THRESHOLD: float = 0.7   
    
    # STP (Straight-Through Processing) Thresholds
    STP_AUTO_APPROVE_RISK: float = 0.35   # Auto-approve if risk below this
    STP_AUTO_APPROVE_CONFIDENCE: float = 0.85  # AND confidence above this
    STP_REVIEW_CONFIDENCE: float = 0.60   # Below this = manual review
    
    # Fraud Detection Thresholds
    FRAUD_FLAG_THRESHOLD: float = 0.7     # Flag if fraud score above this
    FRAUD_REVIEW_THRESHOLD: float = 0.5   # Review if above this
    
    GROK_API_KEY: str = ""
    GROK_API_URL: str = "https://api.x.ai/v1"
    GROK_MODEL: str = "grok-beta"
    
    # Premium Calculation
    BASE_PREMIUM: float = 1200.0          # Base annual premium ($)
    MAX_PREMIUM_MULTIPLIER: float = 3.5   # Maximum premium multiplier
    MIN_PREMIUM_MULTIPLIER: float = 0.7   # Minimum premium multiplier
    
    # Model Settings
    CONFIDENCE_THRESHOLD: float = 0.6     # Minimum confidence for auto-decision
    
    '''
    """Application settings"""
    
    # Server
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", 8000))
    DEBUG: bool = os.getenv("DEBUG", "True").lower() == "true"
    
    # API Keys
    GROK_API_KEY: str = os.getenv("GROK_API_KEY", "")
    GROK_API_URL: str = os.getenv("GROK_API_URL", "https://api.x.ai/v1")
    GROK_MODEL: str = os.getenv("GROK_MODEL", "grok-beta")
    
    # Paths
    BASE_DIR: Path = Path(__file__).resolve().parent
    DATA_PATH: str = os.getenv("DATA_PATH", str(BASE_DIR / "data" / "insurance.csv"))
    MODEL_PATH: str = os.getenv("MODEL_PATH", str(BASE_DIR / "models" / "risk_model.joblib"))
    
    # CORS
    ALLOWED_ORIGINS: list = os.getenv(
        "ALLOWED_ORIGINS", 
        "http://localhost:3000,http://127.0.0.1:3000"
    ).split(",")
    
    # Logging
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    
    @classmethod
    def validate(cls):
        """Validate required settings"""
        if not cls.GROK_API_KEY:
            print("⚠️ Warning: GROK_API_KEY not set. AI chat will use fallback responses.")
        
        if not os.path.exists(cls.DATA_PATH):
            print(f"⚠️ Warning: Dataset not found at {cls.DATA_PATH}")
            print("   Please download from: https://www.kaggle.com/datasets/mirichoi0218/insurance")
        
        return True
    '''
    
    class Config:
        env_file = ".env"


settings = Settings()


# Risk Factor Weights (Domain Knowledge Based)
RISK_WEIGHTS: Dict[str, float] = {
    # Traditional Factors
    "age": 0.12,
    "bmi": 0.14,
    "blood_pressure": 0.10,
    "smoking_status": 0.15,
    "alcohol_consumption": 0.06,
    "chronic_conditions": 0.13,
    "family_history": 0.08,
    "previous_claims": 0.12,
    
    # Alternative Data Factors (What makes us unique!)
    "exercise_frequency": -0.08,   
    "sleep_quality": -0.05,
    "stress_level": 0.07,
    "diet_quality": -0.04,
    "preventive_checkups": -0.06,
    "occupation_risk": 0.08,
    "location_risk": 0.05,
    "wearable_health_score": -0.07,
}

# Risk Categories
RISK_CATEGORIES: Dict[str, Dict] = {
    "LOW": {
        "min": 0.0,
        "max": 0.3,
        "label": "Low Risk",
        "color": "#22C55E",
        "recommendation": "APPROVE"
    },
    "MODERATE": {
        "min": 0.3,
        "max": 0.5,
        "label": "Moderate Risk",
        "color": "#F59E0B",
        "recommendation": "APPROVE_WITH_LOADING"
    },
    "MODERATE_HIGH": {
        "min": 0.5,
        "max": 0.7,
        "label": "Moderate-High Risk",
        "color": "#F97316",
        "recommendation": "REVIEW"
    },
    "HIGH": {
        "min": 0.7,
        "max": 1.0,
        "label": "High Risk",
        "color": "#EF4444",
        "recommendation": "MANUAL_UNDERWRITE"
    }
}

# STP Decision Types
STP_DECISIONS: Dict[str, Dict] = {
    "AUTO_APPROVE": {
        "label": "Auto-Approved",
        "description": "Straight-Through Processing - No manual intervention required",
        "color": "#22C55E",
        "icon": "✅"
    },
    "QUICK_REVIEW": {
        "label": "Quick Review",
        "description": "Requires brief underwriter verification",
        "color": "#F59E0B",
        "icon": "🔄"
    },
    "MANUAL_REVIEW": {
        "label": "Manual Review",
        "description": "Requires full underwriter assessment",
        "color": "#F97316",
        "icon": "👤"
    },
    "DECLINE": {
        "label": "Auto-Declined",
        "description": "Application does not meet criteria",
        "color": "#EF4444",
        "icon": "❌"
    },
    "FRAUD_HOLD": {
        "label": "Fraud Review",
        "description": "Flagged for fraud investigation",
        "color": "#DC2626",
        "icon": "🚨"
    }
}