import React from 'react';
import { Github, Twitter, Book } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-50 dark:bg-slate-800/50 py-12 px-4">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Structura
            </span>
            <p className="text-slate-600 dark:text-slate-300 mt-2">
              Write better JavaScript with confidence
            </p>
          </div>
          <div className="flex space-x-8">
            <a
              href="https://github.com/Dhruv-Jain31/structura-lang"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <Github size={20} className="mr-2" />
              GitHub
            </a>
            <a
              href="https://twitter.com/structuralang"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <Twitter size={20} className="mr-2" />
              Twitter
            </a>
            <a
              href="/docs"
              className="flex items-center text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <Book size={20} className="mr-2" />
              Documentation
            </a>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700 text-center text-slate-600 dark:text-slate-300">
          <p>© {new Date().getFullYear()} Structura. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}