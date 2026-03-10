import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts'
import { getBenchmark, getCalendar } from '../services/api'
import usePortfolioStore from '../store/portfolioStore'
import LoadingSpinner from '../components/shared/LoadingSpinner'

export default function Performance() {
  const { trades } = usePortfolioStore()
  const navigate = useNavigate()
  const [benchmark, setBenchmark] = useState([])
  const [calendar, setCalendar] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!trades.length) { navigate('/'); return }
    Promise.all([getBenchmark(trades), getCalendar(trades)]).then(([b, c]) => {
      setBenchmark(b.data.benchmark)
      setCalendar(c.data.calendar)
    }).finally(() => setLoading(false))
  }, [trades])

  if (loading) return <LoadingSpinner message="Calculating performance..." />

  const getCalendarColor = (val) => {
    if (val == null) return 'bg-slate-700'
    if (val > 5) return 'bg-green-500'
    if (val > 0) return 'bg-green-700'
    if (val > -5) return 'bg-red-700'
    return 'bg-red-500'
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Performance</h2>
      <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
        <h3 className="text-white font-semibold mb-4">Portfolio vs S&P 500 (% Return)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={benchmark}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={d => d?.slice(0, 7)} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={v => v + '%'} />
            <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155' }} formatter={(v) => [v + '%']} />
            <Legend />
            <Line type="monotone" dataKey="portfolio" stroke="#3b82f6" dot={false} name="My Portfolio" strokeWidth={2} />
            <Line type="monotone" dataKey="sp500" stroke="#f59e0b" dot={false} name="S&P 500" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
        <h3 className="text-white font-semibold mb-4">Monthly Returns Heatmap</h3>
        <div className="flex flex-wrap gap-2">
          {calendar.map(({ month, return_pct }) => (
            <div key={month} className={"rounded-lg p-3 text-center min-w-[80px] " + getCalendarColor(return_pct)}>
              <p className="text-white text-xs font-medium">{month}</p>
              <p className="text-white text-sm font-bold">{return_pct >= 0 ? '+' : ''}{return_pct}%</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
