import React, { useState, useEffect } from 'react'
import { eventsApi } from '../../api/events'
import type { Event, CreateEventRequest, UpdateEventRequest, EventShoppingList } from '../../types/event'
import { EventModal } from './EventModal'
import { PostMortemModal } from './PostMortemModal'
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
  RefreshCw,
  UtensilsCrossed,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Scale,
  RotateCcw,
  FileText
} from 'lucide-react'

export const EventsView: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([])
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [shoppingList, setShoppingList] = useState<EventShoppingList | null>(null)
  const [loadingEvents, setLoadingEvents] = useState(true)
  const [loadingList, setLoadingList] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isPostMortemOpen, setIsPostMortemOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [showPassSheet, setShowPassSheet] = useState(true)

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

  const handleOpenPostMortem = () => {
    setIsPostMortemOpen(true)
  }

  const handleReopen = async (id: string, name: string) => {
    if (!confirm(`¿Reabrir el banquete "${name}" a estado Planificado? Podrás modificar su menú y volver a auditarlo.`)) {
      return
    }
    try {
      await eventsApi.reopenEvent(id)
      gooeyToast.success('Banquete reabierto', {
        description: `"${name}" vuelve a estar en fase de planificación.`,
      })
      await loadEvents(id)
    } catch (err: unknown) {
      gooeyToast.error('No se pudo reabrir el banquete', {
        description: err instanceof Error ? err.message : 'Ocurrió un error inesperado.',
      })
    }
  }

  const handleSave = async (data: CreateEventRequest | UpdateEventRequest) => {
    if ('id' in data) {
      await eventsApi.update(data.id, data as UpdateEventRequest)
      gooeyToast.success('Banquete actualizado', {
        description: `Menú, excepciones dietéticas y comensales recalculados para "${data.name}".`,
      })
      await loadEvents(data.id)
    } else {
      const createdId = await eventsApi.create(data as CreateEventRequest)
      gooeyToast.success('Banquete programado', {
        description: `Escandallo generado para ${data.standardGuests} comensales con sus excepciones.`,
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

    let text = `📋 PEDIDO DE COMPRA & PASE DE COCINA - ${shoppingList.eventName}\n`
    text += `📅 Fecha: ${new Date(shoppingList.eventDate).toLocaleDateString('es-ES')} | Comensales: ${shoppingList.guests} (${shoppingList.standardGuests} estándar + ${shoppingList.dietaryGuests} especiales)\n`
    text += `--------------------------------------------------\n`

    if (shoppingList.dietaryRequirements && shoppingList.dietaryRequirements.length > 0) {
      text += `\n🌾 MENÚS ESPECIALES & ALERGIAS:\n`
      shoppingList.dietaryRequirements.forEach(req => {
        text += `• ${req.requirementName}: ${req.guestCount} pax`
        if (req.substituteDishName) {
          text += ` -> Preparar: ${req.substituteDishName}`
        }
        if (req.notes) {
          text += ` (${req.notes})`
        }
        text += `\n`
      })
    }

    if (shoppingList.dishBreakdown && shoppingList.dishBreakdown.length > 0) {
      text += `\n🍽 FICHA DE PASE DE COCINA (RACIONES EXACTAS):\n`
      shoppingList.dishBreakdown.forEach(d => {
        text += `• ${d.dishName}: ${d.totalPortionsToCook} raciones (${d.category})`
        if (!d.isMenuDish) {
          text += ` [PLATO ESPECIAL SUSTITUTO]`
        }
        text += `\n`
      })
    }

    text += `\n🛒 PEDIDO A PROVEEDORES:\n`
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
    gooeyToast.success('Lista de compra y pase copiada', {
      description: 'El resumen formateado está en tu portapapeles listo para enviar por WhatsApp o email.',
    })
  }

  const handlePrint = () => {
    window.print()
  }

  const currentEvent = events.find(e => e.id === selectedEventId)
  const isCompleted = currentEvent?.status === 'Completed'

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header y Acciones */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-[#18251e] flex items-center gap-2.5">
            <Calendar className="w-7 h-7 text-[#5a341e]" />
            Banquetes & Escandallo de Compras
          </h1>
          <p className="text-sm text-[#524d45] mt-1">
            Motor de cálculo para bodas, catering y eventos. Consolida ingredientes, descuenta stock de cámara y audita mermas reales post-servicio.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadEvents()}
            className="p-2.5 rounded-xl bg-white border border-[#18251e]/15 text-[#524d45] hover:text-[#18251e] hover:border-[#5a341e]/50 transition-colors cursor-pointer shadow-sm"
            title="Recargar eventos"
          >
            <RefreshCw className={`w-4 h-4 ${loadingEvents ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleOpenCreate}
            className="px-4 py-2.5 rounded-xl bg-[#5a341e] hover:bg-[#472917] text-white font-bold text-sm shadow-md shadow-[#5a341e]/20 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            Nuevo Banquete
          </button>
        </div>
      </div>

      {loadingEvents ? (
        <div className="p-16 text-center text-[#524d45] flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-[#5a341e]" />
          <p className="text-sm font-medium">Cargando eventos desde MySQL...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="p-16 text-center text-[#524d45] flex flex-col items-center justify-center gap-3 bg-white border border-[#18251e]/10 rounded-2xl shadow-sm">
          <Calendar className="w-10 h-10 text-[#726e66]/40" />
          <p className="text-sm font-semibold text-[#18251e]">No hay banquetes programados</p>
          <p className="text-xs text-[#726e66] max-w-sm">
            Crea tu primer banquete con comensales, platos y menús especiales para ver la lista de compra consolidada.
          </p>
          <button
            onClick={handleOpenCreate}
            className="mt-2 px-4 py-2 rounded-xl bg-[#5a341e] text-white font-bold text-xs cursor-pointer shadow-sm"
          >
            Crear Banquete
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Selector lateral de eventos */}
          <div className="lg:col-span-1 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#726e66] block px-1">
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
                const specialDiners = evt.dietaryRequirements?.reduce((sum, r) => sum + r.guestCount, 0) || 0
                const evtCompleted = evt.status === 'Completed'

                return (
                  <div
                    key={evt.id}
                    onClick={() => handleSelectEvent(evt.id)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col gap-2 shadow-sm ${
                      isSelected
                        ? 'bg-[#5a341e]/10 border-[#5a341e]/50 shadow-md shadow-[#5a341e]/10'
                        : 'bg-white border-[#18251e]/10 hover:border-[#5a341e]/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className={`text-sm font-bold truncate ${isSelected ? 'text-[#5a341e]' : 'text-[#18251e]'}`}>
                        {evt.name}
                      </h4>
                      <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => handleOpenEdit(evt)}
                          className="p-1 rounded text-[#726e66] hover:text-[#5a341e] hover:bg-[#18251e]/5 transition-colors cursor-pointer"
                          title="Editar evento y excepciones"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(evt.id, evt.name)}
                          className="p-1 rounded text-[#726e66] hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Eliminar evento"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Estado del Banquete */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {evtCompleted ? (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#18241d] text-emerald-300 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          Finalizado / Auditado
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#ebe4d5] text-[#5a341e] border border-[#5a341e]/20">
                          Planificado
                        </span>
                      )}

                      {specialDiners > 0 && (
                        <span className="flex items-center gap-1 text-[10px] text-[#5a341e] font-semibold bg-[#5a341e]/10 px-1.5 py-0.5 rounded-md border border-[#5a341e]/15">
                          <ShieldAlert className="w-2.5 h-2.5 shrink-0" />
                          {specialDiners} pax dieta esp.
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs text-[#524d45]">
                      <span className="font-medium text-[#18251e]/80">{dateStr}</span>
                      <span className="inline-flex items-center gap-1 font-mono font-bold text-[#5a341e]">
                        <Users className="w-3 h-3" />
                        {evt.standardGuests} pax
                      </span>
                    </div>

                    <div className="text-[11px] text-[#726e66] truncate pt-1 border-t border-[#18251e]/8">
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
              <div className="p-16 text-center text-[#524d45] flex flex-col items-center justify-center gap-3 bg-white border border-[#18251e]/10 rounded-2xl shadow-sm">
                <RefreshCw className="w-7 h-7 animate-spin text-[#5a341e]" />
                <p className="text-sm font-medium">Calculando escandallos, deducciones de stock y raciones de menús especiales...</p>
              </div>
            ) : !shoppingList ? (
              <div className="p-16 text-center text-[#524d45] bg-white border border-[#18251e]/10 rounded-2xl shadow-sm">
                Selecciona un evento para ver su escandallo detallado.
              </div>
            ) : (
              <div className="space-y-6">
                {/* Resumen del Evento & Botonera */}
                <div className="p-6 rounded-2xl bg-white border border-[#18251e]/10 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {isCompleted ? (
                        <span className="px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider bg-[#18241d] text-emerald-300 flex items-center gap-1.5 shadow-sm">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          Banquete Finalizado & Auditado
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider bg-[#5a341e]/10 text-[#5a341e] border border-[#5a341e]/20">
                          Banquete en Planificación
                        </span>
                      )}

                      <span className="text-xs text-[#726e66]">
                        {new Date(shoppingList.eventDate).toLocaleDateString('es-ES', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>

                    <h2 className="text-2xl font-extrabold font-heading text-[#18251e] mt-1.5">
                      {shoppingList.eventName}
                    </h2>
                    <p className="text-xs text-[#524d45] mt-1">
                      <strong>{shoppingList.guests} comensales totales</strong> ({shoppingList.standardGuests} menú estándar + {shoppingList.dietaryGuests} dietas especiales) • {shoppingList.totalDishes} platos en menú • {shoppingList.items.length} ingredientes consolidados
                    </p>
                  </div>

                  {/* Botonera de Acciones (Auditoría, Copiar y Reabrir) */}
                  <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
                    {/* Botón Auditoría Post-Servicio */}
                    {isCompleted ? (
                      <>
                        <button
                          onClick={handleOpenPostMortem}
                          className="px-3.5 py-2 rounded-xl bg-[#18241d] hover:bg-[#111a14] text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                          title="Ver o editar el informe de mermas reales"
                        >
                          <Scale className="w-3.5 h-3.5 text-emerald-400" />
                          Ver Auditoría Post-Mortem
                        </button>

                        <button
                          onClick={() => currentEvent && handleReopen(currentEvent.id, currentEvent.name)}
                          className="px-3 py-2 rounded-xl bg-white hover:bg-[#ebe4d5]/50 text-[#726e66] hover:text-[#18251e] border border-[#18251e]/15 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                          title="Volver a poner el banquete en estado de planificación"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          Reabrir
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={handleOpenPostMortem}
                        className="px-3.5 py-2 rounded-xl bg-[#5a341e] hover:bg-[#472917] text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm active:scale-95"
                        title="Registrar los kilos de merma reales y cerrar el banquete"
                      >
                        <Scale className="w-3.5 h-3.5" />
                        Cerrar Banquete & Auditoría
                      </button>
                    )}

                    <button
                      onClick={handleCopyOrder}
                      className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#ebe4d5]/50 text-[#18251e] border border-[#18251e]/15 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
                    >
                      <Copy className="w-3.5 h-3.5 text-[#5a341e]" />
                      Copiar Pedido
                    </button>

                    <button
                      onClick={handlePrint}
                      className="px-3.5 py-2 rounded-xl bg-[#ebe4d5] hover:bg-[#ded4c1] text-[#18251e] text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      Imprimir
                    </button>
                  </div>
                </div>

                {/* Banner de Observaciones Post-Mortem si el evento está finalizado */}
                {isCompleted && currentEvent?.postMortemNotes && (
                  <div className="p-4 rounded-2xl bg-[#ebe4d5]/40 border border-[#18251e]/15 shadow-sm space-y-1 animate-fade-in">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#5a341e] flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" />
                      Observaciones de Cierre de Cocina
                    </span>
                    <p className="text-xs text-[#18251e] italic">
                      "{currentEvent.postMortemNotes}"
                    </p>
                    {currentEvent.completedAt && (
                      <span className="text-[10px] text-[#726e66] block pt-1">
                        Auditado el {new Date(currentEvent.completedAt).toLocaleString('es-ES')}
                      </span>
                    )}
                  </div>
                )}

                {/* Banner de Excepciones Dietéticas si existen */}
                {shoppingList.dietaryRequirements && shoppingList.dietaryRequirements.length > 0 && (
                  <div className="p-4 rounded-2xl bg-[#ebe4d5]/60 border border-[#18251e]/15 shadow-sm space-y-2.5 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#18251e] flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-[#5a341e]" />
                        Excepciones Dietéticas & Alergias ({shoppingList.dietaryGuests} comensales especiales)
                      </span>
                      <span className="text-[11px] text-[#726e66]">
                        {shoppingList.dietaryRequirements.length} {shoppingList.dietaryRequirements.length === 1 ? 'condición registrada' : 'condiciones registradas'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {shoppingList.dietaryRequirements.map((req, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-white border border-[#18251e]/10 shadow-xs flex flex-col gap-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-[#18251e] truncate">
                              {req.requirementName}
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-[#5a341e]/10 text-[#5a341e] font-mono font-bold text-xs">
                              {req.guestCount} pax
                            </span>
                          </div>
                          {req.replacedDishName && (
                            <div className="text-[11px] text-rose-700">
                              ⛔ NO toman: <strong>{req.replacedDishName}</strong>
                            </div>
                          )}
                          {req.substituteDishName && (
                            <div className="text-[11px] text-emerald-800 font-medium">
                              🍽 Sustituto: <strong>{req.substituteDishName}</strong>
                            </div>
                          )}
                          {req.notes && (
                            <div className="text-[10px] text-[#726e66] italic mt-0.5 border-t border-[#18251e]/8 pt-1">
                              💬 {req.notes}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Banner de Alertas si hay ingredientes con stock bajo */}
                {shoppingList.totalStockAlerts > 0 && (
                  <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3 animate-fade-in shadow-sm">
                    <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-bold text-sm text-rose-900">
                        ¡Atención! {shoppingList.totalStockAlerts} {shoppingList.totalStockAlerts === 1 ? 'ingrediente tiene' : 'ingredientes tienen'} alerta de stock crítico
                      </strong>
                      <p className="mt-0.5 text-rose-700">
                        El stock disponible en cámara es insuficiente para cubrir la elaboración del evento sin caer por debajo del umbral mínimo de seguridad.
                      </p>
                    </div>
                  </div>
                )}

                {/* Métricas Culinarias Destacadas */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-white border border-[#18251e]/10 shadow-sm">
                    <span className="text-xs text-[#726e66] font-bold uppercase tracking-wider block">Comensales</span>
                    <span className="text-2xl font-bold font-heading text-[#18251e] mt-1 block">
                      {shoppingList.guests} pax
                    </span>
                    <span className="text-[11px] text-[#726e66] mt-1 block">
                      {shoppingList.standardGuests} estándar • {shoppingList.dietaryGuests} especiales
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 shadow-sm">
                    <span className="text-xs text-emerald-800 font-bold uppercase tracking-wider block flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      Merma Reutilizable Estimada
                    </span>
                    <span className="text-2xl font-bold font-heading text-emerald-900 mt-1 block">
                      +{shoppingList.totalEstimatedReusableTrimmings.toFixed(2)} Kg
                    </span>
                    <span className="text-[11px] text-emerald-700 mt-1 block">
                      Subproducto limpio para albóndigas / caldos
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-white border border-[#18251e]/10 shadow-sm">
                    <span className="text-xs text-[#726e66] font-bold uppercase tracking-wider block">
                      Artículos a Proveedor
                    </span>
                    <span className="text-2xl font-bold font-heading text-[#5a341e] mt-1 block">
                      {shoppingList.items.filter(i => i.quantityToBuy > 0 || (i.isPurchasedByPiece && (i.piecesToBuy ?? 0) > 0)).length}
                    </span>
                    <span className="text-[11px] text-[#726e66] mt-1 block">Con necesidad de compra</span>
                  </div>
                </div>

                {/* Ficha de Pase de Partida & Producción de Cocina */}
                {shoppingList.dishBreakdown && shoppingList.dishBreakdown.length > 0 && (
                  <div className="bg-white border border-[#18251e]/10 rounded-2xl overflow-hidden shadow-sm">
                    <div 
                      onClick={() => setShowPassSheet(!showPassSheet)}
                      className="px-6 py-3.5 border-b border-[#18251e]/10 bg-[#ebe4d5]/60 flex items-center justify-between cursor-pointer select-none"
                    >
                      <span className="text-xs font-bold uppercase tracking-wider text-[#18251e] flex items-center gap-2">
                        <UtensilsCrossed className="w-4 h-4 text-[#5a341e]" />
                        Ficha de Pase de Partida & Raciones a Emplatar ({shoppingList.dishBreakdown.length} recetas)
                      </span>
                      <div className="flex items-center gap-2 text-xs text-[#524d45]">
                        <span>{showPassSheet ? 'Ocultar' : 'Mostrar'}</span>
                        {showPassSheet ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>

                    {showPassSheet && (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                          <thead>
                            <tr className="border-b border-[#18251e]/10 bg-[#ebe4d5]/30 text-[#18251e]/75 text-[11px] uppercase tracking-wider font-bold">
                              <th className="py-3 px-4">Plato & Categoría</th>
                              <th className="py-3 px-4">Tipo</th>
                              <th className="py-3 px-4">Raciones a Cocinar</th>
                              <th className="py-3 px-4">Ajustes & Excepciones Dietéticas</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#18251e]/8">
                            {shoppingList.dishBreakdown.map(dish => (
                              <tr key={dish.dishId} className="hover:bg-[#ebe4d5]/20 transition-colors">
                                <td className="py-3 px-4">
                                  <div className="font-bold text-[#18251e]">{dish.dishName}</div>
                                  <div className="text-[11px] text-[#726e66]">{dish.category}</div>
                                </td>
                                <td className="py-3 px-4">
                                  {dish.isMenuDish ? (
                                    <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#18251e]/8 text-[#18251e]">
                                      Menú Principal
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#5a341e]/10 text-[#5a341e] border border-[#5a341e]/20">
                                      Sustituto Especial
                                    </span>
                                  )}
                                </td>
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-2">
                                    <span className="text-base font-extrabold font-mono text-[#5a341e]">
                                      {dish.totalPortionsToCook} rac.
                                    </span>
                                    {dish.isMenuDish && dish.substitutedOutPortions > 0 && (
                                      <span className="text-[11px] text-[#726e66] font-mono">
                                        ({dish.standardPortions} base - {dish.substitutedOutPortions} sustituidas)
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="py-3 px-4 text-xs">
                                  {dish.specialRequirementNotes.length > 0 ? (
                                    <div className="space-y-1">
                                      {dish.specialRequirementNotes.map((note, idx) => (
                                        <div key={idx} className="flex items-center gap-1.5 text-[#524d45]">
                                          <span className="w-1.5 h-1.5 rounded-full bg-[#5a341e]" />
                                          <span>{note}</span>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <span className="text-[#726e66] text-xs italic">
                                      Sin modificaciones (100% de comensales estándar)
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* Tabla de Compra y Escandallos */}
                <div className="bg-white border border-[#18251e]/10 rounded-2xl overflow-hidden shadow-sm">
                  <div className="px-6 py-3.5 border-b border-[#18251e]/10 bg-[#ebe4d5]/60 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#18251e] flex items-center gap-2">
                      <ShoppingCart className="w-4 h-4 text-[#5a341e]" />
                      Hoja de Pedido Técnica & Aprovechamiento
                    </span>
                    <span className="text-xs text-[#524d45]">
                      Fórmula: <strong className="text-[#18251e]">Bruto = Neto / (1 - Mermas)</strong>
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="border-b border-[#18251e]/10 bg-[#ebe4d5]/40 text-[#18251e]/75 text-[11px] uppercase tracking-wider font-bold">
                          <th className="py-3 px-4">Ingrediente & Recetas</th>
                          <th className="py-3 px-4">Consumo Neto</th>
                          <th className="py-3 px-4">Mermas (Técnica / Subproducto)</th>
                          <th className="py-3 px-4">Stock en Cámara</th>
                          <th className="py-3 px-4">A Pedir a Proveedor</th>
                          <th className="py-3 px-4">Rendimiento Pieza (Regla del Chef)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#18251e]/8">
                        {shoppingList.items.map(item => {
                          const needsBuy = item.quantityToBuy > 0 || (item.isPurchasedByPiece && (item.piecesToBuy ?? 0) > 0)

                          return (
                            <tr key={item.ingredientId} className={`hover:bg-[#ebe4d5]/25 transition-colors ${item.isLowStockAlert ? 'bg-rose-50/50' : ''}`}>
                              {/* Ingrediente y Platos */}
                              <td className="py-3.5 px-4">
                                <div className="font-bold text-[#18251e] flex items-center gap-2">
                                  {item.ingredientName}
                                  {item.isLowStockAlert && (
                                    <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" title={item.lowStockMessage || 'Stock crítico'} />
                                  )}
                                </div>
                                <div className="text-[11px] text-[#524d45] mt-0.5">
                                  Proveedor: <strong className="text-[#18251e]">{item.defaultProvider}</strong>
                                </div>
                                <div className="text-[10px] text-[#5a341e] mt-1 flex flex-wrap gap-1">
                                  {item.usedInDishes.map(d => (
                                    <span key={d} className="px-1.5 py-0.5 rounded bg-[#ebe4d5]/60 border border-[#18251e]/10 font-medium">
                                      {d}
                                    </span>
                                  ))}
                                </div>
                                {item.isLowStockAlert && item.lowStockMessage && (
                                  <div className="text-[10px] text-rose-700 mt-1 italic font-medium">
                                    ⚠️ {item.lowStockMessage}
                                  </div>
                                )}
                              </td>

                              {/* Consumo Neto */}
                              <td className="py-3.5 px-4 font-mono">
                                <span className="font-bold text-[#18251e]">
                                  {item.totalNetQuantity} {item.unitOfMeasure}
                                </span>
                                <div className="text-[10px] text-[#726e66]">Consumo exacto en plato</div>
                              </td>

                              {/* Mermas */}
                              <td className="py-3.5 px-4 text-xs">
                                <div className="text-rose-700 font-medium">
                                  🗑 {(item.wastePercentage * 100).toFixed(0)}% basura ({item.estimatedNetTrashQuantity} {item.unitOfMeasure})
                                </div>
                                {item.reusableWastePercentage > 0 && (
                                  <div className="text-emerald-800 font-bold mt-0.5 flex items-center gap-1">
                                    ♻️ +{(item.reusableWastePercentage * 100).toFixed(0)}% ({item.estimatedReusableQuantity} {item.unitOfMeasure} para albóndigas)
                                  </div>
                                )}
                                <div className="text-[10px] text-[#726e66] mt-1 font-mono">
                                  Bruto total requerido: {item.totalGrossQuantityRequired} {item.unitOfMeasure}
                                </div>
                              </td>

                              {/* Stock en Cámara */}
                              <td className="py-3.5 px-4 text-xs font-mono">
                                <div className={`${item.currentStock <= item.minimumStock ? 'text-rose-700 font-bold' : 'text-[#18251e]'}`}>
                                  {item.currentStock} {item.unitOfMeasure}
                                </div>
                                <div className="text-[10px] text-[#726e66]">
                                  Mín. seguridad: {item.minimumStock} {item.unitOfMeasure}
                                </div>
                              </td>

                              {/* A Pedir a Proveedor */}
                              <td className="py-3.5 px-4">
                                {item.isPurchasedByPiece ? (
                                  <div>
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-sm font-bold bg-[#5a341e]/10 text-[#5a341e] border border-[#5a341e]/25">
                                      {item.piecesToBuy} Piezas
                                    </span>
                                    <div className="text-[10px] text-[#726e66] mt-0.5">
                                      Equiv. a {item.quantityToBuy} {item.unitOfMeasure}
                                    </div>
                                  </div>
                                ) : needsBuy ? (
                                  <div className="font-mono">
                                    <span className="text-base font-extrabold text-[#5a341e]">
                                      {item.quantityToBuy} {item.unitOfMeasure}
                                    </span>
                                    <div className="text-[10px] text-[#726e66]">Faltante tras stock</div>
                                  </div>
                                ) : (
                                  <div className="inline-flex items-center gap-1 text-emerald-800 font-bold text-xs">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    0 {item.unitOfMeasure} (Cubierto en cámara)
                                  </div>
                                )}
                              </td>

                              {/* Rendimiento Pieza (Regla del Chef) */}
                              <td className="py-3.5 px-4 text-xs">
                                {item.isPurchasedByPiece && item.minPortionsPerPiece ? (
                                  <div className="p-2.5 rounded-xl bg-[#ebe4d5]/40 border border-[#18251e]/10 space-y-1">
                                    <div className="font-bold text-[#5a341e]">
                                      {item.minPortionsPerPiece} a {item.maxPortionsPerPiece ?? item.minPortionsPerPiece} rac./pieza
                                    </div>
                                    <div className="text-[10px] text-[#524d45]">
                                      Rendimiento: <strong className="text-[#18251e]">{item.estimatedMinPortionsYield} a {item.estimatedMaxPortionsYield} raciones</strong>
                                    </div>
                                    {item.estimatedSurplusPortions !== null && item.estimatedSurplusPortions !== undefined && item.estimatedSurplusPortions > 0 && (
                                      <div className="text-[10px] text-emerald-800 font-bold">
                                        🛡 Colchón seguridad: +{item.estimatedSurplusPortions} raciones extra
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-xs text-[#726e66] italic">A granel ({item.unitOfMeasure})</span>
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

      {/* Modal de Auditoría Post-Mortem */}
      {isPostMortemOpen && selectedEventId && currentEvent && (
        <PostMortemModal
          isOpen={isPostMortemOpen}
          eventId={selectedEventId}
          eventName={currentEvent.name}
          onClose={() => setIsPostMortemOpen(false)}
          onSaved={async () => {
            await loadEvents(selectedEventId)
          }}
        />
      )}
    </div>
  )
}
