
import {
  Grape,
  Fish,
  Drumstick,
  Utensils,
  Salad,
  LucideIcon,
  FishSymbol
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  carne: Drumstick,
  carnes: Drumstick,
  caza: Drumstick,
  pescado: Fish,
  pescados: Fish,
  mariscos: FishSymbol,
  queso: Grape,
  quesos: Grape,
  guiso: Utensils,
  sopa: Utensils,
  ensalada: Salad,
  comida: Utensils
};

function getIconByText(text: string): LucideIcon {
  const lower = text.toLowerCase();
  const entry = Object.entries(iconMap).find(([key]) => lower.includes(key));
  return entry?.[1] ?? Utensils; // Always return a valid icon
}

export function PairingList({ text }: { text?: string | null }) {
  if (!text) {
    return null;
  }
  
  const items = text
    .split("\n")
    .map(line => line.replace(/^\d+\.\s*/, "").trim())
    .filter(line => !!line)
    .map(line => {
      const [label, ...rest] = line.split(":");
      const explanation = rest.join(":").trim() || "Excelente combinación para este vino.";
      const Icon = getIconByText(label);
      return { label: label.trim(), explanation, icon: Icon };
    });

  return (
    <ul className="space-y-6">
      {items.map((item, index) => (
        <li key={index} className="flex items-start gap-3">
          <item.icon className="w-6 h-6 mt-1 text-primary flex-shrink-0" />
          <div>
            <p className="font-semibold text-foreground">{item.label}</p>
            <p className="text-muted-foreground">{item.explanation}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

    