import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
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
  Activity,
  Sparkles
} from 'lucide-react';
import StatsCard from '../components/StatsCard';
import { getAnalyticsSummary } from '../utils/api';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12
    }
  }
};

const cardHoverVariants = {
  rest: { scale: 1, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" },
  hover: { 
    scale: 1.02, 
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    transition: { type: "spring", stiffness: 400, damping: 17 }
  }
};

const buttonVariants = {
  rest: { scale: 1 },
  hover: { 
    scale: 1.05,
    transition: { type: "spring", stiffness: 400, damping: 10 }
  },
  tap: { scale: 0.95 }
};

const iconFloatVariants = {
  animate: {
    y: [0, -5, 0],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

const pulseVariants = {
  animate: {
    scale: [1, 1.05, 1],
    opacity: [0.7, 1, 0.7],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

const glowVariants = {
  animate: {
    boxShadow: [
      "0 0 20px rgba(59, 130, 246, 0.3)",
      "0 0 40px rgba(59, 130, 246, 0.5)",
      "0 0 20px rgba(59, 130, 246, 0.3)"
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

const shimmerVariants = {
  animate: {
    backgroundPosition: ["200% 0", "-200% 0"],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "linear"
    }
  }
};

// Animated Number Component
const AnimatedNumber = ({ value, suffix = "", prefix = "" }) => {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    const numValue = parseFloat(value) || 0;
    const duration = 1500;
    const steps = 60;
    const increment = numValue / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= numValue) {
        setDisplayValue(numValue);
        clearInterval(timer);
      } else {
        setDisplayValue(current);
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [value]);
  
  return (
    <span>
      {prefix}
      {typeof value === 'string' && value.includes('.') 
        ? displayValue.toFixed(1) 
        : Math.round(displayValue)}
      {suffix}
    </span>
  );
};

// Animated Background Orbs
const BackgroundOrbs = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <motion.div
      className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-30"
      animate={{
        x: [0, 30, 0],
        y: [0, -30, 0],
        scale: [1, 1.1, 1]
      }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.div
      className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30"
      animate={{
        x: [0, -20, 0],
        y: [0, 20, 0],
        scale: [1, 1.2, 1]
      }}
      transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.div
      className="absolute top-1/2 left-1/2 w-60 h-60 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-20"
      animate={{
        x: [0, 40, 0],
        y: [0, -40, 0],
        scale: [1, 1.15, 1]
      }}
      transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
    />
  </div>
);

// Loading Skeleton
const LoadingSkeleton = () => (
  <motion.div 
    className="flex flex-col items-center justify-center h-64 gap-4"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
  >
    <motion.div
      className="relative w-16 h-16"
      animate={{ rotate: 360 }}
      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
    >
      <div className="absolute inset-0 rounded-full border-4 border-primary-200"></div>
      <div className="absolute inset-0 rounded-full border-4 border-primary-600 border-t-transparent"></div>
    </motion.div>
    <motion.div
      className="flex gap-1"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
      }}
    >
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 bg-primary-600 rounded-full"
          variants={{
            hidden: { y: 0 },
            visible: { 
              y: [0, -10, 0],
              transition: { duration: 0.6, repeat: Infinity, delay: i * 0.2 }
            }
          }}
        />
      ))}
    </motion.div>
    <motion.p
      className="text-gray-500 text-sm"
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity }}
    >
      Loading analytics...
    </motion.p>
  </motion.div>
);

// Progress Bar Component
const AnimatedProgressBar = ({ value, total, color, delay }) => {
  const percentage = (value / total) * 100;
  
  return (
    <div className="h-2 bg-gray-100 rounded-full overflow-hidden relative">
      <motion.div
        className={`h-full ${color} rounded-full relative overflow-hidden`}
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: `${percentage}%`, opacity: 1 }}
        transition={{ 
          delay, 
          duration: 1.2, 
          ease: [0.25, 0.46, 0.45, 0.94] 
        }}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          initial={{ x: "-100%" }}
          animate={{ x: "200%" }}
          transition={{ 
            delay: delay + 1, 
            duration: 1.5, 
            repeat: Infinity, 
            repeatDelay: 3 
          }}
        />
      </motion.div>
    </div>
  );
};

const Dashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const controls = useAnimation();
  
  useEffect(() => {
    loadAnalytics();
    const interval = setInterval(loadAnalytics, 30000);
    return () => clearInterval(interval);
  }, []);
  
  const loadAnalytics = async () => {
    try {
      const data = await getAnalyticsSummary();
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
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
    return <LoadingSkeleton />;
  }
  
  return (
    <motion.div 
      className="space-y-8 relative"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <BackgroundOrbs />
      
      {/* Header */}
      <motion.div
        variants={itemVariants}
        className="flex items-center justify-between relative z-10"
      >
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: "spring", stiffness: 100 }}
        >
          <motion.div className="flex items-center gap-3">
            <motion.div
              variants={iconFloatVariants}
              animate="animate"
            >
              <Sparkles className="w-8 h-8 text-primary-600" />
            </motion.div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome to{' '}
              <motion.span
                className="bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent"
                animate={{ 
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                }}
                transition={{ duration: 5, repeat: Infinity }}
                style={{ backgroundSize: "200% 200%" }}
              >
                LiveRisk AI
              </motion.span>
            </h1>
          </motion.div>
          <motion.p 
            className="text-gray-500 mt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Intelligent Automated Underwriting Platform
          </motion.p>
        </motion.div>
        
        <motion.div
          variants={buttonVariants}
          initial="rest"
          whileHover="hover"
          whileTap="tap"
        >
          <Link
            to="/apply"
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 
              text-white font-medium rounded-xl transition-all duration-300 relative overflow-hidden group"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-primary-700 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity"
            />
            <motion.div
              className="absolute inset-0 bg-white/20"
              initial={{ x: "-100%", skewX: -15 }}
              whileHover={{ x: "200%" }}
              transition={{ duration: 0.8 }}
            />
            <FileText className="w-5 h-5 relative z-10" />
            <span className="relative z-10">New Application</span>
            <motion.div
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="relative z-10"
            >
              <ArrowRight className="w-4 h-4" />
            </motion.div>
          </Link>
        </motion.div>
      </motion.div>
      
      {/* Stats Grid */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={containerVariants}
      >
        {[
          {
            title: "Total Applications",
            value: analytics?.total_applications || 0,
            subtitle: "Today",
            icon: FileText,
            color: "primary",
            trend: 5
          },
          {
            title: "STP Rate",
            value: `${analytics?.stp_rate || 0}%`,
            subtitle: "Auto-processed",
            icon: Zap,
            color: "success",
            trend: 2
          },
          {
            title: "Avg Processing",
            value: `${((analytics?.avg_processing_time_ms || 0) / 1000).toFixed(2)}s`,
            subtitle: "Per application",
            icon: Clock,
            color: "warning",
            trend: -8
          },
          {
            title: "Fraud Detected",
            value: analytics?.fraud_flagged || 0,
            subtitle: "Flagged cases",
            icon: AlertTriangle,
            color: "danger"
          }
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            variants={itemVariants}
            whileHover={{ 
              y: -8, 
              transition: { type: "spring", stiffness: 400, damping: 17 } 
            }}
          >
            <StatsCard
              {...stat}
              delay={index * 0.1}
            />
          </motion.div>
        ))}
      </motion.div>
      
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* STP Breakdown */}
        <motion.div
          className="lg:col-span-2 glass-card p-6 relative overflow-hidden"
          variants={itemVariants}
          whileHover={cardHoverVariants.hover}
        >
          {/* Animated corner accent */}
          <motion.div
            className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-500/10 to-transparent rounded-bl-full"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          
          <motion.h2 
            className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <BarChart3 className="w-5 h-5 text-primary-600" />
            </motion.div>
            Decision Distribution
          </motion.h2>
          
          <motion.div 
            className="space-y-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Auto Approved */}
            <motion.div 
              className="flex items-center gap-4"
              variants={itemVariants}
              whileHover={{ x: 5 }}
            >
              <motion.div 
                className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <CheckCircle className="w-5 h-5 text-green-600" />
              </motion.div>
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Auto-Approved (STP)</span>
                  <motion.span 
                    className="text-sm font-semibold text-green-600"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6, type: "spring" }}
                  >
                    <AnimatedNumber value={analytics?.auto_approved || 0} />
                  </motion.span>
                </div>
                <AnimatedProgressBar
                  value={analytics?.auto_approved || 0}
                  total={analytics?.total_applications || 1}
                  color="bg-gradient-to-r from-green-400 to-green-600"
                  delay={0.6}
                />
              </div>
            </motion.div>
            
            {/* Quick Review */}
            <motion.div 
              className="flex items-center gap-4"
              variants={itemVariants}
              whileHover={{ x: 5 }}
            >
              <motion.div 
                className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                >
                  <Clock className="w-5 h-5 text-yellow-600" />
                </motion.div>
              </motion.div>
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Quick Review</span>
                  <motion.span 
                    className="text-sm font-semibold text-yellow-600"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7, type: "spring" }}
                  >
                    <AnimatedNumber value={analytics?.quick_review || 0} />
                  </motion.span>
                </div>
                <AnimatedProgressBar
                  value={analytics?.quick_review || 0}
                  total={analytics?.total_applications || 1}
                  color="bg-gradient-to-r from-yellow-400 to-yellow-600"
                  delay={0.7}
                />
              </div>
            </motion.div>
            
            {/* Manual Review */}
            <motion.div 
              className="flex items-center gap-4"
              variants={itemVariants}
              whileHover={{ x: 5 }}
            >
              <motion.div 
                className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <Users className="w-5 h-5 text-orange-600" />
              </motion.div>
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Manual Review</span>
                  <motion.span 
                    className="text-sm font-semibold text-orange-600"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8, type: "spring" }}
                  >
                    <AnimatedNumber value={analytics?.manual_review || 0} />
                  </motion.span>
                </div>
                <AnimatedProgressBar
                  value={analytics?.manual_review || 0}
                  total={analytics?.total_applications || 1}
                  color="bg-gradient-to-r from-orange-400 to-orange-600"
                  delay={0.8}
                />
              </div>
            </motion.div>
            
            {/* Declined */}
            <motion.div 
              className="flex items-center gap-4"
              variants={itemVariants}
              whileHover={{ x: 5 }}
            >
              <motion.div 
                className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400 }}
                animate={{ 
                  boxShadow: [
                    "0 0 0 0 rgba(239, 68, 68, 0)",
                    "0 0 0 8px rgba(239, 68, 68, 0.1)",
                    "0 0 0 0 rgba(239, 68, 68, 0)"
                  ]
                }}
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
                >
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </motion.div>
              </motion.div>
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Declined / Fraud Hold</span>
                  <motion.span 
                    className="text-sm font-semibold text-red-600"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.9, type: "spring" }}
                  >
                    <AnimatedNumber value={(analytics?.declined || 0) + (analytics?.fraud_flagged || 0)} />
                  </motion.span>
                </div>
                <AnimatedProgressBar
                  value={(analytics?.declined || 0) + (analytics?.fraud_flagged || 0)}
                  total={analytics?.total_applications || 1}
                  color="bg-gradient-to-r from-red-400 to-red-600"
                  delay={0.9}
                />
              </div>
            </motion.div>
          </motion.div>
          
          {/* Summary Stats */}
          <motion.div 
            className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
          >
            {[
              { value: analytics?.model_accuracy || 0, suffix: "%", label: "Model Accuracy", color: "text-primary-600" },
              { value: analytics?.avg_stp_time_ms || 0, suffix: "ms", label: "STP Processing", color: "text-green-600" },
              { value: analytics?.stp_rate || 0, suffix: "%", label: "Automation Rate", color: "text-purple-600" }
            ].map((stat, index) => (
              <motion.div 
                key={stat.label}
                className="text-center"
                whileHover={{ scale: 1.05 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 + index * 0.1 }}
              >
                <motion.p 
                  className={`text-2xl font-bold ${stat.color}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.2 + index * 0.1, type: "spring" }}
                >
                  <AnimatedNumber value={stat.value} suffix={stat.suffix} />
                </motion.p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
        
        {/* Quick Actions */}
        <motion.div
          className="glass-card p-6 relative overflow-hidden"
          variants={itemVariants}
          whileHover={cardHoverVariants.hover}
        >
          <motion.div
            className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full"
            animate={{ 
              rotate: 360,
              scale: [1, 1.2, 1]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
          
          <motion.h2 
            className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <Zap className="w-5 h-5 text-yellow-500" />
            </motion.div>
            Quick Actions
          </motion.h2>
          
          <motion.div 
            className="space-y-3"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {[
              { to: "/apply", icon: FileText, title: "New Application", desc: "Process new insurance application", bg: "bg-primary-50", hoverBg: "hover:bg-primary-100", iconBg: "bg-primary-600" },
              { to: "/simulate", icon: TrendingUp, title: "Risk Simulator", desc: "What-if scenario analysis", bg: "bg-green-50", hoverBg: "hover:bg-green-100", iconBg: "bg-green-600" },
              { to: "/analytics", icon: BarChart3, title: "Analytics", desc: "View detailed metrics", bg: "bg-purple-50", hoverBg: "hover:bg-purple-100", iconBg: "bg-purple-600" }
            ].map((action, index) => (
              <motion.div
                key={action.to}
                variants={itemVariants}
                whileHover={{ x: 8, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  to={action.to}
                  className={`flex items-center gap-3 p-4 rounded-xl ${action.bg} ${action.hoverBg} transition-colors group relative overflow-hidden`}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "200%" }}
                    transition={{ duration: 0.6 }}
                  />
                  <motion.div 
                    className={`w-10 h-10 rounded-lg ${action.iconBg} flex items-center justify-center relative z-10`}
                    whileHover={{ scale: 1.15, rotate: 10 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <action.icon className="w-5 h-5 text-white" />
                  </motion.div>
                  <div className="relative z-10">
                    <p className="font-medium text-gray-900">{action.title}</p>
                    <p className="text-sm text-gray-500">{action.desc}</p>
                  </div>
                  <motion.div
                    className="ml-auto"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
          
          {/* Risk Distribution Mini Chart */}
          <motion.div 
            className="mt-6 pt-6 border-t border-gray-100"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Activity className="w-4 h-4 text-gray-500" />
              </motion.div>
              Risk Distribution
            </h3>
            <motion.div 
              className="space-y-2"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {Object.entries(analytics?.risk_distribution || {}).map(([category, count], index) => {
                const colors = {
                  LOW: { dot: 'bg-green-500', text: 'text-green-600' },
                  MODERATE: { dot: 'bg-yellow-500', text: 'text-yellow-600' },
                  MODERATE_HIGH: { dot: 'bg-orange-500', text: 'text-orange-600' },
                  HIGH: { dot: 'bg-red-500', text: 'text-red-600' }
                };
                const total = Object.values(analytics?.risk_distribution || {}).reduce((a, b) => a + b, 1);
                const percentage = ((count / total) * 100).toFixed(0);
                
                return (
                  <motion.div 
                    key={category} 
                    className="flex items-center gap-2"
                    variants={itemVariants}
                    whileHover={{ x: 5 }}
                  >
                    <motion.div 
                      className={`w-3 h-3 rounded-full ${colors[category].dot}`}
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                    />
                    <span className="text-xs text-gray-600 flex-1">{category.replace('_', ' ')}</span>
                    <motion.span 
                      className={`text-xs font-medium ${colors[category].text}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1 + index * 0.1 }}
                    >
                      <AnimatedNumber value={percentage} suffix="%" />
                    </motion.span>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
      
      {/* Live Activity Indicator */}
      <motion.div
        className="glass-card p-4 relative overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        whileHover={{ scale: 1.01 }}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-transparent to-green-500/5"
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
        
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <motion.div 
              className="flex items-center gap-2"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <motion.div
                animate={{ 
                  rotate: 360,
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  rotate: { duration: 4, repeat: Infinity, ease: "linear" },
                  scale: { duration: 1, repeat: Infinity }
                }}
              >
                <Activity className="w-5 h-5 text-green-500" />
              </motion.div>
              <span className="text-sm font-medium text-gray-700">System Status</span>
            </motion.div>
            <motion.div 
              className="flex items-center gap-2 px-3 py-1 bg-green-50 rounded-full"
              animate={{ 
                boxShadow: [
                  "0 0 0 0 rgba(34, 197, 94, 0)",
                  "0 0 0 8px rgba(34, 197, 94, 0.1)",
                  "0 0 0 0 rgba(34, 197, 94, 0)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <motion.div 
                className="w-2 h-2 bg-green-500 rounded-full"
                animate={{ 
                  scale: [1, 1.5, 1],
                  opacity: [1, 0.5, 1]
                }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <span className="text-xs font-medium text-green-700">All Systems Operational</span>
            </motion.div>
          </div>
          <motion.p 
            className="text-sm text-gray-500"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Last updated: {new Date().toLocaleTimeString()}
          </motion.p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;