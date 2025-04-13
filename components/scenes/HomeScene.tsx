import React, { useEffect, useState } from 'react';
import * as THREE from 'three';
import { CoinComponent } from '../CoinSystem';

const HomeScene: React.FC = () => {
  const [coins, setCoins] = useState<{[key: string]: [number, number, number]}>(() => {
    const initialCoins: {[key: string]: [number, number, number]} = {};
    for (let i = 0; i < 5; i++) {
      const id = `coin-${i}`;
      initialCoins[id] = [
        (Math.random() - 0.5) * 20,
        1,
        (Math.random() - 0.5) * 20,
      ];
    }
    return initialCoins;
  });

  useEffect(() => {
    const handleCoinCollected = (event: CustomEvent) => {
      const { coinId, position } = event.detail;

      // Remove the collected coin
      setCoins(prevCoins => {
        const newCoins = {...prevCoins};
        delete newCoins[coinId];
        return newCoins;
      });

      // Spawn a new coin at a random position
      setTimeout(() => {
        const newCoinId = `coin-${Date.now()}`;
        setCoins(prevCoins => ({
          ...prevCoins,
          [newCoinId]: [
            (Math.random() - 0.5) * 20,
            1,
            (Math.random() - 0.5) * 20,
          ]
        }));
      }, 500); // Short delay to avoid immediate re-collection
    };

    window.addEventListener('coin-collected', handleCoinCollected as EventListener);

    return () => {
      window.removeEventListener('coin-collected', handleCoinCollected as EventListener);
    };
  }, []);

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={0.7} castShadow />
      <mesh receiveShadow rotation-x={-Math.PI / 2} position={[0, 0, 0]}>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="green" />
      </mesh>
      {Object.entries(coins).map(([id, position]) => (
        <CoinComponent key={id} id={id} position={position} />
      ))}
    </>
  );
};

export default HomeScene;
