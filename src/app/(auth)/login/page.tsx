import { LoginForm } from "@/components/auth/login-form";

export const metadata = {
  title: "Login | StudioSmart",
  description: "Login to your account",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <LoginForm />
    </div>
  );
}
