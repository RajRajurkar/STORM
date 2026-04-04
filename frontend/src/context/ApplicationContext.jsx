import React, { createContext, useContext, useState, useEffect } from 'react';

const ApplicationContext = createContext();

export const useApplication = () => {
  const context = useContext(ApplicationContext);
  if (!context) {
    throw new Error('useApplication must be used within ApplicationProvider');
  }
  return context;
};

export const ApplicationProvider = ({ children }) => {
  const [applicationResult, setApplicationResult] = useState(null);
  const [applicationData, setApplicationData] = useState(null);

  // Load from localStorage on mount
  useEffect(() => {
    const savedResult = localStorage.getItem('liverisk_application_result');
    const savedData = localStorage.getItem('liverisk_application_data');
    
    if (savedResult) {
      try {
        setApplicationResult(JSON.parse(savedResult));
      } catch (e) {
        console.error('Failed to parse saved result:', e);
      }
    }
    
    if (savedData) {
      try {
        setApplicationData(JSON.parse(savedData));
      } catch (e) {
        console.error('Failed to parse saved data:', e);
      }
    }
  }, []);

  // Save to localStorage whenever data changes
  const saveApplicationResult = (result, data) => {
    setApplicationResult(result);
    setApplicationData(data);
    
    localStorage.setItem('liverisk_application_result', JSON.stringify(result));
    localStorage.setItem('liverisk_application_data', JSON.stringify(data));
  };

  const clearApplicationData = () => {
    setApplicationResult(null);
    setApplicationData(null);
    localStorage.removeItem('liverisk_application_result');
    localStorage.removeItem('liverisk_application_data');
  };

  // Extract user profile for Chat
  const getUserProfile = () => {
    if (!applicationResult || !applicationData) return null;

    const { traditional_data, alternative_data } = applicationData;
    const { risk_assessment } = applicationResult;

    // Calculate BMI
    const bmi = traditional_data.weight_kg / 
                ((traditional_data.height_cm / 100) ** 2);

    return {
      // Personal Info
      name: applicationData.applicant_name,
      age: traditional_data.age,
      gender: traditional_data.gender,
      
      // Health Metrics
      bmi: bmi.toFixed(1),
      blood_pressure: `${traditional_data.blood_pressure_systolic}/${traditional_data.blood_pressure_diastolic}`,
      smoker: traditional_data.smoking_status !== 'never',
      smoking_status: traditional_data.smoking_status,
      
      // Risk Info
      risk_score: risk_assessment.risk_score,
      risk_category: risk_assessment.risk_category,
      risk_label: risk_assessment.risk_label,
      
      // Lifestyle
      exercise_days: alternative_data?.exercise_days_per_week || 0,
      stress_level: alternative_data?.stress_level || 5,
      diet_quality: alternative_data?.diet_quality_score || 5,
      
      // Claims
      previous_claims: traditional_data.previous_claims,
      chronic_conditions: traditional_data.chronic_conditions,
      
      // Full data for detailed queries
      full_data: applicationData,
      full_result: applicationResult
    };
  };

  // Get risk context for Chat
  const getRiskContext = () => {
    if (!applicationResult) return null;

    const { risk_assessment, premium, stp_result } = applicationResult;

    return {
      risk_score: risk_assessment.risk_score,
      risk_category: risk_assessment.risk_category,
      risk_label: risk_assessment.risk_label,
      confidence: risk_assessment.confidence_score,
      premium_estimate: premium?.final_premium || 0,
      decision: stp_result.decision,
      top_risk_factors: risk_assessment.top_risk_factors,
      top_protective_factors: risk_assessment.top_protective_factors
    };
  };

  const value = {
    applicationResult,
    applicationData,
    saveApplicationResult,
    clearApplicationData,
    getUserProfile,
    getRiskContext,
    hasApplication: !!applicationResult
  };

  return (
    <ApplicationContext.Provider value={value}>
      {children}
    </ApplicationContext.Provider>
  );
};