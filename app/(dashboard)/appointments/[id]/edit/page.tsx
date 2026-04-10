'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Trash2, Clock } from 'lucide-react'
import { getAppointment, updateAppointment, deleteAppointment, getOccupiedSlots } from '@/lib/supabase-client'
import { format } from 'date-fns'
import clsx from 'clsx'
import type { AppointmentStatus } from '@/lib/types'

const HOURS = Array.from({ length: 22 }, (_, i) => {
  const h = Math.floor(i / 2) + 8
  const m = i % 2 === 0 ? '00' : '30'
  return `${String(h).padStart(2, '0')}:${m}`
})

const SERVICES = [
  'Control mensual', 'Control metálicos', 'Stripping', 'RX panorámica de control',
  'Arco rectangular', 'Guardia', 'Consulta por retiro o servicios adicionales',
  'Primera consulta', 'Brackets', 'Otro',
]

const STATUSES: { value: AppointmentStatus; label: string }[] = [
  { value: 'pending', label: 'Pendiente' },
  { value: 'done', label: 'Realizado' },
  { value: 'cancelled', label: 'Cancelado' },
  { value: 'no_show', label: 'Ausente' },
]

export default function EditAppointmentPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [appt, setAppt] = useState<any>(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [occupiedSlots, setOccupiedSlots] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getAppointment(params.id).then((a) => {
      setAppt(a)
      const dt = new Date(a.scheduled_at)
      setSelectedDate(format(dt, 'yyyy-MM-dd'))
      setSelectedTime(format(dt, 'HH:mm'))
    }).catch(console.error)
  }, [params.id])

  useEffect(() => {
    if (selectedDate) {
      getOccupiedSlots(selectedDate).then((slots) => {
        // exclude current appt's own slot
        setOccupiedSlots(slots.filter((s) => s !== (appt ? format(new Date(appt.scheduled_at), 'HH:mm') : '')))
      }).catch(console.error)
    }
  }, [selectedDate, appt])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!selectedTime) { setError('Seleccioná un horario'); return }
    setLoading(true)
    setError(null)
    const form = new FormData(e.currentTarget)
    try {
      await updateAppointment(params.id, {
        scheduled_at: `${selectedDate}T${selectedTime}:00`,
        professional: form.get('professional') as string,
        service: form.get('service') as string,
        description: form.get('description') as string,
        internal_notes: form.get('internal_notes') as string,
        status: form.get('status') as AppointmentStatus,
        payment_method: form.get('payment_method') as string,
        amount: Number(form.get('amount')) || undefined,
      })
      router.push(`/patients/${appt.patient_id}`)
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!confirm('¿Eliminar este turno?')) return
    await deleteAppointment(params.id)
    router.push(`/patients/${appt?.patient_id}`)
  }

  if (!appt) return <div className="p-8 text-slate-400">Cargando…</div>

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/patients/${appt.patient_id}`} className="btn-secondary py-1.5 px-2.5">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-slate-900 font-display">Editar turno</h1>
          {appt.patient && <p className="text-sm text-slate-400">{appt.patient.full_name}</p>}
        </div>
        <button onClick={handleDelete} className="btn-danger">
          <Trash2 className="w-4 h-4" /> Eliminar
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">{error}</div>
        )}

        <div className="card p-6 space-y-4">
          <h2 className="text-sm font-semibold text-slate-700">Datos del turno</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Servicio</label>
              <select name="service" className="input-field" defaultValue={appt.service ?? ''}>
                <option value="">Seleccionar…</option>
                {SERVICES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Profesional</label>
              <input name="professional" className="input-field" defaultValue={appt.professional ?? ''} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Estado</label>
              <select name="status" className="input-field" defaultValue={appt.status}>
                {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Medio de pago</label>
              <select name="payment_method" className="input-field" defaultValue={appt.payment_method ?? ''}>
                <option value="">Sin especificar</option>
                <option value="Efectivo">Efectivo</option>
                <option value="Mercado Pago">Mercado Pago</option>
                <option value="Mercado Pago QR">Mercado Pago QR</option>
                <option value="Transferencia">Transferencia</option>
                <option value="Débito">Débito</option>
                <option value="Crédito">Crédito</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Importe ($)</label>
              <input name="amount" type="number" className="input-field" defaultValue={appt.amount ?? ''} placeholder="0" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Descripción / historial clínico</label>
              <textarea
                name="description"
                rows={4}
                className="input-field resize-none"
                defaultValue={appt.description ?? ''}
                placeholder="Descripción del turno, evolución del tratamiento…"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Notas internas</label>
              <input name="internal_notes" className="input-field" defaultValue={appt.internal_notes ?? ''} placeholder="Solo visible para el personal" />
            </div>
          </div>
        </div>

        {/* Reprogramar */}
        <div className="card p-6 space-y-4">
          <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" /> Reprogramar
          </h2>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Fecha</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => { setSelectedDate(e.target.value); setSelectedTime('') }}
              className="input-field w-48"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-3">
              Horario — <span className="text-slate-300">gris = ocupado</span>
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {HOURS.map((t) => {
                const occupied = occupiedSlots.includes(t)
                const selected = selectedTime === t
                return (
                  <button
                    key={t}
                    type="button"
                    disabled={occupied}
                    onClick={() => setSelectedTime(t)}
                    className={clsx(
                      'rounded-lg py-2 px-3 text-sm font-medium transition-all duration-100',
                      occupied && 'bg-slate-100 text-slate-300 cursor-not-allowed line-through',
                      !occupied && !selected && 'bg-white ring-1 ring-slate-200 text-slate-700 hover:ring-indigo-400 hover:text-indigo-600',
                      selected && 'bg-indigo-600 text-white ring-2 ring-indigo-600 shadow-sm'
                    )}
                  >
                    {t}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Link href={`/patients/${appt.patient_id}`} className="btn-secondary">Cancelar</Link>
          <button type="submit" disabled={loading} className="btn-primary">
            <Save className="w-4 h-4" />
            {loading ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </div>
  )
}
