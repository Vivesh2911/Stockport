import { usePortfolioStore } from '../../store/portfolioStore'
export default function Topbar() {
  const { trades } = usePortfolioStore()
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <h1 className="text-base font-semibold text-gray-700">Stock Portfolio Analyzer</h1>
      <span className="text-sm text-gray-500">
        {trades.length > 0 ? `${trades.length} trades loaded` : 'No data — upload a CSV to begin'}
      </span>
    </header>
  )
}
