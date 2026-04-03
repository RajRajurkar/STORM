import time
from typing import Tuple
from datetime import datetime

from api.schemas import (
    ApplicationInput,
    RiskAssessmentResult,
    FraudIndicator,
    STPResult,
    STPDecision,
    RiskCategory
)
from config import settings, STP_DECISIONS


class STPProcessor:
    
    def __init__(self):
        self.auto_approve_risk = settings.STP_AUTO_APPROVE_RISK
        self.auto_approve_confidence = settings.STP_AUTO_APPROVE_CONFIDENCE
        self.review_confidence = settings.STP_REVIEW_CONFIDENCE
    
    def process(
        self,
        application: ApplicationInput,
        risk_result: RiskAssessmentResult,
        fraud_result: FraudIndicator
    ) -> STPResult:
        
        start_time = time.time()
        
        decision, review_reason = self._determine_decision(
            risk_result, 
            fraud_result
        )
        
        processing_time = (time.time() - start_time) * 1000  # Convert to ms
        
        # Get decision metadata
        decision_info = STP_DECISIONS.get(decision.value, STP_DECISIONS["MANUAL_REVIEW"])
        
        # Determine if instant processing
        is_instant = decision in [STPDecision.AUTO_APPROVE, STPDecision.DECLINE]
        
        # Determine review priority
        review_priority = None
        if decision in [STPDecision.QUICK_REVIEW, STPDecision.MANUAL_REVIEW]:
            review_priority = self._get_review_priority(risk_result, fraud_result)
        
        return STPResult(
            decision=decision,
            decision_label=decision_info["label"],
            decision_description=decision_info["description"],
            processing_time_ms=round(processing_time, 2),
            is_instant=is_instant,
            requires_review=decision not in [STPDecision.AUTO_APPROVE, STPDecision.DECLINE],
            review_priority=review_priority,
            review_reason=review_reason
        )
    
    def _determine_decision(
        self,
        risk_result: RiskAssessmentResult,
        fraud_result: FraudIndicator
    ) -> Tuple[STPDecision, str]:
        """Core decision logic."""
        
        risk_score = risk_result.risk_score
        confidence = risk_result.confidence_score
        risk_category = risk_result.risk_category
        
        # === RULE 1: Fraud Check ===
        if fraud_result.is_flagged:
            return STPDecision.FRAUD_HOLD, "Flagged for potential fraud indicators"
        
        if fraud_result.fraud_score > settings.FRAUD_REVIEW_THRESHOLD:
            return STPDecision.MANUAL_REVIEW, f"Elevated fraud risk ({fraud_result.fraud_score:.0%})"
        
        # === RULE 2: Auto-Decline Very High Risk ===
        if risk_score > 0.85 and confidence > 0.8:
            return STPDecision.DECLINE, "Risk exceeds acceptable threshold"
        
        # === RULE 3: Auto-Approve Low Risk ===
        if (risk_score < self.auto_approve_risk and 
            confidence >= self.auto_approve_confidence and
            fraud_result.risk_level == "LOW"):
            return STPDecision.AUTO_APPROVE, "Low risk with high confidence"
        
        # === RULE 4: Quick Review for Moderate Risk ===
        if (risk_category in [RiskCategory.MODERATE, RiskCategory.MODERATE_HIGH] and
            confidence >= self.review_confidence):
            return STPDecision.QUICK_REVIEW, f"Moderate risk ({risk_score:.0%}) requires verification"
        
        # === RULE 5: Low Confidence = Manual Review ===
        if confidence < self.review_confidence:
            return STPDecision.MANUAL_REVIEW, f"Insufficient confidence ({confidence:.0%}) for automated decision"
        
        # === RULE 6: High Risk = Manual Review ===
        if risk_category == RiskCategory.HIGH:
            return STPDecision.MANUAL_REVIEW, "High risk requires senior underwriter review"
        
        # === Default: Quick Review ===
        return STPDecision.QUICK_REVIEW, "Standard review required"
    
    def _get_review_priority(
        self,
        risk_result: RiskAssessmentResult,
        fraud_result: FraudIndicator
    ) -> str:
        """Determine review priority for queuing."""
        
        # High priority if fraud concerns
        if fraud_result.fraud_score > 0.4:
            return "HIGH"
        
        # High priority if very risky but might be approvable
        if 0.6 <= risk_result.risk_score <= 0.75:
            return "HIGH"
        
        # Medium priority for moderate cases
        if risk_result.risk_category == RiskCategory.MODERATE_HIGH:
            return "MEDIUM"
        
        # Low priority for confidence issues only
        if risk_result.confidence_score < 0.7:
            return "LOW"
        
        return "MEDIUM"
    
    def get_stp_statistics(self, decisions: list) -> dict:
        """Calculate STP statistics from a list of decisions."""
        
        total = len(decisions)
        if total == 0:
            return {
                "stp_rate": 0,
                "auto_approved": 0,
                "quick_review": 0,
                "manual_review": 0,
                "declined": 0,
                "fraud_hold": 0
            }
        
        auto_approved = sum(1 for d in decisions if d == STPDecision.AUTO_APPROVE)
        
        return {
            "stp_rate": round(auto_approved / total * 100, 1),
            "auto_approved": auto_approved,
            "quick_review": sum(1 for d in decisions if d == STPDecision.QUICK_REVIEW),
            "manual_review": sum(1 for d in decisions if d == STPDecision.MANUAL_REVIEW),
            "declined": sum(1 for d in decisions if d == STPDecision.DECLINE),
            "fraud_hold": sum(1 for d in decisions if d == STPDecision.FRAUD_HOLD)
        }


# Singleton instance
stp_processor = STPProcessor()