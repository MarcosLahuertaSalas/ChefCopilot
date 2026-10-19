import React, { useState, useEffect } from 'react'
import { WarpText } from '../../components/animated/WarpText'
import { AnimatedContent } from '../../components/animated/AnimatedContent'
import { JuankiA3D } from '../../components/JuankiA3D'
import { AuthModal } from '../auth/AuthModal'
import type { User } from '../../types/auth'
import {
  ArrowUpRight,
  ArrowDownRight,
  Scale,
  UtensilsCrossed,
  Calendar,
  ShieldCheck,
  Package,
  ArrowUp,
  CheckCircle2
} from 'lucide-react'

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
  const [isScrolled, setIsScrolled] = useState(false)

  // Escucha del scroll para alternar entre "DESCUBRE ↘" y "SUBIR ↑"
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 450)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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

  const scrollToStory = () => {
    const el = document.getElementById('por-que-chefcopilot')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-[#f4efe6] text-[#18251e] flex flex-col justify-between selection:bg-[#5a341e]/20 relative overflow-x-hidden font-sans">
      {/* Barra de navegación superior */}
      <header className="px-8 sm:px-12 py-6 flex items-center justify-between max-w-[1720px] mx-auto w-full sticky top-0 z-40 bg-[#f4efe6]/90 backdrop-blur-md border-b border-[#18251e]/8">
        {/* Logo Izquierda: 2D JuankiA transparente sin recuadro ni fondo */}
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 flex items-center justify-center">
            <img
              src="/juankia-logo.png"
              alt="ChefCopilot Logo"
              className="w-full h-full object-contain filter drop-shadow-sm transition-transform hover:scale-105"
            />
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
            onClick={scrollToTop}
            className="px-5 py-2 rounded-full border border-[#18251e]/30 text-xs font-bold text-[#18251e] hover:bg-[#18251e]/5 transition-colors cursor-pointer"
          >
            INICIO
          </button>

          <button
            onClick={scrollToStory}
            className="hidden md:inline-block px-4 py-2 text-xs font-bold text-[#18251e]/80 hover:text-[#18251e] transition-colors cursor-pointer"
          >
            ¿PARA QUÉ SIRVE?
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

      {/* HERO SECTION idéntico a Figma con titular animado SplitText y JuankiA 3D */}
      <section className="max-w-[1720px] mx-auto w-full px-8 sm:px-12 py-8 min-h-[calc(100vh-90px)] flex flex-col justify-center relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

          {/* Columna Izquierda: Tipografía Editorial Monumental con SplitText */}
          <div className="lg:col-span-7 space-y-8 pr-0 lg:pr-6">

            <div className="space-y-4">
              <span className="text-[10px] sm:text-[11px] font-extrabold tracking-[0.25em] uppercase text-[#18251e]/60 block animate-in fade-in slide-in-from-top-2 duration-500">
                CREADO PARA COCINEROS
              </span>

              <span className="text-[11px] sm:text-[12px] font-extrabold tracking-[0.22em] uppercase text-[#18251e]/85 block pt-4 animate-in fade-in slide-in-from-top-3 duration-700">
                IDEAS, RECETAS Y SERVICIO EN UN MISMO LUGAR
              </span>

              {/* Titular Masivo CHEF COPILOT con animación interactiva WarpText de React Bits */}
              <div className="select-none py-1">
                <h1 className="sr-only">CHEF COPILOT</h1>
                <WarpText
                  text={'CHEF\nCOPILOT'}
                  color={['#18251e', '#5a341e']}
                  warpStrength={0.065}
                  warpScale={1.65}
                  speed={0.45}
                  pointerInfluence={0.42}
                  pointerStrength={0.38}
                  refraction={0.016}
                  ripple={true}
                  fontSize="clamp(3.8rem, 8.8vw, 7.8rem)"
                  fontWeight={800}
                  fontFamily="'Space Grotesk', sans-serif"
                  letterSpacing="-0.04em"
                  lineHeight={0.88}
                  textAlign="left"
                  style={{ height: '240px', maxWidth: '640px' }}
                />
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

                <button
                  onClick={scrollToStory}
                  className="px-4 py-3 rounded-xl border border-[#18251e]/20 hover:bg-[#18251e]/5 text-xs font-bold text-[#18251e] transition-colors cursor-pointer"
                >
                  Ver Cómo Funciona
                </button>
              </div>
            </div>

          </div>

          {/* Columna Derecha: JuankiA 3D con Saludo y Bocadillo Interactivo */}
          <div className="lg:col-span-5 flex flex-col items-center lg:items-end relative">
            <div className="w-full max-w-md sm:max-w-lg relative flex flex-col items-center">
              <JuankiA3D
                className="w-full"
                interactive={true}
                showBadge={true}
                onScrollDown={scrollToStory}
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
      </section>

      {/* SECCIÓN 01: ¿POR QUÉ CHEFCOPILOT? (STORYTELLING DE PROBLEMAS REALES EN COCINA) */}
      <section
        id="por-que-chefcopilot"
        className="max-w-[1720px] mx-auto w-full px-8 sm:px-12 py-24 border-t border-[#18251e]/15 scroll-mt-20"
      >
        <AnimatedContent distance={45} direction="vertical" duration={0.8} ease="power3.out">
          <div className="max-w-4xl space-y-4">
            <span className="text-xs font-mono font-bold tracking-[0.25em] uppercase text-[#5a341e]">
              01 · INGENIERÍA GASTRONÓMICA
            </span>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold font-heading text-[#18251e] tracking-tight leading-[1.05]">
              Una cocina profesional no se gestiona con intuición, sino con precisión milimétrica.
            </h2>
            <p className="text-base sm:text-lg text-[#524d45] leading-relaxed pt-2">
              El caos de las mermas no controladas y los pedidos calculados "a ojo" suponen miles de euros perdidos cada temporada. ChefCopilot automatiza las tres reglas de oro del chef ejecutivo:
            </p>
          </div>
        </AnimatedContent>

        {/* Rejilla de los 3 Grandes Dolores de Cocina Resueltos con AnimatedContent */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <AnimatedContent distance={50} direction="vertical" duration={0.8} delay={0.05} tilt={4}>
            {/* Pilar 1: Mermas Técnicas vs Subproducto */}
            <div className="bg-[#ebe4d5]/60 hover:bg-[#ebe4d5] p-8 rounded-3xl border border-[#18251e]/10 shadow-sm transition-all duration-300 flex flex-col justify-between group h-full">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#5a341e] text-[#f4efe6] flex items-center justify-center shadow-md">
                  <Scale className="w-6 h-6 stroke-[2]" />
                </div>
                <h3 className="text-xl font-extrabold font-heading text-[#18251e]">
                  Doble Merma Técnica
                </h3>
                <p className="text-xs sm:text-sm text-[#4a463e] leading-relaxed">
                  Diferenciamos la <strong>basura inútil</strong> (grasa y nervios no aptos) de la <strong>merma reutilizable</strong> (recortes limpios de solomillo para albóndigas o espinas para fondos). Deja de tirar producto que tiene valor económico.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-[#18251e]/10 flex items-center justify-between text-xs font-bold text-[#5a341e]">
                <span>+18% Materia Rescatada</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              </div>
            </div>
          </AnimatedContent>

          <AnimatedContent distance={50} direction="vertical" duration={0.8} delay={0.15} tilt={4}>
            {/* Pilar 2: La Regla del Chef por Piezas Enteras */}
            <div className="bg-[#ebe4d5]/60 hover:bg-[#ebe4d5] p-8 rounded-3xl border border-[#18251e]/10 shadow-sm transition-all duration-300 flex flex-col justify-between group h-full">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#18241d] text-[#f4efe6] flex items-center justify-center shadow-md">
                  <UtensilsCrossed className="w-6 h-6 stroke-[2]" />
                </div>
                <h3 className="text-xl font-extrabold font-heading text-[#18251e]">
                  La Regla del Chef por Piezas
                </h3>
                <p className="text-xs sm:text-sm text-[#4a463e] leading-relaxed">
                  El solomillo o pescado entero se compra por piezas, no por gramos sueltos. Calculamos la orden usando el <strong>rendimiento mínimo garantizado</strong> (cálculo pesimista). Para 80 pax pides 10 piezas y tienes hasta 20 raciones de colchón de seguridad.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-[#18251e]/10 flex items-center justify-between text-xs font-bold text-[#18241d]">
                <span>Cero Faltas en Sala</span>
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
              </div>
            </div>
          </AnimatedContent>

          <AnimatedContent distance={50} direction="vertical" duration={0.8} delay={0.25} tilt={4}>
            {/* Pilar 3: Deducción Automática de Stock en Cámara */}
            <div className="bg-[#ebe4d5]/60 hover:bg-[#ebe4d5] p-8 rounded-3xl border border-[#18251e]/10 shadow-sm transition-all duration-300 flex flex-col justify-between group h-full">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#8c4b26] text-[#f4efe6] flex items-center justify-center shadow-md">
                  <Calendar className="w-6 h-6 stroke-[2]" />
                </div>
                <h3 className="text-xl font-extrabold font-heading text-[#18251e]">
                  Deducción de Stock Cámara
                </h3>
                <p className="text-xs sm:text-sm text-[#4a463e] leading-relaxed">
                  Antes de emitir el pedido al proveedor, ChefCopilot comprueba tus existencias reales en cámara, deduce lo que ya tienes y emite <strong>alertas críticas</strong> si tras el banquete el stock cae por debajo del umbral mínimo de seguridad.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-[#18251e]/10 flex items-center justify-between text-xs font-bold text-[#8c4b26]">
                <span>Cero Pedidos Duplicados</span>
                <Package className="w-4 h-4 text-emerald-700" />
              </div>
            </div>
          </AnimatedContent>
        </div>
      </section>

      {/* SECCIÓN 02: EL FLUJO DE TRABAJO DEL CHEF (EN 3 PASOS) */}
      <section className="max-w-[1720px] mx-auto w-full px-8 sm:px-12 py-20 border-t border-[#18251e]/15">
        <AnimatedContent distance={40} direction="vertical" duration={0.8}>
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-mono font-bold tracking-[0.25em] uppercase text-[#5a341e]">
              02 · EL FLUJO DE TRABAJO
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-heading text-[#18251e]">
              Del recetario al proveedor en 3 pasos directos
            </h2>
            <p className="text-sm text-[#524d45]">
              Sin perder horas sumando ingredientes repetidos en libretas o Excel.
            </p>
          </div>
        </AnimatedContent>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-14">
          <AnimatedContent distance={45} direction="vertical" duration={0.8} delay={0.08}>
            <div className="p-8 rounded-3xl bg-[#fffcf7] border border-[#18251e]/10 relative shadow-sm h-full">
              <span className="text-4xl font-extrabold font-mono text-[#5a341e]/30 block">
                01
              </span>
              <h4 className="text-lg font-bold font-heading text-[#18251e] mt-4">
                Despensa & Stock Técnico
              </h4>
              <p className="text-xs sm:text-sm text-[#524d45] mt-2 leading-relaxed">
                Registra tus ingredientes con sus mermas reales, alérgenos oficiales y umbrales mínimos de stock en cámara.
              </p>
            </div>
          </AnimatedContent>

          <AnimatedContent distance={45} direction="vertical" duration={0.8} delay={0.18}>
            <div className="p-8 rounded-3xl bg-[#fffcf7] border border-[#18251e]/10 relative shadow-sm h-full">
              <span className="text-4xl font-extrabold font-mono text-[#5a341e]/30 block">
                02
              </span>
              <h4 className="text-lg font-bold font-heading text-[#18251e] mt-4">
                Recetario & Fichas Técnicas
              </h4>
              <p className="text-xs sm:text-sm text-[#524d45] mt-2 leading-relaxed">
                Diseña tus platos fijando gramajes netos por ración individual. Los alérgenos y las mermas se calculan en cascada.
              </p>
            </div>
          </AnimatedContent>

          <AnimatedContent distance={45} direction="vertical" duration={0.8} delay={0.28}>
            <div className="p-8 rounded-3xl bg-[#fffcf7] border border-[#18251e]/10 relative shadow-sm h-full">
              <span className="text-4xl font-extrabold font-mono text-[#5a341e]/30 block">
                03
              </span>
              <h4 className="text-lg font-bold font-heading text-[#18251e] mt-4">
                Banquetes & Hoja de Pedido
              </h4>
              <p className="text-xs sm:text-sm text-[#524d45] mt-2 leading-relaxed">
                Introduce los comensales (ej: 80 pax) y obtén la lista consolidada lista para copiar al proveedor o imprimir para partida.
              </p>
            </div>
          </AnimatedContent>
        </div>
      </section>

      {/* SECCIÓN 03: LLAMADA A LA ACCIÓN CON JUANKIA */}
      <section className="max-w-[1720px] mx-auto w-full px-8 sm:px-12 py-20 border-t border-[#18251e]/15 mb-12">
        <AnimatedContent distance={50} direction="vertical" duration={0.9} scale={0.98}>
          <div className="p-10 sm:p-14 rounded-3xl bg-[#18241d] text-[#ffedd7] flex flex-col lg:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden">

            <div className="space-y-4 max-w-2xl relative z-10">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-300">
                  Tu Copiloto Culinario 24/7
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-heading text-white">
                Lleva el control de tu cocina al siguiente nivel.
              </h2>
              <p className="text-sm text-[#d4c6b6] leading-relaxed">
                Prueba la calculadora de escandallos en vivo de ChefCopilot o accede a tu espacio personal con la asistencia de JuankiA.
              </p>
              <div className="pt-4 flex flex-wrap items-center gap-4">
                <button
                  onClick={onEnterApp}
                  className="px-6 py-3.5 rounded-xl bg-[#ffedd7] hover:bg-white text-[#18241d] font-bold text-xs shadow-lg shadow-black/25 flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-95"
                >
                  <span>Entrar al Taller de Cocina</span>
                  <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                </button>

                <button
                  onClick={handleOpenRegister}
                  className="px-6 py-3.5 rounded-xl border border-white/20 hover:bg-white/10 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  Crear Cuenta de Chef
                </button>
              </div>
            </div>

            {/* Mini Avatar JuankiA de muestra */}
            <div className="w-40 h-40 sm:w-48 sm:h-48 relative flex items-center justify-center">
              <img
                src="/juankia-logo.png"
                alt="JuankiA Mascot"
                className="w-full h-full object-contain filter drop-shadow-2xl hover:scale-105 transition-transform"
              />
            </div>

          </div>
        </AnimatedContent>
      </section>

      {/* Botón flotante circular inferior derecho "DESCUBRE ↘" o "SUBIR ↑" */}
      <button
        onClick={isScrolled ? scrollToTop : scrollToStory}
        className="fixed bottom-8 right-8 w-16 h-16 rounded-full bg-[#4a2c1b] hover:bg-[#382114] text-white flex flex-col items-center justify-center shadow-2xl shadow-[#4a2c1b]/40 cursor-pointer transition-transform hover:scale-105 active:scale-95 group z-30"
        title={isScrolled ? 'Volver al Inicio' : 'Descubre ChefCopilot'}
      >
        <span className="text-[9px] font-bold tracking-widest uppercase block leading-none">
          {isScrolled ? 'SUBIR' : 'DESCUBRE'}
        </span>
        {isScrolled ? (
          <ArrowUp className="w-4 h-4 mt-0.5 group-hover:-translate-y-0.5 transition-transform" />
        ) : (
          <ArrowDownRight className="w-4 h-4 mt-0.5 group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-transform" />
        )}
      </button>

      {/* Pie minimalista */}
      <footer className="px-8 sm:px-12 py-6 max-w-[1720px] mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#726e66] border-t border-[#18251e]/10">
        <span>ChefCopilot · Plataforma Gastronómica de Alta Cocina</span>
        <span>Con la asistencia de JuankiA · .NET 9 + MySQL + Three.js</span>
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
