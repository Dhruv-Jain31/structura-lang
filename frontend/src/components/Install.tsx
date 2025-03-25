import React from 'react';
import { Terminal, Copy } from 'lucide-react';

export function Install() {
  const copyCommand = () => {
    navigator.clipboard.writeText('npm install structura');
  };

  return (
    <section id="install" className="py-20 px-4">
      <div className="container mx-auto max-w-4xl">
        <h2 className="text-3xl font-bold text-center mb-12">
          Get Started with Structura
        </h2>
        <div className="bg-slate-900 rounded-xl p-4 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Terminal size={20} className="text-slate-400 mr-2" />
              <span className="text-slate-400">Installation</span>
            </div>
            <button
              onClick={copyCommand}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              title="Copy to clipboard"
            >
              <Copy size={16} className="text-slate-400" />
            </button>
          </div>
          <pre className="text-blue-400 font-mono">npm install structura</pre>
        </div>
        <div className="text-center">
          <p className="text-slate-600 dark:text-slate-300 mb-6">
            After installation, import Structura in your project:
          </p>
          <pre className="bg-slate-900 rounded-xl p-4 text-left inline-block min-w-[300px]">
            <code className="text-blue-400 font-mono">
              import {'{'} compile {'}'} from 'structura';
            </code>
          </pre>
        </div>
      </div>
    </section>
  );
}