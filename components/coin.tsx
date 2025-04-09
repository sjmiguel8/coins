"use client"

import { useRef, useState, useEffect } from "react"
import { useFrame } from "@react-three/fiber"
import { useGLTF } from "@react-three/drei"
import * as THREE from "three"
import { useGameContext } from "./game-context"

interface CoinProps {
  position: [number, number, number];
}

export default function Coin({ position }: CoinProps) {
  const coinRef = useRef<THREE.Group>(null)
  const [collected, setCollected] = useState(false)
  const { addCoins } = useGameContext()
  
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
    if (collected || !coinRef.current) return

    // Simple rotation
    coinRef.current.rotation.y += delta * 2
    
    // Simple hover effect
    const time = state.clock.getElapsedTime()
    const hoverY = position[1] + Math.sin(time * 1.5) * 0.1
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
        playerMesh.getWorldPosition(playerPos)
      }
      const distance = coinPos.distanceTo(playerPos)
      if (distance < 1.5 && !isCollecting.current) {
        // Emit event to collect the coin
        addCoins(1)
        setCollected(true)
        isCollecting.current = true
        setTimeout(() => {
          isCollecting.current = false
        }, 1000) // Cooldown for collection
      }
    }
  })

  // Don't render until model is loaded
  if (collected || !model) return null

  return (
    <group
      ref={coinRef}
      position={[position[0], position[1], position[2]]}
      dispose={null}
      userData={{ isCoin: true }}
    >
      <primitive object={model} scale={0.1} castShadow receiveShadow />
    </group>
  )
}

// Preload the model
useGLTF.preload('/coin.glb')
