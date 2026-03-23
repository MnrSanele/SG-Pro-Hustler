import { Badge } from "@/components/ui/badge";

interface BadgeDisplayProps {
  badges: Array<{ name: string; icon?: string | null; color?: string | null }>;
  maxVisible?: number;
}

export function BadgeDisplay({ badges, maxVisible = 5 }: BadgeDisplayProps) {
  const visible = badges.slice(0, maxVisible);
  const remaining = badges.length - maxVisible;

  return (
    <div className="flex flex-wrap gap-1">
      {visible.map((badge) => (
        <Badge key={badge.name} variant="outline" className="text-xs gap-1">
          {badge.icon && <span>{badge.icon}</span>}
          {badge.name}
        </Badge>
      ))}
      {remaining > 0 && (
        <Badge variant="secondary" className="text-xs">+{remaining} more</Badge>
      )}
    </div>
  );
}
