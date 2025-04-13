import { useState, useEffect } from 'react';
import { useCombatStore } from './CombatSystem';
import { Text } from '@react-three/drei';

interface AttackFeedbackProps {
  position?: [number, number, number];
}

export const AttackFeedback: React.FC<AttackFeedbackProps> = ({ 
  position = [0, 0, 0]
}) => {
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackPosition, setFeedbackPosition] = useState<[number, number, number]>([0, 0, 0]);
  
  const isAttacking = useCombatStore(state => state.isAttacking);
  const attackType = useCombatStore(state => state.attackType);
  
  useEffect(() => {
    if (isAttacking) {
      setShowFeedback(true);
      
      // Set text based on attack type
      setFeedbackText(attackType === 'heavy' ? 'HEAVY ATTACK!' : 'Attack!');
      
      // Set position with slight randomness
      const randomX = (Math.random() - 0.5) * 0.3;
      const randomY = (Math.random() - 0.5) * 0.3;
      const randomZ = (Math.random() - 0.5) * 0.3;
      
      setFeedbackPosition([
        position[0] + randomX,
        position[1] + 1.5 + randomY,
        position[2] + randomZ
      ]);
      
      // Hide after animation completes
      const timeout = setTimeout(() => {
        setShowFeedback(false);
      }, attackType === 'heavy' ? 700 : 400);
      
      return () => clearTimeout(timeout);
    }
  }, [isAttacking, attackType, position]);
  
  if (!showFeedback) return null;
  
  return (
    <Text
      position={feedbackPosition}
      color={attackType === 'heavy' ? '#ff0000' : '#ffff00'}
      fontSize={0.4}
      anchorX="center"
      anchorY="middle"
      fontWeight="bold"
    >
      {feedbackText}
    </Text>
  );
};

export default AttackFeedback;
