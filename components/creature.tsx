"use client"

import { useRef, useState, useEffect } from "react"
import { useFrame } from "@react-three/fiber"
import { RigidBody } from "@react-three/rapier"
import { useGLTF } from "@react-three/drei"
import * as THREE from "three"

export default function Creature({ position }: { position: [number, number, number] }) {
  const rigidBodyRef = useRef<any>(null)
  const [direction, setDirection] = useState(() => Math.random() * Math.PI * 2)
  const [moveTimer, setMoveTimer] = useState(0)
  
  // Load the GLB model
  const { scene } = useGLTF('/base_basic_pbr.glb')
  // Create a clone of the model to avoid sharing instances
  const modelRef = useRef(scene.clone())
  
  // Configure the loaded model once
  useEffect(() => {
    if (modelRef.current) {
      // Make the model bigger (increased from 0.4 to 1.2)
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

  // Animation parameters for bobbing/living movement
  const bobHeight = useRef(0.05 + Math.random() * 0.1)
  const bobSpeed = useRef(0.5 + Math.random() * 1.0)
  const wobbleAmount = useRef(0.03 + Math.random() * 0.04)

  useFrame((state, delta) => {
    if (!rigidBodyRef.current || !modelRef.current) return

    // Update move timer
    setMoveTimer(prev => prev + delta)
    
    // Simple AI: move in the current direction
    const speed = 1.5
    const vx = Math.cos(direction) * speed * delta
    const vz = Math.sin(direction) * speed * delta
    
    // Get current position
    const position = rigidBodyRef.current.translation()
    
    // Calculate new position
    const newX = position.x + vx
    const newZ = position.z + vz
    
    // Add animated bobbing motion for vertical movement
    const time = state.clock.getElapsedTime()
    const bobMotion = Math.sin(time * bobSpeed.current) * bobHeight.current
    
    // Add subtle wobbling for side-to-side "life-like" motion
    const wobbleMotion = Math.sin(time * 2.3) * wobbleAmount.current
    
    // Set new position with bob
    rigidBodyRef.current.setTranslation({ 
      x: newX, 
      y: position.y + bobMotion, 
      z: newZ 
    }, true)
    
    // Rotate to face direction of movement with added "life-like" wobble
    const targetRotation = new THREE.Euler(
      Math.sin(time * 1.7) * 0.1, // Slight up/down head movement
      direction + wobbleMotion, // Basic direction plus wobble
      Math.sin(time * 2.1) * 0.08 // Slight side-to-side roll
    )
    
    const quaternion = new THREE.Quaternion().setFromEuler(targetRotation)
    rigidBodyRef.current.setRotation(quaternion, true)
  })
  
  return (
    <RigidBody 
      ref={rigidBodyRef} 
      type="dynamic" 
      position={[position[0], position[1], position[2]]} 
      lockRotations={false}
      userData={{ isCreature: true }}
      colliders="hull"
      mass={2}
    >
      {/* Use the loaded GLB model */}
      <primitive object={modelRef.current} />
    </RigidBody>
  )
}

// Preload the model to improve performance
useGLTF.preload('/base_basic_pbr.glb')
