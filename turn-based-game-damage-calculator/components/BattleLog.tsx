
import React, { useRef, useEffect } from 'react';
import { BattleLogEntry } from '../types';

interface BattleLogProps {
    log: BattleLogEntry[];
    winner: string | null;
}

const BattleLog: React.FC<BattleLogProps> = ({ log, winner }) => {
    const logEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [log]);

    const getMessageStyle = (message: string) => {
        if (message.startsWith('---')) return 'text-cyan-400 font-bold mt-2';
        if (message.includes('attacks')) return 'text-red-400';
        if (message.includes('gains') || message.includes('uses')) return 'text-green-400';
        if (message.includes('afflicted')) return 'text-yellow-400';
        if (message.startsWith('**')) return 'text-2xl text-green-400 font-bold text-center py-4';
        return 'text-gray-300';
    };

    return (
        <div className="bg-gray-800 rounded-lg shadow-xl p-6 flex flex-col">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">Battle Log</h2>
            <div className="bg-gray-900 rounded-md p-4 flex-grow h-96 overflow-y-auto">
                {log.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        <p>Simulation has not started yet.</p>
                    </div>
                ) : (
                    log.map((entry, index) => (
                        <p key={index} className={`mb-1 ${getMessageStyle(entry.message)}`}>
                            {entry.message}
                        </p>
                    ))
                )}
                <div ref={logEndRef} />
            </div>
        </div>
    );
};

export default BattleLog;
