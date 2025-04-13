"use client"

import { useEffect, useRef, useState } from "react"
import { useFrame } from "@react-three/fiber"
import { useGLTF } from "@react-three/drei"
import * as THREE from "three"
import { useGameContext } from "./game-context"

interface CoinProps {
  position: [number, number, number];
  onCollect?: () => void;
}

export default function Coin({ position, onCollect }: CoinProps) {
  const { scene: coinModel } = useGLTF('/coin.glb')
  const coinRef = useRef<THREE.Group>(null)
  const [collected, setCollected] = useState(false)
  
  // Clone the model to avoid issues with multiple instances
  const model = coinModel.clone()
  
  useEffect(() => {
    if (model) {
      // Configure the coin model
      model.scale.set(1, 1, 1)
      model.traverse((node) => {
        if (node instanceof THREE.Mesh) {
          node.castShadow = true
          node.receiveShadow = true
          // Make the mesh interactive
          if (node.material) {
            node.userData.isInteractive = true
          }
        }
      })
    }
  }, [model])

  // Rotate the coin
  useFrame((state, delta) => {
    if (coinRef.current && !collected) {
      coinRef.current.rotation.y += delta * 2
      // Optional floating animation
      coinRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1
    }
  })

  // Handle coin collection via click
  const handleClick = (event: THREE.Event) => {
    (event as any).stopPropagation()
    if (!collected) {
      collectCoin()
    }
  }

  // Function to handle coin collection
  const collectCoin = () => {
    if (collected) return
    
    setCollected(true)
    
    // Optional collection animation
    if (coinRef.current) {
      // Scale down and fade out
      const animateCollection = () => {
        if (!coinRef.current) return
        
        coinRef.current.scale.multiplyScalar(0.9)
        
        if (coinRef.current.scale.x > 0.1) {
          requestAnimationFrame(animateCollection)
        } else {
          // Clean up after animation
          if (onCollect) {
            onCollect()
          }
          
          // Hide the coin
          coinRef.current.visible = false
        }
      }
      
      animateCollection()
    } else {
      // If no ref yet, just hide
      if (onCollect) onCollect()
    }
    
    // Play collection sound if available
    const collectSound = document.getElementById('coin-collect-sound') as HTMLAudioElement
    if (collectSound) collectSound.play()
  }
  
  // Check for player collision
  useEffect(() => {
    if (!coinRef.current) return
    
    const checkPlayerCollision = () => {
      if (collected || !coinRef.current) return
      
      let playerMesh: THREE.Object3D | null = null
      const scene = coinRef.current.parent
      
      if (!scene) return
      
      scene.traverse((object: THREE.Object3D) => {
        if (object.userData && object.userData.isPlayer) {
          playerMesh = object
        }
      })
      
      if (playerMesh) {
        const coinPos = new THREE.Vector3()
        const playerPos = new THREE.Vector3()
        
        coinRef.current.getWorldPosition(coinPos)
        playerMesh.getWorldPosition(playerPos)
        
        const distance = coinPos.distanceTo(playerPos)
        
        // If player is close enough to coin, collect it
        if (distance < 2) {
          collectCoin()
        }
      }
    }
    
    // Check for collision every frame
    const intervalId = setInterval(checkPlayerCollision, 100)
    return () => clearInterval(intervalId)
  }, [collected])
  
  if (collected) return null
  
  return (
    <group 
      ref={coinRef} 
      position={position}
      onClick={handleClick}
    >
      <primitive object={model} />
    </group>
  )
}

// Preload coin model
useGLTF.preload('/coin.glb')
