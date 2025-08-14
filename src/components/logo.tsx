import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/" className="flex items-center gap-3">
      <img
        src="/logo/sommelierpro-beige.svg"
        alt="SommelierPro AI"
        className="h-8 w-8"
        aria-hidden="true"
      />
      <span className="text-2xl font-semibold">SommelierPro AI</span>
    </Link>
  );
}
