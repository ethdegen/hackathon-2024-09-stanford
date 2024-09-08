import { SignInButton, UserButton, auth } from "@clerk/nextjs";
import Link from "next/link";
import NavLink from "./NavLink";
import Image from "next/image";

const Navbar = () => {
  const { sessionId } = auth();

  return (
    <nav className="border-b border-gray-200">
      <div className="max-w-6xl mx-auto flex justify-between p-3">
        <div className="flex gap-8 items-center">
          <Link href="/app">
            <Image src="/brand.svg" alt="motionly" width="120" height="32" />
          </Link>
          <NavLink href="/app/propound-request">Propound</NavLink>
          <NavLink href="/app/respond-request">Respond</NavLink>
        </div>
        {!sessionId ? <SignInButton /> : <UserButton afterSignOutUrl="/" />}
      </div>
    </nav>
  );
};

export default Navbar;
