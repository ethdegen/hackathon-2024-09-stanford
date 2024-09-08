import AuthLayout from "@/components/AuthLayout";
import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <AuthLayout>
      <SignIn />
    </AuthLayout>
  );
}
