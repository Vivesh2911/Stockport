import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import Papa from 'papaparse'
import toast from 'react-hot-toast'
import { usePortfolioStore } from '../store/portfolioStore'
import { uploadCSV } from '../services/api'

const KNOWN_FIELDS = ['date', 'ticker', 'symbol', 'action', 'type', 'side', 'quantity', 'qty', 'shares', 'price', 'amount', 'value']
const REQUIRED_TARGETS = ['date', 'ticker', 'action', 'quantity', 'price']

const TARGET_LABELS = {
  date: 'Trade Date',
  ticker: 'Stock Symbol / Ticker',
  action: 'Buy / Sell Action',
  quantity: 'Quantity / Shares',
  price: 'Price per Share',
}

function guessMapping(columns) {
  const mapping = {}
  const lower = columns.map(c => c.toLowerCase().trim())
  REQUIRED_TARGETS.forEach(target => {
    const aliases = {
      date: ['date', 'trade_date', 'transaction_date', 'time', 'datetime', 'order_date'],
      ticker: ['ticker', 'symbol', 'stock', 'scrip', 'instrument', 'security', 'name'],
      action: ['action', 'type', 'side', 'trade_type', 'transaction_type', 'order_type', 'buysell', 'buy/sell'],
      quantity: ['quantity', 'qty', 'shares', 'units', 'volume', 'no_of_shares', 'amount_of_shares'],
      price: ['price', 'rate', 'avg_price', 'average_price', 'trade_price', 'execution_price', 'cost'],
    }
    const found = lower.findIndex(c => aliases[target].some(a => c.includes(a)))
    if (found !== -1) mapping[target] = columns[found]
  })
  return mapping
}

