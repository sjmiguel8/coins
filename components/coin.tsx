"use client"

import { useRef, useState } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { useGameContext } from "./game-context"

export default function Coin({ position }: { position: [number, number, number] }) {
  const coinRef = useRef<THREE.Mesh>(null)
  const [collected, setCollected] = useState(false)
  const { addCoins } = useGameContext()
  
  // Track if we're already processing collection to prevent multiple triggers
  const isProcessing = useRef(false)
  
  // Use a simple position object for hover effect
  const coinPosition = useRef({
    x: position[0],
    y: position[1],
    z: position[2]
  })

  useFrame((state, delta) => {
    if (collected || isProcessing.current || !coinRef.current) return

    // Simple coin rotation - only rotate the coin itself
    coinRef.current.rotation.y += delta * 2
    
    // Simple hover effect with sin wave
    const time = state.clock.getElapsedTime()
    const hoverY = position[1] + Math.sin(time * 2) * 0.1
    
    // Update coin position
    coinRef.current.position.set(position[0], hoverY, position[2])
    
    // Find player in scene - very simple check
    let playerMesh = null
    let playerFound = false
    
    // Only do this check once every 10 frames to improve performance
    if (Math.floor(state.clock.getElapsedTime() * 60) % 10 === 0 && !playerFound) {
      state.scene.traverse((object) => {
        if (object.userData && object.userData.isPlayer) {
          playerMesh = object
          playerFound = true
        }
      })
    }
    
    // Check player proximity only if we found a player
    if (playerMesh && !isProcessing.current) {
      const coinWorldPos = new THREE.Vector3()
      coinRef.current.getWorldPosition(coinWorldPos)
      
      const playerWorldPos = new THREE.Vector3()
      playerMesh.getWorldPosition(playerWorldPos)
      
      const distance = coinWorldPos.distanceTo(playerWorldPos)
      
      if (distance < 2) {
        // Prevent multiple collections
        isProcessing.current = true
        
        // Add coin to counter
        addCoins(1)
        
        // Mark as collected without any animation
        setCollected(true)
      }
    }
  })

  // If collected, don't render anything
  if (collected) return null

  return (
    <mesh
      ref={coinRef}
      position={[position[0], position[1], position[2]]}
      rotation={[Math.PI/2, 0, 0]} // Make coin stand upright
      castShadow
    >
      <cylinderGeometry args={[0.5, 0.5, 0.1, 32]} />
      <meshStandardMaterial color="#ffd700" metalness={0.8} roughness={0.2} />
    </mesh>
  )
}
