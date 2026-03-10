import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { getStockDetail } from '../services/api'
import usePortfolioStore from '../store/portfolioStore'
import LoadingSpinner from '../components/shared/LoadingSpinner'
import { ArrowLeft } from 'lucide-react'

export default function StockDetail() {
  const { ticker } = useParams()
  const navigate = useNavigate()
  const { trades } = usePortfolioStore()
  const [candles, setCandles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getStockDetail(ticker).then(r => setCandles(r.data.candles.slice(-90))).finally(() => setLoading(false))
  }, [ticker])

  if (loading) return <LoadingSpinner message={`Loading ${ticker} data...`} />

  const stockTrades = trades.filter(t => t.ticker === ticker)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/portfolio')} className="text-slate-400 hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-2xl font-bold text-white">{ticker} — Stock Detail</h2>
      </div>

      <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
        <h3 className="text-white font-semibold mb-4">Price Chart (Last 90 Days)</h3>
        <ResponsiveContainer width="100%" height={350}>
          <ComposedChart data={candles}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={d => d?.slice(5)} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} domain={['auto', 'auto']} />
            <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155' }} />
            <Bar dataKey="volume" fill="#334155" opacity={0.5} yAxisId={0} />
            <Line type="monotone" dataKey="close" stroke="#3b82f6" dot={false} strokeWidth={2} name="Close Price" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
        <h3 className="text-white font-semibold mb-4">Your Trades in {ticker}</h3>
        {stockTrades.length === 0 ? (
          <p className="text-slate-400">No trades found for this ticker.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-slate-400">
              <tr>
                {['Date', 'Action', 'Qty', 'Price', 'Value', 'Fees'].map(h => (
                  <th key={h} className="text-left pb-3 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stockTrades.map((t, i) => (
                <tr key={i} className="border-t border-slate-700">
                  <td className="py-2 text-slate-300">{t.date}</td>
                  <td className={"py-2 font-medium " + (t.action === 'buy' ? 'text-green-400' : 'text-red-400')}>{t.action.toUpperCase()}</td>
                  <td className="py-2 text-slate-300">{t.quantity}</td>
                  <td className="py-2 text-white">${t.price}</td>
                  <td className="py-2 text-slate-300">${(t.quantity * t.price).toFixed(2)}</td>
                  <td className="py-2 text-slate-500">${t.fees}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
