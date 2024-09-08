import Navbar from "@/components/Navbar";

export default function AppLayout({ children }: any) {
  return (
    <main className="min-h-screen">
      <Navbar />
      {children}
    </main>
  );
}
