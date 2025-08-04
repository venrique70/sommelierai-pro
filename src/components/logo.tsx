import { Wine } from 'lucide-react';

export function Logo() {
  return (
    <div className="flex items-center gap-2 font-bold text-lg text-primary">
      <Wine className="size-6" />
      <span className="font-headline">SommelierPro AI</span>
    </div>
  );
}
