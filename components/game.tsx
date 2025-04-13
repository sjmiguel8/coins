"use client"

import { Suspense } from "react"
import { Canvas } from "@react-three/fiber"
import { Stats, KeyboardControls } from "@react-three/drei"
import { Physics } from "@react-three/rapier"
import ForestScene from "./scenes/forest-scene"
import HomeScene from "./scenes/home-scene"
import StoreScene from "./scenes/store-scene"
import HUD from "./hud"
import DeathScreen from "./death-screen"
import { useGameContext } from "./game-context"
import { useHealthSystem } from "./HealthSystem"
import { useCoinSystem } from "./CoinSystem"
import { extend } from "@react-three/fiber"
import { OrbitControls, TransformControls } from "three-stdlib"
import CanvasHUD from './CanvasHUD'

// This is important to make R3F aware of these components
extend({ OrbitControls, TransformControls })

export default function Game() {
  // Regular UI components (outside Canvas)
  const { isDead } = useGameContext();

  return (
    <div className="relative w-full h-screen">
      {/* Regular React UI elements (outside Canvas) */}
      <HUD />
      {isDead && <DeathScreen countdown={0} />}
      
      {/* 3D Canvas */}
      <Canvas shadows camera={{ position: [0, 5, 12], fov: 50 }}>
        <Suspense fallback={null}>
          <Physics>
            {/* Your 3D scene content */}
            {/* Canvas-specific HUD elements */}
            <CanvasHUD />
          </Physics>
        </Suspense>
      </Canvas>
    </div>
  )
}
