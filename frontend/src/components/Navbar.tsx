import React from 'react';
import { Sun, Moon, Github } from 'lucide-react';

interface NavbarProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export function Navbar({ isDarkMode, toggleDarkMode }: NavbarProps) {
  return (
    <nav className="fixed w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Structura
            </span>
          </div>
          
          <div className="flex items-center space-x-6">
            <a href="#features" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Features</a>
            <a href="#playground" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Playground</a>
            <a href="#install" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Install</a>
            <a
              href="https://github.com/Dhruv-Jain31/structura-lang"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <Github size={20} />
            </a>
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}