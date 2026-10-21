import React, { useState, useEffect } from 'react'
import { eventsApi } from '../../api/events'
import type { EventPostMortemReport, CloseEventPostMortemItemRequest } from '../../types/event'
import { gooeyToast } from 'goey-toast'
import { 
  X, 
  Scale, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  TrendingDown, 
  Database, 
  FileText,
  RefreshCw,
  Award
} from 'lucide-react'

interface PostMortemModalProps {
  isOpen: boolean
  eventId: string
  eventName: string
  onClose: () => void
  onSaved: () => void
}

interface FormItemState {
  ingredientId: string
  ingredientName: string
  unitOfMeasure: string
  plannedGrossQuantity: number
  plannedWastePercentage: number
  plannedWasteQuantity: number
  plannedReusablePercentage: number
  plannedReusableQuantity: number
  actualWasteQuantity: number
  actualReusableQuantity: number
  applyToPantry: boolean
  notes: string
}

export const PostMortemModal: React.FC<PostMortemModalProps> = ({
  isOpen,
  eventId,
  eventName,
  onClose,
  onSaved,
}) => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [postMortemNotes, setPostMortemNotes] = useState('')
  const [items, setItems] = useState<FormItemState[]>([])

  useEffect(() => {
    if (isOpen && eventId) {
      loadPostMortem()
    }
  }, [isOpen, eventId])

  const loadPostMortem = async () => {
    setLoading(true)
    setError(null)
    try {
      const data: EventPostMortemReport = await eventsApi.getPostMortem(eventId)
      setPostMortemNotes(data.postMortemNotes || '')

      const initialItems: FormItemState[] = data.items.map(item => ({
        ingredientId: item.ingredientId,
        ingredientName: item.ingredientName,
        unitOfMeasure: item.unitOfMeasure,
        plannedGrossQuantity: item.plannedGrossQuantity,
        plannedWastePercentage: item.plannedWastePercentage,
        plannedWasteQuantity: item.plannedWasteQuantity,
        plannedReusablePercentage: item.plannedReusablePercentage,
        plannedReusableQuantity: item.plannedReusableQuantity,
        actualWasteQuantity: item.actualWasteQuantity,
        actualReusableQuantity: item.actualReusableQuantity,
        applyToPantry: item.appliedToPantry || false,
        notes: item.notes || '',
      }))

      setItems(initialItems)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar los datos de auditoría.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const handleItemChange = (index: number, field: keyof FormItemState, value: any) => {
    setItems(prev => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)))
  }

  // Cálculos en vivo para KPIs de cabecera
  const totalPlannedWaste = items.reduce((s, i) => s + (Number(i.plannedWasteQuantity) || 0), 0)
  const totalActualWaste = items.reduce((s, i) => s + (Number(i.actualWasteQuantity) || 0), 0)
  const totalPlannedReusable = items.reduce((s, i) => s + (Number(i.plannedReusableQuantity) || 0), 0)
  const totalActualReusable = items.reduce((s, i) => s + (Number(i.actualReusableQuantity) || 0), 0)

  const wasteDiff = totalActualWaste - totalPlannedWaste
  const reusableDiff = totalActualReusable - totalPlannedReusable

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSaving(true)

    try {
      const requestPayload = {
        eventId,
        postMortemNotes: postMortemNotes.trim() || null,
        items: items.map(
          (i): CloseEventPostMortemItemRequest => ({
            ingredientId: i.ingredientId,
            actualWasteQuantity: Number(i.actualWasteQuantity) || 0,
            actualReusableQuantity: Number(i.actualReusableQuantity) || 0,
            applyToPantry: i.applyToPantry,
            notes: i.notes.trim() || null,
          })
        ),
      }

      await eventsApi.closeEvent(eventId, requestPayload)
      gooeyToast.success('Auditoría guardada y banquete cerrado', {
        description: 'Se registraron las mermas reales y se completó el servicio.',
      })
      onSaved()
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error al guardar la auditoría.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#18251e]/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-4xl bg-[#fdfbf7] border border-[#18251e]/15 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Encabezado */}
        <div className="px-6 py-4 border-b border-[#18251e]/10 flex items-center justify-between bg-[#ebe4d5]/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#5a341e]/10 border border-[#5a341e]/20 flex items-center justify-center text-[#5a341e]">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold font-heading text-[#18251e]">
                  Auditoría Post-Servicio & Mermas Reales
                </h2>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#5a341e]/10 text-[#5a341e] border border-[#5a341e]/20 uppercase tracking-wider">
                  Post-Mortem Culinario
                </span>
              </div>
              <p className="text-[11px] text-[#524d45]">
                Banquete: <strong className="text-[#18251e]">{eventName}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#726e66] hover:text-[#18251e] p-1.5 rounded-lg hover:bg-[#18251e]/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido Principal */}
        {loading ? (
          <div className="p-16 text-center text-[#524d45] flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-[#5a341e]" />
            <p className="text-sm font-medium">Cargando escandallos teóricos para auditoría...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6 flex-1">
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5 shadow-sm">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            {/* Tarjetas KPI de Comparativa Teórica vs Real en Vivo */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Desperdicio Neto Inutilizable */}
              <div className="p-3.5 rounded-2xl bg-white border border-[#18251e]/10 shadow-sm space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#726e66] block">
                  Desperdicio Neto (Basura)
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold font-mono text-[#18251e]">
                    {totalActualWaste.toFixed(2)} Kg
                  </span>
                  <span className="text-xs text-[#726e66] font-mono">
                    (previsto: {totalPlannedWaste.toFixed(2)} Kg)
                  </span>
                </div>
                <div className="text-[11px] flex items-center gap-1 font-medium">
                  {wasteDiff <= 0 ? (
                    <span className="text-emerald-700 flex items-center gap-0.5 font-bold">
                      <TrendingDown className="w-3.5 h-3.5" />
                      {Math.abs(wasteDiff).toFixed(2)} Kg menos de basura (Ahorro)
                    </span>
                  ) : (
                    <span className="text-amber-800 flex items-center gap-0.5 font-bold">
                      <TrendingUp className="w-3.5 h-3.5" />
                      +{wasteDiff.toFixed(2)} Kg exceso sobre previsión
                    </span>
                  )}
                </div>
              </div>

              {/* Subproducto Rescatado */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 shadow-sm space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-900 block flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-700" />
                  Subproducto Limpio Rescatado
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold font-mono text-emerald-950">
                    +{totalActualReusable.toFixed(2)} Kg
                  </span>
                  <span className="text-xs text-emerald-700 font-mono">
                    (previsto: +{totalPlannedReusable.toFixed(2)} Kg)
                  </span>
                </div>
                <span className="text-[11px] text-emerald-800 block font-medium">
                  {reusableDiff >= 0
                    ? `+${reusableDiff.toFixed(2)} Kg sobre previsión (Gran aprovechamiento)`
                    : `${reusableDiff.toFixed(2)} Kg bajo previsión`}
                </span>
              </div>

              {/* Precisión de Cocina */}
              <div className="p-3.5 rounded-2xl bg-[#ebe4d5]/50 border border-[#18251e]/10 shadow-sm space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#5a341e] block flex items-center gap-1">
                  <Award className="w-3 h-3" />
                  Índice de Control Técnico
                </span>
                <span className="text-xl font-bold font-heading text-[#18251e] block">
                  {Math.max(0, 100 - Math.abs(wasteDiff * 10)).toFixed(1)}%
                </span>
                <span className="text-[11px] text-[#524d45] block">
                  Afinamiento del escandallo en servicio
                </span>
              </div>
            </div>

            {/* Observaciones Generales del Servicio */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#18251e] flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#5a341e]" />
                Observaciones Post-Servicio de la Brigada
              </label>
              <textarea
                rows={2}
                value={postMortemNotes}
                onChange={e => setPostMortemNotes(e.target.value)}
                placeholder="Ej: El pase se completó en hora. La partida de carne llegó con un 3% más de grasa exterior que requirió limpieza adicional..."
                className="w-full px-3.5 py-2 bg-white border border-[#18251e]/15 rounded-xl text-xs text-[#18251e] placeholder-[#18251e]/40 focus:outline-none focus:border-[#5a341e] shadow-sm"
              />
            </div>

            {/* Tabla de Pesajes de Ingredientes */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-[#18251e] flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-[#5a341e]" />
                  Pesaje Real por Ingrediente ({items.length} artículos evaluados)
                </label>
                <span className="text-xs text-[#726e66]">
                  Ajusta los kilos reales pesados al desmontar las partidas
                </span>
              </div>

              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {items.map((item, idx) => {
                  const gross = item.plannedGrossQuantity
                  const actualWaste = Number(item.actualWasteQuantity) || 0
                  const actualWastePct = gross > 0 ? (actualWaste / gross) * 100 : 0
                  const plannedWastePct = item.plannedWastePercentage * 100
                  const devPct = actualWastePct - plannedWastePct

                  return (
                    <div
                      key={item.ingredientId}
                      className="p-4 rounded-2xl bg-white border border-[#18251e]/15 shadow-sm space-y-3"
                    >
                      {/* Cabecera del Ingrediente */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#18251e]/8 pb-2">
                        <div>
                          <span className="font-bold text-sm text-[#18251e]">
                            {item.ingredientName}
                          </span>
                          <span className="text-xs text-[#726e66] ml-2 font-mono">
                            (Consumo bruto: {item.plannedGrossQuantity} {item.unitOfMeasure})
                          </span>
                        </div>

                        {/* Desviación respecto al escandallo */}
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[11px] font-bold font-mono border ${
                              devPct <= 0
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-amber-50 text-amber-800 border-amber-200'
                            }`}
                          >
                            {devPct <= 0 ? '✓' : '⚠️'} {devPct > 0 ? `+${devPct.toFixed(1)}%` : `${devPct.toFixed(1)}%`} merma
                          </span>
                        </div>
                      </div>

                      {/* Inputs de Pesaje Real */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                        {/* Merma Inútil (Basura) */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-rose-800 flex items-center justify-between">
                            <span>Merma Descartada (Basura)</span>
                            <span className="text-[#726e66] font-normal">
                              Previsto: {item.plannedWasteQuantity} {item.unitOfMeasure} ({plannedWastePct.toFixed(0)}%)
                            </span>
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              required
                              value={item.actualWasteQuantity}
                              onChange={e =>
                                handleItemChange(idx, 'actualWasteQuantity', parseFloat(e.target.value) || 0)
                              }
                              className="w-full px-3 py-1.5 bg-[#fdfbf7] border border-[#18251e]/15 rounded-xl text-xs font-mono font-bold text-[#18251e] focus:outline-none focus:border-[#5a341e]"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-[#726e66]">
                              {item.unitOfMeasure} ({actualWastePct.toFixed(1)}%)
                            </span>
                          </div>
                        </div>

                        {/* Subproducto Reutilizable */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 flex items-center justify-between">
                            <span>Subproducto Rescatado</span>
                            <span className="text-[#726e66] font-normal">
                              Previsto: {item.plannedReusableQuantity} {item.unitOfMeasure}
                            </span>
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              required
                              value={item.actualReusableQuantity}
                              onChange={e =>
                                handleItemChange(idx, 'actualReusableQuantity', parseFloat(e.target.value) || 0)
                              }
                              className="w-full px-3 py-1.5 bg-[#fdfbf7] border border-[#18251e]/15 rounded-xl text-xs font-mono font-bold text-emerald-900 focus:outline-none focus:border-[#5a341e]"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-emerald-700">
                              {item.unitOfMeasure}
                            </span>
                          </div>
                        </div>

                        {/* Checkbox para actualizar la despensa */}
                        <div className="flex flex-col justify-end sm:col-span-2 lg:col-span-1">
                          <label className="flex items-center gap-2 p-2 rounded-xl bg-[#ebe4d5]/40 border border-[#18251e]/10 cursor-pointer hover:bg-[#ebe4d5]/60 transition-colors select-none">
                            <input
                              type="checkbox"
                              checked={item.applyToPantry}
                              onChange={e => handleItemChange(idx, 'applyToPantry', e.target.checked)}
                              className="w-4 h-4 rounded text-[#5a341e] border-[#18251e]/20"
                            />
                            <div className="text-[11px]">
                              <span className="font-bold text-[#18251e] flex items-center gap-1">
                                <Database className="w-3 h-3 text-[#5a341e]" />
                                Actualizar Despensa
                              </span>
                              <span className="text-[10px] text-[#726e66] block">
                                Calibra futuros escandallos con este %
                              </span>
                            </div>
                          </label>
                        </div>
                      </div>

                      {/* Nota técnica por ingrediente */}
                      <input
                        type="text"
                        value={item.notes}
                        onChange={e => handleItemChange(idx, 'notes', e.target.value)}
                        placeholder="Nota de partida (ej: Pieza con hueso más denso de lo previsto)"
                        className="w-full px-3 py-1.5 bg-[#fdfbf7] border border-[#18251e]/10 rounded-xl text-xs text-[#18251e] placeholder-[#18251e]/40 focus:outline-none focus:border-[#5a341e]"
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          </form>
        )}

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#18251e]/10 flex items-center justify-between gap-3 bg-[#ebe4d5]/60">
          <div className="text-xs text-[#524d45]">
            Al guardar, el banquete cambiará su estado a <strong className="text-[#18251e]">Finalizado</strong>.
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-bold text-[#524d45] hover:text-[#18251e] hover:bg-[#18251e]/5 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving || loading}
              className="px-5 py-2 rounded-xl bg-[#18241d] hover:bg-[#111a14] text-white font-bold text-sm shadow-md shadow-[#18241d]/20 transition-all cursor-pointer disabled:opacity-50 active:scale-95 flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              {saving ? 'Guardando Auditoría...' : 'Cerrar Banquete & Guardar Auditoría'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
