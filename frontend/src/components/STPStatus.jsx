import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, User, XCircle, AlertTriangle } from 'lucide-react';
import { STP_COLORS, STP_LABELS } from '../utils/constants';

const STPStatus = ({ decision, processingTime, isInstant }) => {
  const icons = {
    AUTO_APPROVE: CheckCircle,
    QUICK_REVIEW: Clock,
    MANUAL_REVIEW: User,
    DECLINE: XCircle,
    FRAUD_HOLD: AlertTriangle,
  };
  
  const Icon = icons[decision] || Clock;
  const color = STP_COLORS[decision] || STP_COLORS.QUICK_REVIEW;
  const label = STP_LABELS[decision] || 'Processing';
  
  return (
    <motion.div
      className="p-6 rounded-2xl border-2"
      style={{ 
        backgroundColor: `${color}10`,
        borderColor: `${color}40`
      }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center gap-4">
        <motion.div
          className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{ backgroundColor: color }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
        >
          <Icon className="w-8 h-8 text-white" />
        </motion.div>
        
        <div>
          <h3 className="text-xl font-bold" style={{ color }}>
            {label}
          </h3>
          <p className="text-gray-600 mt-1">
            {isInstant ? 'Processed instantly via STP' : 'Requires review'}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Processing time: {processingTime.toFixed(1)}ms
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default STPStatus;