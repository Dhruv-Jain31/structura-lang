import React, { useState } from 'react';
import { Play } from 'lucide-react';

export function Playground() {
  const [code, setCode] = useState(`// Try Structura here
const numbers = [1, 2, 3, 4, 5];
const sum = sumNumbers(numbers);
print("Sum:", sum);`);

  return (
    <section id="playground" className="py-20 px-4 bg-slate-50 dark:bg-slate-800/50">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">
          Try Structura Now
        </h2>
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg overflow-hidden">
            <div className="border-b border-slate-200 dark:border-slate-700 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Playground</span>
                <button
                  className="inline-flex items-center px-3 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm"
                >
                  <Play size={16} className="mr-1" />
                  Run
                </button>
              </div>
            </div>
            <div className="p-4">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-48 p-4 font-mono text-sm bg-slate-50 dark:bg-slate-800 rounded-lg 
                         border border-slate-200 dark:border-slate-700 focus:border-blue-500 
                         focus:ring-1 focus:ring-blue-500 outline-none resize-none"
                spellCheck={false}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}