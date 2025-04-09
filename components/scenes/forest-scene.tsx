"use client"

import { useEffect, useState, useRef, useMemo } from "react"
import { useThree } from "@react-three/fiber"
import { RigidBody } from "@react-three/rapier"
import { useGLTF, PerspectiveCamera } from "@react-three/drei"
import Player from "../player"
import Coin from "../coin"
import Creature from "../creature"
import * as THREE from "three"
import NavigationSystem from "../NavigationSystem" // Add this
import { MeshStandardMaterial, ShaderMaterial, DoubleSide } from 'three';

export default function ForestScene() {
  const { scene } = useThree()
  // Use useRef to store coin positions and initialize it
  const coinsRef = useRef<[number, number, number][]>([])
  const [meatPositions, setMeatPositions] = useState<[number, number, number][]>([])

  // Load forest ground model
  const { scene: forestGroundScene } = useGLTF('/low_poly_forest.glb') // Changed to the low poly forest
  const { scene: treeScene } = useGLTF('/decorative_tree.glb')

  useEffect(() => {
    scene.background = new THREE.Color("#222233")

    // Generate random coin positions
    const newCoins: [number, number, number][] = []
    for (let i = 0; i < 20; i++) {
      const x = (Math.random() - 0.5) * 40
      const z = (Math.random() - 0.5) * 40
      newCoins.push([x, 1, z])
    }
    // Assign new coins to the ref
    coinsRef.current = newCoins
  }, []) // Empty dependency array to run only once

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
          vec3 color1 = vec3(0.1, 0.3, 0.1); // Dark green
          vec3 color2 = vec3(0.4, 0.7, 0.4); // Light green
          vec3 color = mix(color1, color2, vPosition.y / 20.0 + 0.5);
          gl_FragColor = vec4(color, 1.0);
        }
      `,
      side: DoubleSide,
    });
  }, []);

  useEffect(() => {
    const handleCoinDrop = (event: CustomEvent<[number, number, number]>) => {
      // Add the new coin position to the ref
      coinsRef.current = [...coinsRef.current, event.detail];
    };

    const handleMeatDrop = (event: CustomEvent<{position: [number, number, number], attacker: any}>) => {
      setMeatPositions((prevMeatPositions) => [...prevMeatPositions, event.detail.position]);
    };

    window.addEventListener('coin-drop', handleCoinDrop as EventListener);
    window.addEventListener('meat-drop', handleMeatDrop as EventListener);

    return () => {
      window.removeEventListener('coin-drop', handleCoinDrop as EventListener);
      window.removeEventListener('meat-drop', handleMeatDrop as EventListener);
    };
  }, []);

  const [treePositions] = useState(() => {
    const positions: [number, number, number][] = [];
    for (let i = 0; i < 20; i++) {
      const x = (Math.random() - 0.5) * 80;
      const z = (Math.random() - 0.5) * 80;
      positions.push([x, 0, z]);
    }
    return positions;
  });

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

      {/* Forest Ground Model */}
      <primitive
        object={forestGroundScene.clone()}
        position={[0, 3.6, 0]}
        scale={[1, 1, 0.8]}
        receiveShadow
      />

      {/* Trees - reduced number */}
      {treePositions.map((position, i) => {
        const scale = 0.8 + Math.random() * 0.4
        const rotation = Math.random() * Math.PI * 2

        return (
          <group
            key={i}
            position={position}
            scale={[scale, scale, scale]}
            rotation={[0, rotation, 0]}
          >
            <primitive object={treeScene.clone()} />
          </group>
        )
      })}

      {/* Player - position slightly higher to avoid clipping */}
      <Player startPosition={[0, 1.5, 0]} />

      {/* Coins */}
      {coinsRef.current && coinsRef.current.map((position, i) => (
        <Coin key={i} position={position} />
      ))}

      {/* Meats */}
      {meatPositions.map((position, i) => (
        <mesh key={i} position={position}>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshStandardMaterial color="red" />
        </mesh>
      ))}

      {/* Creatures */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = Math.random() * Math.PI * 2
        const radius = 10 + Math.random() * 15
        const x = Math.cos(angle) * radius
        const z = Math.sin(angle) * radius
        return <Creature key={i} position={[x, 0.5, z]} />
      })}
    </>
  )
}

useGLTF.preload('/decorative_tree.glb')
useGLTF.preload('/low_poly_forest.glb') // Changed to the low poly forest