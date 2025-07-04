
import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const HomePage: React.FC = () => {
  return (
    <div className="text-center">
      <h1 className="text-5xl font-bold text-brand-primary mb-4">Welcome to AetherWeave</h1>
      <p className="text-xl text-brand-subtle mb-12 max-w-3xl mx-auto">
        Your ultimate platform for boundless tabletop role-playing. Forge your heroes, weave your tales, and let AI enhance your adventure.
      </p>
      
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <Card className="flex flex-col items-center justify-center transform hover:scale-105 transition-transform duration-300">
          <h2 className="text-3xl font-bold text-brand-accent mb-4">For Players</h2>
          <p className="mb-6 text-center text-brand-subtle">Create unique characters, join campaigns, and immerse yourself in worlds created by your Game Master.</p>
          <div className="flex flex-col space-y-4 w-full max-w-xs">
            <Link to="/character-forge">
              <Button className="w-full">Character Forge</Button>
            </Link>
            <Link to="/player">
              <Button variant="secondary" className="w-full">Join a Game</Button>
            </Link>
          </div>
        </Card>

        <Card className="flex flex-col items-center justify-center transform hover:scale-105 transition-transform duration-300">
          <h2 className="text-3xl font-bold text-brand-accent mb-4">For Game Masters</h2>
          <p className="mb-6 text-center text-brand-subtle">Craft compelling narratives, manage your session with ease, and use AI to bring your world to life.</p>
          <Link to="/gm">
            <Button className="w-full max-w-xs">GM Dashboard</Button>
          </Link>
        </Card>
      </div>
    </div>
  );
};

export default HomePage;
