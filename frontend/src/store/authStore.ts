import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';
import { apiService } from '../services/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  updateUser: (data: any) => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: null });
          const response = await apiService.login(email, password);
          
          const { user, token } = response.data;
          
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
          
          localStorage.setItem('token', token);
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Login failed',
            isLoading: false
          });
          throw error;
        }
      },

      register: async (data: any) => {
        try {
          set({ isLoading: true, error: null });
          const response = await apiService.register(data);
          
          const { user, token } = response.data;
          
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
          
          localStorage.setItem('token', token);
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Registration failed',
            isLoading: false
          });
          throw error;
        }
      },

      logout: () => {
        // Call logout API (optional - mainly for server-side cleanup)
        apiService.logout().catch(() => {
          // Ignore errors - logout locally anyway
        });
        
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null
        });
      },

      updateUser: async (data: any) => {
        try {
          set({ isLoading: true, error: null });
          const response = await apiService.updateProfile(data);
          
          set({
            user: response.data.user,
            isLoading: false,
            error: null
          });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Update failed',
            isLoading: false
          });
          throw error;
        }
      },

      clearError: () => set({ error: null })
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);
