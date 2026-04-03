import React from 'react';
import { motion } from 'framer-motion';

const ContributionBars = ({ contributions }) => {
  const maxContribution = Math.max(...contributions.map(c => Math.abs(c.contribution)));
  
  return (
    <div className="space-y-4">
      {contributions.map((item, index) => {
        const isPositive = item.contribution > 0;
        const width = (Math.abs(item.contribution) / maxContribution) * 100;
        
        return (
          <motion.div
            key={item.factor}
            className="space-y-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex justify-between text-sm">
              <span className="font-medium text-gray-700">{item.display_name}</span>
              <span className={`font-semibold ${
                isPositive ? 'text-red-600' : 'text-green-600'
              }`}>
                {isPositive ? '+' : ''}{(item.contribution * 100).toFixed(1)}%
              </span>
            </div>
            
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${
                  isPositive 
                    ? 'bg-gradient-to-r from-red-400 to-red-600' 
                    : 'bg-gradient-to-r from-green-400 to-green-600'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${width}%` }}
                transition={{ delay: index * 0.1 + 0.2, duration: 0.8 }}
              />
            </div>
            
            <div className="text-xs text-gray-500">
              Value: {item.value}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default ContributionBars;