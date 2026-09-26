import Image from "next/image";

export function Logo({
  name,
  initials,
  logoUrl,
}: {
  name: string;
  initials: string;
  logoUrl?: string;
}) {
  return logoUrl ? (
    <Image
      src={logoUrl}
      alt={name}
      width={32}
      height={32}
      className="h-8 w-8 flex-none rounded-lg object-cover"
    />
  ) : (
    <span className="mark">{initials}</span>
  );
}