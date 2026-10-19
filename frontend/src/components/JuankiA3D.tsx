import React, { useRef, useState, useEffect, useMemo, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

interface JuankiA3DProps {
  className?: string
  interactive?: boolean
  showBadge?: boolean
}

// Subcomponente que carga el modelo 3D y maneja la lógica de animación
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

  // Material de la Olla: Color oscuro casi negro (#1a1a1a) con rugosidad 0.8
  const potMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#1a1a1a',
        roughness: 0.8,
        metalness: 0.15,
      }),
    []
  )

  // Material del Gorro: Blanco puro
  const hatMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#ffffff',
        roughness: 0.85,
        metalness: 0.02,
      }),
    []
  )

  // Pestañeo orgánico
  const [isBlinking, setIsBlinking] = useState(false)
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true)
      setTimeout(() => setIsBlinking(false), 160)
    }, 4500)
    return () => clearInterval(blinkInterval)
  }, [])

  // Posición base de los ojos sobre la curvatura frontal de la cazuela
  const leftEyeBase = useMemo(() => new THREE.Vector3(-0.165, -0.30, 0.585), [])
  const rightEyeBase = useMemo(() => new THREE.Vector3(0.165, -0.30, 0.585), [])

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
      const targetRotY = state.pointer.x * 0.35 // Rotación lateral
      const targetRotX = -state.pointer.y * 0.2 // Rotación vertical
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

    // Traslación matemática de las pupilas dentro del globo ocular blanco
    const maxPupilOffset = 0.038
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
      {/* 1. Malla de la Olla con MeshStandardMaterial #1a1a1a roughness: 0.8 */}
      {nodes.olla && (
        <mesh
          geometry={nodes.olla.geometry}
          material={potMaterial}
          castShadow
          receiveShadow
        />
      )}

      {/* 2. Malla del Gorro con MeshStandardMaterial Blanco Puro */}
      {nodes.gorro && (
        <mesh
          geometry={nodes.gorro.geometry}
          material={hatMaterial}
          castShadow
          receiveShadow
        />
      )}

      {/* En caso de que se cargue un mesh único sin separar como fallback */}
      {!nodes.olla && nodes.mesh_node && (
        <mesh
          geometry={nodes.mesh_node.geometry}
          material={potMaterial}
          castShadow
          receiveShadow
        />
      )}

      {/* 3. Ojos y Pupilas añadidos por código */}
      <group ref={eyesGroupRef}>
        {/* Ojo Izquierdo: Fondo Blanco */}
        <mesh position={leftEyeBase.toArray()} castShadow>
          <sphereGeometry args={[0.088, 32, 32]} />
          <meshStandardMaterial
            color="#ffffff"
            roughness={0.15}
            metalness={0.05}
          />
        </mesh>

        {/* Pupila Izquierda: Negra con Brillo Especular */}
        <mesh
          ref={leftPupilRef}
          position={[leftEyeBase.x, leftEyeBase.y, leftEyeBase.z + 0.065]}
        >
          <sphereGeometry args={[0.045, 24, 24]} />
          <meshBasicMaterial color="#080504" />
          {/* Brillos oculares especulares */}
          <mesh position={[0.016, 0.016, 0.038]}>
            <sphereGeometry args={[0.014, 16, 16]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <mesh position={[-0.012, -0.014, 0.038]}>
            <sphereGeometry args={[0.007, 12, 12]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </mesh>

        {/* Ojo Derecho: Fondo Blanco */}
        <mesh position={rightEyeBase.toArray()} castShadow>
          <sphereGeometry args={[0.088, 32, 32]} />
          <meshStandardMaterial
            color="#ffffff"
            roughness={0.15}
            metalness={0.05}
          />
        </mesh>

        {/* Pupila Derecha: Negra con Brillo Especular */}
        <mesh
          ref={rightPupilRef}
          position={[rightEyeBase.x, rightEyeBase.y, rightEyeBase.z + 0.065]}
        >
          <sphereGeometry args={[0.045, 24, 24]} />
          <meshBasicMaterial color="#080504" />
          {/* Brillos oculares especulares */}
          <mesh position={[0.016, 0.016, 0.038]}>
            <sphereGeometry args={[0.014, 16, 16]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <mesh position={[-0.012, -0.014, 0.038]}>
            <sphereGeometry args={[0.007, 12, 12]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </mesh>
      </group>
    </group>
  )
}

// Pre-carga del modelo para respuesta instantánea
useGLTF.preload('/olla.glb')

// Componente Contenedor con Canvas de Three.js
export const JuankiA3D: React.FC<JuankiA3DProps> = ({
  className = '',
  interactive = true,
  showBadge = true,
}) => {
  return (
    <div
      className={`relative select-none overflow-hidden rounded-2xl bg-[#ebe5d8] shadow-2xl aspect-[4/3] flex items-center justify-center ${className}`}
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
          camera={{ position: [0, 0, 2.55], fov: 42 }}
          className="w-full h-full cursor-grab active:cursor-grabbing"
          style={{ pointerEvents: interactive ? 'auto' : 'none' }}
        >
          {/* Iluminación Culinaria Boutique */}
          <ambientLight intensity={1.4} color="#fffcf5" />
          <directionalLight
            position={[4, 5, 4]}
            intensity={2.2}
            color="#ffffff"
            castShadow
            shadow-mapSize={[1024, 1024]}
          />
          <directionalLight
            position={[-4, 3, -2]}
            intensity={0.9}
            color="#ffe8d6"
          />
          <pointLight
            position={[0, -0.2, 1.8]}
            intensity={0.6}
            color="#ffffff"
          />

          {/* El Modelo de JuankiA */}
          <JuankiAPotModel interactive={interactive} />
        </Canvas>
      </Suspense>

      {/* Textos de Figma: "TU COPILOTO" y "Siempre atento a tu cocina" */}
      {showBadge && (
        <div className="absolute bottom-4 left-5 right-5 flex items-center justify-between text-xs text-[#1c2826]/75 font-semibold tracking-wider pointer-events-none z-10">
          <span className="text-[10px] tracking-[0.2em] font-bold uppercase text-[#1c2826]/60">
            TU COPILOTO 3D
          </span>
          <span className="text-[11px] font-medium italic text-[#1c2826]/85">
            Siempre atento a tu cocina
          </span>
        </div>
      )}
    </div>
  )
}
