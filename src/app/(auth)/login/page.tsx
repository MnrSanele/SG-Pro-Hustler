import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/components/auth/login-form";
import { APP_NAME } from "@/lib/constants";

export const metadata = { title: "Sign In" };

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <Link href="/" className="text-2xl font-bold">{APP_NAME}</Link>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Welcome back</CardTitle>
            <CardDescription>Sign in to your account to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-primary hover:underline">Sign up</Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
