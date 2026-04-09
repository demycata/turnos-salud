import Link from 'next/link'
import { CalendarPlus, Filter } from 'lucide-react'
import { getAppointments } from '@/lib/supabase'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { STATUS_LABELS, STATUS_COLORS, type Appointment, type AppointmentStatus } from '@/lib/types'
import clsx from 'clsx'

export const dynamic = 'force-dynamic'

const ALL_STATUSES: { value: string; label: string }[] = [
  { value: '', label: 'Todos' },
  { value: 'pending', label: 'Pendientes' },
  { value: 'done', label: 'Realizados' },
  { value: 'cancelled', label: 'Cancelados' },
  { value: 'no_show', label: 'Ausentes' },
]

export default async function AppointmentsPage({
  searchParams,
}: {
  searchParams: { date?: string; status?: string }
}) {
  const appointments = await getAppointments({
    date: searchParams.date,
    status: searchParams.status,
  })

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 font-display">Turnos</h1>
          <p className="text-sm text-slate-400 mt-0.5">{appointments.length} turnos encontrados</p>
        </div>
        <Link href="/appointments/new" className="btn-primary">
          <CalendarPlus className="w-4 h-4" /> Nuevo turno
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <form className="flex items-center gap-2">
          <input
            name="date"
            type="date"
            defaultValue={searchParams.date}
            className="input-field w-44"
          />
          <select name="status" defaultValue={searchParams.status} className="input-field w-40">
            {ALL_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          <button type="submit" className="btn-secondary">
            <Filter className="w-4 h-4" /> Filtrar
          </button>
          <Link href="/appointments" className="btn-secondary text-slate-400">Limpiar</Link>
        </form>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {appointments.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-slate-400">No se encontraron turnos</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left">
                  {['Fecha y hora', 'Paciente', 'Servicio', 'Profesional', 'Estado', ''].map((h) => (
                    <th key={h} className="px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {appointments.map((appt: Appointment & { patient: any }) => (
                  <tr key={appt.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <p className="font-medium text-slate-800">
                        {format(new Date(appt.scheduled_at), 'dd/MM/yyyy')}
                      </p>
                      <p className="text-xs text-slate-400">
                        {format(new Date(appt.scheduled_at), 'HH:mm')}hs
                      </p>
                    </td>
                    <td className="px-5 py-3.5">
                      <Link
                        href={`/patients/${appt.patient_id}`}
                        className="font-medium text-slate-800 hover:text-indigo-600 transition-colors"
                      >
                        {appt.patient?.full_name}
                      </Link>
                      {appt.patient?.phone && (
                        <p className="text-xs text-slate-400">{appt.patient.phone}</p>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">{appt.service ?? '—'}</td>
                    <td className="px-5 py-3.5 text-slate-600">{appt.professional ?? '—'}</td>
                    <td className="px-5 py-3.5">
                      <span className={clsx('badge-status', STATUS_COLORS[appt.status])}>
                        {STATUS_LABELS[appt.status]}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        href={`/appointments/${appt.id}/edit`}
                        className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                      >
                        Editar
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
