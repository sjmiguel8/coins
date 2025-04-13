"use client"

import { Canvas } from "@react-three/fiber"
import { useGameContext } from "./game-context"
import Player from "./player"
import Creature from "./creature"
import CoinsManager from "./coins-manager"
import { GameProvider } from "./game-context"
// Other imports...

export default function GameScene() {
  return (
    <GameProvider>
      <div className="w-full h-screen">
        <Canvas shadows>
          {/* Your existing scene setup */}
          <Player position={[0, 1.5, 0]} cameraLock={true} />
          <Creature position={[5, 0, 5]} />
          <CoinsManager />
          {/* Sound effect for coin collection */}
          <audio id="coin-collect-sound" src="/sounds/coin-collect.mp3" preload="auto" />
        </Canvas>
        <CoinCounter />
      </div>
    </GameProvider>
  )
}

// Simple coin counter UI component
function CoinCounter() {
  const { coins } = useGameContext()
  
  return (
    <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-yellow-400 px-4 py-2 rounded-lg font-bold flex items-center">
      <span className="mr-2">🪙</span>
      <span>{coins}</span>
    </div>
  )
}
