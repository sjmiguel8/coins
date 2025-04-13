import { Html } from '@react-three/drei'
import { useEffect, useState } from 'react'
import { useHealthSystem } from './HealthSystem'

interface HealthBarProps {
  entityId: string
  offset?: [number, number, number]
}

const HealthBar: React.FC<HealthBarProps> = ({ entityId, offset = [0, 2, 0] }) => {
  const [visible, setVisible] = useState(true)
  const entity = useHealthSystem((state) => state.entities[entityId])
  
  useEffect(() => {
    if (!entity) {
      setVisible(false)
      return
    }
    
    setVisible(true)
    
    // Hide health bar when entity is at full health (except for player)
    if (entity.type !== 'player' && entity.currentHealth >= entity.maxHealth) {
      setVisible(false)
    }
  }, [entity, entityId])
  
  if (!visible || !entity) return null
  
  const healthPercent = (entity.currentHealth / entity.maxHealth) * 100
  const barWidth = 50 // pixels
  
  return (
    <Html
      position={[offset[0], offset[1], offset[2]]}
      center
      distanceFactor={15}
      occlude
    >
      <div className="health-bar-container" style={{
        width: `${barWidth}px`,
        background: '#333',
        height: '8px',
        borderRadius: '4px',
        overflow: 'hidden',
      }}>
        <div
          className="health-bar-fill"
          style={{
            height: '100%',
            width: `${healthPercent}%`,
            background: healthPercent > 50 ? '#44ff44' : healthPercent > 25 ? '#ffff44' : '#ff4444',
            transition: 'width 0.3s ease-in-out'
          }}
        />
      </div>
    </Html>
  )
}

export default HealthBar
