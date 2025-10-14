import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
    baseURL: `${API_URL}/api`,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const authAPI = {
    register: (userData) => api.post('/auth/register', userData),
    login: (credentials) => api.post('/auth/login', credentials),
    getMe: () => api.get('/auth/me'),
};

export const userAPI = {
    getUsers: (params) => api.get('/users', { params }),
    getUsersList: () => api.get('/users/list'),
    createUser: (userData) => api.post('/users', userData),
    updateUser: (id, userData) => api.put(`/users/${id}`, userData),
    deleteUser: (id) => api.delete(`/users/${id}`),
};

export const taskAPI = {
    getTasks: (params) => api.get('/tasks', { params }),
    getTask: (id) => api.get(`/tasks/${id}`),
    createTask: (taskData) => {
        const formData = new FormData();
        Object.keys(taskData).forEach(key => {
            if (key === 'attachments' && taskData[key]) {
                taskData[key].forEach(file => formData.append('attachments', file));
            } else if (taskData[key] !== null && taskData[key] !== undefined) {
                formData.append(key, taskData[key]);
            }
        });
        return api.post('/tasks', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },
    updateTask: (id, taskData) => {
        const formData = new FormData();
        Object.keys(taskData).forEach(key => {
            if (key === 'attachments' && taskData[key]) {
                taskData[key].forEach(file => formData.append('attachments', file));
            } else if (taskData[key] !== null && taskData[key] !== undefined) {
                formData.append(key, taskData[key]);
            }
        });
        return api.put(`/tasks/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },
    deleteTask: (id) => api.delete(`/tasks/${id}`),
    downloadAttachment: (taskId, attachmentId) =>
        api.get(`/tasks/${taskId}/attachments/${attachmentId}`, { responseType: 'blob' }),
};

export default api;
