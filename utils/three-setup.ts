import * as THREE from 'three';
import { extend } from '@react-three/fiber';
import { OrbitControls, TransformControls } from 'three-stdlib';

// Extend Three.js with additional components
extend({ OrbitControls, TransformControls });

// This function can be called to ensure Three.js is properly initialized.
export function initializeThree() {
  // Additional initialization if needed
  console.log('Three.js initialized with extensions.');
  
  // Make sure JSX has access to the extended elements
  if (typeof window !== 'undefined') {
    window.__initialized = true;
  }
}

declare global {
  interface Window {
    __initialized: boolean;
  }
}

// If you have any custom shaders or extensions, you can add them here.
// For example:
// THREE.ShaderChunk['my_custom_shader'] = '...';

// Ensure that the THREE namespace is extended if needed.
// This is a placeholder; replace with actual extension logic if necessary.
// For example, if you were using a custom geometry:
// THREE.MyCustomGeometry = function() { ... };

