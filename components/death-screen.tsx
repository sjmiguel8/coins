import React from 'react';

interface DeathScreenProps {
  countdown: number;
}

export default function DeathScreen({ countdown }: DeathScreenProps) {
  return (
    <div className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center z-50 text-white">
      <h1 className="text-4xl mb-4 text-red-500 font-bold">You Died</h1>
      <p className="text-2xl mb-8">Respawning in {countdown} seconds...</p>
      <div className="w-64 h-2 bg-gray-700 rounded-full overflow-hidden">
        <div 
          className="h-full bg-red-500 transition-all duration-1000"
          style={{ width: `${(countdown / 5) * 100}%` }}
        ></div>
      </div>
    </div>
  );
}
