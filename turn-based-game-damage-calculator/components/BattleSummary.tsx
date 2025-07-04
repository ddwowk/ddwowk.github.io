
import React from 'react';
import { SparklesIcon } from './icons';

interface BattleSummaryProps {
    summary: string;
    isLoading: boolean;
    hasFinished: boolean;
}

const BattleSummary: React.FC<BattleSummaryProps> = ({ summary, isLoading, hasFinished }) => {
    return (
        <div className="bg-gray-900 rounded-md p-4 flex-grow h-96 overflow-y-auto mt-4">
            {isLoading && (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <SparklesIcon className="animate-pulse h-12 w-12 mb-4 text-purple-400" />
                    <p className="text-lg">The AI is chronicling the epic tale...</p>
                </div>
            )}
            {!isLoading && !summary && (
                 <div className="flex items-center justify-center h-full text-gray-500">
                    <p>{hasFinished ? "Generate a summary to see the story of the battle." : "Finish the battle to generate a summary."}</p>
                </div>
            )}
            {!isLoading && summary && (
                <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{summary}</p>
            )}
        </div>
    );
};

export default BattleSummary;
