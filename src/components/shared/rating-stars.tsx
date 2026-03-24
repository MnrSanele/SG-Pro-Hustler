import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingStarsProps {
  rating: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  className?: string;
}

export function RatingStars({ rating, max = 5, size = "md", showValue = false, className }: RatingStarsProps) {
  const sizeClasses = { sm: "h-3 w-3", md: "h-4 w-4", lg: "h-5 w-5" };
  const iconSize = sizeClasses[size];

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            iconSize,
            i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "fill-none text-muted-foreground"
          )}
        />
      ))}
      {showValue && (
        <span className="text-sm text-muted-foreground ml-1">{rating.toFixed(1)}</span>
      )}
    </div>
  );
}
