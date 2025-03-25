import React, { useState } from 'react';
import { Play } from 'lucide-react';
import axios from 'axios';
import { OutputDisplay } from './OutputDisplay';

export function Playground() {
  const [code, setCode] = useState(`// Try Structura here
const numbers = [1, 2, 3, 4, 5];
const sum = sumNumbers(numbers);
print("Sum:", sum);`);
  
  const [result, setResult] = useState('');
  const [resultType, setResultType] = useState<'tokens' | 'parseTree' | 'compiled' | null>(null);

  // Base URL for your API
  const API_BASE_URL = 'http://localhost:5000/api';

  const handleRun = async (endpoint: 'lexer' | 'parser' | 'ir' | 'run') => {
    try {
      const response = await axios.post(`${API_BASE_URL}/${endpoint}`, { code });
      
      // If the response data is an object and has an 'output' property, use it directly.
      let output: string;
      if (response.data && typeof response.data.output === 'string') {
        output = response.data.output;
      } else if (typeof response.data === 'string') {
        output = response.data;
      } else {
        output = JSON.stringify(response.data, null, 2);
      }
      
      // Set the result type based on endpoint
      if (endpoint === 'lexer') {
        setResultType('tokens');
      } else if (endpoint === 'parser') {
        setResultType('parseTree');
      } else if (endpoint === 'ir') {
        // If you have a dedicated IR type, use that instead
        setResultType('compiled');
      } else if (endpoint === 'run') {
        setResultType('compiled');
      }
      
      setResult(output);
    } catch (error) {
      console.error(error);
      const errMsg = error.response ? error.response.data.error : error.message;
      setResult('Error: ' + errMsg);
      setResultType(null);
    }
  };

  return (
    <section id="playground" className="py-20 px-4 bg-slate-50 dark:bg-slate-800/50">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Try Structura Now</h2>
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg overflow-hidden">
            <div className="border-b border-slate-200 dark:border-slate-700 p-4 flex items-center justify-between">
              <span className="text-sm font-medium">Playground</span>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleRun("lexer")}
                  className="inline-flex items-center px-3 py-1.5 rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors text-sm"
                >
                  Lex Tokens
                </button>
                <button
                  onClick={() => handleRun("parser")}
                  className="inline-flex items-center px-3 py-1.5 rounded-md bg-yellow-600 text-white hover:bg-yellow-700 transition-colors text-sm"
                >
                  Parse Tree
                </button>
                <button
                  onClick={() => handleRun("ir")}
                  className="inline-flex items-center px-3 py-1.5 rounded-md bg-purple-600 text-white hover:bg-purple-700 transition-colors text-sm"
                >
                  IR Generation
                </button>
                <button
                  onClick={() => handleRun("run")}
                  className="inline-flex items-center px-3 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm"
                >
                  <Play size={16} className="mr-1" />
                  Run Code
                </button>
              </div>
            </div>
            <div className="p-4">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-48 p-4 font-mono text-sm bg-slate-50 dark:bg-slate-800 rounded-lg 
                           border border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-1 
                           focus:ring-blue-500 outline-none resize-none"
                spellCheck={false}
              />
            </div>
            <div className="p-4 border-t border-slate-200 dark:border-slate-700">
              <OutputDisplay output={result} type={resultType} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
