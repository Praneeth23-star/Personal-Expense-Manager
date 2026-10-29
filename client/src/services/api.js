
import axios from 'axios';

const API = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    '/api',
});

// Attach JWT token to API requests
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Handle invalid or expired sessions
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || '';

    const isLoginOrRegister =
      url.includes('/auth/login') ||
      url.includes('/auth/register');

    if (
      error.response?.status === 401 &&
      !isLoginOrRegister &&
      localStorage.getItem('token')
    ) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      window.dispatchEvent(
        new Event('auth:session-expired')
      );
    }

    return Promise.reject(error);
  }
);

// Authentication services
export const loginApi = (email, password) =>
  API.post('/auth/login', { email, password });

export const registerApi = (
  name,
  email,
  password,
  currency
) =>
  API.post('/auth/register', {
    name,
    email,
    password,
    currency,
  });

export const getMeApi = () =>
  API.get('/auth/me');

export const updateMeApi = (data) =>
  API.put('/auth/me', data);

// Transaction services
export const getTransactionsApi = (params) =>
  API.get('/transactions', { params });

export const getExportTransactionsApi = (params) =>
  API.get('/transactions/export', { params });

export const getTransactionByIdApi = (id) =>
  API.get(`/transactions/${id}`);

export const createTransactionApi = (data) =>
  API.post('/transactions', data);

export const updateTransactionApi = (id, data) =>
  API.put(`/transactions/${id}`, data);

export const deleteTransactionApi = (id) =>
  API.delete(`/transactions/${id}`);

export const importTransactionsApi = (items) =>
  API.post('/transactions/import', { items });

// Budget services
export const getBudgetsApi = (month) =>
  API.get('/budgets', { params: { month } });

export const setBudgetApi = (data) =>
  API.post('/budgets', data);

export const deleteBudgetApi = (id) =>
  API.delete(`/budgets/${id}`);

// Dashboard statistics
export const getDashboardStatsApi = () =>
  API.get('/stats/dashboard');

// Financial goals
export const getGoalsApi = () =>
  API.get('/goals');

export const createGoalApi = (data) =>
  API.post('/goals', data);

export const depositToGoalApi = (id, amount) =>
  API.post(`/goals/${id}/deposit`, { amount });

export const updateGoalApi = (id, data) =>
  API.put(`/goals/${id}`, data);

export const deleteGoalApi = (id) =>
  API.delete(`/goals/${id}`);

// Subscription services
export const getSubscriptionsApi = () =>
  API.get('/subscriptions');

export const createSubscriptionApi = (data) =>
  API.post('/subscriptions', data);

export const paySubscriptionApi = (id) =>
  API.post(`/subscriptions/${id}/pay`);

export const updateSubscriptionApi = (id, data) =>
  API.put(`/subscriptions/${id}`, data);

export const deleteSubscriptionApi = (id) =>
  API.delete(`/subscriptions/${id}`);

// AI financial advisor
export const getFinancialInsightsApi = () =>
  API.get('/ai/insights');

export const askAdvisorApi = (question) =>
  API.post('/ai/ask', { question });

export default API;
