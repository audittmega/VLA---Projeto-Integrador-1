import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Dashboard } from './components/Dashboard';
import PreviousLaunches from './components/PreviousLaunches';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <nav className="nav-bar">
          <div className="nav-content">
            <h1>VLA - Monitoramento de Lançamento</h1>
            <div className="nav-links">
              <Link to="/" className="nav-link">Dashboard</Link>
              <Link to="/launches" className="nav-link">Lançamentos Anteriores</Link>
            </div>
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/launches" element={<PreviousLaunches />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
