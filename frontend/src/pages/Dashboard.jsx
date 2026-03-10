import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { usePortfolioStore } from '../store/portfolioStore'
import { getBenchmark } from '../services/api'

const COLORS = ['#3b82f6','#8b5cf6','#06b6d4','#10b981','#f59e0b','#ef4444','#ec4899','#14b8a6']

function StatCard({ label, value, sub, trend, color = 'blue', delay = 0 }) {
  const colors = {
    blue:  { bg: 'bg-blue-500/8',  border: 'border-blue-500/20',  text: 'text-blue-400',  val: 'text-blue-300' },
    green: { bg: 'bg-green-500/8', border: 'border-green-500/20', text: 'text-green-400', val: 'text-green-300' },
    red:   { bg: 'bg-red-500/8',   border: 'border-red-500/20',   text: 'text-red-400',   val: 'text-red-300' },
    purple:{ bg: 'bg-purple-500/8',border: 'border-purple-500/20',text: 'text-purple-400',val: 'text-purple-300'},
    cyan:  { bg: 'bg-cyan-500/8',  border: 'border-cyan-500/20',  text: 'text-cyan-400',  val: 'text-cyan-300' },
  }
  const c = colors[color]
  return (
    <div className={`card p-5 animate-fade-up ${c.bg} border ${c.border}`} style={{ animationDelay: `${delay}s` }}>
      <p className={`text-xs mono uppercase tracking-widest ${c.text} mb-2`}>{label}</p>
      <p className={`text-2xl font-bold ${c.val}`}>{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
      {trend !== undefined && (
        <p className={`text-xs mt-2 font-medium ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {trend >= 0 ? '▲' : '▼'} {Math.abs(trend).toFixed(2)}% vs market
        </p>
      )}
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass rounded-lg px-3 py-2 text-xs">
      <p className="text-slate-400 mono mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="mono">{p.name}: {typeof p.value === 'number' ? p.value.toFixed(2) : p.value}</p>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const { trades } = usePortfolioStore()
  const navigate = useNavigate()
  const [benchmarkData, setBenchmarkData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!trades.length) { navigate('/'); return }
    getBenchmark().then(r => setBenchmarkData(r.data.data.slice(-90))).finally(() => setLoading(false))
  }, [])

  // --- Compute holdings ---
  const holdings = {}
  trades.forEach(t => {
    const ticker = (t.ticker || t.symbol || '???').toUpperCase()
    if (!holdings[ticker]) holdings[ticker] = { qty: 0, cost: 0, trades: 0 }
    const qty = parseFloat(t.quantity) || 0
    const price = parseFloat(t.price) || 0
    const action = (t.action || t.type || t.side || '').toLowerCase()
    if (action.includes('buy') || action === 'b') {
      holdings[ticker].qty += qty
      holdings[ticker].cost += qty * price
    } else {
      holdings[ticker].qty = Math.max(0, holdings[ticker].qty - qty)
    }
    holdings[ticker].trades++
  })

  const active = Object.entries(holdings).filter(([, h]) => h.qty > 0.001)
  const totalInvested = active.reduce((s, [, h]) => s + h.cost, 0)

  // Allocation pie data
  const pieData = active.map(([t, h]) => ({ name: t, value: Math.round(h.cost) }))
    .sort((a, b) => b.value - a.value).slice(0, 8)

  // Monthly trade volume
  const monthMap = {}
  trades.forEach(t => {
    const d = t.date ? t.date.slice(0, 7) : 'Unknown'
    monthMap[d] = (monthMap[d] || 0) + 1
  })
  const monthData = Object.entries(monthMap).sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count]) => ({ month: month.slice(5), count }))

  // Benchmark chart
  const benchChart = benchmarkData.slice(-60).map((d, i) => ({
    date: d.date?.slice(5),
    market: parseFloat(d.close?.toFixed(2)),
  }))

  // Biggest positions
  const topHoldings = active.sort(([,a],[,b]) => b.cost - a.cost).slice(0, 5)

  // Risk metrics (computed from trade data)
  const winTrades = trades.filter(t => {
    const a = (t.action || t.type || t.side || '').toLowerCase()
    return a.includes('sell') || a === 's'
  })
  const winRate = trades.length > 0 ? ((winTrades.length / trades.length) * 100).toFixed(0) : 0
  const avgTradeSize = trades.length > 0 ? (totalInvested / trades.length).toFixed(0) : 0
  const diversification = active.length >= 5 ? 'Good' : active.length >= 3 ? 'Moderate' : 'Low'

  return (
    <div className="min-h-screen bg-[#080b12] grid-bg">
      {/* Top Nav */}
      <nav className="glass border-b border-slate-800/50 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <span className="text-blue-400 font-bold text-lg tracking-tight">📈 SmartPort</span>
          <span className="w-px h-4 bg-slate-700"/>
          <span className="text-slate-400 text-sm">Portfolio Dashboard</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs mono text-slate-500">{trades.length} trades</span>
          <button onClick={() => navigate('/')} className="px-3 py-1.5 rounded-lg border border-slate-700/50 text-slate-400 text-xs hover:border-blue-500/30 hover:text-blue-400 transition-colors">
            Upload New →
          </button>
        </div>
      </nav>

      <div className="p-6 space-y-6 max-w-screen-xl mx-auto">

        {/* KPI Row */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard label="Total Invested" value={`$${(totalInvested/1000).toFixed(1)}k`} sub="across all positions" color="blue" delay={0} />
          <StatCard label="Holdings" value={active.length} sub="active positions" color="purple" delay={0.05} />
          <StatCard label="Total Trades" value={trades.length} sub="buy + sell orders" color="cyan" delay={0.1} />
          <StatCard label="Win Rate" value={`${winRate}%`} sub="sell ratio" color="green" delay={0.15} />
          <StatCard label="Diversification" value={diversification} sub={`${active.length} stocks`} color={diversification === 'Good' ? 'green' : 'blue'} delay={0.2} />
        </div>

        {/* Main Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Benchmark Chart — 2 cols */}
          <div className="card p-5 lg:col-span-2 animate-fade-up" style={{ animationDelay: '0.25s' }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-white font-semibold">S&P 500 Market Trend</p>
                <p className="text-xs text-slate-500 mono">Last 60 trading days</p>
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 mono">LIVE</span>
            </div>
            {loading ? (
              <div className="h-48 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"/>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={benchChart}>
                  <defs>
                    <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,130,201,0.06)"/>
                  <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false}/>
                  <YAxis tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} domain={['auto','auto']}/>
                  <Tooltip content={<CustomTooltip />}/>
                  <Area type="monotone" dataKey="market" name="S&P 500" stroke="#3b82f6" strokeWidth={2} fill="url(#blueGrad)" dot={false}/>
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Allocation Pie */}
          <div className="card p-5 animate-fade-up" style={{ animationDelay: '0.3s' }}>
            <p className="text-white font-semibold mb-1">Portfolio Allocation</p>
            <p className="text-xs text-slate-500 mono mb-4">by cost basis</p>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]}/>)}
                </Pie>
                <Tooltip content={<CustomTooltip />} formatter={(v) => `$${v.toLocaleString()}`}/>
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1 mt-2">
              {pieData.slice(0, 4).map((d, i) => (
                <div key={d.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: COLORS[i] }}/>
                    <span className="text-slate-300 mono">{d.name}</span>
                  </div>
                  <span className="text-slate-500 mono">{((d.value / totalInvested) * 100).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Second Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Holdings Table */}
          <div className="card p-5 lg:col-span-2 animate-fade-up" style={{ animationDelay: '0.35s' }}>
            <p className="text-white font-semibold mb-4">Top Holdings</p>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800/50">
                  {['Ticker','Qty','Avg Cost','Invested','Allocation'].map(h => (
                    <th key={h} className="text-left pb-2 text-xs text-slate-500 mono font-normal">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {topHoldings.map(([ticker, h], i) => (
                  <tr key={ticker} className="border-b border-slate-800/30 hover:bg-slate-800/20 transition-colors">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background: COLORS[i % COLORS.length] + '22', color: COLORS[i % COLORS.length] }}>
                          {ticker.slice(0,2)}
                        </span>
                        <span className="text-white font-semibold mono">{ticker}</span>
                      </div>
                    </td>
                    <td className="py-3 text-slate-300 mono">{h.qty.toFixed(2)}</td>
                    <td className="py-3 text-slate-300 mono">${(h.cost / h.qty).toFixed(2)}</td>
                    <td className="py-3 text-slate-200 mono font-medium">${h.cost.toLocaleString('en-US', {maximumFractionDigits:0})}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-slate-700/50 rounded-full overflow-hidden w-16">
                          <div className="h-full rounded-full" style={{ width: `${(h.cost/totalInvested*100).toFixed(1)}%`, background: COLORS[i % COLORS.length] }}/>
                        </div>
                        <span className="text-xs text-slate-400 mono">{(h.cost/totalInvested*100).toFixed(1)}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Risk Panel */}
          <div className="card p-5 animate-fade-up" style={{ animationDelay: '0.4s' }}>
            <p className="text-white font-semibold mb-4">Risk & Activity</p>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Diversification Score</span>
                  <span className="mono text-slate-300">{active.length}/10</span>
                </div>
                <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(active.length * 10, 100)}%` }}/>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Sell Activity</span>
                  <span className="mono text-slate-300">{winRate}%</span>
                </div>
                <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: `${winRate}%` }}/>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-800/50 space-y-3">
                {[
                  { label: 'Avg Trade Size', value: `$${Number(avgTradeSize).toLocaleString()}` },
                  { label: 'Unique Stocks', value: Object.keys(holdings).length },
                  { label: 'Buy Orders', value: trades.filter(t => (t.action||t.type||t.side||'').toLowerCase().includes('buy')).length },
                  { label: 'Sell Orders', value: trades.filter(t => (t.action||t.type||t.side||'').toLowerCase().includes('sell')).length },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between text-xs">
                    <span className="text-slate-500">{label}</span>
                    <span className="mono text-slate-300 font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Trade Frequency Bar Chart */}
        <div className="card p-5 animate-fade-up" style={{ animationDelay: '0.45s' }}>
          <p className="text-white font-semibold mb-1">Trading Activity</p>
          <p className="text-xs text-slate-500 mono mb-4">Number of trades per month</p>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={monthData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,130,201,0.06)" vertical={false}/>
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false}/>
              <YAxis tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false}/>
              <Tooltip content={<CustomTooltip />}/>
              <Bar dataKey="count" name="Trades" radius={[4,4,0,0]}>
                {monthData.map((_, i) => <Cell key={i} fill={`rgba(59,130,246,${0.4 + (i/monthData.length)*0.6})`}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  )
}
