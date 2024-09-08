import { auth } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const session = auth();
  const name = (session.sessionClaims?.first_name as string) ?? "";

  return (
    <div className="flex flex-col justify-center items-center">
      <Image
        src="/welcome.jpg"
        width="450"
        height="300"
        alt="Welcome onboard!"
      />
      <h1 className="text-4xl font-normal">Hey {name} 👋</h1>
      <p className="my-4 text-gray-400 w-[450px] text-center">
        Let&apos;s start drafting some discovery motions. <br /> First, let us
        know which{" "}
        <span className="font-medium text-gray-500">discovery request</span> do
        you plan to draft a motion for?
      </p>

      <div className="flex gap-4">
        <Link href="/app/propound-request" className="btn-violet">
          Propound
        </Link>
        <Link href="/app/respond-request" className="btn-blue">
          Respond
        </Link>
      </div>
    </div>
  );
}
