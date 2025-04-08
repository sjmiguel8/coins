"use client"
import { GameProvider } from "@/components/game-context"
import Menu from '../components/Menu'
import { Canvas } from '@react-three/fiber'
import { Physics } from '@react-three/rapier'
import ForestScene from "@/components/scenes/forest-scene"
import HomeScene from "@/components/scenes/home-scene"
import StoreScene from "@/components/scenes/store-scene"
import { useGameContext } from "@/components/game-context"
import { Suspense } from "react"

// This component decides which scene to render based on game context
function SceneSelector() {
  const { currentScene } = useGameContext();
  
  return (
    <Physics>
      {currentScene === "forest" && <ForestScene />}
      {currentScene === "home" && <HomeScene />}
      {currentScene === "store" && <StoreScene />}
    </Physics>
  );
}

export default function App() {
  return (
    <main className="w-full h-screen overflow-hidden">
      <GameProvider>
        <Menu />
        <Canvas shadows>
          <ambientLight intensity={0.8} />
          <directionalLight 
            position={[10, 10, 10]} 
            intensity={1} 
            castShadow 
            shadow-mapSize={[2048, 2048]} 
          />
          <Suspense fallback={null}>
            <SceneSelector />
          </Suspense>
        </Canvas>
      </GameProvider>
    </main>
  )
}
