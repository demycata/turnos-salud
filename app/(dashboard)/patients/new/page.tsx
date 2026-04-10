'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'
import { createPatient } from '@/lib/supabase-client'

export default function NewPatientPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const form = new FormData(e.currentTarget)
    try {
      const patient = await createPatient({
        full_name: form.get('full_name') as string,
        phone: form.get('phone') as string,
        email: form.get('email') as string,
        address: form.get('address') as string,
        neighborhood: form.get('neighborhood') as string,
        birth_date: (form.get('birth_date') as string) || undefined,
        sex: (form.get('sex') as 'M' | 'F' | 'Otro') || undefined,
        document: form.get('document') as string,
        notes: form.get('notes') as string,
      })
      router.push(`/patients/${patient.id}`)
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/patients" className="btn-secondary py-1.5 px-2.5">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 font-display">Nuevo paciente</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-500 mb-1.5">
              Nombre completo <span className="text-red-400">*</span>
            </label>
            <input name="full_name" required className="input-field" placeholder="Ej: María González" />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">
              Teléfono <span className="text-red-400">*</span>
            </label>
            <input name="phone" required type="tel" className="input-field" placeholder="1155556789" />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Email</label>
            <input name="email" type="email" className="input-field" placeholder="mail@ejemplo.com" />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">DNI / Documento</label>
            <input name="document" className="input-field" placeholder="30123456" />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Fecha de nacimiento</label>
            <input name="birth_date" type="date" className="input-field" />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Sexo</label>
            <select name="sex" className="input-field">
              <option value="">Seleccionar…</option>
              <option value="F">Femenino</option>
              <option value="M">Masculino</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Barrio</label>
            <input name="neighborhood" className="input-field" placeholder="Ej: San Miguel" />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Dirección</label>
            <input name="address" className="input-field" placeholder="Av. San Martín 1234" />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Notas generales</label>
            <textarea
              name="notes"
              rows={3}
              className="input-field resize-none"
              placeholder="Alergias, condiciones preexistentes, observaciones…"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Link href="/patients" className="btn-secondary">Cancelar</Link>
          <button type="submit" disabled={loading} className="btn-primary">
            <Save className="w-4 h-4" />
            {loading ? 'Guardando…' : 'Guardar paciente'}
          </button>
        </div>
      </form>
    </div>
  )
}
