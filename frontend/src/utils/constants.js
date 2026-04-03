// API Base URL
export const API_BASE_URL = '/api/v1';

// Risk Category Colors
export const RISK_COLORS = {
  LOW: '#22C55E',
  MODERATE: '#F59E0B',
  MODERATE_HIGH: '#F97316',
  HIGH: '#EF4444',
};

// Risk Category Labels
export const RISK_LABELS = {
  LOW: 'Low Risk',
  MODERATE: 'Moderate Risk',
  MODERATE_HIGH: 'Moderate-High Risk',
  HIGH: 'High Risk',
};

// STP Decision Colors
export const STP_COLORS = {
  AUTO_APPROVE: '#22C55E',
  QUICK_REVIEW: '#F59E0B',
  MANUAL_REVIEW: '#F97316',
  DECLINE: '#EF4444',
  FRAUD_HOLD: '#DC2626',
};

// STP Decision Labels
export const STP_LABELS = {
  AUTO_APPROVE: 'Auto-Approved',
  QUICK_REVIEW: 'Quick Review',
  MANUAL_REVIEW: 'Manual Review',
  DECLINE: 'Declined',
  FRAUD_HOLD: 'Fraud Hold',
};

// STP Decision Icons
export const STP_ICONS = {
  AUTO_APPROVE: '✅',
  QUICK_REVIEW: '🔄',
  MANUAL_REVIEW: '👤',
  DECLINE: '❌',
  FRAUD_HOLD: '🚨',
};

// Default Application Data
export const DEFAULT_APPLICATION = {
  applicant_name: "John Smith",
  email: "john.smith@email.com",
  phone: "+1-555-0123",
  traditional_data: {
    age: 35,
    gender: "male",
    annual_income: 75000,
    occupation: "sedentary",
    height_cm: 175,
    weight_kg: 78,
    blood_pressure_systolic: 118,
    blood_pressure_diastolic: 78,
    smoking_status: "never",
    alcohol_consumption: "occasional",
    chronic_conditions: 0,
    family_history_conditions: 1,
    previous_claims: 1,
    hospitalizations_last_5_years: 0
  },
  alternative_data: {
    daily_steps_avg: 8500,
    resting_heart_rate: 68,
    sleep_hours_avg: 7.5,
    active_minutes_daily: 45,
    exercise_days_per_week: 4,
    diet_quality_score: 7,
    stress_level: 4,
    work_life_balance: 7,
    regular_checkups: true,
    gym_membership: true,
    meditation_practice: false,
    location_risk_score: 3,
    air_quality_score: 8
  },
  data_consent: true,
  wearable_data_connected: true
};

// Chart Colors
export const CHART_COLORS = {
  primary: '#444CE7',
  secondary: '#22C55E',
  tertiary: '#F59E0B',
  quaternary: '#EF4444',
  grid: '#E5E7EB',
  text: '#6B7280',
};