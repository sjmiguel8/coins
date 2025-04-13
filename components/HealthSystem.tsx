import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import * as THREE from 'three'

// Entity types that can have health
export type EntityType = 'player' | 'enemy'

// Entity health data structure
export interface EntityHealth {
  id: string
  type: EntityType
  maxHealth: number
  currentHealth: number
  position: THREE.Vector3
  isAlive: boolean
}

interface HealthSystemState {
  entities: Record<string, EntityHealth>
  
  // Actions
  registerEntity: (entity: Omit<EntityHealth, 'isAlive'>) => void
  unregisterEntity: (id: string) => void
  damageEntity: (id: string, amount: number) => void
  healEntity: (id: string, amount: number) => void
  updateEntityPosition: (id: string, position: THREE.Vector3) => void
}

export const useHealthSystem = create<HealthSystemState>()(
  subscribeWithSelector((set) => ({
    entities: {},
    
    registerEntity: (entity) => {
      set((state) => ({
        entities: {
          ...state.entities,
          [entity.id]: {
            ...entity,
            isAlive: true,
          }
        }
      }))
    },
    
    unregisterEntity: (id) => {
      set((state) => {
        const newEntities = { ...state.entities }
        delete newEntities[id]
        return { entities: newEntities }
      })
    },
    
    damageEntity: (id, amount) => {
      set((state) => {
        const entity = state.entities[id]
        if (!entity) return state
        
        const newHealth = Math.max(0, entity.currentHealth - amount)
        const isAlive = newHealth > 0
        
        return {
          entities: {
            ...state.entities,
            [id]: {
              ...entity,
              currentHealth: newHealth,
              isAlive
            }
          }
        }
      })
    },
    
    healEntity: (id, amount) => {
      set((state) => {
        const entity = state.entities[id]
        if (!entity) return state
        
        const newHealth = Math.min(entity.maxHealth, entity.currentHealth + amount)
        
        return {
          entities: {
            ...state.entities,
            [id]: {
              ...entity,
              currentHealth: newHealth,
            }
          }
        }
      })
    },
    
    updateEntityPosition: (id, position) => {
      set((state) => {
        const entity = state.entities[id]
        if (!entity) return state
        
        return {
          entities: {
            ...state.entities,
            [id]: {
              ...entity,
              position: position.clone(),
            }
          }
        }
      })
    }
  }))
)
