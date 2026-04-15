import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  ComposedChart
} from 'recharts';
import { motion } from 'framer-motion';
import { CHART_COLORS } from '../utils/constants';

const FutureRiskChart = ({ predictions, currentRisk, trend }) => {

  const chartData = [
    { months: 0, risk_score: currentRisk, label: 'Now' },
    ...predictions.map(p => ({
      ...p,
      label: `${p.months}mo`
    }))
  ];
  
  const trendColors = {
    INCREASING: '#EF4444',
    STABLE: '#F59E0B',
    DECREASING: '#22C55E'
  };
  
  const trendColor = trendColors[trend] || trendColors.STABLE;
  
  return (
    <motion.div
      className="glass-card p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Risk Trajectory</h3>
          <p className="text-sm text-gray-500">Predicted risk over time</p>
        </div>
        <div 
          className="px-3 py-1 rounded-full text-sm font-medium"
          style={{ 
            backgroundColor: `${trendColor}20`,
            color: trendColor
          }}
        >
          {trend === 'INCREASING' && '↑ Increasing'}
          {trend === 'STABLE' && '→ Stable'}
          {trend === 'DECREASING' && '↓ Decreasing'}
        </div>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData}>
            <defs>
              <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={trendColor} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={trendColor} stopOpacity={0}/>
              </linearGradient>
            </defs>
            
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
            
            <XAxis 
              dataKey="label" 
              tick={{ fontSize: 12, fill: CHART_COLORS.text }}
              axisLine={{ stroke: CHART_COLORS.grid }}
            />
            
            <YAxis 
              domain={[0, 1]}
              tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
              tick={{ fontSize: 12, fill: CHART_COLORS.text }}
              axisLine={{ stroke: CHART_COLORS.grid }}
            />
            
            <Tooltip
              formatter={(value) => [`${(value * 100).toFixed(1)}%`, 'Risk Score']}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            
            {/* High Risk Reference Line */}
            <ReferenceLine 
              y={0.7} 
              stroke="#EF4444" 
              strokeDasharray="5 5"
              label={{ 
                value: 'High Risk', 
                position: 'right',
                fill: '#EF4444',
                fontSize: 12
              }}
            />
            
            <Area
              type="monotone"
              dataKey="risk_score"
              stroke="none"
              fill="url(#riskGradient)"
            />
            
            <Line
              type="monotone"
              dataKey="risk_score"
              stroke={trendColor}
              strokeWidth={3}
              dot={{ fill: trendColor, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: trendColor }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default FutureRiskChart;