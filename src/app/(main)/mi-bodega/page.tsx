"use client";

import { useState, useEffect, useTransition } from "react";
import { Archive, PlusCircle, MoreHorizontal, Wine, Loader2, Info, Edit, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  WineInCellarClientSchema,
  type WineInCellar,
  type WineInCellarFormValues,
} from "@/lib/schemas";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { addWineAction, updateWineAction, deleteWineAction, listWinesAction } from './actions';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

const LoadingSkeleton = () => (
  <div className="space-y-8">
    <div className="flex justify-between items-start">
      <div>
        <Skeleton className="h-10 w-80" />
        <Skeleton className="h-5 w-96 mt-2" />
      </div>
      <Skeleton className="h-12 w-32" />
    </div>
    <Card>
      <CardHeader>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-5 w-64 mt-2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
        </div>
      </CardContent>
    </Card>
  </div>
);

const AddWineDialog = ({ open, onOpenChange, onWineAdded }: { open: boolean, onOpenChange: (open: boolean) => void, onWineAdded: () => void }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const form = useForm<WineInCellarFormValues>({
    resolver: zodResolver(WineInCellarClientSchema),
    defaultValues: { name: "", variety: "", year: new Date().getFullYear(), quantity: 1, status: "Listo para Beber" }
  });

  const onSubmit = (data: WineInCellarFormValues) => {
    if (!user) {
      toast({ title: "Error de autenticación", description: "Debes iniciar sesión para añadir un vino.", variant: "destructive" });
      return;
    }
    startTransition(async () => {
      try {
        const result = await addWineAction({ uid: user.uid, ...data });
        if (result.success) {
          onWineAdded();
          toast({ title: "¡Vino Añadido!", description: `${data.name} ha sido guardado en tu bodega.` });
          onOpenChange(false);
          form.reset();
        } else {
          throw new Error(result.error || "No se pudo añadir el vino.");
        }
      } catch (e: any) {
        toast({ title: "Error", description: e.message, variant: "destructive" });
      }
    });
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Añadir un Nuevo Vino</DialogTitle><DialogDescription>Completa los detalles del vino que quieres catalogar.</DialogDescription></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Nombre del Vino</FormLabel><FormControl><Input placeholder="ej. Catena Zapata Malbec" {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="variety" render={({ field }) => (<FormItem><FormLabel>Cepa / Variedad</FormLabel><FormControl><Input placeholder="ej. Malbec" {...field} /></FormControl><FormMessage /></FormItem>)} />
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="year" render={({ field }) => (<FormItem><FormLabel>Año</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="quantity" render={({ field }) => (<FormItem><FormLabel>Cantidad</FormLabel><FormControl><Input type="number" min="1" {...field} /></FormControl><FormMessage /></FormItem>)} />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button type="submit" disabled={isPending}>{isPending ? <Loader2 className="animate-spin" /> : 'Guardar Vino'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

const EditWineDialog = ({ wine, open, onOpenChange, onWineUpdated }: { wine: WineInCellar | null, open: boolean, onOpenChange: (open: boolean) => void, onWineUpdated: () => void }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const form = useForm<WineInCellarFormValues>({ resolver: zodResolver(WineInCellarClientSchema) });

  useEffect(() => {
    if (wine) {
      form.reset(wine);
    }
  }, [wine, form]);

  const onSubmit = (data: WineInCellarFormValues) => {
    if (!user || !wine) {
      toast({ title: "Error de autenticación", description: "Debes iniciar sesión para actualizar un vino.", variant: "destructive" });
      return;
    }
    
    startTransition(async () => {
      try {
        const result = await updateWineAction({ uid: user.uid, wineId: wine.id, ...data });
        if (result.success) {
          onWineUpdated();
          toast({ title: "¡Vino Actualizado!", description: `${data.name} ha sido actualizado.` });
          onOpenChange(false);
        } else {
          throw new Error(result.error || "No se pudo actualizar el vino.");
        }
      } catch (e: any) {
        toast({ title: "Error", description: e.message, variant: "destructive" });
      }
    });
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Editar Vino</DialogTitle><DialogDescription>Actualiza los detalles de este vino en tu bodega.</DialogDescription></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Nombre del Vino</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="variety" render={({ field }) => (<FormItem><FormLabel>Cepa / Variedad</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="year" render={({ field }) => (<FormItem><FormLabel>Año</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="quantity" render={({ field }) => (<FormItem><FormLabel>Cantidad</FormLabel><FormControl><Input type="number" min="0" {...field} /></FormControl><FormMessage /></FormItem>)} />
            </div>
            <FormField control={form.control} name="status" render={({ field }) => (<FormItem><FormLabel>Estado</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Listo para Beber">Listo para Beber</SelectItem><SelectItem value="Necesita Guarda">Necesita Guarda</SelectItem><SelectItem value="En su punto">En su punto</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button type="submit" disabled={isPending}>{isPending ? <Loader2 className="animate-spin" /> : 'Guardar Cambios'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default function MiBodegaPage() {
  const [wines, setWines] = useState<WineInCellar[]>([]);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [selectedWine, setSelectedWine] = useState<WineInCellar | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const fetchWines = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const result = await listWinesAction({ uid: user.uid });
      if (result.error) {
        setError(result.error);
      } else {
        // Convierte el resultado completo a un objeto plano para eliminar prototipos no serializables
        const plainResult = JSON.parse(JSON.stringify(result));
        // Mapea los datos devueltos para que coincidan con WineInCellar
        const mappedWines: WineInCellar[] = (plainResult.wines || []).map((wine: any) => ({
          id: wine.id || "",
          name: wine.name || "",
          variety: wine.variety || "",
          year: wine.year || new Date().getFullYear(),
          quantity: wine.quantity || 0,
          status: wine.status || "Listo para Beber",
          dateAdded: wine.dateAdded || wine.addedAt || new Date().toISOString(),
        }));
        setWines(mappedWines);
      }
    } catch (e: any) {
      setError(e.message || "Error al cargar los vinos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    fetchWines();
  }, [user, authLoading, router]);

  const handleDeleteWine = async () => {
    if (!user || !selectedWine) return;
    startTransition(async () => {
      try {
        const result = await deleteWineAction({ uid: user.uid, wineId: selectedWine.id });
        if (result.success) {
          toast({ title: "Vino Eliminado", description: `${selectedWine.name} fue eliminado de tu bodega.` });
          fetchWines(); // Re-fetch wines after deletion
        } else {
          throw new Error(result.error || "No se pudo eliminar el vino.");
        }
      } catch (e: any) {
        toast({ title: "Error", description: e.message, variant: "destructive" });
      } finally {
        setSelectedWine(null);
      }
    });
  };

  const openEditDialog = (wine: WineInCellar) => {
    setSelectedWine(wine);
    setIsEditFormOpen(true);
  };
  
  const openDeleteDialog = (wine: WineInCellar) => {
    setSelectedWine(wine);
    setIsDeleteAlertOpen(true);
  };
    
  if (authLoading || loading) return <LoadingSkeleton />;
  if (!user) { router.push('/login'); return <LoadingSkeleton />; }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-primary flex items-center gap-3"><Archive /> Mi Bodega Personal</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">Aquí puedes gestionar tu colección de vinos. Añade botellas, lleva un registro y pronto recibirás recomendaciones personalizadas.</p>
        </div>
        <Button size="lg" onClick={() => setIsAddFormOpen(true)}><PlusCircle className="mr-2" />Añadir Vino</Button>
      </div>

      <Card>
        <CardHeader><CardTitle>Tu Colección</CardTitle><CardDescription>{wines.length > 0 ? `Tienes ${wines.length} tipos de vino diferentes.` : "Tu bodega está vacía."}</CardDescription></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead className="w-[40%]">Vino</TableHead><TableHead>Año</TableHead><TableHead className="text-center">Cantidad</TableHead><TableHead>Estado</TableHead><TableHead><span className="sr-only">Acciones</span></TableHead></TableRow></TableHeader>
            <TableBody>
              {error && <TableRow><TableCell colSpan={5}><Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert></TableCell></TableRow>}
              {wines.length > 0 ? (
                wines.map((wine) => (
                  <TableRow key={wine.id}>
                    <TableCell className="font-medium"><div className="flex items-center gap-3"><Wine className="text-primary/70" /><div><p>{wine.name}</p><p className="text-sm text-muted-foreground">{wine.variety}</p></div></div></TableCell>
                    <TableCell>{wine.year}</TableCell>
                    <TableCell className="text-center">{wine.quantity}</TableCell>
                    <TableCell><Badge variant={wine.status === 'En su punto' ? 'default' : 'secondary'} className={wine.status === 'En su punto' ? "bg-green-600/80 text-white" : ""}>{wine.status}</Badge></TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button aria-haspopup="true" size="icon" variant="ghost"><MoreHorizontal className="h-4 w-4" /><span className="sr-only">Toggle menu</span></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => openEditDialog(wine)}><Edit className="mr-2 h-4 w-4" />Editar</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openDeleteDialog(wine)} className="text-destructive focus:text-destructive"><Trash2 className="mr-2 h-4 w-4" />Eliminar</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={5} className="h-48 text-center"><p className="font-semibold">Tu bodega está esperando.</p><p className="text-muted-foreground">Usa el botón "Añadir Vino" para empezar.</p></TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <AddWineDialog open={isAddFormOpen} onOpenChange={setIsAddFormOpen} onWineAdded={fetchWines} />
      <EditWineDialog wine={selectedWine} open={isEditFormOpen} onOpenChange={setIsEditFormOpen} onWineUpdated={fetchWines} />

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>¿Estás seguro?</AlertDialogTitle><AlertDialogDescription>Esta acción no se puede deshacer. Esto eliminará permanentemente el vino "{selectedWine?.name}" de tu bodega.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedWine(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteWine} disabled={isPending} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isPending ? <Loader2 className="animate-spin" /> : "Sí, eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}