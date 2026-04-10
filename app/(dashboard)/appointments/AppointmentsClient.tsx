'use client'

import ExportCSVButton from '@/components/ExportCSVButton'

export default function AppointmentsClient({ csvData }: { csvData: Record<string, any>[] }) {
  return <ExportCSVButton data={csvData} filename="turnos" label="Exportar CSV" />
}
