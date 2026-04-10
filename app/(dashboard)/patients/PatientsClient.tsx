'use client'

import ExportCSVButton from '@/components/ExportCSVButton'

export default function PatientsClient({ csvData }: { csvData: Record<string, any>[] }) {
  return <ExportCSVButton data={csvData} filename="pacientes" label="Exportar CSV" />
}
