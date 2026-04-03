import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  Users,
  Zap,
  ArrowRight,
  BarChart3,
  Activity
} from 'lucide-react';
import StatsCard from '../components/StatsCard';
import { getAnalyticsSummary } from '../utils/api';

const Dashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadAnalytics();
    // Refresh every 30 seconds for live feel
    const interval = setInterval(loadAnalytics, 30000);
    return () => clearInterval(interval);
  }, []);
  
  const loadAnalytics = async () => {
    try {
      const data = await getAnalyticsSummary();
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
      // Set mock data for demo
      setAnalytics({
        total_applications: 147,
        stp_rate: 68.5,
        auto_approved: 101,
        quick_review: 28,
        manual_review: 12,
        declined: 4,
        fraud_flagged: 2,
        avg_processing_time_ms: 187,
        avg_stp_time_ms: 52,
        model_accuracy: 94.7,
        risk_distribution: {
          LOW: 52,
          MODERATE: 38,
          MODERATE_HIGH: 18,
          HIGH: 8
        }
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
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome to LiveRisk AI
          </h1>
          <p className="text-gray-500 mt-1">
            Intelligent Automated Underwriting Platform
          </p>
        </div>
        
        <Link
          to="/apply"
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 
            text-white font-medium rounded-xl hover:shadow-lg transition-all duration-300
            hover:-translate-y-0.5"
        >
          <FileText className="w-5 h-5" />
          New Application
          <ArrowRight className="w-4 h-4" />
        </Link>
      </motion.div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Applications"
          value={analytics?.total_applications || 0}
          subtitle="Today"
          icon={FileText}
          color="primary"
          trend={5}
          delay={0}
        />
        <StatsCard
          title="STP Rate"
          value={`${analytics?.stp_rate || 0}%`}
          subtitle="Auto-processed"
          icon={Zap}
          color="success"
          trend={2}
          delay={0.1}
        />
        <StatsCard
          title="Avg Processing"
          value={`${((analytics?.avg_processing_time_ms || 0) / 1000).toFixed(2)}s`}
          subtitle="Per application"
          icon={Clock}
          color="warning"
          trend={-8}
          delay={0.2}
        />
        <StatsCard
          title="Fraud Detected"
          value={analytics?.fraud_flagged || 0}
          subtitle="Flagged cases"
          icon={AlertTriangle}
          color="danger"
          delay={0.3}
        />
      </div>
      
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* STP Breakdown */}
        <motion.div
          className="lg:col-span-2 glass-card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-lg font-semibold text-gray-800 mb-6">
            Decision Distribution
          </h2>
          
          <div className="space-y-4">
            {/* Auto Approved */}
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Auto-Approved (STP)</span>
                  <span className="text-sm font-semibold text-green-600">
                    {analytics?.auto_approved || 0}
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-green-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ 
                      width: `${((analytics?.auto_approved || 0) / (analytics?.total_applications || 1)) * 100}%` 
                    }}
                    transition={{ delay: 0.6, duration: 1 }}
                  />
                </div>
              </div>
            </div>
            
            {/* Quick Review */}
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Quick Review</span>
                  <span className="text-sm font-semibold text-yellow-600">
                    {analytics?.quick_review || 0}
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-yellow-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ 
                      width: `${((analytics?.quick_review || 0) / (analytics?.total_applications || 1)) * 100}%` 
                    }}
                    transition={{ delay: 0.7, duration: 1 }}
                  />
                </div>
              </div>
            </div>
            
            {/* Manual Review */}
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-orange-600" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Manual Review</span>
                  <span className="text-sm font-semibold text-orange-600">
                    {analytics?.manual_review || 0}
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-orange-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ 
                      width: `${((analytics?.manual_review || 0) / (analytics?.total_applications || 1)) * 100}%` 
                    }}
                    transition={{ delay: 0.8, duration: 1 }}
                  />
                </div>
              </div>
            </div>
            
            {/* Declined */}
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Declined / Fraud Hold</span>
                  <span className="text-sm font-semibold text-red-600">
                    {(analytics?.declined || 0) + (analytics?.fraud_flagged || 0)}
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-red-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ 
                      width: `${(((analytics?.declined || 0) + (analytics?.fraud_flagged || 0)) / (analytics?.total_applications || 1)) * 100}%` 
                    }}
                    transition={{ delay: 0.9, duration: 1 }}
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-gray-100">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary-600">
                {analytics?.model_accuracy || 0}%
              </p>
              <p className="text-sm text-gray-500">Model Accuracy</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {analytics?.avg_stp_time_ms || 0}ms
              </p>
              <p className="text-sm text-gray-500">STP Processing</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {analytics?.stp_rate || 0}%
              </p>
              <p className="text-sm text-gray-500">Automation Rate</p>
            </div>
          </div>
        </motion.div>
        
        {/* Quick Actions */}
        <motion.div
          className="glass-card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-lg font-semibold text-gray-800 mb-6">
            Quick Actions
          </h2>
          
          <div className="space-y-3">
            <Link
              to="/apply"
              className="flex items-center gap-3 p-4 rounded-xl bg-primary-50 
                hover:bg-primary-100 transition-colors group"
            >
              <div className="w-10 h-10 rounded-lg bg-primary-600 flex items-center justify-center
                group-hover:scale-110 transition-transform">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900">New Application</p>
                <p className="text-sm text-gray-500">Process new insurance application</p>
              </div>
            </Link>
            
            <Link
              to="/simulate"
              className="flex items-center gap-3 p-4 rounded-xl bg-green-50 
                hover:bg-green-100 transition-colors group"
            >
              <div className="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center
                group-hover:scale-110 transition-transform">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Risk Simulator</p>
                <p className="text-sm text-gray-500">What-if scenario analysis</p>
              </div>
            </Link>
            
            <Link
              to="/analytics"
              className="flex items-center gap-3 p-4 rounded-xl bg-purple-50 
                hover:bg-purple-100 transition-colors group"
            >
              <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center
                group-hover:scale-110 transition-transform">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Analytics</p>
                <p className="text-sm text-gray-500">View detailed metrics</p>
              </div>
            </Link>
          </div>
          
          {/* Risk Distribution Mini Chart */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <h3 className="text-sm font-medium text-gray-700 mb-4">Risk Distribution</h3>
            <div className="space-y-2">
              {Object.entries(analytics?.risk_distribution || {}).map(([category, count]) => {
                const colors = {
                  LOW: 'bg-green-500',
                  MODERATE: 'bg-yellow-500',
                  MODERATE_HIGH: 'bg-orange-500',
                  HIGH: 'bg-red-500'
                };
                const total = Object.values(analytics?.risk_distribution || {}).reduce((a, b) => a + b, 1);
                
                return (
                  <div key={category} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${colors[category]}`}></div>
                    <span className="text-xs text-gray-600 flex-1">{category.replace('_', ' ')}</span>
                    <span className="text-xs font-medium text-gray-900">
                      {((count / total) * 100).toFixed(0)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Live Activity Indicator */}
      <motion.div
        className="glass-card p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium text-gray-700">System Status</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-green-50 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-green-700">All Systems Operational</span>
            </div>
          </div>
          <p className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleTimeString()}
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;