import Image from "next/image";

type LogoProps = {
  variant?: "default" | "beige";
  className?: string;
};

export default function Logo({ variant = "default", className = "" }: LogoProps) {
  const src = variant === "beige"
    ? "/logo/sommelierpro-beige.svg"
    : "/logo/default.svg"; // puedes cambiar o eliminar esto si no usas otro logo

  return (
    <Image
      src={src}
      alt="SommelierPro AI"
      width={40}
      height={40}
      className={className}
      priority
    />
  );
}
