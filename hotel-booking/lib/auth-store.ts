import { create } from "zustand"
import { persist } from "zustand/middleware"

type Role = "admin" | "customer"

type User = {
  _id: string
  fullName: string
  email: string
  role: Role
  phone: string
  birthDate: string
}

type AuthState = {
  user: User | null
  token: string | null
  login: (data: { token: string, user: User }) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      login: ({ token, user }) => set({ token, user }),
      logout: () => set({ user: null, token: null }),
    }),
    { name: "auth-storage" }
  )
)
