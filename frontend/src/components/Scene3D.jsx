import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Points, PointMaterial } from '@react-three/drei'
import * as random from 'maath/random/dist/maath-random.esm'

function ParticleField(props) {
  const ref = useRef()
  const sphere = random.inSphere(new Float32Array(5000), { radius: 1.5 })

  useFrame((state, delta) => {
    ref.current.rotation.x -= delta / 10
    ref.current.rotation.y -= delta / 15
  })

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled={false} {...props}>
        <PointMaterial
          transparent
          color="#8b5cf6"
          size={0.003}
          sizeAttenuation={true}
          depthWrite={false}
        />
      </Points>
    </group>
  )
}

function FloatingGeometries() {
  const meshRef1 = useRef()
  const meshRef2 = useRef()
  const meshRef3 = useRef()

  useFrame((state, delta) => {
    meshRef1.current.rotation.x += delta * 0.15
    meshRef1.current.rotation.y += delta * 0.1
    meshRef2.current.rotation.x -= delta * 0.1
    meshRef2.current.rotation.z += delta * 0.12
    meshRef3.current.rotation.y += delta * 0.08
    meshRef3.current.rotation.z -= delta * 0.1
  })

  return (
    <>
      <mesh ref={meshRef1} position={[-2, 1, -3]} opacity={0.15}>
        <icosahedronGeometry args={[0.5, 0]} />
        <meshBasicMaterial color="#8b5cf6" wireframe transparent opacity={0.3} />
      </mesh>
      <mesh ref={meshRef2} position={[2, -1, -4]} opacity={0.15}>
        <octahedronGeometry args={[0.4, 0]} />
        <meshBasicMaterial color="#06b6d4" wireframe transparent opacity={0.3} />
      </mesh>
      <mesh ref={meshRef3} position={[0, 0.5, -5]}>
        <torusGeometry args={[0.3, 0.1, 16, 32]} />
        <meshBasicMaterial color="#10b981" wireframe transparent opacity={0.2} />
      </mesh>
    </>
  )
}

export default function Scene3D() {
  return (
    <div id="canvas-container">
      <Canvas camera={{ position: [0, 0, 1], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <ParticleField />
        <FloatingGeometries />
      </Canvas>
    </div>
  )
}
