'use client'

import ExportCSVButton from '@/components/ExportCSVButton'

export default function PatientAppointmentsClient({
  csvData,
  patientName,
}: {
  csvData: Record<string, any>[]
  patientName: string
}) {
  const filename = `turnos_${patientName.toLowerCase().replace(/\s+/g, '_')}`
  return <ExportCSVButton data={csvData} filename={filename} label="Exportar turnos" />
}
