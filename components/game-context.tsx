"use client";

import React, { createContext, useContext, useState } from 'react';

interface GameContextType {
  coins: number;
  addCoins: (amount: number) => void;
  currentScene: string;
  changeScene: (scene: string) => void;
  setHealth: (health: number) => void;
  hunger: number;
  health: number; // Added health property
  setHunger: (hunger: number) => void;
  maxHealth: number;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGameContext = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGameContext must be used within a GameContextProvider");
  }
  return context;
};

interface GameContextProviderProps {
  children: React.ReactNode;
}

export const GameContextProvider: React.FC<GameContextProviderProps> = ({ children }) => {
  const maxHealth = 1800;
  const [coins, setCoins] = useState(0);
  const [currentScene, setCurrentScene] = useState("home");
  const [hunger, setHunger] = useState(100);
  const [health, setHealthState] = useState(maxHealth);

  const addCoins = (amount: number) => {
    setCoins((prevCoins) => prevCoins + amount);
  };

  const changeScene = (scene: string) => {
    setCurrentScene(scene);
  };

  const setHealth = (newHealth: number) => {
    setHealthState(newHealth);
  };

  const value: GameContextType = {
    coins,
    addCoins,
    currentScene,
    changeScene,
    setHealth,
    hunger: hunger,
    health: health,
    setHunger,
    maxHealth: maxHealth,
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};
