"use client"
import { GameContextProvider as GameProvider, useGameContext } from "@/components/game-context"
import Menu from '../components/Menu'
import HUD from '../components/hud'
import { Canvas } from '@react-three/fiber'
import { Physics } from '@react-three/rapier'
import ForestScene from "@/components/scenes/forest-scene"
import HomeScene from "@/components/scenes/home-scene"
import StoreScene from "@/components/scenes/store-scene"
import { Suspense, useState, useEffect, Component } from "react"
import { KeyboardControls } from '@react-three/drei'

class ErrorBoundary extends Component<{children: React.ReactNode, fallback: React.ReactNode}> {
  state = { hasError: false };
  
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  
  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// Define controls ahead of time
const controls = [
  { name: "forward", keys: ["ArrowUp", "KeyW"] },
  { name: "backward", keys: ["ArrowDown", "KeyS"] },
  { name: "left", keys: ["ArrowLeft", "KeyA"] },
  { name: "right", keys: ["ArrowRight", "KeyD"] },
  { name: "jump", keys: ["Space"] },
  { name: "scene1", keys: ["Digit1"] },
  { name: "scene2", keys: ["Digit2"] },
  { name: "scene3", keys: ["Digit3"] }
]

// This component decides which scene to render based on game context
function SceneSelector() {
  const { currentScene } = useGameContext();
  
  switch (currentScene) {
    case "forest": return <ForestScene />;
    case "home": return <HomeScene />;
    case "store": return <StoreScene />;
    default: return <ForestScene />;
  }
}

// Loading fallback component
function LoadingScreen() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black text-white">
      <div className="text-center">
        <h2 className="text-2xl mb-4">Loading...</h2>
        <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

// Error fallback
function ErrorFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black text-white">
      <div className="text-center">
        <h2 className="text-2xl mb-4">Something went wrong</h2>
        <button 
          onClick={() => window.location.reload()}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Reload Game
        </button>
      </div>
    </div>
  );
}

// The game application
export default function App() {
  // Ensure client-side rendering for React Three Fiber
  const [ready, setReady] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  
  // Only render the Canvas on client-side
  useEffect(() => {
    // Small delay to ensure everything is loaded
    const timer = setTimeout(() => {
      setReady(true);
    }, 500);
    
    // Poll for shop state changes
    const checkShopState = setInterval(() => {
      // @ts-ignore - Access custom property on window
      if (window.duckShopOpen !== undefined) {
        setShopOpen(window.duckShopOpen);
      }
    }, 100);
    
    return () => {
      clearTimeout(timer);
      clearInterval(checkShopState);
    };
  }, []);

  // Handler to close the shop
  const handleCloseShop = () => {
    // @ts-ignore - Access custom property on window
    if (window.closeDuckShop) {
      // @ts-ignore - Access custom property on window
      window.closeDuckShop();
    }
    setShopOpen(false);
  };

  return (
    <main className="w-full h-screen overflow-hidden">
      <GameProvider>
        <KeyboardControls map={controls}>
          {/* Background layer */}
          <div className="absolute inset-0 bg-gradient-to-b from-blue-500 to-green-500" />

          {/* Canvas layer - only render when client-side ready */}
          <div className="absolute inset-0"> 
            {ready ? (
              <ErrorBoundary fallback={<ErrorFallback />}>
                <Canvas shadows>
                  <Suspense fallback={null}>
                    <Physics gravity={[0, -30, 0]} timeStep={1/60} interpolate={true}>
                      <SceneSelector />
                    </Physics>
                  </Suspense>
                </Canvas>
              </ErrorBoundary>
            ) : (
              <LoadingScreen />
            )}
          </div>
          
          {/* UI layer that sits on top of the Canvas */}
          {!ready && <LoadingScreen />}
          <div className="absolute inset-0 pointer-events-none">
            <div className="pointer-events-auto">
              <Menu />
            </div>
            <HUD />
            {/* Render shop UI outside the canvas when active */}
            {shopOpen && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-50 pointer-events-auto">
                <div className="bg-white p-8 rounded-lg">
                  <h2 className="text-2xl font-bold mb-4">Duck's Shop</h2>
                  <p>Welcome to my shop! What would you like to buy?</p>
                  <button 
                    onClick={handleCloseShop} 
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4"
                  >
                    Close Shop
                  </button>
                </div>
              </div>
            )}
          </div>
        </KeyboardControls>
      </GameProvider>
    </main>
  )
}
