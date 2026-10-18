import React, { useState } from 'react'
import { JuankiAMascot } from '../../components/JuankiAMascot'
import { AuthModal } from '../auth/AuthModal'
import type { User } from '../../types/auth'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'

interface LandingPageProps {
  onEnterApp: () => void
  onUserLoggedIn: (user: User) => void
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onEnterApp,
  onUserLoggedIn,
}) => {
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')

  const handleOpenLogin = () => {
    setAuthMode('login')
    setAuthModalOpen(true)
  }

  const handleOpenRegister = () => {
    setAuthMode('register')
    setAuthModalOpen(true)
  }

  const handleAuthSuccess = (user: User) => {
    onUserLoggedIn(user)
    onEnterApp()
  }

  return (
    <div className="min-h-screen bg-[#f4efe6] text-[#18251e] flex flex-col justify-between selection:bg-[#5a341e]/20 relative overflow-hidden font-sans">
      {/* Barra de navegación superior idéntica a Figma */}
      <header className="px-8 sm:px-12 py-6 flex items-center justify-between max-w-[1720px] mx-auto w-full">
        {/* Logo Izquierda */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full overflow-hidden bg-[#ebe5d8] border border-[#18251e]/15 shadow-sm">
            <img src="/juankia.jpg" alt="ChefCopilot Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <span className="text-sm font-extrabold tracking-tight font-heading text-[#18251e] block leading-none">
              CHEFCOPILOT
            </span>
            <span className="text-[9px] text-[#726e66] font-semibold tracking-[0.2em] uppercase block mt-1">
              TU ASISTENTE DE COCINA
            </span>
          </div>
        </div>

        {/* Acciones Derecha */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="px-5 py-2 rounded-full border border-[#18251e]/30 text-xs font-bold text-[#18251e] hover:bg-[#18251e]/5 transition-colors cursor-pointer"
          >
            INICIO
          </button>

          <button
            onClick={handleOpenLogin}
            className="px-4 py-2 text-xs font-bold text-[#18251e] hover:text-[#5a341e] transition-colors cursor-pointer"
          >
            INICIAR SESIÓN
          </button>

          <button
            onClick={handleOpenRegister}
            className="px-5 py-2 rounded-full bg-[#18241d] hover:bg-[#111a14] text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-[#18241d]/15 transition-all cursor-pointer active:scale-95"
          >
            <span>CHEFCOPILOT</span>
            <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>
      </header>

      {/* Contenido Principal / Hero Section calcado de Figma */}
      <main className="flex-1 max-w-[1720px] mx-auto w-full px-8 sm:px-12 py-4 flex flex-col justify-center relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Columna Izquierda: Tipografía Editorial Monumental */}
          <div className="lg:col-span-7 space-y-8 pr-0 lg:pr-6">
            
            <div className="space-y-4">
              <span className="text-[10px] sm:text-[11px] font-extrabold tracking-[0.25em] uppercase text-[#18251e]/60 block">
                CREADO PARA COCINEROS
              </span>

              <span className="text-[11px] sm:text-[12px] font-extrabold tracking-[0.22em] uppercase text-[#18251e]/85 block pt-4">
                IDEAS, RECETAS Y SERVICIO EN UN MISMO LUGAR
              </span>

              {/* Titular Masivo CHEF COPILOT */}
              <div className="leading-[0.88] select-none">
                <h1 className="text-7xl sm:text-8xl md:text-9xl lg:text-[132px] font-extrabold font-heading text-[#18251e] tracking-tight block">
                  CHEF
                </h1>
                <h1 className="text-7xl sm:text-8xl md:text-9xl lg:text-[132px] font-extrabold font-heading text-[#5a341e] tracking-tight block">
                  COPILOT
                </h1>
              </div>
            </div>

            {/* Separador inferior con número 01 y texto de propósito */}
            <div className="pt-6 border-t border-[#18251e]/20 max-w-md">
              <div className="flex items-start gap-4">
                <span className="text-xs font-mono font-bold text-[#18251e]/50 mt-0.5">
                  01
                </span>
                <p className="text-xs sm:text-sm text-[#4a463e] leading-relaxed font-normal">
                  El espacio personal de un chef para organizar, crear y llevar su cocina un paso más allá.
                </p>
              </div>

              {/* Botón rápido de entrada directa a la app */}
              <div className="mt-6 flex items-center gap-3">
                <button
                  onClick={onEnterApp}
                  className="px-6 py-3 rounded-xl bg-[#5a341e] hover:bg-[#472917] text-white text-xs font-bold shadow-lg shadow-[#5a341e]/20 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
                >
                  <span>Explorar Demostración</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>

          {/* Columna Derecha: Tarjeta de JuankiA con Eye Tracking */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end relative">
            <div className="w-full max-w-md sm:max-w-lg">
              <JuankiAMascot
                className="w-full border border-[#18251e]/10 shadow-2xl"
                interactive={true}
                showBadge={true}
              />
            </div>
          </div>

        </div>

        {/* Texto vertical rotado en el margen derecho */}
        <div className="hidden xl:block absolute right-3 top-1/2 -translate-y-1/2">
          <span 
            className="text-[10px] font-extrabold tracking-[0.3em] uppercase text-[#18251e]/40 select-none block"
            style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
          >
            TU COCINA · EN ORDEN
          </span>
        </div>

        {/* Botón flotante circular inferior derecho "DESCUBRE" */}
        <button
          onClick={handleOpenRegister}
          className="fixed bottom-8 right-8 w-16 h-16 rounded-full bg-[#4a2c1b] hover:bg-[#382114] text-white flex flex-col items-center justify-center shadow-2xl shadow-[#4a2c1b]/40 cursor-pointer transition-transform hover:scale-105 active:scale-95 group z-30"
          title="Descubre ChefCopilot"
        >
          <span className="text-[9px] font-bold tracking-widest uppercase block leading-none">
            DESCUBRE
          </span>
          <ArrowDownRight className="w-4 h-4 mt-0.5 group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-transform" />
        </button>
      </main>

      {/* Pie minimalista */}
      <footer className="px-8 sm:px-12 py-4 max-w-[1720px] mx-auto w-full flex items-center justify-between text-[11px] text-[#726e66] border-t border-[#18251e]/10">
        <span>ChefCopilot · Plataforma Gastronómica de Alta Cocina</span>
        <span>Con la asistencia de JuankiA</span>
      </footer>

      {/* Modal de Autenticación (Login / Register) */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authMode}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  )
}
