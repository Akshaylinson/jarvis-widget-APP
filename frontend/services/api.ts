import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: { 'Content-Type': 'application/json' },
    });

    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('admin_token');
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });
  }

  // Auth
  async login(email: string, password: string) {
    const { data } = await this.api.post('/admin/login', { email, password });
    localStorage.setItem('admin_token', data.token);
    return data;
  }

  logout() {
    localStorage.removeItem('admin_token');
  }

  // Dashboard
  async getDashboardMetrics() {
    const { data } = await this.api.get('/admin/dashboard/metrics');
    return data;
  }

  // Tenants
  async getTenants() {
    const { data } = await this.api.get('/admin/tenants');
    return data;
  }

  async getTenant(id: string) {
    const { data } = await this.api.get(`/admin/tenants/${id}`);
    return data;
  }

  async deleteTenant(id: string) {
    await this.api.delete(`/admin/tenants/${id}`);
  }

  // Assistants
  async getAssistants() {
    const { data } = await this.api.get('/admin/assistants');
    return data;
  }

  async updateAssistant(id: string, updates: any) {
    const { data } = await this.api.put(`/admin/assistants/${id}`, updates);
    return data;
  }

  // Knowledge
  async getKnowledge() {
    const { data } = await this.api.get('/admin/knowledge');
    return data;
  }

  async deleteKnowledge(id: string) {
    await this.api.delete(`/admin/knowledge/${id}`);
  }

  // Conversations
  async getConversations(filters?: any) {
    const { data } = await this.api.get('/admin/conversations', { params: filters });
    return data;
  }

  // Analytics
  async getAnalytics() {
    const { data } = await this.api.get('/admin/analytics');
    return data;
  }

  // System Config
  async getSystemConfig() {
    const { data } = await this.api.get('/admin/system-config');
    return data;
  }

  async updateSystemConfig(config: any) {
    const { data } = await this.api.put('/admin/system-config', config);
    return data;
  }

  // Logs
  async getLogs() {
    const { data } = await this.api.get('/admin/logs');
    return data;
  }

  // Health
  async getHealth() {
    const { data } = await this.api.get('/health');
    return data;
  }
}

export const apiService = new ApiService();
