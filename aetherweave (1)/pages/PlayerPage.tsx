
import React, { useState, useMemo } from 'react';
import { useGame } from '../context/GameContext';
import { LogEntry, LogEntryType } from '../types';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';

// Dummy player ID for simulation purposes
const LOCAL_PLAYER_ID = 'local_player_01';

const PlayerPage: React.FC = () => {
  const { session, playerJoin, submitPlayerAction, characters } = useGame();
  const [playerName, setPlayerName] = useState('');
  const [actionText, setActionText] = useState('');

  const localPlayer = useMemo(() => {
    return session?.players.find(p => p.name === playerName);
  }, [session, playerName]);

  const handleJoin = () => {
    if (playerName && !session?.players.some(p => p.name === playerName)) {
      playerJoin(playerName);
    } else if (!playerName) {
        alert("Please enter a player name.")
    } else {
        alert("Player already in session, viewing.")
    }
  };

  const handleSubmitAction = () => {
    if (actionText && localPlayer && localPlayer.isApproved) {
      submitPlayerAction(localPlayer.id, actionText);
      setActionText('');
    }
  };
  
  const latestNarration = useMemo(() => {
    return session?.log.find(entry => entry.type === LogEntryType.Narration) as LogEntry | undefined;
  }, [session?.log]);
  
  const combatLog = useMemo(() => {
    return session?.log.filter(entry => entry.type === LogEntryType.Combat || (entry.type === LogEntryType.System && entry.content.toLowerCase().includes('combat')))
  }, [session?.log]);

  const currentCombatant = session?.combatState.isActive ? session.combatState.turnOrder[session.combatState.currentTurnIndex] : null;
  const isPlayerTurn = currentCombatant?.id === localPlayer?.id;

  if (!session) {
    return <Card className="text-center"><p className="text-brand-subtle">The Game Master has not started a session yet.</p></Card>;
  }

  if (!localPlayer) {
    return (
      <Card className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-brand-primary mb-4">Join Session: {session.name}</h1>
        <div className="flex space-x-2">
          <Input 
            placeholder="Your Name" 
            value={playerName}
            onChange={e => setPlayerName(e.target.value)}
          />
          <Button onClick={handleJoin}>Join Game</Button>
        </div>
      </Card>
    );
  }

  if (!localPlayer.isApproved) {
      return (
        <Card className="text-center">
            <h2 className="text-2xl font-bold">Welcome, {localPlayer.name}!</h2>
            <p className="text-brand-subtle mt-4">Please wait for the Game Master to approve your character.</p>
            <p className="text-brand-subtle mt-2">Make sure you have created a character in the <a href="#/character-forge" className="text-brand-accent underline">Character Forge</a>.</p>
        </Card>
      )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <h2 className="text-3xl font-bold text-brand-accent mb-4">Current Scene</h2>
          {latestNarration?.image && (
            <img src={latestNarration.image} alt="Current Scene" className="rounded-lg mb-4 w-full object-cover aspect-video" />
          )}
          <p className="text-lg leading-relaxed italic text-brand-subtle">
            {latestNarration?.content || "The world is quiet for now, awaiting the GM's next words."}
          </p>
        </Card>
        
        <Card>
            <h2 className="text-2xl font-bold text-brand-accent mb-4">What do you do?</h2>
            <div className="flex space-x-2">
                <Input
                    placeholder={isPlayerTurn ? "It's your turn! Describe your combat action." : "Describe your action..."}
                    value={actionText}
                    onChange={e => setActionText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSubmitAction()}
                    className={isPlayerTurn ? 'border-2 border-brand-primary ring-2 ring-brand-primary/50' : ''}
                />
                <Button onClick={handleSubmitAction}>Send</Button>
            </div>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
            <h3 className="text-xl font-bold text-brand-primary mb-3">Character: {localPlayer.character?.name}</h3>
            <div className="space-y-2 text-sm">
                <p><span className="font-semibold text-brand-subtle">Race:</span> {localPlayer.character?.race.name}</p>
                <p className="font-semibold text-brand-subtle">Skills:</p>
                <ul className="list-disc list-inside pl-2 text-brand-text">
                    {localPlayer.character?.skills.map(s => <li key={s.id}>{s.name}</li>)}
                </ul>
            </div>
        </Card>
        {session.combatState.isActive && (
            <Card>
                <h3 className="text-xl font-bold text-red-500 mb-3">Combat Log</h3>
                <div className="h-64 overflow-y-auto bg-brand-bg p-2 rounded-md space-y-2">
                    {combatLog.map(entry => (
                        <p key={entry.id} className="text-sm text-brand-subtle italic">{entry.content}</p>
                    ))}
                </div>
            </Card>
        )}
      </div>
    </div>
  );
};

export default PlayerPage;
