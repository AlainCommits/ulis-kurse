import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

interface RetryConfig extends InternalAxiosRequestConfig {
  retryCount?: number;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://uli-backend.onrender.com',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Retry Logic
const retryDelay = (retryCount: number) => Math.min(1000 * (2 ** retryCount), 10000);

api.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    const config = error.config as RetryConfig;
    if (!config) return Promise.reject(error);

    config.retryCount = config.retryCount ?? 0;

    const shouldRetry = (
      error.code === 'ERR_NETWORK' || 
      error.code === 'ECONNABORTED' ||
      (error.response && error.response.status >= 500)
    );

    if (shouldRetry && config.retryCount < 3) {
      config.retryCount += 1;
      
      const delay = retryDelay(config.retryCount);
      await new Promise(resolve => setTimeout(resolve, delay));

      console.log(`Retry attempt ${config.retryCount} for ${config.url}`);
      return api(config);
    }

    return Promise.reject(error);
  }
);

// Auth Token Management
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Types
export interface CourseData {
  _id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  category: string;
  status: string;
  maxParticipants: number;
  participantCount?: number;
  topics?: string[];
  participants?: UserData[];
}

export interface UserData {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export interface UserWithCourses {
  user: UserData;
  courses: CourseData[];
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData extends LoginData {
  firstName: string;
  lastName: string;
}

// Public Course APIs
export const publicCourses = {
  getAll: () => 
    api.get<{ status: string; data: { courses: CourseData[] } }>('/api/courses'),
  getById: (id: string) => 
    api.get<{ status: string; data: { course: CourseData } }>(`/api/courses/${id}`),
};

// Protected Course APIs
export const courses = {
  getMyCourses: () => 
    api.get<{ status: string; data: { courses: CourseData[] } }>('/api/courses/user/courses'),
  getMyPastCourses: () => 
    api.get<{ status: string; data: { courses: CourseData[] } }>('/api/courses/user/past-courses'),
  join: (id: string) => 
    api.post<{ status: string; message: string }>(`/api/courses/${id}/join`),
  leave: (id: string) => 
    api.post<{ status: string; message: string }>(`/api/courses/${id}/leave`),
};

// User APIs
export const users = {
  getAll: () =>
    api.get<{ status: string; data: { users: UserData[] } }>('/api/users'),
  getById: (id: string) =>
    api.get<{ status: string; data: UserWithCourses }>(`/api/users/${id}`),
  getProfile: () =>
    api.get<{ status: string; data: UserWithCourses }>('/api/users/profile'),
  updateProfile: (data: Partial<UserData>) =>
    api.put<{ status: string; data: { user: UserData } }>('/api/users/profile', data)
};

// Admin APIs
export const admin = {
  // Kursverwaltung
  getAllCourses: () =>
    api.get<{ status: string; data: { courses: CourseData[] } }>('/api/admin/courses'),
  createCourse: (data: Omit<CourseData, '_id' | 'participants' | 'participantCount'>) =>
    api.post<{ status: string; data: { course: CourseData } }>('/api/admin/courses', data),
  updateCourse: (id: string, data: Partial<CourseData>) =>
    api.put<{ status: string; data: { course: CourseData } }>(`/api/admin/courses/${id}`, data),
  deleteCourse: (id: string) =>
    api.delete<{ status: string }>(`/api/admin/courses/${id}`),

  // Benutzerverwaltung
  getAllUsers: () =>
    api.get<{ status: string; data: { users: UserData[] } }>('/api/admin/users'),
  updateUserRole: (id: string, role: 'user' | 'admin') =>
    api.put<{ status: string; data: { user: UserData } }>(`/api/admin/users/${id}/role`, { role }),
  deleteUser: (id: string) =>
    api.delete<{ status: string }>(`/api/admin/users/${id}`)
};

// Auth APIs
export const auth = {
  register: (data: RegisterData) =>
    api.post<{ status: string; data: { token: string; user: UserData } }>('/api/users/register', data),
  login: (data: LoginData) =>
    api.post<{ status: string; data: { token: string; user: UserData } }>('/api/users/login', data),
};

export default api;