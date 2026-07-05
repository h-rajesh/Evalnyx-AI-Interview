import { create } from "zustand";
import { persist } from "zustand/middleware";

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

const emptyUser: UserDetails = {
  name: "",
  email: "",
  title: "",
  avatar: "",
  location: "",
  joined: "",
  skills: [],
  resumeName: "",
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: { ...emptyUser },
      updateUser: (patch) =>
        set((state) => ({
          user: { ...state.user, ...patch },
        })),
      resetUser: () => set({ user: { ...emptyUser } }),
    }),
    {
      name: "evalynx-user-details",
    }
  )
);
