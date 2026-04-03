import numpy as np
import pandas as pd
import pickle
import os
import json
from typing import Dict, Any, Tuple, Optional
from datetime import datetime

from .feature_engineering import FeatureEngineer


class MLRiskModel:
    """
    Production ML Model for Risk Prediction.
    
    Combines:
    - Classification model (high risk / low risk)
    - Regression model (risk score)
    - Feature engineering pipeline
    
    Provides:
    - Risk score prediction
    - Risk category classification
    - Confidence estimation
    - Feature importance
    """
    
    def __init__(self, model_dir: str = None):
        """Initialize the ML model."""
        
        if model_dir is None:
            model_dir = os.path.join(os.path.dirname(__file__), '..', 'data')
        
        self.model_dir = model_dir
        self.classification_model = None
        self.regression_model = None
        self.feature_engineer = FeatureEngineer()
        self.metrics = None
        self.is_loaded = False
        
        # Try to load models
        self._load_models()
    
    def _load_models(self):
        """Load trained models from disk."""
        
        model_path = os.path.join(self.model_dir, 'trained_model.pkl')
        fe_path = os.path.join(self.model_dir, 'feature_scaler.pkl')
        metrics_path = os.path.join(self.model_dir, 'training_metrics.json')
        
        if not os.path.exists(model_path):
            print(" No trained model found. Using fallback rule-based system.")
            self.is_loaded = False
            return
        
        try:
            # Load models
            with open(model_path, 'rb') as f:
                model_data = pickle.load(f)
            
            self.classification_model = model_data['classification_model']
            self.regression_model = model_data['regression_model']
            
            # Load feature engineer
            if os.path.exists(fe_path):
                self.feature_engineer.load(fe_path)
            
            # Load metrics
            if os.path.exists(metrics_path):
                with open(metrics_path, 'r') as f:
                    self.metrics = json.load(f)
            
            self.is_loaded = True
            print(" ML models loaded successfully!")
            print(f"   Classification: {model_data.get('classification_name', 'Unknown')}")
            print(f"   Regression: {model_data.get('regression_name', 'Unknown')}")
            
        except Exception as e:
            print(f" Error loading models: {e}")
            self.is_loaded = False
    
    def predict(self, application_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Make a complete risk prediction.
        
        Args:
            application_data: Dictionary containing all application fields
            
        Returns:
            Dictionary with risk_score, risk_category, confidence, etc.
        """
        
        if not self.is_loaded:
            return self._fallback_prediction(application_data)
        
        try:
            # Prepare features
            features = self._prepare_features(application_data)
            
            # Get regression prediction (risk score)
            risk_score = float(self.regression_model.predict(features)[0])
            risk_score = np.clip(risk_score, 0, 1)
            
            # Get classification prediction and probability
            is_high_risk = int(self.classification_model.predict(features)[0])
            class_proba = self.classification_model.predict_proba(features)[0]
            confidence = float(max(class_proba))
            
            # Determine risk category
            risk_category = self._get_risk_category(risk_score)
            
            # Get feature contributions (for explainability)
            contributions = self._calculate_contributions(features, application_data)
            
            return {
                'risk_score': round(risk_score, 3),
                'risk_category': risk_category,
                'risk_label': self._get_risk_label(risk_category),
                'is_high_risk': is_high_risk,
                'confidence': round(confidence, 3),
                'model_type': 'ml',
                'contributions': contributions,
                'prediction_time': datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f" ML prediction error: {e}, using fallback")
            return self._fallback_prediction(application_data)
    
    def predict_batch(self, applications: list) -> list:
        """Make predictions for multiple applications."""
        return [self.predict(app) for app in applications]
    
    def _prepare_features(self, data: Dict[str, Any]) -> np.ndarray:
        """Convert application data to model features."""
        
        # Flatten nested structure if present
        flat_data = {}
        
        if 'traditional_data' in data:
            flat_data.update(data['traditional_data'])
        if 'alternative_data' in data and data['alternative_data']:
            flat_data.update(data['alternative_data'])
        
        # Add root level fields
        for key in ['age', 'gender', 'occupation', 'annual_income']:
            if key in data and key not in flat_data:
                flat_data[key] = data[key]
        
        # Calculate BMI if needed
        if 'bmi' not in flat_data and 'height_cm' in flat_data and 'weight_kg' in flat_data:
            flat_data['bmi'] = flat_data['weight_kg'] / ((flat_data['height_cm'] / 100) ** 2)
        
        # Convert to DataFrame
        df = pd.DataFrame([flat_data])
        
        # Apply feature engineering
        features = self.feature_engineer.transform(df)
        
        return features
    
    def _get_risk_category(self, score: float) -> str:
        """Determine risk category from score."""
        if score < 0.3:
            return 'LOW'
        elif score < 0.5:
            return 'MODERATE'
        elif score < 0.7:
            return 'MODERATE_HIGH'
        else:
            return 'HIGH'
    
    def _get_risk_label(self, category: str) -> str:
        """Get human-readable risk label."""
        labels = {
            'LOW': 'Low Risk',
            'MODERATE': 'Moderate Risk',
            'MODERATE_HIGH': 'Moderate-High Risk',
            'HIGH': 'High Risk'
        }
        return labels.get(category, 'Unknown')
    
    def _calculate_contributions(
        self, 
        features: np.ndarray, 
        raw_data: Dict
    ) -> list:
        """Calculate feature contributions to the prediction."""
        
        contributions = []
        
        if hasattr(self.classification_model, 'feature_importances_'):
            importances = self.classification_model.feature_importances_
            feature_names = self.feature_engineer.get_feature_names()
            
            # Get feature values
            feature_values = features[0]
            
            for i, (name, importance) in enumerate(zip(feature_names, importances)):
                if importance > 0.02:  # Only significant features
                    # Determine if this increases or decreases risk
                    value = feature_values[i] if i < len(feature_values) else 0
                    
                    # For standardized features, positive = higher than average
                    contribution_direction = 'positive' if value > 0 else 'negative'
                    
                    contributions.append({
                        'feature': name,
                        'display_name': self._format_feature_name(name),
                        'importance': round(importance, 4),
                        'contribution': round(importance * (1 if value > 0 else -1), 4),
                        'direction': contribution_direction
                    })
            
            # Sort by absolute importance
            contributions.sort(key=lambda x: abs(x['importance']), reverse=True)
        
        return contributions[:10]  # Top 10 features
    
    def _format_feature_name(self, name: str) -> str:
        """Format feature name for display."""
        # Convert snake_case to Title Case
        return ' '.join(word.capitalize() for word in name.split('_'))
    
    def _fallback_prediction(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Fallback rule-based prediction when ML model is not available.
        Uses weighted domain knowledge approach.
        """
        
        # Extract data
        trad = data.get('traditional_data', data)
        alt = data.get('alternative_data', {}) or {}
        
        # Calculate BMI
        height_m = trad.get('height_cm', 170) / 100
        weight = trad.get('weight_kg', 70)
        bmi = weight / (height_m ** 2)
        
        # Calculate risk score using domain rules
        risk_score = 0.0
        
        # Age factor
        age = trad.get('age', 35)
        risk_score += 0.12 * min((age - 18) / 62, 1)
        
        # BMI factor
        if bmi < 18.5 or bmi > 30:
            risk_score += 0.14 * min((abs(bmi - 24) / 15), 1)
        
        # Blood pressure
        bp = trad.get('blood_pressure_systolic', 120)
        if bp > 120:
            risk_score += 0.10 * min((bp - 120) / 60, 1)
        
        # Smoking
        smoking = trad.get('smoking_status', 'never')
        if smoking == 'current':
            risk_score += 0.15
        elif smoking == 'former':
            risk_score += 0.05
        
        # Chronic conditions
        chronic = trad.get('chronic_conditions', 0)
        risk_score += 0.13 * min(chronic / 3, 1)
        
        # Previous claims
        claims = trad.get('previous_claims', 0)
        risk_score += 0.12 * min(claims / 5, 1)
        
        # Exercise (protective)
        exercise = alt.get('exercise_days_per_week', 3)
        risk_score -= 0.08 * (exercise / 7)
        
        # Stress
        stress = alt.get('stress_level', 5)
        risk_score += 0.05 * (stress / 10)
        
        risk_score = np.clip(risk_score, 0, 1)
        
        return {
            'risk_score': round(risk_score, 3),
            'risk_category': self._get_risk_category(risk_score),
            'risk_label': self._get_risk_label(self._get_risk_category(risk_score)),
            'is_high_risk': int(risk_score >= 0.5),
            'confidence': 0.75,  # Lower confidence for rule-based
            'model_type': 'rule_based',
            'contributions': [],
            'prediction_time': datetime.now().isoformat()
        }
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get information about the loaded model."""
        
        info = {
            'is_loaded': self.is_loaded,
            'model_type': 'ml' if self.is_loaded else 'rule_based'
        }
        
        if self.metrics:
            info['training_date'] = self.metrics.get('training_date')
            info['classification_model'] = self.metrics.get('best_classification_model')
            info['regression_model'] = self.metrics.get('best_regression_model')
            
            if 'classification_metrics' in self.metrics:
                best_name = self.metrics['best_classification_model']
                if best_name in self.metrics['classification_metrics']:
                    info['accuracy'] = self.metrics['classification_metrics'][best_name].get('accuracy')
                    info['roc_auc'] = self.metrics['classification_metrics'][best_name].get('roc_auc')
        
        return info


# Global model instance
_model_instance = None

def get_model() -> MLRiskModel:
    """Get or create the global model instance."""
    global _model_instance
    if _model_instance is None:
        _model_instance = MLRiskModel()
    return _model_instance