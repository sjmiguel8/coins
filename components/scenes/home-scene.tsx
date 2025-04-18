"use client"

import { useEffect, useMemo } from "react"
import { useThree } from "@react-three/fiber"
import { RigidBody } from "@react-three/rapier"
import { useGLTF } from "@react-three/drei"
import Player, { type PlayerProps } from "../player"
import * as THREE from "three"
import NavigationSystem from "../NavigationSystem"
import { Mesh, ShaderMaterial, DoubleSide, Vector3 } from 'three'
import Enemy from "../Enemy"
import { CoinComponent } from "../CoinSystem"
import HUD from "../../components/hud"
import CanvasHUD from '../CanvasHUD'
import { useHealthSystem } from "../HealthSystem"
// import { useCoinSystem } from "./coin-system"
import { extend } from "@react-three/fiber"

interface GroundProps {
  [key: string]: any;
}

const Ground: React.FC<GroundProps> = (props) => {
  const groundTexture = useMemo(() => {
    return new THREE.TextureLoader().load("/cozy-day/textures/big shapes Base Color_0.jpeg");
  }, []);

  return (
    <RigidBody type="fixed" rotation={[-Math.PI / 2, 0, 0]} {...props}>
      <mesh receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial
          attach="material"
          color="#ffffff"
          map={groundTexture}
          side={DoubleSide}
        />
      </mesh>
    </RigidBody>
  )
}

import { OrbitControls } from "@react-three/drei"

export default function HomeScene() {
  // This component is responsible for rendering the home scene
  const { scene, camera } = useThree() 


  useEffect(() => {
    console.log("Camera near:", camera.near, "far:", camera.far);
  }, [camera]);

  // Define player props correctly
  const playerProps: PlayerProps = {
    position: [-5, 1.5, -0],
    cameraLock: false,
    userData: { isPlayer: true },
    onReady: () => {
      console.log("Player is ready");
    }
  }
    
  // Load the sky castle model
  const { scene: skyCastleScene } = useGLTF("/cozy-day/source/catsu2 sketchfab version light.glb")
  
  useEffect(() => {
    // Set the background color
    scene.background = new THREE.Color("#97809d");
  }, [scene])
  
  const groundMaterial = useMemo(() => {
    const textureLoader = new THREE.TextureLoader();
    const gradient = textureLoader.load('/cozy-day/textures/floor n mattress Base Color_1.jpeg');
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

  const skyCastleTextures = useMemo(() => {
    const textureLoader = new THREE.TextureLoader();
    return {
      catsuBaseColor: textureLoader.load('/cozy-day/textures/catsu Base Color_5.jpeg'),
      detailsBaseColor: textureLoader.load('/cozy-day/textures/details Base Color_3.jpeg'),
    };
  }, []);

  useEffect(() => {
    if (skyCastleScene) {
      skyCastleScene.traverse((object: any) => {
        if (object.isMesh) {
          if (object.material) {
            object.material.map = skyCastleTextures.catsuBaseColor;
          }
        }
      });
    }
  }, [skyCastleScene, skyCastleTextures]);

  useGLTF.preload("/cozy-day/source/catsu2 sketchfab version light.glb")

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
        position={[1, 0, 0]}
        scale={[2, 2, 2]}
        rotation={[0, Math.PI, 0]}
        userData={{ isGround: true }} // Add this for click detection
      />
      
      {/* Player component */}
      <Player {...playerProps} />
      
      {/* Enemy instances */}
      <Enemy id="enemy-1" position={[5, 1, -5]} maxHealth={40} />
      <Enemy id="enemy-2" position={[-8, 1, -8]} maxHealth={60} />
      <Enemy id="enemy-3" position={[8, 1, -12]} maxHealth={80} />
      
      {/* Add some collectible coins */}
      <CoinComponent id="coin-1" position={[3, 1, -3]} />
      <CoinComponent id="coin-2" position={[-4, 1, -7]} />
      <CoinComponent id="coin-3" position={[7, 1, -9]} />
      <CoinComponent id="coin-4" position={[0, 1, -12]} value={5} />
      
      {/* Remove HUD from here as it's now handled in the Game component */}
      <CanvasHUD />
    </>
  )
}

