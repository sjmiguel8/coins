"use client"

import { useEffect, useMemo } from "react"
import { useThree } from "@react-three/fiber"
import { RigidBody } from "@react-three/rapier"
import { useGLTF } from "@react-three/drei"
import Player, { type PlayerProps } from "../player"
import * as THREE from "three"
import NavigationSystem from "../NavigationSystem" // Add this
import { Mesh, ShaderMaterial, DoubleSide, Vector3 } from 'three';

interface GroundProps {
  [key: string]: any;
}

const Ground: React.FC<GroundProps> = (props) => {
  return (
    <RigidBody type="fixed" rotation={[-Math.PI / 2, 0, 0]} {...props}>
      <mesh receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial transparent opacity={0} />
      </mesh>
    </RigidBody>
  )
}

export default function HomeScene() {
  // This component is responsible for rendering the home scene
  const { scene, camera, controls } = useThree() 

  // Define player props correctly
  const playerProps: PlayerProps = {
    position: [4, 1.5, -12],
    cameraLock: false,
    userData: { isPlayer: true },
    onReady: () => {
      console.log("Player is ready");
    }
  }
    
  // Load the sky castle model
  const { scene: skyCastleScene } = useGLTF('/camping_buscraft_ambience.glb')
  
  useEffect(() => {
    // Set the background color
    scene.background = new THREE.Color("#222233");
  }, [scene])
  
  const groundMaterial = useMemo(() => {
    const textureLoader = new THREE.TextureLoader();
    const gradient = textureLoader.load('/gradient.png');
    gradient.wrapS = gradient.wrapT = THREE.RepeatWrapping;
    gradient.repeat.set(10, 10);
    
    const material = new THREE.ShaderMaterial({
      uniforms: {
        gradient: { value: gradient },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        uniform sampler2D gradient;
        void main() {
          vec4 color = texture2D(gradient, vUv);
          gl_FragColor = color;
        }
      `,
      side: DoubleSide,
    });
    return material;
  }, []);

  useGLTF.preload("/camping_buscraft_ambience.glb");

  return (
    <>
      <NavigationSystem />
      <fog attach="fog" args={["#222233", 30, 50]} />
      <ambientLight intensity={0.8} />
      <directionalLight position={[10, 10, 10]} intensity={1} castShadow />

      {/* Ground plane for physics */}
      <Ground />

      {/* Visual ground model - no physics */}
      <primitive  
        object={skyCastleScene.clone()}
        position={[1, 0, -1]}
        scale={[1.2, 1.2, 1.2]}
        rotation={[0, Math.PI, 0]}
        userData={{ isGround: true }} // Add this for click detection
      />
      
      {/* Player component */}
      <Player {...playerProps} />
    </>
  )
}

