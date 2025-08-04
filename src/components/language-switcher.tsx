'use client';

import { Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Language } from '@/lib/translations';

interface LanguageSwitcherProps {
  language: Language;
  setLanguage: (language: Language) => void;
}

export function LanguageSwitcher({ language, setLanguage }: LanguageSwitcherProps) {
  return (
    <div className="fixed bottom-5 right-5 z-50">
      <div className="flex items-center space-x-1 rounded-full bg-secondary p-1 border border-input">
        <div className="p-2">
            <Globe className="size-5 text-primary" />
        </div>
        <button
          onClick={() => setLanguage('es')}
          className={cn(
            'rounded-full px-5 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            language === 'es'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-accent'
          )}
        >
          Español
        </button>
        <button
          onClick={() => setLanguage('en')}
          className={cn(
            'rounded-full px-5 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            language === 'en'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-accent'
          )}
        >
          English
        </button>
      </div>
    </div>
  );
}
