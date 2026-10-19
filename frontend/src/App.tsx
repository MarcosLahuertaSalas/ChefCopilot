import { useState, useEffect } from 'react'
import { GooeyToaster } from 'goey-toast'
import { LandingPage } from './features/landing/LandingPage'
import { IngredientsView } from './features/ingredients/IngredientsView'
import { DishesView } from './features/dishes/DishesView'
import { EventsView } from './features/events/EventsView'
import { JuankiAChatWidget } from './components/JuankiAChatWidget'
import { AuthModal } from './features/auth/AuthModal'
import type { User } from './types/auth'
import { 
  Scale, 
  UtensilsCrossed, 
  Calendar,
  Home,
  LogOut,
  LogIn
} from 'lucide-react'

type TabType = 'events' | 'dishes' | 'ingredients'
type ViewMode = 'landing' | 'app'

export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('landing')
  const [activeTab, setActiveTab] = useState<TabType>('events')
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [authModalOpen, setAuthModalOpen] = useState(false)

  // Cargar usuario guardado en localStorage al iniciar
  useEffect(() => {
    try {
      const stored = localStorage.getItem('chefcopilot_user')
      if (stored) {
        const parsed = JSON.parse(stored) as User
        setCurrentUser(parsed)
      }
    } catch {
      // Ignorar error de parsing
    }
  }, [])

  const handleUserLoggedIn = (user: User) => {
    setCurrentUser(user)
    try {
      localStorage.setItem('chefcopilot_user', JSON.stringify(user))
    } catch {
      // Ignorar error de storage
    }
  }

  const handleLogout = () => {
    setCurrentUser(null)
    localStorage.removeItem('chefcopilot_user')
  }

  // Vista de Landing Page según el diseño de Figma
  if (viewMode === 'landing') {
    return (
      <>
        <GooeyToaster position="bottom-right" />
        <LandingPage
          onEnterApp={() => setViewMode('app')}
          onUserLoggedIn={handleUserLoggedIn}
        />
      </>
    )
  }

  // Vista de Espacio de Trabajo Profesional (Darkroom Gastronómico)
  return (
    <div className="min-h-screen bg-[#100904] text-[#ffedd7] flex flex-col selection:bg-amber-500/30">
      {/* Sistema de notificaciones líquidas Gooey Toast */}
      <GooeyToaster position="bottom-right" />

      {/* Barra superior artesanal gastronómica */}
      <header className="border-b border-[#2e2118] bg-[#0c0704]/90 backdrop-blur-md sticky top-0 z-40 px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Logo y Botón para volver al Inicio / Landing */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setViewMode('landing')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#160e09] hover:bg-[#2e2118] border border-[#2e2118] text-xs font-bold text-[#ffedd7] transition-all cursor-pointer group shadow-sm"
              title="Volver a la portada de inicio"
            >
              <div className="w-7 h-7 flex items-center justify-center">
                <img src="/juankia-logo.png" alt="JuankiA" className="w-full h-full object-contain" />
              </div>
              <Home className="w-3.5 h-3.5 text-amber-500 group-hover:-translate-x-0.5 transition-transform" />
              <span className="hidden sm:inline">Inicio</span>
            </button>

            <div className="h-6 w-px bg-[#2e2118]" />

            <div>
              <span className="text-lg font-bold tracking-tight font-heading text-[#ffedd7] flex items-center gap-1">
                CHEF<span className="text-[#dc5000]">COPILOT</span>
              </span>
              <p className="text-[9px] text-[#a89988] font-bold tracking-[0.2em] uppercase">
                {currentUser?.restaurantName || 'Taller Culinario Profesional'}
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

          {/* Perfil del Chef / Autenticación */}
          <div className="flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-2.5 bg-[#160e09] border border-[#2e2118] px-3 py-1.5 rounded-xl">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-slate-950 font-bold text-xs shadow-sm">
                  {currentUser.fullName.charAt(0).toUpperCase()}
                </div>
                <div className="hidden md:block text-left">
                  <span className="text-xs font-bold text-[#ffedd7] block leading-none">
                    {currentUser.fullName}
                  </span>
                  <span className="text-[9px] text-amber-400/90 font-medium tracking-wider">
                    {currentUser.role}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-[#a89988] hover:text-rose-400 p-1 rounded-lg hover:bg-[#2e2118] transition-colors cursor-pointer"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#dc5000]/10 hover:bg-[#dc5000]/20 border border-[#dc5000]/30 text-xs font-bold text-amber-300 transition-all cursor-pointer shadow-sm"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Acceso Chef</span>
              </button>
            )}
          </div>

        </div>
      </header>

      {/* Contenido Principal según Pestaña */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full">
        {activeTab === 'events' && <EventsView />}
        {activeTab === 'dishes' && <DishesView />}
        {activeTab === 'ingredients' && <IngredientsView />}
      </main>

      {/* Mascota y Asistente IA Flotante JuankiA */}
      <JuankiAChatWidget />

      {/* Footer Editorial Gastronómico */}
      <footer className="border-t border-[#40372e] bg-[#100904] py-6 px-6 text-center text-xs text-[#a89988]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>ChefCopilot · Plataforma de Ingeniería Culinaria y Escandallos para Alta Cocina</span>
          <span className="text-[11px] text-[#a89988]/80">Fórmula de Mermas Reutilizables & Deducción de Stock Cámara</span>
        </div>
      </footer>

      {/* Modal de Autenticación */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleUserLoggedIn}
      />
    </div>
  )
}
