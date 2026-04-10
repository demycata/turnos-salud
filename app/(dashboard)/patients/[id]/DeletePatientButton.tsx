'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { deletePatient } from '@/lib/supabase-client'

export default function DeletePatientButton({ id }: { id: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirm('¿Eliminar este paciente y todos sus turnos? Esta acción no se puede deshacer.')) return
    setLoading(true)
    try {
      await deletePatient(id)
      router.push('/patients')
      router.refresh()
    } catch (err: any) {
      alert('Error: ' + err.message)
      setLoading(false)
    }
  }

  return (
    <button onClick={handleDelete} disabled={loading} className="btn-danger">
      <Trash2 className="w-4 h-4" />
      {loading ? 'Eliminando…' : 'Eliminar'}
    </button>
  )
}
