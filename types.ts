
export interface CustomCreation {
  id: string;
  name: string;
  description: string;
}

export interface Skill extends CustomCreation {
  mechanics?: string;
}

export interface Item extends CustomCreation {}

export interface Race extends CustomCreation {}

export interface Character {
  id: string;
  name: string;
  race: Race;
  skills: Skill[];
  items: Item[];
}

export interface Player {
  id: string;
  name: string;
  character: Character | null;
  isApproved: boolean;
}

export interface Combatant {
  id: string;
  name: string;
  isPlayer: boolean;
  hp: number;
  maxHp: number;
}

export enum LogEntryType {
  Narration,
  Action,
  Combat,
  System
}

export interface LogEntry {
  id: string;
  type: LogEntryType;
  content: string;
  image?: string;
  timestamp: string;
}

export interface GameSession {
  id: string;
  name: string;
  password?: string;
  players: Player[];
  log: LogEntry[];
  combatState: {
    isActive: boolean;
    turnOrder: Combatant[];
    currentTurnIndex: number;
  };
}
