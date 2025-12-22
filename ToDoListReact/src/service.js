import axios from 'axios';
const api = axios.create({
  baseURL: "https://todo-server-bwjl.onrender.com"
});
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default {
  getTasks: async () => {
    const result = await api.get('/items');
    return result.data;
  },

  addTask: async (title) => {
    const result = await api.post('/items', { title, isComplete: false });
    return result.data;
  },

  setCompleted: async (id, isComplete) => {
    const result = await api.put(`/items/${id}?isComplete=${isComplete}`);
    return result.data;
  },

  deleteTask: async (id) => {
    const result = await api.delete(`/items/${id}`);
    return result.data;
  },

  login: async (username, password) => {
    const result = await api.post('/login', { username, password });
    localStorage.setItem('token', result.data.token);
    return result.data;
  }

};
