import Link from "next/link";
import { MapPin, Star, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatCurrency } from "@/lib/utils";

interface ProviderCardProps {
  id: string;
  slug: string;
  name: string;
  image?: string | null;
  tagline?: string | null;
  mainTrade?: string | null;
  averageRating: number;
  reviewCount: number;
  serviceAreas: string[];
  hourlyRate?: number | null;
  availableNow: boolean;
  isVerified?: boolean;
}

export function ProviderCard({
  slug,
  name,
  image,
  tagline,
  mainTrade,
  averageRating,
  reviewCount,
  serviceAreas,
  hourlyRate,
  availableNow,
  isVerified,
}: ProviderCardProps) {
  return (
    <Link href={`/providers/${slug}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={image ?? undefined} alt={name} />
              <AvatarFallback>{name.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <h3 className="font-semibold truncate">{name}</h3>
                {isVerified && <CheckCircle className="h-4 w-4 text-blue-500 shrink-0" />}
              </div>
              {mainTrade && <p className="text-xs text-muted-foreground">{mainTrade}</p>}
            </div>
            {availableNow && (
              <Badge variant="secondary" className="text-xs shrink-0">Available</Badge>
            )}
          </div>
          {tagline && (
            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{tagline}</p>
          )}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{Number(averageRating).toFixed(1)}</span>
              <span className="text-xs text-muted-foreground">({reviewCount})</span>
            </div>
            {hourlyRate && (
              <span className="text-sm font-medium">{formatCurrency(Number(hourlyRate))}/hr</span>
            )}
          </div>
          {serviceAreas.length > 0 && (
            <div className="flex items-center gap-1 mt-2">
              <MapPin className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground truncate">
                {serviceAreas.slice(0, 2).join(", ")}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
