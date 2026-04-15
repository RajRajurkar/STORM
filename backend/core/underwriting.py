import uuid
import time
from datetime import datetime
from typing import Optional

from api.schemas import (
    ApplicationInput,
    UnderwritingDecision,
    RiskAssessmentResult,
    FraudIndicator,
    STPResult,
    PremiumResult,
    FutureRiskPrediction,
    STPDecision
)
from core.risk_engine import risk_engine
from core.stp_processor import stp_processor
from core.fraud_detector import fraud_detector
from core.premium_calculator import premium_calculator
from core.predictor import future_predictor
from config import settings


class UnderwritingEngine:
    """
    Main Underwriting Orchestrator
    
    Coordinates all components to produce a complete underwriting decision:
    1. Risk Assessment
    2. Fraud Detection
    3. STP Routing
    4. Premium Calculation
    5. Future Risk Prediction
    """
    
    def __init__(self):
        self.model_version = "1.0.0"
    
    def process_application(
        self, 
        application: ApplicationInput
    ) -> UnderwritingDecision:
        """
        Process a complete insurance application.
        
        Returns a comprehensive underwriting decision.
        """
        start_time = time.time()
        

        app_id = f"APP-{uuid.uuid4().hex[:8].upper()}"
        

        risk_result = risk_engine.calculate_risk(application)
        

        fraud_result = fraud_detector.analyze(application)
        

        stp_result = stp_processor.process(application, risk_result, fraud_result)
        

        premium = None
        if stp_result.decision not in [STPDecision.DECLINE, STPDecision.FRAUD_HOLD]:
            premium = premium_calculator.calculate(
                risk_result,
                has_alternative_data=application.alternative_data is not None,
                wearable_connected=application.wearable_data_connected
            )
        
        future_risk = future_predictor.predict(application, risk_result)
        

        final_decision = self._determine_final_decision(stp_result, risk_result, fraud_result)
        

        policy_terms = None
        if final_decision in ["APPROVED", "APPROVED_WITH_CONDITIONS"]:
            policy_terms = self._generate_policy_terms(risk_result, premium)
        
        processing_time = (time.time() - start_time) * 1000
        
        return UnderwritingDecision(
            application_id=app_id,
            applicant_name=application.applicant_name,
            risk_assessment=risk_result,
            fraud_check=fraud_result,
            stp_result=stp_result,
            premium=premium,
            future_risk=future_risk,
            final_decision=final_decision,
            policy_terms=policy_terms,
            processed_at=datetime.now(),
            model_version=self.model_version
        )
    
    def _determine_final_decision(
        self,
        stp_result: STPResult,
        risk_result: RiskAssessmentResult,
        fraud_result: FraudIndicator
    ) -> str:
        """Determine the final underwriting decision."""
        
        if stp_result.decision == STPDecision.FRAUD_HOLD:
            return "FRAUD_INVESTIGATION"
        
        if stp_result.decision == STPDecision.DECLINE:
            return "DECLINED"
        
        if stp_result.decision == STPDecision.AUTO_APPROVE:
            return "APPROVED"
        
        if risk_result.risk_score < 0.5:
            return "APPROVED_WITH_CONDITIONS"
        elif risk_result.risk_score < 0.7:
            return "PENDING_REVIEW"
        else:
            return "PENDING_SENIOR_REVIEW"
    
    def _generate_policy_terms(
        self,
        risk_result: RiskAssessmentResult,
        premium: Optional[PremiumResult]
    ) -> dict:
        """Generate policy terms based on risk assessment."""
        
        base_terms = {
            "coverage_type": "Standard Health Insurance",
            "coverage_amount": "$500,000",
            "deductible": "$1,000",
            "waiting_period_days": 30
        }
        
        if risk_result.risk_score > 0.5:
            base_terms["waiting_period_days"] = 60
            base_terms["exclusions"] = ["Pre-existing conditions for 12 months"]
        
        if risk_result.risk_score > 0.6:
            base_terms["deductible"] = "$2,500"
            base_terms["coverage_amount"] = "$250,000"
        
        if premium:
            base_terms["annual_premium"] = premium.final_premium
            base_terms["payment_options"] = premium.payment_options
        
        return base_terms

underwriting_engine = UnderwritingEngine()