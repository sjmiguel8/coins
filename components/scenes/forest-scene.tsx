"use client"

import { useEffect, useState, useRef } from "react"
import { useThree } from "@react-three/fiber"
import { RigidBody } from "@react-three/rapier"
import { useGLTF } from "@react-three/drei"
import Player from "../player"
import Coin from "../coin"
import Creature from "../creature"
import * as THREE from "three"

export default function ForestScene() {
  const { scene } = useThree()
  const [coins, setCoins] = useState<[number, number, number][]>([])
  
  // Load tree model
  const { scene: treeScene } = useGLTF('/decorative_tree.glb')

  // Generate random coin positions - separated from creatures
  useEffect(() => {
    scene.background = new THREE.Color("#8bc34a")

    // Generate random coin positions away from the origin where player spawns
    const newCoins: [number, number, number][] = []
    for (let i = 0; i < 20; i++) {
      let x: number, z: number
      // Make sure coins are somewhat distributed and not too close to center
      do {
        x = (Math.random() - 0.5) * 40
        z = (Math.random() - 0.5) * 40
      } while (Math.sqrt(x*x + z*z) < 5); // Keep coins away from player spawn point
      
      newCoins.push([x, 0.75, z]) // Position at y=0.75 for better visibility
    }
    setCoins(newCoins)
  }, [scene])

  return (
    <>
      <fog attach="fog" args={["#8bc34a", 30, 50]} />

      {/* Ground - improved with thicker collider and better physics */}
      <RigidBody type="fixed" friction={1} restitution={0}>
        {/* Visible ground plane */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, 0]}>
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial color="#4b7d2f" />
        </mesh>
        {/* Invisible collision box below to prevent falling through */}
        <mesh position={[0, -0.5, 0]} visible={false}>
          <boxGeometry args={[100, 1, 100]} />
          <meshStandardMaterial color="red" transparent opacity={0} />
        </mesh>
      </RigidBody>

      {/* Trees using the loaded GLB model */}
      {Array.from({ length: 50 }).map((_, i) => {
        const x = (Math.random() - 0.5) * 80
        const z = (Math.random() - 0.5) * 80
        const scale = Math.random() * 0.5 + 0.8
        const rotation = Math.random() * Math.PI * 2

        // Clone the tree for each instance
        const treeClone = treeScene.clone()
        
        // Make sure the tree casts shadows
        treeClone.traverse((node) => {
          if (node instanceof THREE.Mesh) {
            node.castShadow = true
            node.receiveShadow = true
          }
        })

        return (
          <group 
            key={i} 
            position={[x, 0, z]} 
            scale={[scale, scale, scale]}
            rotation={[0, rotation, 0]}
          >
            <primitive object={treeClone} />
          </group>
        )
      })}

      {/* Player */}
      <Player />

      {/* Coins */}
      {coins.map((position, i) => (
        <Coin key={i} position={position} />
      ))}

      {/* Creatures - placed away from coins */}
      {Array.from({ length: 10 }).map((_, i) => {
        // Position creatures in a different area than coins
        const angle = Math.random() * Math.PI * 2
        const radius = 10 + Math.random() * 15
        const x = Math.cos(angle) * radius
        const z = Math.sin(angle) * radius
        return <Creature key={i} position={[x, 0.5, z]} />
      })}
    </>
  )
}

// Preload the tree model for better performance
useGLTF.preload('/decorative_tree.glb')
