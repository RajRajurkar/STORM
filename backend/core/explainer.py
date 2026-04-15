from typing import List, Dict, Any
from api.schemas import (
    RiskAssessmentResult,
    FraudIndicator,
    STPResult,
    STPDecision,
    RiskContribution
)


class Explainer:
    """
    Explainable AI Engine
    
    Generates clear, understandable explanations for:
    - Risk scores
    - Underwriting decisions
    - Premium calculations
    - Fraud flags
    """
    
    def explain_risk_score(
        self, 
        risk_result: RiskAssessmentResult
    ) -> Dict[str, Any]:
        """
        Generate comprehensive risk score explanation.
        """
        
        
        positive = [c for c in risk_result.contributions if c.contribution > 0]
        negative = [c for c in risk_result.contributions if c.contribution < 0]
        
        
        visual_breakdown = []
        for contrib in risk_result.contributions[:8]:  # Top 8 factors
            bar_length = int(abs(contrib.contribution) * 100)
            visual_breakdown.append({
                "factor": contrib.display_name,
                "value": str(contrib.value),
                "impact": f"{'+' if contrib.contribution > 0 else ''}{contrib.contribution:.1%}",
                "bar_percentage": min(bar_length * 3, 100),
                "direction": "increase" if contrib.contribution > 0 else "decrease"
            })
        
       
        summary = self._build_summary_text(risk_result, positive, negative)
        
        
        recommendations = self._build_recommendations(positive)
        
        return {
            "score": risk_result.risk_score,
            "category": risk_result.risk_category.value,
            "category_label": risk_result.risk_label,
            "confidence": risk_result.confidence_score,
            "visual_breakdown": visual_breakdown,
            "summary_text": summary,
            "detailed_explanation": risk_result.explanation_text,
            "recommendations": recommendations,
            "top_risk_factors": risk_result.top_risk_factors,
            "protective_factors": risk_result.top_protective_factors
        }
    
    def explain_stp_decision(
        self,
        stp_result: STPResult,
        risk_result: RiskAssessmentResult,
        fraud_result: FraudIndicator
    ) -> Dict[str, Any]:
        """
        Explain why a specific STP decision was made.
        """
        
        decision = stp_result.decision
        
        
        reasoning = []
        
        if decision == STPDecision.AUTO_APPROVE:
            reasoning = [
                f"✓ Risk score ({risk_result.risk_score:.0%}) is below auto-approve threshold",
                f"✓ Confidence level ({risk_result.confidence_score:.0%}) is sufficient",
                f"✓ No fraud indicators detected",
                f"✓ All automated checks passed"
            ]
        
        elif decision == STPDecision.QUICK_REVIEW:
            reasoning = [
                f"• Risk score ({risk_result.risk_score:.0%}) requires verification",
                f"• {stp_result.review_reason}",
                "• Brief underwriter review recommended",
                "• Expected review time: 5-10 minutes"
            ]
        
        elif decision == STPDecision.MANUAL_REVIEW:
            reasoning = [
                f"• {stp_result.review_reason}",
                f"• Risk category: {risk_result.risk_label}",
                "• Full underwriter assessment required",
                "• Expected review time: 30-60 minutes"
            ]
        
        elif decision == STPDecision.FRAUD_HOLD:
            reasoning = [
                f"Fraud indicators detected (score: {fraud_result.fraud_score:.0%})",
                "Application held for investigation"
            ]
            reasoning.extend([f"  • {ind}" for ind in fraud_result.indicators])
        
        elif decision == STPDecision.DECLINE:
            reasoning = [
                f"✗ Risk score ({risk_result.risk_score:.0%}) exceeds maximum threshold",
                "✗ Does not meet underwriting criteria",
                "• Applicant may reapply after 6 months"
            ]
        
        return {
            "decision": decision.value,
            "decision_label": stp_result.decision_label,
            "reasoning": reasoning,
            "processing_time": f"{stp_result.processing_time_ms:.1f}ms",
            "is_instant": stp_result.is_instant,
            "next_steps": self._get_next_steps(decision)
        }
    
    def explain_fraud_analysis(
        self,
        fraud_result: FraudIndicator
    ) -> Dict[str, Any]:
        """
        Explain fraud detection results.
        """
        
        return {
            "fraud_score": fraud_result.fraud_score,
            "risk_level": fraud_result.risk_level,
            "is_flagged": fraud_result.is_flagged,
            "indicators_found": fraud_result.indicators,
            "recommendation": fraud_result.recommendation,
            "explanation": self._build_fraud_explanation(fraud_result)
        }
    
    def _build_summary_text(
        self,
        risk_result: RiskAssessmentResult,
        positive: List[RiskContribution],
        negative: List[RiskContribution]
    ) -> str:
        """Build a concise summary of the risk assessment."""
        
        score_pct = f"{risk_result.risk_score:.0%}"
        
        text = f"Your risk score of {score_pct} places you in the {risk_result.risk_label} category. "
        
        if positive:
            top_risk = positive[0].display_name
            text += f"The main factor increasing your risk is {top_risk}. "
        
        if negative:
            protective = ", ".join([n.display_name for n in negative[:2]])
            text += f"Your {protective} {'is' if len(negative) == 1 else 'are'} helping reduce your overall risk."
        
        return text
    
    def _build_recommendations(
        self,
        positive_factors: List[RiskContribution]
    ) -> List[str]:
        """Build actionable recommendations based on risk factors."""
        
        recommendations = []
        
        factor_recommendations = {
            "BMI": "Consider a structured weight management program to reduce BMI by 2-3 points",
            "Smoking Status": "Smoking cessation could reduce your risk score by up to 15%",
            "Blood Pressure": "Monitor blood pressure regularly and consider lifestyle modifications",
            "Previous Claims": "Maintaining a claim-free record will improve future assessments",
            "Chronic Conditions": "Regular health monitoring and medication adherence recommended",
            "Stress Level": "Stress management techniques could positively impact your health profile",
            "Exercise Frequency": "Increasing physical activity to 4+ days/week can significantly reduce risk"
        }
        
        for factor in positive_factors[:3]:
            if factor.display_name in factor_recommendations:
                recommendations.append(factor_recommendations[factor.display_name])
        
        if not recommendations:
            recommendations.append("Maintain your current healthy lifestyle habits")
        
        return recommendations
    
    def _get_next_steps(self, decision: STPDecision) -> List[str]:
        """Get next steps based on decision."""
        
        steps = {
            STPDecision.AUTO_APPROVE: [
                "Policy documents will be generated automatically",
                "You will receive your policy via email within 24 hours",
                "No further action required"
            ],
            STPDecision.QUICK_REVIEW: [
                "An underwriter will review your application shortly",
                "You may be contacted for additional information",
                "Expected decision within 2-4 hours"
            ],
            STPDecision.MANUAL_REVIEW: [
                "Your application has been assigned to an underwriter",
                "Please ensure all documentation is complete",
                "You will be contacted within 1-2 business days"
            ],
            STPDecision.FRAUD_HOLD: [
                "Your application requires additional verification",
                "Our team will contact you within 24 hours",
                "Please have identification documents ready"
            ],
            STPDecision.DECLINE: [
                "Unfortunately, we cannot offer coverage at this time",
                "You may reapply after 6 months",
                "Consider addressing the risk factors identified"
            ]
        }
        
        return steps.get(decision, ["Please contact support for more information"])
    
    def _build_fraud_explanation(self, fraud_result: FraudIndicator) -> str:
        """Build explanation for fraud analysis."""
        
        if fraud_result.risk_level == "LOW":
            return "No significant anomalies detected in your application. All data appears consistent and within normal ranges."
        
        elif fraud_result.risk_level == "MEDIUM":
            return f"Some data points require verification. Our system detected: {', '.join(fraud_result.indicators[:2])}. This is routine and not necessarily indicative of any issues."
        
        else:  # HIGH
            return f"Multiple indicators require investigation: {', '.join(fraud_result.indicators)}. This does not imply wrongdoing but requires additional verification."


# Singleton instance
explainer = Explainer()