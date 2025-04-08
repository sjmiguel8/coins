"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

type GameScene = "forest" | "home" | "store"

interface GameContextType {
  coins: number
  addCoins: (amount: number) => void
  currentScene: GameScene
  changeScene: (scene: GameScene) => void
  inventory: string[]
  addToInventory: (item: string) => void
}

const GameContext = createContext<GameContextType | undefined>(undefined)

export function GameProvider({ children }: { children: ReactNode }) {
  const [coins, setCoins] = useState(0)
  const [currentScene, setCurrentScene] = useState<GameScene>("forest")
  const [inventory, setInventory] = useState<string[]>([])

  const addCoins = (amount: number) => {
    setCoins((prev) => prev + amount)
  }

  const changeScene = (scene: GameScene) => {
    setCurrentScene(scene)
    console.log(`Changing scene to: ${scene}`)
  }

  const addToInventory = (item: string) => {
    setInventory((prev) => [...prev, item])
  }

  return (
    <GameContext.Provider
      value={{
        coins,
        addCoins,
        currentScene,
        changeScene,
        inventory,
        addToInventory,
      }}
    >
      {children}
    </GameContext.Provider>
  )
}

export function useGameContext() {
  const context = useContext(GameContext)
  if (context === undefined) {
    throw new Error("useGameContext must be used within a GameProvider")
  }
  return context
}
