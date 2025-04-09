"use client";

import React, { createContext, useContext, useState } from 'react';

interface GameContextType {
  coins: number;
  addCoins: (amount: number) => void;
  currentScene: string;
  changeScene: (scene: string) => void;
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
  const [coins, setCoins] = useState(0);
  const [currentScene, setCurrentScene] = useState("home");

  const addCoins = (amount: number) => {
    setCoins((prevCoins) => prevCoins + amount);
  };

  const changeScene = (scene: string) => {
    setCurrentScene(scene);
  };

  const value: GameContextType = {
    coins,
    addCoins,
    currentScene,
    changeScene,
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};
