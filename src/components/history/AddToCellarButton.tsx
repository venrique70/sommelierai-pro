// src/components/history/AddToCellarButton.tsx
import { Button } from "@/components/ui/button";

interface AddToCellarButtonProps {
  name: string;
  year: number | null;
  variety: string;
}

export default function AddToCellarButton({ name, year, variety }: AddToCellarButtonProps) {
  const handleAddToCellar = () => {
    alert(`Añadiendo ${name} ${year || ""} (${variety}) a la bodega`);
    // Aquí puedes añadir la lógica para guardar en Firestore (por ejemplo, usando el código de HistoryCard)
  };

  return (
    <Button
      onClick={handleAddToCellar}
      className="bg-emerald-600 hover:bg-emerald-700 text-white"
    >
      Añadir a Mi Bodega
    </Button>
  );
}