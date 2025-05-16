import React from 'react';
import { launchRocket } from '../api/mockApi';

interface LaunchButtonProps {
  onLaunch: () => void;
  disabled?: boolean;
}

export const LaunchButton: React.FC<LaunchButtonProps> = ({ onLaunch, disabled }) => {
  const handleLaunch = async () => {
    const res = await launchRocket();
    alert('Novo lançamento! ID: ' + res.sessionId);
    onLaunch();
  };

  return <button onClick={handleLaunch} disabled={disabled}>Lançar Foguete</button>;
}; 