"use client"

import { useRef, useState } from "react"
import { useFrame } from "@react-three/fiber"
import { useGLTF } from "@react-three/drei"
import * as THREE from "three"
import { useGameContext } from "./game-context"

export default function Coin({ position }: { position: [number, number, number] }) {
  const coinRef = useRef<THREE.Group>(null)
  const [collected, setCollected] = useState(false)
  const { addCoins } = useGameContext()
  
  // Load the GLB coin model
  const { scene } = useGLTF('/coin.glb')
  // Create a clone of the model to avoid sharing instances
  const modelRef = useRef(scene.clone())
  
  // Track if we're already processing collection to prevent multiple triggers
  const isProcessing = useRef(false)

  useFrame((state, delta) => {
    if (collected || isProcessing.current || !coinRef.current) return

    // Simple hover effect with sin wave - just up and down
    const time = state.clock.getElapsedTime()
    const hoverY = position[1] + Math.sin(time * 1.5) * 0.1
    
    // Update coin position - only Y position changes for hover
    coinRef.current.position.y = hoverY
    
    // Find player in scene
    let playerMesh: THREE.Object3D | null = null
    
    // Only do this check once every 10 frames to improve performance
    if (Math.floor(state.clock.getElapsedTime() * 60) % 10 === 0) {
      state.scene.traverse((object) => {
        // Only check for player, not creatures
        if (object.userData && object.userData.isPlayer) {
          playerMesh = object
        }
      })
    }
    
    // Check player proximity only if we found a player
    if (playerMesh && !isProcessing.current) {
      const coinWorldPos = new THREE.Vector3()
      const coinObject = coinRef.current as THREE.Object3D
      coinObject.getWorldPosition(coinWorldPos)
      
      const playerWorldPos = new THREE.Vector3()
      playerMesh.getWorldPosition(playerWorldPos)
      
      const distance = coinWorldPos.distanceTo(playerWorldPos)
      
      // Only player can collect coins (not creatures)
      if (distance < 1.5) {
        // Prevent multiple collections
        isProcessing.current = true
        
        // Add coin to counter
        addCoins(1)
        
        // Mark as collected
        setCollected(true)
      }
    }
  })

  // If collected, don't render anything
  if (collected) return null

  return (
    <group
      ref={coinRef}
      position={[position[0], position[1], position[2]]}
      scale={[0.05, 0.05, 0.05]} // Keep coins small
      rotation={[0, Math.random() * Math.PI * 2, 0]} // Random initial rotation
    >
      {/* Use the loaded coin GLB model */}
      <primitive object={modelRef.current} />
    </group>
  )
}

// Preload the model to improve performance
useGLTF.preload('/coin.glb')
