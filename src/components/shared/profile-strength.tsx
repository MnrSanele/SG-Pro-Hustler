import { CheckCircle2, Circle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { CredibilityChecklistItem } from "@/services/credibility.service";

interface ProfileStrengthProps {
  score: number;
  checklist?: CredibilityChecklistItem[];
}

export function ProfileStrength({ score, checklist = [] }: ProfileStrengthProps) {
  const getLabel = (value: number) => {
    if (value >= 80) return { label: "Excellent", color: "text-green-600" };
    if (value >= 60) return { label: "Good", color: "text-blue-600" };
    if (value >= 40) return { label: "Fair", color: "text-yellow-600" };
    return { label: "Needs Work", color: "text-red-600" };
  };

  const { label, color } = getLabel(score);

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Profile Strength</span>
          <span className={`font-medium ${color}`}>
            {label} ({score}%)
          </span>
        </div>
        <Progress value={score} className="h-2" />
      </div>

      {checklist.length > 0 ? (
        <div className="space-y-2">
          <p className="text-sm font-medium">Improvement checklist</p>
          <ul className="space-y-2 text-sm">
            {checklist.map((item) => (
              <li key={item.key} className="flex items-start gap-2">
                {item.met ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-600 shrink-0" />
                ) : (
                  <Circle className="mt-0.5 h-4 w-4 text-muted-foreground shrink-0" />
                )}
                <div>
                  <p className={item.met ? "text-foreground" : "text-muted-foreground"}>{item.label}</p>
                  {!item.met ? <p className="text-xs text-muted-foreground">{item.description}</p> : null}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
