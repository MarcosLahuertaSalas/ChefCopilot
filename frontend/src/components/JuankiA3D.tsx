import React, { useRef, useState, useEffect, useMemo, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'

interface JuankiA3DProps {
  className?: string
  interactive?: boolean
  showBadge?: boolean
}

// Subcomponente que carga el modelo 3D y maneja la lógica de animación y materiales PBR
function JuankiAPotModel({ interactive = true }: { interactive?: boolean }) {
  const groupRef = useRef<THREE.Group>(null)
  const leftPupilRef = useRef<THREE.Mesh>(null)
  const rightPupilRef = useRef<THREE.Mesh>(null)
  const eyesGroupRef = useRef<THREE.Group>(null)

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
        // Ruido orgánico sutil para simular la porosidad de la cazuela de barro
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

  // Material de la Olla: Tono carbón/barro cálido (#2c2724) con textura y rugosidad artesanal
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

  // Pestañeo orgánico cada 4.5 segundos
  const [isBlinking, setIsBlinking] = useState(false)
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true)
      setTimeout(() => setIsBlinking(false), 160)
    }, 4500)
    return () => clearInterval(blinkInterval)
  }, [])

  // Posición base de los ojos sobre la curvatura frontal de la cazuela (proporciones grandes estilo anime)
  const leftEyeBase = useMemo(() => new THREE.Vector3(-0.175, -0.30, 0.575), [])
  const rightEyeBase = useMemo(() => new THREE.Vector3(0.175, -0.30, 0.575), [])

  // Animación en cada frame: seguimiento suave del ratón
  useFrame((state, delta) => {
    // Pestañeo animado
    if (eyesGroupRef.current) {
      const targetScaleY = isBlinking ? 0.08 : 1.0
      eyesGroupRef.current.scale.y = THREE.MathUtils.lerp(
        eyesGroupRef.current.scale.y,
        targetScaleY,
        delta * 30
      )
    }

    if (!interactive) return

    // Inclinación suave del cuerpo (Parallax 3D) hacia el puntero
    if (groupRef.current) {
      const targetRotY = state.pointer.x * 0.32
      const targetRotX = -state.pointer.y * 0.18
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        targetRotY,
        delta * 5
      )
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        targetRotX,
        delta * 5
      )
    }

    // Traslación matemática de las pupilas dentro del globo ocular agrandado
    const maxPupilOffset = 0.032
    const pupilTargetX = state.pointer.x * maxPupilOffset
    const pupilTargetY = state.pointer.y * maxPupilOffset

    if (leftPupilRef.current) {
      leftPupilRef.current.position.x = THREE.MathUtils.lerp(
        leftPupilRef.current.position.x,
        leftEyeBase.x + pupilTargetX,
        delta * 12
      )
      leftPupilRef.current.position.y = THREE.MathUtils.lerp(
        leftPupilRef.current.position.y,
        leftEyeBase.y + pupilTargetY,
        delta * 12
      )
    }

    if (rightPupilRef.current) {
      rightPupilRef.current.position.x = THREE.MathUtils.lerp(
        rightPupilRef.current.position.x,
        rightEyeBase.x + pupilTargetX,
        delta * 12
      )
      rightPupilRef.current.position.y = THREE.MathUtils.lerp(
        rightPupilRef.current.position.y,
        rightEyeBase.y + pupilTargetY,
        delta * 12
      )
    }
  })

  return (
    <group ref={groupRef} position={[0, 0.05, 0]}>
      {/* 1. Malla de la Olla con textura de barro y color cálido */}
      {nodes.olla && (
        <mesh
          geometry={nodes.olla.geometry}
          material={potMaterial}
          castShadow
          receiveShadow
        />
      )}

      {/* 2. Malla del Gorro con tono marfil cálido */}
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

      {/* 3. Ojos grandes estilo JuankiA original: cuenca crema + gran pupila negra brillante con 2 destellos */}
      <group ref={eyesGroupRef}>
        {/* Ojo Izquierdo: Fondo/borde crema sutil ampliado */}
        <mesh position={leftEyeBase.toArray()} castShadow>
          <sphereGeometry args={[0.116, 32, 32]} />
          <meshStandardMaterial
            color="#faf4ea"
            roughness={0.25}
            metalness={0.02}
          />
        </mesh>

        {/* Pupila Izquierda: Gran pupila negra brillante dominante con destellos ampliados */}
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
          {/* Brillo especular grande (arriba izquierda) */}
          <mesh position={[0.030, 0.032, 0.092]}>
            <sphereGeometry args={[0.030, 16, 16]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          {/* Brillo especular pequeño (abajo derecha) */}
          <mesh position={[-0.022, -0.025, 0.092]}>
            <sphereGeometry args={[0.015, 14, 14]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </mesh>

        {/* Ojo Derecho: Fondo/borde crema sutil ampliado */}
        <mesh position={rightEyeBase.toArray()} castShadow>
          <sphereGeometry args={[0.116, 32, 32]} />
          <meshStandardMaterial
            color="#faf4ea"
            roughness={0.25}
            metalness={0.02}
          />
        </mesh>

        {/* Pupila Derecha: Gran pupila negra brillante dominante con destellos ampliados */}
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
          {/* Brillo especular grande (arriba izquierda) */}
          <mesh position={[0.030, 0.032, 0.092]}>
            <sphereGeometry args={[0.030, 16, 16]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          {/* Brillo especular pequeño (abajo derecha) */}
          <mesh position={[-0.022, -0.025, 0.092]}>
            <sphereGeometry args={[0.015, 14, 14]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </mesh>
      </group>
    </group>
  )
}

// Pre-carga del modelo para respuesta instantánea
useGLTF.preload('/olla.glb')

// Componente Contenedor con Canvas de Three.js (Sin recuadro, fondo transparente, sombra suave)
export const JuankiA3D: React.FC<JuankiA3DProps> = ({
  className = '',
  interactive = true,
  showBadge = true,
}) => {
  return (
    <div
      className={`relative select-none w-full h-[450px] flex flex-col items-center justify-center ${className}`}
    >
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
          className="w-full h-full cursor-grab active:cursor-grabbing"
          style={{ pointerEvents: interactive ? 'auto' : 'none' }}
        >
          {/* Iluminación Culinaria Fiel al Logo Original */}
          {/* 1. Luz ambiente cálida y suave */}
          <ambientLight intensity={1.3} color="#fff6ed" />

          {/* 2. Luz de fuego/brasa culinaria (Ember glow) en el lateral izquierdo */}
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

          {/* 3. Luz principal superior derecha */}
          <directionalLight
            position={[3.5, 4.5, 3]}
            intensity={2.4}
            color="#fff8f0"
            castShadow
            shadow-mapSize={[1024, 1024]}
          />

          {/* 4. Luz de relleno suave trasera */}
          <directionalLight
            position={[0, 2, -3]}
            intensity={0.6}
            color="#ffd6ba"
          />

          {/* Sombra de contacto suave sobre el fondo de la página */}
          <ContactShadows
            position={[0, -0.76, 0]}
            opacity={0.38}
            scale={3.6}
            blur={2.4}
            far={3}
            color="#3a2215"
          />

          {/* El Modelo de JuankiA */}
          <JuankiAPotModel interactive={interactive} />
        </Canvas>
      </Suspense>

      {/* Leyenda limpia sin recuadro */}
      {showBadge && (
        <div className="w-full flex items-center justify-between px-2 pt-2 text-xs text-[#1c2826]/75 font-semibold tracking-wider pointer-events-none">
          <span className="text-[10px] tracking-[0.2em] font-bold uppercase text-[#1c2826]/50">
            TU COPILOTO 3D
          </span>
          <span className="text-[11px] font-medium italic text-[#1c2826]/80">
            Siempre atento a tu cocina
          </span>
        </div>
      )}
    </div>
  )
}
