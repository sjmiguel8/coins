"use client"

import { useEffect } from "react"
import { useThree } from "@react-three/fiber"
import { RigidBody } from "@react-three/rapier"
import Player from "../player"
import * as THREE from "three"

export default function HomeScene() {
  const { scene } = useThree()

  useEffect(() => {
    scene.background = new THREE.Color("#87CEEB")
  }, [scene])

  return (
    <>
      <fog attach="fog" args={["#87CEEB", 30, 50]} />

      {/* Ground */}
      <RigidBody type="fixed" colliders="trimesh">
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial color="#8bc34a" />
        </mesh>
      </RigidBody>

      {/* Home structure */}
      <group position={[0, 0, -5]}>
        {/* Floor */}
        <RigidBody type="fixed" colliders="cuboid">
          <mesh position={[0, 0.1, 0]} receiveShadow>
            <boxGeometry args={[10, 0.2, 10]} />
            <meshStandardMaterial color="#a67c52" />
          </mesh>
        </RigidBody>

        {/* Walls */}
        <RigidBody type="fixed" colliders="cuboid">
          {/* Back wall */}
          <mesh position={[0, 2, -5]} castShadow receiveShadow>
            <boxGeometry args={[10, 4, 0.2]} />
            <meshStandardMaterial color="#e0e0e0" />
          </mesh>

          {/* Left wall */}
          <mesh position={[-5, 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.2, 4, 10]} />
            <meshStandardMaterial color="#e0e0e0" />
          </mesh>

          {/* Right wall */}
          <mesh position={[5, 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.2, 4, 10]} />
            <meshStandardMaterial color="#e0e0e0" />
          </mesh>

          {/* Front wall with door opening */}
          <mesh position={[-2.5, 2, 5]} castShadow receiveShadow>
            <boxGeometry args={[5, 4, 0.2]} />
            <meshStandardMaterial color="#e0e0e0" />
          </mesh>

          <mesh position={[3.5, 2, 5]} castShadow receiveShadow>
            <boxGeometry args={[3, 4, 0.2]} />
            <meshStandardMaterial color="#e0e0e0" />
          </mesh>

          <mesh position={[0, 3.5, 5]} castShadow receiveShadow>
            <boxGeometry args={[2, 1, 0.2]} />
            <meshStandardMaterial color="#e0e0e0" />
          </mesh>
        </RigidBody>

        {/* Roof */}
        <RigidBody type="fixed" colliders="hull">
          <mesh position={[0, 4.5, 0]} rotation={[0, 0, 0]} castShadow>
            <coneGeometry args={[7, 2, 4, 1]} />
            <meshStandardMaterial color="#8B4513" />
          </mesh>
        </RigidBody>

        {/* Furniture */}
        <RigidBody type="fixed" colliders="cuboid">
          {/* Table */}
          <mesh position={[0, 1, 0]} castShadow>
            <boxGeometry args={[2, 0.2, 1]} />
            <meshStandardMaterial color="#5D4037" />
          </mesh>

          {/* Table legs */}
          <mesh position={[-0.8, 0.5, -0.4]} castShadow>
            <boxGeometry args={[0.1, 1, 0.1]} />
            <meshStandardMaterial color="#5D4037" />
          </mesh>

          <mesh position={[0.8, 0.5, -0.4]} castShadow>
            <boxGeometry args={[0.1, 1, 0.1]} />
            <meshStandardMaterial color="#5D4037" />
          </mesh>

          <mesh position={[-0.8, 0.5, 0.4]} castShadow>
            <boxGeometry args={[0.1, 1, 0.1]} />
            <meshStandardMaterial color="#5D4037" />
          </mesh>

          <mesh position={[0.8, 0.5, 0.4]} castShadow>
            <boxGeometry args={[0.1, 1, 0.1]} />
            <meshStandardMaterial color="#5D4037" />
          </mesh>

          {/* Bed */}
          <mesh position={[-3, 0.3, -3]} castShadow>
            <boxGeometry args={[2, 0.6, 3]} />
            <meshStandardMaterial color="#9E9E9E" />
          </mesh>

          {/* Pillow */}
          <mesh position={[-3, 0.7, -4]} castShadow>
            <boxGeometry args={[1.5, 0.2, 0.8]} />
            <meshStandardMaterial color="#EEEEEE" />
          </mesh>

          {/* Bookshelf */}
          <mesh position={[3, 1.5, -4]} castShadow>
            <boxGeometry args={[2, 3, 0.5]} />
            <meshStandardMaterial color="#795548" />
          </mesh>

          {/* Books (simplified as colored blocks) */}
          <mesh position={[3, 0.7, -4]} castShadow>
            <boxGeometry args={[1.8, 0.2, 0.4]} />
            <meshStandardMaterial color="#F44336" />
          </mesh>

          <mesh position={[3, 1, -4]} castShadow>
            <boxGeometry args={[1.8, 0.2, 0.4]} />
            <meshStandardMaterial color="#2196F3" />
          </mesh>

          <mesh position={[3, 1.3, -4]} castShadow>
            <boxGeometry args={[1.8, 0.2, 0.4]} />
            <meshStandardMaterial color="#4CAF50" />
          </mesh>

          <mesh position={[3, 1.6, -4]} castShadow>
            <boxGeometry args={[1.8, 0.2, 0.4]} />
            <meshStandardMaterial color="#FFC107" />
          </mesh>
        </RigidBody>
      </group>

      {/* Player */}
      <Player />
    </>
  )
}
