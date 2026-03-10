import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getPortfolioSummary } from '../services/api'
import usePortfolioStore from '../store/portfolioStore'
import LoadingSpinner from '../components/shared/LoadingSpinner'

export default function Portfolio() {
  const { trades } = usePortfolioStore()
  const navigate = useNavigate()
  const [holdings, setHoldings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!trades.length) { navigate('/'); return }
    getPortfolioSummary(trades).then(r => setHoldings(r.data.holdings)).finally(() => setLoading(false))
  }, [trades])

  if (loading) return <LoadingSpinner message="Loading holdings..." />

  const fmt = (n) => `$${Number(n).toLocaleString('en', { minimumFractionDigits: 2 })}`

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Portfolio Holdings</h2>
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-700 text-slate-300">
            <tr>
              {['Ticker', 'Qty', 'Avg Cost', 'CMP', 'Invested', 'Current Value', 'P&L', 'P&L %'].map(h => (
                <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {holdings.map((h, i) => (
              <tr
                key={h.ticker}
                onClick={() => navigate(`/stocks/${h.ticker}`)}
                className={`border-t border-slate-700 cursor-pointer hover:bg-slate-700 transition-colors ${i % 2 === 0 ? '' : 'bg-slate-800/50'}`}
              >
                <td className="px-4 py-3 font-semibold text-blue-400">{h.ticker}</td>
                <td className="px-4 py-3 text-slate-300">{h.qty}</td>
                <td className="px-4 py-3 text-slate-300">{fmt(h.avg_cost)}</td>
                <td className="px-4 py-3 text-white">{fmt(h.cmp)}</td>
                <td className="px-4 py-3 text-slate-300">{fmt(h.invested)}</td>
                <td className="px-4 py-3 text-white">{fmt(h.current_value)}</td>
                <td className={`px-4 py-3 font-medium ${h.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>{fmt(h.pnl)}</td>
                <td className={`px-4 py-3 font-medium ${h.pnl_pct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {h.pnl_pct >= 0 ? '+' : ''}{h.pnl_pct}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-slate-500 text-xs">Click any row to view stock detail & candlestick chart</p>
    </div>
  )
}
