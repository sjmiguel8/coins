"use client"

import { useEffect, useMemo } from "react"
import { useThree } from "@react-three/fiber"
import { RigidBody } from "@react-three/rapier"
import { useGLTF } from "@react-three/drei"
import Player from "../player"
import * as THREE from "three"
import CameraControls from "../CameraControls" // Import CameraControls
import { Mesh, ShaderMaterial, DoubleSide } from 'three';

export default function HomeScene() {
  const { scene } = useThree()
  
  // Load the sky castle model
  const { scene: skyCastleScene } = useGLTF('/skycastle.glb')
  
  useEffect(() => {
    scene.background = new THREE.Color("#222233")
  }, [scene])

  const groundMaterial = useMemo(() => {
    return new ShaderMaterial({
      vertexShader: `
        varying vec3 vPosition;
        void main() {
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vPosition;
        void main() {
          vec3 color1 = vec3(0.2, 0.2, 0.5); // Dark blue
          vec3 color2 = vec3(0.5, 0.5, 0.8); // Light blue
          vec3 color = mix(color1, color2, vPosition.y / 20.0 + 0.5);
          gl_FragColor = vec4(color, 1.0);
        }
      `,
      side: DoubleSide,
    });
  }, []);
  
  return (
    <>
      <CameraControls /> {/* Add CameraControls here */}
      <fog attach="fog" args={["#222233", 30, 50]} />
      <ambientLight intensity={0.8} />
      <directionalLight position={[10, 10, 10]} intensity={1} castShadow />

      {/* Ground plane for physics */}
      <RigidBody type="fixed" friction={1} restitution={0}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, 0]}>
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial transparent opacity={0} />
        </mesh>
      </RigidBody>
      
      {/* Gradient Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -0.5, 0]} material={groundMaterial}>
        <planeGeometry args={[100, 100]} />
      </mesh>

      {/* Visual ground model - no physics */}
      <primitive 
        object={skyCastleScene.clone()} 
        position={[1, -10, 1]} // Adjust position
        scale={[0.4, 0.4, 0.4]} // Adjust scale to ensure proper rendering
      />

      {/* House (keep existing house) */}
      <group position={[0, 0.5, -10]}>
        {/* Main house structure */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[8, 4, 6]} />
          <meshStandardMaterial color="#e8c59c" />
        </mesh>
        
        {/* Roof */}
        <mesh position={[0, 3, 0]} castShadow>
          <coneGeometry args={[6, 3, 4]} />
          <meshStandardMaterial color="#8d6e63" />
        </mesh>
        
        {/* Door */}
        <mesh position={[0, -0.5, 3.01]} castShadow>
          <boxGeometry args={[1.5, 3, 0.1]} />
          <meshStandardMaterial color="#5d4037" />
        </mesh>
        
        {/* Windows */}
        <mesh position={[-2.5, 0.5, 3.01]} castShadow>
          <boxGeometry args={[1, 1, 0.1]} />
          <meshStandardMaterial color="#b3e5fc" />
        </mesh>
        
        <mesh position={[2.5, 0.5, 3.01]} castShadow>
          <boxGeometry args={[1, 1, 0.1]} />
          <meshStandardMaterial color="#b3e5fc" />
        </mesh>
        
        {/* Chimney */}
        <mesh position={[3, 3.5, -2]} castShadow>
          <boxGeometry args={[1, 3, 1]} />
          <meshStandardMaterial color="#8d6e63" />
        </mesh>
      </group>
      
      {/* Player */}
      <Player startPosition={[0, 1.5, 0]} />
    </>
  )
}

useGLTF.preload('/skycastle.glb')
