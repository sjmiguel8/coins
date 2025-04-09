"use client"

import { useRef, useState, useEffect } from "react"
import { useFrame } from "@react-three/fiber"
import { useGLTF } from "@react-three/drei"
import * as THREE from "three"

export default function Creature({ position }: { position: [number, number, number] }) {
  const creatureRef = useRef<THREE.Group>(null)
  const [direction, setDirection] = useState(() => Math.random() * Math.PI * 2)
  const [moveTimer, setMoveTimer] = useState(0)
  
  // Load the GLB model
  const { scene } = useGLTF('/base_basic_pbr.glb')
  // Create a clone of the model to avoid sharing instances
  const modelRef = useRef(scene.clone())
  
  // Configure the loaded model once
  useEffect(() => {
    if (modelRef.current) {
      // Make the model bigger
      modelRef.current.scale.set(1.2, 1.2, 1.2)
      
      // Move the model up slightly to account for new size
      modelRef.current.position.set(0, -0.5, 0)
      
      // Ensure all parts cast shadows
      modelRef.current.traverse((node) => {
        if (node.type === 'Mesh') {
          node.castShadow = true
          node.receiveShadow = true
        }
      })
    }
  }, [])

  // Change direction periodically with more natural timing
  useEffect(() => {
    // Initial random direction change timer
    let timerId = setTimeout(changeDirection, 2000 + Math.random() * 3000)
    
    function changeDirection() {
      // Change direction with some smoothing
      const newDirection = direction + (Math.random() * Math.PI - Math.PI/2) * 0.8
      setDirection(newDirection)
      
      // Set next direction change with variable timing
      timerId = setTimeout(changeDirection, 1500 + Math.random() * 4000)
    }

    return () => clearTimeout(timerId)
  }, [direction])

  useFrame((state, delta) => {
    if (!creatureRef.current || !modelRef.current) return

    // Update move timer
    setMoveTimer(prev => prev + delta)
    
    // Simple AI: move in the current direction
    const speed = 1.5
    const vx = Math.cos(direction) * speed * delta
    const vz = Math.sin(direction) * speed * delta
    
    // Calculate new position
    const newX = position[0] + vx
    const newZ = position[2] + vz
    
    // Add animated bobbing motion for vertical movement
    const time = state.clock.getElapsedTime()
    const bobMotion = Math.sin(time * 0.5) * 0.05
    
    // Keep creatures from moving too far
    const maxDistance = 40
    const originDistance = Math.sqrt(newX * newX + newZ * newZ)
    if (originDistance > maxDistance) {
      // Change direction to move back toward the center
      setDirection(Math.atan2(-position[2], -position[0]))
    }
    
    // Set new position with bob
    creatureRef.current.position.set(newX, 0.5 + bobMotion, newZ)
    
    // Rotate to face direction of movement
    creatureRef.current.rotation.y = direction
  })
  
  return (
    <group 
      ref={creatureRef} 
      position={[position[0], 0.5, position[2]]} 
      userData={{ isCreature: true }}
    >
      {/* Use the loaded GLB model */}
      <primitive object={modelRef.current} />
    </group>
  )
}

// Preload the model to improve performance
useGLTF.preload('/base_basic_pbr.glb')
