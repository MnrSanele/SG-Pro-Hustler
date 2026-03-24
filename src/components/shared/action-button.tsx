"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";

interface ActionResult {
  success: boolean;
  error?: string;
  redirectTo?: string;
}

interface ActionButtonProps {
  action: () => Promise<ActionResult>;
  children: React.ReactNode;
  pendingLabel?: string;
  variant?: "default" | "outline" | "secondary" | "destructive" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function ActionButton({
  action,
  children,
  pendingLabel,
  variant = "default",
  size = "default",
  className,
}: ActionButtonProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant={variant}
        size={size}
        className={className}
        disabled={isPending}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            const result = await action();

            if (!result.success) {
              setError(result.error ?? "Something went wrong");
              return;
            }

            if (result.redirectTo) {
              router.push(result.redirectTo);
              return;
            }

            router.refresh();
          });
        }}
      >
        {isPending ? pendingLabel ?? "Saving..." : children}
      </Button>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
