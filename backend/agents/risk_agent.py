import httpx
import json
from typing import Dict, List, Optional
import os
from dotenv import load_dotenv
import logging

load_dotenv()
logger = logging.getLogger(__name__)


class RiskAgent:
    """
    AI Agent powered by Grok API
    Provides intelligent conversation and risk analysis
    """
    
    def __init__(self):
        self.api_key = os.getenv("GROK_API_KEY", "")
        self.base_url = os.getenv("GROK_API_URL", "https://api.x.ai/v1")
        self.model = os.getenv("GROK_MODEL", "grok-beta")
        
        # System prompt for the risk agent
        self.system_prompt = """You are LiveRisk AI, an intelligent health insurance risk assessment assistant. 

Your capabilities:
1. Explain risk scores in simple, clear language
2. Analyze how different factors affect insurance risk
3. Provide actionable recommendations to reduce risk
4. Answer questions about health insurance and underwriting
5. Simulate "what-if" scenarios

When given user data, you should:
- Acknowledge their current risk level
- Explain the main contributing factors
- Suggest improvements if risk is high
- Be empathetic and supportive

Always be:
- Clear and concise
- Data-driven but human-friendly
- Helpful and actionable
- Professional yet approachable

Format responses with:
- Use bullet points for lists
- Bold important numbers using **text**
- Include relevant emojis sparingly
- Keep responses under 200 words unless asked for detail"""

    async def chat(
        self,
        message: str,
        user_profile: Optional[Dict] = None,
        risk_context: Optional[Dict] = None,
        conversation_history: Optional[List[Dict]] = None
    ) -> Dict:
        """
        Chat with the risk agent
        """
        
        # Build context
        context_parts = []
        
        if user_profile:
            context_parts.append(f"""
Current User Profile:
- Age: {user_profile.get('age')}
- Sex: {user_profile.get('sex')}
- BMI: {user_profile.get('bmi')}
- Smoker: {'Yes' if user_profile.get('smoker') else 'No'}
- Children: {user_profile.get('children')}
- Region: {user_profile.get('region')}
""")
        
        if risk_context:
            context_parts.append(f"""
Current Risk Assessment:
- Risk Score: {risk_context.get('risk_score', 'N/A')}
- Risk Category: {risk_context.get('risk_category', 'N/A')}
- Estimated Premium: ${risk_context.get('premium_estimate', 'N/A')}
- Confidence: {risk_context.get('confidence', 'N/A')}
""")
        
        context = "\n".join(context_parts) if context_parts else ""
        
        # Build messages
        messages = [
            {"role": "system", "content": self.system_prompt}
        ]
        
        # Add conversation history
        if conversation_history:
            for hist in conversation_history[-5:]:  # Last 5 messages
                messages.append(hist)
        
        # Add context and current message
        user_content = f"{context}\n\nUser Question: {message}" if context else message
        messages.append({"role": "user", "content": user_content})
        
        # Try API call if key is available
        if self.api_key:
            try:
                async with httpx.AsyncClient() as client:
                    response = await client.post(
                        f"{self.base_url}/chat/completions",
                        headers={
                            "Authorization": f"Bearer {self.api_key}",
                            "Content-Type": "application/json"
                        },
                        json={
                            "model": self.model,
                            "messages": messages,
                            "temperature": 0.7,
                            "max_tokens": 500
                        },
                        timeout=30.0
                    )
                    
                    if response.status_code == 200:
                        result = response.json()
                        agent_response = result['choices'][0]['message']['content']
                        
                        return {
                            "response": agent_response,
                            "suggestions": self._extract_suggestions(agent_response),
                            "success": True
                        }
                    else:
                        logger.warning(f"Grok API error: {response.status_code}")
                        
            except Exception as e:
                logger.warning(f"Grok API exception: {e}")
        
        # Fallback to rule-based response
        return {
            "response": self._fallback_response(message, user_profile, risk_context),
            "suggestions": self._get_default_suggestions(user_profile, risk_context),
            "success": False
        }
    
    def _fallback_response(
        self,
        message: str,
        user_profile: Optional[Dict],
        risk_context: Optional[Dict]
    ) -> str:
        """
        Generate a rule-based fallback response when API is unavailable
        """
        
        message_lower = message.lower()
        
        if not risk_context:
            return (" Hello! I'm LiveRisk AI, your intelligent insurance risk assistant. "
                   "I'd be happy to help! Please first complete a risk assessment so I can "
                   "provide personalized insights about your health profile.")
        
        risk_score = risk_context.get('risk_score', 0.5)
        category = risk_context.get('risk_category', 'Unknown')
        premium = risk_context.get('premium_estimate', 0)
        
        # Handle common questions
        if any(word in message_lower for word in ['why', 'reason', 'explain', 'factor']):
            factors = []
            if user_profile:
                if user_profile.get('smoker'):
                    factors.append(" **Smoking status** - This is the most significant factor, typically adding 30-50% to risk")
                if user_profile.get('bmi', 0) > 30:
                    factors.append(f" **Elevated BMI** ({user_profile['bmi']:.1f}) - BMI above 30 is classified as obese")
                elif user_profile.get('bmi', 0) > 25:
                    factors.append(f" **Elevated BMI** ({user_profile['bmi']:.1f}) - BMI above 25 is classified as overweight")
                if user_profile.get('age', 0) > 50:
                    factors.append(f" **Age** ({user_profile['age']} years) - Risk naturally increases with age")
                if user_profile.get('children', 0) > 2:
                    factors.append(f" **Dependents** ({user_profile['children']}) - More dependents can affect coverage needs")
            
            if factors:
                return (f"Your risk score is **{risk_score:.2f}** ({category}). "
                       f"Here are the key factors:\n\n" + "\n".join(factors) +
                       "\n\n Would you like suggestions on how to improve your risk score?")
            else:
                return (f"Your risk score is **{risk_score:.2f}** ({category}). "
                       "The main factors include age, BMI, smoking status, and region. "
                       "Would you like me to explain any specific factor?")
        
        if any(word in message_lower for word in ['improve', 'reduce', 'lower', 'better', 'decrease']):
            suggestions = ["Here's how you can improve your risk score:\n"]
            
            if user_profile:
                if user_profile.get('smoker'):
                    suggestions.append(" **Quit smoking** - This is the single most impactful change. "
                                      "Could reduce your risk by 30-40% and save potentially $200-400/month on premiums.")
                
                bmi = user_profile.get('bmi', 25)
                if bmi > 30:
                    target_bmi = 25
                    suggestions.append(f" **Reduce BMI** - Going from {bmi:.1f} to {target_bmi} could reduce risk by 15-25%. "
                                      "This typically requires lifestyle changes in diet and exercise.")
                elif bmi > 25:
                    suggestions.append(f" **Achieve healthy BMI** - Reducing BMI from {bmi:.1f} to under 25 would help lower your risk.")
            
            suggestions.append(" **Regular exercise** - 150 minutes of moderate activity per week can improve overall health metrics.")
            suggestions.append(" **Preventive care** - Regular check-ups can catch issues early and demonstrate health commitment.")
            
            return "\n".join(suggestions)
        
        if any(word in message_lower for word in ['what if', 'scenario', 'if i', 'suppose']):
            return ("Great question!  I can help you explore different scenarios. "
                   "Try using the **Scenario Simulator** to see how changes in:\n\n"
                   "• BMI\n• Smoking status\n• Age\n• Dependents\n\n"
                   "...would affect your risk score in real-time. "
                   "You can find it in the navigation menu!")
        
        if any(word in message_lower for word in ['premium', 'cost', 'price', 'pay']):
            return (f"Based on your current risk profile, your estimated annual premium is **${premium:,.2f}**.\n\n"
                   f"This translates to approximately **${premium/12:,.2f}/month**.\n\n"
                   f"Your risk category is: **{category}**\n\n"
                   " Improving your risk score could significantly reduce this amount. "
                   "Would you like suggestions on how to lower your premium?")
        
        if any(word in message_lower for word in ['future', 'predict', 'forecast', 'projection']):
            return (" I can show you risk projections for the next 3, 6, and 12 months!\n\n"
                   "Check out the **Future Prediction** page to see:\n"
                   "• How your risk may evolve over time\n"
                   "• Key trend analysis\n"
                   "• Confidence levels for predictions\n\n"
                   "Would you like me to explain how future predictions work?")
        
        if any(word in message_lower for word in ['hello', 'hi', 'hey', 'help']):
            return (f"👋 Hello! I'm LiveRisk AI, your intelligent insurance risk assistant.\n\n"
                   f"I see your current risk score is **{risk_score:.2f}** ({category}).\n\n"
                   "I can help you:\n"
                   "•  Understand your risk factors\n"
                   "•  Get improvement suggestions\n"
                   "•  Explore what-if scenarios\n"
                   "•  Understand future projections\n\n"
                   "What would you like to know?")
        
        # Default response
        return (f"I understand you're asking about your insurance risk. "
               f"Your current score is **{risk_score:.2f}** ({category}) "
               f"with an estimated premium of **${premium:,.2f}/year**.\n\n"
               "Feel free to ask me:\n"
               "• \"Why is my risk high?\"\n"
               "• \"How can I reduce my premium?\"\n"
               "• \"What if I quit smoking?\"\n"
               "• \"Explain my risk factors\"\n\n"
               "How can I help you today?")
    
    def _get_default_suggestions(
        self,
        user_profile: Optional[Dict],
        risk_context: Optional[Dict]
    ) -> List[str]:
        """Get default suggestions based on profile"""
        
        suggestions = []
        
        if user_profile:
            if user_profile.get('smoker'):
                suggestions.append("What if I quit smoking?")
            if user_profile.get('bmi', 0) > 25:
                suggestions.append("How can I improve my BMI?")
        
        suggestions.extend([
            "Explain my risk factors",
            "How can I reduce my premium?"
        ])
        
        return suggestions[:4]
    
    def _extract_suggestions(self, response: str) -> List[str]:
        """Extract actionable suggestions from the response"""
        
        suggestions = []
        
        # Look for bullet points or numbered lists
        lines = response.split('\n')
        for line in lines:
            line = line.strip()
            if line.startswith(('•', '-', '*', '1.', '2.', '3.', '4.', '5.')):
                clean_line = line.lstrip('•-*123456789. ')
                if 10 < len(clean_line) < 100:
                    suggestions.append(clean_line)
        
        return suggestions[:3]  # Return top 3 suggestions
    
    def generate_risk_summary(self, risk_context: Dict, explanations: List[Dict]) -> str:
        """
        Generate a comprehensive risk summary
        """
        
        risk_score = risk_context.get('risk_score', 0)
        category = risk_context.get('risk_category', 'Unknown')
        premium = risk_context.get('premium_estimate', 0)
        
        # Build summary
        summary_parts = [
            f"##  Risk Assessment Summary\n",
            f"**Overall Risk Score:** {risk_score:.2f} ({category})\n",
            f"**Estimated Annual Premium:** ${premium:,.2f}\n",
            f"**Monthly Premium:** ${premium/12:,.2f}\n",
            f"**Confidence Level:** {risk_context.get('confidence', 0) * 100:.0f}%\n",
            "\n###  Key Risk Factors:\n"
        ]
        
        for i, exp in enumerate(explanations[:3], 1):
            direction = "↑" if exp['direction'] == 'increases' else "↓"
            summary_parts.append(
                f"{i}. **{exp['feature']}**: {direction} {exp['percentage']:.1f}% impact\n"
            )
        
        return "".join(summary_parts)


# Singleton instance
risk_agent = RiskAgent()