"use client"

import { useEffect, useState, useRef } from "react"
import { useThree } from "@react-three/fiber"
import { RigidBody } from "@react-three/rapier"
import { useGLTF } from "@react-three/drei"
import Player from "../player"
import * as THREE from "three"
import CameraControls from "../CameraControls" 
import NavigationSystem from "../NavigationSystem" // Add this
import { useGameContext } from "../game-context"

// Create a new component for the shop UI that's rendered outside the canvas
export function DuckShop({ onClose }: { onClose: () => void }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white p-8 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Duck's Shop</h2>
        <p>Welcome to my shop! What would you like to buy?</p>
        <button 
          onClick={onClose} 
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4"
        >
          Close Shop
        </button>
      </div>
    </div>
  )
}

export default function StoreScene() {
  const { scene } = useThree()
  const { addCoins } = useGameContext()
  const [showShop, setShowShop] = useState(false)
  const duckRef = useRef<THREE.Group>(null)
  
  // Load models
  const { scene: medievalCampScene } = useGLTF('/medieval_camp.glb')
  const { scene: duckScene } = useGLTF('/travelers_duck.glb')

  useEffect(() => {
    scene.background = new THREE.Color("#97809d")
  }, [scene])
  
  // Handler for duck clicks that will be called from outside the component
  const handleDuckClick = () => {
    // Show shop UI (This state will be checked from parent)
    setShowShop(true)
    // Also add a coin for testing
    addCoins(1)
  }
  
  return (
    <>
      <CameraControls />
      <NavigationSystem /> {/* Add this line */}
      <fog attach="fog" args={["#97809d", 30, 50]} />
      <ambientLight intensity={0.7} />
      <directionalLight position={[10, 10, 10]} intensity={1} castShadow />

      {/* Ground plane for physics */}
      <RigidBody type="fixed" friction={1} restitution={0}>
        <mesh 
          rotation={[-Math.PI / 2, 0, 0]}
          receiveShadow 
          position={[0, 0, 0]}
          userData={{ isGround: true }} // Add this for click detection
        >
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial transparent opacity={0} />
        </mesh>
      </RigidBody>
      
      {/* Duck - Using a single duck with proper mesh and click handling */}
      <group 
        ref={duckRef}
        position={[5, 0, -5]} 
        scale={[5, 5, 5]}
        rotation={[0, Math.PI, 0]}
        onPointerDown={(e) => {
          e.stopPropagation() // Prevent event from bubbling up
          handleDuckClick()
        }}
        onClick={handleDuckClick}
      >
        <primitive object={duckScene.clone()} castShadow receiveShadow />
      </group>

      {/* Visual ground model - no physics */}
      <primitive 
        object={medievalCampScene.clone()} 
        position={[0, -1, 0]} 
        scale={[5, 5, 5]} 
        rotation={[0, Math.PI, 0]} 
      />

      {/* Store shop front */}
      <group position={[0, 0, -10]}>
        <mesh receiveShadow castShadow>
          <boxGeometry args={[10, 5, 0.5]} />
          <meshStandardMaterial color="#a67c52" />
        </mesh>
        <mesh position={[0, 2.5, 0.5]} receiveShadow castShadow>
          <boxGeometry args={[10, 1, 1]} />
          <meshStandardMaterial color="#8d6e63" />
        </mesh>
        <mesh position={[0, -1, 6]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[12, 12]} />
          <meshStandardMaterial color="#a77c56" />
        </mesh>
        
        {/* Sign */}
        <mesh position={[0, 3.5, 0.5]} receiveShadow castShadow>
          <boxGeometry args={[4, 1, 0.2]} />
          <meshStandardMaterial color="#5d4037" />
        </mesh>
        <mesh position={[0, 3.5, 0.7]} receiveShadow castShadow>
          <boxGeometry args={[3.8, 0.8, 0.1]} />
          <meshStandardMaterial color="#8d6e63" />
        </mesh>
      </group>

      {/* Player */}
      <Player startPosition={[0, 1.5, 0]} />
      
      {/* We export the shop state so the parent can render UI outside the canvas */}
      <ShopStateExporter isOpen={showShop} setIsOpen={setShowShop} />
    </>
  )
}

// This component is a hack to export state from the 3D scene to the outside world
function ShopStateExporter({ 
  isOpen, 
  setIsOpen 
}: { 
  isOpen: boolean; 
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>> 
}) {
  // Use a global window property to expose the state
  useEffect(() => {
    // @ts-ignore - Adding custom property to window
    window.duckShopOpen = isOpen;
    // @ts-ignore - Adding custom property to window
    window.closeDuckShop = () => setIsOpen(false);
  }, [isOpen, setIsOpen]);
  
  return null;
}

useGLTF.preload('/medieval_camp.glb')
useGLTF.preload('/travelers_duck.glb')
