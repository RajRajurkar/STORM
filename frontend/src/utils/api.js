import axios from 'axios';
import { API_BASE_URL } from './constants';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API Functions
export const underwriteApplication = async (application) => {
  const response = await api.post('/underwrite', application);
  return response.data;
};

export const calculateRisk = async (application) => {
  const response = await api.post('/risk/calculate', application);
  return response.data;
};

export const simulateScenario = async (baseApplication, modifications) => {
  const response = await api.post('/simulate/scenario', {
    base_application: baseApplication,
    modified_factors: modifications,
  });
  return response.data;
};

export const predictFutureRisk = async (application) => {
  const response = await api.post('/predict/future', application);
  return response.data;
};

export const getAnalyticsSummary = async () => {
  const response = await api.get('/analytics/summary');
  return response.data;
};

export const healthCheck = async () => {
  const response = await api.get('/health');
  return response.data;
};

export default api;