'use client'

import { useState, useEffect } from 'react'
import { DollarSign, Save, Plus, Trash2, Download } from 'lucide-react'
import { createClient } from '@/lib/supabase-browser'

interface ServicePrice {
  id: string
  service: string
  price: number
  description: string | null
  updated_at: string
}

function formatARS(n: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)
}

export default function PricesPage() {
  const [rows, setRows] = useState<ServicePrice[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [newService, setNewService] = useState({ service: '', price: '', description: '' })

  const supabase = createClient()

  async function fetchPrices() {
    const { data } = await supabase
      .from('service_prices')
      .select('*')
      .order('service')
    setRows(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchPrices() }, [])

  async function handleSave(row: ServicePrice) {
    setSaving(row.id)
    await supabase
      .from('service_prices')
      .update({ price: row.price, description: row.description })
      .eq('id', row.id)
    setSaving(null)
    setSaved(row.id)
    setTimeout(() => setSaved(null), 1500)
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este servicio?')) return
    await supabase.from('service_prices').delete().eq('id', id)
    setRows(rows.filter(r => r.id !== id))
  }

  async function handleAdd() {
    if (!newService.service.trim()) return
    const { data, error } = await supabase
      .from('service_prices')
      .insert({
        service: newService.service.trim(),
        price: Number(newService.price) || 0,
        description: newService.description || null,
      })
      .select()
      .single()
    if (!error && data) {
      setRows([...rows, data].sort((a, b) => a.service.localeCompare(b.service)))
      setNewService({ service: '', price: '', description: '' })
      setAdding(false)
    }
  }

  function exportCSV() {
    const header = 'Servicio,Precio,Descripcion,Actualizado'
    const csvRows = rows.map(r =>
      `"${r.service}","${r.price}","${r.description ?? ''}","${new Date(r.updated_at).toLocaleDateString('es-AR')}"`
    )
    const blob = new Blob([[header, ...csvRows].join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'precios_servicios.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  function updateRow(id: string, field: keyof ServicePrice, value: any) {
    setRows(rows.map(r => r.id === id ? { ...r, [field]: value } : r))
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 font-display">Precios</h1>
          <p className="text-sm text-slate-400 mt-0.5">Lista de precios por servicio</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="btn-secondary">
            <Download className="w-4 h-4" /> Exportar CSV
          </button>
          <button onClick={() => setAdding(true)} className="btn-primary">
            <Plus className="w-4 h-4" /> Nuevo servicio
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-sm text-slate-400">Cargando...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left bg-slate-50/50">
                  <th className="px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Servicio</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide w-44">Precio (ARS)</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Descripcion</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide w-24 text-center">Ultima actualizacion</th>
                  <th className="px-5 py-3 w-24"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {/* New row form */}
                {adding && (
                  <tr className="bg-indigo-50/30">
                    <td className="px-5 py-3">
                      <input
                        autoFocus
                        value={newService.service}
                        onChange={e => setNewService({ ...newService, service: e.target.value })}
                        className="input-field text-sm"
                        placeholder="Nombre del servicio"
                      />
                    </td>
                    <td className="px-5 py-3">
                      <input
                        type="number"
                        value={newService.price}
                        onChange={e => setNewService({ ...newService, price: e.target.value })}
                        className="input-field text-sm"
                        placeholder="0"
                      />
                    </td>
                    <td className="px-5 py-3">
                      <input
                        value={newService.description}
                        onChange={e => setNewService({ ...newService, description: e.target.value })}
                        className="input-field text-sm"
                        placeholder="Descripcion opcional"
                      />
                    </td>
                    <td></td>
                    <td className="px-5 py-3">
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => setAdding(false)} className="btn-secondary py-1 px-2 text-xs">
                          Cancelar
                        </button>
                        <button onClick={handleAdd} className="btn-primary py-1 px-2 text-xs">
                          Agregar
                        </button>
                      </div>
                    </td>
                  </tr>
                )}

                {rows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/60 transition-colors group">
                    <td className="px-5 py-3.5">
                      <span className="font-medium text-slate-800">{row.service}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 text-xs">$</span>
                        <input
                          type="number"
                          value={row.price}
                          onChange={e => updateRow(row.id, 'price', Number(e.target.value))}
                          className="input-field w-32 text-sm font-medium"
                        />
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <input
                        value={row.description ?? ''}
                        onChange={e => updateRow(row.id, 'description', e.target.value)}
                        className="input-field text-sm w-full"
                        placeholder="Sin descripcion"
                      />
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="text-xs text-slate-400">
                        {new Date(row.updated_at).toLocaleDateString('es-AR')}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        {saved === row.id ? (
                          <span className="text-xs text-emerald-600 font-medium">Guardado</span>
                        ) : (
                          <button
                            onClick={() => handleSave(row)}
                            disabled={saving === row.id}
                            className="btn-primary py-1 px-2.5 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Save className="w-3 h-3" />
                            {saving === row.id ? 'Guardando...' : 'Guardar'}
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(row.id)}
                          className="p-1.5 text-slate-300 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              {rows.length > 0 && (
                <tfoot>
                  <tr className="border-t border-slate-100 bg-slate-50/50">
                    <td className="px-5 py-3 text-xs font-semibold text-slate-500">
                      {rows.length} servicios
                    </td>
                    <td className="px-5 py-3 text-sm font-semibold text-slate-700">
                      Promedio: {formatARS(rows.reduce((s, r) => s + r.price, 0) / rows.length)}
                    </td>
                    <td colSpan={3}></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}
      </div>

      <p className="text-xs text-slate-400">
        Los precios se guardan al hacer click en "Guardar" en cada fila. Los cambios no se reflejan automaticamente en los turnos existentes.
      </p>
    </div>
  )
}
