import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserState {
  userName: string | null;
  activeTab: string;
  setUserName: (name: string) => void;
  clearUserName: () => void;
  setActiveTab: (tab: string) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      userName: null,
      activeTab: 'tasks',
      setUserName: (name) => set({ userName: name }),
      clearUserName: () => set({ userName: null }),
      setActiveTab: (tab) => set({ activeTab: tab }),
    }),
    {
      name: 'user-storage',
    }
  )
);