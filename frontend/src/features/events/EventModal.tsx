import React, { useState, useEffect } from 'react'
import type { Event, CreateEventRequest, UpdateEventRequest } from '../../types/event'
import type { Dish } from '../../types/dish'
import { dishesApi } from '../../api/dishes'
import { X, Calendar, Users, UtensilsCrossed, AlertTriangle, Plus, Trash2, ShieldAlert, Sparkles } from 'lucide-react'

interface EventModalProps {
  isOpen: boolean
  event: Event | null
  onClose: () => void
  onSave: (data: CreateEventRequest | UpdateEventRequest) => Promise<void>
}

interface DietaryFormItem {
  id?: string
  requirementName: string
  guestCount: number
  replacedDishId: string
  substituteDishId: string
  notes: string
}

const PRESET_REQUIREMENTS = [
  { label: '🌾 Celíaco / Sin Gluten', name: 'Celíacos / Sin Gluten' },
  { label: '🌿 Vegano', name: 'Veganos' },
  { label: '🥛 Sin Lactosa', name: 'Intolerantes a la Lactosa' },
  { label: '🥜 Alergia Frutos Secos', name: 'Alérgicos a Frutos Secos' },
  { label: '🦐 Alergia Mariscos', name: 'Alérgicos a Mariscos / Crustáceos' },
]

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
  const [dietaryRequirements, setDietaryRequirements] = useState<DietaryFormItem[]>([])
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
      if (event.dietaryRequirements && event.dietaryRequirements.length > 0) {
        setDietaryRequirements(
          event.dietaryRequirements.map(dr => ({
            id: dr.id,
            requirementName: dr.requirementName,
            guestCount: dr.guestCount,
            replacedDishId: dr.replacedDishId || '',
            substituteDishId: dr.substituteDishId || '',
            notes: dr.notes || '',
          }))
        )
      } else {
        setDietaryRequirements([])
      }
    } else {
      setName('')
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 7)
      setEventDate(tomorrow.toISOString().split('T')[0])
      setStandardGuests(80)
      setSelectedDishIds([])
      setDietaryRequirements([])
    }
    setError(null)
  }, [event, isOpen])

  if (!isOpen) return null

  const handleToggleDish = (dishId: string) => {
    if (selectedDishIds.includes(dishId)) {
      setSelectedDishIds(selectedDishIds.filter(id => id !== dishId))
      // Si se deselecciona un plato que estaba asignado como reemplazado, limpiamos esa referencia
      setDietaryRequirements(prev =>
        prev.map(item => (item.replacedDishId === dishId ? { ...item, replacedDishId: '' } : item))
      )
    } else {
      setSelectedDishIds([...selectedDishIds, dishId])
    }
  }

  const handleAddRequirement = (defaultName = '') => {
    setDietaryRequirements(prev => [
      ...prev,
      {
        requirementName: defaultName || '',
        guestCount: 2,
        replacedDishId: selectedDishIds.length > 0 ? selectedDishIds[0] : '',
        substituteDishId: '',
        notes: '',
      },
    ])
  }

  const handleRemoveRequirement = (index: number) => {
    setDietaryRequirements(prev => prev.filter((_, i) => i !== index))
  }

  const handleUpdateRequirement = (index: number, field: keyof DietaryFormItem, value: any) => {
    setDietaryRequirements(prev =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    )
  }

  const totalSpecialGuests = dietaryRequirements.reduce(
    (sum, item) => sum + (Number(item.guestCount) || 0),
    0
  )
  const netStandardGuests = Math.max(0, standardGuests - totalSpecialGuests)

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

    if (totalSpecialGuests > standardGuests) {
      setError(
        `El número de comensales especiales (${totalSpecialGuests}) no puede superar el total de comensales del evento (${standardGuests}).`
      )
      return
    }

    for (let i = 0; i < dietaryRequirements.length; i++) {
      const req = dietaryRequirements[i]
      if (!req.requirementName.trim()) {
        setError(`La excepción dietética #${i + 1} debe tener un nombre o descripción (ej: Celíaco).`)
        return
      }
      if (req.guestCount <= 0) {
        setError(`El número de comensales para "${req.requirementName}" debe ser al menos 1.`)
        return
      }
    }

    setLoading(true)
    try {
      const formattedDate = new Date(eventDate).toISOString()
      const formattedRequirements = dietaryRequirements.map(dr => ({
        requirementName: dr.requirementName.trim(),
        guestCount: Number(dr.guestCount),
        replacedDishId: dr.replacedDishId || null,
        substituteDishId: dr.substituteDishId || null,
        notes: dr.notes.trim() || null,
      }))

      if (event) {
        await onSave({
          id: event.id,
          name: name.trim(),
          eventDate: formattedDate,
          standardGuests: Number(standardGuests),
          dishIds: selectedDishIds,
          dietaryRequirements: formattedRequirements,
        } as UpdateEventRequest)
      } else {
        await onSave({
          name: name.trim(),
          eventDate: formattedDate,
          standardGuests: Number(standardGuests),
          dishIds: selectedDishIds,
          dietaryRequirements: formattedRequirements,
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

  // Platos seleccionados para el menú (para el selector de plato reemplazado)
  const menuDishes = availableDishes.filter(d => selectedDishIds.includes(d.id))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#18251e]/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-3xl bg-[#fdfbf7] border border-[#18251e]/15 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Encabezado */}
        <div className="px-6 py-4 border-b border-[#18251e]/10 flex items-center justify-between bg-[#ebe4d5]/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#5a341e]/10 border border-[#5a341e]/20 flex items-center justify-center text-[#5a341e]">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-heading text-[#18251e]">
                {event ? 'Editar Plan de Banquete' : 'Nuevo Evento o Banquete'}
              </h2>
              <p className="text-[11px] text-[#524d45]">
                Planificación de menús, comensales y excepciones dietéticas
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

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6 flex-1">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5 shadow-sm">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Nombre del Evento */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[#726e66]">
              Nombre o Referencia del Banquete *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ej: Boda Marta & Carlos (Catering Jardín)"
              className="w-full px-3.5 py-2.5 bg-white border border-[#18251e]/15 rounded-xl text-sm text-[#18251e] placeholder-[#18251e]/40 focus:outline-none focus:border-[#5a341e] shadow-sm transition-colors"
            />
          </div>

          {/* Fecha y Comensales Totales */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#726e66]">
                Fecha de Celebración *
              </label>
              <input
                type="date"
                required
                value={eventDate}
                onChange={e => setEventDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-[#18251e]/15 rounded-xl text-sm text-[#18251e] focus:outline-none focus:border-[#5a341e] shadow-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#726e66] flex items-center justify-between">
                <span>Comensales Totales *</span>
                <span className="text-[10px] text-[#5a341e] font-semibold">Total del evento</span>
              </label>
              <div className="relative">
                <Users className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#726e66]" />
                <input
                  type="number"
                  min="1"
                  required
                  value={standardGuests}
                  onChange={e => setStandardGuests(parseInt(e.target.value) || 0)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-[#18251e]/15 rounded-xl text-sm font-mono font-bold text-[#18251e] focus:outline-none focus:border-[#5a341e] shadow-sm"
                />
              </div>
            </div>
          </div>

          {/* Menú del Evento (Selector de Platos) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-[#18251e] flex items-center gap-1.5">
                <UtensilsCrossed className="w-3.5 h-3.5 text-[#5a341e]" />
                Platos del Menú Estándar ({selectedDishIds.length} seleccionados)
              </label>
              <span className="text-xs text-[#726e66]">
                Los comensales estándar recibirán estos platos
              </span>
            </div>

            {availableDishes.length === 0 ? (
              <div className="p-6 rounded-2xl border border-dashed border-[#18251e]/20 bg-[#ebe4d5]/30 text-center text-xs text-[#726e66]">
                No hay platos registrados en el recetario. Crea antes recetas en la pestaña "Recetario".
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                {availableDishes.map(dish => {
                  const isSelected = selectedDishIds.includes(dish.id)

                  return (
                    <div
                      key={dish.id}
                      onClick={() => handleToggleDish(dish.id)}
                      className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 select-none shadow-sm ${
                        isSelected
                          ? 'bg-[#5a341e]/10 border-[#5a341e]/40 text-[#18251e]'
                          : 'bg-white border-[#18251e]/10 text-[#524d45] hover:border-[#5a341e]/30'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="mt-0.5 w-4 h-4 rounded text-[#5a341e] border-[#18251e]/20 pointer-events-none"
                      />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-bold truncate ${isSelected ? 'text-[#5a341e]' : 'text-[#18251e]'}`}>
                          {dish.name}
                        </p>
                        <p className="text-[11px] text-[#726e66] mt-0.5">
                          {dish.category} • {dish.ingredients.length} ing.
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* SECCIÓN CLAVE DE NEGOCIO: Excepciones Dietéticas & Menús Especiales */}
          <div className="space-y-4 pt-4 border-t border-[#18251e]/10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#18251e] flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-[#5a341e]" />
                  Excepciones Dietéticas & Menús Especiales
                </label>
                <p className="text-[11px] text-[#726e66] mt-0.5">
                  Descuenta raciones del menú estándar y calcula la compra exacta para platos sustitutos
                </p>
              </div>

              {/* Botón Añadir Excepción */}
              <button
                type="button"
                onClick={() => handleAddRequirement('')}
                className="px-3 py-1.5 rounded-xl bg-white border border-[#18251e]/15 text-[#5a341e] hover:bg-[#5a341e]/10 hover:border-[#5a341e]/40 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer self-start shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                Añadir Excepción
              </button>
            </div>

            {/* Balanza de Comensales */}
            <div className="p-3.5 rounded-2xl bg-[#ebe4d5]/50 border border-[#18251e]/10 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#5a341e]" />
                <span className="text-[#524d45]">
                  Distribución de comensales:
                </span>
                <span className="font-bold text-[#18251e]">
                  {netStandardGuests} Menú Estándar
                </span>
                {totalSpecialGuests > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#5a341e]/10 text-[#5a341e] font-bold border border-[#5a341e]/20">
                    +{totalSpecialGuests} Menús Especiales
                  </span>
                )}
              </div>
              <span className="font-mono font-bold text-[#18251e] text-[11px]">
                Total: {standardGuests} pax
              </span>
            </div>

            {/* Presets Rápidos si la lista está vacía o para añadir rápidamente */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#726e66] flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#5a341e]" />
                Añadir con un clic:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_REQUIREMENTS.map(preset => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handleAddRequirement(preset.name)}
                    className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#ebe4d5]/60 border border-[#18251e]/10 text-[11px] font-medium text-[#18251e] transition-all cursor-pointer shadow-sm active:scale-95"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Lista de Requerimientos Configurados */}
            {dietaryRequirements.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-[#18251e]/15 bg-white text-center text-xs text-[#726e66]">
                No hay excepciones configuradas. Todos los {standardGuests} comensales consumirán el menú estándar completo.
              </div>
            ) : (
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {dietaryRequirements.map((req, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-white border border-[#18251e]/15 shadow-sm space-y-3 relative group"
                  >
                    <div className="flex items-center justify-between gap-2 border-b border-[#18251e]/8 pb-2.5">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="w-5 h-5 rounded-full bg-[#5a341e]/10 text-[#5a341e] font-bold text-[10px] flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          required
                          value={req.requirementName}
                          onChange={e => handleUpdateRequirement(idx, 'requirementName', e.target.value)}
                          placeholder="Condición (ej: Celíaco, Vegano, Alergia a nueces)"
                          className="font-bold text-sm text-[#18251e] bg-transparent border-b border-transparent hover:border-[#18251e]/20 focus:border-[#5a341e] focus:outline-none flex-1 py-0.5"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 bg-[#ebe4d5]/40 px-2.5 py-1 rounded-xl border border-[#18251e]/10">
                          <span className="text-[11px] text-[#726e66] font-medium">Pax:</span>
                          <input
                            type="number"
                            min="1"
                            max={standardGuests}
                            required
                            value={req.guestCount}
                            onChange={e => handleUpdateRequirement(idx, 'guestCount', parseInt(e.target.value) || 1)}
                            className="w-12 text-center text-xs font-mono font-bold text-[#18251e] bg-white rounded border border-[#18251e]/15 py-0.5 focus:outline-none focus:border-[#5a341e]"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveRequirement(idx)}
                          className="p-1.5 rounded-lg text-[#726e66] hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Eliminar excepción"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Desglose de Platos: Reemplazo y Sustitución */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-[#726e66] block">
                          Plato del Menú que NO Comen
                        </label>
                        <select
                          value={req.replacedDishId}
                          onChange={e => handleUpdateRequirement(idx, 'replacedDishId', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-[#fdfbf7] border border-[#18251e]/15 rounded-xl text-xs text-[#18251e] focus:outline-none focus:border-[#5a341e]"
                        >
                          <option value="">-- No sustituye ningún plato específico --</option>
                          {menuDishes.map(d => (
                            <option key={d.id} value={d.id}>
                              {d.name} ({d.category})
                            </option>
                          ))}
                        </select>
                        <span className="text-[10px] text-[#726e66] block">
                          Se restarán {req.guestCount} raciones de este plato
                        </span>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-[#5a341e] block">
                          Plato Alternativo / Sustituto a Preparar
                        </label>
                        <select
                          value={req.substituteDishId}
                          onChange={e => handleUpdateRequirement(idx, 'substituteDishId', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-[#fdfbf7] border border-[#18251e]/15 rounded-xl text-xs text-[#18251e] focus:outline-none focus:border-[#5a341e]"
                        >
                          <option value="">-- Sin sustituto (solo omitir) --</option>
                          {availableDishes.map(d => (
                            <option key={d.id} value={d.id}>
                              {d.name} ({d.category})
                            </option>
                          ))}
                        </select>
                        <span className="text-[10px] text-[#5a341e] block font-medium">
                          Se cocinarán {req.guestCount} raciones de este plato
                        </span>
                      </div>
                    </div>

                    {/* Notas específicas de cocina/sala */}
                    <div>
                      <input
                        type="text"
                        value={req.notes}
                        onChange={e => handleUpdateRequirement(idx, 'notes', e.target.value)}
                        placeholder="Notas para cocina o sala (ej: Mesa 4 y 7, emplatar con campana especial sin trazas)"
                        className="w-full px-3 py-1.5 bg-[#fdfbf7] border border-[#18251e]/10 rounded-xl text-xs text-[#18251e] placeholder-[#18251e]/40 focus:outline-none focus:border-[#5a341e]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#18251e]/10 flex items-center justify-between gap-3 bg-[#ebe4d5]/60">
          <div className="text-xs text-[#524d45]">
            <strong className="text-[#18251e]">{standardGuests}</strong> comensales ({netStandardGuests} estándar + {totalSpecialGuests} especiales)
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
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-[#5a341e] hover:bg-[#472917] text-white font-bold text-sm shadow-md shadow-[#5a341e]/20 transition-all cursor-pointer disabled:opacity-50 active:scale-95"
            >
              {loading ? 'Calculando...' : event ? 'Actualizar Banquete' : 'Crear y Calcular Escandallo'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
