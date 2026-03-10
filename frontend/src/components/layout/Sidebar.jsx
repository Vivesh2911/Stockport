import { NavLink } from 'react-router-dom'
import { LayoutDashboard, TrendingUp, ShieldAlert, Upload } from 'lucide-react'

const links = [
  { to: '/', icon: Upload, label: 'Upload' },
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/performance', icon: TrendingUp, label: 'Performance' },
  { to: '/risk', icon: ShieldAlert, label: 'Risk Analysis' },
]

export default function Sidebar() {
  return (
    <aside className="w-56 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-5 border-b border-gray-100">
        <span className="text-xl font-bold text-blue-700">📈 SmartPort</span>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
              }`}>
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 text-xs text-gray-400 border-t border-gray-100">SmartPort v1.0.0</div>
    </aside>
  )
}
