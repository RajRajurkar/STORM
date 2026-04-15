import React from 'react';
import { motion } from 'framer-motion';

const ScenarioSliders = ({ values, onChange }) => {
  const sliders = [
    {
      key: 'bmi',
      label: 'BMI',
      min: 15,
      max: 45,
      step: 0.1,
      category: 'traditional',
      format: (v) => v.toFixed(1),
      type: 'range'
    },
    {
      key: 'smoking_status',
      label: 'Smoking Status',
      options: ['never', 'former', 'current'],
      category: 'traditional',
      type: 'select'
    },
    {
      key: 'exercise_days_per_week',
      label: 'Exercise (days/week)',
      min: 0,
      max: 7,
      step: 1,
      category: 'alternative',
      format: (v) => `${v} days`,
      type: 'range'
    },
    {
      key: 'stress_level',
      label: 'Stress Level',
      min: 1,
      max: 10,
      step: 1,
      category: 'alternative',
      format: (v) => `${v}/10`,
      type: 'range'
    },
    {
      key: 'previous_claims',
      label: 'Previous Claims',
      min: 0,
      max: 10,
      step: 1,
      category: 'traditional',
      format: (v) => v,
      type: 'range'
    },
    {
      key: 'chronic_conditions',
      label: 'Chronic Conditions',
      min: 0,
      max: 5,
      step: 1,
      category: 'traditional',
      format: (v) => v,
      type: 'range'
    }
  ];
  
  const handleChange = (key, value, category) => {
    onChange({
      ...values,
      [category]: {
        ...values[category],
        [key]: value
      }
    });
  };
  
  const getValue = (key, category) => {
    return values[category]?.[key];
  };

  const getHealthStatus = (key, value) => {
    if (key === 'bmi') {
      if (value < 18.5) return { text: 'Underweight', color: 'text-yellow-600' };
      if (value < 25) return { text: 'Healthy', color: 'text-green-600' };
      if (value < 30) return { text: 'Overweight', color: 'text-orange-600' };
      if (value < 35) return { text: 'Obese', color: 'text-red-600' };
      return { text: 'Severely Obese', color: 'text-red-700' };
    }
    return null;
  };
  
  return (
    <div className="space-y-6">
      {sliders.map((slider, index) => {
        const currentValue = getValue(slider.key, slider.category);
        const healthStatus = getHealthStatus(slider.key, currentValue);
        
        return (
          <motion.div
            key={slider.key}
            className="space-y-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-gray-700">
                {slider.label}
              </label>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-primary-600">
                  {slider.type === 'select' 
                    ? currentValue
                    : slider.format(currentValue || slider.min)
                  }
                </span>
                {/* ✅ ADD: Health status indicator for BMI */}
                {healthStatus && (
                  <span className={`text-xs font-medium ${healthStatus.color}`}>
                    ({healthStatus.text})
                  </span>
                )}
              </div>
            </div>
            
            {slider.type === 'select' ? (
              <select
                value={currentValue || slider.options[0]}
                onChange={(e) => handleChange(slider.key, e.target.value, slider.category)}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 
                  focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {slider.options.map(opt => (
                  <option key={opt} value={opt}>
                    {opt.charAt(0).toUpperCase() + opt.slice(1)}
                  </option>
                ))}
              </select>
            ) : (
              <>
                <input
                  type="range"
                  min={slider.min}
                  max={slider.max}
                  step={slider.step}
                  value={currentValue || slider.min}
                  onChange={(e) => handleChange(
                    slider.key, 
                    parseFloat(e.target.value), 
                    slider.category
                  )}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer
                    accent-primary-600"
                />
                
                <div className="flex justify-between text-xs text-gray-400">
                  <span>{slider.min}</span>
                  {slider.key === 'bmi' && (
                    <span className="text-green-600 font-medium">
                      Healthy: 18.5-25
                    </span>
                  )}
                  <span>{slider.max}</span>
                </div>
              </>
            )}
          </motion.div>
        );
      })}
    </div>
  );
};

export default ScenarioSliders;