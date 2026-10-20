import React, { useState, useEffect } from 'react'
import { dishesApi } from '../../api/dishes'
import type { Dish, CreateDishRequest, UpdateDishRequest } from '../../types/dish'
import { DishModal } from './DishModal'
import { gooeyToast } from 'goey-toast'
import { 
  UtensilsCrossed, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Layers, 
  RefreshCw,
  Flame
} from 'lucide-react'

export const DishesView: React.FC = () => {
  const [dishes, setDishes] = useState<Dish[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null)

  const loadDishes = async () => {
    setLoading(true)
    try {
      const data = await dishesApi.getAll()
      setDishes(data)
    } catch (err: unknown) {
      gooeyToast.error('Error al cargar el recetario', {
        description: err instanceof Error ? err.message : 'No se pudo conectar con el backend de ChefCopilot',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDishes()
  }, [])

  const handleOpenCreate = () => {
    setSelectedDish(null)
    setIsModalOpen(true)
  }

  const handleOpenEdit = (dish: Dish) => {
    setSelectedDish(dish)
    setIsModalOpen(true)
  }

  const handleSave = async (data: CreateDishRequest | UpdateDishRequest) => {
    if ('id' in data) {
      await dishesApi.update(data.id, data as UpdateDishRequest)
      gooeyToast.success('Ficha técnica actualizada', {
        description: `Se han guardado los ingredientes para "${data.name}".`,
      })
    } else {
      await dishesApi.create(data as CreateDishRequest)
      gooeyToast.success('Nueva receta creada', {
        description: `"${data.name}" se ha añadido al catálogo de platos.`,
      })
    }
    await loadDishes()
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar la receta "${name}"? Esta acción no se puede deshacer.`)) return
    try {
      await dishesApi.delete(id)
      gooeyToast.success('Receta eliminada', {
        description: `"${name}" fue retirado del recetario.`,
      })
      await loadDishes()
    } catch (err: unknown) {
      gooeyToast.error('No se pudo eliminar la receta', {
        description: err instanceof Error ? err.message : 'El plato podría estar asignado a un evento activo.',
      })
    }
  }

  const categories = ['all', ...Array.from(new Set(dishes.map(d => d.category || 'Otros')))]

  const filteredDishes = dishes.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          d.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCat = categoryFilter === 'all' || d.category === categoryFilter
    return matchesSearch && matchesCat
  })

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header y Acciones Principales */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-[#18251e] flex items-center gap-2.5">
            <UtensilsCrossed className="w-7 h-7 text-[#5a341e]" />
            Recetario & Fichas Técnicas
          </h1>
          <p className="text-sm text-[#524d45] mt-1">
            Fórmulas de platos con porciones exactas por comensal para alimentar los cálculos de banquetes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadDishes}
            className="p-2.5 rounded-xl bg-white border border-[#18251e]/15 text-[#524d45] hover:text-[#18251e] hover:border-[#5a341e]/50 transition-colors cursor-pointer shadow-sm"
            title="Recargar recetario"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleOpenCreate}
            className="px-4 py-2.5 rounded-xl bg-[#5a341e] hover:bg-[#472917] text-white font-bold text-sm shadow-md shadow-[#5a341e]/20 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            Nueva Receta
          </button>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#726e66]" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar por plato, descripción..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-[#18251e]/15 rounded-xl text-sm text-[#18251e] placeholder-[#18251e]/40 focus:outline-none focus:border-[#5a341e] shadow-sm transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-[#ebe4d5]/70 border border-[#18251e]/10 rounded-xl self-start sm:self-auto overflow-x-auto shadow-inner">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors whitespace-nowrap ${
                categoryFilter === cat ? 'bg-[#18241d] text-white shadow-sm' : 'text-[#524d45] hover:text-[#18251e]'
              }`}
            >
              {cat === 'all' ? 'Todas las Categorías' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Recetas */}
      {loading ? (
        <div className="p-16 text-center text-[#524d45] flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-[#5a341e]" />
          <p className="text-sm font-medium">Consultando recetario en MySQL...</p>
        </div>
      ) : filteredDishes.length === 0 ? (
        <div className="p-16 text-center text-[#524d45] flex flex-col items-center justify-center gap-3 bg-white border border-[#18251e]/10 rounded-2xl shadow-sm">
          <UtensilsCrossed className="w-10 h-10 text-[#726e66]/40" />
          <p className="text-sm font-semibold text-[#18251e]">No hay recetas registradas</p>
          <p className="text-xs text-[#726e66] max-w-sm">
            Comienza dando de alta un plato y asignando sus ingredientes por ración con el botón "Nueva Receta".
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDishes.map(dish => (
            <div
              key={dish.id}
              className="p-5 rounded-2xl bg-white border border-[#18251e]/10 hover:border-[#5a341e]/40 transition-all flex flex-col justify-between group shadow-sm hover:shadow-md"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#5a341e]/10 text-[#5a341e] border border-[#5a341e]/20">
                    {dish.category || 'Sin categoría'}
                  </span>
                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleOpenEdit(dish)}
                      className="p-1.5 rounded-lg text-[#524d45] hover:text-[#5a341e] hover:bg-[#18251e]/5 transition-colors cursor-pointer"
                      title="Editar plato"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(dish.id, dish.name)}
                      className="p-1.5 rounded-lg text-[#524d45] hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Eliminar plato"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-bold font-heading text-[#18251e] group-hover:text-[#5a341e] transition-colors">
                  {dish.name}
                </h3>

                {dish.description && (
                  <p className="text-xs text-[#524d45] line-clamp-2 mt-1.5 italic">
                    {dish.description}
                  </p>
                )}

                {/* Desglose de Ingredientes de la Receta */}
                <div className="mt-4 pt-3 border-t border-[#18251e]/10 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-[#726e66]">
                    <span className="flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-[#5a341e]" />
                      Composición por Ración
                    </span>
                    <span className="text-[11px] font-mono text-[#5a341e]">
                      {dish.ingredients.length} {dish.ingredients.length === 1 ? 'ingrediente' : 'ingredientes'}
                    </span>
                  </div>

                  <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                    {dish.ingredients.map((ing, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs py-1 px-2.5 rounded-lg bg-[#ebe4d5]/40 border border-[#18251e]/8"
                      >
                        <span className="text-[#18251e] truncate font-medium">{ing.ingredientName}</span>
                        <span className="font-mono text-[#5a341e] shrink-0 font-bold">
                          {ing.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#18251e]/10 flex items-center justify-between text-[11px] text-[#726e66]">
                <span>Listo para banquetes</span>
                <span className="flex items-center gap-1 text-emerald-800 font-semibold">
                  <Flame className="w-3 h-3 text-[#5a341e]" /> Ficha Técnica Activa
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <DishModal
        isOpen={isModalOpen}
        dish={selectedDish}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  )
}
