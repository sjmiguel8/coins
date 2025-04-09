"use client"

import { useState, useEffect } from 'react'
import { useGameContext } from './game-context'

export default function Menu() {
  const [isOpen, setIsOpen] = useState(false)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const { changeScene, currentScene } = useGameContext()
  const [useVirtualJoystick, setUseVirtualJoystick] = useState(false);
  const [useClickToMove, setUseClickToMove] = useState(true);

  // Dispatch initial control settings when component mounts
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('toggle-controls', {
      detail: {
        useVirtualJoystick: false,
        useClickToMove: true,
      }
    }));
  }, []);

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

  const menuContainerStyle = {
    position: 'fixed',
    top: '20px',
    right: '20px',
    zIndex: 1000,
  } as const;

  const menuIconStyle = {
    background: 'rgba(0, 0, 0, 0.7)',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    padding: '10px 15px',
    fontSize: '24px',
    cursor: 'pointer',
    transition: 'background 0.3s',
  } as const;

  const menuPanelStyle = {
    position: 'absolute',
    top: '100%',
    right: '0',
    marginTop: '10px',
    background: 'rgba(0, 0, 0, 0.8)',
    borderRadius: '8px',
    padding: '20px',
    minWidth: '200px',
  } as const;

  const menuSectionTitleStyle = {
    color: '#aaa',
    fontSize: '0.9em',
    margin: '15px 0 5px 0',
    borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
    paddingBottom: '5px',
  } as const;

  const buttonStyle = {
    display: 'block',
    width: '100%',
    padding: '10px',
    margin: '5px 0',
    background: 'rgba(255, 255, 255, 0.1)',
    border: 'none',
    color: 'white',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background 0.3s',
  } as const;

  const activeButtonStyle = {
    ...buttonStyle,
    background: 'rgba(65, 105, 225, 0.5)',
  };

  return (
    <div style={menuContainerStyle}>
      <button 
        style={menuIconStyle}
        onClick={() => setIsOpen(!isOpen)}
      >
        ☰
      </button>
      
      {isOpen && (
        <div style={menuPanelStyle}>
          <h2 style={{color: 'white', margin: '0 0 15px 0', textAlign: 'center'}}>Menu</h2>
          
          <h3 style={menuSectionTitleStyle}>Scenes</h3>
          <button 
            onClick={() => { changeScene("forest"); setIsOpen(false); }}
            style={currentScene === "forest" ? activeButtonStyle : buttonStyle}
          >
            Forest
          </button>
          <button 
            onClick={() => { changeScene("home"); setIsOpen(false); }}
            style={currentScene === "home" ? activeButtonStyle : buttonStyle}
          >
            Home
          </button>
          <button 
            onClick={() => { changeScene("store"); setIsOpen(false); }}
            style={currentScene === "store" ? activeButtonStyle : buttonStyle}
          >
            Store
          </button>
          
          <h3 style={menuSectionTitleStyle}>Settings</h3>
          <label style={{ display: 'block', marginBottom: '5px', color: 'white' }}>
            <input
              type="checkbox"
              checked={useClickToMove}
              onChange={(e) => {
                setUseClickToMove(e.target.checked);
                setUseVirtualJoystick(!e.target.checked);
                window.dispatchEvent(new CustomEvent('toggle-controls', {
                  detail: {
                    useVirtualJoystick: !e.target.checked,
                    useClickToMove: e.target.checked,
                  }
                }));
                setIsOpen(false);
              }}
              style={{ marginRight: '5px' }}
            />
            Click to Move
          </label>
          <label style={{ display: 'block', marginBottom: '5px', color: 'white' }}>
            <input
              type="checkbox"
              checked={useVirtualJoystick}
              onChange={(e) => {
                setUseVirtualJoystick(e.target.checked);
                setUseClickToMove(!e.target.checked);
                window.dispatchEvent(new CustomEvent('toggle-controls', {
                  detail: {
                    useVirtualJoystick: e.target.checked,
                    useClickToMove: !e.target.checked,
                  }
                }));
                setIsOpen(false);
              }}
              style={{ marginRight: '5px' }}
            />
            Virtual Joystick
          </label>
          
          <h3 style={menuSectionTitleStyle}>Options</h3>
          <button 
            onClick={toggleFullScreen}
            style={buttonStyle}
          >
            {isFullScreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          </button>
          <button 
            onClick={() => setIsOpen(false)}
            style={buttonStyle}
          >
            Resume
          </button>
        </div>
      )}
    </div>
  )
}