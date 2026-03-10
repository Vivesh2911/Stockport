import { create } from 'zustand'

const usePortfolioStore = create((set) => ({
  trades: [],
  summary: null,
  setTrades: (trades) => set({ trades }),
  setSummary: (summary) => set({ summary }),
  clearAll: () => set({ trades: [], summary: null }),
}))

export { usePortfolioStore }
export default usePortfolioStore
