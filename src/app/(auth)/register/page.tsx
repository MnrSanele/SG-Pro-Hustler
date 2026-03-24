import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RegisterForm } from "@/components/auth/register-form";
import { APP_NAME } from "@/lib/constants";

export const metadata = { title: "Create Account" };

interface RegisterPageProps {
  searchParams: Promise<{ role?: string }>;
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const params = await searchParams;
  const initialRole = params.role?.toLowerCase() === "provider" ? "PROVIDER" : "REQUESTER";

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <Link href="/" className="text-2xl font-bold">{APP_NAME}</Link>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Create an account</CardTitle>
            <CardDescription>Join {APP_NAME} to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <RegisterForm initialRole={initialRole} />
          </CardContent>
          <CardFooter>
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline">Sign in</Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
