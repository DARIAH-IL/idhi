import { create } from 'zustand'

export type AuthLinkFlow = 'invite' | 'otp'

interface AuthLinkState {
  challengeId: string | null
  otp: string | null
  flow: AuthLinkFlow | null
  set: (params: {
    challengeId: string
    otp: string
    flow: AuthLinkFlow
  }) => void
  clear: () => void
}

export const useAuthLinkStore = create<AuthLinkState>()((set) => ({
  challengeId: null,
  otp: null,
  flow: null,
  set: (params) => set(params),
  clear: () => set({ challengeId: null, otp: null, flow: null }),
}))
