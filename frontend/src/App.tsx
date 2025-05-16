import React, { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { LaunchButton } from './components/LaunchButton';
import { MockDataProvider } from './components/MockDataProvider';

function App() {
  const [flying, setFlying] = useState(false);

  return (
    <div>
      <h1>Dashboard do Foguete</h1>
      <LaunchButton onLaunch={() => setFlying(true)} disabled={flying} />
      <button onClick={() => setFlying(false)} disabled={!flying}>
        Parar Foguete
      </button>
      <Dashboard />
      <MockDataProvider flying={flying} />
    </div>
  );
}

export default App;
