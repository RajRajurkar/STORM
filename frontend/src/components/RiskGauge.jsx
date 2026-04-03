import React from 'react';
import { motion } from 'framer-motion';
import { RISK_COLORS, RISK_LABELS } from '../utils/constants';

const RiskGauge = ({ score, category, size = 'large' }) => {
  const radius = size === 'large' ? 80 : 50;
  const strokeWidth = size === 'large' ? 12 : 8;
  const circumference = 2 * Math.PI * radius;
  const progress = score * circumference;
  
  const color = RISK_COLORS[category] || RISK_COLORS.MODERATE;
  const label = RISK_LABELS[category] || 'Unknown';
  
  const containerSize = size === 'large' ? 200 : 130;
  const fontSize = size === 'large' ? 'text-3xl' : 'text-xl';
  const labelSize = size === 'large' ? 'text-sm' : 'text-xs';
  
  return (
    <div className="flex flex-col items-center">
      <div 
        className="relative" 
        style={{ width: containerSize, height: containerSize }}
      >
        <svg className="w-full h-full transform -rotate-90">
          {/* Background Circle */}
          <circle
            cx={containerSize / 2}
            cy={containerSize / 2}
            r={radius}
            fill="none"
            stroke="#E5E7EB"
            strokeWidth={strokeWidth}
          />
          
          {/* Progress Circle */}
          <motion.circle
            cx={containerSize / 2}
            cy={containerSize / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - progress }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </svg>
        
        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span 
            className={`${fontSize} font-bold`}
            style={{ color }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            {(score * 100).toFixed(0)}%
          </motion.span>
          <span className={`${labelSize} text-gray-500 mt-1`}>Risk Score</span>
        </div>
      </div>
      
      {/* Category Label */}
      <motion.div 
        className="mt-4 px-4 py-2 rounded-full font-medium text-sm"
        style={{ 
          backgroundColor: `${color}20`,
          color: color
        }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        {label}
      </motion.div>
    </div>
  );
};

export default RiskGauge;