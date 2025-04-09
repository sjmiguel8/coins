"use client"

import { useEffect } from "react"
import { useThree } from "@react-three/fiber"
import { RigidBody } from "@react-three/rapier"
import { useGLTF } from "@react-three/drei"
import Player from "../player"
import * as THREE from "three"
import CameraControls from "../CameraControls" // Import CameraControls

export default function StoreScene() {
  const { scene } = useThree()
  
  // Load the medieval camp model
  const { scene: medievalCampScene } = useGLTF('/medieval_camp.glb')
  
  useEffect(() => {
    scene.background = new THREE.Color("#97809d")
  }, [scene])
  
  return (
    <>
      <CameraControls /> {/* Add CameraControls here */}
      <fog attach="fog" args={["#97809d", 30, 50]} />
      <ambientLight intensity={0.7} />
      <directionalLight position={[10, 10, 10]} intensity={1} castShadow />

      {/* Ground plane for physics */}
      <RigidBody type="fixed" friction={1} restitution={0}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, 0]}>
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial transparent opacity={0} />
        </mesh>
      </RigidBody>
      
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
    </>
  )
}

useGLTF.preload('/medieval_camp.glb')
