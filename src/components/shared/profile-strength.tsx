import { Progress } from "@/components/ui/progress";

interface ProfileStrengthProps {
  score: number;
}

export function ProfileStrength({ score }: ProfileStrengthProps) {
  const getLabel = (s: number) => {
    if (s >= 80) return { label: "Excellent", color: "text-green-600" };
    if (s >= 60) return { label: "Good", color: "text-blue-600" };
    if (s >= 40) return { label: "Fair", color: "text-yellow-600" };
    return { label: "Needs Work", color: "text-red-600" };
  };
  const { label, color } = getLabel(score);

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Profile Strength</span>
        <span className={`font-medium ${color}`}>{label} ({score}%)</span>
      </div>
      <Progress value={score} className="h-2" />
    </div>
  );
}
