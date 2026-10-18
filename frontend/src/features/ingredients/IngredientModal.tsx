import React, { useState, useEffect } from 'react'
import type { Ingredient, CreateIngredientRequest, UpdateIngredientRequest } from '../../types/ingredient'
import { X, Sparkles, Scale, AlertTriangle } from 'lucide-react'

interface IngredientModalProps {
  isOpen: boolean
  ingredient: Ingredient | null
  onClose: () => void
  onSave: (data: CreateIngredientRequest | UpdateIngredientRequest) => Promise<void>
}

export const IngredientModal: React.FC<IngredientModalProps> = ({
  isOpen,
  ingredient,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('')
  const [unitOfMeasure, setUnitOfMeasure] = useState('Kg')
  const [wastePercentage, setWastePercentage] = useState<number>(0)
  const [reusableWastePercentage, setReusableWastePercentage] = useState<number>(0)
  const [currentStock, setCurrentStock] = useState<number>(0)
  const [minimumStock, setMinimumStock] = useState<number>(0)
  const [isPurchasedByPiece, setIsPurchasedByPiece] = useState(false)
  const [minPortionsPerPiece, setMinPortionsPerPiece] = useState<number | undefined>(undefined)
  const [maxPortionsPerPiece, setMaxPortionsPerPiece] = useState<number | undefined>(undefined)
  const [defaultProvider, setDefaultProvider] = useState('')
  const [isVegetarian, setIsVegetarian] = useState(false)
  const [isVegan, setIsVegan] = useState(false)
  const [allergenInput, setAllergenInput] = useState('')
  const [allergens, setAllergens] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (ingredient) {
      setName(ingredient.name)
      setUnitOfMeasure(ingredient.unitOfMeasure)
      // Normalizamos si venía como decimal (ej: 0.15 -> 15%)
      setWastePercentage(ingredient.wastePercentage <= 1 && ingredient.wastePercentage > 0 ? ingredient.wastePercentage * 100 : ingredient.wastePercentage)
      setReusableWastePercentage(ingredient.reusableWastePercentage <= 1 && ingredient.reusableWastePercentage > 0 ? ingredient.reusableWastePercentage * 100 : ingredient.reusableWastePercentage)
      setCurrentStock(ingredient.currentStock)
      setMinimumStock(ingredient.minimumStock)
      setIsPurchasedByPiece(ingredient.isPurchasedByPiece)
      setMinPortionsPerPiece(ingredient.minPortionsPerPiece ?? undefined)
      setMaxPortionsPerPiece(ingredient.maxPortionsPerPiece ?? undefined)
      setDefaultProvider(ingredient.defaultProvider || '')
      setIsVegetarian(ingredient.isVegetarian)
      setIsVegan(ingredient.isVegan)
      setAllergens(ingredient.allergens || [])
    } else {
      setName('')
      setUnitOfMeasure('Kg')
      setWastePercentage(0)
      setReusableWastePercentage(0)
      setCurrentStock(0)
      setMinimumStock(0)
      setIsPurchasedByPiece(false)
      setMinPortionsPerPiece(undefined)
      setMaxPortionsPerPiece(undefined)
      setDefaultProvider('')
      setIsVegetarian(false)
      setIsVegan(false)
      setAllergens([])
    }
    setError(null)
  }, [ingredient, isOpen])

  if (!isOpen) return null

  const handleAddAllergen = () => {
    const trimmed = allergenInput.trim()
    if (trimmed && !allergens.includes(trimmed)) {
      setAllergens([...allergens, trimmed])
      setAllergenInput('')
    }
  }

  const handleRemoveAllergen = (item: string) => {
    setAllergens(allergens.filter(a => a !== item))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError('El nombre del ingrediente es obligatorio.')
      return
    }

    if (isPurchasedByPiece) {
      if (!minPortionsPerPiece || minPortionsPerPiece <= 0) {
        setError('Debes especificar el rendimiento mínimo garantizado de raciones por pieza.')
        return
      }
      if (maxPortionsPerPiece && maxPortionsPerPiece < minPortionsPerPiece) {
        setError('El rendimiento máximo no puede ser menor que el mínimo.')
        return
      }
    }

    setLoading(true)
    try {
      // Convertir porcentajes a decimal 0..1 para la API
      const wasteDecimal = wastePercentage / 100
      const reusableWasteDecimal = reusableWastePercentage / 100

      if (ingredient) {
        await onSave({
          id: ingredient.id,
          name: name.trim(),
          unitOfMeasure: unitOfMeasure.trim(),
          wastePercentage: wasteDecimal,
          reusableWastePercentage: reusableWasteDecimal,
          currentStock: Number(currentStock) || 0,
          minimumStock: Number(minimumStock) || 0,
          isPurchasedByPiece,
          minPortionsPerPiece: isPurchasedByPiece ? Number(minPortionsPerPiece) : null,
          maxPortionsPerPiece: isPurchasedByPiece ? (maxPortionsPerPiece ? Number(maxPortionsPerPiece) : Number(minPortionsPerPiece)) : null,
          defaultProvider: defaultProvider.trim() || 'Sin asignar',
          allergens,
          isVegetarian,
          isVegan,
        } as UpdateIngredientRequest)
      } else {
        await onSave({
          name: name.trim(),
          unitOfMeasure: unitOfMeasure.trim(),
          wastePercentage: wasteDecimal,
          reusableWastePercentage: reusableWasteDecimal,
          currentStock: Number(currentStock) || 0,
          minimumStock: Number(minimumStock) || 0,
          isPurchasedByPiece,
          minPortionsPerPiece: isPurchasedByPiece ? Number(minPortionsPerPiece) : null,
          maxPortionsPerPiece: isPurchasedByPiece ? (maxPortionsPerPiece ? Number(maxPortionsPerPiece) : Number(minPortionsPerPiece)) : null,
          defaultProvider: defaultProvider.trim() || 'Sin asignar',
          allergens,
          isVegetarian,
          isVegan,
        } as CreateIngredientRequest)
      }
      onClose()
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Ocurrió un error al guardar el ingrediente.')
      }
    } finally {
      setLoading(false)
    }
  }

  const totalWaste = Number(wastePercentage || 0) + Number(reusableWastePercentage || 0)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl bg-[#1c120c] border border-[#40372e] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Encabezado */}
        <div className="px-6 py-4 border-b border-[#40372e] flex items-center justify-between bg-[#100904]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Scale className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold font-heading text-[#ffedd7]">
              {ingredient ? 'Editar Ficha de Ingrediente' : 'Nuevo Ingrediente en Despensa'}
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

          {/* Nombre y Unidad */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#a89988]">
                Nombre del Ingrediente *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ej: Solomillo de Ternera, Patata Monalisa..."
                className="w-full px-3.5 py-2.5 bg-[#100904] border border-[#40372e] rounded-xl text-sm text-[#ffedd7] placeholder-[#a89988]/50 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#a89988]">
                Unidad Base *
              </label>
              <select
                value={unitOfMeasure}
                onChange={e => setUnitOfMeasure(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#100904] border border-[#40372e] rounded-xl text-sm text-[#ffedd7] focus:outline-none focus:border-amber-500 transition-colors"
              >
                <option value="Kg">Kilogramos (Kg)</option>
                <option value="g">Gramos (g)</option>
                <option value="Litros">Litros (L)</option>
                <option value="ml">Mililitros (ml)</option>
                <option value="Unidades">Unidades / Piezas</option>
                <option value="Manojos">Manojos</option>
              </select>
            </div>
          </div>

          {/* Sección de Mermas Gastronómicas */}
          <div className="p-4 rounded-xl bg-[#100904] border border-[#40372e] space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Ingeniería de Mermas & Subproductos
              </span>
              <span className="text-xs text-[#a89988]">
                Merma Total: <strong className="text-[#ffedd7]">{totalWaste.toFixed(1)}%</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-[#a89988] flex items-center justify-between">
                  <span>Desperdicio Técnico (%)</span>
                  <span className="text-[10px] text-rose-400">Basura neta (grasa/piel)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={wastePercentage}
                  onChange={e => setWastePercentage(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-[#1c120c] border border-[#40372e] rounded-lg text-sm text-[#ffedd7] focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-[#a89988] flex items-center justify-between">
                  <span>Merma Aprovechable (%)</span>
                  <span className="text-[10px] text-emerald-400">Recortes / Caldos</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={reusableWastePercentage}
                  onChange={e => setReusableWastePercentage(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-[#1c120c] border border-[#40372e] rounded-lg text-sm text-[#ffedd7] focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <p className="text-[11px] text-[#a89988] italic">
              * El desperdicio va a la basura. La merma aprovechable se cuantificará automáticamente para reutilizarse en albóndigas, fondos o guisos.
            </p>
          </div>

          {/* Inventario & Stock */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#a89988]">
                Stock Físico en Cámara ({unitOfMeasure})
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={currentStock}
                onChange={e => setCurrentStock(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 bg-[#100904] border border-[#40372e] rounded-xl text-sm text-[#ffedd7] focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#a89988]">
                Stock Mínimo de Seguridad ({unitOfMeasure})
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={minimumStock}
                onChange={e => setMinimumStock(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 bg-[#100904] border border-[#40372e] rounded-xl text-sm text-[#ffedd7] focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Compra por Piezas Enteras (Regla del Chef) */}
          <div className="p-4 rounded-xl bg-[#100904] border border-[#40372e] space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-[#ffedd7] flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPurchasedByPiece}
                  onChange={e => setIsPurchasedByPiece(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 bg-[#1c120c] border-[#40372e] focus:ring-0 focus:outline-none cursor-pointer"
                />
                ¿Se adquiere por piezas enteras? (Solomillo, Pescado entero...)
              </label>
            </div>

            {isPurchasedByPiece && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#40372e]/60 animate-fade-in">
                <div className="space-y-1">
                  <label className="text-xs text-[#a89988]">
                    Raciones Mínimas Garantizadas / Pieza *
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Ej: 8 raciones (pesimista)"
                    value={minPortionsPerPiece ?? ''}
                    onChange={e => setMinPortionsPerPiece(parseInt(e.target.value) || undefined)}
                    className="w-full px-3 py-2 bg-[#1c120c] border border-[#40372e] rounded-lg text-sm text-[#ffedd7] focus:outline-none focus:border-amber-500"
                  />
                  <span className="text-[10px] text-[#a89988]">Chef Copilot comprará basándose en este mínimo para que nunca falte.</span>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-[#a89988]">
                    Raciones Máximas Estimadas / Pieza
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Ej: 10 raciones (ideal)"
                    value={maxPortionsPerPiece ?? ''}
                    onChange={e => setMaxPortionsPerPiece(parseInt(e.target.value) || undefined)}
                    className="w-full px-3 py-2 bg-[#1c120c] border border-[#40372e] rounded-lg text-sm text-[#ffedd7] focus:outline-none focus:border-amber-500"
                  />
                  <span className="text-[10px] text-[#a89988]">Permite calcular el colchón de seguridad sobrante.</span>
                </div>
              </div>
            )}
          </div>

          {/* Proveedor y Dietas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#a89988]">
                Proveedor Habitual
              </label>
              <input
                type="text"
                value={defaultProvider}
                onChange={e => setDefaultProvider(e.target.value)}
                placeholder="Ej: Cárnicas Sierra, Makro..."
                className="w-full px-3.5 py-2.5 bg-[#100904] border border-[#40372e] rounded-xl text-sm text-[#ffedd7] focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-2 pt-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#a89988]">
                Preferencias Dietéticas
              </label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-xs text-[#ffedd7] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isVegetarian}
                    onChange={e => setIsVegetarian(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-500 bg-[#100904] border-[#40372e]"
                  />
                  Vegetariano
                </label>
                <label className="flex items-center gap-2 text-xs text-[#ffedd7] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isVegan}
                    onChange={e => setIsVegan(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-500 bg-[#100904] border-[#40372e]"
                  />
                  Vegano
                </label>
              </div>
            </div>
          </div>

          {/* Alérgenos */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#a89988]">
              Alérgenos
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={allergenInput}
                onChange={e => setAllergenInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddAllergen())}
                placeholder="Ej: Gluten, Lácteos, Sulfitos..."
                className="flex-1 px-3 py-2 bg-[#100904] border border-[#40372e] rounded-lg text-sm text-[#ffedd7] focus:outline-none focus:border-amber-500"
              />
              <button
                type="button"
                onClick={handleAddAllergen}
                className="px-4 py-2 bg-[#40372e] hover:bg-[#40372e]/80 text-[#ffedd7] rounded-lg text-xs font-semibold cursor-pointer"
              >
                Añadir
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {allergens.map(a => (
                <span
                  key={a}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-amber-500/10 text-amber-300 border border-amber-500/20"
                >
                  {a}
                  <button
                    type="button"
                    onClick={() => handleRemoveAllergen(a)}
                    className="hover:text-rose-400"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
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
            {loading ? 'Guardando...' : ingredient ? 'Actualizar Ingrediente' : 'Guardar en Despensa'}
          </button>
        </div>
      </div>
    </div>
  )
}
