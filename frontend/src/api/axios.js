import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/auth/refresh-token') &&
      !originalRequest.url.includes('/auth/login') &&
      !originalRequest.url.includes('/auth/register')
    ) {
      originalRequest._retry = true;
      try {
        await api.post('/auth/refresh-token');
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, do not retry again or loop.
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;