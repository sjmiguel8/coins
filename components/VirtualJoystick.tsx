"use client"

import { useState } from 'react';

export default function VirtualJoystick() {
  const [pressed, setPressed] = useState({
    forward: false,
    backward: false,
    left: false,
    right: false,
  });

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
        forward: control === 'forward' ? isPressed : pressed.forward,
        backward: control === 'backward' ? isPressed : pressed.backward,
        left: control === 'left' ? isPressed : pressed.left,
        right: control === 'right' ? isPressed : pressed.right,
      }
    }));
  };

  const buttonStyle = (control: 'forward' | 'backward' | 'left' | 'right') => `w-16 h-16 rounded-full flex items-center justify-center ${pressed[control] ? 'bg-blue-600' : 'bg-blue-500'} text-white text-2xl font-bold`;

  return (
    <div className="fixed top-4 left-4 z-50">
      <div className="grid grid-cols-3 grid-rows-3 gap-1">
        {/* Top row (just forward button) */}
        <div className="col-start-2 col-span-1">
          <button
            className={buttonStyle('forward')}
            onTouchStart={() => handlePress('forward', true)}
            onTouchEnd={() => handlePress('forward', false)}
            onTouchCancel={() => handlePress('forward', false)}
            onMouseDown={() => handlePress('forward', true)}
            onMouseUp={() => handlePress('forward', false)}
            onMouseLeave={() => handlePress('forward', false)}
          >
            ↑
          </button>
        </div>

        {/* Middle row (left, empty, right buttons) */}
        <div className="col-start-1 col-span-1">
          <button
            className={buttonStyle('left')}
            onTouchStart={() => handlePress('left', true)}
            onTouchEnd={() => handlePress('left', false)}
            onTouchCancel={() => handlePress('left', false)}
            onMouseDown={() => handlePress('left', true)}
            onMouseUp={() => handlePress('left', false)}
            onMouseLeave={() => handlePress('left', false)}
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
            className={buttonStyle('right')}
            onTouchStart={() => handlePress('right', true)}
            onTouchEnd={() => handlePress('right', false)}
            onTouchCancel={() => handlePress('right', false)}
            onMouseDown={() => handlePress('right', true)}
            onMouseUp={() => handlePress('right', false)}
            onMouseLeave={() => handlePress('right', false)}
          >
            →
          </button>
        </div>

        {/* Bottom row (just backward button) */}
        <div className="col-start-2 col-span-1">
          <button
            className={buttonStyle('backward')}
            onTouchStart={() => handlePress('backward', true)}
            onTouchEnd={() => handlePress('backward', false)}
            onTouchCancel={() => handlePress('backward', false)}
            onMouseDown={() => handlePress('backward', true)}
            onMouseUp={() => handlePress('backward', false)}
            onMouseLeave={() => handlePress('backward', false)}
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
            const event = new KeyboardEvent('keydown', { 'code': 'Space' });
            window.dispatchEvent(event);

            // Simulate key release after a brief delay
            setTimeout(() => {
              const event = new KeyboardEvent('keyup', { 'code': 'Space' });
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
