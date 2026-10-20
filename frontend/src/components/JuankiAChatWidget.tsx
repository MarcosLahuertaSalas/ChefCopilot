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
          className="group relative flex items-center gap-3 px-4 py-3 rounded-2xl bg-white border border-[#18251e]/15 shadow-xl shadow-[#18251e]/10 hover:border-[#5a341e]/50 hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          {/* Mini Avatar JuankiA */}
          <div className="w-10 h-10 relative flex items-center justify-center">
            <img src="/juankia-logo.png" alt="JuankiA" className="w-full h-full object-contain filter drop-shadow-sm" />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white animate-pulse" />
          </div>

          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-extrabold text-[#18251e] tracking-wide font-heading">
                JuankiA
              </span>
              <span className="px-1.5 py-0.5 rounded-full bg-[#5a341e]/10 text-[#5a341e] text-[9px] font-bold">
                IA
              </span>
            </div>
            <p className="text-[10px] text-[#726e66]">Asistente de Cocina</p>
          </div>

          <Sparkles className="w-4 h-4 text-[#5a341e] group-hover:rotate-12 transition-transform" />
        </button>
      )}

      {/* Ventana de Conversación con JuankiA */}
      {isOpen && (
        <div className="w-80 sm:w-96 h-[540px] bg-[#fdfbf7] border border-[#18251e]/15 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Encabezado con JuankiA animado */}
          <div className="p-4 bg-[#ebe4d5]/70 border-b border-[#18251e]/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl overflow-hidden border border-[#5a341e]/30 shadow-md bg-white">
                <JuankiAMascot interactive={true} showBadge={false} className="w-full h-full" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-extrabold font-heading text-[#18251e]">
                    JuankiA
                  </h4>
                  <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-[9px] font-bold">
                    Online
                  </span>
                </div>
                <p className="text-[10px] text-[#726e66]">
                  Tu copiloto en la cocina
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="text-[#726e66] hover:text-[#18251e] p-1.5 rounded-lg hover:bg-[#18251e]/5 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Mensajes */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-[#fdfbf7]">
            {messages.map(m => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === 'chef' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                    m.sender === 'chef'
                      ? 'bg-[#5a341e] text-white font-medium rounded-tr-none shadow-sm'
                      : 'bg-white border border-[#18251e]/10 text-[#18251e] rounded-tl-none shadow-sm'
                  }`}
                >
                  {m.text}
                </div>
                <span className="text-[9px] text-[#726e66] mt-1 px-1">
                  {m.time}
                </span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Sugerencias Rápidas */}
          <div className="px-3 py-2 border-t border-[#18251e]/10 bg-[#ebe4d5]/50 flex gap-1.5 overflow-x-auto no-scrollbar">
            {quickPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSend(prompt)}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white hover:bg-[#ebe4d5] border border-[#18251e]/12 text-[10px] text-[#5a341e] font-bold cursor-pointer transition-colors shadow-sm"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input de Envío */}
          <div className="p-3 bg-[#ebe4d5]/70 border-t border-[#18251e]/10 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Pregúntale a JuankiA..."
              className="flex-1 bg-white border border-[#18251e]/15 rounded-xl px-3 py-2 text-xs text-[#18251e] placeholder-[#18251e]/40 focus:outline-none focus:border-[#5a341e] shadow-sm"
            />
            <button
              onClick={() => handleSend()}
              className="p-2 rounded-xl bg-[#5a341e] hover:bg-[#472917] text-white cursor-pointer transition-all active:scale-95 shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
