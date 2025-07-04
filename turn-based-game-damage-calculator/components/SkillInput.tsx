
import React from 'react';
import { Skill, EffectType } from '../types';
import { TrashIcon } from './icons';

interface SkillInputProps {
    skill: Skill;
    index: number;
    onSkillChange: (index: number, field: keyof Skill, value: any) => void;
    onRemoveSkill: (index: number) => void;
}

const SkillInput: React.FC<SkillInputProps> = ({ skill, index, onSkillChange, onRemoveSkill }) => {
    const showEffectFields = skill.effect !== EffectType.NONE;

    return (
        <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
            <div className="flex justify-between items-center mb-3">
                 <input
                    type="text"
                    placeholder="Skill Name"
                    value={skill.name}
                    onChange={(e) => onSkillChange(index, 'name', e.target.value)}
                    className="flex-grow bg-transparent font-semibold text-lg text-cyan-400 focus:outline-none"
                />
                <button onClick={() => onRemoveSkill(index)} className="text-gray-400 hover:text-red-500 transition-colors">
                    <TrashIcon />
                </button>
            </div>
           
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Base Dmg</label>
                    <input
                        type="number"
                        min="0"
                        value={skill.baseDamage}
                        onChange={(e) => onSkillChange(index, 'baseDamage', parseInt(e.target.value, 10) || 0)}
                        className="w-full bg-gray-600 border border-gray-500 rounded-md py-1 px-2 text-white focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Effect Type</label>
                    <select
                        value={skill.effect}
                        onChange={(e) => onSkillChange(index, 'effect', e.target.value as EffectType)}
                        className="w-full bg-gray-600 border border-gray-500 rounded-md py-1 px-2 text-white focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                    >
                        <option value={EffectType.NONE}>None</option>
                        <option value={EffectType.ATTACK_BUFF}>Attack Buff</option>
                        <option value={EffectType.DEFENSE_BUFF}>Defense Buff</option>
                        <option value={EffectType.ATTACK_DEBUFF}>Attack Debuff</option>
                        <option value={EffectType.DEFENSE_DEBUFF}>Defense Debuff</option>
                    </select>
                </div>
                {showEffectFields && (
                     <>
                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1">Effect Val. (e.g. 1.2)</label>
                            <input
                                type="number"
                                step="0.1"
                                min="1"
                                value={skill.effectValue}
                                onChange={(e) => onSkillChange(index, 'effectValue', parseFloat(e.target.value) || 1)}
                                className="w-full bg-gray-600 border border-gray-500 rounded-md py-1 px-2 text-white focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1">Effect Duration (Turns)</label>
                            <input
                                type="number"
                                min="1"
                                value={skill.effectDuration}
                                onChange={(e) => onSkillChange(index, 'effectDuration', parseInt(e.target.value, 10) || 1)}
                                className="w-full bg-gray-600 border border-gray-500 rounded-md py-1 px-2 text-white focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default SkillInput;
