import React, { useState } from 'react'
import { authApi } from '../../api/auth'
import type { User } from '../../types/auth'
import { gooeyToast } from 'goey-toast'
import { X, ChefHat, Lock, Mail, User as UserIcon, Store, ArrowRight, Sparkles } from 'lucide-react'

interface AuthModalProps {
  isOpen: boolean
  initialMode?: 'login' | 'register'
  onClose: () => void
  onSuccess: (user: User) => void
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'login',
  onClose,
  onSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [restaurantName, setRestaurantName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email.trim() || !password) {
      setError('Por favor, rellena todos los campos obligatorios.')
      return
    }

    setLoading(true)
    try {
      if (mode === 'register') {
        if (!fullName.trim()) {
          setError('El nombre del chef es obligatorio para registrarse.')
          setLoading(false)
          return
        }

        const res = await authApi.register({
          email: email.trim(),
          password,
          fullName: fullName.trim(),
          restaurantName: restaurantName.trim() || 'Cocina Principal',
        })

        gooeyToast.success('¡Bienvenido a ChefCopilot!', {
          description: `Cuenta creada con éxito para ${res.fullName}.`,
        })

        onSuccess({
          userId: res.userId,
          email: res.email,
          fullName: res.fullName,
          restaurantName: res.restaurantName,
          role: res.role,
          createdAt: res.createdAt,
        })
      } else {
        const res = await authApi.login({
          email: email.trim(),
          password,
        })

        gooeyToast.success('¡Sesión iniciada!', {
          description: `Bienvenido de nuevo, ${res.fullName}.`,
        })

        onSuccess({
          userId: res.userId,
          email: res.email,
          fullName: res.fullName,
          restaurantName: res.restaurantName,
          role: res.role,
          createdAt: res.createdAt,
        })
      }
      onClose()
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Ocurrió un error al procesar la solicitud.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-[#160e09] border border-[#2e2118] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Encabezado */}
        <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-[#2e2118] bg-[#0c0704]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#dc5000] to-amber-500 flex items-center justify-center shadow-lg shadow-amber-900/30">
              <ChefHat className="w-5 h-5 text-slate-950 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-base font-extrabold font-heading text-[#ffedd7]">
                CHEF<span className="text-[#dc5000]">COPILOT</span>
              </h3>
              <p className="text-[10px] text-[#a89988] font-semibold tracking-wider uppercase">
                {mode === 'login' ? 'Acceso a Cocina' : 'Crear Cuenta de Chef'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#a89988] hover:text-[#ffedd7] p-1.5 rounded-lg hover:bg-[#2e2118]/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pestañas de modo */}
        <div className="flex border-b border-[#2e2118] bg-[#0c0704]/60 p-1">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(null); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              mode === 'login'
                ? 'bg-[#1e130c] text-amber-400 border border-[#40372e]/80 shadow-inner'
                : 'text-[#a89988] hover:text-[#ffedd7]'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(null); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              mode === 'register'
                ? 'bg-[#1e130c] text-amber-400 border border-[#40372e]/80 shadow-inner'
                : 'text-[#a89988] hover:text-[#ffedd7]'
            }`}
          >
            Crear Cuenta
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs">
              {error}
            </div>
          )}

          {mode === 'register' && (
            <>
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#a89988]">
                  Nombre y Apellidos *
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a89988]" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="Ej: Chef Juan Carlos Bonavia"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-[#0c0704] border border-[#2e2118] rounded-xl text-sm text-[#ffedd7] placeholder-[#a89988]/50 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#a89988]">
                  Nombre del Restaurante / Catering
                </label>
                <div className="relative">
                  <Store className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a89988]" />
                  <input
                    type="text"
                    value={restaurantName}
                    onChange={e => setRestaurantName(e.target.value)}
                    placeholder="Ej: Asador Bonavia & Banquets"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-[#0c0704] border border-[#2e2118] rounded-xl text-sm text-[#ffedd7] placeholder-[#a89988]/50 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#a89988]">
              Correo Electrónico *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a89988]" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="chef@tudominio.com"
                className="w-full pl-10 pr-3.5 py-2.5 bg-[#0c0704] border border-[#2e2118] rounded-xl text-sm text-[#ffedd7] placeholder-[#a89988]/50 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#a89988]">
              Contraseña *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a89988]" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 bg-[#0c0704] border border-[#2e2118] rounded-xl text-sm text-[#ffedd7] placeholder-[#a89988]/50 focus:outline-none focus:border-amber-500"
              />
            </div>
            {mode === 'register' && (
              <span className="text-[10px] text-[#a89988]">Mínimo 6 caracteres.</span>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-[#dc5000] via-[#ea580c] to-amber-500 hover:opacity-95 text-slate-950 font-bold text-sm shadow-xl shadow-amber-900/30 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98 disabled:opacity-50"
          >
            {loading ? (
              <span>Cargando...</span>
            ) : mode === 'login' ? (
              <>
                <span>Entrar a mi Cocina</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Crear Cuenta de Chef</span>
              </>
            )}
          </button>
        </form>

        {/* Pie de modal */}
        <div className="px-6 py-3.5 bg-[#0c0704] border-t border-[#2e2118] text-center text-xs text-[#a89988]">
          {mode === 'login' ? (
            <span>
              ¿Aún no tienes cuenta?{' '}
              <button
                type="button"
                onClick={() => setMode('register')}
                className="text-amber-400 font-semibold hover:underline cursor-pointer"
              >
                Regístrate gratis
              </button>
            </span>
          ) : (
            <span>
              ¿Ya tienes cuenta?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-amber-400 font-semibold hover:underline cursor-pointer"
              >
                Inicia sesión aquí
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
