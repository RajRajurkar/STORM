from typing import Dict
from api.schemas import (
    RiskAssessmentResult,
    PremiumResult,
    RiskCategory
)
from config import settings


class PremiumCalculator:
    def __init__(self):
        self.base_premium = settings.BASE_PREMIUM
        self.max_multiplier = settings.MAX_PREMIUM_MULTIPLIER
        self.min_multiplier = settings.MIN_PREMIUM_MULTIPLIER
    
    def calculate(
        self, 
        risk_result: RiskAssessmentResult,
        has_alternative_data: bool = False,
        wearable_connected: bool = False
    ) -> PremiumResult:

        risk_score = risk_result.risk_score
        
        # === STEP 1: Risk Loading ===
        if risk_score < 0.3:
            risk_loading = -0.1
        elif risk_score < 0.5:
            risk_loading = (risk_score - 0.3) * 1.5
        elif risk_score < 0.7:
            risk_loading = 0.3 + (risk_score - 0.5) * 2
        else:
            risk_loading = 0.7 + (risk_score - 0.7) * 3
        
        # Cap loading
        risk_loading = min(risk_loading, self.max_multiplier - 1)
        
        # === STEP 2: Discount Setup ===
        discount_breakdown = {}

        if has_alternative_data:
            discount_breakdown["Alternative Data Provided"] = 0.05
        
        if wearable_connected:
            discount_breakdown["Wearable Device Connected"] = 0.08
        
        protective_count = len(risk_result.top_protective_factors)
        if protective_count >= 2:
            discount_breakdown["Healthy Lifestyle Factors"] = min(protective_count * 0.02, 0.06)
        
        # === STEP 3: Premium Calculation ===
        loading_multiplier = 1 + risk_loading
        adjusted_base = self.base_premium * loading_multiplier

        running_premium = adjusted_base
        discount_amounts = {}
        total_discount_amount = 0.0

        # ✅ Apply discounts SEQUENTIALLY
        for k, v in discount_breakdown.items():
            discount_value = running_premium * v
            discount_value = round(discount_value, 2)

            discount_amounts[k] = discount_value
            running_premium -= discount_value
            total_discount_amount += discount_value

        adjusted_premium = running_premium

        # Apply bounds
        final_premium = max(
            self.base_premium * self.min_multiplier,
            min(adjusted_premium, self.base_premium * self.max_multiplier)
        )

        # Round to nearest 10
        final_premium = round(final_premium / 10) * 10
        
        # === STEP 4: Breakdown (EXACT MATCH) ===
        premium_breakdown = {
            "Base Premium": round(self.base_premium, 2),
            "Risk Loading": round(self.base_premium * risk_loading, 2)
        }

        premium_breakdown.update({
            f"Discount - {k}": -v
            for k, v in discount_amounts.items()
        })

        # Optional debug info (very useful)
        total_discount_percent = (
            total_discount_amount / adjusted_base if adjusted_base > 0 else 0
        )

        premium_breakdown["Total Discount %"] = round(total_discount_percent * 100, 2)

        # === STEP 5: Payment Options ===
        payment_options = {
            "annual": final_premium,
            "semi_annual": round(final_premium * 0.52, 2),
            "quarterly": round(final_premium * 0.265, 2),
            "monthly": round(final_premium * 0.09, 2)
        }
        
        return PremiumResult(
            base_premium=self.base_premium,
            risk_loading=round(self.base_premium * risk_loading, 2),
            discount=round(total_discount_amount, 2),  # ✅ exact
            final_premium=final_premium,
            premium_breakdown=premium_breakdown,
            payment_options=payment_options
        )


# Singleton
premium_calculator = PremiumCalculator()