"use client"
import { GameProvider } from "@/components/game-context"
import Menu from '../components/Menu'
import HUD from '../components/hud'
import { Canvas } from '@react-three/fiber'
import { Physics } from '@react-three/rapier'
import ForestScene from "@/components/scenes/forest-scene"
import HomeScene from "@/components/scenes/home-scene"
import StoreScene from "@/components/scenes/store-scene"
import { useGameContext } from "@/components/game-context"
import { Suspense } from "react"
import { KeyboardControls } from '@react-three/drei'

// Define controls ahead of time
const controls = [
  { name: "forward", keys: ["ArrowUp", "KeyW"] },
  { name: "backward", keys: ["ArrowDown", "KeyS"] },
  { name: "left", keys: ["ArrowLeft", "KeyA"] },
  { name: "right", keys: ["ArrowRight", "KeyD"] },
  { name: "jump", keys: ["Space"] },
  { name: "scene1", keys: ["Digit1"] },
  { name: "scene2", keys: ["Digit2"] },
  { name: "scene3", keys: ["Digit3"] }
]

// This component decides which scene to render based on game context
function SceneSelector() {
  const { currentScene } = useGameContext();
  
  return (
    <>
      {currentScene === "forest" && <ForestScene />}
      {currentScene === "home" && <HomeScene />}
      {currentScene === "store" && <StoreScene />}
    </>
  );
}

// The game application
export default function App() {
  return (
    <main className="w-full h-screen overflow-hidden">
      <GameProvider>
        <KeyboardControls map={controls}>
          <Menu />
          <HUD />
          <Canvas shadows>
            <ambientLight intensity={0.8} />
            <directionalLight 
              position={[10, 10, 10]} 
              intensity={1} 
              castShadow 
              shadow-mapSize={[2048, 2048]} 
            />
            <Physics gravity={[0, -9.8, 0]}>
              <Suspense fallback={null}>
                <SceneSelector />
              </Suspense>
            </Physics>
          </Canvas>
        </KeyboardControls>
      </GameProvider>
    </main>
  )
}
