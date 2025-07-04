
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { GameSession, Character, LogEntry, Player, LogEntryType, Combatant } from '../types';
import * as geminiService from '../services/geminiService';

interface GameContextType {
  session: GameSession | null;
  characters: Character[];
  createSession: (name: string, password?: string) => void;
  addLog: (entry: Omit<LogEntry, 'id' | 'timestamp'>) => void;
  saveCharacter: (character: Character) => void;
  getCharacter: (id: string) => Character | undefined;
  deleteCharacter: (id: string) => void;
  // Simulated multiplayer actions
  playerJoin: (name: string) => void;
  approvePlayer: (playerId: string, characterId: string) => void;
  submitPlayerAction: (playerId: string, action: string) => void;
  startCombat: (enemies: {name: string, hp: number}[]) => void;
  processNextTurn: () => Promise<void>;
  isLoading: boolean;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const initialSessionState: GameSession = {
  id: '',
  name: '',
  players: [],
  log: [],
  combatState: {
    isActive: false,
    turnOrder: [],
    currentTurnIndex: 0,
  }
};

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<GameSession | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Load initial state from localStorage
  useEffect(() => {
    try {
      const savedChars = localStorage.getItem('aetherweave_characters');
      if (savedChars) {
        setCharacters(JSON.parse(savedChars));
      }
      const savedSession = localStorage.getItem('aetherweave_session');
      if (savedSession) {
        setSession(JSON.parse(savedSession));
      }
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
      localStorage.removeItem('aetherweave_characters');
      localStorage.removeItem('aetherweave_session');
    }
  }, []);

