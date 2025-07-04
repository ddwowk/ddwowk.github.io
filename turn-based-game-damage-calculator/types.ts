
export enum EffectType {
    NONE = 'none',
    ATTACK_BUFF = 'attack_buff',
    DEFENSE_BUFF = 'defense_buff',
    ATTACK_DEBUFF = 'attack_debuff',
    DEFENSE_DEBUFF = 'defense_debuff',
}

export interface Skill {
    name: string;
    baseDamage: number;
    effect: EffectType;
    effectValue: number; // e.g., 1.2 for 20% buff, 1.2 for 20% debuff
    effectDuration: number; // in turns
}

export interface Effect {
    name: string;
    type: EffectType;
    value: number;
    duration: number;
}

export interface Character {
    name: string;
    maxHp: number;
    currentHp: number;
    skills: Skill[];
    activeEffects: Effect[];
}

export interface BattleLogEntry {
    turn: number;
    message: string;
}
