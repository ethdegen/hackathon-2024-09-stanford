import Image from "next/image";

export default function AuthLayout({ children }: any) {
  return (
    <div className="min-h-screen flex justify-center items-center">
      <div className="flex flex-col gap-4 items-center justify-center">
        <Image src="/brand.svg" alt="motionly" width="120" height="32" />
        <p className="text-sm">Motions drafted automagically</p>
        {children}
      </div>
    </div>
  );
}
