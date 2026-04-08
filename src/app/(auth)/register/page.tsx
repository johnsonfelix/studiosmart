import { RegisterForm } from "@/components/auth/register-form";

export const metadata = {
  title: "Register | StudioSmart",
  description: "Create a new studio account",
};

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <RegisterForm />
    </div>
  );
}
