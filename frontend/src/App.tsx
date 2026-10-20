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

  // Vista de Espacio de Trabajo Profesional (Paleta Culinaria Editorial Lino & Terracota)
  return (
    <div className="min-h-screen bg-[#f4efe6] text-[#18251e] flex flex-col selection:bg-[#5a341e]/20 font-sans">
      {/* Sistema de notificaciones líquidas Gooey Toast */}
      <GooeyToaster position="bottom-right" />

      {/* Barra superior artesanal gastronómica */}
      <header className="border-b border-[#18251e]/10 bg-[#f4efe6]/90 backdrop-blur-md sticky top-0 z-40 px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Logo y Botón para volver al Inicio / Landing */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setViewMode('landing')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white hover:bg-[#ebe4d5] border border-[#18251e]/15 text-xs font-bold text-[#18251e] transition-all cursor-pointer group shadow-sm active:scale-95"
              title="Volver a la portada de inicio"
            >
              <div className="w-7 h-7 flex items-center justify-center">
                <img src="/juankia-logo.png" alt="JuankiA" className="w-full h-full object-contain" />
              </div>
              <Home className="w-3.5 h-3.5 text-[#5a341e] group-hover:-translate-x-0.5 transition-transform" />
              <span className="hidden sm:inline">Inicio</span>
            </button>

            <div className="h-6 w-px bg-[#18251e]/15" />

            <div>
              <span className="text-lg font-extrabold tracking-tight font-heading text-[#18251e] flex items-center gap-1">
                CHEF<span className="text-[#5a341e]">COPILOT</span>
              </span>
              <p className="text-[9px] text-[#726e66] font-bold tracking-[0.2em] uppercase">
                {currentUser?.restaurantName || 'Taller Culinario Profesional'}
              </p>
            </div>
          </div>

          {/* Navegación por Pestañas */}
          <nav className="flex items-center p-1 bg-[#ebe4d5]/70 border border-[#18251e]/10 rounded-2xl shadow-inner">
            <button
              onClick={() => setActiveTab('events')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'events'
                  ? 'bg-[#18241d] text-white shadow-md font-extrabold'
                  : 'text-[#524d45] hover:text-[#18251e] hover:bg-[#18251e]/5'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Banquetes & Compras</span>
            </button>

            <button
              onClick={() => setActiveTab('dishes')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'dishes'
                  ? 'bg-[#5a341e] text-white shadow-md font-extrabold'
                  : 'text-[#524d45] hover:text-[#18251e] hover:bg-[#18251e]/5'
              }`}
            >
              <UtensilsCrossed className="w-3.5 h-3.5" />
              <span>Recetario</span>
            </button>

            <button
              onClick={() => setActiveTab('ingredients')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'ingredients'
                  ? 'bg-[#18241d] text-white shadow-md font-extrabold'
                  : 'text-[#524d45] hover:text-[#18251e] hover:bg-[#18251e]/5'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Despensa & Stock</span>
            </button>
          </nav>

          {/* Perfil del Chef / Autenticación */}
          <div className="flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-2.5 bg-white border border-[#18251e]/15 px-3 py-1.5 rounded-xl shadow-sm">
                <div className="w-7 h-7 rounded-lg bg-[#5a341e] flex items-center justify-center text-white font-bold text-xs shadow-sm">
                  {currentUser.fullName.charAt(0).toUpperCase()}
                </div>
                <div className="hidden md:block text-left">
                  <span className="text-xs font-bold text-[#18251e] block leading-none">
                    {currentUser.fullName}
                  </span>
                  <span className="text-[9px] text-[#5a341e] font-semibold tracking-wider uppercase">
                    {currentUser.role}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-[#726e66] hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#5a341e] hover:bg-[#472917] text-xs font-bold text-white transition-all cursor-pointer shadow-md shadow-[#5a341e]/20 active:scale-95"
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
      <footer className="border-t border-[#18251e]/10 bg-[#ebe4d5]/50 py-6 px-6 text-center text-xs text-[#524d45]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="font-medium">ChefCopilot · Plataforma de Ingeniería Culinaria y Escandallos para Alta Cocina</span>
          <span className="text-[11px] text-[#726e66]">Fórmula de Doble Merma Técnica & Rendimiento por Piezas Enteras</span>
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
