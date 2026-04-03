import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const chatService = {
  // Chat with AI agent
  sendMessage: async (message, userProfile = null, context = null) => {
    const response = await api.post('/api/chat', {
      message,
      user_profile: userProfile,
      context,
    });
    return response.data;
  },
};

export default api;