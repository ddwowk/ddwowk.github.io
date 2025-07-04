
import React from 'react';
import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import { GameProvider } from './context/GameContext';
import HomePage from './pages/HomePage';
import GmPage from './pages/GmPage';
import PlayerPage from './pages/PlayerPage';
import CharacterForgePage from './pages/CharacterForgePage';

const App: React.FC = () => {
  return (
    <GameProvider>
      <HashRouter>
        <div className="min-h-screen bg-brand-bg text-brand-text font-sans">
          <nav className="bg-brand-surface p-4 shadow-lg">
            <div className="container mx-auto flex justify-between items-center">
              <Link to="/" className="text-2xl font-bold text-brand-text hover:text-brand-accent transition-colors">
                AetherWeave
              </Link>
              <div className="space-x-4">
                <Link to="/" className="hover:text-brand-accent transition-colors">Home</Link>
                <Link to="/character-forge" className="hover:text-brand-accent transition-colors">Character Forge</Link>
                <Link to="/gm" className="hover:text-brand-accent transition-colors">GM</Link>
                <Link to="/player" className="hover:text-brand-accent transition-colors">Player</Link>
              </div>
            </div>
          </nav>
          <main className="container mx-auto p-4 md:p-8">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/gm" element={<GmPage />} />
              <Route path="/player" element={<PlayerPage />} />
              <Route path="/character-forge" element={<CharacterForgePage />} />
              <Route path="/character-forge/:id" element={<CharacterForgePage />} />
            </Routes>
          </main>
        </div>
      </HashRouter>
    </GameProvider>
  );
};

export default App;
