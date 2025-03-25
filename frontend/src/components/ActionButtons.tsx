import React from 'react';
import { Play, Code2, GitGraph, Sun, Moon } from 'lucide-react';

interface ActionButtonsProps {
  onShowTokens: () => void;
  onShowParseTree: () => void;
  onCompile: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export function ActionButtons({
  onShowTokens,
  onShowParseTree,
  onCompile,
  isDarkMode,
  toggleDarkMode,
}: ActionButtonsProps) {
  const ButtonClass = "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors";
  
  return (
    <div className="flex flex-wrap gap-4 my-6">
      <button
        onClick={onShowTokens}
        className={`${ButtonClass} bg-blue-600 hover:bg-blue-700 text-white`}
      >
        <Code2 size={20} />
        Show Tokens
      </button>
      
      <button
        onClick={onShowParseTree}
        className={`${ButtonClass} bg-green-600 hover:bg-green-700 text-white`}
      >
        <GitGraph size={20} />
        Show Parse Tree
      </button>
      
      <button
        onClick={onCompile}
        className={`${ButtonClass} bg-purple-600 hover:bg-purple-700 text-white`}
      >
        <Play size={20} />
        Compile
      </button>

      <button
        onClick={toggleDarkMode}
        className={`${ButtonClass} bg-slate-600 hover:bg-slate-700 text-white ml-auto`}
      >
        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        {isDarkMode ? 'Light Mode' : 'Dark Mode'}
      </button>
    </div>
  );
}