  // Listen for storage changes to sync state across tabs
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'aetherweave_session' && event.newValue) {
        try {
          setSession(JSON.parse(event.newValue));
        } catch (e) {
          console.error("Failed to parse session from storage event", e);
        }
      }
      if (event.key === 'aetherweave_characters' && event.newValue) {
        try {
          setCharacters(JSON.parse(event.newValue));
        } catch (e) {
          console.error("Failed to parse characters from storage event", e);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // --- State persistence wrappers ---

  const setSessionAndStore = (updater: React.SetStateAction<GameSession | null>) => {
    setSession(current => {
      const newValue = typeof updater === 'function' ? (updater as (s: GameSession | null) => GameSession | null)(current) : updater;
      localStorage.setItem('aetherweave_session', JSON.stringify(newValue));
      return newValue;
    });
  };

  const setCharactersAndStore = (updater: React.SetStateAction<Character[]>) => {
    setCharacters(current => {
      const newValue = typeof updater === 'function' ? (updater as (c: Character[]) => Character[])(current) : updater;
      localStorage.setItem('aetherweave_characters', JSON.stringify(newValue));
      return newValue;
    });
  };

  // --- Context actions ---

  const addLog = useCallback((entry: Omit<LogEntry, 'id' | 'timestamp'>) => {
    setSessionAndStore(prev => {
      if (!prev) return null;
      const newLog: LogEntry = {
        ...entry,
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
      };
      return { ...prev, log: [newLog, ...prev.log] };
    });
  }, []);
  
  const createSession = (name: string, password?: string) => {
    const newSession: GameSession = {
      ...initialSessionState,
      id: `session-${Date.now()}`,
      name,
      password,
    };
    setSessionAndStore(newSession);
    addLog({ type: LogEntryType.System, content: `Session "${name}" created.` });
  };
  
  const saveCharacter = (character: Character) => {
    setCharactersAndStore(prev => {
      const existingIndex = prev.findIndex(c => c.id === character.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = character;
        return updated;
      }
      return [...prev, character];
    });
  };

  const deleteCharacter = (id: string) => {
    setCharactersAndStore(prev => prev.filter(c => c.id !== id));
  };

  const getCharacter = (id: string) => characters.find(c => c.id === id);

  const playerJoin = (name: string) => {
    const newPlayer: Player = {
      id: `player-${Date.now()}`,
      name,
      character: null,
      isApproved: false,
    };
    setSessionAndStore(prev => (prev ? { ...prev, players: [...prev.players, newPlayer] } : null));
    addLog({ type: LogEntryType.System, content: `${name} has joined the session and is awaiting approval.` });
  };

  const approvePlayer = (playerId: string, characterId: string) => {
    const character = getCharacter(characterId);
    if (!session || !character) return;

    const playerName = session.players.find(p => p.id === playerId)?.name || 'A player';

    setSessionAndStore(prev => {
      if (!prev) return null;
      const playerIndex = prev.players.findIndex(p => p.id === playerId);
      if (playerIndex === -1) return prev;

      const updatedPlayers = [...prev.players];
      updatedPlayers[playerIndex] = { ...updatedPlayers[playerIndex], character, isApproved: true };
      
      return { ...prev, players: updatedPlayers };
    });
    addLog({ type: LogEntryType.System, content: `${playerName} is approved with character ${character.name}.` });
  };

  const submitPlayerAction = (playerId: string, action: string) => {
    const player = session?.players.find(p => p.id === playerId);
    if (!player || !player.character) return;

    if(session?.combatState.isActive) {
        addLog({ type: LogEntryType.Action, content: `[${player.character.name}] submits combat action: ${action}` });
    } else {
        addLog({ type: LogEntryType.Action, content: `[${player.character.name}]: ${action}` });
    }
  };

  const startCombat = (enemies: {name: string, hp: number}[]) => {
    if(!session) return;
    const playerCombatants: Combatant[] = session.players
        .filter(p => p.isApproved && p.character)
        .map(p => ({ id: p.id, name: p.character!.name, isPlayer: true, hp: 100, maxHp: 100 }));

    const enemyCombatants: Combatant[] = enemies.map((e, i) => ({
        id: `enemy-${Date.now()}-${i}`,
        name: e.name,
        isPlayer: false,
        hp: e.hp,
        maxHp: e.hp
    }));

    const turnOrder = [...playerCombatants, ...enemyCombatants].sort(() => Math.random() - 0.5);

    setSessionAndStore(prev => prev ? ({
        ...prev,
        combatState: { isActive: true, turnOrder, currentTurnIndex: 0 }
    }) : null);
    addLog({ type: LogEntryType.System, content: `Combat has begun! Turn order: ${turnOrder.map(c => c.name).join(', ')}.` });
  };

  const processNextTurn = useCallback(async () => {
    if (!session || !session.combatState.isActive) return;

    setIsLoading(true);

    // Use a functional update to get the most recent session state
    let nextSessionState: GameSession | null = null;
    setSessionAndStore(currentSession => {
      if (!currentSession || !currentSession.combatState.isActive) {
        setIsLoading(false);
        return currentSession;
      }
      nextSessionState = JSON.parse(JSON.stringify(currentSession)); // Deep copy to modify
      return currentSession; // Return original for now, we'll set the final state later
    });

    // Wait for state to be set, or just use our copy
    if (!nextSessionState) {
        setIsLoading(false);
        return;
    }

    const { turnOrder, currentTurnIndex } = nextSessionState.combatState;
    const currentCombatant = turnOrder[currentTurnIndex];

    if (currentCombatant.isPlayer) {
      const player = nextSessionState.players.find(p => p.id === currentCombatant.id);
      const lastActionLog = nextSessionState.log.find(l => l.type === LogEntryType.Action && l.content.startsWith(`[${player?.character?.name}]`));

      if (player?.character && lastActionLog) {
        const actionText = lastActionLog.content;
        const enemies = turnOrder.filter(c => !c.isPlayer);
        const resolution = await geminiService.resolveCombatAction(actionText, player.character, enemies);
        if (resolution) {
            addLog({ type: LogEntryType.Combat, content: resolution.description });
            if(resolution.damage_dealt > 0 && resolution.target_id) {
                const targetIndex = nextSessionState.combatState.turnOrder.findIndex(c => c.id === resolution.target_id);
                if(targetIndex > -1) {
                    nextSessionState.combatState.turnOrder[targetIndex].hp -= resolution.damage_dealt;
                    if(nextSessionState.combatState.turnOrder[targetIndex].hp <= 0) {
                        const defeatedName = nextSessionState.combatState.turnOrder[targetIndex].name;
                        nextSessionState.combatState.turnOrder.splice(targetIndex, 1);
                        // We need to add log to the copied state to avoid race conditions
                        nextSessionState.log.unshift({ id: `log-${Date.now()}`, timestamp: new Date().toISOString(), type: LogEntryType.System, content: `${defeatedName} has been defeated!`});
                    }
                }
            }
        }
      } else {
        addLog({type: LogEntryType.System, content: `It's ${currentCombatant.name}'s turn. Waiting for action.`})
      }
    } else {
      addLog({type: LogEntryType.Combat, content: `It's ${currentCombatant.name}'s turn. The creature snarls and prepares to attack!`});
    }

    // Check for combat end conditions
    if (nextSessionState.combatState.turnOrder.filter(c => c.isPlayer).length === 0) {
        nextSessionState.combatState.isActive = false;
        nextSessionState.log.unshift({ id: `log-${Date.now()}`, timestamp: new Date().toISOString(), type: LogEntryType.System, content: "Combat Over! All players have been defeated."});
    } else if (nextSessionState.combatState.turnOrder.filter(c => !c.isPlayer).length === 0) {
        nextSessionState.combatState.isActive = false;
        nextSessionState.log.unshift({ id: `log-${Date.now()}`, timestamp: new Date().toISOString(), type: LogEntryType.System, content: "Combat Over! All enemies defeated!"});
    } else {
      // Advance turn
      nextSessionState.combatState.currentTurnIndex = (nextSessionState.combatState.currentTurnIndex + 1) % nextSessionState.combatState.turnOrder.length;
    }
    
    setSessionAndStore(nextSessionState);
    setIsLoading(false);
  }, [session, addLog]);

  const value: GameContextType = {
    session,
    characters,
    createSession,
    addLog,
    saveCharacter,
    getCharacter,
    deleteCharacter,
    playerJoin,
    approvePlayer,
    submitPlayerAction,
    startCombat,
    processNextTurn,
    isLoading
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
