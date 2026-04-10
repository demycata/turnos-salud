'use client'

import { Download } from 'lucide-react'

interface ExportCSVButtonProps {
  data: Record<string, any>[]
  filename: string
  label?: string
}

function escapeCSV(val: any): string {
  if (val === null || val === undefined) return ''
  const str = String(val)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export default function ExportCSVButton({ data, filename, label = 'Exportar CSV' }: ExportCSVButtonProps) {
  function handleExport() {
    if (!data.length) return
    const headers = Object.keys(data[0])
    const rows = data.map(row => headers.map(h => escapeCSV(row[h])).join(','))
    const csv = [headers.join(','), ...rows].join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <button onClick={handleExport} disabled={!data.length} className="btn-secondary">
      <Download className="w-4 h-4" />
      {label}
    </button>
  )
}
