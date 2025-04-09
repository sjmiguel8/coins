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
  
  // Load the coin model
  const { scene: originalScene } = useGLTF('/coin.glb')
  const [model] = useState(() => originalScene.clone())
  
  // Track collection status
  const isCollecting = useRef(false)

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
    let playerMesh: THREE.Object3D | null = null
    
    state.scene.traverse((object: THREE.Object3D) => {
      if (object.userData && object.userData.isPlayer) {
        playerMesh = object
      }
    })
    
    if (playerMesh && coinRef.current) { // Check if coinRef.current exists
      const coinPos = new THREE.Vector3()
      const playerPos = new THREE.Vector3()
      
      coinRef.current.getWorldPosition(coinPos)
      playerMesh.getWorldPosition(playerPos)
      
      if (coinPos.distanceTo(playerPos) < 1.5 && !isCollecting.current) {
        isCollecting.current = true
        addCoins(1)
        setCollected(true)
      }
    }
  })

  if (collected) return null

  return (
    <group
      ref={coinRef}
      position={[position[0], position[1], position[2]]}
      dispose={null}
    >
      <primitive object={model} scale={0.5} castShadow receiveShadow />
    </group>
  )
}

// Preload the model
useGLTF.preload('/coin.glb')
