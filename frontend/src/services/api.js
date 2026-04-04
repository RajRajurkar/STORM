import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

export const chatService = {
  sendMessage: async (message, userProfile = null, context = null) => {
    try {
      const response = await api.post('agent/chat', {
        message,
        user_profile: userProfile,
        risk_context: context?.riskContext, 
        conversation_history: context?.history,
      });
      return response.data;
    } catch (error) {
      console.error('Chat error:', error);
      return {
        response: "I'm having trouble connecting. Please try again.",
        suggestions: [],
        success: false
      };
    }
  },
};

export default api;