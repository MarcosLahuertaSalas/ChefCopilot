import React, { useRef, useState, useEffect, useMemo, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'
import { Sparkles, MessageCircle, ArrowDown, X, RefreshCw } from 'lucide-react'

interface JuankiA3DProps {
  className?: string
  interactive?: boolean
  showBadge?: boolean
  onScrollDown?: () => void
}

const JUANKIA_DIALOGUES = [
  '¡Hola Chef! 👨‍🍳🔥 Soy JuankiA. ¿Listo para cuadrar escandallos y no perder ni un gramo de merma?',
  '¡Oído cocina! Haz scroll hacia abajo para descubrir cómo organizamos tus compras para banquetes 👇',
  '¿Sabías que los recortes de solomillo se calculan para albóndigas automáticamente? 🥩',
  'Comprar por piezas enteras evita sorpresas en el pase: calculamos siempre con el rendimiento pesimista del chef 👌',
  '¡Haz clic en mí cuando quieras saludarme o ver más consejos de cocina!',
]

// Subcomponente 3D que carga el modelo y maneja animación, salto y seguimiento del ratón
function JuankiAPotModel({
  interactive = true,
  jumpTrigger = 0,
  onPotClick,
}: {
  interactive?: boolean
  jumpTrigger?: number
  onPotClick?: () => void
}) {
  const groupRef = useRef<THREE.Group>(null)
  const leftPupilRef = useRef<THREE.Mesh>(null)
  const rightPupilRef = useRef<THREE.Mesh>(null)

  // Físicas de salto / bote elástico
  const jumpY = useRef(0)
  const jumpVelocity = useRef(0)
  const prevTrigger = useRef(jumpTrigger)

  // Disparar salto cuando jumpTrigger cambia
  useEffect(() => {
    if (jumpTrigger !== prevTrigger.current) {
      prevTrigger.current = jumpTrigger
      jumpVelocity.current = 3.6
    }
  }, [jumpTrigger])

  // Carga del modelo GLB dividido limpiamente en 'olla' y 'gorro'
  const { nodes } = useGLTF('/olla.glb') as unknown as {
    nodes: {
      olla?: THREE.Mesh
      gorro?: THREE.Mesh
      mesh_node?: THREE.Mesh
    }
  }

  // Generador de textura táctil procedimental de micro-relieve (barro cocido / hierro fundido)
  const bumpTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 256
    const ctx = canvas.getContext('2d')
    if (ctx) {
      const imgData = ctx.createImageData(256, 256)
      for (let i = 0; i < imgData.data.length; i += 4) {
        const noise = 110 + Math.floor(Math.random() * 45)
        imgData.data[i] = noise
        imgData.data[i + 1] = noise
        imgData.data[i + 2] = noise
        imgData.data[i + 3] = 255
      }
      ctx.putImageData(imgData, 0, 0)
    }
    const tex = new THREE.CanvasTexture(canvas)
    tex.wrapS = THREE.RepeatWrapping
    tex.wrapT = THREE.RepeatWrapping
    tex.repeat.set(8, 8)
    return tex
  }, [])

  // Material de la Olla: Tono carbón/barro cálido (#2b2623) con micro-relieve y rugosidad artesanal
  const potMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#2b2623',
        roughness: 0.68,
        metalness: 0.08,
        bumpMap: bumpTexture,
        bumpScale: 0.012,
      }),
    [bumpTexture]
  )

  // Material del Gorro: Masa/algodón marfil cálido (#ede3d1) idéntico al logo original
  const hatMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#ede3d1',
        roughness: 0.88,
        metalness: 0.02,
      }),
    []
  )

  // Seguimiento global del ratón por toda la pantalla
  const globalMouseRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    if (!interactive) return

    const handleMouseMove = (e: MouseEvent) => {
      const canvasEl = document.querySelector('canvas')
      if (canvasEl) {
        const rect = canvasEl.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2
        const spanX = Math.max(window.innerWidth * 0.45, 320)
        const spanY = Math.max(window.innerHeight * 0.45, 320)
        const dx = (e.clientX - centerX) / spanX
        const dy = -(e.clientY - centerY) / spanY
        globalMouseRef.current = {
          x: Math.max(-1.3, Math.min(1.3, dx)),
          y: Math.max(-1.3, Math.min(1.3, dy)),
        }
      } else {
        const x = (e.clientX / window.innerWidth) * 2 - 1
        const y = -(e.clientY / window.innerHeight) * 2 + 1
        globalMouseRef.current = { x, y }
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [interactive])

  // Posición base de los ojos sobre la curvatura frontal de la cazuela
  const leftEyeBase = useMemo(() => new THREE.Vector3(-0.175, -0.30, 0.575), [])
  const rightEyeBase = useMemo(() => new THREE.Vector3(0.175, -0.30, 0.575), [])

  // Animación en cada frame
  useFrame((_state, delta) => {
    // Física del salto
    if (jumpVelocity.current > 0 || jumpY.current > 0) {
      jumpVelocity.current -= delta * 14
      jumpY.current += jumpVelocity.current * delta
      if (jumpY.current <= 0) {
        jumpY.current = 0
        jumpVelocity.current = 0
      }
    }

    if (!interactive) return

    const mouse = globalMouseRef.current

    // Inclinación y posición con salto
    if (groupRef.current) {
      groupRef.current.position.y = 0.05 + jumpY.current
      const targetRotY = mouse.x * 0.38
      const targetRotX = -mouse.y * 0.22
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        targetRotY,
        delta * 6
      )
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        targetRotX,
        delta * 6
      )
    }

    // Traslación matemática de las pupilas
    const maxPupilOffset = 0.034
    const pupilTargetX = mouse.x * maxPupilOffset
    const pupilTargetY = mouse.y * maxPupilOffset

    if (leftPupilRef.current) {
      leftPupilRef.current.position.x = THREE.MathUtils.lerp(
        leftPupilRef.current.position.x,
        leftEyeBase.x + pupilTargetX,
        delta * 14
      )
      leftPupilRef.current.position.y = THREE.MathUtils.lerp(
        leftPupilRef.current.position.y,
        leftEyeBase.y + pupilTargetY,
        delta * 14
      )
    }

    if (rightPupilRef.current) {
      rightPupilRef.current.position.x = THREE.MathUtils.lerp(
        rightPupilRef.current.position.x,
        rightEyeBase.x + pupilTargetX,
        delta * 14
      )
      rightPupilRef.current.position.y = THREE.MathUtils.lerp(
        rightPupilRef.current.position.y,
        rightEyeBase.y + pupilTargetY,
        delta * 14
      )
    }
  })

  return (
    <group
      ref={groupRef}
      position={[0, 0.05, 0]}
      onClick={e => {
        e.stopPropagation()
        jumpVelocity.current = 3.6
        onPotClick?.()
      }}
    >
      {/* 1. Malla de la Olla */}
      {nodes.olla && (
        <mesh
          geometry={nodes.olla.geometry}
          material={potMaterial}
          castShadow
          receiveShadow
        />
      )}

      {/* 2. Malla del Gorro */}
      {nodes.gorro && (
        <mesh
          geometry={nodes.gorro.geometry}
          material={hatMaterial}
          castShadow
          receiveShadow
        />
      )}

      {!nodes.olla && nodes.mesh_node && (
        <mesh
          geometry={nodes.mesh_node.geometry}
          material={potMaterial}
          castShadow
          receiveShadow
        />
      )}

      {/* 3. Ojos grandes estilo JuankiA original */}
      <group>
        {/* Ojo Izquierdo: Cuenca crema sutil */}
        <mesh position={leftEyeBase.toArray()} castShadow>
          <sphereGeometry args={[0.116, 32, 32]} />
          <meshStandardMaterial
            color="#faf4ea"
            roughness={0.25}
            metalness={0.02}
          />
        </mesh>

        {/* Pupila Izquierda: Gran pupila negra brillante con destellos */}
        <mesh
          ref={leftPupilRef}
          position={[leftEyeBase.x, leftEyeBase.y, leftEyeBase.z + 0.046]}
        >
          <sphereGeometry args={[0.104, 32, 32]} />
          <meshStandardMaterial
            color="#0c0908"
            roughness={0.05}
            metalness={0.1}
          />
          <mesh position={[0.030, 0.032, 0.092]}>
            <sphereGeometry args={[0.030, 16, 16]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <mesh position={[-0.022, -0.025, 0.092]}>
            <sphereGeometry args={[0.015, 14, 14]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </mesh>

        {/* Ojo Derecho: Cuenca crema sutil */}
        <mesh position={rightEyeBase.toArray()} castShadow>
          <sphereGeometry args={[0.116, 32, 32]} />
          <meshStandardMaterial
            color="#faf4ea"
            roughness={0.25}
            metalness={0.02}
          />
        </mesh>

        {/* Pupila Derecha: Gran pupila negra brillante con destellos */}
        <mesh
          ref={rightPupilRef}
          position={[rightEyeBase.x, rightEyeBase.y, rightEyeBase.z + 0.046]}
        >
          <sphereGeometry args={[0.104, 32, 32]} />
          <meshStandardMaterial
            color="#0c0908"
            roughness={0.05}
            metalness={0.1}
          />
          <mesh position={[0.030, 0.032, 0.092]}>
            <sphereGeometry args={[0.030, 16, 16]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <mesh position={[-0.022, -0.025, 0.092]}>
            <sphereGeometry args={[0.015, 14, 14]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </mesh>
      </group>
    </group>
  )
}

useGLTF.preload('/olla.glb')

// Componente Principal con Canvas de Three.js y Bocadillo de Diálogo Interactivo
export const JuankiA3D: React.FC<JuankiA3DProps> = ({
  className = '',
  interactive = true,
  showBadge = true,
  onScrollDown,
}) => {
  const [bubbleOpen, setBubbleOpen] = useState(false)
  const [dialogueIdx, setDialogueIdx] = useState(0)
  const [jumpCount, setJumpCount] = useState(0)

  // Abrir el bocadillo automáticamente a los 1.2 segundos con el saludo inicial
  useEffect(() => {
    const timer = setTimeout(() => {
      setBubbleOpen(true)
    }, 1200)
    return () => clearTimeout(timer)
  }, [])

  const handleNextDialogue = () => {
    setDialogueIdx(prev => (prev + 1) % JUANKIA_DIALOGUES.length)
    setJumpCount(c => c + 1)
  }

  const handlePotClicked = () => {
    setBubbleOpen(true)
    handleNextDialogue()
  }

  return (
    <div
      className={`relative select-none w-full h-[470px] flex flex-col items-center justify-center ${className}`}
    >
      {/* Bocadillo de Diálogo Interactivo "¡Hola Chef!" */}
      {bubbleOpen && (
        <div className="absolute -top-4 sm:-top-8 left-1/2 -translate-x-1/2 sm:left-4 sm:translate-x-0 z-30 w-72 sm:w-80 bg-[#fffcf7] border border-[#18251e]/20 rounded-2xl p-4 shadow-2xl shadow-[#18251e]/15 animate-in fade-in zoom-in-95 duration-200">
          {/* Cabecera del Bocadillo */}
          <div className="flex items-center justify-between pb-2 border-b border-[#18251e]/10">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-extrabold font-heading text-[#18251e] tracking-tight flex items-center gap-1">
                JuankiA
                <Sparkles className="w-3 h-3 text-amber-600 fill-amber-500" />
              </span>
            </div>
            <button
              onClick={() => setBubbleOpen(false)}
              className="text-[#18251e]/40 hover:text-[#18251e] p-1 rounded-md transition-colors cursor-pointer"
              title="Cerrar mensaje"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Contenido del Diálogo */}
          <p className="text-xs text-[#2b2623] font-medium leading-relaxed mt-2.5">
            {JUANKIA_DIALOGUES[dialogueIdx]}
          </p>

          {/* Botones de acción del Bocadillo */}
          <div className="mt-3.5 flex items-center justify-between gap-2 pt-2 border-t border-[#18251e]/8">
            <button
              onClick={handleNextDialogue}
              className="px-2.5 py-1.5 rounded-lg bg-[#18251e]/5 hover:bg-[#18251e]/10 text-[10px] font-bold text-[#18251e] flex items-center gap-1 transition-colors cursor-pointer"
              title="Siguiente consejo"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Siguiente</span>
            </button>

            {onScrollDown && (
              <button
                onClick={onScrollDown}
                className="px-3 py-1.5 rounded-lg bg-[#5a341e] hover:bg-[#472917] text-white text-[10px] font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
              >
                <span>Descubrir Más</span>
                <ArrowDown className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Colita triangular del bocadillo apuntando hacia la cazuela */}
          <div className="absolute -bottom-2 left-12 w-4 h-4 bg-[#fffcf7] border-b border-r border-[#18251e]/20 rotate-45" />
        </div>
      )}

      {/* Botón flotante para reabrir el saludo si se cierra */}
      {!bubbleOpen && (
        <button
          onClick={() => {
            setBubbleOpen(true)
            setJumpCount(c => c + 1)
          }}
          className="absolute top-2 right-4 z-30 px-3 py-1.5 rounded-full bg-[#fffcf7] hover:bg-white text-[#18251e] border border-[#18251e]/15 shadow-md text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105 active:scale-95"
        >
          <MessageCircle className="w-3.5 h-3.5 text-amber-600" />
          <span>¡Hola Chef!</span>
        </button>
      )}

      {/* Canvas 3D de Three.js */}
      <Suspense
        fallback={
          <div className="flex items-center justify-center w-full h-full text-xs text-[#18251e]/60 font-mono">
            Calentando fogones 3D...
          </div>
        }
      >
        <Canvas
          shadows
          gl={{ alpha: true, antialias: true }}
          camera={{ position: [0, 0, 2.5], fov: 42 }}
          className="w-full h-full cursor-pointer"
          style={{ pointerEvents: interactive ? 'auto' : 'none' }}
        >
          {/* Iluminación Culinaria Fiel al Logo Original */}
          <ambientLight intensity={1.3} color="#fff6ed" />
          <pointLight
            position={[-2.2, -0.3, 1.3]}
            intensity={4.8}
            color="#ff8c1a"
            distance={5}
          />
          <directionalLight
            position={[-3, 0.5, 2]}
            intensity={2.2}
            color="#ff9922"
          />
          <directionalLight
            position={[3.5, 4.5, 3]}
            intensity={2.4}
            color="#fff8f0"
            castShadow
            shadow-mapSize={[1024, 1024]}
          />
          <directionalLight
            position={[0, 2, -3]}
            intensity={0.6}
            color="#ffd6ba"
          />

          <ContactShadows
            position={[0, -0.76, 0]}
            opacity={0.38}
            scale={3.6}
            blur={2.4}
            far={3}
            color="#3a2215"
          />

          <JuankiAPotModel
            interactive={interactive}
            jumpTrigger={jumpCount}
            onPotClick={handlePotClicked}
          />
        </Canvas>
      </Suspense>

      {/* Leyenda limpia sin recuadro */}
      {showBadge && (
        <div className="w-full flex items-center justify-between px-2 pt-1 text-xs text-[#1c2826]/75 font-semibold tracking-wider pointer-events-none">
          <span className="text-[10px] tracking-[0.2em] font-bold uppercase text-[#1c2826]/50">
            Haz clic en JuankiA
          </span>
          <span className="text-[11px] font-medium italic text-[#1c2826]/80">
            Siempre atento a tu cocina
          </span>
        </div>
      )}
    </div>
  )
}
