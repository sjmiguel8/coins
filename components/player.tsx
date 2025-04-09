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

// Export the Player component directly
export default function Player() {
  const playerRef = useRef<RapierRigidBody>(null)
  const playerGroupRef = useRef<THREE.Group>(null)
  const [, getKeys] = useKeyboardControls<Controls>()
  const { camera } = useThree()
  const { changeScene } = useGameContext()
  
  // Store the last movement direction for smooth rotation
  const lastMovementDirection = useRef(new THREE.Vector3(0, 0, -1))
  
  // Track current velocity for smooth damping
  const currentVelocity = useRef({ x: 0, y: 0, z: 0 })
  
  // Prevent key input processing during scene transitions
  const isTransitioning = useRef(false)

  // Set up camera to follow player and start player in a safe position above ground
  useEffect(() => {
    // Position player safely above the ground to prevent falling through
    if (playerRef.current) {
      // Start at a higher position to ensure player doesn't fall through ground
      playerRef.current.setTranslation({ x: 0, y: 1.5, z: 0 }, true)
      playerRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true) // Reset velocity
      playerRef.current.wakeUp() // Ensure physics are active
    }

    // Position camera
    camera.position.set(0, 3, 5)
    camera.lookAt(0, 0, 0)
  }, [camera])

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
      playerRef.current.setTranslation({ x: 0, y: 5, z: 0 }, true)
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

    // Calculate camera position with smooth follow
    const cameraPosition = new THREE.Vector3()
    cameraPosition.copy(position)
    cameraPosition.z += 5
    cameraPosition.y += 3
    
    // Camera look target
    const cameraTarget = new THREE.Vector3()
    cameraTarget.copy(position)
    cameraTarget.y += 0.25
    
    // Smooth camera movement
    const cameraSmoothFactor = 3 * clampedDelta
    state.camera.position.lerp(cameraPosition, cameraSmoothFactor)
    state.camera.lookAt(cameraTarget)
  })

  return (
    <RigidBody
      ref={playerRef}
      colliders={false}
      position={[0, 1.5, 0]} // Start higher above ground to prevent falling through
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
        <mesh castShadow userData={{ isPlayer: true }}>
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
