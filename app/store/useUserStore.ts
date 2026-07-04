import { create } from "zustand";
import { persist } from "zustand/middleware";
import { currentUser as defaultUser } from "@/lib/mock-data";

export interface UserDetails {
  name: string;
  email: string;
  title: string;
  avatar: string;
  location: string;
  joined: string;
  skills: string[];
  resumeName: string;
}

interface UserState {
  user: UserDetails;
  updateUser: (patch: Partial<UserDetails>) => void;
  resetUser: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: { ...defaultUser },
      updateUser: (patch) =>
        set((state) => ({
          user: { ...state.user, ...patch },
        })),
      resetUser: () => set({ user: { ...defaultUser } }),
    }),
    {
      name: "evalynx-user-details",
    }
  )
);
