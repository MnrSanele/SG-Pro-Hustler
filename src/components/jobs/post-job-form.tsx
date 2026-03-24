"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createJobAction } from "@/actions/job.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface PostJobFormProps {
  categories: Array<{
    id: string;
    name: string;
  }>;
}

export function PostJobForm({ categories }: PostJobFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [mode, setMode] = useState<"INSTANT" | "QUOTE_BASED">("INSTANT");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [urgency, setUrgency] = useState("flexible");
  const [preferredTiming, setPreferredTiming] = useState("");
  const [location, setLocation] = useState("");
  const [requiredSkills, setRequiredSkills] = useState("");
  const [materialsProvided, setMaterialsProvided] = useState(false);
  const [isRemote, setIsRemote] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        setError(null);

        startTransition(async () => {
          const result = await createJobAction({
            title,
            description,
            categoryId: categoryId || undefined,
            mode,
            budgetMin: budgetMin ? Number(budgetMin) : undefined,
            budgetMax: budgetMax ? Number(budgetMax) : undefined,
            urgency,
            preferredTiming: preferredTiming || undefined,
            location: location || undefined,
            materialsProvided,
            requiredSkills: requiredSkills
              .split(",")
              .map((skill) => skill.trim())
              .filter(Boolean),
            isRemote,
          });

          if (!result.success) {
            setError(result.error ?? "Unable to create job");
            return;
          }

          router.push(result.redirectTo ?? "/requester/jobs");
          router.refresh();
        });
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="title">Job title</Label>
        <Input
          id="title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="What do you need done?"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Describe the work, size of the job, and what you expect."
          className="min-h-32"
          required
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <select
            id="category"
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">Select category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="mode">Hiring mode</Label>
          <select
            id="mode"
            value={mode}
            onChange={(event) => setMode(event.target.value as "INSTANT" | "QUOTE_BASED")}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="INSTANT">Take Job</option>
            <option value="QUOTE_BASED">Submit Quote</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="budget-min">Minimum budget (optional)</Label>
          <Input
            id="budget-min"
            type="number"
            min="0"
            value={budgetMin}
            onChange={(event) => setBudgetMin(event.target.value)}
            placeholder="0"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="budget-max">Maximum budget (optional)</Label>
          <Input
            id="budget-max"
            type="number"
            min="0"
            value={budgetMax}
            onChange={(event) => setBudgetMax(event.target.value)}
            placeholder="0"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="urgency">Urgency</Label>
          <select
            id="urgency"
            value={urgency}
            onChange={(event) => setUrgency(event.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="immediate">Immediate</option>
            <option value="this_week">This week</option>
            <option value="flexible">Flexible</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="preferred-timing">Preferred timing</Label>
          <Input
            id="preferred-timing"
            value={preferredTiming}
            onChange={(event) => setPreferredTiming(event.target.value)}
            placeholder="Weekdays after 2pm"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          placeholder="Sandton, Johannesburg"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="skills">Required skills</Label>
        <Input
          id="skills"
          value={requiredSkills}
          onChange={(event) => setRequiredSkills(event.target.value)}
          placeholder="Interior Painting, Wall Prep"
        />
        <p className="text-xs text-muted-foreground">Separate multiple skills with commas.</p>
      </div>

      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={materialsProvided}
            onChange={(event) => setMaterialsProvided(event.target.checked)}
          />
          Materials already provided
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isRemote}
            onChange={(event) => setIsRemote(event.target.checked)}
          />
          This job can be handled remotely
        </label>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Button disabled={isPending}>
        {isPending ? "Posting job..." : "Post Job"}
      </Button>
    </form>
  );
}
