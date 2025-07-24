import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

export const startAuth = async () => {
  try {
    const response = await axios.get(`${API_URL}/auth/start`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const completeAuth = async (flow, cache) => {
  try {
    const response = await axios.post(`${API_URL}/auth/complete`, { flow, cache });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const checkAuthStatus = async () => {
  try {
    const response = await axios.get(`${API_URL}/auth/status`);
    return response.data.authenticated;
  } catch (error) {
    console.error('检查认证状态失败:', error);
    return false;
  }
};