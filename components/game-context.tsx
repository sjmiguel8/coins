"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

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
  isDead: boolean;
  respawnCountdown: number;
  damagePlayer: (damage: number) => void;
  eatMeat: (amount?: number) => void;
  lastAttacked: number;
  setLastAttacked: (time: number) => void;
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
  const maxHealth = 100;
  const [coins, setCoins] = useState(0);
  const [currentScene, setCurrentScene] = useState("home");
  const [hunger, setHunger] = useState(100);
  const [health, setHealthState] = useState(maxHealth);
  const [useVirtualJoystick, setUseVirtualJoystickState] = useState(true);
  const [useClickToMove, setUseClickToMoveState] = useState(false);
  const [isDead, setIsDead] = useState(false);
  const [respawnCountdown, setRespawnCountdown] = useState(5);
  const [lastAttacked, setLastAttacked] = useState(0);

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

  // Handle player death and respawn
  useEffect(() => {
    if (health <= 0 && !isDead) {
      setIsDead(true);
      setRespawnCountdown(5);

      // Start countdown timer
      const countdownInterval = setInterval(() => {
        setRespawnCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            // Respawn player after countdown
            setTimeout(() => {
              setHealth(maxHealth);
              setHunger(100);
              setIsDead(false);
              // Return to home scene when respawning
              setCurrentScene("home");
            }, 1000);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(countdownInterval);
    }
  }, [health, isDead]);

  // Hunger reduction over time
  useEffect(() => {
    const hungerInterval = setInterval(() => {
      if (!isDead) {
        setHunger((prev) => Math.max(prev - 0.2, 0));
      }
    }, 1000);

    return () => clearInterval(hungerInterval);
  }, [isDead]);

  // Health regeneration when not recently attacked and hunger is sufficient
  useEffect(() => {
    const healthRegenInterval = setInterval(() => {
      if (!isDead && Date.now() - lastAttacked > 5000 && health < maxHealth && hunger > 30) {
        setHealth(Math.min(health + 1, maxHealth));
        // Hunger decreases slightly when regenerating health
        setHunger((prev) => Math.max(prev - 0.05, 0));
      }
    }, 1000);

    return () => clearInterval(healthRegenInterval);
  }, [health, hunger, lastAttacked, isDead]);

  // Health reduction when hunger is empty
  useEffect(() => {
    const starvationInterval = setInterval(() => {
      if (!isDead && hunger <= 0) {
        setHealth(Math.max(health - 1, 0));
      }
    }, 2000);

    return () => clearInterval(starvationInterval);
  }, [hunger, isDead]);

  // Handle player taking damage
  const damagePlayer = (damage: number) => {
    if (isDead) return;

    setHealth(Math.max(health - damage, 0));
    setLastAttacked(Date.now());
  };

  // Handle eating meat to restore hunger
  const eatMeat = (amount: number = 20) => {
    if (isDead) return;
    setHunger((prev) => Math.min(prev + amount, 100));
  };

  const value = useMemo(() => ({
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
    isDead: isDead,
    respawnCountdown: respawnCountdown,
    damagePlayer: damagePlayer,
    eatMeat: eatMeat,
    lastAttacked: lastAttacked,
    setLastAttacked: setLastAttacked,
  }), [coins, currentScene, hunger, health, useVirtualJoystick, useClickToMove, isDead, respawnCountdown, lastAttacked, addCoins, changeScene, setHealth, setHunger, setUseVirtualJoystick, setUseClickToMove, damagePlayer, eatMeat, setLastAttacked]);

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};