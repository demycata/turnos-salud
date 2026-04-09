import { createClient as createBrowserClient } from '@/lib/supabase-browser'




export const supabase = createBrowserClient()

// ─── Patients ────────────────────────────────────────────────────────────────
export async function getPatients(search?: string) {
  let query = supabase
    .from('patients')
    .select('*')
    .order('full_name')

  if (search) {
    query = query.or(
      `full_name.ilike.%${search}%,phone.ilike.%${search}%,document.ilike.%${search}%`
    )
  }
  const { data, error } = await query
  if (error) throw error
  return data
}

export async function getPatient(id: string) {
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function createPatient(patient: Omit<import('./types').Patient, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('patients')
    .insert(patient)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updatePatient(id: string, patient: Partial<import('./types').Patient>) {
  const { data, error } = await supabase
    .from('patients')
    .update(patient)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deletePatient(id: string) {
  const { error } = await supabase.from('patients').delete().eq('id', id)
  if (error) throw error
}

// ─── Appointments ─────────────────────────────────────────────────────────────
export async function getAppointments(filters?: {
  date?: string
  status?: string
  patient_id?: string
}) {
  let query = supabase
    .from('appointments')
    .select('*, patient:patients(id, full_name, phone)')
    .order('scheduled_at')

  if (filters?.date) {
    const start = `${filters.date}T00:00:00`
    const end = `${filters.date}T23:59:59`
    query = query.gte('scheduled_at', start).lte('scheduled_at', end)
  }
  if (filters?.status) query = query.eq('status', filters.status)
  if (filters?.patient_id) query = query.eq('patient_id', filters.patient_id)

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function getAppointment(id: string) {
  const { data, error } = await supabase
    .from('appointments')
    .select('*, patient:patients(*)')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function createAppointment(appt: Omit<import('./types').Appointment, 'id' | 'created_at' | 'updated_at' | 'patient'>) {
  const { data, error } = await supabase
    .from('appointments')
    .insert(appt)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateAppointment(id: string, appt: Partial<import('./types').Appointment>) {
  const { data, error } = await supabase
    .from('appointments')
    .update(appt)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteAppointment(id: string) {
  const { error } = await supabase.from('appointments').delete().eq('id', id)
  if (error) throw error
}

// Slots ocupados en un día para el calendario
export async function getOccupiedSlots(date: string): Promise<string[]> {
  const start = `${date}T00:00:00`
  const end = `${date}T23:59:59`
  const { data, error } = await supabase
    .from('appointments')
    .select('scheduled_at')
    .gte('scheduled_at', start)
    .lte('scheduled_at', end)
    .neq('status', 'cancelled')
  if (error) throw error
  return (data || []).map((r) => r.scheduled_at.slice(11, 16)) // "HH:mm"
}
