"use client"

import { useRef, useState, useEffect } from "react"
import { useFrame } from "@react-three/fiber"
import { useGLTF } from "@react-three/drei"
import * as THREE from "three"

export default function Creature({ position }: { position: [number, number, number] }) {
  const creatureRef = useRef<THREE.Group>(null)
  const [direction, setDirection] = useState(() => Math.random() * Math.PI * 2)
  
  // Load the model once and clone it
  const { scene: originalScene } = useGLTF('/base_basic_pbr.glb')
  const modelRef = useRef<THREE.Object3D>(originalScene.clone())
  
  // Configure model appearance
  useEffect(() => {
    if (modelRef.current) {
      modelRef.current.scale.set(1.2, 1.2, 1.2)
      modelRef.current.position.set(0, -0.5, 0)
      
      // Apply shadows
      modelRef.current.traverse((node) => {
        if (node instanceof THREE.Mesh) {
          node.castShadow = true
          node.receiveShadow = true
        }
      })
    }
  }, [])

  // Direction changes
  useEffect(() => {
    const changeDirection = () => {
      setDirection(prev => {
        const randomAngle = Math.random() * Math.PI - Math.PI / 2
        return prev + randomAngle * 0.8
      })
    }
    
    const intervalId = setInterval(changeDirection, 2000 + Math.random() * 3000)
    return () => clearInterval(intervalId)
  }, [])

  useFrame((_, delta) => {
    if (!creatureRef.current) return

    // Simple movement
    const speed = 1
    const xOffset = Math.cos(direction) * speed * delta
    const zOffset = Math.sin(direction) * speed * delta
    
    // Current position
    const currentPosition = creatureRef.current.position.clone()
    
    // New position
    const newX = currentPosition.x + xOffset
    const newZ = currentPosition.z + zOffset
    
    // Boundary check
    const maxDistance = 40
    const distanceFromOrigin = Math.sqrt(newX * newX + newZ * newZ)
    
    if (distanceFromOrigin > maxDistance) {
      // Turn back toward the center
      const angleToCenter = Math.atan2(-currentPosition.z, -currentPosition.x)
      setDirection(angleToCenter)
    } else {
      // Apply new position
      creatureRef.current.position.x = newX
      creatureRef.current.position.z = newZ
    }
    
    // Rotate to face movement direction
    creatureRef.current.rotation.y = direction
    
    // Simple bobbing effect
    const time = Date.now() * 0.001
    const bobAmount = Math.sin(time * 2) * 0.05
    creatureRef.current.position.y = position[1] + bobAmount
  })

  return (
    <group 
      ref={creatureRef}
      position={[position[0], position[1], position[2]]} 
    >
      <primitive object={modelRef.current} />
    </group>
  )
}

// Preload the model
useGLTF.preload('/base_basic_pbr.glb')
