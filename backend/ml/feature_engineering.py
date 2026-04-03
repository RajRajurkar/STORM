import numpy as np
import pandas as pd
from typing import Dict, Any, List, Tuple
from sklearn.preprocessing import StandardScaler, LabelEncoder
import pickle
import os


class FeatureEngineer:
    """
    Feature engineering pipeline for insurance risk prediction.
    
    Handles:
    - Numeric feature scaling
    - Categorical encoding
    - Feature derivation
    - Missing value handling
    """
    
    def __init__(self):
        self.scaler = StandardScaler()
        self.label_encoders = {}
        self.is_fitted = False
        
        # Define feature groups
        self.numeric_features = [
            'age', 'annual_income', 'height_cm', 'weight_kg', 'bmi',
            'blood_pressure_systolic', 'blood_pressure_diastolic',
            'chronic_conditions', 'family_history_conditions',
            'hospitalizations_last_5_years', 'previous_claims',
            'exercise_days_per_week', 'daily_steps_avg', 'sleep_hours_avg',
            'stress_level', 'diet_quality_score', 'resting_heart_rate',
            'active_minutes_daily', 'work_life_balance',
            'location_risk_score', 'air_quality_score'
        ]
        
        self.categorical_features = [
            'gender', 'occupation', 'smoking_status', 'alcohol_consumption'
        ]
        
        self.binary_features = [
            'regular_checkups', 'gym_membership', 'meditation_practice'
        ]
        
        self.derived_features = [
            'age_bmi_interaction', 'health_score', 'lifestyle_score',
            'risk_factor_count', 'protective_factor_count'
        ]
    
    def fit(self, df: pd.DataFrame):
        """Fit the feature engineering pipeline on training data."""
        
        print(" Fitting feature engineering pipeline...")
        
        # Prepare features
        df_processed = self._prepare_features(df)
        
        # Fit scaler on numeric features
        numeric_data = df_processed[self.numeric_features]
        self.scaler.fit(numeric_data)
        
        # Fit label encoders for categorical features
        for col in self.categorical_features:
            self.label_encoders[col] = LabelEncoder()
            self.label_encoders[col].fit(df[col])
        
        self.is_fitted = True
        print(" Feature engineering pipeline fitted!")
    
    def transform(self, df: pd.DataFrame) -> np.ndarray:
        """Transform data using fitted pipeline."""
        
        if not self.is_fitted:
            raise ValueError("FeatureEngineer must be fitted before transform!")
        
        # Prepare base features
        df_processed = self._prepare_features(df)
        
        # Scale numeric features
        numeric_data = df_processed[self.numeric_features]
        numeric_scaled = self.scaler.transform(numeric_data)
        
        # Encode categorical features
        categorical_encoded = []
        for col in self.categorical_features:
            encoded = self.label_encoders[col].transform(df[col])
            categorical_encoded.append(encoded.reshape(-1, 1))
        categorical_data = np.hstack(categorical_encoded)
        
        # Get binary features
        binary_data = df_processed[self.binary_features].values
        
        # Get derived features
        derived_data = self._create_derived_features(df_processed).values
        
        # Combine all features
        features = np.hstack([
            numeric_scaled,
            categorical_data,
            binary_data,
            derived_data
        ])
        
        return features
    
    def fit_transform(self, df: pd.DataFrame) -> np.ndarray:
        """Fit and transform in one step."""
        self.fit(df)
        return self.transform(df)
    
    def _prepare_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Prepare basic features from raw data."""
        
        df = df.copy()
        
        # Calculate BMI if not present
        if 'bmi' not in df.columns:
            df['bmi'] = df['weight_kg'] / ((df['height_cm'] / 100) ** 2)
        
        # Fill missing values
        for col in self.numeric_features:
            if col in df.columns:
                df[col] = df[col].fillna(df[col].median() if len(df) > 1 else 0)
        
        for col in self.binary_features:
            if col in df.columns:
                df[col] = df[col].fillna(0).astype(int)
        
        return df
    
    def _create_derived_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Create derived features from base features."""
        
        derived = pd.DataFrame()
        
        # Age-BMI interaction
        derived['age_bmi_interaction'] = df['age'] * df['bmi'] / 100
        
        # Overall health score (0-10)
        health_components = [
            10 - (df['bmi'] - 22).abs() / 3,  # BMI near 22 is ideal
            10 - (df['blood_pressure_systolic'] - 115) / 10,
            10 - df['chronic_conditions'] * 2,
            10 - (df['resting_heart_rate'] - 65) / 5
        ]
        derived['health_score'] = np.clip(
            sum(health_components) / len(health_components), 1, 10
        )
        
        # Lifestyle score (0-10)
        lifestyle_components = [
            df['exercise_days_per_week'] * 1.4,
            df['diet_quality_score'],
            10 - df['stress_level'],
            df['sleep_hours_avg'] * 1.2,
            df['work_life_balance']
        ]
        derived['lifestyle_score'] = np.clip(
            sum(lifestyle_components) / len(lifestyle_components), 1, 10
        )
        
        # Risk factor count
        derived['risk_factor_count'] = (
            (df['bmi'] > 30).astype(int) +
            (df['blood_pressure_systolic'] > 140).astype(int) +
            (df['chronic_conditions'] > 0).astype(int) +
            (df['previous_claims'] > 2).astype(int) +
            (df['stress_level'] > 7).astype(int)
        )
        
        # Protective factor count
        derived['protective_factor_count'] = (
            (df['exercise_days_per_week'] >= 4).astype(int) +
            (df['diet_quality_score'] >= 7).astype(int) +
            (df['regular_checkups'] == 1).astype(int) +
            (df['gym_membership'] == 1).astype(int) +
            (df['sleep_hours_avg'] >= 7).astype(int)
        )
        
        return derived
    
    def get_feature_names(self) -> List[str]:
        """Get list of all feature names."""
        return (
            self.numeric_features + 
            self.categorical_features + 
            self.binary_features + 
            self.derived_features
        )
    
    def save(self, filepath: str):
        """Save fitted pipeline to file."""
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        with open(filepath, 'wb') as f:
            pickle.dump({
                'scaler': self.scaler,
                'label_encoders': self.label_encoders,
                'is_fitted': self.is_fitted
            }, f)
        print(f" Feature engineer saved to {filepath}")
    
    def load(self, filepath: str):
        """Load fitted pipeline from file."""
        with open(filepath, 'rb') as f:
            data = pickle.load(f)
        self.scaler = data['scaler']
        self.label_encoders = data['label_encoders']
        self.is_fitted = data['is_fitted']
        print(f"📂 Feature engineer loaded from {filepath}")
    
    def transform_single(self, data: Dict[str, Any]) -> np.ndarray:
        """Transform a single application into features."""
        
        # Convert single record to DataFrame
        df = pd.DataFrame([data])
        
        # Apply transformation
        return self.transform(df)