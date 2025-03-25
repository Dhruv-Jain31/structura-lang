import React from 'react';

interface EditorProps {
  code: string;
  setCode: (code: string) => void;
}

export function Editor({ code, setCode }: EditorProps) {
  return (
    <div className="w-full">
      <textarea
        className="w-full h-64 p-4 font-mono text-sm bg-slate-800 text-slate-50 rounded-lg 
                   border border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 
                   focus:outline-none resize-none"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Enter your code here..."
        spellCheck={false}
      />
    </div>
  );
}