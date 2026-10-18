import React, { useState, useEffect } from 'react'
import type { Dish, CreateDishRequest, UpdateDishRequest, CreateDishIngredientDto } from '../../types/dish'
import type { Ingredient } from '../../types/ingredient'
import { ingredientsApi } from '../../api/ingredients'
import { X, UtensilsCrossed, Plus, Trash2, AlertTriangle, Layers } from 'lucide-react'

interface DishModalProps {
  isOpen: boolean
  dish: Dish | null
  onClose: () => void
  onSave: (data: CreateDishRequest | UpdateDishRequest) => Promise<void>
}

interface IngredientLine {
  ingredientId: string
  quantity: number
}

export const DishModal: React.FC<DishModalProps> = ({
  isOpen,
  dish,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('')
  const [category, setCategory] = useState('Plato Principal')
  const [description, setDescription] = useState('')
  const [ingredientLines, setIngredientLines] = useState<IngredientLine[]>([])
  const [availableIngredients, setAvailableIngredients] = useState<Ingredient[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      ingredientsApi.getAll().then(setAvailableIngredients).catch(console.error)
    }

    if (dish) {
      setName(dish.name)
      setCategory(dish.category || 'Plato Principal')
      setDescription(dish.description || '')
      setIngredientLines(
        dish.ingredients.map(i => ({
          ingredientId: i.ingredientId,
          quantity: i.quantity,
        }))
      )
    } else {
      setName('')
      setCategory('Plato Principal')
      setDescription('')
      setIngredientLines([])
    }
    setError(null)
  }, [dish, isOpen])

  if (!isOpen) return null

  const handleAddIngredientLine = () => {
    if (availableIngredients.length === 0) return
    const firstUnused = availableIngredients.find(
      ai => !ingredientLines.some(line => line.ingredientId === ai.id)
    )
    const selectedId = firstUnused ? firstUnused.id : availableIngredients[0].id
    setIngredientLines([...ingredientLines, { ingredientId: selectedId, quantity: 0.15 }])
  }

  const handleRemoveLine = (index: number) => {
    setIngredientLines(ingredientLines.filter((_, i) => i !== index))
  }

  const handleUpdateLine = (index: number, field: keyof IngredientLine, value: unknown) => {
    const updated = [...ingredientLines]
    updated[index] = { ...updated[index], [field]: value }
    setIngredientLines(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError('El nombre del plato o receta es obligatorio.')
      return
    }

    if (ingredientLines.length === 0) {
      setError('Debes añadir al menos un ingrediente a la ficha técnica de la receta.')
      return
    }

    // Comprobar que no haya cantidades a 0 o repetidos
    for (const line of ingredientLines) {
      if (!line.ingredientId) {
        setError('Selecciona un ingrediente válido en cada línea.')
        return
      }
      if (line.quantity <= 0) {
        setError('La cantidad de cada ingrediente debe ser mayor que 0.')
        return
      }
    }

    setLoading(true)
    try {
      const payloadIngredients: CreateDishIngredientDto[] = ingredientLines.map(l => ({
        ingredientId: l.ingredientId,
        quantity: Number(l.quantity),
      }))

      if (dish) {
        await onSave({
          id: dish.id,
          name: name.trim(),
          category: category.trim(),
          description: description.trim(),
          ingredients: payloadIngredients,
        } as UpdateDishRequest)
      } else {
        await onSave({
          name: name.trim(),
          category: category.trim(),
          description: description.trim(),
          ingredients: payloadIngredients,
        } as CreateDishRequest)
      }
      onClose()
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Ocurrió un error al guardar la receta.')
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
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold font-heading text-[#ffedd7]">
              {dish ? 'Editar Ficha Técnica de Receta' : 'Nueva Ficha Técnica de Receta'}
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

          {/* Nombre y Categoría */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#a89988]">
                Nombre del Plato *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ej: Solomillo Ibérico con Salsa de Oporto"
                className="w-full px-3.5 py-2.5 bg-[#100904] border border-[#40372e] rounded-xl text-sm text-[#ffedd7] placeholder-[#a89988]/50 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#a89988]">
                Categoría *
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#100904] border border-[#40372e] rounded-xl text-sm text-[#ffedd7] focus:outline-none focus:border-emerald-500 transition-colors"
              >
                <option value="Aperitivo / Cóctel">Aperitivo / Cóctel</option>
                <option value="Entrante">Entrante</option>
                <option value="Plato Principal">Plato Principal</option>
                <option value="Pescado">Pescado</option>
                <option value="Carne">Carne</option>
                <option value="Postre">Postre</option>
                <option value="Guarnición">Guarnición</option>
              </select>
            </div>
          </div>

          {/* Descripción */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#a89988]">
              Notas de Elaboración & Presentación
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Ej: Marcado a fuego vivo, reducción a fuego lento con mantequilla fría..."
              className="w-full px-3.5 py-2 bg-[#100904] border border-[#40372e] rounded-xl text-sm text-[#ffedd7] placeholder-[#a89988]/50 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Lista de Ingredientes de la Receta */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-[#ffedd7] flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                Ingredientes & Ración por Persona ({ingredientLines.length})
              </label>
              <button
                type="button"
                onClick={handleAddIngredientLine}
                className="px-3 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                Añadir Ingrediente
              </button>
            </div>

            {ingredientLines.length === 0 ? (
              <div className="p-6 rounded-xl border border-dashed border-[#40372e] text-center text-xs text-[#a89988]">
                No has añadido ningún ingrediente a esta receta. Pulsa el botón "Añadir Ingrediente" para configurar las cantidades por comensal.
              </div>
            ) : (
              <div className="space-y-2">
                {ingredientLines.map((line, idx) => {
                  const ing = availableIngredients.find(ai => ai.id === line.ingredientId)
                  const unit = ing ? ing.unitOfMeasure : 'Ud'

                  return (
                    <div
                      key={idx}
                      className="p-3 bg-[#100904] border border-[#40372e] rounded-xl flex items-center gap-3"
                    >
                      <div className="flex-1">
                        <select
                          value={line.ingredientId}
                          onChange={e => handleUpdateLine(idx, 'ingredientId', e.target.value)}
                          className="w-full px-3 py-2 bg-[#1c120c] border border-[#40372e] rounded-lg text-sm text-[#ffedd7] focus:outline-none focus:border-emerald-500"
                        >
                          {availableIngredients.map(ai => (
                            <option key={ai.id} value={ai.id}>
                              {ai.name} ({ai.unitOfMeasure}) {ai.reusableWastePercentage > 0 ? '• Con merma aprovechable' : ''}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="w-32 flex items-center gap-1.5">
                        <input
                          type="number"
                          min="0.001"
                          step="0.005"
                          value={line.quantity}
                          onChange={e => handleUpdateLine(idx, 'quantity', parseFloat(e.target.value) || 0)}
                          className="w-full px-2.5 py-2 bg-[#1c120c] border border-[#40372e] rounded-lg text-sm font-mono text-[#ffedd7] text-right focus:outline-none focus:border-emerald-500"
                        />
                        <span className="text-xs text-[#a89988] shrink-0 font-medium">{unit}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveLine(idx)}
                        className="p-2 text-[#a89988] hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer"
                        title="Quitar ingrediente"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/10 transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Guardando...' : dish ? 'Actualizar Receta' : 'Guardar Receta'}
          </button>
        </div>
      </div>
    </div>
  )
}