export default function Home() {
  const [step, setStep] = useState('upload') // upload | map | loading
  const [columns, setColumns] = useState([])
  const [rawRows, setRawRows] = useState([])
  const [mapping, setMapping] = useState({})
  const [file, setFile] = useState(null)
  const { setTrades } = usePortfolioStore()
  const navigate = useNavigate()

  const onDrop = useCallback((files) => {
    const f = files[0]
    if (!f) return
    setFile(f)
    Papa.parse(f, {
      header: true, skipEmptyLines: true,
      complete: (result) => {
        const cols = result.meta.fields || []
        setColumns(cols)
        setRawRows(result.data.slice(0, 3))
        setMapping(guessMapping(cols))
        setStep('map')
      }
    })
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'text/csv': ['.csv'], 'application/vnd.ms-excel': ['.csv'] }, multiple: false
  })

  const handleConfirm = async () => {
    const missing = REQUIRED_TARGETS.filter(t => !mapping[t])
    if (missing.length) { toast.error(`Please map: ${missing.join(', ')}`); return }
    setStep('loading')
    try {
      // Remap columns and send
      const remapped = rawRows.length > 0 ? rawRows.map(row => {
        const out = {}
        REQUIRED_TARGETS.forEach(t => { out[t] = row[mapping[t]] })
        return out
      }) : []

      // Upload original file — backend will use mapping
      const formData = new FormData()
      formData.append('file', file)
      REQUIRED_TARGETS.forEach(t => formData.append(t, mapping[t]))
      const res = await uploadCSV(formData)
      setTrades(res.data.trades)
      toast.success(`✓ ${res.data.trade_count} trades loaded!`)
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Upload failed.')
      setStep('map')
    }
  }

  return (
    <div className="min-h-screen grid-bg flex flex-col items-center justify-center px-4 py-12">
      {/* Header */}
      <div className="text-center mb-10 animate-fade-up">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs mono mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse-blue inline-block"/>
          SMARTPORT v1.0
        </div>
        <h1 className="text-5xl font-bold tracking-tight mb-3">
          <span className="text-white">Stock Portfolio</span><br/>
          <span className="text-blue-400">Intelligence</span>
        </h1>
        <p className="text-slate-400 text-lg max-w-md mx-auto">Upload any CSV — we'll figure out the columns and give you deep analytics instantly.</p>
      </div>

      <div className="w-full max-w-2xl animate-fade-up" style={{ animationDelay: '0.1s' }}>
        {step === 'upload' && (
          <div {...getRootProps()} className={`card p-10 text-center cursor-pointer transition-all duration-300 ${
            isDragActive ? 'border-blue-500/60 bg-blue-500/5 glow' : 'hover:border-blue-500/30'
          }`}>
            <input {...getInputProps()} />
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
              </svg>
            </div>
            <p className="text-xl font-semibold text-white mb-2">
              {isDragActive ? 'Drop it here' : 'Drop your CSV here'}
            </p>
            <p className="text-slate-400 text-sm mb-5">Works with any broker — Zerodha, Robinhood, Fidelity, custom exports</p>
            <span className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors">Browse File</span>
          </div>
        )}

        {step === 'map' && (
          <div className="card p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-green-500/20 border border-green-500/30 flex items-center justify-center">
                <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              <div>
                <p className="font-semibold text-white text-sm">{file?.name}</p>
                <p className="text-xs text-slate-400">{columns.length} columns detected — map them below</p>
              </div>
            </div>

            {/* Preview */}
            <div className="mb-6 overflow-x-auto rounded-lg border border-slate-700/50">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-700/50">
                    {columns.slice(0,6).map(c => (
                      <th key={c} className="px-3 py-2 text-left text-slate-400 mono font-normal">{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rawRows.slice(0,2).map((row, i) => (
                    <tr key={i} className="border-b border-slate-800/50">
                      {columns.slice(0,6).map(c => (
                        <td key={c} className="px-3 py-2 text-slate-300 mono">{String(row[c] ?? '').slice(0,15)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mapping */}
            <p className="text-sm font-medium text-slate-300 mb-4">Map your columns to required fields:</p>
            <div className="space-y-3 mb-6">
              {REQUIRED_TARGETS.map(target => (
                <div key={target} className="flex items-center gap-4">
                  <div className="w-40 shrink-0">
                    <span className={`text-xs px-2 py-1 rounded mono ${mapping[target] ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                      {target}
                    </span>
                    <p className="text-xs text-slate-500 mt-1 pl-1">{TARGET_LABELS[target]}</p>
                  </div>
                  <svg className="w-4 h-4 text-slate-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                  </svg>
                  <select
                    value={mapping[target] || ''}
                    onChange={e => setMapping(m => ({ ...m, [target]: e.target.value }))}
                    className="flex-1 bg-slate-800/80 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-slate-200 mono focus:outline-none focus:border-blue-500/50"
                  >
                    <option value="">— select column —</option>
                    {columns.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep('upload')} className="px-4 py-2.5 rounded-lg border border-slate-700/50 text-slate-400 text-sm hover:border-slate-600 transition-colors">
                ← Back
              </button>
              <button onClick={handleConfirm} className="flex-1 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-colors">
                Analyze Portfolio →
              </button>
            </div>
          </div>
        )}

        {step === 'loading' && (
          <div className="card p-16 text-center">
            <div className="w-12 h-12 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"/>
            <p className="text-white font-semibold">Analyzing your portfolio...</p>
            <p className="text-slate-400 text-sm mt-1">Fetching live prices & computing metrics</p>
          </div>
        )}
      </div>

      {/* Supported formats */}
      <div className="mt-8 flex flex-wrap justify-center gap-2 animate-fade-up" style={{ animationDelay: '0.2s' }}>
        {['Zerodha', 'Robinhood', 'Fidelity', 'Schwab', 'HDFC Sec', 'Any Custom CSV'].map(b => (
          <span key={b} className="px-3 py-1 rounded-full text-xs text-slate-400 border border-slate-700/50 bg-slate-800/30">{b}</span>
        ))}
      </div>
    </div>
  )
}
