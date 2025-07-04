
import React from 'react';
import { Character, Skill } from '../types';
import SkillInput from './SkillInput';
import { PlusIcon } from './icons';

interface CharacterSetupProps {
    character: Character;
    onCharacterChange: (field: keyof Character, value: any) => void;
    onSkillChange: (index: number, field: keyof Skill, value: any) => void;
    onAddSkill: () => void;
    onRemoveSkill: (index: number) => void;
    title: string;
    titleColor: string;
}

const CharacterSetup: React.FC<CharacterSetupProps> = ({
    character,
    onCharacterChange,
    onSkillChange,
    onAddSkill,
    onRemoveSkill,
    title,
    titleColor
}) => {
    return (
        <div className="bg-gray-800 p-6 rounded-lg shadow-xl h-full flex flex-col">
            <h2 className={`text-2xl font-bold mb-4 text-center ${titleColor}`}>{title}</h2>
            
            <div className="mb-4">
                <label htmlFor={`${character.name}-name`} className="block text-sm font-medium text-gray-400 mb-1">Name</label>
                <input
                    id={`${character.name}-name`}
                    type="text"
                    value={character.name}
                    onChange={(e) => onCharacterChange('name', e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                />
            </div>
            
            <div className="mb-6">
                <label htmlFor={`${character.name}-hp`} className="block text-sm font-medium text-gray-400 mb-1">Max HP</label>
                <input
                    id={`${character.name}-hp`}
                    type="number"
                    value={character.maxHp}
                    onChange={(e) => onCharacterChange('maxHp', Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                />
            </div>

            <h3 className="text-lg font-semibold text-gray-300 mb-3 border-b border-gray-700 pb-2">Skills</h3>
            <div className="space-y-4 flex-grow overflow-y-auto pr-2">
                {character.skills.map((skill, index) => (
                    <SkillInput
                        key={index}
                        skill={skill}
                        index={index}
                        onSkillChange={onSkillChange}
                        onRemoveSkill={onRemoveSkill}
                    />
                ))}
            </div>
            
            <button
                onClick={onAddSkill}
                className="mt-4 w-full bg-cyan-700 hover:bg-cyan-600 text-white font-semibold py-2 px-4 rounded-md transition duration-200 flex items-center justify-center"
            >
                <PlusIcon /> Add Skill
            </button>
        </div>
    );
};

export default CharacterSetup;
