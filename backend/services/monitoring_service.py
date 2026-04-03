from typing import Dict, List
from datetime import datetime, timedelta
import random
import numpy as np
from core.risk_engine import RiskEngine

class MonitoringService:
    """
    Continuous Risk Monitoring Service
    Simulates how risk changes over time with events
    """
    
    def __init__(self):
        # Possible events that affect risk
        self.risk_events = [
            {"name": "Annual health checkup", "risk_modifier": -0.02, "probability": 0.3},
            {"name": "Minor claim filed", "risk_modifier": 0.05, "probability": 0.1},
            {"name": "Major claim filed", "risk_modifier": 0.12, "probability": 0.03},
            {"name": "BMI increase detected", "risk_modifier": 0.03, "probability": 0.15},
            {"name": "BMI decrease detected", "risk_modifier": -0.03, "probability": 0.1},
            {"name": "Started exercise program", "risk_modifier": -0.04, "probability": 0.08},
            {"name": "Smoking status changed (quit)", "risk_modifier": -0.15, "probability": 0.02},
            {"name": "New dependent added", "risk_modifier": 0.02, "probability": 0.05},
            {"name": "Stress indicators elevated", "risk_modifier": 0.02, "probability": 0.12},
            {"name": "Preventive care completed", "risk_modifier": -0.02, "probability": 0.2},
        ]
    
    def generate_timeline(
        self,
        user_profile: Dict,
        days: int = 90,
        user_id: str = "user_001"
    ) -> Dict:
        """
        Generate a realistic risk timeline with events
        """
        
        # Get initial risk
        initial_result = RiskEngine.predict_risk_score(user_profile)
        current_risk = initial_result['risk_score']
        
        timeline = []
        alerts = []
        start_date = datetime.now() - timedelta(days=days)
        
        # Initial entry
        timeline.append({
            "date": start_date.strftime("%Y-%m-%d"),
            "day": 0,
            "risk_score": round(current_risk, 4),
            "event": "Policy initiated",
            "change": 0.0,
            "category": initial_result['risk_category']
        })
        
        # Generate events throughout the timeline
        previous_risk = current_risk
        
        for day in range(1, days + 1):
            event_occurred = False
            event_name = None
            risk_change = 0
            
            # Random chance of event occurring each day
            for event in self.risk_events:
                # Adjust probability by day (some events more likely on certain days)
                daily_prob = event['probability'] / 30  # Monthly probability converted to daily
                
                if random.random() < daily_prob:
                    event_occurred = True
                    event_name = event['name']
                    risk_change = event['risk_modifier']
                    
                    # Add some randomness to the modifier
                    risk_change *= (0.8 + random.random() * 0.4)
                    break
            
            if event_occurred:
                # Apply change
                current_risk = np.clip(previous_risk + risk_change, 0.05, 0.95)
                
                # Determine new category
                if current_risk < 0.3:
                    category = "Low Risk"
                elif current_risk < 0.5:
                    category = "Moderate Risk"
                elif current_risk < 0.7:
                    category = "High Risk"
                else:
                    category = "Very High Risk"
                
                timeline.append({
                    "date": (start_date + timedelta(days=day)).strftime("%Y-%m-%d"),
                    "day": day,
                    "risk_score": round(current_risk, 4),
                    "event": event_name,
                    "change": round(risk_change, 4),
                    "category": category
                })
                
                # Generate alerts for significant changes
                if abs(risk_change) > 0.05:
                    alert_type = "⚠️ Warning" if risk_change > 0 else "✅ Positive"
                    alerts.append({
                        "date": (start_date + timedelta(days=day)).strftime("%Y-%m-%d"),
                        "type": alert_type,
                        "message": f"{event_name}: Risk {'increased' if risk_change > 0 else 'decreased'} by {abs(risk_change * 100):.1f}%"
                    })
                
                previous_risk = current_risk
        
        # Determine overall trend
        if len(timeline) >= 2:
            first_risk = timeline[0]['risk_score']
            last_risk = timeline[-1]['risk_score']
            change = last_risk - first_risk
            
            if change > 0.05:
                trend = "increasing"
            elif change < -0.05:
                trend = "decreasing"
            else:
                trend = "stable"
        else:
            trend = "insufficient_data"
        
        return {
            "user_id": user_id,
            "period_start": start_date.strftime("%Y-%m-%d"),
            "period_end": datetime.now().strftime("%Y-%m-%d"),
            "timeline": timeline,
            "alerts": alerts,
            "trend": trend,
            "total_events": len(timeline) - 1,  # Exclude initial entry
            "current_risk": current_risk,
            "initial_risk": timeline[0]['risk_score'],
            "risk_change": round(current_risk - timeline[0]['risk_score'], 4)
        }
    
    def get_risk_statistics(self, timeline_data: Dict) -> Dict:
        """
        Calculate statistics from the timeline
        """
        
        timeline = timeline_data.get('timeline', [])
        
        if not timeline:
            return {}
        
        risk_scores = [entry['risk_score'] for entry in timeline]
        
        return {
            "min_risk": min(risk_scores),
            "max_risk": max(risk_scores),
            "avg_risk": round(np.mean(risk_scores), 4),
            "std_risk": round(np.std(risk_scores), 4),
            "volatility": "high" if np.std(risk_scores) > 0.1 else "low",
            "data_points": len(timeline)
        }
    
    def detect_anomalies(self, timeline_data: Dict) -> List[Dict]:
        """
        Detect unusual risk changes in the timeline
        """
        
        timeline = timeline_data.get('timeline', [])
        anomalies = []
        
        if len(timeline) < 3:
            return anomalies
        
        risk_scores = [entry['risk_score'] for entry in timeline]
        mean_risk = np.mean(risk_scores)
        std_risk = np.std(risk_scores)
        
        for i, entry in enumerate(timeline):
            # Check if this point is > 2 std deviations from mean
            if abs(entry['risk_score'] - mean_risk) > 2 * std_risk:
                anomalies.append({
                    "date": entry['date'],
                    "risk_score": entry['risk_score'],
                    "event": entry['event'],
                    "deviation": round((entry['risk_score'] - mean_risk) / std_risk, 2),
                    "type": "unusual_spike" if entry['risk_score'] > mean_risk else "unusual_drop"
                })
        
        return anomalies


# Singleton instance
monitoring_service = MonitoringService()