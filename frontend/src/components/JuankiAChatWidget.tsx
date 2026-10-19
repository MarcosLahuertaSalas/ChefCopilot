import React, { useState, useRef, useEffect } from 'react'
import { JuankiAMascot } from './JuankiAMascot'
import { Sparkles, X, Send } from 'lucide-react'

interface Message {
  id: string
  sender: 'juankia' | 'chef'
  text: string
  time: string
}

export const JuankiAChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'juankia',
      text: '¡Oído cocina! Soy JuankiA, tu copiloto gastronómico. Puedo ayudarte a calcular mermas de solomillo, ajustar compras de banquetes o resolver dudas de escandallos. ¿Qué necesitas hoy, Chef?',
      time: 'Ahora',
    },
  ])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const quickPrompts = [
    '¿Cómo calculo el solomillo para 80 comensales?',
    '¿Qué hago con las mermas de carne?',
    '¿Por qué comprar por piezas enteras?',
  ]

  const handleSend = (textToSend?: string) => {
    const text = textToSend || input
    if (!text.trim()) return

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'chef',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages(prev => [...prev, userMsg])
    if (!textToSend) setInput('')

    // Respuesta inteligente de JuankiA con base en las reglas culinarias del proyecto
    setTimeout(() => {
      let reply = '¡Entendido Chef! Estoy procesando tu consulta con las fórmulas de escandallos de ChefCopilot.'

      const lower = text.toLowerCase()
      if (lower.includes('solomillo') || lower.includes('80')) {
        reply = 'Para 80 comensales calculando con el rendimiento pesimista del Chef (8 raciones garantizadas por pieza de solomillo), necesitarás pedir exactamente 10 piezas enteras. Si sacas 10 raciones por pieza, tendrás hasta 20 raciones de colchón de seguridad para imprevistos.'
      } else if (lower.includes('merma') || lower.includes('carne') || lower.includes('reutiliz')) {
        reply = 'En ChefCopilot diferenciamos el desperdicio neto (grasa inservible, tendones duros) de la merma técnica reutilizable. Por ejemplo, los recortes limpios de solomillo van a 0% desperdicio y se acumulan como subproducto para albóndigas o rellenos de empanadas.'
      } else if (lower.includes('pieza') || lower.includes('entera')) {
        reply = 'Comprar por piezas enteras evita sorpresas en el servicio: pedimos usando el rendimiento mínimo garantizado (cálculo pesimista). De esta forma el banquete nunca se queda corto de raciones y el excedente va a stock de cámara.'
      } else {
        reply = `¡Tomo nota de "${text}", Chef! Recuerda que puedes ver la lista de compra en tiempo real y las deducciones de stock de cámara en la pestaña de Banquetes.`
      }

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'juankia',
        text: reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages(prev => [...prev, botMsg])
    }, 600)
  }

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen])

  return (
    <div className="fixed bottom-6 right-6 z-40 select-none">
      {/* Botón Flotante Activo cuando el chat está cerrado */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#1c120c] border border-amber-500/40 shadow-2xl shadow-black/80 hover:border-amber-400 hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          {/* Mini Avatar JuankiA */}
          <div className="w-10 h-10 relative flex items-center justify-center">
            <img src="/juankia-logo.png" alt="JuankiA" className="w-full h-full object-contain filter drop-shadow-md" />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-[#100904] animate-pulse" />
          </div>

          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-extrabold text-[#ffedd7] tracking-wide font-heading">
                JuankiA
              </span>
              <span className="px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[9px] font-bold">
                IA
              </span>
            </div>
            <p className="text-[10px] text-[#a89988]">Asistente de Cocina</p>
          </div>

          <Sparkles className="w-4 h-4 text-amber-400 group-hover:rotate-12 transition-transform" />
        </button>
      )}

      {/* Ventana de Conversación con JuankiA */}
      {isOpen && (
        <div className="w-80 sm:w-96 h-[540px] bg-[#160e09] border border-[#2e2118] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Encabezado con JuankiA animado */}
          <div className="p-4 bg-[#0c0704] border-b border-[#2e2118] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl overflow-hidden border border-amber-500/40 shadow-lg">
                <JuankiAMascot interactive={true} showBadge={false} className="w-full h-full" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-extrabold font-heading text-[#ffedd7]">
                    JuankiA
                  </h4>
                  <span className="px-1.5 py-0.2 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-[9px] font-bold">
                    Online
                  </span>
                </div>
                <p className="text-[10px] text-[#a89988]">
                  Tu copiloto en la cocina
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="text-[#a89988] hover:text-[#ffedd7] p-1.5 rounded-lg hover:bg-[#2e2118]/60 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Mensajes */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 scrollbar-thin scrollbar-thumb-[#2e2118]">
            {messages.map(m => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === 'chef' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                    m.sender === 'chef'
                      ? 'bg-gradient-to-r from-[#dc5000] to-amber-600 text-slate-950 font-medium rounded-tr-none shadow-md shadow-amber-900/20'
                      : 'bg-[#1f150f] border border-[#2e2118] text-[#ffedd7] rounded-tl-none shadow-sm'
                  }`}
                >
                  {m.text}
                </div>
                <span className="text-[9px] text-[#a89988]/70 mt-1 px-1">
                  {m.time}
                </span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Sugerencias Rápidas */}
          <div className="px-3 py-2 border-t border-[#2e2118] bg-[#120a06]/80 flex gap-1.5 overflow-x-auto no-scrollbar">
            {quickPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSend(prompt)}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-[#1c120c] hover:bg-[#2e2118] border border-[#2e2118] text-[10px] text-amber-300/90 font-medium cursor-pointer transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input de Envío */}
          <div className="p-3 bg-[#0c0704] border-t border-[#2e2118] flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Pregúntale a JuankiA..."
              className="flex-1 bg-[#160e09] border border-[#2e2118] rounded-xl px-3 py-2 text-xs text-[#ffedd7] placeholder-[#a89988]/50 focus:outline-none focus:border-amber-500"
            />
            <button
              onClick={() => handleSend()}
              className="p-2 rounded-xl bg-[#dc5000] hover:bg-amber-600 text-slate-950 cursor-pointer transition-all active:scale-95"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
