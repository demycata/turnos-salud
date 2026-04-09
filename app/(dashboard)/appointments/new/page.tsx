'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Clock } from 'lucide-react'
import { createAppointment, getPatients, getOccupiedSlots } from '@/lib/supabase'
import { format } from 'date-fns'
import clsx from 'clsx'

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

function NewAppointmentForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedPatient = searchParams.get('patient_id')

  const [patients, setPatients] = useState<any[]>([])
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [occupiedSlots, setOccupiedSlots] = useState<string[]>([])
  const [selectedTime, setSelectedTime] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getPatients().then(setPatients).catch(console.error)
  }, [])

  useEffect(() => {
    if (selectedDate) {
      getOccupiedSlots(selectedDate).then(setOccupiedSlots).catch(console.error)
    }
  }, [selectedDate])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!selectedTime) { setError('Seleccioná un horario'); return }
    setLoading(true)
    setError(null)
    const form = new FormData(e.currentTarget)
    try {
      await createAppointment({
        patient_id: form.get('patient_id') as string,
        scheduled_at: `${selectedDate}T${selectedTime}:00`,
        professional: form.get('professional') as string,
        service: form.get('service') as string,
        description: form.get('description') as string,
        internal_notes: form.get('internal_notes') as string,
        status: 'pending',
      })
      const pid = form.get('patient_id')
      router.push(pid ? `/patients/${pid}` : '/appointments')
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/appointments" className="btn-secondary py-1.5 px-2.5">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="text-2xl font-semibold text-slate-900 font-display">Nuevo turno</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="card p-6 space-y-4">
          <h2 className="text-sm font-semibold text-slate-700">Datos del turno</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                Paciente <span className="text-red-400">*</span>
              </label>
              <select name="patient_id" required className="input-field" defaultValue={preselectedPatient ?? ''}>
                <option value="">Seleccionar paciente...</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>{p.full_name} - {p.phone}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Servicio</label>
              <select name="service" className="input-field">
                <option value="">Seleccionar...</option>
                {SERVICES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Profesional</label>
              <input name="professional" className="input-field" placeholder="Ej: Martin Navarro" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Descripcion / motivo</label>
              <textarea name="description" rows={3} className="input-field resize-none" placeholder="Descripcion del turno..." />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Notas internas</label>
              <input name="internal_notes" className="input-field" placeholder="Solo visible para el personal" />
            </div>
          </div>
        </div>

        <div className="card p-6 space-y-4">
          <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" /> Fecha y horario
          </h2>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Fecha <span className="text-red-400">*</span></label>
            <input
              type="date"
              value={selectedDate}
              min={format(new Date(), 'yyyy-MM-dd')}
              onChange={(e) => { setSelectedDate(e.target.value); setSelectedTime('') }}
              className="input-field w-48"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-3">
              Horario <span className="text-red-400">*</span>
              <span className="ml-2 text-slate-300 font-normal">los bloques en gris estan ocupados</span>
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
          <Link href="/appointments" className="btn-secondary">Cancelar</Link>
          <button type="submit" disabled={loading} className="btn-primary">
            <Save className="w-4 h-4" />
            {loading ? 'Guardando...' : 'Confirmar turno'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default function NewAppointmentPage() {
  return (
    <Suspense fallback={<div className="p-8 text-slate-400">Cargando...</div>}>
      <NewAppointmentForm />
    </Suspense>
  )
}
