import Link from 'next/link'
import { UserPlus, Search, Phone, MapPin, ChevronRight } from 'lucide-react'
import { getPatients } from '@/lib/supabase'
import type { Patient } from '@/lib/types'
import { format } from 'date-fns'
import PatientsClient from './PatientsClient'

export const dynamic = 'force-dynamic'

export default async function PatientsPage({
  searchParams,
}: {
  searchParams: { q?: string }
}) {
  const patients = await getPatients(searchParams.q)

  const csvData = patients.map((p: Patient) => ({
    'Nombre completo': p.full_name,
    Telefono: p.phone,
    Email: p.email ?? '',
    Documento: p.document ?? '',
    'Fecha de nacimiento': p.birth_date ? format(new Date(p.birth_date), 'dd/MM/yyyy') : '',
    Sexo: p.sex ?? '',
    Barrio: p.neighborhood ?? '',
    Direccion: p.address ?? '',
    Notas: p.notes ?? '',
    'Registrado el': format(new Date(p.created_at), 'dd/MM/yyyy'),
  }))

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 font-display">Pacientes</h1>
          <p className="text-sm text-slate-400 mt-0.5">{patients.length} registros</p>
        </div>
        <div className="flex gap-2">
          <PatientsClient csvData={csvData} />
          <Link href="/patients/new" className="btn-primary">
            <UserPlus className="w-4 h-4" /> Nuevo paciente
          </Link>
        </div>
      </div>

      {/* Search */}
      <form className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          name="q"
          defaultValue={searchParams.q}
          placeholder="Buscar por nombre, telefono o documento..."
          className="input-field pl-9"
        />
      </form>

      {/* List */}
      {patients.length === 0 ? (
        <div className="card py-16 text-center">
          <p className="text-slate-400 text-sm">No se encontraron pacientes</p>
        </div>
      ) : (
        <div className="card divide-y divide-slate-50 overflow-hidden">
          {patients.map((patient: Patient) => (
            <Link
              key={patient.id}
              href={`/patients/${patient.id}`}
              className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                  <span className="text-sm font-semibold text-indigo-600">
                    {patient.full_name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800 group-hover:text-indigo-600 transition-colors">
                    {patient.full_name}
                  </p>
                  <div className="flex items-center gap-3 mt-0.5">
                    {patient.phone && (
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {patient.phone}
                      </span>
                    )}
                    {patient.neighborhood && (
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {patient.neighborhood}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {patient.birth_date && (
                  <span className="text-xs text-slate-400 hidden sm:block">
                    Nac. {format(new Date(patient.birth_date), 'dd/MM/yyyy')}
                  </span>
                )}
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-400 transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
