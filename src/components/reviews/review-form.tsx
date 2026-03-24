"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createReviewAction } from "@/actions/review.actions";
import { FormMessage } from "@/components/shared/form-message";
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
  const [quality, setQuality] = useState("5");
  const [communication, setCommunication] = useState("5");
  const [punctuality, setPunctuality] = useState("5");
  const [professionalism, setProfessionalism] = useState("5");
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
            scoreBreakdown: {
              quality: Number(quality),
              communication: Number(communication),
              punctuality: Number(punctuality),
              professionalism: Number(professionalism),
            },
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

      <div className="grid gap-4 md:grid-cols-2">
        {[
          { label: "Quality", value: quality, setValue: setQuality },
          { label: "Communication", value: communication, setValue: setCommunication },
          { label: "Punctuality", value: punctuality, setValue: setPunctuality },
          { label: "Professionalism", value: professionalism, setValue: setProfessionalism },
        ].map((field) => (
          <div key={field.label} className="space-y-2">
            <Label htmlFor={`${type}-${jobId}-${field.label}`}>{field.label}</Label>
            <select
              id={`${type}-${jobId}-${field.label}`}
              value={field.value}
              onChange={(event) => field.setValue(event.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {[5, 4, 3, 2, 1].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
        ))}
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

      {error ? <FormMessage message={error} variant="error" /> : null}
      {success ? <FormMessage message={success} variant="success" /> : null}

      <Button disabled={isPending}>
        {isPending ? "Submitting review..." : "Submit Review"}
      </Button>
    </form>
  );
}
