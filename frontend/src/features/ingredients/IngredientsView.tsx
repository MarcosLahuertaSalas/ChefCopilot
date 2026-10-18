import React, { useState, useEffect } from 'react'
import { ingredientsApi } from '../../api/ingredients'
import type { Ingredient, CreateIngredientRequest, UpdateIngredientRequest } from '../../types/ingredient'
import { IngredientModal } from './IngredientModal'
import { gooeyToast } from 'goey-toast'
import { 
  Plus, 
  Search, 
  AlertTriangle, 
  Scale, 
  Edit2, 
  Trash2, 
  Package, 
  RefreshCw
} from 'lucide-react'

export const IngredientsView: React.FC = () => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'lowStock' | 'byPiece' | 'reusable'>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null)

  const loadIngredients = async () => {
    setLoading(true)
    try {
      const data = await ingredientsApi.getAll()
      setIngredients(data)
    } catch (err: unknown) {
      gooeyToast.error('Error al cargar la despensa', {
        description: err instanceof Error ? err.message : 'No se pudo conectar con la API de ChefCopilot',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadIngredients()
  }, [])

  const handleOpenCreate = () => {
    setSelectedIngredient(null)
    setIsModalOpen(true)
  }

  const handleOpenEdit = (ingredient: Ingredient) => {
    setSelectedIngredient(ingredient)
    setIsModalOpen(true)
  }

  const handleSave = async (data: CreateIngredientRequest | UpdateIngredientRequest) => {
    if ('id' in data) {
      await ingredientsApi.update(data.id, data as UpdateIngredientRequest)
      gooeyToast.success('Ingrediente actualizado', {
        description: `Se han guardado los cambios para "${data.name}".`,
      })
    } else {
      await ingredientsApi.create(data as CreateIngredientRequest)
      gooeyToast.success('Ingrediente añadido a la despensa', {
        description: `"${data.name}" ya está disponible para escandallos.`,
      })
    }
    await loadIngredients()
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar definitivamente "${name}" de la despensa?`)) return
    try {
      await ingredientsApi.delete(id)
      gooeyToast.success('Ingrediente eliminado', {
        description: `"${name}" fue retirado del catálogo.`,
      })
      await loadIngredients()
    } catch (err: unknown) {
      gooeyToast.error('No se pudo eliminar', {
        description: err instanceof Error ? err.message : 'El ingrediente podría estar en uso en alguna receta.',
      })
    }
  }

  // Métricas
  const totalCount = ingredients.length
  const lowStockCount = ingredients.filter(i => i.currentStock <= i.minimumStock).length
  const pieceCount = ingredients.filter(i => i.isPurchasedByPiece).length
  const reusableCount = ingredients.filter(i => i.reusableWastePercentage > 0).length

  // Filtrado
  const filteredIngredients = ingredients.filter(i => {
    const matchesSearch = i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          i.defaultProvider.toLowerCase().includes(searchTerm.toLowerCase())

    if (!matchesSearch) return false

    if (filterType === 'lowStock') return i.currentStock <= i.minimumStock
    if (filterType === 'byPiece') return i.isPurchasedByPiece
    if (filterType === 'reusable') return i.reusableWastePercentage > 0
    return true
  })

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header y Acciones Principales */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-[#ffedd7] flex items-center gap-2.5">
            <Scale className="w-7 h-7 text-amber-500" />
            Despensa & Control de Stock
          </h1>
          <p className="text-sm text-[#a89988] mt-1">
            Gestión técnica de mermas, inventario físico en cámara y rendimiento por piezas enteras.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadIngredients}
            className="p-2.5 rounded-xl bg-[#1c120c] border border-[#40372e] text-[#a89988] hover:text-[#ffedd7] hover:border-amber-500/50 transition-colors cursor-pointer"
            title="Recargar despensa"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleOpenCreate}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            Nuevo Ingrediente
          </button>
        </div>
      </div>

      {/* Tarjetas de Métricas Rápidas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#1c120c] border border-[#40372e]">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#a89988] block">Total Ingredientes</span>
          <span className="text-2xl font-bold font-heading text-[#ffedd7] mt-1 block">{totalCount}</span>
          <span className="text-[11px] text-[#a89988]/80 mt-1 block">En el almacén culinario</span>
        </div>

        <div className={`p-4 rounded-2xl border transition-colors ${
          lowStockCount > 0 
            ? 'bg-rose-950/20 border-rose-800/60 text-rose-300' 
            : 'bg-[#1c120c] border-[#40372e] text-emerald-400'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#a89988]">Stock Crítico</span>
            {lowStockCount > 0 && <AlertTriangle className="w-4 h-4 text-rose-400 animate-pulse" />}
          </div>
          <span className="text-2xl font-bold font-heading mt-1 block">
            {lowStockCount} {lowStockCount === 1 ? 'aviso' : 'avisos'}
          </span>
          <span className="text-[11px] text-[#a89988]/80 mt-1 block">Por debajo de seguridad</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#1c120c] border border-[#40372e]">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#a89988] block">Por Piezas Enteras</span>
          <span className="text-2xl font-bold font-heading text-amber-400 mt-1 block">{pieceCount}</span>
          <span className="text-[11px] text-[#a89988]/80 mt-1 block">Rendimiento conservador</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#1c120c] border border-[#40372e]">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#a89988] block">Con Subproducto</span>
          <span className="text-2xl font-bold font-heading text-emerald-400 mt-1 block">{reusableCount}</span>
          <span className="text-[11px] text-[#a89988]/80 mt-1 block">Merma para albóndigas/caldos</span>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a89988]" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre o proveedor..."
            className="w-full pl-10 pr-4 py-2 bg-[#1c120c] border border-[#40372e] rounded-xl text-sm text-[#ffedd7] placeholder-[#a89988]/60 focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-[#1c120c] border border-[#40372e] rounded-xl self-start sm:self-auto overflow-x-auto">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
              filterType === 'all' ? 'bg-amber-500 text-slate-950' : 'text-[#a89988] hover:text-[#ffedd7]'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilterType('lowStock')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
              filterType === 'lowStock' ? 'bg-rose-500 text-white' : 'text-[#a89988] hover:text-[#ffedd7]'
            }`}
          >
            Stock Bajo
          </button>
          <button
            onClick={() => setFilterType('byPiece')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
              filterType === 'byPiece' ? 'bg-amber-500 text-slate-950' : 'text-[#a89988] hover:text-[#ffedd7]'
            }`}
          >
            Por Piezas
          </button>
          <button
            onClick={() => setFilterType('reusable')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
              filterType === 'reusable' ? 'bg-emerald-500 text-slate-950' : 'text-[#a89988] hover:text-[#ffedd7]'
            }`}
          >
            Aprovechables
          </button>
        </div>
      </div>

      {/* Tabla / Lista de Ingredientes */}
      <div className="bg-[#1c120c] border border-[#40372e] rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-[#a89988] flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-amber-500" />
            <p className="text-sm font-medium">Consultando despensa en MySQL...</p>
          </div>
        ) : filteredIngredients.length === 0 ? (
          <div className="p-12 text-center text-[#a89988] flex flex-col items-center justify-center gap-3">
            <Package className="w-10 h-10 text-[#40372e]" />
            <p className="text-sm font-semibold text-[#ffedd7]">No se encontraron ingredientes</p>
            <p className="text-xs text-[#a89988] max-w-sm">
              {searchTerm ? 'Prueba ajustando el término de búsqueda o cambia de filtro.' : 'Empieza añadiendo tu primer ingrediente con el botón superior.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-[#40372e] bg-[#100904]/80 text-[#a89988] text-[11px] uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Ingrediente & Proveedor</th>
                  <th className="py-3 px-4">Stock en Cámara</th>
                  <th className="py-3 px-4">Desperdicio vs. Reutilizable</th>
                  <th className="py-3 px-4">Rendimiento por Pieza</th>
                  <th className="py-3 px-4">Dieta / Alérgenos</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#40372e]/60">
                {filteredIngredients.map(item => {
                  const isLow = item.currentStock <= item.minimumStock
                  const rawNetWaste = item.wastePercentage <= 1 && item.wastePercentage > 0 ? item.wastePercentage * 100 : item.wastePercentage
                  const rawReusableWaste = item.reusableWastePercentage <= 1 && item.reusableWastePercentage > 0 ? item.reusableWastePercentage * 100 : item.reusableWastePercentage

                  return (
                    <tr key={item.id} className="hover:bg-[#100904]/40 transition-colors group">
                      {/* Nombre y Proveedor */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#ffedd7] group-hover:text-amber-400 transition-colors flex items-center gap-2">
                          {item.name}
                          {isLow && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-950/80 text-rose-300 border border-rose-800/80">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                              Bajo Mínimo
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-[#a89988] flex items-center gap-1.5 mt-0.5">
                          <span>{item.defaultProvider || 'Sin proveedor'}</span>
                          <span>•</span>
                          <span className="font-mono text-amber-500/90">{item.unitOfMeasure}</span>
                        </div>
                      </td>

                      {/* Stock Actual vs Mínimo */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-baseline gap-1.5 flex-wrap">
                          <span className={`font-mono font-bold text-sm ${isLow ? 'text-rose-400' : 'text-[#ffedd7]'}`}>
                            {Number.isInteger(item.currentStock) ? item.currentStock : item.currentStock.toFixed(2)} {item.unitOfMeasure}
                          </span>
                          <span className="text-xs text-[#a89988]">
                            (mín. {Number.isInteger(item.minimumStock) ? item.minimumStock : item.minimumStock.toFixed(2)} {item.unitOfMeasure})
                          </span>
                        </div>
                        <div className="w-28 h-1.5 bg-[#100904] rounded-full overflow-hidden mt-1.5 border border-[#40372e]">
                          <div 
                            className={`h-full rounded-full transition-all ${
                              isLow ? 'bg-rose-500' : 'bg-emerald-500'
                            }`}
                            style={{ 
                              width: `${Math.min(100, item.minimumStock > 0 ? (item.currentStock / item.minimumStock) * 100 : 100)}%` 
                            }}
                          />
                        </div>
                      </td>

                      {/* Mermas */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <div className="text-xs text-[#ffedd7] flex items-center gap-2">
                            <span className="text-rose-400/90">🗑 {rawNetWaste.toFixed(0)}% basura</span>
                            {rawReusableWaste > 0 && (
                              <span className="text-emerald-400 font-medium">
                                ♻️ +{rawReusableWaste.toFixed(0)}% aprovechable
                              </span>
                            )}
                          </div>
                          {rawReusableWaste > 0 && (
                            <p className="text-[10px] text-[#a89988]">
                              Subproducto utilizable en caldos / albóndigas
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Rendimiento por Pieza */}
                      <td className="py-3.5 px-4">
                        {item.isPurchasedByPiece && item.minPortionsPerPiece ? (
                          <div className="inline-flex flex-col">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                              🥩 {item.minPortionsPerPiece} a {item.maxPortionsPerPiece ?? item.minPortionsPerPiece} rac./pieza
                            </span>
                            <span className="text-[10px] text-[#a89988] mt-0.5">
                              Cálculo pesimista: {item.minPortionsPerPiece} rac.
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-[#a89988] italic">Al peso continuo ({item.unitOfMeasure})</span>
                        )}
                      </td>

                      {/* Dieta y Alérgenos */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {item.isVegan && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                              Vegano
                            </span>
                          )}
                          {!item.isVegan && item.isVegetarian && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                              Vegetariano
                            </span>
                          )}
                          {item.allergens && item.allergens.length > 0 ? (
                            item.allergens.map(a => (
                              <span key={a} className="px-1.5 py-0.5 rounded text-[10px] bg-slate-900 text-[#a89988] border border-[#40372e]">
                                {a}
                              </span>
                            ))
                          ) : (
                            <span className="text-[11px] text-[#a89988] italic">Sin alérgenos</span>
                          )}
                        </div>
                      </td>

                      {/* Acciones */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 rounded-lg text-[#a89988] hover:text-amber-400 hover:bg-[#40372e]/50 transition-colors cursor-pointer"
                            title="Editar ingrediente"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id, item.name)}
                            className="p-1.5 rounded-lg text-[#a89988] hover:text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer"
                            title="Eliminar ingrediente"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Ingrediente */}
      <IngredientModal
        isOpen={isModalOpen}
        ingredient={selectedIngredient}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  )
}
