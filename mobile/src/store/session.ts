import { create } from "zustand";

type SessionState = {
  signedIn: boolean;
  email: string;
  hydrate: (data: { email: string }) => void;
  reset: () => void;
};

export const useSession = create<SessionState>((set) => ({
  signedIn: false,
  email: "",
  hydrate: (data) => set({ signedIn: true, email: data.email }),
  reset: () => set({ signedIn: false, email: "" }),
}));
