
"use client";

import { useEffect, useState, useTransition } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Users, CheckCircle, Clock, Loader2, Building } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { Vendedor, VendorRequest, CorporateRequest } from '@/lib/schemas';
import { listVendedores, listVendorRequests, approveVendorRequest, listCorporateRequests } from './actions';


const ActiveVendorsTable = ({ vendors }: { vendors: Vendedor[] }) => (
    <Table>
        <TableHeader>
            <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Email</TableHead>
            <TableHead className="text-center">Referidos Activos</TableHead>
            <TableHead className="text-right">Comisiones Pagadas</TableHead>
            <TableHead className="text-center">Estado</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {vendors.length > 0 ? (
            vendors.map((vendedor) => (
                <TableRow key={vendedor.uid}>
                <TableCell className="font-medium">{vendedor.displayName}</TableCell>
                <TableCell>{vendedor.email}</TableCell>
                <TableCell className="text-center">{vendedor.activeReferrals || 0}</TableCell>
                <TableCell className="text-right">${(vendedor.totalCommission || 0).toFixed(2)}</TableCell>
                <TableCell className="text-center">
                    <Badge variant="secondary" className="bg-green-500/20 text-green-300">Activo</Badge>
                </TableCell>
                </TableRow>
            ))
            ) : (
            <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                Aún no hay vendedores activos.
                </TableCell>
            </TableRow>
            )}
        </TableBody>
    </Table>
);

const PendingRequestsTable = ({ requests, onApprove }: { requests: VendorRequest[], onApprove: (uid: string) => void }) => {
    const [isApproving, setIsApproving] = useState<string | null>(null);

    const handleApprove = (uid: string) => {
        setIsApproving(uid);
        onApprove(uid);
    }
    
    return (
        <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Fecha de Solicitud</TableHead>
                <TableHead className="text-right">Acción</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {requests.length > 0 ? (
                requests.map((request) => (
                    <TableRow key={request.uid}>
                    <TableCell className="font-medium">{request.displayName}</TableCell>
                    <TableCell>{request.email}</TableCell>
                    <TableCell>{new Date(request.requestedAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                        <Button size="sm" onClick={() => handleApprove(request.uid)} disabled={isApproving === request.uid}>
                           {isApproving === request.uid ? <Loader2 className="animate-spin" /> : <CheckCircle />}
                           Aprobar
                        </Button>
                    </TableCell>
                    </TableRow>
                ))
                ) : (
                <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                    No hay solicitudes pendientes.
                    </TableCell>
                </TableRow>
                )}
            </TableBody>
        </Table>
    );
};

const CorporateRequestsTable = ({ requests }: { requests: CorporateRequest[] }) => (
    <Table>
        <TableHeader>
            <TableRow>
                <TableHead>Empresa</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Código de Acceso</TableHead>
                <TableHead>Fecha de Solicitud</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {requests.length > 0 ? (
                requests.map((request) => (
                    <TableRow key={request.id}>
                        <TableCell className="font-medium">{request.companyName}</TableCell>
                        <TableCell>{request.contactName}</TableCell>
                        <TableCell>{request.contactEmail}</TableCell>
                        <TableCell>
                            <Badge variant="outline">{request.accessCode}</Badge>
                        </TableCell>
                        <TableCell>{new Date(request.requestedAt).toLocaleDateString()}</TableCell>
                    </TableRow>
                ))
            ) : (
                <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                        No hay solicitudes de planes corporativos.
                    </TableCell>
                </TableRow>
            )}
        </TableBody>
    </Table>
);



export default function AdminVendedoresPage() {
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [requests, setRequests] = useState<VendorRequest[]>([]);
  const [corporateRequests, setCorporateRequests] = useState<CorporateRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { profile, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const fetchData = async (adminUid: string) => {
    setLoading(true);
    setError(null);
    try {
        const [vendorsResult, requestsResult, corporateResult] = await Promise.all([
            listVendedores({ adminUid }),
            listVendorRequests({ adminUid }),
            listCorporateRequests({ adminUid })
        ]);

        if (vendorsResult.error) throw new Error(vendorsResult.error);
        setVendedores(vendorsResult.vendedores || []);
        
        if (requestsResult.error) throw new Error(requestsResult.error);
        setRequests(requestsResult.requests || []);

        if (corporateResult.error) throw new Error(corporateResult.error);
        setCorporateRequests(corporateResult.requests || []);

    } catch (e: any) {
        setError(e.message || "Un error inesperado ocurrió.");
    } finally {
        setLoading(false);
    }
  }

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    if (profile && profile.role !== 'admin') {
      setError("Acceso denegado. No tienes permisos para ver esta página.");
      setLoading(false);
      return;
    }
    if (user && profile) {
        fetchData(user.uid);
    }
  }, [profile, user, authLoading, router]);

  const handleApproveRequest = (uidToApprove: string) => {
    if (!user) return;
    startTransition(async () => {
        try {
            const result = await approveVendorRequest({ adminUid: user.uid, uidToApprove });
            if (result.success) {
                toast({
                    title: "Vendedor Aprobado",
                    description: "El usuario ha sido ascendido a vendedor y notificado.",
                });
                // Refresh data
                fetchData(user.uid);
            } else {
                throw new Error(result.error || "No se pudo aprobar la solicitud.");
            }
        } catch (e: any) {
             toast({
                title: "Error al Aprobar",
                description: e.message,
                variant: "destructive",
            });
        }
    });
  }


  if (loading || authLoading) {
    return (
      <div className="space-y-8">
        <div>
          <Skeleton className="h-10 w-1/2" />
          <Skeleton className="h-5 w-3/4 mt-2" />
        </div>
        <Card>
          <CardHeader><Skeleton className="h-8 w-1/4" /></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
        <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
        </Alert>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-primary flex items-center gap-3">
          <Users />
          Gestión de Vendedores
        </h1>
        <p className="text-muted-foreground mt-2">
          Supervisa a tus vendedores activos y gestiona las solicitudes pendientes.
        </p>
      </div>
      <Tabs defaultValue="active">
        <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="active">
                <CheckCircle className="mr-2"/> Vendedores Activos ({vendedores.length})
            </TabsTrigger>
            <TabsTrigger value="pending">
                <Clock className="mr-2"/> Solicitudes de Afiliación ({requests.length})
            </TabsTrigger>
            <TabsTrigger value="corporate">
                <Building className="mr-2"/> Solicitudes Corporativas ({corporateRequests.length})
            </TabsTrigger>
        </TabsList>
        <TabsContent value="active">
            <Card>
                <CardHeader>
                <CardTitle>Vendedores Activos</CardTitle>
                <CardDescription>
                    Una lista de todos los usuarios con el rol de vendedor.
                </CardDescription>
                </CardHeader>
                <CardContent>
                    <ActiveVendorsTable vendors={vendedores} />
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="pending">
            <Card>
                <CardHeader>
                <CardTitle>Solicitudes de Afiliación Pendientes</CardTitle>
                <CardDescription>
                    Usuarios que han solicitado convertirse en vendedores.
                </CardDescription>
                </CardHeader>
                <CardContent>
                    <PendingRequestsTable requests={requests} onApprove={handleApproveRequest} />
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="corporate">
            <Card>
                <CardHeader>
                    <CardTitle>Solicitudes de Planes Corporativos</CardTitle>
                    <CardDescription>
                        Empresas que han solicitado información sobre los planes corporativos.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <CorporateRequestsTable requests={corporateRequests} />
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
