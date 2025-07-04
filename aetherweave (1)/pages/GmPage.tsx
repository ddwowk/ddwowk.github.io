
import React, { useState, useCallback } from 'react';
import { useGame } from '../context/GameContext';
import { LogEntryType, Combatant } from '../types';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import Spinner from '../components/ui/Spinner';
import * as geminiService from '../services/geminiService';

const GmPage: React.FC = () => {
  const { session, createSession, characters, approvePlayer, addLog, startCombat, processNextTurn, isLoading: isGameLoading } = useGame();
  const [sessionName, setSessionName] = useState('');
  const [scenarioPrompt, setScenarioPrompt] = useState('');
  const [isNarrating, setIsNarrating] = useState(false);
  const [pendingApprovals, setPendingApprovals] = useState<{ [playerId: string]: string }>({});
  
  const [enemies, setEnemies] = useState<{name: string, hp: string}[]>([{name: '', hp: '10'}]);

  const handleCreateSession = () => {
    if (sessionName) {
      createSession(sessionName);
      setSessionName('');
    }
  };

  const handleSendScenario = async () => {
    if (!scenarioPrompt) return;
    setIsNarrating(true);
    
    // Generate description and image in parallel
    const descriptionPromise = geminiService.generateScenario(scenarioPrompt);
    const imagePromise = geminiService.generateSceneImage(scenarioPrompt);
    
    const [description, imageUrl] = await Promise.all([descriptionPromise, imagePromise]);
    
    addLog({
      type: LogEntryType.Narration,
      content: description,
      image: imageUrl,
    });
    
    setScenarioPrompt('');
    setIsNarrating(false);
  };
  
  const handleApprovalChange = (playerId: string, characterId: string) => {
    setPendingApprovals(prev => ({ ...prev, [playerId]: characterId }));
  };
  
  const handleApprovePlayer = (playerId: string) => {
      const characterId = pendingApprovals[playerId];
      if(characterId) {
          approvePlayer(playerId, characterId);
      }
  };

  const addEnemy = () => setEnemies([...enemies, {name: '', hp: '10'}]);
  const updateEnemy = (index: number, field: 'name' | 'hp', value: string) => {
    const newEnemies = [...enemies];
    newEnemies[index][field] = value;
    setEnemies(newEnemies);
  };

  const handleStartCombat = () => {
    const combatEnemies = enemies
      .filter(e => e.name && parseInt(e.hp) > 0)
      .map(e => ({ name: e.name, hp: parseInt(e.hp) }));
    if(combatEnemies.length > 0) {
      startCombat(combatEnemies);
    }
  };

  if (!session) {
    return (
      <Card className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-brand-primary mb-4">Create a New Session</h1>
        <div className="flex space-x-2">
          <Input 
            placeholder="Session Name" 
            value={sessionName}
            onChange={e => setSessionName(e.target.value)}
          />
          <Button onClick={handleCreateSession}>Create</Button>
        </div>
      </Card>
    );
  }

  const currentCombatant = session.combatState.isActive ? session.combatState.turnOrder[session.combatState.currentTurnIndex] : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        {/* Narration Card */}
        <Card>
          <h2 className="text-2xl font-bold text-brand-accent mb-4">AI-Assisted Narration</h2>
          <textarea
            className="w-full bg-brand-bg border border-brand-subtle/30 rounded-md px-3 py-2 mb-2 text-brand-text placeholder-brand-subtle focus:outline-none focus:ring-2 focus:ring-brand-accent"
            rows={4}
            placeholder="e.g., The players enter a bioluminescent cave behind a waterfall. Inside, a group of goblins are arguing over a glowing crystal."
            value={scenarioPrompt}
            onChange={e => setScenarioPrompt(e.target.value)}
            disabled={isNarrating}
          />
          <Button onClick={handleSendScenario} disabled={isNarrating}>
            {isNarrating ? <Spinner size="sm" /> : 'Send to Players'}
          </Button>
        </Card>

        {/* Combat Card */}
        <Card>
           <h2 className="text-2xl font-bold text-brand-accent mb-4">Combat Control</h2>
           {!session.combatState.isActive ? (
             <div>
               <h3 className="font-bold mb-2">Enemies</h3>
               {enemies.map((enemy, index) => (
                 <div key={index} className="flex space-x-2 mb-2">
                    <Input placeholder="Enemy Name" value={enemy.name} onChange={e => updateEnemy(index, 'name', e.target.value)} />
                    <Input type="number" placeholder="HP" value={enemy.hp} onChange={e => updateEnemy(index, 'hp', e.target.value)} className="w-24"/>
                 </div>
               ))}
               <Button variant="secondary" onClick={addEnemy} className="mr-2">Add Enemy</Button>
               <Button onClick={handleStartCombat}>Start Combat</Button>
             </div>
           ) : (
            <div>
              <h3 className="text-xl font-bold mb-2">Turn Order</h3>
              <ul className="mb-4 space-y-1">
                {session.combatState.turnOrder.map((c, i) => (
                  <li key={c.id} className={`p-2 rounded ${i === session.combatState.currentTurnIndex ? 'bg-brand-primary' : 'bg-brand-bg'}`}>
                    {c.name} - HP: {c.hp}/{c.maxHp}
                  </li>
                ))}
              </ul>
              <p className="mb-4 text-lg">Current Turn: <span className="font-bold text-brand-accent">{currentCombatant?.name}</span></p>
              <Button onClick={processNextTurn} disabled={isGameLoading}>
                 {isGameLoading ? <Spinner size="sm" /> : "Process Next Turn"}
              </Button>
            </div>
           )}
        </Card>

        {/* Game Log */}
        <Card>
          <h2 className="text-2xl font-bold text-brand-accent mb-4">Game Log</h2>
          <div className="h-96 overflow-y-auto bg-brand-bg p-4 rounded-md space-y-4">
            {session.log.map(entry => (
              <div key={entry.id}>
                <p className={`
                  ${entry.type === LogEntryType.Narration ? 'text-brand-accent italic' : ''}
                  ${entry.type === LogEntryType.Combat ? 'text-red-400' : ''}
                  ${entry.type === LogEntryType.System ? 'text-brand-subtle text-sm' : ''}
                `}>{entry.content}</p>
                 {entry.image && <img src={entry.image} alt="Scene" className="mt-2 rounded-lg" />}
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="space-y-8">
        {/* Session Info & Player Management */}
        <Card>
          <h2 className="text-2xl font-bold text-brand-primary mb-4">Session: {session.name}</h2>
          <div className="mb-4">
            <label className="font-bold">Invite Link (Share with Players):</label>
            <Input readOnly value={`${window.location.origin}${window.location.pathname}#/player`} className="mt-1" />
          </div>

          <h3 className="font-bold mb-2">Players</h3>
          <div className="space-y-4">
            {session.players.map(player => (
              <div key={player.id} className="bg-brand-bg p-3 rounded-md">
                <p className="font-semibold">{player.name}</p>
                {player.isApproved ? (
                  <p className="text-green-400">Approved: {player.character?.name}</p>
                ) : (
                  <div className="mt-2 flex space-x-2 items-center">
                    <select 
                      className="w-full bg-brand-bg border border-brand-subtle/30 rounded-md px-3 py-2 text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-accent"
                      onChange={(e) => handleApprovalChange(player.id, e.target.value)}
                      value={pendingApprovals[player.id] || ''}
                    >
                      <option value="" disabled>Select Character</option>
                      {characters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <Button onClick={() => handleApprovePlayer(player.id)} disabled={!pendingApprovals[player.id]}>Approve</Button>
                  </div>
                )}
              </div>
            ))}
            {session.players.length === 0 && <p className="text-brand-subtle">No players have joined yet.</p>}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default GmPage;
