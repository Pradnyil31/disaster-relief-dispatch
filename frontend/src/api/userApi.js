import axios from 'axios';

const BASE_URL = '/api/v1/admin/users';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

export const userApi = {
  getAll: async (params) => {
    const response = await axios.get(BASE_URL, {
      params,
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  create: async (data) => {
    const response = await axios.post(BASE_URL, data, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  update: async (id, data) => {
    const response = await axios.put(`${BASE_URL}/${id}`, data, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },
};
