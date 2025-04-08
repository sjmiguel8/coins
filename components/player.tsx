"use client"

import { useRef, useEffect, useMemo } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { useKeyboardControls, KeyboardControls } from "@react-three/drei"
import { RigidBody, CapsuleCollider, type RapierRigidBody, useRapier } from "@react-three/rapier"
import * as THREE from "three"
import { useGameContext, GameProvider } from "./game-context"

// Define proper types
type Controls = {
  forward: boolean
  backward: boolean
  left: boolean
  right: boolean
  jump: boolean
  scene1: boolean
  scene2: boolean
  scene3: boolean
}

export default function Game() {
  return (
    <GameProvider>
      <KeyboardControls map={[
        { name: "forward", keys: ["ArrowUp", "KeyW"] },
        { name: "backward", keys: ["ArrowDown", "KeyS"] },
        { name: "left", keys: ["ArrowLeft", "KeyA"] },
        { name: "right", keys: ["ArrowRight", "KeyD"] },
        { name: "jump", keys: ["Space"] },
        { name: "scene1", keys: ["Digit1"] },
        { name: "scene2", keys: ["Digit2"] },
        { name: "scene3", keys: ["Digit3"] }
      ]}>
        <Player />
      </KeyboardControls>
    </GameProvider>
  )
}

function Player() {
  const playerRef = useRef<RapierRigidBody>(null)
  const [, getKeys] = useKeyboardControls<keyof Controls>()
  const { camera } = useThree()
  const { world } = useRapier()
  const { changeScene } = useGameContext() // Make sure this hook exists and is properly exported

  // Set up camera to follow player
  useEffect(() => {
    camera.position.set(0, 3, 5)
    camera.lookAt(0, 0, 0)
  }, [camera])

  useFrame((state, delta) => {
    if (!playerRef.current) return

    const { forward, backward, left, right, jump, scene1, scene2, scene3 } = getKeys()

    // Scene switching
    if (scene1) changeScene("forest")
    if (scene2) changeScene("home")
    if (scene3) changeScene("store")

    // Movement
    const impulse = { x: 0, y: 0, z: 0 }
    const torque = { x: 0, y: 0, z: 0 }

    const impulseStrength = 0.6 * delta
    const torqueStrength = 0.2 * delta

    if (forward) {
      impulse.z -= impulseStrength
      torque.x -= torqueStrength
    }

    if (backward) {
      impulse.z += impulseStrength
      torque.x += torqueStrength
    }

    if (right) {
      impulse.x += impulseStrength
      torque.z -= torqueStrength
    }

    if (left) {
      impulse.x -= impulseStrength
      torque.z += torqueStrength
    }

    // Apply movement
    playerRef.current.applyImpulse({ x: impulse.x, y: impulse.y, z: impulse.z }, true)
    playerRef.current.applyTorqueImpulse(torque, true)

    // Jump
    if (jump) {
      const position = playerRef.current.translation()
      position.y -= 0.31
      const ray = world.castRay(
        { x: position.x, y: position.y, z: position.z },
        { x: 0, y: -1, z: 0 },
        0.15
      )

      if (ray && ray.distance < 0.15) {
        playerRef.current.applyImpulse({ x: 0, y: 0.5, z: 0 }, true)
      }
    }

    // Camera follow
    const position = playerRef.current.translation()
    const cameraPosition = new THREE.Vector3()
    cameraPosition.copy(position)
    cameraPosition.z += 5
    cameraPosition.y += 3

    const cameraTarget = new THREE.Vector3()
    cameraTarget.copy(position)
    cameraTarget.y += 0.25

    state.camera.position.lerp(cameraPosition, 5 * delta)
    state.camera.lookAt(cameraTarget)
  })

  return (
    <RigidBody
      ref={playerRef}
      colliders={false}
      position={[0, 1, 0]}
      friction={1}
      linearDamping={0.5}
      angularDamping={0.5}
      enabledRotations={[false, false, false]}
    >
      <CapsuleCollider args={[0.5, 0.5]} />
      <mesh castShadow>
        <capsuleGeometry args={[0.5, 1, 4, 8]} />
        <meshStandardMaterial color="#ff8800" />
      </mesh>
      <mesh position={[0, 0.5, -0.5]}>
        <boxGeometry args={[0.5, 0.2, 0.1]} />
        <meshStandardMaterial color="black" />
      </mesh>
    </RigidBody>
  )
}
