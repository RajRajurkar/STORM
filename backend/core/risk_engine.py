import numpy as np
from typing import Dict, List, Tuple, Any
from datetime import datetime

from api.schemas import (
    ApplicationInput, 
    TraditionalData, 
    AlternativeData,
    RiskContribution,
    RiskAssessmentResult,
    RiskCategory
)
from config import RISK_WEIGHTS, RISK_CATEGORIES, settings

# Import ML model
try:
    from ml.model import get_model, MLRiskModel
    ML_AVAILABLE = True
except ImportError:
    ML_AVAILABLE = False
    print(" ML module not available, using rule-based system")


class RiskEngine:
    """
    Hybrid Risk Assessment Engine
    
    Uses:
    1. ML Model (primary) - When available
    2. Domain-based weighted scoring (fallback/supplement)
    3. Non-linear adjustments (real-world patterns)
    
    The ML model handles:
    - Risk score prediction
    - High/Low risk classification
    - Confidence estimation
    
    Domain rules add:
    - Explainability
    - Business logic constraints
    - Edge case handling
    """
    
    def __init__(self):
        self.weights = RISK_WEIGHTS
        self.categories = RISK_CATEGORIES
    
        self.ml_model = None
        if ML_AVAILABLE:
            try:
                self.ml_model = get_model()
                if self.ml_model.is_loaded:  
                    model_info = self.ml_model.get_model_info()
                    print(f" ML Model loaded: {model_info.get('classification_model', 'N/A')}")
                    print(f"   Accuracy: {model_info.get('accuracy', 'N/A')}")
                else:
                    print(" ML model exists but not loaded - using rule-based system")
            except Exception as e:
                print(f" Could not load ML model: {e}")
                print("   Falling back to rule-based system")
        
    def calculate_risk(self, application: ApplicationInput) -> RiskAssessmentResult:
        """
        Main risk calculation method.
        
        Uses ML model for prediction, domain rules for explanation.
        """
        traditional = application.traditional_data
        alternative = application.alternative_data or self._default_alternative_data()
        
        if self.ml_model and self.ml_model.is_loaded:
            ml_result = self._get_ml_prediction(application)
            risk_score = ml_result['risk_score']
            confidence = ml_result['confidence']
            ml_contributions = ml_result.get('contributions', [])
        else:
            ml_result = None
            risk_score = self._calculate_rule_based_score(traditional, alternative)
            confidence = 0.75
            ml_contributions = []
        
       
        risk_score = self._apply_business_rules(risk_score, traditional, alternative)
        
      
        factor_scores = self._calculate_factor_scores(traditional, alternative)
        contributions = self._calculate_contributions(factor_scores, risk_score)
        
     
        if ml_contributions:
            contributions = self._merge_contributions(contributions, ml_contributions)
        
        
        risk_category, risk_label = self._get_risk_category(risk_score)
        
        explanation = self._generate_explanation(
            risk_score, 
            risk_category, 
            contributions,
            traditional,
            ml_result is not None
        )
        
    
        top_risk = [c.display_name for c in contributions if c.contribution > 0][:3]
        top_protective = [c.display_name for c in contributions if c.contribution < 0][:3]
        
        return RiskAssessmentResult(
            risk_score=round(risk_score, 3),
            risk_category=risk_category,
            risk_label=risk_label,
            confidence_score=round(confidence, 3),
            contributions=contributions,
            top_risk_factors=top_risk,
            top_protective_factors=top_protective,
            explanation_text=explanation,
            assessed_at=datetime.now()
        )
    
    def _get_ml_prediction(self, application: ApplicationInput) -> Dict[str, Any]:
        """Get prediction from ML model."""
        
        # Convert to dictionary format
        app_dict = {
            'traditional_data': application.traditional_data.model_dump(),
            'alternative_data': application.alternative_data.model_dump() if application.alternative_data else {}
        }
        
        return self.ml_model.predict(app_dict)
    
    def _calculate_rule_based_score(
        self,
        traditional: TraditionalData,
        alternative: AlternativeData
    ) -> float:
        """Calculate risk using domain rules (fallback)."""
        
        factor_scores = self._calculate_factor_scores(traditional, alternative)
        
        total_score = 0.5  # Start at neutral
        
        for factor_name, data in factor_scores.items():
            weight = data["weight"]
            normalized = data["normalized"]
            total_score += weight * normalized
        
        return np.clip(total_score, 0, 1)
    
    def _apply_business_rules(
        self,
        score: float,
        traditional: TraditionalData,
        alternative: AlternativeData
    ) -> float:
        """Apply business rules and constraints."""
        
        adjusted = score
        
        # Rule 1: Smoking + High BP = multiplicative risk
        if (traditional.smoking_status.value == "current" and 
            traditional.blood_pressure_systolic > 140):
            adjusted *= 1.15
        
        # Rule 2: Exercise + Good Diet = protective
        if (alternative.exercise_days_per_week >= 5 and 
            alternative.diet_quality_score >= 7):
            adjusted *= 0.92
        
        # Rule 3: Age acceleration after 55
        if traditional.age > 55:
            age_factor = 1 + (traditional.age - 55) * 0.008
            adjusted *= age_factor
        
        # Rule 4: Multiple chronic conditions = exponential risk
        if traditional.chronic_conditions >= 3:
            adjusted *= 1.18
        
        # Rule 5: High claims history
        if traditional.previous_claims >= 4:
            adjusted += 0.08
        
        # Rule 6: Very healthy profile bonus
        if (traditional.smoking_status.value == "never" and
            traditional.chronic_conditions == 0 and
            traditional.bmi >= 18.5 and traditional.bmi <= 25 and
            alternative.exercise_days_per_week >= 4):
            adjusted *= 0.88
        
        return np.clip(adjusted, 0, 1)
    
    def _default_alternative_data(self) -> AlternativeData:
        """Return default alternative data when not provided."""
        return AlternativeData()
    
    def _calculate_factor_scores(
        self, 
        traditional: TraditionalData, 
        alternative: AlternativeData
    ) -> Dict[str, Dict[str, Any]]:
        """Calculate normalized scores for each risk factor."""
        
        scores = {}
        
        # === TRADITIONAL FACTORS ===
        
        # Age
        age_score = self._normalize(traditional.age, 18, 80, clip=True)
        scores["age"] = {
            "value": traditional.age,
            "normalized": age_score,
            "display_name": "Age",
            "weight": self.weights["age"]
        }
        
        # BMI
        bmi = traditional.bmi
        if bmi < 18.5:
            bmi_score = self._normalize(18.5 - bmi, 0, 5)
        elif bmi > 25:
            bmi_score = self._normalize(bmi - 25, 0, 15, clip=True)
        else:
            bmi_score = 0
        scores["bmi"] = {
            "value": bmi,
            "normalized": bmi_score,
            "display_name": "BMI",
            "weight": self.weights["bmi"]
        }
        
        # Blood Pressure
        systolic = traditional.blood_pressure_systolic
        bp_score = 0
        if systolic > 120:
            bp_score = self._normalize(systolic - 120, 0, 60, clip=True)
        scores["blood_pressure"] = {
            "value": f"{systolic}/{traditional.blood_pressure_diastolic}",
            "normalized": bp_score,
            "display_name": "Blood Pressure",
            "weight": self.weights["blood_pressure"]
        }
        
        # Smoking Status
        smoking_map = {"never": 0, "former": 0.5, "current": 1.0}
        smoking_score = smoking_map.get(traditional.smoking_status.value, 0)
        scores["smoking_status"] = {
            "value": traditional.smoking_status.value,
            "normalized": smoking_score,
            "display_name": "Smoking Status",
            "weight": self.weights["smoking_status"]
        }
        
        # Alcohol Consumption
        alcohol_map = {"none": 0, "occasional": 0.2, "moderate": 0.5, "heavy": 1.0}
        alcohol_score = alcohol_map.get(traditional.alcohol_consumption.value, 0)
        scores["alcohol_consumption"] = {
            "value": traditional.alcohol_consumption.value,
            "normalized": alcohol_score,
            "display_name": "Alcohol Consumption",
            "weight": self.weights["alcohol_consumption"]
        }
        
        # Chronic Conditions
        chronic_score = self._normalize(traditional.chronic_conditions, 0, 5, clip=True)
        scores["chronic_conditions"] = {
            "value": traditional.chronic_conditions,
            "normalized": chronic_score,
            "display_name": "Chronic Conditions",
            "weight": self.weights["chronic_conditions"]
        }
        
        # Family History
        family_score = self._normalize(traditional.family_history_conditions, 0, 5, clip=True)
        scores["family_history"] = {
            "value": traditional.family_history_conditions,
            "normalized": family_score,
            "display_name": "Family History",
            "weight": self.weights["family_history"]
        }
        
        # Previous Claims
        claims_score = self._normalize(traditional.previous_claims, 0, 5, clip=True)
        scores["previous_claims"] = {
            "value": traditional.previous_claims,
            "normalized": claims_score,
            "display_name": "Previous Claims",
            "weight": self.weights["previous_claims"]
        }
        
        # === ALTERNATIVE FACTORS ===
        
        # Exercise Frequency
        exercise_score = self._normalize(alternative.exercise_days_per_week, 0, 7)
        scores["exercise_frequency"] = {
            "value": f"{alternative.exercise_days_per_week} days/week",
            "normalized": exercise_score,
            "display_name": "Exercise Frequency",
            "weight": self.weights["exercise_frequency"]
        }
        
        # Stress Level
        stress_score = self._normalize(alternative.stress_level, 1, 10)
        scores["stress_level"] = {
            "value": f"{alternative.stress_level}/10",
            "normalized": stress_score,
            "display_name": "Stress Level",
            "weight": self.weights["stress_level"]
        }
        
        # Diet Quality
        diet_score = 1 - self._normalize(alternative.diet_quality_score, 1, 10)
        scores["diet_quality"] = {
            "value": f"{alternative.diet_quality_score}/10",
            "normalized": 1 - diet_score,
            "display_name": "Diet Quality",
            "weight": self.weights["diet_quality"]
        }
        
        # Preventive Checkups
        checkup_score = 1.0 if alternative.regular_checkups else 0.0
        scores["preventive_checkups"] = {
            "value": "Yes" if alternative.regular_checkups else "No",
            "normalized": checkup_score,
            "display_name": "Regular Checkups",
            "weight": self.weights["preventive_checkups"]
        }
        
        return scores
    
    def _calculate_contributions(
        self, 
        factor_scores: Dict, 
        total_risk: float
    ) -> List[RiskContribution]:
        """Calculate each factor's contribution to the total risk."""
        
        contributions = []
        
        for factor_name, data in factor_scores.items():
            weight = data["weight"]
            normalized = data["normalized"]
            
            contribution = weight * normalized
            percentage = abs(contribution / total_risk) * 100 if total_risk > 0 else 0
            
            contributions.append(RiskContribution(
                factor=factor_name,
                display_name=data["display_name"],
                value=data["value"],
                contribution=round(contribution, 4),
                percentage=round(percentage, 1),
                category="positive" if contribution > 0 else "negative"
            ))
        
        contributions.sort(key=lambda x: abs(x.contribution), reverse=True)
        
        return contributions
    
    def _merge_contributions(
        self,
        rule_contributions: List[RiskContribution],
        ml_contributions: List[Dict]
    ) -> List[RiskContribution]:
        """Merge rule-based and ML contributions."""
        
        # Use rule-based as primary (more explainable)
        # But adjust importance based on ML
        
        ml_importance = {c['feature']: c['importance'] for c in ml_contributions}
        
        for contrib in rule_contributions:
            if contrib.factor in ml_importance:
                # Blend the contributions
                ml_imp = ml_importance[contrib.factor]
                contrib.contribution = (contrib.contribution + ml_imp) / 2
        
        return rule_contributions
    
    def _get_risk_category(self, score: float) -> Tuple[RiskCategory, str]:
        """Determine risk category from score."""
        for category, info in self.categories.items():
            if info["min"] <= score < info["max"]:
                return RiskCategory(category), info["label"]
        return RiskCategory.HIGH, "High Risk"
    
    def _generate_explanation(
        self, 
        risk_score: float,
        risk_category: RiskCategory,
        contributions: List[RiskContribution],
        traditional: TraditionalData,
        used_ml: bool
    ) -> str:
        """Generate human-readable explanation."""
        
        risk_factors = [c for c in contributions if c.contribution > 0][:3]
        protective_factors = [c for c in contributions if c.contribution < 0][:3]
        
        category_name = risk_category.value.replace("_", "-").title()
        
        explanation = f"Your risk score of {risk_score:.2f} places you in the {category_name} category"
        
        if used_ml:
            explanation += " (assessed using our AI model). "
        else:
            explanation += ". "
        
        if risk_factors:
            top_factor = risk_factors[0]
            explanation += f"The primary driver of your risk is {top_factor.display_name.lower()}"
            
            if top_factor.factor == "previous_claims":
                explanation += f" - having filed {traditional.previous_claims} claims impacts your risk profile significantly. "
            elif top_factor.factor == "bmi":
                explanation += f" at {traditional.bmi:.1f}. "
            elif top_factor.factor == "smoking_status":
                explanation += f" ({traditional.smoking_status.value}). "
            else:
                explanation += ". "
        
        if protective_factors:
            explanation += "On the positive side, "
            protective_names = [f.display_name.lower() for f in protective_factors[:2]]
            explanation += f"your {' and '.join(protective_names)} "
            explanation += "are working in your favor to reduce overall risk."
        
        return explanation
    
    def _normalize(
        self, 
        value: float, 
        min_val: float, 
        max_val: float, 
        clip: bool = False
    ) -> float:
        """Normalize value to 0-1 range."""
        normalized = (value - min_val) / (max_val - min_val)
        if clip:
            return np.clip(normalized, 0, 1)
        return normalized
    
    def get_model_status(self) -> Dict[str, Any]:
        """Get current model status."""
        if self.ml_model and self.ml_model.is_loaded:
            return self.ml_model.get_model_info()
        return {
            'is_loaded': False,
            'model_type': 'rule_based'
        }


# Singleton instance
risk_engine = RiskEngine()  