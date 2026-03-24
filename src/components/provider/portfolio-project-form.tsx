"use client";

import { useState, useTransition } from "react";
import { createPortfolioProjectAction } from "@/actions/provider.actions";
import { FormMessage } from "@/components/shared/form-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface UploadedImage {
  url: string;
  key: string;
}

export function PortfolioProjectForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [area, setArea] = useState("");
  const [budgetRange, setBudgetRange] = useState("");
  const [dateCompleted, setDateCompleted] = useState("");
  const [rolePerformed, setRolePerformed] = useState("");
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [coverIndex, setCoverIndex] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);

  async function uploadSelectedFiles(files: FileList | null) {
    if (!files || files.length === 0) {
      return;
    }

    setError(null);
    setMessage(null);
    setIsUploading(true);

    try {
      const uploadedImages: UploadedImage[] = [];

      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const json = (await response.json()) as { error?: string; data?: UploadedImage };

        if (!response.ok || !json.data) {
          throw new Error(json.error ?? "Failed to upload file");
        }

        uploadedImages.push(json.data);
      }

      setImages((current) => [...current, ...uploadedImages]);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Failed to upload images");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        setError(null);
        setMessage(null);

        startTransition(async () => {
          const result = await createPortfolioProjectAction({
            title,
            description: description || undefined,
            area: area || undefined,
            budgetRange: budgetRange || undefined,
            dateCompleted: dateCompleted ? new Date(dateCompleted) : undefined,
            rolePerformed: rolePerformed || undefined,
            mediaUrls: images.map((image) => image.url),
            coverIndex,
          });

          if (!result.success) {
            setError(result.error ?? "Unable to create portfolio project");
            return;
          }

          setTitle("");
          setDescription("");
          setArea("");
          setBudgetRange("");
          setDateCompleted("");
          setRolePerformed("");
          setImages([]);
          setCoverIndex(0);
          setMessage("Portfolio project created.");
        });
      }}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="project-title">Project title</Label>
          <Input id="project-title" value={title} onChange={(event) => setTitle(event.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="project-role">Role performed</Label>
          <Input id="project-role" value={rolePerformed} onChange={(event) => setRolePerformed(event.target.value)} placeholder="Lead painter" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="project-description">Description</Label>
        <Textarea id="project-description" value={description} onChange={(event) => setDescription(event.target.value)} className="min-h-24" />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="project-area">Location</Label>
          <Input id="project-area" value={area} onChange={(event) => setArea(event.target.value)} placeholder="Randburg" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="project-budget">Budget range</Label>
          <Input id="project-budget" value={budgetRange} onChange={(event) => setBudgetRange(event.target.value)} placeholder="R 5 000 – R 8 000" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="project-date">Date completed</Label>
          <Input id="project-date" type="date" value={dateCompleted} onChange={(event) => setDateCompleted(event.target.value)} />
        </div>
      </div>

      <div className="space-y-3 rounded-lg border p-4">
        <div className="space-y-2">
          <Label htmlFor="project-images">Project images</Label>
          <Input
            id="project-images"
            type="file"
            multiple
            accept="image/*"
            onChange={(event) => void uploadSelectedFiles(event.target.files)}
          />
          <p className="text-xs text-muted-foreground">Upload multiple images and choose one as the cover image.</p>
        </div>

        {images.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {images.map((image, index) => (
              <label key={image.key} className="space-y-2 rounded-md border p-2 text-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image.url} alt={`Portfolio upload ${index + 1}`} className="h-32 w-full rounded object-cover" />
                <span className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="cover-image"
                    checked={coverIndex === index}
                    onChange={() => setCoverIndex(index)}
                  />
                  Set as cover image
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setImages((current) => current.filter((_, currentIndex) => currentIndex !== index));
                    setCoverIndex((currentIndex) => (currentIndex > index ? currentIndex - 1 : 0));
                  }}
                >
                  Remove
                </Button>
              </label>
            ))}
          </div>
        ) : null}
      </div>

      {error ? <FormMessage message={error} variant="error" /> : null}
      {message ? <FormMessage message={message} variant="success" /> : null}

      <Button disabled={isPending || isUploading}>
        {isUploading ? "Uploading images..." : isPending ? "Creating project..." : "Add Portfolio Project"}
      </Button>
    </form>
  );
}
