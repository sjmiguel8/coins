"use client"

import { useState, useEffect } from "react"
import Coin from "./coin"

interface CoinData {
  id: string
  position: [number, number, number]
  collected: boolean
}

export default function CoinsManager() {
  const [coins, setCoins] = useState<CoinData[]>([])
  
  // Listen for coin drop events from creatures
  useEffect(() => {
    const handleCoinDrop = (event: CustomEvent<{ position: [number, number, number], attacker: any }>) => {
      const newCoin: CoinData = {
        id: `coin-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        position: event.detail.position,
        collected: false
      }
      
      setCoins(prev => [...prev, newCoin])
    }
    
    window.addEventListener('coin-drop', handleCoinDrop as EventListener)
    
    return () => {
      window.removeEventListener('coin-drop', handleCoinDrop as EventListener)
    }
  }, [])
  
  // Remove collected coins
  const handleCoinCollected = (id: string) => {
    setCoins(prev => prev.filter(coin => coin.id !== id))
  }
  
  return (
    <>
      {coins.map(coin => (
        <Coin 
          key={coin.id}
          position={coin.position}
          onCollect={() => handleCoinCollected(coin.id)}
        />
      ))}
    </>
  )
}
