import { apiClient } from './apiClient';

export const aiService = {
  getWelcome: () => apiClient.get('/ai/welcome'),
  chat: (message, history = []) => apiClient.post('/ai/chat', { message, history }),
};