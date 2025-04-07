import React from 'react';

interface OutputDisplayProps {
  output: string;
  type: 'tokens' | 'parseTree' | 'compiled' | 'tac' | null;
}

export function OutputDisplay({ output, type }: OutputDisplayProps) {
  if (!type || !output) return null;

  const titles: { [key: string]: string } = {
    tokens: 'Tokens',
    parseTree: 'Parse Tree',
    compiled: 'Compiled Output',
    tac: 'Three-Address Code'
  };

  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-3">{titles[type]}</h2>
      <pre 
        className="p-4 bg-slate-800 text-slate-50 rounded-lg overflow-x-auto overflow-y-auto font-mono text-sm"
        style={{
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all',
          maxHeight: '500px'
        }}
      >
        {output}
      </pre>
    </div>
  );
}
