"use client"

import { useState, useEffect } from 'react'
import styles from './Menu.module.css'
import { useGameContext } from './game-context'

export default function Menu() {
  const [isOpen, setIsOpen] = useState(false)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const { changeScene, currentScene } = useGameContext()

  // Handle fullscreen toggle
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullScreen(true);
      }).catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => {
          setIsFullScreen(false);
        }).catch(err => {
          console.error(`Error attempting to exit fullscreen: ${err.message}`);
        });
      }
    }
  }

  // Listen for escape key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && document.fullscreenElement) {
        document.exitFullscreen().then(() => {
          setIsFullScreen(false);
        }).catch(err => {
          console.error(`Error exiting fullscreen: ${err.message}`);
        });
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Check fullscreen status when component mounts and on change
  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
    };
  }, []);

  return (
    <div className={styles.menuContainer}>
      <button 
        className={styles.menuIcon} 
        onClick={() => setIsOpen(!isOpen)}
      >
        ☰
      </button>
      
      {isOpen && (
        <div className={styles.menuPanel}>
          <h2>Menu</h2>
          
          <h3 className={styles.menuSectionTitle}>Scenes</h3>
          <button 
            onClick={() => { changeScene("forest"); setIsOpen(false); }}
            className={currentScene === "forest" ? styles.activeButton : ""}
          >
            Forest
          </button>
          <button 
            onClick={() => { changeScene("home"); setIsOpen(false); }}
            className={currentScene === "home" ? styles.activeButton : ""}
          >
            Home
          </button>
          <button 
            onClick={() => { changeScene("store"); setIsOpen(false); }}
            className={currentScene === "store" ? styles.activeButton : ""}
          >
            Store
          </button>
          
          <h3 className={styles.menuSectionTitle}>Options</h3>
          <button onClick={toggleFullScreen}>
            {isFullScreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          </button>
          <button onClick={() => setIsOpen(false)}>Resume</button>
        </div>
      )}
    </div>
  )
}