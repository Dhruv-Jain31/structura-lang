import React from 'react';
import { Code2, FunctionSquare as Function, CheckCircle2, Boxes, PlayCircle, Download, Github, BookOpen, Moon, Palette } from 'lucide-react';

const features = [
  {
    icon: Code2,
    title: 'Custom Language Compiler',
    description: 'Strict runtime checks for JavaScript code with advanced compilation features'
  },
  {
    icon: Function,
    title: 'Built-in Functions',
    description: 'Rich set of built-in functions for common operations like abs, print, and more'
  },
  {
    icon: CheckCircle2,
    title: 'Type Checking & IR',
    description: 'Robust type checking and intermediate representation generation'
  },
  {
    icon: Boxes,
    title: 'Extensible Design',
    description: 'Define custom functions and types to extend the language capabilities'
  },
  {
    icon: PlayCircle,
    title: 'Interactive Playground',
    description: 'Try Structura directly in your browser with our live compiler'
  },
  {
    icon: Download,
    title: 'Easy Installation',
    description: 'Simple npm installation process to get started quickly'
  },
  {
    icon: Github,
    title: 'Open Source',
    description: 'Fully open source and community driven development'
  },
  {
    icon: BookOpen,
    title: 'Documentation',
    description: 'Comprehensive guides and tutorials for all skill levels'
  },
  {
    icon: Palette,
    title: 'Modern UI/UX',
    description: 'Beautiful, responsive interface with smooth animations'
  }
];

export function Features() {
  return (
    <section id="features" className="py-20 px-4">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">
          Everything You Need for Better Code
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="p-6 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
              >
                <Icon size={32} className="text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-slate-600 dark:text-slate-300">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}