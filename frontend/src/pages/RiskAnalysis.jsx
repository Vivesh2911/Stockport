import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { getRiskMetrics, getCorrelation, getDrawdown } from '../services/api'
import usePortfolioStore from '../store/portfolioStore'
import MetricCard from '../components/cards/MetricCard'
import LoadingSpinner from '../components/shared/LoadingSpinner'
import { ShieldAlert, Activity, TrendingDown } from 'lucide-react'

export default function RiskAnalysis() {
  const { trades } = usePortfolioStore()
  const navigate = useNavigate()
  const [metrics, setMetrics] = useState(null)
  const [corr, setCorr] = useState(null)
  const [drawdown, setDrawdown] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!trades.length) { navigate('/'); return }
    Promise.all([getRiskMetrics(trades), getCorrelation(trades), getDrawdown(trades)]).then(([m, c, d]) => {
      setMetrics(m.data)
      setCorr(c.data)
      setDrawdown(d.data.drawdown)
    }).finally(() => setLoading(false))
  }, [trades])

  if (loading) return <LoadingSpinner message="Running risk analysis..." />

  const getCorrColor = (val) => {
    const abs = Math.abs(val)
    if (abs > 0.8) return '#ef4444'
    if (abs > 0.5) return '#f59e0b'
    return '#10b981'
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Risk Analysis</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard title="Sharpe Ratio" value={metrics?.sharpe ?? '—'} sub={metrics?.description?.sharpe} icon={Activity} color="blue" />
        <MetricCard title="Portfolio Beta" value={metrics?.beta ?? '—'} sub={metrics?.description?.beta} icon={ShieldAlert} color="yellow" />
        <MetricCard title="Value at Risk (95%)" value={metrics?.var_95 != null ? metrics.var_95 + '%' : '—'} sub={metrics?.description?.var_95} icon={TrendingDown} color="red" />
      </div>

      <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
        <h3 className="text-white font-semibold mb-4">Portfolio Drawdown Over Time</h3>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={drawdown}>
            <defs>
              <linearGradient id="ddGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={d => d?.slice(0, 7)} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={v => v + '%'} />
            <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155' }} formatter={(v) => [v + '%', 'Drawdown']} />
            <Area type="monotone" dataKey="drawdown" stroke="#ef4444" fill="url(#ddGrad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {corr && corr.tickers?.length > 0 && (
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
          <h3 className="text-white font-semibold mb-4">Correlation Matrix</h3>
          <p className="text-slate-400 text-xs mb-4">High correlation = stocks move together = less diversification</p>
          <div className="overflow-x-auto">
            <table className="text-xs">
              <thead>
                <tr>
                  <th className="p-2"></th>
                  {corr.tickers.map(t => <th key={t} className="p-2 text-slate-300">{t}</th>)}
                </tr>
              </thead>
              <tbody>
                {corr.matrix.map((row, i) => (
                  <tr key={i}>
                    <td className="p-2 text-slate-300 font-medium">{corr.tickers[i]}</td>
                    {row.map((val, j) => (
                      <td key={j} className="p-2 text-center rounded font-medium"
                        style={{ backgroundColor: getCorrColor(val) + '33', color: getCorrColor(val) }}>
                        {val.toFixed(2)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
