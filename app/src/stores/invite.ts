import { create } from 'zustand'

interface InviteState {
  challengeId: string | null
  otp: string | null
  set: (params: { challengeId: string; otp: string }) => void
  clear: () => void
}

export const useInviteStore = create<InviteState>()((set) => ({
  challengeId: null,
  otp: null,
  set: (params) => set(params),
  clear: () => set({ challengeId: null, otp: null }),
}))
