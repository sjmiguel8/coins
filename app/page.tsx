"use client"
import React, { useState, useEffect, Component, Suspense } from 'react';
// Import extend file first to ensure proper extension of Three.js
import '@/utils/extend';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { KeyboardControls, PointerLockControls } from '@react-three/drei';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { AnimationMixer } from 'three';

import Coin from '@/components/coin';
import CoinList from '@/components/CoinList';
import SearchBar from '@/components/SearchBar/SearchBar';
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { useTheme } from "next-themes";

import HUD from '../components/hud';
import MobileControls from '@/components/MobileControls'
import CameraControls from '@/components/CameraControls';
import { GameContextProvider as GameProvider, useGameContext } from "@/components/game-context"
import { getInitialCoins } from "@/lib/utils";
import ForestScene from "@/components/scenes/forest-scene"
import HomeScene from "@/components/scenes/home-scene"
import StoreScene from "@/components/scenes/store-scene"
import ErrorBoundary from "../components/ErrorBoundary";
import { initializeThree } from '@/utils/three-setup';

declare global {
  interface Window {
    duckShopOpen?: boolean;
    closeDuckShop?: () => void;
  }
}

import Menu from '@/components/Menu'

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
    case "forest": return (
        <>
            <CameraControls />
            <ForestScene />
        </>
    );
    case "home": return (
        <>
            <CameraControls />
            <HomeScene />
        </>
    );
    case "store": return (
        <>
            <CameraControls />
            <StoreScene />
        </>
    );
    default: return (
        <>
            <CameraControls />
            <ForestScene />
        </>
    );
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
  const [coins, setCoins] = useState<typeof Coin[]>([]);
  const [search, setSearch] = useState('');
  const [theme, setTheme] = useState("light");
  const { systemTheme } = useTheme();
  useEffect(() => {
    const getCoins = async () => {
      const fetchedCoins = await getInitialCoins();
      setCoins(fetchedCoins);
    };
    getCoins();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const filteredCoins = coins.filter(coin =>
    coin.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  // Only render the Canvas on client-side
  useEffect(() => {
    // Initialize Three.js with extensions
    initializeThree();
    // Small delay to ensure everything is loaded
    const timer = setTimeout(() => {
      setReady(true);
    }, 500);
    
    // Poll for shop state changes
    const checkShopState = setInterval(() => {
      // @ts-ignore - Access custom property on window
      if (typeof window.duckShopOpen !== 'undefined') {
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
          {ready ? (
            <div className="absolute inset-0">
              <ErrorBoundary fallback={<ErrorFallback />}>
                <Canvas shadows>
                  <Suspense fallback={null}>
                    <Physics gravity={[0, -30, 0]}>
                      <SceneSelector />
                    </Physics>
                  </Suspense>
                </Canvas>
              </ErrorBoundary>
            </div>
          ) : (
            <LoadingScreen />
          )}
          
          {/* UI layer that sits on top of the Canvas */}
          {!ready && <LoadingScreen />}
          <div className="absolute inset-0 pointer-events-none">
            <div className="pointer-events-auto">
              <Menu />
            </div>
            <HUD />
            <MobileControls /> {/* Add this line */}
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
