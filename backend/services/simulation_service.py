from typing import Dict, List
from core.risk_engine import RiskEngine
import numpy as np

class SimulationService:
    """
    Scenario Simulation Service
    Allows users to see how changes affect their risk
    """
    
    def __init__(self):
        pass
    
    def simulate_scenario(
        self,
        original_profile: Dict,
        modified_profile: Dict
    ) -> Dict:
        """
        Compare risk between original and modified profiles
        """
        
        # Get original risk
        original_result = RiskEngine.predict_risk_score(original_profile)
        
        # Get modified risk
        modified_result = RiskEngine.predict_risk_score(modified_profile)
        
        # Calculate change
        risk_change = modified_result['risk_score'] - original_result['risk_score']
        percent_change = (risk_change / original_result['risk_score']) * 100 if original_result['risk_score'] > 0 else 0
        
        # Generate impact analysis
        impact = self._analyze_changes(original_profile, modified_profile, risk_change)
        
        return {
            "original_risk": original_result['risk_score'],
            "original_category": original_result['risk_category'],
            "original_premium": original_result['premium_estimate'],
            "new_risk": modified_result['risk_score'],
            "new_category": modified_result['risk_category'],
            "new_premium": modified_result['premium_estimate'],
            "risk_change": round(risk_change, 4),
            "risk_change_percent": round(percent_change, 1),
            "premium_change": round(
                modified_result['premium_estimate'] - original_result['premium_estimate'],
                2
            ),
            "direction": "increase" if risk_change > 0 else "decrease" if risk_change < 0 else "no_change",
            "impact_analysis": impact
        }
    
    def _analyze_changes(
        self,
        original: Dict,
        modified: Dict,
        risk_change: float
    ) -> str:
        """Generate natural language analysis of changes"""
        
        changes = []
        
        # Check each field
        if original.get('bmi') != modified.get('bmi'):
            bmi_diff = modified['bmi'] - original['bmi']
            direction = "increasing" if bmi_diff > 0 else "decreasing"
            changes.append(f"BMI {direction} from {original['bmi']:.1f} to {modified['bmi']:.1f}")
        
        if original.get('smoker') != modified.get('smoker'):
            if modified['smoker']:
                changes.append("starting smoking")
            else:
                changes.append("quitting smoking")
        
        if original.get('age') != modified.get('age'):
            age_diff = modified['age'] - original['age']
            changes.append(f"age change of {age_diff} years")
        
        if original.get('children') != modified.get('children'):
            children_diff = modified['children'] - original['children']
            if children_diff > 0:
                changes.append(f"adding {children_diff} dependent(s)")
            else:
                changes.append(f"removing {abs(children_diff)} dependent(s)")
        
        # Build analysis text
        if not changes:
            return "No significant changes detected."
        
        changes_text = ", ".join(changes)
        direction = "increase" if risk_change > 0 else "decrease"
        
        return (
            f"The scenario involving {changes_text} would result in a "
            f"{abs(risk_change * 100):.1f}% {direction} in your risk score."
        )
    
    def batch_simulate(
        self,
        original_profile: Dict,
        scenarios: List[Dict]
    ) -> List[Dict]:
        """
        Run multiple scenario simulations at once
        """
        
        results = []
        
        for scenario in scenarios:
            modified = {**original_profile, **scenario['changes']}
            result = self.simulate_scenario(original_profile, modified)
            result['scenario_name'] = scenario.get('name', 'Unnamed Scenario')
            results.append(result)
        
        # Sort by impact
        results.sort(key=lambda x: x['risk_change'])
        
        return results
    
    def get_improvement_scenarios(self, user_profile: Dict) -> List[Dict]:
        """
        Generate scenarios that would improve risk score
        """
        
        scenarios = []
        
        # Quit smoking scenario
        if user_profile.get('smoker'):
            scenarios.append({
                "name": "Quit Smoking",
                "changes": {"smoker": False},
                "description": "What if you quit smoking?"
            })
        
        # BMI improvement scenarios
        current_bmi = user_profile.get('bmi', 25)
        if current_bmi > 25:
            scenarios.append({
                "name": "Achieve Healthy BMI",
                "changes": {"bmi": 24.9},
                "description": "What if you reach a healthy BMI of 24.9?"
            })
        
        if current_bmi > 30:
            scenarios.append({
                "name": "Reduce BMI by 5",
                "changes": {"bmi": current_bmi - 5},
                "description": f"What if you reduce BMI from {current_bmi:.1f} to {current_bmi - 5:.1f}?"
            })
        
        # Combined improvement
        if user_profile.get('smoker') and current_bmi > 25:
            scenarios.append({
                "name": "Lifestyle Overhaul",
                "changes": {"smoker": False, "bmi": 24.9},
                "description": "What if you quit smoking AND achieve healthy BMI?"
            })
        
        # Simulate all scenarios
        results = self.batch_simulate(user_profile, scenarios)
        
        # Add original scenario data
        for i, result in enumerate(results):
            if i < len(scenarios):
                result['description'] = scenarios[i].get('description', '')
        
        return results


# Singleton instance
simulation_service = SimulationService()