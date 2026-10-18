import React, { useState, useEffect, useRef } from 'react'

interface JuankiAMascotProps {
  className?: string
  interactive?: boolean
  showBadge?: boolean
}

export const JuankiAMascot: React.FC<JuankiAMascotProps> = ({
  className = '',
  interactive = true,
  showBadge = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [pupilOffset, setPupilOffset] = useState({ x: 0, y: 0 })
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 })
  const [isBlinking, setIsBlinking] = useState(false)

  // Seguimiento del ratón (Eye Tracking 2.5D + Parallax Tilt)
  useEffect(() => {
    if (!interactive) return

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const mascotCenterX = rect.left + rect.width / 2
      const mascotCenterY = rect.top + rect.height * 0.65 // Altura aproximada de los ojos

      const deltaX = e.clientX - mascotCenterX
      const deltaY = e.clientY - mascotCenterY
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

      // Máximo desplazamiento de la pupila en píxeles dentro del ojo
      const maxDistance = 7
      const angle = Math.atan2(deltaY, deltaX)
      const clampedDistance = Math.min(distance / 25, maxDistance)

      const pupilX = Math.cos(angle) * clampedDistance
      const pupilY = Math.sin(angle) * clampedDistance

      setPupilOffset({ x: pupilX, y: pupilY })

      // Sutil inclinación 3D del cuerpo (Perspective Parallax Tilt)
      const maxTilt = 4
      const tiltX = Math.max(-maxTilt, Math.min(maxTilt, -(deltaY / rect.height) * maxTilt))
      const tiltY = Math.max(-maxTilt, Math.min(maxTilt, (deltaX / rect.width) * maxTilt))
      setTilt({ rotateX: tiltX, rotateY: tiltY })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [interactive])

  // Pestañeo orgánico cada 4 a 6 segundos
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true)
      setTimeout(() => setIsBlinking(false), 160)
    }, 4500)

    return () => clearInterval(blinkInterval)
  }, [])

  return (
    <div
      ref={containerRef}
      className={`relative select-none overflow-hidden rounded-2xl bg-[#ebe5d8] shadow-2xl transition-transform duration-100 ease-out ${className}`}
      style={{
        perspective: '1000px',
        transform: `perspective(1000px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
      }}
    >
      {/* Imagen base de JuankiA */}
      <img
        src="/juankia.jpg"
        alt="JuankiA - Mascota IA de ChefCopilot"
        className="w-full h-auto block object-cover"
        draggable={false}
      />

      {/* Ojo Izquierdo interactivo superpuesto */}
      <div
        className="absolute pointer-events-none rounded-full flex items-center justify-center transition-transform duration-75"
        style={{
          left: '42.6%',
          top: '61.2%',
          width: '5.2%',
          height: '10.5%',
          transform: isBlinking ? 'scaleY(0.08)' : 'scaleY(1)',
          transition: isBlinking ? 'transform 0.08s ease-in' : 'transform 0.15s ease-out',
        }}
      >
        <div
          className="w-full h-full rounded-full bg-[#0d0907] relative shadow-inner"
          style={{
            transform: `translate(${pupilOffset.x}px, ${pupilOffset.y}px)`,
          }}
        >
          {/* Brillos especulares de la pupila */}
          <span className="absolute top-[18%] left-[22%] w-[38%] h-[38%] rounded-full bg-white shadow-sm" />
          <span className="absolute bottom-[20%] right-[22%] w-[18%] h-[18%] rounded-full bg-white/90" />
        </div>
      </div>

      {/* Ojo Derecho interactivo superpuesto */}
      <div
        className="absolute pointer-events-none rounded-full flex items-center justify-center transition-transform duration-75"
        style={{
          left: '52.1%',
          top: '61.2%',
          width: '5.2%',
          height: '10.5%',
          transform: isBlinking ? 'scaleY(0.08)' : 'scaleY(1)',
          transition: isBlinking ? 'transform 0.08s ease-in' : 'transform 0.15s ease-out',
        }}
      >
        <div
          className="w-full h-full rounded-full bg-[#0d0907] relative shadow-inner"
          style={{
            transform: `translate(${pupilOffset.x}px, ${pupilOffset.y}px)`,
          }}
        >
          {/* Brillos especulares de la pupila */}
          <span className="absolute top-[18%] left-[22%] w-[38%] h-[38%] rounded-full bg-white shadow-sm" />
          <span className="absolute bottom-[20%] right-[22%] w-[18%] h-[18%] rounded-full bg-white/90" />
        </div>
      </div>

      {/* Textos de la tarjeta de Figma: "TU COPILOTO" y "Siempre atento a tu cocina" */}
      {showBadge && (
        <div className="absolute bottom-4 left-5 right-5 flex items-center justify-between text-xs text-[#1c2826]/75 font-semibold tracking-wider pointer-events-none">
          <span className="text-[10px] tracking-[0.2em] font-bold uppercase text-[#1c2826]/60">
            TU COPILOTO
          </span>
          <span className="text-[11px] font-medium italic text-[#1c2826]/85">
            Siempre atento a tu cocina
          </span>
        </div>
      )}
    </div>
  )
}
