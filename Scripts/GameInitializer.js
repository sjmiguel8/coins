/**
 * GameInitializer.js
 * Handles initialization of various game systems and controls
 */

class GameInitializer {
  constructor() {
    // Default control settings
    this.settings = {
      useClickToMove: true,
      useVirtualJoystick: false,
      cameraLock: false
    };
    
    // Initialize controls based on device detection
    this.detectDeviceAndSetControls();
    
    // Set up event listeners
    this.setupEventListeners();
  }

  detectDeviceAndSetControls() {
    // Check if device is mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                     (window.innerWidth <= 768);
    
    if (isMobile) {
      // Use virtual joystick for mobile devices
      this.settings.useClickToMove = true;
    } else {
      // Use click-to-move and keyboard for desktop
      this.settings.useClickToMove = true;
    }

    // Dispatch initial control settings
    this.applyControlSettings();
  }
  
  setupEventListeners() {
    // Listen for window resize to adjust controls if needed
    window.addEventListener('resize', () => {
      this.detectDeviceAndSetControls();
    });
    
    // Handle visibility change (when tab becomes active/inactive)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        // Refresh control settings when tab becomes active
        this.applyControlSettings();
      }
    });
    
    // Listen for custom events from UI components
    window.addEventListener('toggle-click-to-move', (event) => {
      this.settings.useClickToMove = event.detail.enabled;
      this.applyControlSettings();
    });
    
    window.addEventListener('toggle-controls', (event) => {
      this.settings.useClickToMove = event.detail.useClickToMove;
      this.settings.useVirtualJoystick = event.detail.useVirtualJoystick;
      this.settings.cameraLock = event.detail.cameraLock;
      this.applyControlSettings();
    });
  }
  
  applyControlSettings() {
    // Dispatch control settings to all systems
    window.dispatchEvent(new CustomEvent('toggle-controls', {
      detail: {
        useVirtualJoystick: this.settings.useVirtualJoystick,
        useClickToMove: this.settings.useClickToMove,
        cameraLock: this.settings.cameraLock
      }
    }));
    
    // Log current control scheme
    console.log('Control settings updated:', {
      useVirtualJoystick: this.settings.useVirtualJoystick,
      useClickToMove: this.settings.useClickToMove,
      cameraLock: this.settings.cameraLock
    });
  }
  
  // Public methods to toggle controls from outside
  toggleClickToMove(enabled) {
    this.settings.useClickToMove = enabled;
    this.applyControlSettings();
  }
  
  // Method to initialize and export the instance
  static initialize() {
    const instance = new GameInitializer();
    
    // Make instance accessible globally if needed
    window.gameInitializer = instance;
    
    return instance;
  }
}

// Auto-initialize the game when script is loaded
document.addEventListener('DOMContentLoaded', () => {
  GameInitializer.initialize();
});

// Export the class for module usage
export default GameInitializer;
