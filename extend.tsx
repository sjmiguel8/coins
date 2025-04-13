import { extend } from '@react-three/fiber'
import { OrbitControls, TransformControls } from 'three-stdlib'

extend({ OrbitControls, TransformControls })

declare global {
  namespace JSX {
    interface IntrinsicElements {
      orbitControls: any
      transformControls: any
    }
  }
}
