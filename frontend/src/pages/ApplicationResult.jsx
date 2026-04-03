import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
  ArrowLeft,
  Download,
  TrendingUp,
  Shield,
  DollarSign,
  FileText,
  Zap
} from 'lucide-react';
import RiskGauge from '../components/RiskGauge';
import STPStatus from '../components/STPStatus';
import ContributionBars from '../components/ContributionBars';
import FutureRiskChart from '../components/FutureRiskChart';
import { RISK_COLORS, STP_COLORS } from '../utils/constants';

const ApplicationResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { result, application } = location.state || {};
  
  // Redirect if no result data
  if (!result) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">No application result found.</p>
        <Link to="/apply" className="text-primary-600 hover:underline">
          Submit a new application
        </Link>
      </div>
    );
  }
  
  const { 
    risk_assessment, 
    stp_result, 
    fraud_check, 
    premium, 
    future_risk,
    final_decision,
    application_id,
    applicant_name
  } = result;
  
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Application Result</h1>
          <p className="text-gray-500 mt-1">
            Application ID: {application_id} | {applicant_name}
          </p>
        </div>
        
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 
          rounded-xl hover:bg-gray-50 transition-colors">
          <Download className="w-4 h-4" />
          Download Report
        </button>
      </motion.div>
      
      {/* STP Status Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <STPStatus 
          decision={stp_result.decision}
          processingTime={stp_result.processing_time_ms}
          isInstant={stp_result.is_instant}
        />
      </motion.div>
      
      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Risk Score */}
        <motion.div
          className="glass-card p-6 flex flex-col items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Risk Assessment</h2>
          <RiskGauge 
            score={risk_assessment.risk_score} 
            category={risk_assessment.risk_category}
            size="large"
          />
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">Confidence Level</p>
            <p className="text-2xl font-bold text-primary-600">
              {(risk_assessment.confidence_score * 100).toFixed(0)}%
            </p>
          </div>
        </motion.div>
        
        {/* Decision & Premium */}
        <motion.div
          className="lg:col-span-2 glass-card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-lg font-semibold text-gray-800 mb-6">Underwriting Decision</h2>
          
          <div className="grid grid-cols-2 gap-6">
            {/* Decision */}
            <div className="p-4 rounded-xl bg-gray-50">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center
                  ${final_decision === 'APPROVED' ? 'bg-green-100' : 
                    final_decision === 'DECLINED' ? 'bg-red-100' : 'bg-yellow-100'}`}>
                  {final_decision === 'APPROVED' ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : final_decision === 'DECLINED' ? (
                    <XCircle className="w-5 h-5 text-red-600" />
                  ) : (
                    <Clock className="w-5 h-5 text-yellow-600" />
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-500">Decision</p>
                  <p className={`text-lg font-bold ${
                    final_decision === 'APPROVED' ? 'text-green-600' : 
                    final_decision === 'DECLINED' ? 'text-red-600' : 'text-yellow-600'
                  }`}>
                    {final_decision.replace(/_/g, ' ')}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Processing Time */}
            <div className="p-4 rounded-xl bg-gray-50">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Processing Time</p>
                  <p className="text-lg font-bold text-purple-600">
                    {stp_result.processing_time_ms.toFixed(1)}ms
                  </p>
                </div>
              </div>
            </div>
            
            {/* Premium */}
            {premium && (
              <>
                <div className="p-4 rounded-xl bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Annual Premium</p>
                      <p className="text-lg font-bold text-blue-600">
                        ${premium.final_premium.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 rounded-xl bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Monthly Payment</p>
                      <p className="text-lg font-bold text-green-600">
                        ${premium.payment_options?.monthly?.toLocaleString() || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
          
          {/* Premium Breakdown */}
          {premium && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <h3 className="text-sm font-medium text-gray-700 mb-4">Premium Breakdown</h3>
              <div className="space-y-2">
                {Object.entries(premium.premium_breakdown || {}).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="text-gray-500">{key}</span>
                    <span className={`font-medium ${value < 0 ? 'text-green-600' : 'text-gray-900'}`}>
                      {value < 0 ? '-' : ''}${Math.abs(value).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
      
      {/* Risk Factors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Contributing Factors */}
        <motion.div
          className="glass-card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-lg font-semibold text-gray-800 mb-6">Risk Factor Analysis</h2>
          <ContributionBars contributions={risk_assessment.contributions.slice(0, 8)} />
        </motion.div>
        
        {/* Explanation */}
        <motion.div
          className="glass-card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-lg font-semibold text-gray-800 mb-4">AI Explanation</h2>
          
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
              <p className="text-sm text-blue-800 leading-relaxed">
                {risk_assessment.explanation_text}
              </p>
            </div>
            
            {/* Top Factors */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Top Risk Factors</h3>
              <div className="flex flex-wrap gap-2">
                {risk_assessment.top_risk_factors.map((factor, i) => (
                  <span key={i} className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm">
                    {factor}
                  </span>
                ))}
              </div>
            </div>
            
            {/* Protective Factors */}
            {risk_assessment.top_protective_factors.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Protective Factors</h3>
                <div className="flex flex-wrap gap-2">
                  {risk_assessment.top_protective_factors.map((factor, i) => (
                    <span key={i} className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">
                      {factor}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
      
      {/* Future Risk Prediction */}
      {future_risk && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <FutureRiskChart 
            predictions={future_risk.predictions}
            currentRisk={risk_assessment.risk_score}
            trend={future_risk.trend}
          />
          
          {/* Warning & Recommendation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {future_risk.warning_message && (
              <div className="p-4 rounded-xl bg-yellow-50 border border-yellow-200">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-yellow-800">{future_risk.warning_message}</p>
                </div>
              </div>
            )}
            
            <div className="p-4 rounded-xl bg-green-50 border border-green-200">
              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-800">{future_risk.recommendation}</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Fraud Check */}
      {fraud_check && (
        <motion.div
          className="glass-card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Fraud Analysis</h2>
          
          <div className="flex items-center gap-6">
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center
              ${fraud_check.risk_level === 'LOW' ? 'bg-green-100' : 
                fraud_check.risk_level === 'MEDIUM' ? 'bg-yellow-100' : 'bg-red-100'}`}>
              <Shield className={`w-10 h-10 
                ${fraud_check.risk_level === 'LOW' ? 'text-green-600' : 
                  fraud_check.risk_level === 'MEDIUM' ? 'text-yellow-600' : 'text-red-600'}`} />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium
                  ${fraud_check.risk_level === 'LOW' ? 'bg-green-100 text-green-700' : 
                    fraud_check.risk_level === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' : 
                    'bg-red-100 text-red-700'}`}>
                  {fraud_check.risk_level} Risk
                </span>
                <span className="text-sm text-gray-500">
                  Score: {(fraud_check.fraud_score * 100).toFixed(0)}%
                </span>
              </div>
              
              <p className="text-gray-600 text-sm">{fraud_check.recommendation}</p>
              
              <div className="flex flex-wrap gap-2 mt-3">
                {fraud_check.indicators.map((indicator, i) => (
                  <span key={i} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                    {indicator}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Actions */}
      <motion.div
        className="flex justify-center gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <Link
          to="/apply"
          className="flex items-center gap-2 px-6 py-3 border border-gray-200 
            rounded-xl hover:bg-gray-50 transition-colors"
        >
          <FileText className="w-5 h-5" />
          New Application
        </Link>
        
        <Link
          to="/simulate"
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 
            text-white font-medium rounded-xl hover:shadow-lg transition-all"
        >
          <TrendingUp className="w-5 h-5" />
          Try Simulator
        </Link>
      </motion.div>
    </div>
  );
};

export default ApplicationResult;