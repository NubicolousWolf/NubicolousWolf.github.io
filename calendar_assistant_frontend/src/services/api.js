import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

export const createEvents = async (input) => {
  try {
    const response = await axios.post(`${API_URL}/events`, { input });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getExample = async () => {
  try {
    const response = await axios.get(`${API_URL}/example`);
    return response.data.example;
  } catch (error) {
    console.error('获取示例失败:', error);
    return "明天下午2点团队会议，地点在201会议室\n后天上午10点线上会议";
  }
};