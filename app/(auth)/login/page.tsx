import LoginForm from "@/components/auth/LoginForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | Herald Dev Dashboard",
  description: "Connect your registered wallet to access the Herald Developer Dashboard.",
};

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-navy px-4 overflow-x-hidden">
      {/* Background glow effects */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
        <div className="h-[400px] w-[600px] max-w-full rounded-full bg-teal/5 blur-[120px] mix-blend-screen" />
        <div className="absolute top-1/4 right-1/4 h-[300px] w-[300px] rounded-full bg-purple/5 blur-[100px] mix-blend-screen" />
      </div>

      <LoginForm />
    </div>
  );
}
