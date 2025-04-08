import { useState } from 'react'
import styles from './Menu.module.css'

export default function Menu() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className={styles.menuContainer}>
      <button 
        className={styles.menuIcon} 
        onClick={() => setIsOpen(!isOpen)}
      >
        ☰
      </button>
      
      {isOpen && (
        <div className={styles.menuPanel}>
          <h2>Menu</h2>
          <button onClick={() => {}}>Resume</button>
          <button onClick={() => {}}>Settings</button>
          <button onClick={() => {}}>Exit</button>
        </div>
      )}
    </div>
  )
}