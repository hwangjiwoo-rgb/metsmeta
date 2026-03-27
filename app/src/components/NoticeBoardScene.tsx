import { OrbitControls, Text } from '@react-three/drei'

type Props = {
  onOpenBoard: () => void
}

export function NoticeBoardScene({ onOpenBoard }: Props) {
  return (
    <>
      <color attach="background" args={['#0a0a12']} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 8, 5]} intensity={1.2} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#1a1a24" />
      </mesh>
      <mesh
        position={[0, 0.6, 0.5]}
        castShadow
        onClick={(e) => {
          e.stopPropagation()
          onOpenBoard()
        }}
        onPointerOver={() => {
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto'
        }}
      >
        <boxGeometry args={[2.2, 1.4, 0.2]} />
        <meshStandardMaterial color="#6c5ce7" metalness={0.2} roughness={0.4} />
      </mesh>
      <Text
        position={[0, 0.6, 0.62]}
        fontSize={0.18}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        maxWidth={2}
      >
        Notice Board
      </Text>
      <Text
        position={[0, 0.35, 0.62]}
        fontSize={0.1}
        color="#e0e0ff"
        anchorX="center"
        anchorY="middle"
      >
        클릭하여 공지 열기
      </Text>
      <OrbitControls
        enablePan
        minPolarAngle={0.35}
        maxPolarAngle={Math.PI / 2 - 0.05}
        minDistance={3}
        maxDistance={12}
      />
    </>
  )
}
