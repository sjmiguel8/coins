import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import * as THREE from 'three';

// Combat configuration
const ATTACK_COOLDOWN = 500 // ms
const LIGHT_ATTACK_DAMAGE = 10
const HEAVY_ATTACK_DAMAGE = 25
const DODGE_DURATION = 300 // ms
const DODGE_COOLDOWN = 1000 // ms
const DODGE_DISTANCE = 3

interface CombatState {
  isAttacking: boolean
  attackType: 'light' | 'heavy' | null
  lastAttackTime: number
  isDodging: boolean
  dodgeDirection: THREE.Vector3 | null
  lastDodgeTime: number
  
  // Actions
  performLightAttack: () => void
  performHeavyAttack: () => void
  performDodge: (direction: THREE.Vector3) => void
  resetAttack: () => void
  resetDodge: () => void
}

export const useCombatStore = create<CombatState>()(
  subscribeWithSelector((set, get) => ({
    isAttacking: false,
    attackType: null,
    lastAttackTime: 0,
    isDodging: false,
    dodgeDirection: null,
    lastDodgeTime: 0,
    
    performLightAttack: () => {
      const now = Date.now()
      const { lastAttackTime } = get()
      
      if (now - lastAttackTime < ATTACK_COOLDOWN) return
      
      set({
        isAttacking: true,
        attackType: 'light',
        lastAttackTime: now
      })
      
      // Reset attack state after animation would complete
      setTimeout(() => {
        set({ isAttacking: false, attackType: null })
      }, 400)
    },
    
    performHeavyAttack: () => {
      const now = Date.now()
      const { lastAttackTime } = get()
      
      if (now - lastAttackTime < ATTACK_COOLDOWN * 1.5) return
      
      set({
        isAttacking: true,
        attackType: 'heavy',
        lastAttackTime: now
      })
      
      // Reset attack state after animation would complete
      setTimeout(() => {
        set({ isAttacking: false, attackType: null })
      }, 700)
    },
    
    performDodge: (direction) => {
      const now = Date.now()
      const { lastDodgeTime } = get()
      
      if (now - lastDodgeTime < DODGE_COOLDOWN) return
      
      set({
        isDodging: true,
        dodgeDirection: direction,
        lastDodgeTime: now
      })
      
      // Reset dodge state after animation completes
      setTimeout(() => {
        set({ isDodging: false, dodgeDirection: null })
      }, DODGE_DURATION)
    },
    
    resetAttack: () => set({ isAttacking: false, attackType: null }),
    resetDodge: () => set({ isDodging: false, dodgeDirection: null }),
  }))
)

export const getDamageByAttackType = (type: 'light' | 'heavy' | null): number => {
  if (type === 'light') return LIGHT_ATTACK_DAMAGE
  if (type === 'heavy') return HEAVY_ATTACK_DAMAGE
  return 0
}

export const DODGE_PARAMS = {
  DURATION: DODGE_DURATION,
  COOLDOWN: DODGE_COOLDOWN,
  DISTANCE: DODGE_DISTANCE,
}
