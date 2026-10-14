import { useState } from 'react'
import { GooeyToaster, gooeyToast } from 'goey-toast'
import SplitText from './components/SplitText'
import { 
  ChefHat, 
  Sparkles, 
  Calculator, 
  Calendar, 
  UtensilsCrossed, 
  Layers, 
  TrendingDown, 
  ArrowRight,
  Flame
} from 'lucide-react'

export default function App() {
  const [calculating, setCalculating] = useState(false)

  const triggerGooeySuccess = () => {
    gooeyToast.success('¡Escandallo calculado con éxito!', {
      description: 'Mermas optimizadas y lista de compra generada para 150 comensales.',
    })
  }

  const triggerGooeyWarning = () => {
    gooeyToast.warning('Atención con el Solomillo', {
      description: 'La merma estimada (20%) requiere pedir 150 kg para 120 kg netos.',
    })
  }

  const triggerSimulatedProcurement = () => {
    setCalculating(true)
    setTimeout(() => {
      setCalculating(false)
      gooeyToast.success('Menú de banquete validado', {
        description: '3 platos vinculados, 0 alérgenos críticos no gestionados.',
      })
    }, 1200)
  }

  return (
    <div className="min-h-screen bg-[#070a10] text-slate-100 flex flex-col selection:bg-amber-500/30">
      {/* Sistema de notificaciones Gooey Toast */}
      <GooeyToaster position="bottom-right" />

      {/* Barra superior con toque artesanal */}
      <header className="border-b border-slate-800/80 bg-[#070a10]/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <ChefHat className="w-6 h-6 text-slate-950 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight font-heading text-white flex items-center gap-1.5">
                Chef<span className="text-amber-400">Copilot</span>
              </span>
              <p className="text-[11px] text-slate-400 font-medium tracking-wide uppercase">Alta Cocina & Escandallos</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800/50">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              API .NET 9 & MySQL Conectados
            </span>
          </div>
        </div>
      </header>

      {/* Hero Section con React Bits (SplitText) */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-12 w-full flex flex-col justify-center">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Frontend potenciado con React Bits & Gooey Toast
          </div>

          {/* Componente React Bits: SplitText */}
          <div className="pt-2">
            <SplitText
              text="Precisión milimétrica para banquetes y recetarios."
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white font-heading leading-tight"
              delay={35}
              duration={0.8}
            />
          </div>

          <p className="text-lg text-slate-400 font-normal leading-relaxed">
            Se acabaron los cálculos en servilletas. Controla mermas, consolida ingredientes de menús complejos y genera la lista de compra de proveedores al instante.
          </p>

          {/* Botonera interactiva para probar Gooey Toast */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={triggerGooeySuccess}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-semibold text-sm transition-all duration-200 shadow-lg shadow-amber-500/20 flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Calculator className="w-4 h-4" />
              Probar Gooey Toast (Éxito)
            </button>

            <button
              onClick={triggerGooeyWarning}
              className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-sm transition-all duration-200 flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <TrendingDown className="w-4 h-4 text-amber-400" />
              Alerta de Merma Líquida
            </button>

            <button
              disabled={calculating}
              onClick={triggerSimulatedProcurement}
              className="px-5 py-3 rounded-xl bg-slate-900/80 hover:bg-slate-800/80 text-slate-300 border border-slate-800 text-sm font-medium transition-all duration-200 flex items-center gap-2 cursor-pointer"
            >
              <Flame className={`w-4 h-4 text-rose-400 ${calculating ? 'animate-spin' : ''}`} />
              {calculating ? 'Calculando banquete...' : 'Simular Validación'}
            </button>
          </div>
        </div>

        {/* Tarjetas de arquitectura y módulos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800/80 hover:border-amber-500/40 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-5 text-amber-400 group-hover:scale-105 transition-transform">
              <UtensilsCrossed className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white font-heading mb-2">Despensa & Mermas</h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              Cada ingrediente registra su unidad de medida y porcentaje de desperdicio técnico para compras exactas.
            </p>
            <div className="flex items-center text-xs font-semibold text-amber-400 gap-1">
              <span>CRUD + FluentValidation</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800/80 hover:border-amber-500/40 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-5 text-emerald-400 group-hover:scale-105 transition-transform">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white font-heading mb-2">Recetas Editables</h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              Composición de platos con ingredientes y porciones individuales. Sincronización completa en base de datos.
            </p>
            <div className="flex items-center text-xs font-semibold text-emerald-400 gap-1">
              <span>Recetas sincronizadas</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800/80 hover:border-amber-500/40 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-5 text-indigo-400 group-hover:scale-105 transition-transform">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white font-heading mb-2">Motor de Banquetes</h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              Cálculo automático de la lista de compra para N comensales aplicando la fórmula matemática de mermas.
            </p>
            <div className="flex items-center text-xs font-semibold text-indigo-400 gap-1">
              <span>Fórmula: Bruto = Neto / (1 - M)</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </main>

      {/* Footer minimalista */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        ChefCopilot · Diseñado con React Bits, Gooey Toast y .NET 9 Clean Architecture
      </footer>
    </div>
  )
}
