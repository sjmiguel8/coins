"use client"

import { useEffect, useMemo, useState } from "react"
import { useThree } from "@react-three/fiber"
import { RigidBody } from "@react-three/rapier"
import { useGLTF } from "@react-three/drei"
import Player, { PlayerProps } from "../player"
import Creature from "../creature"
import * as THREE from "three"
import NavigationSystem from "../NavigationSystem" // Add this
import { useGameContext } from "../game-context";
import { useCoinSystem } from "../CoinSystem";
import { CoinComponent } from "../CoinSystem";

export default function ForestScene() {
  const { scene } = useThree()
  // Use useState to store coin positions
  const [meatPositions, setMeatPositions] = useState<[number, number, number][]>([])
  const { setCoinCount } = useGameContext()
  const { addCoin } = useCoinSystem();

  // Load forest ground model
  const { scene: forestGroundScene } = useGLTF('/low_poly_forest.glb') // Changed to the low poly forest
  const { scene: treeScene } = useGLTF('/decorative_tree.glb')

  useEffect(() => {
    scene.background = new THREE.Color("#222233")
  }, []) // Empty dependency array to run only once

  useEffect(() => {
    const handleMeatDrop = (event: CustomEvent<{ position: [number, number, number]; attacker: any }>) => {
      setMeatPositions((prevMeatPositions) => [...prevMeatPositions, event.detail.position]);
    };

    window.addEventListener('meat-drop', handleMeatDrop as EventListener);

    return () => {
      window.removeEventListener('meat-drop', handleMeatDrop as EventListener);
    };
  }, []);

  const treePositions = useMemo(() => {
    const positions: [number, number, number][] = [];
    for (let i = 0; i < 20; i++) {
      const x = (Math.random() - 0.5) * 80;
      const z = (Math.random() - 0.5) * 80;
      positions.push([x, 0, z]);
    }
    return positions;
  }, []);

  // Define player props correctly
  const playerProps: PlayerProps = {
    position: [0, 1.5, 0],
    cameraLock: false,
    userData: { isPlayer: true },
    onReady: () => {
      console.log("Player is ready");
    },
  };


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
            <primitive
              object={treeScene.clone()}
              scale={[1, 1, 1]}
              position={[0, 0, 0]}
              castShadow
            />
          </group>
        )
      })}
      {/* Coins */}
      {Array.from({ length: 20 }).map((_, i) => {
        const x = (Math.random() - 0.5) * 40
        const z = (Math.random() - 0.5) * 40
        return <CoinComponent key={`forest-coin-${i}`} id={`forest-coin-${i}`} position={[x, 1, z]} />
      })}

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

      {/* Player component */}
      <Player {...playerProps} />
    </>
  )
}

useGLTF.preload('/low_poly_forest.glb') // Changed to the low poly forest