"use client"

import { useEffect } from "react"
import { useThree } from "@react-three/fiber"
import { RigidBody } from "@react-three/rapier"
import { Text3D, Center } from "@react-three/drei"
import Player from "../player"
import * as THREE from "three"
import { useGameContext } from "../game-context"

// Store items with their prices
const storeItems = [
  { name: "Red Hat", price: 5, color: "#ff0000" },
  { name: "Blue Cape", price: 10, color: "#0000ff" },
  { name: "Green Boots", price: 7, color: "#00ff00" },
  { name: "Gold Shield", price: 15, color: "#ffd700" },
]

export default function StoreScene() {
  const { scene } = useThree()
  const { coins, addCoins, addToInventory } = useGameContext()

  useEffect(() => {
    scene.background = new THREE.Color("#673AB7")
  }, [scene])

  const handlePurchase = (itemName: string, price: number) => {
    if (coins >= price) {
      addCoins(-price)
      addToInventory(itemName)
      alert(`Purchased ${itemName}!`)
    } else {
      alert("Not enough coins!")
    }
  }

  return (
    <>
      <fog attach="fog" args={["#673AB7", 30, 50]} />

      {/* Ground */}
      <RigidBody type="fixed" colliders="trimesh">
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial color="#9575CD" />
        </mesh>
      </RigidBody>

      {/* Store building */}
      <group position={[0, 0, -10]}>
        {/* Floor */}
        <RigidBody type="fixed" colliders="cuboid">
          <mesh position={[0, 0.1, 0]} receiveShadow>
            <boxGeometry args={[20, 0.2, 20]} />
            <meshStandardMaterial color="#7E57C2" />
          </mesh>
        </RigidBody>

        {/* Walls */}
        <RigidBody type="fixed" colliders="cuboid">
          {/* Back wall */}
          <mesh position={[0, 3, -10]} castShadow receiveShadow>
            <boxGeometry args={[20, 6, 0.2]} />
            <meshStandardMaterial color="#B39DDB" />
          </mesh>

          {/* Left wall */}
          <mesh position={[-10, 3, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.2, 6, 20]} />
            <meshStandardMaterial color="#B39DDB" />
          </mesh>

          {/* Right wall */}
          <mesh position={[10, 3, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.2, 6, 20]} />
            <meshStandardMaterial color="#B39DDB" />
          </mesh>

          {/* Front wall with entrance */}
          <mesh position={[-7, 3, 10]} castShadow receiveShadow>
            <boxGeometry args={[6, 6, 0.2]} />
            <meshStandardMaterial color="#B39DDB" />
          </mesh>

          <mesh position={[7, 3, 10]} castShadow receiveShadow>
            <boxGeometry args={[6, 6, 0.2]} />
            <meshStandardMaterial color="#B39DDB" />
          </mesh>

          <mesh position={[0, 5, 10]} castShadow receiveShadow>
            <boxGeometry args={[8, 2, 0.2]} />
            <meshStandardMaterial color="#B39DDB" />
          </mesh>
        </RigidBody>

        {/* Roof */}
        <RigidBody type="fixed" colliders="hull">
          <mesh position={[0, 6.5, 0]} rotation={[0, 0, 0]} castShadow>
            <boxGeometry args={[21, 0.5, 21]} />
            <meshStandardMaterial color="#5E35B1" />
          </mesh>
        </RigidBody>

        {/* Store sign */}
        <group position={[0, 8, 0]}>
          <Center>
            <Text3D font="/fonts/helvetiker_bold.typeface.json" size={2} height={0.2} position={[0, 0, 0]}>
              STORE
              <meshStandardMaterial color="#FFC107" />
            </Text3D>
          </Center>
        </group>

        {/* Store items display */}
        {storeItems.map((item, index) => {
          const x = (index - 1.5) * 4
          return (
            <group key={index} position={[x, 1, -5]}>
              {/* Item pedestal */}
              <RigidBody type="fixed" colliders="cuboid">
                <mesh position={[0, 0, 0]} castShadow>
                  <cylinderGeometry args={[0.5, 0.5, 2, 16]} />
                  <meshStandardMaterial color="#D1C4E9" />
                </mesh>

                {/* Item display (simplified as colored sphere) */}
                <mesh position={[0, 1.5, 0]} castShadow>
                  <sphereGeometry args={[0.7, 16, 16]} />
                  <meshStandardMaterial color={item.color} />
                </mesh>

                {/* Item name and price */}
                <group position={[0, 0.5, 1]}>
                  <Center>
                    <Text3D
                      font="/fonts/helvetiker_regular.typeface.json"
                      size={0.3}
                      height={0.05}
                      position={[0, 0, 0]}
                    >
                      {item.name}
                      <meshStandardMaterial color="#FFFFFF" />
                    </Text3D>
                  </Center>
                </group>

                <group position={[0, 0, 1]}>
                  <Center>
                    <Text3D
                      font="/fonts/helvetiker_regular.typeface.json"
                      size={0.3}
                      height={0.05}
                      position={[0, 0, 0]}
                    >
                      {`${item.price} coins`}
                      <meshStandardMaterial color="#FFC107" />
                    </Text3D>
                  </Center>
                </group>
              </RigidBody>
            </group>
          )
        })}
      </group>

      {/* Player */}
      <Player />
    </>
  )
}
