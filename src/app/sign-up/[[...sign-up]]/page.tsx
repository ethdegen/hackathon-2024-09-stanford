import AuthLayout from "@/components/AuthLayout";
import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <AuthLayout>
      <SignUp />
    </AuthLayout>
  );
}
