export const runtime = 'nodejs';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import SellersManager from '@/components/vendors/SellersManager';
import { getVendors, listVendorRequests } from '@/lib/actions/vendors';

export const metadata = { title: 'Vendedores | Admin' };

export default async function Page() {
  const [vendors, requests] = await Promise.all([
    getVendors(),
    listVendorRequests({ status: 'pending' }),
  ]);

  return (
    <main className="mx-auto max-w-6xl p-6">
      {/* NAV ADMIN */}
      <div className="mb-4 flex flex-wrap gap-2">
        <Link href="/admin/vendors"><Button variant="default">Vendedores</Button></Link>
        <Link href="/admin/corporate"><Button variant="outline">Corporativo</Button></Link>
        <Link href="/admin/corporate?tab=affiliates"><Button variant="outline">Afiliados</Button></Link>
      </div>

      <SellersManager initialVendors={vendors} initialRequests={requests} />
    </main>
  );
}
