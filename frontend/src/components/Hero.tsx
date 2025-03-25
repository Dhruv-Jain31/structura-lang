import React from 'react';
import { ArrowRight } from 'lucide-react';

export function Hero() {
  return (
    <section className="pt-32 pb-20 px-4">
      <div className="container mx-auto text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Write Better JavaScript with Structura
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-300 mb-12 max-w-2xl mx-auto">
          A powerful compiler that brings strict runtime checks, built-in functions, and robust type checking to your JavaScript code.
        </p>
        <div className="flex justify-center gap-6">
          <a
            href="#playground"
            className="inline-flex items-center px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            Try Playground
            <ArrowRight size={20} className="ml-2" />
          </a>
          <a
            href="#install"
            className="inline-flex items-center px-6 py-3 rounded-lg border-2 border-slate-200 dark:border-slate-700 hover:border-blue-600 dark:hover:border-blue-500 transition-colors"
          >
            Install Now
          </a>
        </div>
      </div>
    </section>
  );
}