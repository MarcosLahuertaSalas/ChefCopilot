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
      <header className="border-b border-[#2e2118] bg-[#0c0704]/90 backdrop-blur-md sticky top-0 z-40 px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo y Branding */}
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#dc5000] via-[#ea580c] to-amber-500 flex items-center justify-center shadow-lg shadow-amber-900/40 ring-1 ring-[#dc5000]/40">
              <ChefHat className="w-6 h-6 text-[#0c0704] stroke-[2.4]" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight font-heading text-[#ffedd7] flex items-center gap-1">
                CHEF<span className="text-[#dc5000]">COPILOT</span>
              </span>
              <p className="text-[9.5px] text-[#a89988] font-bold tracking-[0.2em] uppercase">
                Ingeniería Gastronómica & Escandallos
              </p>
            </div>
          </div>

          {/* Navegación por Pestañas */}
          <nav className="flex items-center p-1 bg-[#160e09] border border-[#2e2118] rounded-xl shadow-2xl">
            <button
              onClick={() => setActiveTab('events')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'events'
                  ? 'bg-gradient-to-r from-[#dc5000] to-amber-600 text-slate-950 shadow-md shadow-amber-900/30 font-extrabold'
                  : 'text-[#a89988] hover:text-[#ffedd7] hover:bg-[#2e2118]/40'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Banquetes & Compras</span>
            </button>

            <button
              onClick={() => setActiveTab('dishes')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'dishes'
                  ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-slate-950 shadow-md shadow-emerald-950/40 font-extrabold'
                  : 'text-[#a89988] hover:text-[#ffedd7] hover:bg-[#2e2118]/40'
              }`}
            >
              <UtensilsCrossed className="w-3.5 h-3.5" />
              <span>Recetario</span>
            </button>

            <button
              onClick={() => setActiveTab('ingredients')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'ingredients'
                  ? 'bg-gradient-to-r from-[#dc5000] to-amber-600 text-slate-950 shadow-md shadow-amber-900/30 font-extrabold'
                  : 'text-[#a89988] hover:text-[#ffedd7] hover:bg-[#2e2118]/40'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Despensa & Stock</span>
            </button>
          </nav>

          {/* Indicador de Estado del Sistema */}
          <div className="hidden sm:flex items-center gap-2">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-950/40 text-emerald-400 border border-emerald-800/40">
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
