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
            return ("👋 Hello! I'm LiveRisk AI, your intelligent insurance risk assistant. "
                "I'd be happy to help! Please first complete a risk assessment so I can "
                "provide personalized insights about your health profile.")
        
        risk_score = risk_context.get('risk_score', 0.5)
        category = risk_context.get('risk_category', 'Unknown')
        premium = risk_context.get('premium_estimate', 0)
        
        # Extract user details
        user_name = user_profile.get('name', 'there') if user_profile else 'there'
        age = user_profile.get('age', 'N/A') if user_profile else 'N/A'
        bmi = user_profile.get('bmi', 'N/A') if user_profile else 'N/A'
        smoker = user_profile.get('smoker', False) if user_profile else False
        
        # Handle "why" questions
        if any(word in message_lower for word in ['why', 'reason', 'explain', 'factor', 'cause']):
            factors = []
            
            if user_profile:
                # Analyze smoking
                if user_profile.get('smoker'):
                    smoking_status = user_profile.get('smoking_status', 'current')
                    if smoking_status == 'current':
                        factors.append("🚬 **Current Smoker** - This is the single most significant factor, adding approximately 15-20% to your risk score. Smoking affects multiple health systems and significantly increases insurance claims probability.")
                    elif smoking_status == 'former':
                        factors.append("🚬 **Former Smoker** - While you've quit, there's still residual risk (about 5% added to your score). The good news: this decreases over time!")
                
                # Analyze BMI
                try:
                    bmi_val = float(bmi)
                    if bmi_val < 18.5:
                        factors.append(f"⚖️ **Low BMI** ({bmi}) - Being underweight (BMI < 18.5) can indicate nutritional deficiencies and adds ~8-10% to risk.")
                    elif bmi_val >= 25 and bmi_val < 30:
                        factors.append(f"⚖️ **Elevated BMI** ({bmi}) - Your BMI is in the 'overweight' range (25-30), adding approximately 8-12% to your risk score.")
                    elif bmi_val >= 30 and bmi_val < 35:
                        factors.append(f"⚖️ **Obesity Class I** ({bmi}) - BMI of 30-35 is classified as obese, contributing 14-18% to your overall risk.")
                    elif bmi_val >= 35:
                        factors.append(f"⚖️ **Obesity Class II+** ({bmi}) - BMI above 35 significantly impacts risk, adding 20-25% to your score due to associated health complications.")
                except:
                    pass
                
                # Age factor
                if age != 'N/A':
                    try:
                        age_val = int(age)
                        if age_val > 55:
                            factors.append(f"📅 **Age Factor** ({age} years) - Age is a natural risk factor. After 55, risk increases by about 1-2% per year due to natural aging processes.")
                        elif age_val > 45:
                            factors.append(f"📅 **Age Factor** ({age} years) - Age contributes moderately to risk, adding approximately 5-8% to your score.")
                    except:
                        pass
                
                # Previous claims
                claims = user_profile.get('previous_claims', 0)
                if claims > 0:
                    claims_impact = min(claims * 3, 15)
                    factors.append(f"📋 **Claims History** ({claims} previous claim{'s' if claims > 1 else ''}) - Each claim adds ~3% to risk. Your {claims} claim{'s' if claims > 1 else ''} contribute approximately {claims_impact}% to your total score.")
                
                # Chronic conditions
                chronic = user_profile.get('chronic_conditions', 0)
                if chronic > 0:
                    chronic_impact = min(chronic * 4, 20)
                    factors.append(f"🏥 **Chronic Conditions** ({chronic} condition{'s' if chronic > 1 else ''}) - Each chronic condition adds ~4% to risk. Your {chronic} condition{'s' if chronic > 1 else ''} contribute approximately {chronic_impact}%.")
                
                # Exercise (protective)
                exercise = user_profile.get('exercise_days', 0)
                if exercise >= 4:
                    factors.append(f"✅ **Regular Exercise** ({exercise} days/week) - Great! This is working in your favor, reducing risk by approximately {exercise * 1.5:.0f}%.")
                elif exercise <= 1:
                    factors.append(f"⚠️ **Low Physical Activity** ({exercise} day{'s' if exercise != 1 else ''}/week) - Limited exercise adds ~6-8% to risk. Increasing to 3-4 days/week could significantly improve your score.")
                
                # Stress
                stress = user_profile.get('stress_level', 5)
                if stress >= 7:
                    factors.append(f"😰 **High Stress** (Level {stress}/10) - Elevated stress contributes ~{(stress - 5) * 2:.0f}% to your risk due to its impact on overall health.")
            
            if factors:
                response = f"Your risk score of **{risk_score*100:.0f}%** ({category}) is influenced by several factors:\n\n"
                response += "\n\n".join(factors)
                response += f"\n\n**Total Impact:** These factors combine to create your current risk profile. The good news? Many of these are modifiable! Would you like specific suggestions on improving your score?"
                return response
            else:
                return (f"Your risk score is **{risk_score*100:.0f}%** ({category}). "
                    "The main factors include age, BMI, smoking status, and health history. "
                    "Would you like me to explain any specific factor in detail?")
        
        # Handle "improve/reduce" questions
        if any(word in message_lower for word in ['improve', 'reduce', 'lower', 'better', 'decrease', 'help']):
            suggestions = ["Here's how you can improve your risk score:\n"]
            
            if user_profile:
                if user_profile.get('smoker'):
                    potential_savings = premium * 0.15 if premium else 200
                    suggestions.append(f"🎯 **#1 Priority: Quit Smoking**\n   - **Potential Impact:** Reduce risk by 15-20%\n   - **Premium Savings:** Could save ${potential_savings:.0f}-${potential_savings*1.3:.0f}/month\n   - **Timeline:** Risk starts decreasing immediately, major improvements after 6-12 months\n   - **Resources:** Consider nicotine replacement therapy, counseling, or medications")
                
                try:
                    bmi_val = float(bmi)
                    if bmi_val > 30:
                        target_bmi = 25
                        weight_loss = (bmi_val - target_bmi) * ((user_profile.get('height_cm', 170)/100) ** 2)
                        suggestions.append(f"🎯 **Achieve Healthy BMI**\n   - **Current:** {bmi_val:.1f} (Obese)\n   - **Target:** 25 (Healthy)\n   - **Weight Goal:** Lose ~{weight_loss:.0f}kg\n   - **Potential Impact:** Reduce risk by 12-18%\n   - **Approach:** Combine diet (500 cal deficit) + exercise (150 min/week)")
                    elif bmi_val > 25:
                        suggestions.append(f"🎯 **Optimize BMI**\n   - **Current:** {bmi_val:.1f} (Overweight)\n   - **Target:** 22-24 (Optimal)\n   - **Potential Impact:** Reduce risk by 6-10%")
                except:
                    pass
                
                exercise = user_profile.get('exercise_days', 0)
                if exercise < 4:
                    suggestions.append(f"🎯 **Increase Physical Activity**\n   - **Current:** {exercise} days/week\n   - **Goal:** 4-5 days/week, 30-45 min each\n   - **Potential Impact:** Reduce risk by 5-8%\n   - **Start Simple:** Walking, swimming, or cycling\n   - **Progressive Plan:** Week 1-2: 20min, Week 3-4: 30min, Week 5+: 45min")
                
                stress = user_profile.get('stress_level', 5)
                if stress >= 7:
                    suggestions.append(f"🎯 **Stress Management**\n   - **Current:** {stress}/10 (High)\n   - **Target:** Below 5/10\n   - **Potential Impact:** Reduce risk by 3-5%\n   - **Techniques:** Meditation (10min daily), yoga, adequate sleep (7-8hrs)")
                
                claims = user_profile.get('previous_claims', 0)
                if claims > 0:
                    suggestions.append(f"🎯 **Preventive Healthcare**\n   - **Current:** {claims} previous claim{'s' if claims > 1 else ''}\n   - **Goal:** Prevent future claims through regular checkups\n   - **Actions:** Annual physicals, dental cleanings, vision exams\n   - **Long-term:** Each claim-free year improves your profile")
            
            if len(suggestions) == 1:  # Only header
                suggestions.append("📋 **Regular Health Checkups** - Stay on top of preventive care")
                suggestions.append("🏃 **150 minutes/week** of moderate exercise")
                suggestions.append("🥗 **Balanced nutrition** - Focus on whole foods")
            
            suggestions.append(f"\n💡 **Quick Win:** Start with the #1 priority above. Even small improvements compound over time!")
            
            return "\n\n".join(suggestions)
        
        # Handle "what if" questions
        if any(word in message_lower for word in ['what if', 'scenario', 'if i', 'suppose', 'simulate']):
            return ("Great question! 🎮 I can help you explore different scenarios.\n\n"
                "**Try the Scenario Simulator** to see real-time impact of changes in:\n"
                "• 🚬 Smoking status (quit/start)\n"
                "• ⚖️ BMI changes\n"
                "• 🏃 Exercise frequency\n"
                "• 😰 Stress levels\n"
                "• 📋 Health metrics\n\n"
                "The simulator shows you **instant risk updates** and **premium impact** as you adjust each factor!\n\n"
                "Or ask me specifically: \"What if I quit smoking?\" or \"What if I reduce my BMI to 24?\"")
        
        # Handle premium questions
        if any(word in message_lower for word in ['premium', 'cost', 'price', 'pay', 'money', 'expensive']):
            return (f"💰 **Your Premium Breakdown**\n\n"
                f"**Annual Premium:** ${premium:,.2f}\n"
                f"**Monthly:** ${premium/12:,.2f}\n"
                f"**Risk Category:** {category}\n"
                f"**Risk Score:** {risk_score*100:.0f}%\n\n"
                f"**Why this amount?**\n"
                f"Your premium is calculated based on your {risk_score*100:.0f}% risk score. "
                f"For comparison:\n"
                f"• Low risk (< 30%): ~${premium*0.7:,.0f}/year\n"
                f"• Your level ({risk_score*100:.0f}%): ${premium:,.0f}/year\n"
                f"• High risk (> 70%): ~${premium*1.5:,.0f}/year\n\n"
                f"**Want to reduce it?** Ask me \"How can I reduce my premium?\"")
        
        # Handle future/prediction questions
        if any(word in message_lower for word in ['future', 'predict', 'forecast', 'projection', 'trajectory']):
            return ("📈 **Future Risk Predictions**\n\n"
                "I can show you how your risk might evolve over the next 12 months!\n\n"
                "**Predictions Include:**\n"
                "• 📊 3, 6, and 12-month projections\n"
                "• 📉 Risk trajectory with confidence intervals\n"
                "• ⚠️ Early warnings if risk is trending up\n"
                "• ✅ Positive reinforcement if improving\n\n"
                "Check the **Future Prediction** page to see your personalized forecast, or ask me: \"What will my risk be in 6 months?\"")
        
        # Handle greeting
        if any(word in message_lower for word in ['hello', 'hi', 'hey', 'help', 'start']):
            return (f"👋 Hello {user_name}! I'm LiveRisk AI.\n\n"
                f"I can see your current risk profile:\n"
                f"• **Risk Score:** {risk_score*100:.0f}% ({category})\n"
                f"• **Annual Premium:** ${premium:,.2f}\n\n"
                f"**I can help you with:**\n"
                f"✓ Understanding why your risk is {risk_score*100:.0f}%\n"
                f"✓ Getting personalized improvement strategies\n"
                f"✓ Exploring what-if scenarios\n"
                f"✓ Understanding your premium breakdown\n"
                f"✓ Predicting future risk trends\n\n"
                f"**Try asking:**\n"
                f"• \"Why is my risk {risk_score*100:.0f}%?\"\n"
                f"• \"How can I reduce my premium?\"\n"
                f"• \"What if I quit smoking?\"\n\n"
                f"What would you like to know?")
        
        # Default response
        return (f"I understand you're asking about: \"{message}\"\n\n"
            f"**Your Current Status:**\n"
            f"• Risk Score: **{risk_score*100:.0f}%** ({category})\n"
            f"• Annual Premium: **${premium:,.2f}**\n\n"
            f"**Common Questions:**\n"
            f"• \"Why is my risk {risk_score*100:.0f}%?\"\n"
            f"• \"How can I reduce my premium?\"\n"
            f"• \"What if I quit smoking?\"\n"
            f"• \"Show me improvement strategies\"\n"
            f"• \"What's my future risk trajectory?\"\n\n"
            f"How can I help you today?")

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
            bmi = float(user_profile.get('bmi', 0) or 0)
            if bmi > 25:
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