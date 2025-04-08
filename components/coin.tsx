"use client"

import { useRef, useState } from "react"
import { useFrame } from "@react-three/fiber"
import { RigidBody } from "@react-three/rapier"
import * as THREE from "three"
import { useGameContext } from "./game-context"

export default function Coin({ position }: { position: [number, number, number] }) {
  const coinRef = useRef<THREE.Mesh>(null)
  const rigidBodyRef = useRef<any>(null)
  const [collected, setCollected] = useState(false)
  const { addCoins } = useGameContext()

  useFrame((state, delta) => {
    if (coinRef.current && !collected) {
      coinRef.current.rotation.y += delta * 2

      // Make coin hover up and down
      const time = state.clock.getElapsedTime()
      const newY = position[1] + Math.sin(time * 2) * 0.1

      // Add null check before using rigidBodyRef.current
      if (rigidBodyRef.current) {
        rigidBodyRef.current.setTranslation({ x: position[0], y: newY, z: position[2] })
      }

      // Check for player collision
      const worldPosition = new THREE.Vector3()
      coinRef.current.getWorldPosition(worldPosition)

      // This is a simplified collision check - in a real game, you'd use proper collision detection
      const playerPosition = state.camera.position.clone()
      playerPosition.y -= 2

      if (worldPosition.distanceTo(playerPosition) < 1.5) {
        setCollected(true)
        addCoins(1)
      }
    }
  })

  if (collected) return null

  return (
    <RigidBody ref={rigidBodyRef} type="fixed" colliders="ball" position={position} sensor>
      <mesh ref={coinRef} castShadow>
        <cylinderGeometry args={[0.5, 0.5, 0.1, 32]} />
        <meshStandardMaterial color="#ffd700" metalness={0.8} roughness={0.2} />
      </mesh>
    </RigidBody>
  )
}
