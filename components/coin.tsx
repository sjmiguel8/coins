"use client"

import { useRef, useState, useEffect } from "react"
import { useFrame } from "@react-three/fiber"
import { useGLTF } from "@react-three/drei"
import * as THREE from "three"
import { useCoinSystem } from "./CoinSystem" // Import useCoinSystem
import React from 'react';

interface CoinProps {
  name: string;
  image: string;
  symbol: string;
  price: number;
  volume: number;
  priceChange: number;
  marketCap: number;
  position: [number, number, number];
}

const Coin: React.FC<CoinProps> = ({ name, image, symbol, price, volume, priceChange, marketCap, position }) => {
  const coinRef = useRef<THREE.Group>(null)
  const { collectCoin } = useCoinSystem() // Use collectCoin from CoinSystem
  
  // Load the coin model - moved to useEffect to ensure proper loading
  const { scene: originalScene } = useGLTF('/coin.glb')
  const [model, setModel] = useState<THREE.Group | null>(null)
  
  // Track collection status
  const isCollecting = useRef(false)
  
  // Ensure model is properly cloned and prepared
  useEffect(() => {
    const clonedScene = originalScene.clone()
    setModel(clonedScene)
    
    // Make sure the model is visible
    clonedScene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.castShadow = true
        object.receiveShadow = true
      }
    })
  }, [originalScene])

  useFrame((state, delta) => {
    if (!coinRef.current) return

    // Simple rotation
    coinRef.current.rotation.y += delta * 2
    
    // Simple hover effect
    const time = state.clock.getElapsedTime()
    const hoverY = position && position[1] + Math.sin(time * 1.5) * 0.1
    coinRef.current.position.y = hoverY
    
    // Check for player proximity less frequently
    if (Math.floor(time * 10) % 5 !== 0 || isCollecting.current) return
    
    // Find player
    let playerMesh: THREE.Object3D | undefined = undefined;
    
    state.scene.traverse((object: THREE.Object3D) => {
      if (object.userData && object.userData.isPlayer) {
        playerMesh = object
      }
    })
    
    if (playerMesh && coinRef.current) {
      const coinPos = new THREE.Vector3()
      const playerPos = new THREE.Vector3()
      
      coinRef.current.getWorldPosition(coinPos)
      if (playerMesh) {
        (playerMesh as THREE.Object3D).getWorldPosition(playerPos)
      }
      const distance = coinPos.distanceTo(playerPos)
      if (distance < 1.5 && !isCollecting.current) {
        // Emit event to collect the coin
        collectCoin("coin-" + position[0] + "-" + position[1] + "-" + position[2]) // Collect the coin using its ID
        isCollecting.current = true
      }
    }
  })

  // Don't render until model is loaded
  if (!model) return null

  return (
    <group
      ref={coinRef}
      position={position ? [position[0], position[1], position[2]] : [0, 0, 0]}
      dispose={null}
      userData={{ isCoin: true }}
    >
      <primitive object={model} scale={0.1} castShadow receiveShadow />
    </group>
  );
};

export default Coin;

// Preload the model
useGLTF.preload('/coin.glb')
