import pandas as pd
import numpy as np
import os
import sys
import argparse
import json
from typing import Dict, List, Any, Optional


class UniversalDataAdapter:
    """
    Adapts any insurance dataset to our model's expected format.
    
    Features:
    - Automatic column mapping
    - Smart column detection
    - Missing value handling
    - Data type conversion
    - Target variable creation
    """
    
    # Our model expects these columns
    REQUIRED_COLUMNS = {
        # Demographics
        'age': ['age', 'applicant_age', 'customer_age', 'Age', 'AGE'],
        'gender': ['gender', 'sex', 'Gender', 'SEX', 'GENDER'],
        'annual_income': ['annual_income', 'income', 'yearly_income', 'salary', 'Income', 'INCOME'],
        'occupation': ['occupation', 'job', 'profession', 'work_type', 'Occupation', 'JOB'],
        
        # Physical
        'height_cm': ['height_cm', 'height', 'Height', 'HEIGHT'],
        'weight_kg': ['weight_kg', 'weight', 'Weight', 'WEIGHT'],
        'bmi': ['bmi', 'BMI', 'body_mass_index', 'BodyMassIndex'],
        'blood_pressure_systolic': ['blood_pressure_systolic', 'bp_systolic', 'systolic', 'systolic_bp', 'SBP'],
        'blood_pressure_diastolic': ['blood_pressure_diastolic', 'bp_diastolic', 'diastolic', 'diastolic_bp', 'DBP'],
        
        # Health
        'smoking_status': ['smoking_status', 'smoker', 'smoking', 'is_smoker', 'Smoker', 'SMOKER'],
        'alcohol_consumption': ['alcohol_consumption', 'alcohol', 'drinking', 'Alcohol'],
        'chronic_conditions': ['chronic_conditions', 'chronic_disease', 'conditions', 'num_conditions', 'diseases'],
        'family_history_conditions': ['family_history_conditions', 'family_history', 'genetic_risk', 'hereditary'],
        'hospitalizations_last_5_years': ['hospitalizations_last_5_years', 'hospitalizations', 'hospital_visits', 'admissions'],
        'previous_claims': ['previous_claims', 'claims', 'num_claims', 'claim_history', 'Claims', 'CLAIMS'],
        
        # Lifestyle (Alternative Data)
        'exercise_days_per_week': ['exercise_days_per_week', 'exercise', 'physical_activity', 'workout_days'],
        'daily_steps_avg': ['daily_steps_avg', 'steps', 'daily_steps', 'avg_steps'],
        'sleep_hours_avg': ['sleep_hours_avg', 'sleep', 'sleep_hours', 'avg_sleep'],
        'stress_level': ['stress_level', 'stress', 'anxiety_level'],
        'diet_quality_score': ['diet_quality_score', 'diet', 'nutrition', 'diet_score'],
        'resting_heart_rate': ['resting_heart_rate', 'heart_rate', 'rhr', 'pulse'],
        
        # Behavioral
        'regular_checkups': ['regular_checkups', 'checkups', 'health_checkups', 'preventive_care'],
        'gym_membership': ['gym_membership', 'gym', 'fitness_membership'],
        
        # Environmental
        'location_risk_score': ['location_risk_score', 'location_risk', 'area_risk', 'region_risk'],
        
        # Target (if available)
        'risk_score': ['risk_score', 'risk', 'risk_level', 'Risk', 'RISK', 'target', 'label'],
        'claim_approved': ['claim_approved', 'approved', 'claim_status', 'is_approved', 'outcome']
    }
    
    # Default values for missing columns
    DEFAULT_VALUES = {
        'age': 35,
        'gender': 'male',
        'annual_income': 50000,
        'occupation': 'sedentary',
        'height_cm': 170,
        'weight_kg': 70,
        'bmi': 24.2,
        'blood_pressure_systolic': 120,
        'blood_pressure_diastolic': 80,
        'smoking_status': 'never',
        'alcohol_consumption': 'occasional',
        'chronic_conditions': 0,
        'family_history_conditions': 0,
        'hospitalizations_last_5_years': 0,
        'previous_claims': 0,
        'exercise_days_per_week': 3,
        'daily_steps_avg': 6000,
        'sleep_hours_avg': 7.0,
        'stress_level': 5,
        'diet_quality_score': 6,
        'resting_heart_rate': 72,
        'regular_checkups': 1,
        'gym_membership': 0,
        'location_risk_score': 5,
        'active_minutes_daily': 30,
        'work_life_balance': 6,
        'air_quality_score': 7,
        'meditation_practice': 0
    }
    
    def __init__(self):
        self.column_mapping = {}
        self.unmapped_columns = []
        self.added_defaults = []
        
    def load_data(self, filepath: str) -> pd.DataFrame:
        """Load data from various file formats."""
        
        ext = os.path.splitext(filepath)[1].lower()
        
        print(f" Loading data from: {filepath}")
        
        if ext == '.csv':
            df = pd.read_csv(filepath)
        elif ext in ['.xlsx', '.xls']:
            df = pd.read_excel(filepath)
        elif ext == '.json':
            df = pd.read_json(filepath)
        elif ext == '.parquet':
            df = pd.read_parquet(filepath)
        else:
            # Try CSV as default
            df = pd.read_csv(filepath)
        
        print(f" Loaded {len(df)} records with {len(df.columns)} columns")
        print(f" Original columns: {list(df.columns)}")
        
        return df
    
    def detect_columns(self, df: pd.DataFrame) -> Dict[str, str]:
        """Automatically detect and map columns."""
        
        print("\n Detecting column mappings...")
        
        mapping = {}
        source_columns = [col.lower().strip() for col in df.columns]
        source_columns_original = list(df.columns)
        
        for target_col, possible_names in self.REQUIRED_COLUMNS.items():
            found = False
            
            for possible_name in possible_names:
                # Check exact match (case-insensitive)
                if possible_name.lower() in source_columns:
                    idx = source_columns.index(possible_name.lower())
                    mapping[target_col] = source_columns_original[idx]
                    found = True
                    break
                
                # Check partial match
                for i, src_col in enumerate(source_columns):
                    if possible_name.lower() in src_col or src_col in possible_name.lower():
                        mapping[target_col] = source_columns_original[i]
                        found = True
                        break
                
                if found:
                    break
            
            if not found:
                self.unmapped_columns.append(target_col)
        
        self.column_mapping = mapping
        
        print(f" Mapped {len(mapping)} columns")
        print(f" Unmapped columns (will use defaults): {self.unmapped_columns}")
        
        return mapping
    
    def show_mapping_summary(self, df: pd.DataFrame):
        """Display column mapping for user confirmation."""
        
        print("\n" + "="*60)
        print(" COLUMN MAPPING SUMMARY")
        print("="*60)
        
        print("\n MAPPED COLUMNS:")
        for target, source in self.column_mapping.items():
            print(f"   {source:30} → {target}")
        
        print("\n UNMAPPED (Using Defaults):")
        for col in self.unmapped_columns:
            print(f"   {col:30} → DEFAULT: {self.DEFAULT_VALUES.get(col, 'N/A')}")
        
        print("\n❓ UNUSED SOURCE COLUMNS:")
        used_sources = set(self.column_mapping.values())
        for col in df.columns:
            if col not in used_sources:
                print(f"   {col}")
    
    def manual_mapping(self) -> Dict[str, str]:
        """Allow manual column mapping via interactive prompt."""
        
        print("\n MANUAL COLUMN MAPPING")
        print("Enter source column name for each target (or press Enter to use default):\n")
        
        manual_map = {}
        
        for target_col in self.unmapped_columns[:]:
            user_input = input(f"  {target_col} [{self.DEFAULT_VALUES.get(target_col, 'N/A')}]: ").strip()
            
            if user_input:
                manual_map[target_col] = user_input
                self.unmapped_columns.remove(target_col)
        
        self.column_mapping.update(manual_map)
        return manual_map
    
    def adapt(self, df: pd.DataFrame, auto_mode: bool = True) -> pd.DataFrame:
        """
        Adapt the dataset to our expected format.
        
        Args:
            df: Source DataFrame
            auto_mode: If True, use automatic mapping. If False, prompt for manual input.
            
        Returns:
            Adapted DataFrame ready for model training
        """
        
        print("\n Adapting dataset...")
        
        # Detect columns
        self.detect_columns(df)
        
        # Show summary
        self.show_mapping_summary(df)
        
        # Manual mapping if needed
        if not auto_mode and self.unmapped_columns:
            self.manual_mapping()
        
        # Create new DataFrame with our expected columns
        adapted_df = pd.DataFrame()
        
        # Map existing columns
        for target_col, source_col in self.column_mapping.items():
            if source_col in df.columns:
                adapted_df[target_col] = df[source_col]
        
        # Add default values for missing columns
        for col in self.unmapped_columns:
            if col in self.DEFAULT_VALUES:
                adapted_df[col] = self.DEFAULT_VALUES[col]
                self.added_defaults.append(col)
        
        # Data cleaning and type conversion
        adapted_df = self._clean_data(adapted_df)
        
        # Calculate BMI if we have height and weight but no BMI
        if 'bmi' not in adapted_df.columns or adapted_df['bmi'].isna().all():
            if 'height_cm' in adapted_df.columns and 'weight_kg' in adapted_df.columns:
                height_m = adapted_df['height_cm'] / 100
                adapted_df['bmi'] = adapted_df['weight_kg'] / (height_m ** 2)
                adapted_df['bmi'] = adapted_df['bmi'].round(1)
        
        # Create target variable if not exists
        if 'risk_score' not in adapted_df.columns:
            adapted_df['risk_score'] = self._estimate_risk_score(adapted_df)
            print(" Generated risk_score based on available features")
        
        # Create binary classification target
        if 'is_high_risk' not in adapted_df.columns:
            adapted_df['is_high_risk'] = (adapted_df['risk_score'] >= 0.5).astype(int)
        
        # Create risk category
        adapted_df['risk_category'] = pd.cut(
            adapted_df['risk_score'],
            bins=[0, 0.3, 0.5, 0.7, 1.0],
            labels=['LOW', 'MODERATE', 'MODERATE_HIGH', 'HIGH']
        )
        
        print(f"\n Adapted dataset: {len(adapted_df)} records, {len(adapted_df.columns)} columns")
        
        return adapted_df
    
    def _clean_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """Clean and standardize data types."""
        
        df = df.copy()
        
        # Numeric columns
        numeric_cols = ['age', 'annual_income', 'height_cm', 'weight_kg', 'bmi',
                       'blood_pressure_systolic', 'blood_pressure_diastolic',
                       'chronic_conditions', 'family_history_conditions',
                       'hospitalizations_last_5_years', 'previous_claims',
                       'exercise_days_per_week', 'daily_steps_avg', 'sleep_hours_avg',
                       'stress_level', 'diet_quality_score', 'resting_heart_rate',
                       'location_risk_score', 'risk_score']
        
        for col in numeric_cols:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors='coerce')
        
        # Standardize categorical columns
        if 'gender' in df.columns:
            df['gender'] = df['gender'].str.lower().str.strip()
            df['gender'] = df['gender'].replace({
                'm': 'male', 'f': 'female', 'man': 'male', 'woman': 'female',
                '0': 'male', '1': 'female', 'Male': 'male', 'Female': 'female'
            })
            df['gender'] = df['gender'].fillna('male')
        
        if 'smoking_status' in df.columns:
            df['smoking_status'] = df['smoking_status'].str.lower().str.strip()
            df['smoking_status'] = df['smoking_status'].replace({
                'yes': 'current', 'no': 'never', 'y': 'current', 'n': 'never',
                '1': 'current', '0': 'never', 'true': 'current', 'false': 'never',
                'ex': 'former', 'ex-smoker': 'former', 'quit': 'former',
                'non-smoker': 'never', 'nonsmoker': 'never', 'non smoker': 'never'
            })
            df['smoking_status'] = df['smoking_status'].fillna('never')
        
        if 'alcohol_consumption' in df.columns:
            df['alcohol_consumption'] = df['alcohol_consumption'].str.lower().str.strip()
            df['alcohol_consumption'] = df['alcohol_consumption'].replace({
                'yes': 'moderate', 'no': 'none', '0': 'none', '1': 'occasional',
                '2': 'moderate', '3': 'heavy', 'never': 'none', 'rarely': 'occasional',
                'sometimes': 'moderate', 'frequently': 'heavy', 'daily': 'heavy'
            })
            df['alcohol_consumption'] = df['alcohol_consumption'].fillna('occasional')
        
        if 'occupation' in df.columns:
            df['occupation'] = df['occupation'].str.lower().str.strip()
            # Map to our categories
            occupation_map = {
                'office': 'sedentary', 'desk': 'sedentary', 'it': 'sedentary',
                'software': 'sedentary', 'admin': 'sedentary', 'manager': 'sedentary',
                'teacher': 'light', 'retail': 'light', 'sales': 'light',
                'nurse': 'moderate', 'healthcare': 'moderate', 'technician': 'moderate',
                'construction': 'heavy', 'factory': 'heavy', 'manual': 'heavy',
                'mining': 'hazardous', 'military': 'hazardous', 'police': 'hazardous',
                'firefighter': 'hazardous'
            }
            for pattern, category in occupation_map.items():
                df.loc[df['occupation'].str.contains(pattern, na=False), 'occupation'] = category
            df['occupation'] = df['occupation'].fillna('sedentary')
        
        # Binary columns
        binary_cols = ['regular_checkups', 'gym_membership', 'meditation_practice']
        for col in binary_cols:
            if col in df.columns:
                df[col] = df[col].apply(lambda x: 1 if str(x).lower() in ['1', 'yes', 'true', 'y'] else 0)
        
        # Fill remaining NaN values
        for col in df.columns:
            if df[col].dtype in ['float64', 'int64']:
                df[col] = df[col].fillna(df[col].median())
            else:
                df[col] = df[col].fillna(df[col].mode().iloc[0] if len(df[col].mode()) > 0 else 'unknown')
        
        return df
    
    def _estimate_risk_score(self, df: pd.DataFrame) -> pd.Series:
        """Estimate risk score from available features."""
        
        risk = pd.Series(0.0, index=df.index)
        
        # Age factor
        if 'age' in df.columns:
            risk += 0.12 * ((df['age'] - 18) / 62).clip(0, 1)
        
        # BMI factor
        if 'bmi' in df.columns:
            bmi_risk = np.where(df['bmi'] < 18.5, 0.3,
                       np.where(df['bmi'] < 25, 0,
                       np.where(df['bmi'] < 30, 0.3,
                       np.where(df['bmi'] < 35, 0.6, 1.0))))
            risk += 0.14 * bmi_risk
        
        # Smoking
        if 'smoking_status' in df.columns:
            smoking_risk = df['smoking_status'].map({'never': 0, 'former': 0.5, 'current': 1.0}).fillna(0)
            risk += 0.15 * smoking_risk
        
        # Previous claims
        if 'previous_claims' in df.columns:
            risk += 0.12 * (df['previous_claims'] / 5).clip(0, 1)
        
        # Chronic conditions
        if 'chronic_conditions' in df.columns:
            risk += 0.13 * (df['chronic_conditions'] / 3).clip(0, 1)
        
        # Exercise (protective)
        if 'exercise_days_per_week' in df.columns:
            risk -= 0.08 * (df['exercise_days_per_week'] / 7)
        
        # Add noise
        risk += np.random.normal(0, 0.03, len(df))
        
        return risk.clip(0, 1)
    
    def save_adapted_data(self, df: pd.DataFrame, filepath: str):
        """Save adapted dataset."""
        
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        df.to_csv(filepath, index=False)
        print(f" Saved adapted dataset to: {filepath}")
    
    def generate_mapping_report(self) -> Dict[str, Any]:
        """Generate a report of the mapping process."""
        
        return {
            'mapped_columns': self.column_mapping,
            'unmapped_columns': self.unmapped_columns,
            'defaults_used': self.added_defaults,
            'total_mapped': len(self.column_mapping),
            'total_defaults': len(self.added_defaults)
        }


