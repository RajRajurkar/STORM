import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, 
});

api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const underwriteApplication = async (application) => {
  const response = await api.post('underwrite', application);
  return response.data;
};

export const calculateRisk = async (application) => {
  const response = await api.post('risk/calculate', application);
  return response.data;
};

export const simulateScenario = async (baseApplication, modifications) => {
  const response = await api.post('simulate/scenario', {
    base_application: baseApplication,
    modified_factors: modifications,
  });
  return response.data;
};

export const predictFutureRisk = async (application) => {
  const response = await api.post('predict/future', application);
  return response.data;
};

export const getAnalyticsSummary = async () => {
  const response = await api.get('analytics/summary');
  return response.data;
};

export const healthCheck = async () => {
  const response = await api.get('health');
  return response.data;
};

export default api;