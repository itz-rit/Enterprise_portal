import axios from 'axios';
import { getApiUrl } from './api';

const communiService = {
  // Rewards
  getTodayReward: async () => {
    const localDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const response = await axios.get(getApiUrl(`/api/v1/communi/rewards/today?date=${localDate}`));
    return response.data;
  },
  upsertReward: async (rewardData, token) => {
    const response = await axios.post(getApiUrl('/api/v1/communi/rewards'), rewardData, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    return response.data;
  },

  // Tasks
  getStaffTasks: async (userId, token) => {
    const response = await axios.get(getApiUrl(`/api/v1/communi/tasks/staff/${userId}`), {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    return response.data;
  },
  createTask: async (taskData, token) => {
    const response = await axios.post(getApiUrl('/api/v1/communi/tasks'), taskData, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    return response.data;
  },
  completeTask: async (taskId, token) => {
    const response = await axios.put(getApiUrl(`/api/v1/communi/tasks/${taskId}/complete`), {}, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    return response.data;
  },

  // Notices
  getNotices: async () => {
    const response = await axios.get(getApiUrl('/api/v1/communi/notices'));
    return response.data;
  },
  createNotice: async (noticeData, token) => {
    const response = await axios.post(getApiUrl('/api/v1/communi/notices'), noticeData, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    return response.data;
  },
  deleteNotice: async (noticeId, token) => {
    const response = await axios.delete(getApiUrl(`/api/v1/communi/notices/${noticeId}`), {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    return response.data;
  }
};

export default communiService;
