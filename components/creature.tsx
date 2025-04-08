"use client"

import { useRef, useState, useEffect } from "react"
import { useFrame } from "@react-three/fiber"
import { RigidBody } from "@react-three/rapier"
import * as THREE from "three"

export default function Creature({ position }: { position: [number, number, number] }) {
  const rigidBodyRef = useRef<any>(null)
  const [direction, setDirection] = useState(() => Math.random() * Math.PI * 2)
  const [moveTimer, setMoveTimer] = useState(0)

  // Change direction periodically
  useEffect(() => {
    const intervalId = setInterval(() => {
      setDirection(Math.random() * Math.PI * 2)
    }, 2000 + Math.random() * 3000)

    return () => clearInterval(intervalId)
  }, [])

  useFrame((state, delta) => {
    if (!rigidBodyRef.current) return

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
    
    // Set new position
    rigidBodyRef.current.setTranslation({ x: newX, y: position.y, z: newZ }, true)
    
    // Rotate to face direction of movement
    const targetRotation = new THREE.Quaternion()
    targetRotation.setFromEuler(new THREE.Euler(0, direction, 0))
    rigidBodyRef.current.setRotation(targetRotation, true)
  })
  
  return (
    <RigidBody 
      ref={rigidBodyRef} 
      type="dynamic" 
      position={[position[0], position[1], position[2]]} 
      lockRotations={false}
      userData={{ isCreature: true }}
    >
      {/* Creature body */}
      <mesh castShadow>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial color="#8844aa" />
      </mesh>
      {/* Eyes */}
      <mesh position={[0.2, 0.2, 0.3]} castShadow>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color="white" />
      </mesh>
      <mesh position={[-0.2, 0.2, 0.3]} castShadow>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color="white" />
      </mesh>
      {/* Pupils */}
      <mesh position={[0.2, 0.2, 0.38]} castShadow>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="black" />
      </mesh>
      <mesh position={[-0.2, 0.2, 0.38]} castShadow>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="black" />
      </mesh>
    </RigidBody>
  )
}
