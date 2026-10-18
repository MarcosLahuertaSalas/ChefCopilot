import React, { useState, useEffect } from 'react'
import type { Event, CreateEventRequest, UpdateEventRequest } from '../../types/event'
import type { Dish } from '../../types/dish'
import { dishesApi } from '../../api/dishes'
import { X, Calendar, Users, UtensilsCrossed, AlertTriangle } from 'lucide-react'

interface EventModalProps {
  isOpen: boolean
  event: Event | null
  onClose: () => void
  onSave: (data: CreateEventRequest | UpdateEventRequest) => Promise<void>
}

export const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  event,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [standardGuests, setStandardGuests] = useState<number>(80)
  const [selectedDishIds, setSelectedDishIds] = useState<string[]>([])
  const [availableDishes, setAvailableDishes] = useState<Dish[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      dishesApi.getAll().then(setAvailableDishes).catch(console.error)
    }

    if (event) {
      setName(event.name)
      setEventDate(event.eventDate ? event.eventDate.split('T')[0] : '')
      setStandardGuests(event.standardGuests || 80)
      setSelectedDishIds(event.menuDishes ? event.menuDishes.map(d => d.id) : [])
    } else {
      setName('')
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 7)
      setEventDate(tomorrow.toISOString().split('T')[0])
      setStandardGuests(80)
      setSelectedDishIds([])
    }
    setError(null)
  }, [event, isOpen])

  if (!isOpen) return null

  const handleToggleDish = (dishId: string) => {
    if (selectedDishIds.includes(dishId)) {
      setSelectedDishIds(selectedDishIds.filter(id => id !== dishId))
    } else {
      setSelectedDishIds([...selectedDishIds, dishId])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError('El nombre del banquete o evento es obligatorio.')
      return
    }

    if (!eventDate) {
      setError('Debes especificar la fecha del evento.')
      return
    }

    if (standardGuests <= 0) {
      setError('El número de comensales debe ser mayor que 0.')
      return
    }

    if (selectedDishIds.length === 0) {
      setError('Debes seleccionar al menos un plato para el menú del evento.')
      return
    }

    setLoading(true)
    try {
      const formattedDate = new Date(eventDate).toISOString()

      if (event) {
        await onSave({
          id: event.id,
          name: name.trim(),
          eventDate: formattedDate,
          standardGuests: Number(standardGuests),
          dishIds: selectedDishIds,
        } as UpdateEventRequest)
      } else {
        await onSave({
          name: name.trim(),
          eventDate: formattedDate,
          standardGuests: Number(standardGuests),
          dishIds: selectedDishIds,
        } as CreateEventRequest)
      }
      onClose()
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Ocurrió un error al guardar el evento.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl bg-[#1c120c] border border-[#40372e] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Encabezado */}
        <div className="px-6 py-4 border-b border-[#40372e] flex items-center justify-between bg-[#100904]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Calendar className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold font-heading text-[#ffedd7]">
              {event ? 'Editar Plan de Banquete' : 'Nuevo Evento o Banquete'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#a89988] hover:text-[#ffedd7] p-1.5 rounded-lg hover:bg-[#40372e]/40 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6 flex-1">
          {error && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Nombre del Evento */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#a89988]">
              Nombre o Referencia del Banquete *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ej: Boda Marta & Carlos (Catering Jardín)"
              className="w-full px-3.5 py-2.5 bg-[#100904] border border-[#40372e] rounded-xl text-sm text-[#ffedd7] placeholder-[#a89988]/50 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          {/* Fecha y Comensales */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#a89988]">
                Fecha de Celebración *
              </label>
              <input
                type="date"
                required
                value={eventDate}
                onChange={e => setEventDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#100904] border border-[#40372e] rounded-xl text-sm text-[#ffedd7] focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#a89988] flex items-center justify-between">
                <span>Número de Comensales *</span>
                <span className="text-[10px] text-amber-400">Raciones exactas</span>
              </label>
              <div className="relative">
                <Users className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a89988]" />
                <input
                  type="number"
                  min="1"
                  required
                  value={standardGuests}
                  onChange={e => setStandardGuests(parseInt(e.target.value) || 0)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-[#100904] border border-[#40372e] rounded-xl text-sm font-mono text-[#ffedd7] focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Menú del Evento (Selector de Platos) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-[#ffedd7] flex items-center gap-1.5">
                <UtensilsCrossed className="w-3.5 h-3.5 text-amber-400" />
                Platos del Menú ({selectedDishIds.length} seleccionados)
              </label>
              <span className="text-xs text-[#a89988]">
                Se consolidarán los ingredientes comunes
              </span>
            </div>

            {availableDishes.length === 0 ? (
              <div className="p-6 rounded-xl border border-dashed border-[#40372e] text-center text-xs text-[#a89988]">
                No hay platos registrados en el recetario. Crea antes recetas en la pestaña "Recetario".
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                {availableDishes.map(dish => {
                  const isSelected = selectedDishIds.includes(dish.id)

                  return (
                    <div
                      key={dish.id}
                      onClick={() => handleToggleDish(dish.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 select-none ${
                        isSelected
                          ? 'bg-amber-500/10 border-amber-500/50 text-[#ffedd7]'
                          : 'bg-[#100904] border-[#40372e] text-[#a89988] hover:border-[#a89988]/50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="mt-0.5 w-4 h-4 rounded text-amber-500 bg-[#1c120c] border-[#40372e] pointer-events-none"
                      />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold truncate ${isSelected ? 'text-amber-400' : 'text-[#ffedd7]'}`}>
                          {dish.name}
                        </p>
                        <p className="text-[11px] text-[#a89988] mt-0.5">
                          {dish.category} • {dish.ingredients.length} ing.
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#40372e] flex items-center justify-end gap-3 bg-[#100904]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-[#a89988] hover:text-[#ffedd7] hover:bg-[#40372e]/30 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/10 transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Calculando...' : event ? 'Actualizar Evento' : 'Crear y Calcular Escandallo'}
          </button>
        </div>
      </div>
    </div>
  )
}
