import Link from "next/link";
import dynamic from 'next/dynamic';
const AdminLink = dynamic(() => import('@/components/admin/AdminLink'), { ssr: false });





export default function Footer() {


  return (


    <footer className="border-t py-8 text-sm opacity-80">


      <div className="mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4 px-6">


        <p>Â© {new Date().getFullYear()} SommelierPro AI</p>


        <nav className="flex items-center gap-4">


          <Link href="/legal" className="hover:underline">Legal</Link>


        </nav>


      </div>


      <AdminLink />
</footer>


  );


}



