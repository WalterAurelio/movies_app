import { create } from 'zustand';

type AuthObject = {
  email?: string;
  roles?: [number];
  accessToken?: string;
};

type AuthState = {
  auth: AuthObject;
  setAuth: (value: AuthObject) => void;
};

export const useAuthStore = create<AuthState>(set => ({
  auth: {},
  setAuth: (value: AuthObject) => set({ auth: value }),
}));
