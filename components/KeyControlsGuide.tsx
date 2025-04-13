import React, { useState, useEffect } from 'react';

export const KeyControlsGuide: React.FC = () => {
  const [showGuide, setShowGuide] = useState(true);
  const [isAttacking, setIsAttacking] = useState(false);
  const [attackDirection, setAttackDirection] = useState<'forward' | 'backward' | 'left' | 'right' | null>(null);
  
  useEffect(() => {
    // Hide guide after 10 seconds
    const timeout = setTimeout(() => {
      setShowGuide(false);
    }, 10000);
    
    // Show guide when pressing H key
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'h') {
        setShowGuide(prev => !prev);
      }

      let attackDirection = null;
      // Attack inputs
      if (e.key.toLowerCase() === 'i') {
        attackDirection = 'forward';
      } else if (e.key.toLowerCase() === 'k') {
        attackDirection = 'backward';
      } else if (e.key.toLowerCase() === 'j') {
        attackDirection = 'left';
      } else if (e.key.toLowerCase() === 'l') {
        attackDirection = 'right';
      }

      if (attackDirection) {
        setIsAttacking(true);
        setAttackDirection(attackDirection as "forward" | "backward" | "left" | "right");
        window.dispatchEvent(new CustomEvent('player-attack', { detail: { direction: attackDirection } }));
        setTimeout(() => {
          setIsAttacking(false);
          setAttackDirection(null);
        }, 500); // Attack duration
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      // Stop attacking when key is released
      if (['i', 'k', 'j', 'l'].includes(e.key.toLowerCase())) {
        setIsAttacking(false);
        setAttackDirection(null);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      clearTimeout(timeout);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);
  
  // Basic attack effect (you'll need to integrate this with your game's rendering)
  const attackEffect = isAttacking ? (
    <div className={`attack-effect ${attackDirection}`}>Attack!</div>
  ) : null;
  
  if (!showGuide) {
    return <div className="help-hint">Press H for controls</div>;
  }
  
  return (
    <div className="controls-guide">
      <h3>Controls</h3>
      <div className="control-section">
        <h4>Movement</h4>
        <p>WASD - Move</p>
        <p>SPACE - Jump</p>
      </div>
      <div className="control-section">
        <h4>Combat</h4>
        <p>I - Attack Forward</p>
        <p>K - Attack Backward</p>
        <p>J - Attack Left</p>
        <p>L - Attack Right</p>
        <p>Multiple keys - Heavy Attack</p>
      </div>
      <p className="hint-text">Press H to hide/show controls</p>
      {attackEffect} {/* Render attack effect */}
      <style jsx>{`
        .controls-guide {
          position: fixed;
          top: 20px;
          right: 20px;
          background: rgba(0, 0, 0, 0.7);
          color: white;
          padding: 15px;
          border-radius: 5px;
          z-index: 1000;
          max-width: 250px;
        }
        .control-section {
          margin-bottom: 10px;
        }
        h3, h4 {
          margin: 0 0 10px 0;
        }
        p {
          margin: 5px 0;
        }
        .hint-text {
          margin-top: 15px;
          font-style: italic;
          opacity: 0.8;
        }
        .help-hint {
          position: fixed;
          top: 20px;
          right: 20px;
          background: rgba(0, 0, 0, 0.5);
          color: white;
          padding: 5px 10px;
          border-radius: 5px;
          z-index: 1000;
        }
        .attack-effect {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(255, 0, 0, 0.8);
          color: white;
          padding: 10px;
          border-radius: 5px;
          z-index: 1001;
        }
        .attack-effect.forward {
          /* Adjust position based on direction */
          top: 20%;
        }
      `}</style>
    </div>
  );
};

export default KeyControlsGuide;
