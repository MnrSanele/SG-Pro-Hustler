"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { registerAction } from "@/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface RegisterFormProps {
  initialRole?: "REQUESTER" | "PROVIDER";
}

export function RegisterForm({ initialRole = "REQUESTER" }: RegisterFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"REQUESTER" | "PROVIDER">(initialRole);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        setError(null);

        startTransition(async () => {
          const result = await registerAction({ name, email, password, role });
          if (!result.success) {
            setError(result.error ?? "Unable to create account");
            return;
          }

          router.push(result.redirectTo ?? "/dashboard");
          router.refresh();
        });
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          placeholder="Your full name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Minimum 8 characters"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="role">I want to join as</Label>
        <select
          id="role"
          value={role}
          onChange={(event) => setRole(event.target.value as "REQUESTER" | "PROVIDER")}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="REQUESTER">Requester</option>
          <option value="PROVIDER">Provider</option>
        </select>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button className="w-full" disabled={isPending}>
        {isPending ? "Creating account..." : "Create Account"}
      </Button>
    </form>
  );
}
