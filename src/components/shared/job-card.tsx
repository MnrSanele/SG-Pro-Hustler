import Link from "next/link";
import { MapPin, Clock, DollarSign } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";

interface JobCardProps {
  id: string;
  title: string;
  description: string;
  location?: string | null;
  budgetMin?: number | null;
  budgetMax?: number | null;
  mode: "INSTANT" | "QUOTE_BASED";
  status: string;
  urgency?: string | null;
  categoryName?: string | null;
  createdAt: Date;
}

export function JobCard({
  id,
  title,
  description,
  location,
  budgetMin,
  budgetMax,
  mode,
  urgency,
  categoryName,
  createdAt,
}: JobCardProps) {
  return (
    <Link href={`/jobs/${id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold line-clamp-1">{title}</h3>
            <Badge variant={mode === "INSTANT" ? "default" : "outline"} className="shrink-0 text-xs">
              {mode === "INSTANT" ? "Instant" : "Quote"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{description}</p>
          <div className="flex flex-wrap gap-2 mt-3">
            {categoryName && (
              <Badge variant="secondary" className="text-xs">{categoryName}</Badge>
            )}
            {urgency === "immediate" && (
              <Badge variant="destructive" className="text-xs">Urgent</Badge>
            )}
          </div>
          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
            {location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {location}
              </span>
            )}
            {(budgetMin || budgetMax) && (
              <span className="flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                {budgetMin && budgetMax
                  ? `${formatCurrency(budgetMin)} – ${formatCurrency(budgetMax)}`
                  : budgetMin
                  ? `From ${formatCurrency(budgetMin)}`
                  : `Up to ${formatCurrency(budgetMax!)}`}
              </span>
            )}
            <span className="flex items-center gap-1 ml-auto">
              <Clock className="h-3 w-3" />
              {formatRelativeTime(createdAt)}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
