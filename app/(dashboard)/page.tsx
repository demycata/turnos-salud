import Link from 'next/link'
import {
  Users, CalendarDays, CalendarPlus, UserPlus,
  Clock, CheckCircle2,
} from 'lucide-react'
import { getAppointments } from '@/lib/supabase'
import { createClient } from '@/lib/supabase-server'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { STATUS_LABELS, STATUS_COLORS, type Appointment } from '@/lib/types'
import clsx from 'clsx'

async function getDashboardData() {
  const today = format(new Date(), 'yyyy-MM-dd')
  const supabase = await createClient()

  const [
    { count: totalPatients },
    { count: totalAppts },
    todayAppts,
  ] = await Promise.all([
    supabase.from('patients').select('*', { count: 'exact', head: true }),
    supabase.from('appointments').select('*', { count: 'exact', head: true }),
    getAppointments({ date: today }),
  ])

  return { totalPatients, totalAppts, todayAppts: todayAppts || [] }
}

export default async function DashboardPage() {
  const { totalPatients, totalAppts, todayAppts } = await getDashboardData()
  const today = new Date()

  const pending = todayAppts.filter((a: Appointment) => a.status === 'pending').length
  const done = todayAppts.filter((a: Appointment) => a.status === 'done').length

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <p className="text-sm text-slate-500 font-medium capitalize">
          {format(today, "EEEE d 'de' MMMM, yyyy", { locale: es })}
        </p>
        <h1 className="text-2xl font-semibold text-slate-900 font-display mt-0.5">
          Panel de control
        </h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Link href="/patients/new" className="card p-5 flex items-center gap-4 hover:shadow-card-hover transition-shadow group">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
            <UserPlus className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <p className="font-semibold text-slate-800 text-sm">Nuevo paciente</p>
            <p className="text-xs text-slate-400">Registrar un paciente nuevo</p>
          </div>
        </Link>
        <Link href="/appointments/new" className="card p-5 flex items-center gap-4 hover:shadow-card-hover transition-shadow group">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
            <CalendarPlus className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="font-semibold text-slate-800 text-sm">Nuevo turno</p>
            <p className="text-xs text-slate-400">Agendar una nueva consulta</p>
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Pacientes', value: totalPatients ?? 0, icon: Users, color: 'text-indigo-600 bg-indigo-50' },
          { label: 'Turnos totales', value: totalAppts ?? 0, icon: CalendarDays, color: 'text-blue-600 bg-blue-50' },
          { label: 'Hoy pendientes', value: pending, icon: Clock, color: 'text-amber-600 bg-amber-50' },
          { label: 'Hoy realizados', value: done, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-5">
            <div className={clsx('w-9 h-9 rounded-xl flex items-center justify-center mb-3', color)}>
              <Icon className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-800">Turnos de hoy</h2>
          <Link href="/appointments" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
            Ver todos →
          </Link>
        </div>
        {todayAppts.length === 0 ? (
          <div className="py-16 text-center">
            <CalendarDays className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-sm text-slate-400">No hay turnos para hoy</p>
            <Link href="/appointments/new" className="btn-primary mt-4 inline-flex">
              <CalendarPlus className="w-4 h-4" /> Agendar turno
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {todayAppts.map((appt: Appointment & { patient: any }) => (
              <div key={appt.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="text-center w-12 shrink-0">
                    <p className="text-sm font-semibold text-slate-800">
                      {format(new Date(appt.scheduled_at), 'HH:mm')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">{appt.patient?.full_name}</p>
                    <p className="text-xs text-slate-400">{appt.service ?? 'Sin servicio'}</p>
                  </div>
                </div>
                <span className={clsx('badge-status', STATUS_COLORS[appt.status])}>
                  {STATUS_LABELS[appt.status]}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
