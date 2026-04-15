import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  Zap,
  Target
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import StatsCard from '../components/StatsCard';
import { getAnalyticsSummary } from '../utils/api';
import { RISK_COLORS } from '../utils/constants';

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadAnalytics();
  }, []);
  
  const loadAnalytics = async () => {
    try {
      const data = await getAnalyticsSummary();
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
      // Mock data for demo
      setAnalytics({
        total_applications: 147,
        stp_rate: 68.7,
        auto_approved: 101,
        quick_review: 28,
        manual_review: 12,
        declined: 4,
        fraud_flagged: 2,
        avg_processing_time_ms: 187.5,
        avg_stp_time_ms: 52.3,
        avg_review_time_minutes: 12.5,
        risk_distribution: {
          LOW: 52,
          MODERATE: 38,
          MODERATE_HIGH: 18,
          HIGH: 8
        },
        model_accuracy: 94.7,
        fraud_detection_rate: 91.2
      });
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  const decisionData = [
    { name: 'Auto-Approved', value: analytics.auto_approved, color: '#22C55E' },
    { name: 'Quick Review', value: analytics.quick_review, color: '#F59E0B' },
    { name: 'Manual Review', value: analytics.manual_review, color: '#F97316' },
    { name: 'Declined', value: analytics.declined, color: '#EF4444' },
    { name: 'Fraud Hold', value: analytics.fraud_flagged, color: '#DC2626' }
  ];
  
  const riskDistData = Object.entries(analytics.risk_distribution || {}).map(([key, value]) => ({
    name: key.replace('_', ' '),
    value,
    color: RISK_COLORS[key]
  }));
  
  const timelineData = [
    { time: '9 AM', applications: 12, stp: 9 },
    { time: '10 AM', applications: 18, stp: 13 },
    { time: '11 AM', applications: 25, stp: 18 },
    { time: '12 PM', applications: 15, stp: 10 },
    { time: '1 PM', applications: 20, stp: 14 },
    { time: '2 PM', applications: 28, stp: 20 },
    { time: '3 PM', applications: 22, stp: 15 },
    { time: '4 PM', applications: 7, stp: 5 }
  ];
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Real-time underwriting performance metrics
        </p>
      </motion.div>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="STP Rate"
          value={`${analytics.stp_rate}%`}
          subtitle="Straight-Through Processing"
          icon={Zap}
          color="success"
          trend={2.3}
          delay={0}
        />
        <StatsCard
          title="Model Accuracy"
          value={`${analytics.model_accuracy}%`}
          subtitle="Risk prediction accuracy"
          icon={Target}
          color="primary"
          trend={0.5}
          delay={0.1}
        />
        <StatsCard
          title="Avg STP Time"
          value={`${analytics.avg_stp_time_ms}ms`}
          subtitle="Auto-approval processing"
          icon={Clock}
          color="warning"
          trend={-5.2}
          delay={0.2}
        />
        <StatsCard
          title="Fraud Detection"
          value={`${analytics.fraud_detection_rate}%`}
          subtitle="Detection accuracy"
          icon={AlertTriangle}
          color="danger"
          delay={0.3}
        />
      </div>
      
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          className="glass-card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-lg font-semibold text-gray-800 mb-6">Decision Distribution</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={decisionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {decisionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name) => [value, name]}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      
        <motion.div
          className="glass-card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-lg font-semibold text-gray-800 mb-6">Risk Distribution</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskDistData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {riskDistData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
      
      <motion.div
        className="glass-card p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <h2 className="text-lg font-semibold text-gray-800 mb-6">Today's Application Timeline</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Bar dataKey="applications" name="Total Applications" fill="#6366F1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="stp" name="STP Processed" fill="#22C55E" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
      
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <div className="glass-card p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-4">Processing Efficiency</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Auto-Approved</span>
                <span className="text-sm font-medium text-green-600">
                  {((analytics.auto_approved / analytics.total_applications) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 rounded-full"
                  style={{ width: `${(analytics.auto_approved / analytics.total_applications) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Quick Review</span>
                <span className="text-sm font-medium text-yellow-600">
                  {((analytics.quick_review / analytics.total_applications) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-yellow-500 rounded-full"
                  style={{ width: `${(analytics.quick_review / analytics.total_applications) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Manual Review</span>
                <span className="text-sm font-medium text-orange-600">
                  {((analytics.manual_review / analytics.total_applications) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-orange-500 rounded-full"
                  style={{ width: `${(analytics.manual_review / analytics.total_applications) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Time Metrics */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-4">Processing Times</h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">STP Processing</p>
                  <p className="text-lg font-bold text-gray-900">{analytics.avg_stp_time_ms}ms</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Avg Review Time</p>
                  <p className="text-lg font-bold text-gray-900">{analytics.avg_review_time_minutes} min</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Processed</p>
                  <p className="text-lg font-bold text-gray-900">{analytics.total_applications}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-4">Model Performance</h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">Risk Accuracy</span>
                <span className="text-sm font-bold text-primary-600">{analytics.model_accuracy}%</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary-500 rounded-full"
                  style={{ width: `${analytics.model_accuracy}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">Fraud Detection</span>
                <span className="text-sm font-bold text-red-600">{analytics.fraud_detection_rate}%</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-red-500 rounded-full"
                  style={{ width: `${analytics.fraud_detection_rate}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">STP Success Rate</span>
                <span className="text-sm font-bold text-green-600">{analytics.stp_rate}%</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 rounded-full"
                  style={{ width: `${analytics.stp_rate}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Analytics;