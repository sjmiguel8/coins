"use client";

import React, { createContext, useContext, useState } from 'react';

interface GameContextType {
  coins: number;
  addCoins: (amount: number) => void;
  currentScene: string;
  changeScene: (scene: string) => void;
  setHealth: (health: number) => void;
  hunger: number;
  health: number;
  setHunger: (hunger: number) => void;
  maxHealth: number;
  useVirtualJoystick: boolean;
  setUseVirtualJoystick: (useVirtualJoystick: boolean) => void;
  useClickToMove: boolean;
  setUseClickToMove: (useClickToMove: boolean) => void;
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
  const [useVirtualJoystick, setUseVirtualJoystickState] = useState(true);
  const [useClickToMove, setUseClickToMoveState] = useState(false);

  const addCoins = (amount: number) => {
    setCoins((prevCoins) => prevCoins + amount);
  };

  const changeScene = (scene: string) => {
    setCurrentScene(scene);
  };

  const setHealth = (newHealth: number) => {
    setHealthState(newHealth);
  };

  const setUseVirtualJoystick = (useVirtualJoystick: boolean) => {
    setUseVirtualJoystickState(useVirtualJoystick);
  };

  const setUseClickToMove = (useClickToMove: boolean) => {
    setUseClickToMoveState(useClickToMove);
  };

  const value: GameContextType = {
    coins: coins,
    addCoins: addCoins,
    currentScene: currentScene,
    changeScene: changeScene,
    setHealth: setHealth,
    hunger: hunger,
    health: health,
    setHunger: setHunger,
    maxHealth: maxHealth,
    useVirtualJoystick: useVirtualJoystick,
    setUseVirtualJoystick: setUseVirtualJoystick,
    useClickToMove: useClickToMove,
    setUseClickToMove: setUseClickToMove,
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};