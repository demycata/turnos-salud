export type AppointmentStatus = 'pending' | 'done' | 'cancelled' | 'no_show'

export interface Patient {
  id: string
  full_name: string
  phone: string
  email?: string
  address?: string
  neighborhood?: string
  birth_date?: string
  sex?: 'M' | 'F' | 'Otro'
  document?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface Appointment {
  id: string
  patient_id: string
  scheduled_at: string
  professional?: string
  service?: string
  description?: string
  status: AppointmentStatus
  payment_method?: string
  amount?: number
  internal_notes?: string
  created_at: string
  updated_at: string
  // joined
  patient?: Patient
}

export const STATUS_LABELS: Record<AppointmentStatus, string> = {
  pending: 'Pendiente',
  done: 'Realizado',
  cancelled: 'Cancelado',
  no_show: 'Ausente',
}

export const STATUS_COLORS: Record<AppointmentStatus, string> = {
  pending: 'bg-amber-50 text-amber-700 ring-amber-200',
  done: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  cancelled: 'bg-red-50 text-red-600 ring-red-200',
  no_show: 'bg-slate-100 text-slate-500 ring-slate-200',
}
