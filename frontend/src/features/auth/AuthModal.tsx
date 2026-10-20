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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#18251e]/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-[#fdfbf7] border border-[#18251e]/15 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Encabezado */}
        <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-[#18251e]/10 bg-[#ebe4d5]/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#5a341e] flex items-center justify-center shadow-md shadow-[#5a341e]/20">
              <ChefHat className="w-5 h-5 text-white stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-base font-extrabold font-heading text-[#18251e]">
                CHEF<span className="text-[#5a341e]">COPILOT</span>
              </h3>
              <p className="text-[10px] text-[#726e66] font-bold tracking-wider uppercase">
                {mode === 'login' ? 'Acceso a Cocina' : 'Crear Cuenta de Chef'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#726e66] hover:text-[#18251e] p-1.5 rounded-lg hover:bg-[#18251e]/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pestañas de modo */}
        <div className="flex border-b border-[#18251e]/10 bg-[#ebe4d5]/40 p-1">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(null); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-white text-[#18251e] border border-[#18251e]/10 shadow-sm'
                : 'text-[#524d45] hover:text-[#18251e]'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(null); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              mode === 'register'
                ? 'bg-white text-[#18251e] border border-[#18251e]/10 shadow-sm'
                : 'text-[#524d45] hover:text-[#18251e]'
            }`}
          >
            Crear Cuenta
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
              {error}
            </div>
          )}

          {mode === 'register' && (
            <>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-[#726e66]">
                  Nombre y Apellidos *
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#726e66]" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="Ej: Chef Juan Carlos Bonavia"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-[#18251e]/15 rounded-xl text-sm text-[#18251e] placeholder-[#18251e]/40 focus:outline-none focus:border-[#5a341e] shadow-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-[#726e66]">
                  Nombre del Restaurante / Catering
                </label>
                <div className="relative">
                  <Store className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#726e66]" />
                  <input
                    type="text"
                    value={restaurantName}
                    onChange={e => setRestaurantName(e.target.value)}
                    placeholder="Ej: Asador Bonavia & Banquets"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-[#18251e]/15 rounded-xl text-sm text-[#18251e] placeholder-[#18251e]/40 focus:outline-none focus:border-[#5a341e] shadow-sm"
                  />
                </div>
              </div>
            </>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-[#726e66]">
              Correo Electrónico *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#726e66]" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="chef@tudominio.com"
                className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-[#18251e]/15 rounded-xl text-sm text-[#18251e] placeholder-[#18251e]/40 focus:outline-none focus:border-[#5a341e] shadow-sm"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-[#726e66]">
              Contraseña *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#726e66]" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-[#18251e]/15 rounded-xl text-sm text-[#18251e] placeholder-[#18251e]/40 focus:outline-none focus:border-[#5a341e] shadow-sm"
              />
            </div>
            {mode === 'register' && (
              <span className="text-[10px] text-[#726e66]">Mínimo 6 caracteres.</span>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3 rounded-xl bg-[#5a341e] hover:bg-[#472917] text-white font-bold text-sm shadow-md shadow-[#5a341e]/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98 disabled:opacity-50"
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
        <div className="px-6 py-3.5 bg-[#ebe4d5]/60 border-t border-[#18251e]/10 text-center text-xs text-[#524d45]">
          {mode === 'login' ? (
            <span>
              ¿Aún no tienes cuenta?{' '}
              <button
                type="button"
                onClick={() => setMode('register')}
                className="text-[#5a341e] font-bold hover:underline cursor-pointer"
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
                className="text-[#5a341e] font-bold hover:underline cursor-pointer"
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
