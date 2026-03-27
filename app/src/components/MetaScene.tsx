import { Canvas } from '@react-three/fiber'
import { NoticeBoardScene } from './NoticeBoardScene'

type Props = {
  onOpenBoard: () => void
}

export function MetaScene({ onOpenBoard }: Props) {
  return (
    <div className="meta-canvas-wrap">
      <Canvas
        camera={{ position: [4, 3, 5], fov: 50 }}
        shadows
        dpr={[1, 2]}
        gl={{ antialias: true }}
      >
        <NoticeBoardScene onOpenBoard={onOpenBoard} />
      </Canvas>
    </div>
  )
}