def adapt_judges_data(input_file: str, output_file: str = None, auto: bool = True):
    """
    Convenience function to adapt judge's dataset.
    
    Usage:
        from data_adapter import adapt_judges_data
        adapted_df = adapt_judges_data("judges_data.csv")
    """
    
    if output_file is None:
        output_file = os.path.join(
            os.path.dirname(os.path.dirname(__file__)),
            'data',
            'insurance_dataset.csv'
        )
    
    adapter = UniversalDataAdapter()
    df = adapter.load_data(input_file)
    adapted_df = adapter.adapt(df, auto_mode=auto)
    adapter.save_adapted_data(adapted_df, output_file)
    
    # Generate report
    report = adapter.generate_mapping_report()
    print("\n Mapping Report:")
    print(f"   Mapped: {report['total_mapped']} columns")
    print(f"   Defaults: {report['total_defaults']} columns")
    
    return adapted_df


def main():
    """Command-line interface."""
    
    parser = argparse.ArgumentParser(
        description="Adapt any insurance dataset to LiveRisk AI format"
    )
    parser.add_argument(
        '--input', '-i',
        required=True,
        help='Path to input dataset (CSV, Excel, JSON)'
    )
    parser.add_argument(
        '--output', '-o',
        default=None,
        help='Path for output adapted dataset'
    )
    parser.add_argument(
        '--auto', '-a',
        action='store_true',
        default=True,
        help='Use automatic column mapping'
    )
    parser.add_argument(
        '--interactive', '-m',
        action='store_true',
        help='Use interactive manual mapping'
    )
    
    args = parser.parse_args()
    
    auto_mode = not args.interactive
    
    adapt_judges_data(args.input, args.output, auto=auto_mode)
    
    print("\n Adaptation complete! Now run training:")
    print("   python scripts/train_and_setup.py")


if __name__ == "__main__":
    main()