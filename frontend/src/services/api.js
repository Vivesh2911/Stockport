import axios from 'axios'

const api = axios.create({ baseURL: 'http://localhost:8000' })

export const uploadCSV = (formData) =>
  api.post('/upload/csv', formData, { headers: { 'Content-Type': 'multipart/form-data' } })

export const getPortfolioSummary = () => api.get('/portfolio/summary')
export const getPortfolioAllocation = () => api.get('/portfolio/allocation')
export const getPerformanceReturns = () => api.get('/performance/returns')
export const getBenchmark = () => api.get('/performance/benchmark')
export const getRiskMetrics = () => api.get('/risk/metrics')
export const getStockDetail = (ticker, period = '6mo') => api.get(`/stocks/${ticker}?period=${period}`)

export default api
