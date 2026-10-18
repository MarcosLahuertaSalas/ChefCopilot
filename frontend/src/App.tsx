import { useState } from 'react'
import { GooeyToaster } from 'goey-toast'
import { IngredientsView } from './features/ingredients/IngredientsView'
import { DishesView } from './features/dishes/DishesView'
import { EventsView } from './features/events/EventsView'
import { 
  ChefHat, 
  Scale, 
  UtensilsCrossed, 
  Calendar 
} from 'lucide-react'

type TabType = 'ingredients' | 'dishes' | 'events'

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('events')

  return (
    <div className="min-h-screen bg-[#100904] text-[#ffedd7] flex flex-col selection:bg-amber-500/30">
      {/* Sistema de notificaciones líquidas Gooey Toast */}
      <GooeyToaster position="bottom-right" />

      {/* Barra superior artesanal gastronómica */}
      <header className="border-b border-[#40372e] bg-[#100904]/90 backdrop-blur-md sticky top-0 z-40 px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo y Branding */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#dc5000] to-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <ChefHat className="w-6 h-6 text-slate-950 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight font-heading text-[#ffedd7] flex items-center gap-1.5">
                Chef<span className="text-amber-400">Copilot</span>
              </span>
              <p className="text-[10px] text-[#a89988] font-semibold tracking-wider uppercase">
                Ingeniería Gastronómica & Escandallos
              </p>
            </div>
          </div>

          {/* Navegación por Pestañas */}
          <nav className="flex items-center p-1 bg-[#1c120c] border border-[#40372e] rounded-2xl shadow-inner">
            <button
              onClick={() => setActiveTab('events')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'events'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-[#a89988] hover:text-[#ffedd7] hover:bg-[#40372e]/30'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Banquetes & Compras</span>
            </button>

            <button
              onClick={() => setActiveTab('dishes')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'dishes'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-[#a89988] hover:text-[#ffedd7] hover:bg-[#40372e]/30'
              }`}
            >
              <UtensilsCrossed className="w-4 h-4" />
              <span>Recetario</span>
            </button>

            <button
              onClick={() => setActiveTab('ingredients')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'ingredients'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-[#a89988] hover:text-[#ffedd7] hover:bg-[#40372e]/30'
              }`}
            >
              <Scale className="w-4 h-4" />
              <span>Despensa & Stock</span>
            </button>
          </nav>

          {/* Indicador de Estado del Sistema */}
          <div className="hidden sm:flex items-center gap-2">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800/50">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              .NET 9 + MySQL 8.0 Activos
            </span>
          </div>
        </div>
      </header>

      {/* Contenido Principal según Pestaña */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full">
        {activeTab === 'events' && <EventsView />}
        {activeTab === 'dishes' && <DishesView />}
        {activeTab === 'ingredients' && <IngredientsView />}
      </main>

      {/* Footer Editorial Gastronómico */}
      <footer className="border-t border-[#40372e] bg-[#100904] py-6 px-6 text-center text-xs text-[#a89988]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>ChefCopilot · Plataforma de Ingeniería Culinaria y Escandallos para Alta Cocina</span>
          <span className="text-[11px] text-[#a89988]/80">Fórmula de Mermas Reutilizables & Deducción de Stock Cámara</span>
        </div>
      </footer>
    </div>
  )
}
