"use client"
import { useHealthSystem } from './HealthSystem'
import HealthBar from './HealthBar'

// This component is meant to be used INSIDE the Canvas component
const CanvasHUD: React.FC = () => {
  const entities = useHealthSystem((state) => state.entities)
  
  return (
    <>
      {/* Render health bars for entities that need them */}
      {Object.keys(entities).map(entityId => (
        <HealthBar key={entityId} entityId={entityId} />
      ))}
    </>
  )
}

export default CanvasHUD
