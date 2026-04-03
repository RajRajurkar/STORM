import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  SlidersHorizontal,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Save,
  AlertCircle
} from 'lucide-react';
import RiskGauge from '../components/RiskGauge';
import ScenarioSliders from '../components/ScenarioSliders';
import { simulateScenario, calculateRisk } from '../utils/api';
import { DEFAULT_APPLICATION, RISK_COLORS } from '../utils/constants';

const Simulator = () => {
  const [baseApplication] = useState(DEFAULT_APPLICATION);
  const [modifications, setModifications] = useState({
    traditional: {},
    alternative: {}
  });
  const [originalResult, setOriginalResult] = useState(null);
  const [simulatedResult, setSimulatedResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Load original risk on mount
  useEffect(() => {
    loadOriginalRisk();
  }, []);
  
  // Simulate on modification changes (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (Object.keys(modifications.traditional).length > 0 || 
          Object.keys(modifications.alternative).length > 0) {
        runSimulation();
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [modifications]);
  
  const loadOriginalRisk = async () => {
    try {
      const result = await calculateRisk(baseApplication);
      setOriginalResult(result);
      setSimulatedResult(result);
    } catch (err) {
      console.error('Error loading original risk:', err);
      // Set mock data for demo
      const mockResult = {
        risk_score: 0.42,
        risk_category: 'MODERATE',
        risk_label: 'Moderate Risk',
        confidence: 0.87
      };
      setOriginalResult(mockResult);
      setSimulatedResult(mockResult);
    }
  };
  
  const runSimulation = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await simulateScenario(baseApplication, modifications);
      setSimulatedResult({
        risk_score: result.simulated_risk,
        risk_category: getRiskCategory(result.simulated_risk),
        risk_label: getRiskLabel(result.simulated_risk),
        risk_change: result.risk_change,
        premium_change: result.premium_change,
        recommendation: result.recommendation
      });
    } catch (err) {
      console.error('Simulation error:', err);
      // Calculate mock result for demo
      const mockChange = calculateMockChange(modifications);
      const newRisk = Math.max(0, Math.min(1, (originalResult?.risk_score || 0.42) + mockChange));
      setSimulatedResult({
        risk_score: newRisk,
        risk_category: getRiskCategory(newRisk),
        risk_label: getRiskLabel(newRisk),
        risk_change: mockChange,
        premium_change: mockChange * 1000,
        recommendation: mockChange > 0 
          ? 'This change increases your risk profile.' 
          : 'This change improves your risk profile!'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const calculateMockChange = (mods) => {
    let change = 0;
    
    if (mods.traditional?.smoking_status === 'current') change += 0.15;
    if (mods.traditional?.smoking_status === 'former') change += 0.05;
    if (mods.traditional?.previous_claims) change += mods.traditional.previous_claims * 0.03;
    if (mods.traditional?.chronic_conditions) change += mods.traditional.chronic_conditions * 0.04;
    if (mods.traditional?.bmi) {
      const bmiDiff = mods.traditional.bmi - 25;
      if (bmiDiff > 0) change += bmiDiff * 0.01;
    }
    
    if (mods.alternative?.exercise_days_per_week !== undefined) {
      change -= (mods.alternative.exercise_days_per_week - 3) * 0.02;
    }
    if (mods.alternative?.stress_level) {
      change += (mods.alternative.stress_level - 5) * 0.01;
    }
    
    return change;
  };
  
  const getRiskCategory = (score) => {
    if (score < 0.3) return 'LOW';
    if (score < 0.5) return 'MODERATE';
    if (score < 0.7) return 'MODERATE_HIGH';
    return 'HIGH';
  };
  
  const getRiskLabel = (score) => {
    if (score < 0.3) return 'Low Risk';
    if (score < 0.5) return 'Moderate Risk';
    if (score < 0.7) return 'Moderate-High Risk';
    return 'High Risk';
  };
  
  const resetSimulation = () => {
    setModifications({ traditional: {}, alternative: {} });
    setSimulatedResult(originalResult);
  };
  
  const riskChange = simulatedResult && originalResult 
    ? simulatedResult.risk_score - originalResult.risk_score 
    : 0;
  
  const riskChangePercent = originalResult?.risk_score 
    ? (riskChange / originalResult.risk_score) * 100 
    : 0;
  
  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900">Risk Scenario Simulator</h1>
        <p className="text-gray-500 mt-2">
          Adjust factors and see how they impact risk in real-time
        </p>
      </motion.div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sliders Panel */}
        <motion.div
          className="lg:col-span-1 glass-card p-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5" />
              Adjust Factors
            </h2>
            <button
              onClick={resetSimulation}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 
                rounded-lg transition-colors"
              title="Reset to baseline"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
          
          <ScenarioSliders
            values={{
              traditional: {
                ...baseApplication.traditional_data,
                ...modifications.traditional
              },
              alternative: {
                ...baseApplication.alternative_data,
                ...modifications.alternative
              }
            }}
            onChange={(newValues) => {
              setModifications({
                traditional: Object.fromEntries(
                  Object.entries(newValues.traditional || {}).filter(
                    ([key, value]) => value !== baseApplication.traditional_data[key]
                  )
                ),
                alternative: Object.fromEntries(
                  Object.entries(newValues.alternative || {}).filter(
                    ([key, value]) => value !== baseApplication.alternative_data[key]
                  )
                )
              });
            }}
          />
        </motion.div>
        
        {/* Results Panel */}
        <motion.div
          className="lg:col-span-2 space-y-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Risk Comparison */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-6">Risk Impact</h2>
            
            <div className="grid grid-cols-3 gap-6 items-center">
              {/* Original Risk */}
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-2">Baseline</p>
                {originalResult && (
                  <RiskGauge 
                    score={originalResult.risk_score}
                    category={originalResult.risk_category}
                    size="small"
                  />
                )}
              </div>
              
              {/* Change Indicator */}
              <div className="flex flex-col items-center justify-center">
                {loading ? (
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                ) : (
                  <>
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-2
                      ${riskChange > 0 ? 'bg-red-100' : riskChange < 0 ? 'bg-green-100' : 'bg-gray-100'}`}>
                      {riskChange > 0 ? (
                        <TrendingUp className="w-8 h-8 text-red-500" />
                      ) : riskChange < 0 ? (
                        <TrendingDown className="w-8 h-8 text-green-500" />
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </div>
                    <span className={`text-2xl font-bold
                      ${riskChange > 0 ? 'text-red-500' : riskChange < 0 ? 'text-green-500' : 'text-gray-400'}`}>
                      {riskChange > 0 ? '+' : ''}{(riskChange * 100).toFixed(1)}%
                    </span>
                    <span className="text-sm text-gray-500">
                      {riskChangePercent > 0 ? '+' : ''}{riskChangePercent.toFixed(0)}% change
                    </span>
                  </>
                )}
              </div>
              
              {/* Simulated Risk */}
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-2">Simulated</p>
                {simulatedResult && (
                  <RiskGauge 
                    score={simulatedResult.risk_score}
                    category={simulatedResult.risk_category}
                    size="small"
                  />
                )}
              </div>
            </div>
          </div>
          
          {/* Impact Details */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Detailed Impact</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-gray-50">
                <p className="text-sm text-gray-500">Premium Impact</p>
                <p className={`text-xl font-bold
                  ${(simulatedResult?.premium_change || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {(simulatedResult?.premium_change || 0) > 0 ? '+' : ''}
                  ${Math.abs(simulatedResult?.premium_change || 0).toFixed(0)}/year
                </p>
              </div>
              
              <div className="p-4 rounded-xl bg-gray-50">
                <p className="text-sm text-gray-500">Risk Category</p>
                <p className="text-xl font-bold" style={{ 
                  color: RISK_COLORS[simulatedResult?.risk_category] || '#6B7280' 
                }}>
                  {simulatedResult?.risk_label || 'Unknown'}
                </p>
              </div>
            </div>
            
            {/* Recommendation */}
            {simulatedResult?.recommendation && (
              <div className={`p-4 rounded-xl border ${
                riskChange > 0 
                  ? 'bg-red-50 border-red-200' 
                  : riskChange < 0 
                    ? 'bg-green-50 border-green-200'
                    : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-start gap-3">
                  <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5
                    ${riskChange > 0 ? 'text-red-500' : riskChange < 0 ? 'text-green-500' : 'text-gray-500'}`} />
                  <p className={`text-sm ${
                    riskChange > 0 ? 'text-red-700' : riskChange < 0 ? 'text-green-700' : 'text-gray-700'
                  }`}>
                    {simulatedResult.recommendation}
                  </p>
                </div>
              </div>
            )}
          </div>
          
          {/* Modified Factors Summary */}
          {(Object.keys(modifications.traditional).length > 0 || 
            Object.keys(modifications.alternative).length > 0) && (
            <div className="glass-card p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Modified Factors</h2>
              <div className="flex flex-wrap gap-2">
                {Object.entries(modifications.traditional).map(([key, value]) => (
                  <span key={key} className="px-3 py-1 bg-primary-50 text-primary-700 
                    rounded-full text-sm font-medium">
                    {key.replace(/_/g, ' ')}: {String(value)}
                  </span>
                ))}
                {Object.entries(modifications.alternative).map(([key, value]) => (
                  <span key={key} className="px-3 py-1 bg-purple-50 text-purple-700 
                    rounded-full text-sm font-medium">
                    {key.replace(/_/g, ' ')}: {String(value)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Simulator;