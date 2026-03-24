import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormMessageProps {
  message: string;
  variant?: "error" | "success" | "info";
}

const variantStyles = {
  error: {
    icon: AlertCircle,
    className: "border-destructive/30 bg-destructive/5 text-destructive",
  },
  success: {
    icon: CheckCircle2,
    className: "border-green-600/30 bg-green-600/5 text-green-700",
  },
  info: {
    icon: Info,
    className: "border-blue-600/30 bg-blue-600/5 text-blue-700",
  },
};

export function FormMessage({ message, variant = "error" }: FormMessageProps) {
  const Icon = variantStyles[variant].icon;

  return (
    <div className={cn("flex items-start gap-2 rounded-md border px-3 py-2 text-sm", variantStyles[variant].className)}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <p>{message}</p>
    </div>
  );
}
