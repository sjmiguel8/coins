"use client"

import { useEffect, useState } from 'react';

export default function MobileControls() {
  const [showControls, setShowControls] = useState(false);
  const [pressed, setPressed] = useState({
    forward: false,
    backward: false,
    left: false,
    right: false,
  });
  
  // Detect mobile devices
  useEffect(() => {
    const isMobileDevice = () => {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
        || window.innerWidth <= 768;
    };
    
    setShowControls(isMobileDevice());
    
    const handleResize = () => {
      setShowControls(isMobileDevice());
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Helper to handle control press
  const handlePress = (control: 'forward' | 'backward' | 'left' | 'right', isPressed: boolean) => {
    // Update local state
    setPressed(prev => ({
      ...prev,
      [control]: isPressed
    }));
    
    // Emit event for player movement
    window.dispatchEvent(new CustomEvent('virtual-joystick', {
      detail: {
        ...pressed,
        [control]: isPressed
      }
    }));
  };
  
  if (!showControls) return null;
  
  return (
    <div className="fixed bottom-32 left-1/2 transform -translate-x-1/2 z-50">
      <div className="grid grid-cols-3 grid-rows-3 gap-1">
        {/* Top row (just forward button) */}
        <div className="col-start-2 col-span-1">
          <button
            className={`w-16 h-16 rounded-full flex items-center justify-center ${pressed.forward ? 'bg-blue-600' : 'bg-blue-500'} text-white text-2xl font-bold`}
            onTouchStart={() => handlePress('forward', true)}
            onTouchEnd={() => handlePress('forward', false)}
            onMouseDown={() => handlePress('forward', true)}
            onMouseUp={() => handlePress('forward', false)}
            onMouseLeave={() => pressed.forward && handlePress('forward', false)}
          >
            ↑
          </button>
        </div>
        
        {/* Middle row (left, empty, right buttons) */}
        <div className="col-start-1 col-span-1">
          <button
            className={`w-16 h-16 rounded-full flex items-center justify-center ${pressed.left ? 'bg-blue-600' : 'bg-blue-500'} text-white text-2xl font-bold`}
            onTouchStart={() => handlePress('left', true)}
            onTouchEnd={() => handlePress('left', false)}
            onMouseDown={() => handlePress('left', true)}
            onMouseUp={() => handlePress('left', false)}
            onMouseLeave={() => pressed.left && handlePress('left', false)}
          >
            ←
          </button>
        </div>
        <div className="col-start-2 col-span-1">
          {/* Empty space in the middle */}
          <div className="w-16 h-16 rounded-full flex items-center justify-center bg-gray-500 opacity-50 text-white">
            ●
          </div>
        </div>
        <div className="col-start-3 col-span-1">
          <button
            className={`w-16 h-16 rounded-full flex items-center justify-center ${pressed.right ? 'bg-blue-600' : 'bg-blue-500'} text-white text-2xl font-bold`}
            onTouchStart={() => handlePress('right', true)}
            onTouchEnd={() => handlePress('right', false)}
            onMouseDown={() => handlePress('right', true)}
            onMouseUp={() => handlePress('right', false)}
            onMouseLeave={() => pressed.right && handlePress('right', false)}
          >
            →
          </button>
        </div>
        
        {/* Bottom row (just backward button) */}
        <div className="col-start-2 col-span-1">
          <button
            className={`w-16 h-16 rounded-full flex items-center justify-center ${pressed.backward ? 'bg-blue-600' : 'bg-blue-500'} text-white text-2xl font-bold`}
            onTouchStart={() => handlePress('backward', true)}
            onTouchEnd={() => handlePress('backward', false)}
            onMouseDown={() => handlePress('backward', true)}
            onMouseUp={() => handlePress('backward', false)}
            onMouseLeave={() => pressed.backward && handlePress('backward', false)}
          >
            ↓
          </button>
        </div>
      </div>
      
      {/* Jump button */}
      <div className="absolute right-[-80px] bottom-0">
        <button
          className="w-16 h-16 rounded-full flex items-center justify-center bg-purple-500 text-white text-xl font-bold"
          onClick={() => {
            // Trigger a one-time jump event
            const event = new KeyboardEvent('keydown', {'code': 'Space'});
            window.dispatchEvent(event);
            
            // Simulate key release after a brief delay
            setTimeout(() => {
              const event = new KeyboardEvent('keyup', {'code': 'Space'});
              window.dispatchEvent(event);
            }, 100);
          }}
        >
          JUMP
        </button>
      </div>
    </div>
  );
}
