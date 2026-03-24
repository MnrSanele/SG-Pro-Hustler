"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { submitJobApplicationAction } from "@/actions/job.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface JobApplicationFormProps {
  jobId: string;
  mode: "INSTANT" | "QUOTE_BASED";
}

export function JobApplicationForm({ jobId, mode }: JobApplicationFormProps) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [proposedBudget, setProposedBudget] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        setError(null);
        setSuccess(null);

        startTransition(async () => {
          const result = await submitJobApplicationAction({
            jobId,
            message: message || undefined,
            proposedBudget: proposedBudget ? Number(proposedBudget) : undefined,
          });

          if (!result.success) {
            setError(result.error ?? "Unable to submit application");
            return;
          }

          setSuccess(mode === "INSTANT" ? "Job interest submitted." : "Quote submitted successfully.");
          router.refresh();
        });
      }}
    >
      <div className="space-y-2">
        <Label htmlFor={`message-${jobId}`}>{mode === "INSTANT" ? "Message" : "Quote message"}</Label>
        <Textarea
          id={`message-${jobId}`}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder={
            mode === "INSTANT"
              ? "Tell the requester why you are a good fit."
              : "Share your approach, timing, and what is included in your quote."
          }
        />
      </div>

      {mode === "QUOTE_BASED" ? (
        <div className="space-y-2">
          <Label htmlFor={`budget-${jobId}`}>Quoted price</Label>
          <Input
            id={`budget-${jobId}`}
            type="number"
            min="1"
            value={proposedBudget}
            onChange={(event) => setProposedBudget(event.target.value)}
            placeholder="8500"
          />
        </div>
      ) : null}

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {success ? <p className="text-sm text-green-600">{success}</p> : null}

      <Button disabled={isPending}>
        {isPending
          ? mode === "INSTANT"
            ? "Submitting..."
            : "Sending quote..."
          : mode === "INSTANT"
            ? "Take Job"
            : "Submit Quote"}
      </Button>
    </form>
  );
}
