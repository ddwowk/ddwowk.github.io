
import React, { useState, useCallback, useEffect } from 'react';
import { Character, Skill, BattleLogEntry, EffectType, Effect } from './types';
import { initialPlayer, initialEnemy } from './constants';
import { generateBattleSummary } from './services/geminiService';
import CharacterSetup from './components/CharacterSetup';
import BattleLog from './components/BattleLog';
import BattleSummary from './components/BattleSummary';
import { PlayIcon, RefreshIcon, SparklesIcon } from './components/icons';

const App: React.FC = () => {
    const [player, setPlayer] = useState<Character>(initialPlayer);
    const [enemy, setEnemy] = useState<Character>(initialEnemy);
    const [battleLog, setBattleLog] = useState<BattleLogEntry[]>([]);
    const [isSimulating, setIsSimulating] = useState<boolean>(false);
    const [winner, setWinner] = useState<string | null>(null);
    const [summary, setSummary] = useState<string>('');
    const [isGeneratingSummary, setIsGeneratingSummary] = useState<boolean>(false);

    const resetSimulation = useCallback(() => {
        setPlayer(prev => ({ ...prev, currentHp: prev.maxHp, activeEffects: [] }));
        setEnemy(prev => ({ ...prev, currentHp: prev.maxHp, activeEffects: [] }));
        setBattleLog([]);
        setWinner(null);
        setIsSimulating(false);
        setSummary('');
    }, []);

    useEffect(() => {
        resetSimulation();
    }, [player.maxHp, enemy.maxHp, resetSimulation]);

    const handleCharacterChange = (setter: React.Dispatch<React.SetStateAction<Character>>) => 
        (field: keyof Character, value: any) => {
        setter(prev => ({ ...prev, [field]: value }));
    };

    const handleSkillChange = (
        setter: React.Dispatch<React.SetStateAction<Character>>, 
        index: number, 
        field: keyof Skill, 
        value: any
    ) => {
        setter(prev => {
            const newSkills = [...prev.skills];
            newSkills[index] = { ...newSkills[index], [field]: value };
            return { ...prev, skills: newSkills };
        });
    };

    const addSkill = (setter: React.Dispatch<React.SetStateAction<Character>>) => {
        setter(prev => ({
            ...prev,
            skills: [...prev.skills, { name: 'New Skill', baseDamage: 10, effect: EffectType.NONE, effectValue: 0, effectDuration: 0 }]
        }));
    };

    const removeSkill = (setter: React.Dispatch<React.SetStateAction<Character>>, index: number) => {
        setter(prev => ({
            ...prev,
            skills: prev.skills.filter((_, i) => i !== index)
        }));
    };
    
    const startSimulation = () => {
        if (player.skills.length === 0 || enemy.skills.length === 0) {
            alert("Both characters must have at least one skill to start the simulation.");
            return;
        }

        resetSimulation();
        setIsSimulating(true);

        let turn = 1;
        let tempPlayer = { ...player, currentHp: player.maxHp, activeEffects: [] as Effect[] };
        let tempEnemy = { ...enemy, currentHp: enemy.maxHp, activeEffects: [] as Effect[] };
        const log: BattleLogEntry[] = [{ turn: 0, message: `Battle begins between ${player.name} and ${enemy.name}!` }];

        const tickEffects = (character: Character, charName: string): { updatedChar: Character; attackMod: number; defenseMod: number; logMessages: string[] } => {
            let attackMod = 1;
            let defenseMod = 1;
            const messages: string[] = [];
            const remainingEffects = character.activeEffects.map(effect => {
                if(effect.type === EffectType.ATTACK_BUFF) attackMod *= effect.value;
                if(effect.type === EffectType.DEFENSE_BUFF) defenseMod *= effect.value;
                if(effect.type === EffectType.ATTACK_DEBUFF) attackMod /= effect.value;
                if(effect.type === EffectType.DEFENSE_DEBUFF) defenseMod /= effect.value;
                
                const newDuration = effect.duration - 1;
                if (newDuration <= 0) {
                    messages.push(`${charName}'s ${effect.name} has worn off.`);
                    return null;
                }
                return { ...effect, duration: newDuration };
            }).filter((effect): effect is Effect => effect !== null);
            
            return { updatedChar: { ...character, activeEffects: remainingEffects }, attackMod, defenseMod, logMessages: messages };
        };


        const performTurn = () => {
            if (tempPlayer.currentHp <= 0 || tempEnemy.currentHp <= 0) {
                const finalWinner = tempPlayer.currentHp > 0 ? player.name : enemy.name;
                log.push({ turn, message: `** ${finalWinner} is victorious! **` });
                setWinner(finalWinner);
                setBattleLog(log);
                setIsSimulating(false);
                return;
            }

            log.push({ turn, message: `--- Turn ${turn} ---` });

            // Player's Turn
            let { updatedChar: playerAfterEffects, attackMod: pAttackMod, defenseMod: pDefenseMod, logMessages: pEffectMessages } = tickEffects(tempPlayer, player.name);
            tempPlayer = playerAfterEffects;
            pEffectMessages.forEach(msg => log.push({ turn, message: msg }));

            const playerSkill = player.skills[(turn - 1) % player.skills.length];
            let damage = Math.round(playerSkill.baseDamage * pAttackMod);
            
            log.push({ turn, message: `${player.name} uses ${playerSkill.name}.` });

            if (playerSkill.effect !== EffectType.NONE) {
                 const newEffect: Effect = { name: playerSkill.name, type: playerSkill.effect, value: playerSkill.effectValue, duration: playerSkill.effectDuration };
                 if ([EffectType.ATTACK_BUFF, EffectType.DEFENSE_BUFF].includes(playerSkill.effect)) {
                     tempPlayer.activeEffects.push(newEffect);
                     log.push({ turn, message: `${player.name} gains ${playerSkill.name}!` });
                 } else {
                     tempEnemy.activeEffects.push(newEffect);
                     log.push({ turn, message: `${enemy.name} is afflicted with ${playerSkill.name}!` });
                 }
            }

            if(damage > 0) {
                let { defenseMod: eDefenseMod } = tickEffects(tempEnemy, enemy.name); // only need defense mod
                const finalDamage = Math.max(1, Math.round(damage / eDefenseMod));
                tempEnemy.currentHp -= finalDamage;
                log.push({ turn, message: `${player.name} attacks ${enemy.name} for ${finalDamage} damage. (${enemy.name} HP: ${Math.max(0, tempEnemy.currentHp)})` });
            }
            

            if (tempEnemy.currentHp <= 0) {
                log.push({ turn, message: `** ${player.name} is victorious! **` });
                setWinner(player.name);
                setBattleLog(log);
                setPlayer(tempPlayer);
                setEnemy(tempEnemy);
                setIsSimulating(false);
                return;
            }

            // Enemy's Turn
            let { updatedChar: enemyAfterEffects, attackMod: eAttackMod, defenseMod: eDefenseMod, logMessages: eEffectMessages } = tickEffects(tempEnemy, enemy.name);
            tempEnemy = enemyAfterEffects;
            eEffectMessages.forEach(msg => log.push({ turn, message: msg }));

            const enemySkill = enemy.skills[(turn - 1) % enemy.skills.length];
            damage = Math.round(enemySkill.baseDamage * eAttackMod);

            log.push({ turn, message: `${enemy.name} uses ${enemySkill.name}.` });
            
            if (enemySkill.effect !== EffectType.NONE) {
                 const newEffect: Effect = { name: enemySkill.name, type: enemySkill.effect, value: enemySkill.effectValue, duration: enemySkill.effectDuration };
                 if ([EffectType.ATTACK_BUFF, EffectType.DEFENSE_BUFF].includes(enemySkill.effect)) {
                     tempEnemy.activeEffects.push(newEffect);
                     log.push({ turn, message: `${enemy.name} gains ${enemySkill.name}!` });
                 } else {
                     tempPlayer.activeEffects.push(newEffect);
                     log.push({ turn, message: `${player.name} is afflicted with ${enemySkill.name}!` });
                 }
            }

            if(damage > 0) {
                const finalDamage = Math.max(1, Math.round(damage / pDefenseMod));
                tempPlayer.currentHp -= finalDamage;
                log.push({ turn, message: `${enemy.name} attacks ${player.name} for ${finalDamage} damage. (${player.name} HP: ${Math.max(0, tempPlayer.currentHp)})` });
            }


            setPlayer(tempPlayer);
            setEnemy(tempEnemy);
            setBattleLog([...log]);

            turn++;
            setTimeout(performTurn, 500);
        };
        
        setTimeout(performTurn, 100);
    };

    const handleGenerateSummary = async () => {
        if (!winner || battleLog.length < 2) return;
        setIsGeneratingSummary(true);
        setSummary('');
        try {
            const logText = battleLog.map(entry => `Turn ${entry.turn}: ${entry.message}`).join('\n');
            const result = await generateBattleSummary(logText);
            setSummary(result);
        } catch (error) {
            console.error("Failed to generate summary:", error);
            setSummary("An error occurred while generating the battle summary. Please check the console for details.");
        } finally {
            setIsGeneratingSummary(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-6 lg:p-8 font-sans">
            <div className="max-w-7xl mx-auto">
                <header className="text-center mb-8">
                    <h1 className="text-4xl sm:text-5xl font-bold text-cyan-400 tracking-wider">Turn-Based Damage Simulator</h1>
                    <p className="text-gray-400 mt-2">Design characters and simulate battles to test your game balance.</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    <CharacterSetup
                        character={player}
                        onCharacterChange={handleCharacterChange(setPlayer)}
                        onSkillChange={(...args) => handleSkillChange(setPlayer, ...args)}
                        onAddSkill={() => addSkill(setPlayer)}
                        onRemoveSkill={(index) => removeSkill(setPlayer, index)}
                        title="Player Character"
                        titleColor="text-green-400"
                    />
                    <CharacterSetup
                        character={enemy}
                        onCharacterChange={handleCharacterChange(setEnemy)}
                        onSkillChange={(...args) => handleSkillChange(setEnemy, ...args)}
                        onAddSkill={() => addSkill(setEnemy)}
                        onRemoveSkill={(index) => removeSkill(setEnemy, index)}
                        title="Enemy Character"
                        titleColor="text-red-400"
                    />
                </div>

                <div className="text-center mb-8">
                    <button
                        onClick={startSimulation}
                        disabled={isSimulating}
                        className="bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-600 text-white font-bold py-3 px-8 rounded-lg text-lg shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 disabled:scale-100 flex items-center justify-center mx-auto"
                    >
                        {isSimulating ? "Simulating..." : <><PlayIcon /> Start Simulation</>}
                    </button>
                    {!isSimulating && battleLog.length > 0 && (
                        <button
                            onClick={resetSimulation}
                            className="ml-4 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center mx-auto mt-2 sm:mt-0 sm:inline-flex"
                        >
                            <RefreshIcon /> Reset
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    <BattleLog log={battleLog} winner={winner} />
                    
                    <div className="bg-gray-800 rounded-lg shadow-xl p-6 flex flex-col">
                         <h2 className="text-2xl font-bold text-purple-400 mb-4">AI Battle Summary</h2>
                        {winner && !summary && (
                             <button
                                onClick={handleGenerateSummary}
                                disabled={isGeneratingSummary}
                                className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-transform duration-200 hover:scale-105 flex items-center justify-center mx-auto"
                            >
                                {isGeneratingSummary ? "Generating..." : <><SparklesIcon /> Generate Summary</>}
                            </button>
                        )}
                        <BattleSummary summary={summary} isLoading={isGeneratingSummary} hasFinished={!!winner} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default App;
