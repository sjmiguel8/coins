"use client"

import { useGameContext } from "@/components/game-context"
import { Button } from "@/components/ui/button"
import { Coins } from "lucide-react"
import { useThree } from "@react-three/fiber"
import { useEffect, useState } from "react"
import MobileControls from "./MobileControls"

export default function HUD() {
  const { coins, currentScene, changeScene, hunger, health } = useGameContext()
  const { maxHealth, useVirtualJoystick } = useGameContext() as any; // Access maxHealth and useVirtualJoystick from the context

  const clampedHealth = Math.min(health, maxHealth); // Clamp health value
  const clampedHunger = Math.min(hunger, 100); // Clamp hunger value

  return (
    <div className="absolute inset-0 pointer-events-none z-50">
      {/* Coin counter */}
      <div className="absolute top-4 right-4 bg-black/50 text-white px-4 py-2 rounded-full flex items-center gap-2">
        <Coins className="h-5 w-5 text-yellow-400" />
        <span className="font-bold">{coins}</span>
      </div>

      {/* Health and Hunger bars */}
      <div className="absolute top-4 left-4 bg-black/50 text-white px-4 py-2 rounded-md">
        <p>Health: {clampedHealth}</p>
        <p>Hunger: {clampedHunger.toFixed(1)}</p>
      </div>

      {/* Conditionally render MobileControls */}
      {useVirtualJoystick && (
        <div className="absolute left-4 top-24">
          <MobileControls />
        </div>
      )}

      {/* Scene navigation */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 pointer-events-auto">
        <Button
          variant={currentScene === "forest" ? "default" : "outline"}
          onClick={() => changeScene("forest")}
          className="bg-green-600 hover:bg-green-700"
        >
          Forest (1)
        </Button>
        <Button
          variant={currentScene === "home" ? "default" : "outline"}
          onClick={() => changeScene("home")}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Home (2)
        </Button>
        <Button
          variant={currentScene === "store" ? "default" : "outline"}
          onClick={() => changeScene("store")}
          className="bg-purple-600 hover:bg-purple-700"
        >
          Store (3)
        </Button>
      </div>

      {/* Controls help with better visibility */}
      <div className="absolute bottom-4 left-4 bg-black/70 text-white px-4 py-2 rounded-md">
        <p className="font-semibold">CONTROLS:</p>
        <p><span className="text-yellow-300">W/A/S/D or Arrow Keys:</span> Move</p> 
        <p><span className="text-yellow-300">Space:</span> Jump</p>
        <p><span className="text-yellow-300">1, 2, 3:</span> Change Scene</p>
      </div>
    </div>
  )
}
