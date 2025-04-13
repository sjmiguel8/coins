import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import * as THREE from 'three'
import React from 'react'

export interface Coin {
  id: string
  position: THREE.Vector3
  value: number
  isCollected: boolean
}

interface CoinSystemState {
  coins: Record<string, Coin>
  totalCollected: number
  
  // Actions
  registerCoin: (coin: Omit<Coin, 'isCollected'>) => void
  collectCoin: (id: string) => void
  resetCoins: () => void
  addCoin: (amount: number) => void
}

export const useCoinSystem = create<CoinSystemState>()(
  subscribeWithSelector((set) => ({
    coins: {},
    totalCollected: 0,
    
    registerCoin: (coin) => {
      set((state) => ({
        coins: {
          ...state.coins,
          [coin.id]: {
            ...coin,
            isCollected: false
          }
        }
      }))
    },
    
    collectCoin: (id) => {
      set((state) => {
        const coin = state.coins[id]
        if (!coin || coin.isCollected) return state
        
        return {
          coins: {
            ...state.coins,
            [id]: {
              ...coin,
              isCollected: true
            }
          },
          totalCollected: state.totalCollected + coin.value
        }
      })
    },
    
    resetCoins: () => {
      set((state) => ({
        coins: Object.fromEntries(
          Object.entries(state.coins).map(([id, coin]) => [id, {...coin, isCollected: false}])
        ),
        totalCollected: 0
      }))
    },

    addCoin: (amount: number) => {
      set((state) => ({
        totalCollected: state.totalCollected + amount
      }))
    }
  }))
)

// Coin component that handles its own visibility
export const CoinComponent: React.FC<{ id: string, position: [number, number, number], value?: number }> = ({ 
  id, 
  position,
  value = 1 
}) => {
  const { registerCoin, collectCoin, coins } = useCoinSystem()
  const isCollected = coins[id]?.isCollected || false
  
  // Register coin on mount
  React.useEffect(() => {
    registerCoin({
      id,
      position: new THREE.Vector3(...position),
      value
    })
  }, [id])
  
  // Don't render if collected
  if (isCollected) return null
  
  return (
    <mesh
      position={position}
      onClick={(e) => {
        e.stopPropagation()
        collectCoin(id)
      }}
      userData={{ isCoin: true, id }}
    >
      <cylinderGeometry args={[0.5, 0.5, 0.1, 32]} />
      <meshStandardMaterial color="gold" metalness={0.8} roughness={0.2} />
    </mesh>
  )
}
