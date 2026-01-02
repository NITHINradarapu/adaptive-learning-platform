import axios, { AxiosInstance, AxiosError } from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Add token to requests
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Handle response errors
    this.api.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async register(data: any) {
    const response = await this.api.post('/auth/register', data);
    return response.data;
  }

  async login(email: string, password: string) {
    const response = await this.api.post('/auth/login', { email, password });
    return response.data;
  }

  async logout() {
    const response = await this.api.post('/auth/logout');
    return response.data;
  }

  async getMe() {
    const response = await this.api.get('/auth/me');
    return response.data;
  }

  async updateProfile(data: any) {
    const response = await this.api.put('/auth/profile', data);
    return response.data;
  }

  // Course endpoints
  async getCourses(params?: any) {
    const response = await this.api.get('/courses', { params });
    return response.data;
  }

  async getCourse(id: string) {
    const response = await this.api.get(`/courses/${id}`);
    return response.data;
  }

  async getRecommendedCourses() {
    const response = await this.api.get('/courses/recommended');
    return response.data;
  }

  async enrollCourse(courseId: string) {
    const response = await this.api.post(`/courses/${courseId}/enroll`);
    return response.data;
  }

  async unenrollCourse(courseId: string) {
    const response = await this.api.delete(`/courses/${courseId}/enroll`);
    return response.data;
  }

  async createCourse(data: any) {
    const response = await this.api.post('/courses', data);
    return response.data;
  }

  async updateCourse(id: string, data: any) {
    const response = await this.api.put(`/courses/${id}`, data);
    return response.data;
  }

  async deleteCourse(id: string) {
    const response = await this.api.delete(`/courses/${id}`);
    return response.data;
  }

  // Module endpoints
  async getCourseModules(courseId: string) {
    const response = await this.api.get(`/courses/${courseId}/modules`);
    return response.data;
  }

  async getModule(moduleId: string) {
    const response = await this.api.get(`/modules/${moduleId}`);
    return response.data;
  }

  async createModule(courseId: string, data: any) {
    const response = await this.api.post(`/courses/${courseId}/modules`, data);
    return response.data;
  }

  async updateModule(moduleId: string, data: any) {
    const response = await this.api.put(`/modules/${moduleId}`, data);
    return response.data;
  }

  async deleteModule(moduleId: string) {
    const response = await this.api.delete(`/modules/${moduleId}`);
    return response.data;
  }

  // Video endpoints
  async getModuleVideos(moduleId: string) {
    const response = await this.api.get(`/modules/${moduleId}/videos`);
    return response.data;
  }

  async getVideo(id: string) {
    const response = await this.api.get(`/videos/${id}`);
    return response.data;
  }

  async createVideo(moduleId: string, data: any) {
    const response = await this.api.post(`/modules/${moduleId}/videos`, data);
    return response.data;
  }

  async updateVideo(videoId: string, data: any) {
    const response = await this.api.put(`/videos/${videoId}`, data);
    return response.data;
  }

  async deleteVideo(videoId: string) {
    const response = await this.api.delete(`/videos/${videoId}`);
    return response.data;
  }

  async getVideoQuestions(videoId: string) {
    const response = await this.api.get(`/videos/${videoId}/questions`);
    return response.data;
  }

  async submitCheckpoint(videoId: string, questionId: string, data: any) {
    const response = await this.api.post(
      `/videos/${videoId}/checkpoints/${questionId}`,
      data
    );
    return response.data;
  }

  async createQuestion(videoId: string, data: any) {
    const response = await this.api.post(`/videos/${videoId}/questions`, data);
    return response.data;
  }

  // Progress endpoints
  async getDashboard() {
    const response = await this.api.get('/progress/dashboard');
    return response.data;
  }

  async getAdaptivePath(courseId: string) {
    const response = await this.api.get(`/progress/adaptive-path/${courseId}`);
    return response.data;
  }

  async getCourseProgress(courseId: string) {
    const response = await this.api.get(`/progress/course/${courseId}`);
    return response.data;
  }

  async updateVideoProgress(videoId: string, data: any) {
    const response = await this.api.post(`/progress/video/${videoId}`, data);
    return response.data;
  }

  // Attendance endpoints
  async getAttendanceStatus(params?: any) {
    const response = await this.api.get('/attendance/status', { params });
    return response.data;
  }

  async markAttendance(data: any) {
    const response = await this.api.post('/attendance/mark', data);
    return response.data;
  }

  async getAttendanceCalendar(year: number, month: number) {
    const response = await this.api.get('/attendance/calendar', {
      params: { year, month }
    });
    return response.data;
  }

  async getCurrentStreak() {
    const response = await this.api.get('/attendance/streaks/current');
    return response.data;
  }
}

export const apiService = new ApiService();
