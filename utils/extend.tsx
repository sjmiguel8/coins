import { extend } from '@react-three/fiber'
import { OrbitControls, TransformControls } from 'three-stdlib'

// Extend THREE with additional components
extend({ OrbitControls, TransformControls })

// Define global JSX types for the extended components
declare global {
  namespace JSX {
    interface IntrinsicElements {
      orbitControls: any
      transformControls: any
    }
  }
}

export {}
