"use client"
import { useEffect, useState } from 'react'
import { useGameContext } from './game-context'
import { useCoinSystem } from './CoinSystem'

// Regular React component for UI outside the Canvas
const HUD: React.FC = () => {
  const { health, hunger, maxHealth } = useGameContext();
  const coins = useCoinSystem((state) => state.coins);
  
  // Calculate health and hunger percentages for display
  const healthPercentage = (health / maxHealth) * 100;
  const hungerPercentage = hunger;

  return (
    <div className="absolute top-0 left-0 right-0 p-4 z-10 pointer-events-none">
      <div className="flex justify-between max-w-md mx-auto">
        {/* Health Bar */}
        <div className="w-36 bg-gray-800 rounded-full h-4 overflow-hidden">
          <div 
            className="bg-red-600 h-full transition-all duration-300 ease-in-out"
            style={{ width: `${healthPercentage}%` }}
          />
        </div>

        {/* Hunger Bar */}
        <div className="w-36 bg-gray-800 rounded-full h-4 overflow-hidden">
          <div 
            className="bg-yellow-600 h-full transition-all duration-300 ease-in-out"
            style={{ width: `${hungerPercentage}%` }}
          />
        </div>

        {/* Coins Counter */}
        <div className="text-yellow-400 font-bold text-xl">
          {Object.keys(coins).length} 🪙
        </div>
      </div>
    </div>
  )
}

export default HUD
