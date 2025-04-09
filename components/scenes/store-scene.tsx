"use client"

import { useEffect, useState, useRef } from "react"
import { useThree } from "@react-three/fiber"
import { RigidBody } from "@react-three/rapier"
import { useGLTF } from "@react-three/drei"
import Player from "../player"
import * as THREE from "three"
import CameraControls from "../CameraControls" // Import CameraControls
import { Mesh, ShaderMaterial, DoubleSide } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export default function StoreScene() {
  const { scene } = useThree()
  const medievalCampScene = useGLTF('/medieval_camp.glb').scene
  const [duckModel, setDuckModel] = useState<THREE.Group | null>(null);
  const [showStore, setShowStore] = useState(false);
  const duckRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    const loader = new GLTFLoader();
    loader.load(
      '/travelers_duck.glb',
      (gltf) => {
        const model = gltf.scene;
        model.traverse((node: any) => {
          if (node.isMesh) {
            node.castShadow = true;
            node.receiveShadow = true;
          }
        });
        setDuckModel(model);
        scene.add(model);
      },
      undefined,
      (error) => {
        console.error('An error happened loading the GLTF:', error);
      }
    );
  }, [scene]);

  const handleDuckClick = () => {
    setShowStore(true);
  };

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
      
      {/* Duck Model */}
      {duckModel && (
        <mesh 
          ref={duckRef}
          position={[5, 1, -5]} 
          scale={[2, 2, 2]}
          onClick={handleDuckClick}
          castShadow
          receiveShadow
        >
          <primitive object={duckModel} />
        </mesh>
      )}

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

      {/* Shop Interface (Conditionally Rendered) */}
      {showStore && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="bg-white p-8 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Duck's Shop</h2>
            <p>Welcome to my shop! What would you like to buy?</p>
            <button onClick={() => setShowStore(false)} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4">
              Close Shop
            </button>
          </div>
        </div>
      )}
    </>
  )
}

useGLTF.preload('/medieval_camp.glb')
useGLTF.preload('/travelers_duck.glb')
