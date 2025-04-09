import { create } from 'zustand'

interface CombatLogState {
  messages: string[]
  addMessage: (message: string) => void
  clearLog: () => void
}

const MAX_LOG_MESSAGES = 100 // Limit the number of messages stored

const useCombatLogStore = create<CombatLogState>((set) => ({
  messages: [],
  addMessage: (message) => set((state) => ({
    // Add new message and limit the array size
    messages: [...state.messages, message].slice(-MAX_LOG_MESSAGES)
  })),
  clearLog: () => set({ messages: [] })
}))

export { useCombatLogStore } 