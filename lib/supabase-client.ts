import { createClient } from './supabase-browser'

function getClient() {
  return createClient()
}

export async function getPatients(search?: string) {
  let query = getClient().from('patients').select('*').order('full_name')
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
