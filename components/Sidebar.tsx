'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Heart,
  Menu,
  X,
  LogOut,
  DollarSign,
} from 'lucide-react'
import { useState } from 'react'
import clsx from 'clsx'
import { createClient } from '@/lib/supabase-browser'

const NAV = [
  { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/patients', icon: Users, label: 'Pacientes' },
  { href: '/appointments', icon: CalendarDays, label: 'Turnos' },
  { href: '/prices', icon: DollarSign, label: 'Precios' },
]

export default function Sidebar({ userEmail }: { userEmail?: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside
      className={clsx(
        'flex flex-col h-full bg-slate-900 transition-all duration-300 ease-in-out shrink-0',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-slate-800">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-white font-semibold text-sm font-display tracking-tight">
              Salud<span className="text-indigo-400">Turnos</span>
            </span>
          </div>
        )}
        {collapsed && (
          <div className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center mx-auto">
            <Heart className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={clsx(
            'text-slate-400 hover:text-white transition-colors p-1 rounded-md hover:bg-slate-800',
            collapsed && 'mx-auto mt-2'
          )}
        >
          {collapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                active
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100',
                collapsed && 'justify-center px-2'
              )}
              title={collapsed ? label : undefined}
            >
              <Icon className="w-4 h-4 shrink-0" strokeWidth={1.75} />
              {!collapsed && label}
            </Link>
          )
        })}
      </nav>

      {/* Footer / user */}
      <div className="px-2 py-3 border-t border-slate-800">
        {!collapsed && userEmail && (
          <div className="px-3 py-2 mb-1">
            <p className="text-xs text-slate-500 truncate">{userEmail}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={clsx(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium w-full text-left transition-all duration-150 text-slate-400 hover:bg-slate-800 hover:text-red-400',
            collapsed && 'justify-center px-2'
          )}
          title={collapsed ? 'Cerrar sesion' : undefined}
        >
          <LogOut className="w-4 h-4 shrink-0" strokeWidth={1.75} />
          {!collapsed && 'Cerrar sesion'}
        </button>
      </div>
    </aside>
  )
}
