import numpy as np
import pandas as pd
from typing import Tuple
import os
from datetime import datetime, timedelta
import random

# Set seed for reproducibility
np.random.seed(42)
random.seed(42)


class InsuranceDataGenerator:
    """
    Generates synthetic but realistic insurance application data.
    
    The data follows real-world distributions and correlations:
    - Age affects BMI, blood pressure, chronic conditions
    - Smoking correlates with respiratory issues
    - Exercise inversely correlates with health issues
    - Claims history correlates with risk factors
    """
    
    def __init__(self, n_samples: int = 10000):
        self.n_samples = n_samples
        
    def generate(self) -> pd.DataFrame:
        """Generate complete synthetic dataset."""
        
        print(f" Generating {self.n_samples} synthetic insurance records...")
        
        # === DEMOGRAPHIC DATA ===
        ages = self._generate_ages()
        genders = self._generate_genders()
        incomes = self._generate_incomes(ages)
        occupations = self._generate_occupations()
        
        # === PHYSICAL MEASUREMENTS ===
        heights = self._generate_heights(genders)
        weights = self._generate_weights(ages, heights, genders)
        bmis = weights / ((heights / 100) ** 2)
        
        # === HEALTH INDICATORS ===
        blood_pressure_sys, blood_pressure_dia = self._generate_blood_pressure(ages, bmis)
        smoking_status = self._generate_smoking_status(ages)
        alcohol_consumption = self._generate_alcohol_consumption(ages)
        chronic_conditions = self._generate_chronic_conditions(ages, bmis, smoking_status)
        family_history = self._generate_family_history()
        hospitalizations = self._generate_hospitalizations(ages, chronic_conditions)
        
        # === LIFESTYLE DATA (Alternative Data Sources) ===
        exercise_days = self._generate_exercise(ages, bmis)
        daily_steps = self._generate_daily_steps(exercise_days)
        sleep_hours = self._generate_sleep_hours(ages)
        stress_level = self._generate_stress_level(occupations, ages)
        diet_quality = self._generate_diet_quality(exercise_days, bmis)
        resting_heart_rate = self._generate_heart_rate(ages, exercise_days, bmis)
        active_minutes = self._generate_active_minutes(exercise_days)
        
        # === BEHAVIORAL DATA ===
        regular_checkups = self._generate_checkups(ages, incomes)
        gym_membership = self._generate_gym_membership(exercise_days)
        meditation_practice = self._generate_meditation(stress_level)
        work_life_balance = self._generate_work_life_balance(stress_level, occupations)
        
        # === ENVIRONMENTAL DATA ===
        location_risk = self._generate_location_risk()
        air_quality = self._generate_air_quality(location_risk)
        
        # === CLAIMS HISTORY ===
        previous_claims = self._generate_claims_history(
            ages, chronic_conditions, hospitalizations, smoking_status
        )
        
        # === CALCULATE RISK SCORE (Target Variable) ===
        risk_scores = self._calculate_risk_scores(
            ages, bmis, blood_pressure_sys, smoking_status, alcohol_consumption,
            chronic_conditions, family_history, previous_claims, hospitalizations,
            exercise_days, stress_level, diet_quality, resting_heart_rate
        )
        
        # === CREATE DATAFRAME ===
        df = pd.DataFrame({
            # Demographics
            'age': ages,
            'gender': genders,
            'annual_income': incomes,
            'occupation': occupations,
            
            # Physical
            'height_cm': heights,
            'weight_kg': weights,
            'bmi': np.round(bmis, 1),
            'blood_pressure_systolic': blood_pressure_sys,
            'blood_pressure_diastolic': blood_pressure_dia,
            
            # Health
            'smoking_status': smoking_status,
            'alcohol_consumption': alcohol_consumption,
            'chronic_conditions': chronic_conditions,
            'family_history_conditions': family_history,
            'hospitalizations_last_5_years': hospitalizations,
            'previous_claims': previous_claims,
            
            # Lifestyle (Alternative Data)
            'exercise_days_per_week': exercise_days,
            'daily_steps_avg': daily_steps,
            'sleep_hours_avg': np.round(sleep_hours, 1),
            'stress_level': stress_level,
            'diet_quality_score': diet_quality,
            'resting_heart_rate': resting_heart_rate,
            'active_minutes_daily': active_minutes,
            
            # Behavioral
            'regular_checkups': regular_checkups,
            'gym_membership': gym_membership,
            'meditation_practice': meditation_practice,
            'work_life_balance': work_life_balance,
            
            # Environmental
            'location_risk_score': location_risk,
            'air_quality_score': air_quality,
            
            # Target
            'risk_score': np.round(risk_scores, 3),
            'risk_category': pd.cut(
                risk_scores, 
                bins=[0, 0.3, 0.5, 0.7, 1.0],
                labels=['LOW', 'MODERATE', 'MODERATE_HIGH', 'HIGH']
            )
        })
        
        # Add binary classification target
        df['is_high_risk'] = (df['risk_score'] >= 0.5).astype(int)
        
        # Add claim approval simulation
        df['claim_approved'] = self._simulate_claim_decisions(df)
        
        print(f" Generated {len(df)} records successfully!")
        print(f" Risk Distribution:")
        print(df['risk_category'].value_counts())
        
        return df
    
    def _generate_ages(self) -> np.ndarray:
        """Generate realistic age distribution (18-80)."""
        # Most applicants are 25-55
        ages = np.random.normal(42, 15, self.n_samples)
        ages = np.clip(ages, 18, 80).astype(int)
        return ages
    
    def _generate_genders(self) -> np.ndarray:
        """Generate gender distribution."""
        return np.random.choice(
            ['male', 'female', 'other'],
            self.n_samples,
            p=[0.48, 0.50, 0.02]
        )
    
    def _generate_incomes(self, ages: np.ndarray) -> np.ndarray:
        """Generate income based on age (correlated)."""
        base_income = 30000 + (ages - 18) * 1500  # Income grows with age
        noise = np.random.normal(0, 15000, self.n_samples)
        incomes = base_income + noise
        incomes = np.clip(incomes, 15000, 500000)
        return incomes.astype(int)
    
    def _generate_occupations(self) -> np.ndarray:
        """Generate occupation types."""
        return np.random.choice(
            ['sedentary', 'light', 'moderate', 'heavy', 'hazardous'],
            self.n_samples,
            p=[0.45, 0.25, 0.15, 0.10, 0.05]
        )
    
    def _generate_heights(self, genders: np.ndarray) -> np.ndarray:
        """Generate heights based on gender."""
        heights = np.zeros(self.n_samples)
        
        male_mask = genders == 'male'
        female_mask = genders == 'female'
        other_mask = genders == 'other'
        
        heights[male_mask] = np.random.normal(175, 7, male_mask.sum())
        heights[female_mask] = np.random.normal(162, 6, female_mask.sum())
        heights[other_mask] = np.random.normal(168, 8, other_mask.sum())
        
        return np.clip(heights, 140, 210).astype(int)
    
    def _generate_weights(
        self, 
        ages: np.ndarray, 
        heights: np.ndarray,
        genders: np.ndarray
    ) -> np.ndarray:
        """Generate weights correlated with height and age."""
        # Base weight from height
        base_bmi = np.random.normal(25, 5, self.n_samples)
        base_bmi = np.clip(base_bmi, 17, 45)
        
        # Age effect (slight increase with age)
        age_effect = (ages - 30) * 0.05
        base_bmi += age_effect
        
        weights = base_bmi * ((heights / 100) ** 2)
        return np.round(weights, 1)
    
    def _generate_blood_pressure(
        self, 
        ages: np.ndarray,
        bmis: np.ndarray
    ) -> Tuple[np.ndarray, np.ndarray]:
        """Generate blood pressure correlated with age and BMI."""
        # Base systolic BP
        systolic = 110 + (ages - 30) * 0.5 + (bmis - 25) * 0.8
        systolic += np.random.normal(0, 10, self.n_samples)
        systolic = np.clip(systolic, 90, 180).astype(int)
        
        # Diastolic is related to systolic
        diastolic = systolic * 0.65 + np.random.normal(0, 5, self.n_samples)
        diastolic = np.clip(diastolic, 60, 110).astype(int)
        
        return systolic, diastolic
    
    def _generate_smoking_status(self, ages: np.ndarray) -> np.ndarray:
        """Generate smoking status with age correlation."""
        smoking = []
        for age in ages:
            if age < 25:
                status = np.random.choice(
                    ['never', 'former', 'current'],
                    p=[0.75, 0.05, 0.20]
                )
            elif age < 45:
                status = np.random.choice(
                    ['never', 'former', 'current'],
                    p=[0.55, 0.20, 0.25]
                )
            else:
                status = np.random.choice(
                    ['never', 'former', 'current'],
                    p=[0.50, 0.35, 0.15]
                )
            smoking.append(status)
        return np.array(smoking)
    
    def _generate_alcohol_consumption(self, ages: np.ndarray) -> np.ndarray:
        """Generate alcohol consumption patterns."""
        return np.random.choice(
            ['none', 'occasional', 'moderate', 'heavy'],
            self.n_samples,
            p=[0.25, 0.45, 0.25, 0.05]
        )
    
    def _generate_chronic_conditions(
        self,
        ages: np.ndarray,
        bmis: np.ndarray,
        smoking: np.ndarray
    ) -> np.ndarray:
        """Generate chronic conditions based on risk factors."""
        # Base probability increases with age
        probs = 0.02 + (ages - 18) / 200
        
        # BMI effect
        probs += np.where(bmis > 30, 0.1, 0)
        probs += np.where(bmis > 35, 0.1, 0)
        
        # Smoking effect
        probs += np.where(smoking == 'current', 0.1, 0)
        probs += np.where(smoking == 'former', 0.03, 0)
        
        # Generate count (Poisson-like)
        conditions = np.random.poisson(probs * 3)
        return np.clip(conditions, 0, 5).astype(int)
    
    def _generate_family_history(self) -> np.ndarray:
        """Generate family history conditions."""
        return np.random.poisson(0.8, self.n_samples).clip(0, 5).astype(int)
    
    def _generate_hospitalizations(
        self,
        ages: np.ndarray,
        chronic: np.ndarray
    ) -> np.ndarray:
        """Generate hospitalization history."""
        # Base rate
        rate = 0.1 + (ages / 200) + (chronic * 0.1)
        hosp = np.random.poisson(rate)
        return np.clip(hosp, 0, 10).astype(int)
    
    def _generate_exercise(
        self,
        ages: np.ndarray,
        bmis: np.ndarray
    ) -> np.ndarray:
        """Generate exercise frequency (inversely correlated with BMI)."""
        base = 3 - (bmis - 25) * 0.1 - (ages - 30) * 0.02
        exercise = np.random.normal(base, 1.5, self.n_samples)
        return np.clip(exercise, 0, 7).astype(int)
    
    def _generate_daily_steps(self, exercise_days: np.ndarray) -> np.ndarray:
        """Generate daily steps correlated with exercise."""
        base = 4000 + exercise_days * 1200
        steps = np.random.normal(base, 2000, self.n_samples)
        return np.clip(steps, 500, 25000).astype(int)
    
    def _generate_sleep_hours(self, ages: np.ndarray) -> np.ndarray:
        """Generate sleep hours."""
        base = 7.5 - (ages - 30) * 0.01
        sleep = np.random.normal(base, 1, self.n_samples)
        return np.clip(sleep, 4, 10)
    
    def _generate_stress_level(
        self,
        occupations: np.ndarray,
        ages: np.ndarray
    ) -> np.ndarray:
        """Generate stress level based on occupation."""
        occupation_stress = {
            'sedentary': 5,
            'light': 4,
            'moderate': 5,
            'heavy': 6,
            'hazardous': 7
        }
        
        base = np.array([occupation_stress[o] for o in occupations])
        stress = base + np.random.normal(0, 1.5, self.n_samples)
        return np.clip(stress, 1, 10).astype(int)
    
    def _generate_diet_quality(
        self,
        exercise: np.ndarray,
        bmis: np.ndarray
    ) -> np.ndarray:
        """Generate diet quality (correlated with exercise, inverse with BMI)."""
        base = 5 + exercise * 0.5 - (bmis - 25) * 0.1
        diet = np.random.normal(base, 1.5, self.n_samples)
        return np.clip(diet, 1, 10).astype(int)
    
    def _generate_heart_rate(
        self,
        ages: np.ndarray,
        exercise: np.ndarray,
        bmis: np.ndarray
    ) -> np.ndarray:
        """Generate resting heart rate."""
        base = 70 + (ages - 30) * 0.1 - exercise * 2 + (bmis - 25) * 0.5
        hr = np.random.normal(base, 8, self.n_samples)
        return np.clip(hr, 45, 100).astype(int)
    
    def _generate_active_minutes(self, exercise: np.ndarray) -> np.ndarray:
        """Generate active minutes per day."""
        base = 15 + exercise * 15
        active = np.random.normal(base, 20, self.n_samples)
        return np.clip(active, 0, 180).astype(int)
    
    def _generate_checkups(
        self,
        ages: np.ndarray,
        incomes: np.ndarray
    ) -> np.ndarray:
        """Generate regular checkup habits."""
        # Higher income and older age = more likely to have checkups
        prob = 0.4 + (ages / 200) + (incomes / 500000)
        return (np.random.random(self.n_samples) < prob).astype(int)
    
    def _generate_gym_membership(self, exercise: np.ndarray) -> np.ndarray:
        """Generate gym membership (correlated with exercise)."""
        prob = 0.1 + exercise * 0.1
        return (np.random.random(self.n_samples) < prob).astype(int)
    
    def _generate_meditation(self, stress: np.ndarray) -> np.ndarray:
        """Generate meditation practice."""
        # Higher stress people might meditate more (coping)
        prob = 0.1 + (stress / 30)
        return (np.random.random(self.n_samples) < prob).astype(int)
    
    def _generate_work_life_balance(
        self,
        stress: np.ndarray,
        occupations: np.ndarray
    ) -> np.ndarray:
        """Generate work-life balance score."""
        base = 10 - stress + np.random.normal(0, 1.5, self.n_samples)
        return np.clip(base, 1, 10).astype(int)
    
    def _generate_location_risk(self) -> np.ndarray:
        """Generate location risk score."""
        return np.random.choice(
            range(1, 11),
            self.n_samples,
            p=[0.15, 0.15, 0.15, 0.12, 0.10, 0.10, 0.08, 0.07, 0.05, 0.03]
        )
    
    def _generate_air_quality(self, location_risk: np.ndarray) -> np.ndarray:
        """Generate air quality (inversely correlated with location risk)."""
        base = 11 - location_risk
        aq = base + np.random.normal(0, 1, self.n_samples)
        return np.clip(aq, 1, 10).astype(int)
    
    def _generate_claims_history(
        self,
        ages: np.ndarray,
        chronic: np.ndarray,
        hospitalizations: np.ndarray,
        smoking: np.ndarray
    ) -> np.ndarray:
        """Generate claims history based on health factors."""
        # Base rate
        rate = 0.3 + (ages / 150) + (chronic * 0.2) + (hospitalizations * 0.15)
        rate += np.where(smoking == 'current', 0.2, 0)
        
        claims = np.random.poisson(rate)
        return np.clip(claims, 0, 10).astype(int)
    
    def _calculate_risk_scores(
        self,
        ages: np.ndarray,
        bmis: np.ndarray,
        bp_systolic: np.ndarray,
        smoking: np.ndarray,
        alcohol: np.ndarray,
        chronic: np.ndarray,
        family_history: np.ndarray,
        claims: np.ndarray,
        hospitalizations: np.ndarray,
        exercise: np.ndarray,
        stress: np.ndarray,
        diet: np.ndarray,
        heart_rate: np.ndarray
    ) -> np.ndarray:
        """
        Calculate realistic risk scores based on actuarial principles.
        
        This simulates how an actual insurance company would assess risk.
        """
        
        scores = np.zeros(self.n_samples)
        
        # Age factor (normalized 0-1)
        scores += 0.12 * ((ages - 18) / 62)
        
        # BMI factor
        bmi_risk = np.zeros(self.n_samples)
        bmi_risk[bmis < 18.5] = 0.3  # Underweight
        bmi_risk[(bmis >= 18.5) & (bmis < 25)] = 0  # Normal
        bmi_risk[(bmis >= 25) & (bmis < 30)] = 0.3  # Overweight
        bmi_risk[(bmis >= 30) & (bmis < 35)] = 0.6  # Obese
        bmi_risk[bmis >= 35] = 1.0  # Severely obese
        scores += 0.14 * bmi_risk
        
        # Blood pressure factor
        bp_risk = np.clip((bp_systolic - 120) / 60, 0, 1)
        scores += 0.10 * bp_risk
        
        # Smoking factor
        smoking_risk = np.zeros(self.n_samples)
        smoking_risk[smoking == 'former'] = 0.4
        smoking_risk[smoking == 'current'] = 1.0
        scores += 0.15 * smoking_risk
        
        # Alcohol factor
        alcohol_risk = np.zeros(self.n_samples)
        alcohol_risk[alcohol == 'occasional'] = 0.1
        alcohol_risk[alcohol == 'moderate'] = 0.4
        alcohol_risk[alcohol == 'heavy'] = 1.0
        scores += 0.06 * alcohol_risk
        
        # Chronic conditions
        scores += 0.13 * np.clip(chronic / 3, 0, 1)
        
        # Family history
        scores += 0.08 * np.clip(family_history / 3, 0, 1)
        
        # Claims history
        scores += 0.12 * np.clip(claims / 5, 0, 1)
        
        # Exercise (protective factor - reduces risk)
        scores -= 0.08 * (exercise / 7)
        
        # Stress factor
        scores += 0.05 * ((stress - 1) / 9)
        
        # Diet quality (protective)
        scores -= 0.04 * ((diet - 1) / 9)
        
        # Heart rate factor
        hr_risk = np.clip((heart_rate - 60) / 40, 0, 1)
        scores += 0.05 * hr_risk
        
        # Hospitalizations
        scores += 0.06 * np.clip(hospitalizations / 5, 0, 1)
        
        # Add some random noise (real-world unpredictability)
        scores += np.random.normal(0, 0.03, self.n_samples)
        
        # Clip to valid range
        return np.clip(scores, 0, 1)
    
    def _simulate_claim_decisions(self, df: pd.DataFrame) -> np.ndarray:
        """Simulate claim approval decisions for STP training."""
        # Low risk = high approval rate
        approval_prob = 1 - df['risk_score'] * 0.8
        approval_prob += np.random.normal(0, 0.1, len(df))
        return (np.random.random(len(df)) < approval_prob).astype(int)
    
    def save_dataset(self, df: pd.DataFrame, filepath: str):
        """Save generated dataset to CSV."""
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        df.to_csv(filepath, index=False)
        print(f" Dataset saved to {filepath}")
        
    def get_dataset_statistics(self, df: pd.DataFrame) -> dict:
        """Get dataset statistics for documentation."""
        return {
            'total_records': len(df),
            'features': len(df.columns) - 3,  # Exclude targets
            'risk_distribution': df['risk_category'].value_counts().to_dict(),
            'avg_risk_score': df['risk_score'].mean(),
            'high_risk_percentage': (df['is_high_risk'].sum() / len(df)) * 100,
            'age_range': f"{df['age'].min()}-{df['age'].max()}",
            'income_range': f"${df['annual_income'].min():,}-${df['annual_income'].max():,}",
            'generated_at': datetime.now().isoformat()
        }


def generate_and_save_dataset(n_samples: int = 10000) -> pd.DataFrame:
    """Convenience function to generate and save dataset."""
    generator = InsuranceDataGenerator(n_samples)
    df = generator.generate()
    
    # Save to data folder
    filepath = os.path.join(
        os.path.dirname(os.path.dirname(__file__)), 
        'data', 
        'insurance_dataset.csv'
    )
    generator.save_dataset(df, filepath)
    
    # Print statistics
    stats = generator.get_dataset_statistics(df)
    print("\n Dataset Statistics:")
    for key, value in stats.items():
        print(f"   {key}: {value}")
    
    return df


if __name__ == "__main__":
    # Generate dataset when run directly
    df = generate_and_save_dataset(10000)
    print("\nDataset generation complete!")
    print(df.head())