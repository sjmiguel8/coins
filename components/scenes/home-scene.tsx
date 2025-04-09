"use client"

import { useEffect, useMemo } from "react"
import { useThree } from "@react-three/fiber"
import { RigidBody } from "@react-three/rapier"
import { useGLTF } from "@react-three/drei"
import Player from "../player"
import * as THREE from "three"
import NavigationSystem from "../NavigationSystem" // Add this
import { Mesh, ShaderMaterial, DoubleSide } from 'three';

export default function HomeScene() {
  const { scene, camera, controls } = useThree()
  
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
      <NavigationSystem /> {/* Add this line */}
      <fog attach="fog" args={["#222233", 30, 50]} />
      <ambientLight intensity={0.8} />
      <directionalLight position={[10, 10, 10]} intensity={1} castShadow />

      {/* Ground plane for physics */}
      <RigidBody type="fixed" friction={1} restitution={0}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, 0]} userData={{ isGround: true }}> {/* Add this for click detection */}
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
        position={[1, -10, -1]}
        scale={[0.4, 0.4, 0.4]} // Adjust scale
        rotation={[0, Math.PI, 0]}
      />

     
      
      {/* Player - position slightly higher to avoid clipping */}
      <Player startPosition={[4, 1.5, -12]} />
    </>
  )
}

useGLTF.preload('/skycastle.glb')
