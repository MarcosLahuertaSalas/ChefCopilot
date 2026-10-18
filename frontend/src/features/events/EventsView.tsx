import React, { useState, useEffect } from 'react'
import { eventsApi } from '../../api/events'
import type { Event, CreateEventRequest, UpdateEventRequest, EventShoppingList } from '../../types/event'
import { EventModal } from './EventModal'
import { gooeyToast } from 'goey-toast'
import { 
  Calendar, 
  Users, 
  Plus, 
  Trash2, 
  Edit2, 
  AlertTriangle, 
  ShoppingCart, 
  Sparkles, 
  Copy, 
  Printer, 
  CheckCircle2, 
  RefreshCw
} from 'lucide-react'

export const EventsView: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([])
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [shoppingList, setShoppingList] = useState<EventShoppingList | null>(null)
  const [loadingEvents, setLoadingEvents] = useState(true)
  const [loadingList, setLoadingList] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)

  const loadEvents = async (autoSelectId?: string) => {
    setLoadingEvents(true)
    try {
      const data = await eventsApi.getAll()
      setEvents(data)

      if (data.length > 0) {
        const idToSelect = autoSelectId || selectedEventId || data[0].id
        setSelectedEventId(idToSelect)
        loadShoppingList(idToSelect)
      } else {
        setSelectedEventId(null)
        setShoppingList(null)
      }
    } catch (err: unknown) {
      gooeyToast.error('Error al cargar banquetes', {
        description: err instanceof Error ? err.message : 'No se pudo conectar con el servidor',
      })
    } finally {
      setLoadingEvents(false)
    }
  }

  const loadShoppingList = async (id: string) => {
    setLoadingList(true)
    try {
      const data = await eventsApi.getShoppingList(id)
      setShoppingList(data)
    } catch (err: unknown) {
      gooeyToast.error('Error al calcular el escandallo del evento', {
        description: err instanceof Error ? err.message : 'Verifica que los platos tengan ingredientes asociados.',
      })
    } finally {
      setLoadingList(false)
    }
  }

  useEffect(() => {
    loadEvents()
  }, [])

  const handleSelectEvent = (id: string) => {
    setSelectedEventId(id)
    loadShoppingList(id)
  }

  const handleOpenCreate = () => {
    setEditingEvent(null)
    setIsModalOpen(true)
  }

  const handleOpenEdit = (evt: Event) => {
    setEditingEvent(evt)
    setIsModalOpen(true)
  }

  const handleSave = async (data: CreateEventRequest | UpdateEventRequest) => {
    if ('id' in data) {
      await eventsApi.update(data.id, data as UpdateEventRequest)
      gooeyToast.success('Banquete actualizado', {
        description: `Menú y comensales recalculados para "${data.name}".`,
      })
      await loadEvents(data.id)
    } else {
      const createdId = await eventsApi.create(data as CreateEventRequest)
      gooeyToast.success('Banquete programado', {
        description: `Escandallo generado para ${data.standardGuests} comensales.`,
      })
      await loadEvents(createdId)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar el banquete "${name}"?`)) return
    try {
      await eventsApi.delete(id)
      gooeyToast.success('Banquete eliminado', {
        description: `"${name}" fue eliminado del calendario.`,
      })
      await loadEvents()
    } catch (err: unknown) {
      gooeyToast.error('No se pudo eliminar el banquete', {
        description: err instanceof Error ? err.message : 'Ocurrió un error inesperado.',
      })
    }
  }

  const handleCopyOrder = () => {
    if (!shoppingList) return

    let text = `📋 PEDIDO DE COMPRA - ${shoppingList.eventName}\n`
    text += `📅 Fecha: ${new Date(shoppingList.eventDate).toLocaleDateString()} | Comensales: ${shoppingList.guests}\n`
    text += `--------------------------------------------------\n`

    shoppingList.items.forEach(item => {
      if (item.isPurchasedByPiece && item.piecesToBuy) {
        text += `• ${item.ingredientName}: PEDIR ${item.piecesToBuy} PIEZAS (Mínimo garantizado: ${item.minPortionsPerPiece} rac./pieza) - Prov: ${item.defaultProvider}\n`
      } else {
        const qty = item.quantityToBuy > 0 ? `${item.quantityToBuy} ${item.unitOfMeasure}` : `Cubierto con stock (${item.totalGrossQuantityRequired} ${item.unitOfMeasure} requeridos)`
        text += `• ${item.ingredientName}: ${qty} - Prov: ${item.defaultProvider}\n`
      }
    })

    if (shoppingList.totalEstimatedReusableTrimmings > 0) {
      text += `\n♻️ Merma Reutilizable Estimada: ${shoppingList.totalEstimatedReusableTrimmings} Kg (para albóndigas/caldos)\n`
    }

    navigator.clipboard.writeText(text)
    gooeyToast.success('Lista de compra copiada', {
      description: 'El resumen formateado está en tu portapapeles listo para enviar por WhatsApp o email.',
    })
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header y Acciones */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-[#ffedd7] flex items-center gap-2.5">
            <Calendar className="w-7 h-7 text-amber-500" />
            Banquetes & Escandallo de Compras
          </h1>
          <p className="text-sm text-[#a89988] mt-1">
            Motor de cálculo para bodas, catering y eventos. Consolida ingredientes, descuenta stock de cámara y optimiza compras por piezas.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadEvents()}
            className="p-2.5 rounded-xl bg-[#1c120c] border border-[#40372e] text-[#a89988] hover:text-[#ffedd7] hover:border-amber-500/50 transition-colors cursor-pointer"
            title="Recargar eventos"
          >
            <RefreshCw className={`w-4 h-4 ${loadingEvents ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleOpenCreate}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            Nuevo Banquete
          </button>
        </div>
      </div>

      {loadingEvents ? (
        <div className="p-16 text-center text-[#a89988] flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-amber-500" />
          <p className="text-sm font-medium">Cargando eventos desde MySQL...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="p-16 text-center text-[#a89988] flex flex-col items-center justify-center gap-3 bg-[#1c120c] border border-[#40372e] rounded-2xl">
          <Calendar className="w-10 h-10 text-[#40372e]" />
          <p className="text-sm font-semibold text-[#ffedd7]">No hay banquetes programados</p>
          <p className="text-xs text-[#a89988] max-w-sm">
            Crea tu primer banquete con comensales y platos del menú para ver la lista de compra consolidada.
          </p>
          <button
            onClick={handleOpenCreate}
            className="mt-2 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs cursor-pointer"
          >
            Crear Banquete
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Selector lateral de eventos */}
          <div className="lg:col-span-1 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#a89988] block px-1">
              Eventos Programados ({events.length})
            </span>

            <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
              {events.map(evt => {
                const isSelected = evt.id === selectedEventId
                const dateStr = new Date(evt.eventDate).toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })

                return (
                  <div
                    key={evt.id}
                    onClick={() => handleSelectEvent(evt.id)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col gap-1.5 ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500/60 shadow-lg shadow-amber-500/10'
                        : 'bg-[#1c120c] border-[#40372e] hover:border-[#a89988]/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className={`text-sm font-bold truncate ${isSelected ? 'text-amber-400' : 'text-[#ffedd7]'}`}>
                        {evt.name}
                      </h4>
                      <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => handleOpenEdit(evt)}
                          className="p-1 rounded text-[#a89988] hover:text-amber-400 hover:bg-[#40372e]/50 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(evt.id, evt.name)}
                          className="p-1 rounded text-[#a89988] hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-[#a89988]">
                      <span className="font-medium text-[#ffedd7]/80">{dateStr}</span>
                      <span className="inline-flex items-center gap-1 font-mono font-bold text-amber-500/90">
                        <Users className="w-3 h-3" />
                        {evt.standardGuests} pax
                      </span>
                    </div>

                    <div className="text-[11px] text-[#a89988] truncate pt-1 border-t border-[#40372e]/40">
                      {evt.menuDishes.length} {evt.menuDishes.length === 1 ? 'plato' : 'platos'}: {evt.menuDishes.map(d => d.name).join(', ')}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Panel Principal: Calculadora de Compra y Escandallo */}
          <div className="lg:col-span-3 space-y-6">
            {loadingList ? (
              <div className="p-16 text-center text-[#a89988] flex flex-col items-center justify-center gap-3 bg-[#1c120c] border border-[#40372e] rounded-2xl">
                <RefreshCw className="w-7 h-7 animate-spin text-amber-500" />
                <p className="text-sm font-medium">Calculando escandallos, deducciones de stock y mermas...</p>
              </div>
            ) : !shoppingList ? (
              <div className="p-16 text-center text-[#a89988] bg-[#1c120c] border border-[#40372e] rounded-2xl">
                Selecciona un evento para ver su escandallo detallado.
              </div>
            ) : (
              <div className="space-y-6">
                {/* Resumen del Evento & Botonera */}
                <div className="p-6 rounded-2xl bg-[#1c120c] border border-[#40372e] shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30">
                        Banquete Activo
                      </span>
                      <span className="text-xs text-[#a89988]">
                        {new Date(shoppingList.eventDate).toLocaleDateString('es-ES', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <h2 className="text-2xl font-extrabold font-heading text-[#ffedd7] mt-1">
                      {shoppingList.eventName}
                    </h2>
                    <p className="text-xs text-[#a89988] mt-1">
                      {shoppingList.guests} comensales • {shoppingList.totalDishes} platos en menú • {shoppingList.items.length} ingredientes consolidados
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <button
                      onClick={handleCopyOrder}
                      className="px-3.5 py-2 rounded-xl bg-[#100904] hover:bg-[#100904]/80 text-[#ffedd7] border border-[#40372e] text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5 text-amber-400" />
                      Copiar Pedido
                    </button>
                    <button
                      onClick={handlePrint}
                      className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      Imprimir Ficha
                    </button>
                  </div>
                </div>

                {/* Banner de Alertas si hay ingredientes con stock bajo */}
                {shoppingList.totalStockAlerts > 0 && (
                  <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/80 text-rose-300 text-xs flex items-start gap-3 animate-fade-in">
                    <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-bold text-sm">
                        ¡Atención! {shoppingList.totalStockAlerts} {shoppingList.totalStockAlerts === 1 ? 'ingrediente tiene' : 'ingredientes tienen'} alerta de stock crítico
                      </strong>
                      <p className="mt-0.5 text-rose-200/80">
                        El stock disponible en cámara es insuficiente para cubrir la elaboración del evento sin caer por debajo del umbral mínimo de seguridad.
                      </p>
                    </div>
                  </div>
                )}

                {/* Métricas Culinarias Destacadas */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-[#100904] border border-[#40372e]">
                    <span className="text-xs text-[#a89988] font-semibold uppercase tracking-wider block">Comensales</span>
                    <span className="text-2xl font-bold font-heading text-[#ffedd7] mt-1 block">
                      {shoppingList.guests} pax
                    </span>
                    <span className="text-[11px] text-[#a89988] mt-1 block">1 ración por comensal</span>
                  </div>

                  <div className="p-4 rounded-xl bg-[#100904] border border-emerald-500/30">
                    <span className="text-xs text-emerald-400 font-semibold uppercase tracking-wider block flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      Merma Reutilizable Estimada
                    </span>
                    <span className="text-2xl font-bold font-heading text-emerald-300 mt-1 block">
                      +{shoppingList.totalEstimatedReusableTrimmings.toFixed(2)} Kg
                    </span>
                    <span className="text-[11px] text-[#a89988] mt-1 block">
                      Subproducto limpio para albóndigas / caldos
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-[#100904] border border-[#40372e]">
                    <span className="text-xs text-[#a89988] font-semibold uppercase tracking-wider block">
                      Artículos a Proveedor
                    </span>
                    <span className="text-2xl font-bold font-heading text-amber-400 mt-1 block">
                      {shoppingList.items.filter(i => i.quantityToBuy > 0 || (i.isPurchasedByPiece && (i.piecesToBuy ?? 0) > 0)).length}
                    </span>
                    <span className="text-[11px] text-[#a89988] mt-1 block">Con necesidad de compra</span>
                  </div>
                </div>

                {/* Tabla de Compra y Escandallos */}
                <div className="bg-[#1c120c] border border-[#40372e] rounded-2xl overflow-hidden shadow-2xl">
                  <div className="px-6 py-3.5 border-b border-[#40372e] bg-[#100904] flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#ffedd7] flex items-center gap-2">
                      <ShoppingCart className="w-4 h-4 text-amber-400" />
                      Hoja de Pedido Técnica & Aprovechamiento
                    </span>
                    <span className="text-xs text-[#a89988]">
                      Fórmula: <strong className="text-[#ffedd7]">Bruto = Neto / (1 - Mermas)</strong>
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="border-b border-[#40372e] bg-[#100904]/50 text-[#a89988] text-[11px] uppercase tracking-wider font-semibold">
                          <th className="py-3 px-4">Ingrediente & Recetas</th>
                          <th className="py-3 px-4">Consumo Neto</th>
                          <th className="py-3 px-4">Mermas (Técnica / Subproducto)</th>
                          <th className="py-3 px-4">Stock en Cámara</th>
                          <th className="py-3 px-4">A Pedir a Proveedor</th>
                          <th className="py-3 px-4">Rendimiento Pieza (Regla del Chef)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#40372e]/60">
                        {shoppingList.items.map(item => {
                          const needsBuy = item.quantityToBuy > 0 || (item.isPurchasedByPiece && (item.piecesToBuy ?? 0) > 0)

                          return (
                            <tr key={item.ingredientId} className={`hover:bg-[#100904]/40 transition-colors ${item.isLowStockAlert ? 'bg-rose-950/10' : ''}`}>
                              {/* Ingrediente y Platos */}
                              <td className="py-3.5 px-4">
                                <div className="font-bold text-[#ffedd7] flex items-center gap-2">
                                  {item.ingredientName}
                                  {item.isLowStockAlert && (
                                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" title={item.lowStockMessage || 'Stock crítico'} />
                                  )}
                                </div>
                                <div className="text-[11px] text-[#a89988] mt-0.5">
                                  Proveedor: <strong className="text-[#ffedd7]/80">{item.defaultProvider}</strong>
                                </div>
                                <div className="text-[10px] text-amber-400/80 mt-1 flex flex-wrap gap-1">
                                  {item.usedInDishes.map(d => (
                                    <span key={d} className="px-1.5 py-0.2 rounded bg-[#100904] border border-[#40372e]">
                                      {d}
                                    </span>
                                  ))}
                                </div>
                                {item.isLowStockAlert && item.lowStockMessage && (
                                  <div className="text-[10px] text-rose-300 mt-1 italic">
                                    ⚠️ {item.lowStockMessage}
                                  </div>
                                )}
                              </td>

                              {/* Consumo Neto */}
                              <td className="py-3.5 px-4 font-mono">
                                <span className="font-semibold text-[#ffedd7]">
                                  {item.totalNetQuantity} {item.unitOfMeasure}
                                </span>
                                <div className="text-[10px] text-[#a89988]">Consumo exacto en plato</div>
                              </td>

                              {/* Mermas */}
                              <td className="py-3.5 px-4 text-xs">
                                <div className="text-rose-400/90 font-medium">
                                  🗑 {(item.wastePercentage * 100).toFixed(0)}% basura ({item.estimatedNetTrashQuantity} {item.unitOfMeasure})
                                </div>
                                {item.reusableWastePercentage > 0 && (
                                  <div className="text-emerald-400 font-bold mt-0.5 flex items-center gap-1">
                                    ♻️ +{(item.reusableWastePercentage * 100).toFixed(0)}% ({item.estimatedReusableQuantity} {item.unitOfMeasure} para albóndigas)
                                  </div>
                                )}
                                <div className="text-[10px] text-[#a89988] mt-1 font-mono">
                                  Bruto total requerido: {item.totalGrossQuantityRequired} {item.unitOfMeasure}
                                </div>
                              </td>

                              {/* Stock en Cámara */}
                              <td className="py-3.5 px-4 text-xs font-mono">
                                <div className={`${item.currentStock <= item.minimumStock ? 'text-rose-400 font-bold' : 'text-[#ffedd7]'}`}>
                                  {item.currentStock} {item.unitOfMeasure}
                                </div>
                                <div className="text-[10px] text-[#a89988]">
                                  Mín. seguridad: {item.minimumStock} {item.unitOfMeasure}
                                </div>
                              </td>

                              {/* A Pedir a Proveedor */}
                              <td className="py-3.5 px-4">
                                {item.isPurchasedByPiece ? (
                                  <div>
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-sm font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                      {item.piecesToBuy} Piezas
                                    </span>
                                    <div className="text-[10px] text-[#a89988] mt-0.5">
                                      Equiv. a {item.quantityToBuy} {item.unitOfMeasure}
                                    </div>
                                  </div>
                                ) : needsBuy ? (
                                  <div className="font-mono">
                                    <span className="text-base font-extrabold text-[#dc5000]">
                                      {item.quantityToBuy} {item.unitOfMeasure}
                                    </span>
                                    <div className="text-[10px] text-[#a89988]">Faltante tras stock</div>
                                  </div>
                                ) : (
                                  <div className="inline-flex items-center gap-1 text-emerald-400 font-semibold text-xs">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    0 {item.unitOfMeasure} (Cubierto en cámara)
                                  </div>
                                )}
                              </td>

                              {/* Rendimiento Pieza (Regla del Chef) */}
                              <td className="py-3.5 px-4 text-xs">
                                {item.isPurchasedByPiece && item.minPortionsPerPiece ? (
                                  <div className="p-2 rounded-lg bg-[#100904] border border-amber-500/30 space-y-1">
                                    <div className="font-bold text-amber-300">
                                      {item.minPortionsPerPiece} a {item.maxPortionsPerPiece ?? item.minPortionsPerPiece} rac./pieza
                                    </div>
                                    <div className="text-[10px] text-[#a89988]">
                                      Rendimiento: <strong className="text-[#ffedd7]">{item.estimatedMinPortionsYield} a {item.estimatedMaxPortionsYield} raciones</strong>
                                    </div>
                                    {item.estimatedSurplusPortions !== null && item.estimatedSurplusPortions !== undefined && item.estimatedSurplusPortions > 0 && (
                                      <div className="text-[10px] text-emerald-400 font-semibold">
                                        🛡 Colchón seguridad: +{item.estimatedSurplusPortions} raciones extra
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-xs text-[#a89988] italic">A granel ({item.unitOfMeasure})</span>
                                )}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de Evento */}
      <EventModal
        isOpen={isModalOpen}
        event={editingEvent}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  )
}
