import { defineStore } from 'pinia';
import apiClient from '../api';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    isAuthenticated: !!localStorage.getItem('token'),
  }),
  actions: {
    async login(username: string, password: string) {
      try {
        const response = await apiClient.post('admin/auth/login', {
          username: username,
          password: password
        });
        
        this.token = response.data.access_token as string;
        this.isAuthenticated = true;
        localStorage.setItem('token', this.token);
        return true;
      } catch (error) {
        console.error('Login failed:', error);
        throw error;
      }
    },
    logout() {
      this.token = null;
      this.isAuthenticated = false;
      localStorage.removeItem('token');
    }
  }
});
