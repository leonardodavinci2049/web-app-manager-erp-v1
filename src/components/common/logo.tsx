import Image from "next/image";

export default function Logo() {
  return (
    <div className="mt-4 flex flex-col items-center justify-center">
      <Image
        src="/images/logo/logo-header.png"
        alt={`${process.env.NEXT_PUBLIC_COMPANY_NAME || "Logo"} Logo`}
        width={200}
        height={64}
        className="h-16 w-auto sm:h-20"
      />
    </div>
  );
}
