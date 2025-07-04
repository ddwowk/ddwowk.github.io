
import { Character, EffectType } from './types';

export const initialPlayer: Character = {
    name: 'Hero Knight',
    maxHp: 100,
    currentHp: 100,
    skills: [
        { name: 'Swift Strike', baseDamage: 15, effect: EffectType.NONE, effectValue: 0, effectDuration: 0 },
        { name: 'Shield Wall', baseDamage: 0, effect: EffectType.DEFENSE_BUFF, effectValue: 1.5, effectDuration: 2 },
        { name: 'Power Lunge', baseDamage: 25, effect: EffectType.NONE, effectValue: 0, effectDuration: 0 },
    ],
    activeEffects: [],
};

export const initialEnemy: Character = {
    name: 'Goblin Marauder',
    maxHp: 80,
    currentHp: 80,
    skills: [
        { name: 'Rusty Shiv', baseDamage: 12, effect: EffectType.NONE, effectValue: 0, effectDuration: 0 },
        { name: 'Howl', baseDamage: 0, effect: EffectType.ATTACK_BUFF, effectValue: 1.3, effectDuration: 2 },
        { name: 'Armor Break', baseDamage: 8, effect: EffectType.DEFENSE_DEBUFF, effectValue: 1.2, effectDuration: 3 }
    ],
    activeEffects: [],
};
