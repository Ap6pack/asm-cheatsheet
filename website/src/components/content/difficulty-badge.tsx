import { Badge } from "@/components/ui/badge";

type Difficulty = "beginner" | "intermediate" | "advanced";

interface DifficultyBadgeProps {
  difficulty: Difficulty;
}

const config: Record<Difficulty, { emoji: string; label: string; variant: "beginner" | "intermediate" | "advanced" }> = {
  beginner: { emoji: "\uD83D\uDFE2", label: "Beginner", variant: "beginner" },
  intermediate: { emoji: "\uD83D\uDFE1", label: "Intermediate", variant: "intermediate" },
  advanced: { emoji: "\uD83D\uDD34", label: "Advanced", variant: "advanced" },
};

export function DifficultyBadge({ difficulty }: DifficultyBadgeProps) {
  const { emoji, label, variant } = config[difficulty];

  return (
    <Badge variant={variant}>
      <span className="mr-1">{emoji}</span>
      {label}
    </Badge>
  );
}
