import Link from "next/link";
import { MapPin, Star, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SquadCardProps {
  id: string;
  slug: string;
  name: string;
  tagline?: string | null;
  logoUrl?: string | null;
  averageRating: number;
  reviewCount: number;
  serviceAreas: string[];
  memberCount: number;
  categories: string[];
}

export function SquadCard({
  slug,
  name,
  tagline,
  averageRating,
  reviewCount,
  serviceAreas,
  memberCount,
  categories,
}: SquadCardProps) {
  return (
    <Link href={`/squads/${slug}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-4">
          <h3 className="font-semibold">{name}</h3>
          {tagline && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{tagline}</p>}
          <div className="flex flex-wrap gap-1 mt-2">
            {categories.slice(0, 3).map((cat) => (
              <Badge key={cat} variant="secondary" className="text-xs">{cat}</Badge>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium text-foreground">{Number(averageRating).toFixed(1)}</span>
              <span>({reviewCount})</span>
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {memberCount} members
            </span>
            {serviceAreas.length > 0 && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {serviceAreas[0]}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
