import { create } from "zustand";
import api from "../lib/api";

export interface User {
  id: number;
  telegram_id: number;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  language_code: string | null;
  is_premium: boolean;
  balance: number;
  is_admin: boolean;
  total_earned: number;
  tasks_completed: number;
  created_at: string;
  last_active: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (initData: string) => Promise<void>;
  logout: () => void;
  fetchMe: () => Promise<void>;
  setToken: (token: string) => void;
}

const storedUser = localStorage.getItem("rh_user");
const parsedUser = storedUser ? JSON.parse(storedUser) : null;

export const useAuthStore = create<AuthState>((set, get) => ({
  user: parsedUser,
  token: localStorage.getItem("rh_token"),
  isLoading: false,
  isAuthenticated: !!localStorage.getItem("rh_token"),

  login: async (initData: string) => {
    set({ isLoading: true });
    try {
      const res = await api.post("/auth/telegram", { initData });
      const { access_token, user } = res.data;
      localStorage.setItem("rh_token", access_token);
      localStorage.setItem("rh_user", JSON.stringify(user));
      set({
        token: access_token,
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (err: any) {
      set({ isLoading: false });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem("rh_token");
    localStorage.removeItem("rh_user");
    set({ user: null, token: null, isAuthenticated: false });
  },

  fetchMe: async () => {
    const token = get().token;
    if (!token) return;
    try {
      const res = await api.get("/auth/me");
      const user = res.data;
      localStorage.setItem("rh_user", JSON.stringify(user));
      set({ user, isAuthenticated: true });
    } catch {
      // Never auto-logout on fetch failure — network issues, VPS cold starts, etc.
      // Only real 401 (expired JWT) should trigger logout, handled by api interceptor.
    }
  },

  setToken: (token: string) => {
    localStorage.setItem("rh_token", token);
    set({ token, isAuthenticated: true });
  },
}));
