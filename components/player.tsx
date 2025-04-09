"use client"

import { useRef, useEffect } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { useKeyboardControls } from "@react-three/drei"
import { RigidBody, CapsuleCollider, type RapierRigidBody } from "@react-three/rapier"
import * as THREE from "three"
import { useGameContext } from "./game-context"

// Define proper types
enum Controls {
  forward = 'forward',
  backward = 'backward',
  left = 'left',
  right = 'right',
  jump = 'jump',
  scene1 = 'scene1',
  scene2 = 'scene2',
  scene3 = 'scene3'
}

interface PlayerProps {
  startPosition?: [number, number, number]
}

// Export the Player component directly
export default function Player({ startPosition = [0, 1.5, 0] }: PlayerProps) {
  const playerRef = useRef<RapierRigidBody>(null)
  const playerGroupRef = useRef<THREE.Group>(null)
  const [, getKeys] = useKeyboardControls<Controls>()
  const { camera, gl, scene, controls } = useThree()
  const { changeScene } = useGameContext()
  
  // Store the last movement direction for smooth rotation
  const lastMovementDirection = useRef(new THREE.Vector3(0, 0, -1))
  
  // Track current velocity for smooth damping
  const currentVelocity = useRef({ x: 0, y: 0, z: 0 })
  
  // Prevent key input processing during scene transitions
  const isTransitioning = useRef(false)

  useEffect(() => {
    // Position player safely above the ground
    if (playerRef.current) {
      playerRef.current.setTranslation({ 
        x: startPosition[0], 
        y: startPosition[1], 
        z: startPosition[2] 
      }, true)
      
      playerRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true)
      playerRef.current.wakeUp()
    }

    // Position camera
    camera.position.set(startPosition[0], startPosition[1] + 6, startPosition[2] + 10);
  }, [camera, startPosition])

  useFrame((state, delta) => {
    if (!playerRef.current || !playerGroupRef.current || isTransitioning.current) return
    
    // Clamp delta to prevent large jumps if frame rate drops
    const clampedDelta = Math.min(delta, 0.1)

    // Get current keyboard state
    const keys = getKeys()
    
    // Scene switching with debounce
    if (keys.scene1 || keys.scene2 || keys.scene3) {
      isTransitioning.current = true
      
      if (keys.scene1) changeScene("forest")
      else if (keys.scene2) changeScene("home")
      else if (keys.scene3) changeScene("store")
      
      setTimeout(() => {
        isTransitioning.current = false
      }, 100)
    }

    // Fall protection - if player falls below a certain threshold, reset position
    const position = playerRef.current.translation()
    if (position.y < -10) {
      playerRef.current.setTranslation({ 
        x: startPosition[0], 
        y: startPosition[1], 
        z: startPosition[2] 
      }, true)
      playerRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true)
      return;
    }

    // FIXED MOVEMENT: Use more refined velocity control for smoother movement
    const moveSpeed = 5.0 // Units per second
    const rigidBodyVelocity = playerRef.current.linvel()
    
    // Create target velocity based on keypresses
    const targetVelocity = { 
      x: 0, 
      y: rigidBodyVelocity.y, // Preserve vertical velocity for jumps
      z: 0 
    }
    
    // Movement direction vector for rotation calculation
    const movementDirection = new THREE.Vector3(0, 0, 0)
    
    // Apply movement based on key presses
    if (keys.forward) {
      targetVelocity.z = -moveSpeed
      movementDirection.z -= 1
    }
    if (keys.backward) {
      targetVelocity.z = moveSpeed
      movementDirection.z += 1
    }
    if (keys.left) {
      targetVelocity.x = -moveSpeed
      movementDirection.x -= 1
    }
    if (keys.right) {
      targetVelocity.x = moveSpeed
      movementDirection.x += 1
    }

    // Normalize diagonal movement
    if ((keys.forward || keys.backward) && (keys.left || keys.right)) {
      const length = Math.sqrt(targetVelocity.x * targetVelocity.x + targetVelocity.z * targetVelocity.z)
      if (length > 0) {
        targetVelocity.x = (targetVelocity.x / length) * moveSpeed
        targetVelocity.z = (targetVelocity.z / length) * moveSpeed
      }
    }

    // Smooth velocity transitions (acceleration and deceleration)
    const smoothFactor = 10.0 * clampedDelta // Higher values = faster response
    currentVelocity.current.x = THREE.MathUtils.lerp(
      currentVelocity.current.x, 
      targetVelocity.x, 
      smoothFactor
    )
    currentVelocity.current.z = THREE.MathUtils.lerp(
      currentVelocity.current.z, 
      targetVelocity.z, 
      smoothFactor
    )
    
    // Apply the smoothed velocity - only if we have a valid reference
    try {
      playerRef.current.setLinvel({
        x: currentVelocity.current.x,
        y: targetVelocity.y,
        z: currentVelocity.current.z
      }, true)
    } catch (e) {
      // Prevent any errors from breaking the game if physics object is removed
      console.warn("Could not set player velocity")
    }

    // Rotate player model to face movement direction
    if (movementDirection.lengthSq() > 0.01) {
      // Save non-zero direction for rotation
      lastMovementDirection.current.copy(movementDirection.normalize())
    }
    
    // Apply rotation smoothly - only if we're actually moving
    if ((Math.abs(currentVelocity.current.x) > 0.1 || Math.abs(currentVelocity.current.z) > 0.1) && 
        lastMovementDirection.current.lengthSq() > 0) {
      
      // Create target rotation
      const lookAt = new THREE.Matrix4()
      lookAt.lookAt(
        new THREE.Vector3(0, 0, 0),
        lastMovementDirection.current,
        new THREE.Vector3(0, 1, 0)
      )
      const targetQuaternion = new THREE.Quaternion()
      targetQuaternion.setFromRotationMatrix(lookAt)
      
      // Smoothly interpolate current rotation to target rotation
      const rotationSpeed = Math.min(1.0, 5.0 * clampedDelta) // Cap for stability
      playerGroupRef.current.quaternion.slerp(targetQuaternion, rotationSpeed)
    }

    // Jump - improved ground detection
    if (keys.jump) {
      const position = playerRef.current.translation()
      if (position.y < 1.1) {
        // Apply jump impulse only when grounded
        playerRef.current.setLinvel({
          x: currentVelocity.current.x,
          y: 10.0, // Jump force
          z: currentVelocity.current.z
        }, true)
      }
    }

    // Get current player position
    const playerPosition = playerRef.current.translation();
    
    // Calculate camera target position - always pointing at the player
    const cameraTarget = new THREE.Vector3(playerPosition.x, playerPosition.y + 1, playerPosition.z);
    
    // Update orbit controls target - smooth follow
    if (state.controls) {
      state.controls.target.copy(cameraTarget);
    }
  })

  return (
    <RigidBody
      ref={playerRef}
      colliders={false}
      position={startPosition}
      friction={0.2}
      linearDamping={4} 
      angularDamping={5}
      lockRotations
      type="dynamic"
      mass={1}
      restitution={0.1} // Add small restitution to help with bouncing
      gravityScale={1.5} // Increase gravity slightly for better grounding
    >
      <group ref={playerGroupRef}>
        <CapsuleCollider args={[0.5, 0.5]} friction={0.5} restitution={0} density={1.2} />
        <mesh castShadow userData={{ isPlayer: true }} scale={[0.8, 0.8, 0.8]}> {/* Adjust the scale here */}
          <capsuleGeometry args={[0.5, 1, 4, 8]} />
          <meshStandardMaterial color="#ff8800" />
        </mesh>
        {/* Face/front of player */}
        <mesh position={[0, 0.5, -0.5]}>
          <boxGeometry args={[0.5, 0.2, 0.1]} />
          <meshStandardMaterial color="black" />
        </mesh>
      </group>
    </RigidBody>
  )
}
