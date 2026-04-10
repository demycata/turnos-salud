import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

function getClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}

// ─── Patients ──────────────────────────────────────────────────────────────
export async function getPatients(search?: string) {
  const supabase = getClient()
  let query = supabase.from('patients').select('*').order('full_name')
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
  const { data, error } = await getClient()
    .from('patients').select('*').eq('id', id).single()
  if (error) throw error
  return data
}

export async function createPatient(patient: Omit<import('./types').Patient, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await getClient()
    .from('patients').insert(patient).select().single()
  if (error) throw error
  return data
}

export async function updatePatient(id: string, patient: Partial<import('./types').Patient>) {
  const { data, error } = await getClient()
    .from('patients').update(patient).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deletePatient(id: string) {
  const { error } = await getClient().from('patients').delete().eq('id', id)
  if (error) throw error
}

// ─── Appointments ──────────────────────────────────────────────────────────
export async function getAppointments(filters?: {
  date?: string
  status?: string
  patient_id?: string
}) {
  const supabase = getClient()
  let query = supabase
    .from('appointments')
    .select('*, patient:patients(id, full_name, phone)')
    .order('scheduled_at')

  if (filters?.date) {
    query = query
      .gte('scheduled_at', `${filters.date}T00:00:00`)
      .lte('scheduled_at', `${filters.date}T23:59:59`)
  }
  if (filters?.status) query = query.eq('status', filters.status)
  if (filters?.patient_id) query = query.eq('patient_id', filters.patient_id)

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function getAppointment(id: string) {
  const { data, error } = await getClient()
    .from('appointments')
    .select('*, patient:patients(*)')
    .eq('id', id).single()
  if (error) throw error
  return data
}

export async function createAppointment(appt: Omit<import('./types').Appointment, 'id' | 'created_at' | 'updated_at' | 'patient'>) {
  const { data, error } = await getClient()
    .from('appointments').insert(appt).select().single()
  if (error) throw error
  return data
}

export async function updateAppointment(id: string, appt: Partial<import('./types').Appointment>) {
  const { data, error } = await getClient()
    .from('appointments').update(appt).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteAppointment(id: string) {
  const { error } = await getClient().from('appointments').delete().eq('id', id)
  if (error) throw error
}

export async function getOccupiedSlots(date: string): Promise<string[]> {
  const { data, error } = await getClient()
    .from('appointments')
    .select('scheduled_at')
    .gte('scheduled_at', `${date}T00:00:00`)
    .lte('scheduled_at', `${date}T23:59:59`)
    .neq('status', 'cancelled')
  if (error) throw error
  return (data || []).map((r: any) => r.scheduled_at.slice(11, 16))
}
