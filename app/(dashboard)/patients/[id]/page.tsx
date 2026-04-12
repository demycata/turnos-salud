import Link from 'next/link'
import { ArrowLeft, CalendarPlus, Phone, Mail, MapPin, Calendar, Edit } from 'lucide-react'
import { getPatient, getAppointments } from '@/lib/supabase'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { STATUS_LABELS, type Appointment } from '@/lib/types'
import { notFound } from 'next/navigation'
import DeletePatientButton from './DeletePatientButton'
import PatientAppointmentsClient from './PatientAppointmentsClient'
import PatientAppointmentsOverview from './PatientAppointmentsOverview'

export const dynamic = 'force-dynamic'

export default async function PatientDetailPage({ params }: { params: { id: string } }) {
  let patient, appointments
  try {
    ;[patient, appointments] = await Promise.all([
      getPatient(params.id),
      getAppointments({ patient_id: params.id }),
    ])
  } catch {
    notFound()
  }

  const now = new Date()
  const upcoming = appointments.filter(
    (a: Appointment) => new Date(a.scheduled_at) >= now && a.status !== 'cancelled'
  )
  const past = appointments.filter(
    (a: Appointment) => new Date(a.scheduled_at) < now || a.status === 'done' || a.status === 'cancelled'
  )

  // CSV data for this patient's appointments
  const csvData = appointments.map((a: Appointment) => ({
    Fecha: format(new Date(a.scheduled_at), 'dd/MM/yyyy'),
    Hora: format(new Date(a.scheduled_at), 'HH:mm'),
    Servicio: a.service ?? '',
    Profesional: a.professional ?? '',
    Estado: STATUS_LABELS[a.status],
    'Medio de pago': a.payment_method ?? '',
    Importe: a.amount ?? 0,
    Descripcion: a.description ?? '',
    'Notas internas': a.internal_notes ?? '',
  }))

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <Link href="/patients" className="btn-secondary py-1.5 px-2.5">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="text-2xl font-semibold text-slate-900 font-display flex-1">
          {patient.full_name}
        </h1>
        <PatientAppointmentsClient csvData={csvData} patientName={patient.full_name} />
        <Link href={`/patients/${patient.id}/edit`} className="btn-secondary">
          <Edit className="w-4 h-4" /> Editar
        </Link>
        <DeletePatientButton id={patient.id} />
        <Link href={`/appointments/new?patient_id=${patient.id}`} className="btn-primary">
          <CalendarPlus className="w-4 h-4" /> Nuevo turno
        </Link>
      </div>

      {/* Patient info card */}
      <div className="card p-6">
        <div className="flex items-start gap-5">
          <div className="w-14 h-14 rounded-2xl bg-indigo-100 flex items-center justify-center shrink-0">
            <span className="text-2xl font-bold text-indigo-600">
              {patient.full_name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 flex-1">
            {patient.phone && (
              <div>
                <p className="text-xs text-slate-400 mb-0.5">Telefono</p>
                <p className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" /> {patient.phone}
                </p>
              </div>
            )}
            {patient.email && (
              <div>
                <p className="text-xs text-slate-400 mb-0.5">Email</p>
                <p className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> {patient.email}
                </p>
              </div>
            )}
            {patient.neighborhood && (
              <div>
                <p className="text-xs text-slate-400 mb-0.5">Barrio</p>
                <p className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> {patient.neighborhood}
                </p>
              </div>
            )}
            {patient.birth_date && (
              <div>
                <p className="text-xs text-slate-400 mb-0.5">Nacimiento</p>
                <p className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {format(new Date(patient.birth_date), "d 'de' MMMM yyyy", { locale: es })}
                </p>
              </div>
            )}
            {patient.document && (
              <div>
                <p className="text-xs text-slate-400 mb-0.5">Documento</p>
                <p className="text-sm font-medium text-slate-700">{patient.document}</p>
              </div>
            )}
            {patient.sex && (
              <div>
                <p className="text-xs text-slate-400 mb-0.5">Sexo</p>
                <p className="text-sm font-medium text-slate-700">
                  {patient.sex === 'F' ? 'Femenino' : patient.sex === 'M' ? 'Masculino' : 'Otro'}
                </p>
              </div>
            )}
          </div>
        </div>
        {patient.notes && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-xs text-slate-400 mb-1">Notas generales</p>
            <p className="text-sm text-slate-600">{patient.notes}</p>
          </div>
        )}
      </div>

      <PatientAppointmentsOverview upcoming={upcoming} history={past} />
    </div>
  )
}
