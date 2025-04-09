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

export default function Game() {
  const { currentScene, isDead, respawnCountdown } = useGameContext()

  return (
    <>
      <KeyboardControls
        map={[
          { name: "forward", keys: ["ArrowUp", "w", "W"] },
          { name: "backward", keys: ["ArrowDown", "s", "S"] },
          { name: "left", keys: ["ArrowLeft", "a", "A"] },
          { name: "right", keys: ["ArrowRight", "d", "D"] },
          { name: "jump", keys: ["Space"] },
          { name: "attack", keys: ["e", "E"] },
          { name: "scene1", keys: ["1"] },
          { name: "scene2", keys: ["2"] },
          { name: "scene3", keys: ["3"] },
        ]}
      >
        <Canvas shadows camera={{ position: [0, 5, 10], fov: 50 }}>
          <Stats />
          <ambientLight intensity={0.5} />
          <directionalLight
            position={[10, 10, 5]}
            intensity={1}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          <Physics>
            <Suspense fallback={null}>
              {currentScene === "forest" && <ForestScene />}
              {currentScene === "home" && <HomeScene />}
              {currentScene === "store" && <StoreScene />}
            </Suspense>
          </Physics>
        </Canvas>
      </KeyboardControls>
      <HUD />
      {isDead && <DeathScreen countdown={respawnCountdown} />}
    </>
  )
}
