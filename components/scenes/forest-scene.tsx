"use client"

import { useEffect, useState } from "react"
import { useThree } from "@react-three/fiber"
import { RigidBody } from "@react-three/rapier"
import Player from "../player"
import Coin from "../coin"
import Creature from "../creature"
import * as THREE from "three"

export default function ForestScene() {
  const { scene } = useThree()
  const [coins, setCoins] = useState<[number, number, number][]>([])

  // Generate random coin positions
  useEffect(() => {
    scene.background = new THREE.Color("#8bc34a")

    const newCoins: [number, number, number][] = []
    for (let i = 0; i < 20; i++) {
      const x = (Math.random() - 0.5) * 30
      const z = (Math.random() - 0.5) * 30
      newCoins.push([x, 1, z])
    }
    setCoins(newCoins)
  }, [scene])

  return (
    <>
      <fog attach="fog" args={["#8bc34a", 30, 50]} />

      {/* Ground */}
      <RigidBody type="fixed" colliders="trimesh">
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial color="#4b7d2f" />
        </mesh>
      </RigidBody>

      {/* Trees */}
      {Array.from({ length: 50 }).map((_, i) => {
        const x = (Math.random() - 0.5) * 80
        const z = (Math.random() - 0.5) * 80
        const scale = Math.random() * 0.5 + 0.5

        return (
          <group key={i} position={[x, 0, z]} scale={[scale, scale, scale]}>
            {/* Tree trunk */}
            <mesh castShadow position={[0, 2, 0]}>
              <cylinderGeometry args={[0.5, 0.7, 4, 8]} />
              <meshStandardMaterial color="#8B4513" />
            </mesh>
            {/* Tree top */}
            <mesh castShadow position={[0, 5, 0]}>
              <coneGeometry args={[2, 4, 8]} />
              <meshStandardMaterial color="#2E7D32" />
            </mesh>
          </group>
        )
      })}

      {/* Player */}
      <Player />

      {/* Coins */}
      {coins.map((position, i) => (
        <Coin key={i} position={position} />
      ))}

      {/* Creatures */}
      {Array.from({ length: 10 }).map((_, i) => {
        const x = (Math.random() - 0.5) * 30
        const z = (Math.random() - 0.5) * 30
        return <Creature key={i} position={[x, 0.5, z]} />
      })}
    </>
  )
}
