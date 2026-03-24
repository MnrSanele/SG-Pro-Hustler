"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createReviewAction } from "@/actions/review.actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ReviewFormProps {
  jobId: string;
  type: "REQUESTER_TO_PROVIDER" | "PROVIDER_TO_REQUESTER";
  title: string;
  description: string;
}

export function ReviewForm({ jobId, type, title, description }: ReviewFormProps) {
  const router = useRouter();
  const [rating, setRating] = useState("5");
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="space-y-4 rounded-lg border p-4"
      onSubmit={(event) => {
        event.preventDefault();
        setError(null);
        setSuccess(null);

        startTransition(async () => {
          const result = await createReviewAction({
            jobId,
            type,
            overallRating: Number(rating),
            comment: comment || undefined,
          });

          if (!result.success) {
            setError(result.error ?? "Unable to submit review");
            return;
          }

          setSuccess("Review submitted.");
          router.refresh();
        });
      }}
    >
      <div>
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${type}-${jobId}-rating`}>Rating</Label>
        <select
          id={`${type}-${jobId}-rating`}
          value={rating}
          onChange={(event) => setRating(event.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          {[5, 4, 3, 2, 1].map((value) => (
            <option key={value} value={value}>
              {value} star{value === 1 ? "" : "s"}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${type}-${jobId}-comment`}>Comment</Label>
        <Textarea
          id={`${type}-${jobId}-comment`}
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder="Share a short, honest review."
        />
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {success ? <p className="text-sm text-green-600">{success}</p> : null}

      <Button disabled={isPending}>
        {isPending ? "Submitting review..." : "Submit Review"}
      </Button>
    </form>
  );
}
