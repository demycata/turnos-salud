'use client'

import { useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { updateAppointment } from '@/lib/supabase-client'
import { STATUS_LABELS, STATUS_COLORS, type Appointment } from '@/lib/types'
import clsx from 'clsx'

export default function PatientAppointmentsOverview({
  upcoming,
  history,
}: {
  upcoming: Appointment[]
  history: Appointment[]
}) {
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>(upcoming)
  const [historyAppointments, setHistoryAppointments] = useState<Appointment[]>(history)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [detailText, setDetailText] = useState('')
  const [internalNotes, setInternalNotes] = useState('')
  const [savingId, setSavingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  function startEditing(appt: Appointment) {
    setEditingId(appt.id)
    setDetailText(appt.description ?? '')
    setInternalNotes(appt.internal_notes ?? '')
    setError(null)
  }

  async function handleFinishAppointment(id: string) {
    if (!detailText.trim()) {
      setError('Agregá el detalle clínico antes de finalizar el turno.')
      return
    }

    setSavingId(id)
    setError(null)

    try {
      const updated = await updateAppointment(id, {
        status: 'done',
        description: detailText.trim(),
        internal_notes: internalNotes.trim() || null,
      })

      setUpcomingAppointments((current) => current.filter((appt) => appt.id !== id))
      setHistoryAppointments((current) => [updated as Appointment, ...current])
      setEditingId(null)
    } catch (err: any) {
      setError(err?.message ?? 'Ocurrió un error al finalizar el turno.')
    } finally {
      setSavingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">Turnos actuales</h2>
          <p className="text-sm text-slate-500 mt-1">Aquí ves los turnos próximos y podés cargar el detalle del resultado.</p>
        </div>
        {upcomingAppointments.length === 0 ? (
          <p className="px-6 py-8 text-sm text-slate-400 text-center">No tiene turnos futuros</p>
        ) : (
          <div className="divide-y divide-slate-50">
            {upcomingAppointments.map((appt) => (
              <div key={appt.id} className="px-6 py-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="text-center w-14 shrink-0 bg-slate-50 rounded-lg px-2 py-1.5">
                      <p className="text-xs text-slate-400">{format(new Date(appt.scheduled_at), 'dd MMM', { locale: es })}</p>
                      <p className="text-sm font-semibold text-slate-700">{format(new Date(appt.scheduled_at), 'HH:mm')}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{appt.service ?? 'Consulta'}</p>
                      {appt.professional && <p className="text-xs text-slate-400">Dr/a. {appt.professional}</p>}
                      {appt.amount ? (
                        <p className="text-xs text-emerald-600 mt-1">{new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(appt.amount)}</p>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={clsx('badge-status', STATUS_COLORS[appt.status])}>{STATUS_LABELS[appt.status]}</span>
                    <Link href={`/appointments/${appt.id}/edit`} className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
                      Editar
                    </Link>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Detalle del turno</p>
                      <p className="text-sm text-slate-600 mt-2">
                        {appt.description ? appt.description : 'Todavía no se cargó un detalle clínico para este turno.'}
                      </p>
                    </div>
                    {appt.status !== 'done' && (
                      <button
                        type="button"
                        onClick={() => startEditing(appt)}
                        className="btn-secondary text-xs px-3 py-2"
                      >
                        Finalizar
                      </button>
                    )}
                  </div>
                  {appt.internal_notes && (
                    <p className="mt-3 text-xs text-amber-700 bg-amber-50 rounded-xl px-3 py-2">Nota interna: {appt.internal_notes}</p>
                  )}
                </div>

                {editingId === appt.id && (
                  <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="text-sm font-semibold text-slate-800">Finalizar turno</h3>
                    <p className="text-sm text-slate-500 mt-1">Registrá el resultado y el detalle clínico que quedará en el historial.</p>
                    {error && <div className="mt-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>}
                    <div className="mt-4 grid gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Detalle clínico</label>
                        <textarea
                          value={detailText}
                          onChange={(event) => setDetailText(event.target.value)}
                          rows={4}
                          className="input-field w-full resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Notas internas</label>
                        <input
                          value={internalNotes}
                          onChange={(event) => setInternalNotes(event.target.value)}
                          className="input-field w-full"
                          placeholder="Sólo visible para el equipo"
                        />
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleFinishAppointment(appt.id)}
                        disabled={savingId === appt.id}
                        className="btn-primary"
                      >
                        {savingId === appt.id ? 'Guardando…' : 'Guardar y finalizar'}
                      </button>
                      <button type="button" onClick={() => setEditingId(null)} className="btn-secondary">
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">Historial clínico</h2>
          <p className="text-sm text-slate-500 mt-1">Turnos finalizados, cancelados o pasados con su detalle asociado.</p>
        </div>
        {historyAppointments.length === 0 ? (
          <p className="px-6 py-8 text-sm text-slate-400 text-center">Sin historial aun</p>
        ) : (
          <div className="divide-y divide-slate-50">
            {historyAppointments.map((appt) => (
              <div key={appt.id} className="px-6 py-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="text-center w-14 shrink-0 bg-slate-50 rounded-lg px-2 py-1.5">
                      <p className="text-xs text-slate-400">{format(new Date(appt.scheduled_at), 'dd MMM', { locale: es })}</p>
                      <p className="text-sm font-semibold text-slate-700">{format(new Date(appt.scheduled_at), 'HH:mm')}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{appt.service ?? 'Consulta'}</p>
                      {appt.professional && <p className="text-xs text-slate-400">Dr/a. {appt.professional}</p>}
                    </div>
                  </div>
                  <span className={clsx('badge-status', STATUS_COLORS[appt.status])}>{STATUS_LABELS[appt.status]}</span>
                </div>

                <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Detalle clínico</p>
                  <p className="text-sm text-slate-600 mt-2">
                    {appt.description ? appt.description : 'No se registró detalle para este turno.'}
                  </p>
                  {appt.internal_notes && (
                    <p className="mt-3 text-xs text-amber-700 bg-amber-50 rounded-xl px-3 py-2">Nota interna: {appt.internal_notes}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
