import Image from "next/image";

export function AuthLogo() {
  return (
    <div className="flex justify-center mb-6">
      <Image
        src="/icons/logo-icon.svg"
        alt="PesaPeak"
        width={120}
        height={40}
        className="w-[120px] h-auto"
        priority
      />
    </div>
  );
}
