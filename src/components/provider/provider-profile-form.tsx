"use client";

import { useMemo, useState, useTransition } from "react";
import { updateProviderProfileAction } from "@/actions/provider.actions";
import { FormMessage } from "@/components/shared/form-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface SkillOption {
  id: string;
  name: string;
}

interface CategoryOption {
  id: string;
  name: string;
  skills: SkillOption[];
}

interface ProviderProfileFormProps {
  initialProfile: {
    user: { image: string | null; phone: string | null };
    bio: string | null;
    tagline: string | null;
    mainTrade: string | null;
    pricingModel: "HOURLY" | "DAILY" | "PROJECT_BASED" | "NEGOTIABLE";
    hourlyRate: number | null;
    dailyRate: number | null;
    availableNow: boolean;
    emergencyAvailable: boolean;
    yearsExperience: number | null;
    serviceAreas: string[];
    languages: string[];
    skills: Array<{ skillId: string; proficiencyRank: number }>;
  };
  categories: CategoryOption[];
}

export function ProviderProfileForm({ initialProfile, categories }: ProviderProfileFormProps) {
  const [image, setImage] = useState(initialProfile.user.image ?? "");
  const [phone, setPhone] = useState(initialProfile.user.phone ?? "");
  const [bio, setBio] = useState(initialProfile.bio ?? "");
  const [tagline, setTagline] = useState(initialProfile.tagline ?? "");
  const [mainTrade, setMainTrade] = useState(initialProfile.mainTrade ?? "");
  const [pricingModel, setPricingModel] = useState(initialProfile.pricingModel);
  const [hourlyRate, setHourlyRate] = useState(initialProfile.hourlyRate?.toString() ?? "");
  const [dailyRate, setDailyRate] = useState(initialProfile.dailyRate?.toString() ?? "");
  const [availableNow, setAvailableNow] = useState(initialProfile.availableNow);
  const [emergencyAvailable, setEmergencyAvailable] = useState(initialProfile.emergencyAvailable);
  const [yearsExperience, setYearsExperience] = useState(initialProfile.yearsExperience?.toString() ?? "");
  const [serviceAreas, setServiceAreas] = useState(initialProfile.serviceAreas.join(", "));
  const [languages, setLanguages] = useState(initialProfile.languages.join(", "));
  const [selectedSkills, setSelectedSkills] = useState<Record<string, number>>(
    () =>
      initialProfile.skills.reduce<Record<string, number>>((accumulator, skill) => {
        accumulator[skill.skillId] = skill.proficiencyRank;
        return accumulator;
      }, {}),
  );
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const selectedSkillsCount = useMemo(() => Object.keys(selectedSkills).length, [selectedSkills]);

  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        setMessage(null);
        setError(null);

        startTransition(async () => {
          const result = await updateProviderProfileAction({
            image: image || undefined,
            phone: phone || undefined,
            bio: bio || undefined,
            tagline: tagline || undefined,
            mainTrade: mainTrade || undefined,
            pricingModel,
            hourlyRate: hourlyRate ? Number(hourlyRate) : undefined,
            dailyRate: dailyRate ? Number(dailyRate) : undefined,
            availableNow,
            emergencyAvailable,
            yearsExperience: yearsExperience ? Number(yearsExperience) : undefined,
            serviceAreas: serviceAreas
              .split(",")
              .map((value) => value.trim())
              .filter(Boolean),
            languages: languages
              .split(",")
              .map((value) => value.trim())
              .filter(Boolean),
            selectedSkills: Object.entries(selectedSkills).map(([skillId, proficiencyRank]) => ({
              skillId,
              proficiencyRank,
            })),
          });

          if (!result.success) {
            setError(result.error ?? "Unable to update profile");
            return;
          }

          setMessage("Profile updated successfully.");
        });
      }}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="image">Profile image URL</Label>
          <Input id="image" value={image} onChange={(event) => setImage(event.target.value)} placeholder="/uploads/avatar.png or https://..." />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone number</Label>
          <Input id="phone" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+27..." />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="mainTrade">Main trade</Label>
          <Input id="mainTrade" value={mainTrade} onChange={(event) => setMainTrade(event.target.value)} placeholder="Painting" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tagline">Tagline</Label>
          <Input id="tagline" value={tagline} onChange={(event) => setTagline(event.target.value)} placeholder="Quality finishes, on time" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea id="bio" value={bio} onChange={(event) => setBio(event.target.value)} className="min-h-28" placeholder="Tell requesters about your experience and trust signals." />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="pricingModel">Pricing model</Label>
          <select
            id="pricingModel"
            value={pricingModel}
            onChange={(event) => setPricingModel(event.target.value as ProviderProfileFormProps["initialProfile"]["pricingModel"])}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="NEGOTIABLE">Negotiable</option>
            <option value="HOURLY">Hourly</option>
            <option value="DAILY">Daily</option>
            <option value="PROJECT_BASED">Project based</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="hourlyRate">Hourly rate</Label>
          <Input id="hourlyRate" type="number" min="0" value={hourlyRate} onChange={(event) => setHourlyRate(event.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dailyRate">Daily rate</Label>
          <Input id="dailyRate" type="number" min="0" value={dailyRate} onChange={(event) => setDailyRate(event.target.value)} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="yearsExperience">Years of experience</Label>
          <Input id="yearsExperience" type="number" min="0" max="50" value={yearsExperience} onChange={(event) => setYearsExperience(event.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="serviceAreas">Service areas</Label>
          <Input id="serviceAreas" value={serviceAreas} onChange={(event) => setServiceAreas(event.target.value)} placeholder="Randburg, Sandton, Midrand" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="languages">Languages</Label>
        <Input id="languages" value={languages} onChange={(event) => setLanguages(event.target.value)} placeholder="English, isiZulu" />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Skills ({selectedSkillsCount} selected)</Label>
          <span className="text-xs text-muted-foreground">Select and rank your top skills</span>
        </div>
        <div className="space-y-4 rounded-lg border p-4">
          {categories.map((category) => (
            <div key={category.id} className="space-y-2">
              <p className="text-sm font-medium">{category.name}</p>
              <div className="grid gap-2 md:grid-cols-2">
                {category.skills.map((skill) => {
                  const isSelected = selectedSkills[skill.id] !== undefined;
                  return (
                    <label key={skill.id} className="flex items-center justify-between gap-3 rounded-md border px-3 py-2 text-sm">
                      <span className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(event) => {
                            setSelectedSkills((current) => {
                              const next = { ...current };
                              if (event.target.checked) {
                                next[skill.id] = next[skill.id] ?? 3;
                              } else {
                                delete next[skill.id];
                              }
                              return next;
                            });
                          }}
                        />
                        {skill.name}
                      </span>
                      {isSelected ? (
                        <select
                          value={selectedSkills[skill.id]}
                          onChange={(event) =>
                            setSelectedSkills((current) => ({
                              ...current,
                              [skill.id]: Number(event.target.value),
                            }))
                          }
                          className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                        >
                          {[1, 2, 3, 4, 5].map((rank) => (
                            <option key={rank} value={rank}>
                              Rank {rank}
                            </option>
                          ))}
                        </select>
                      ) : null}
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={availableNow} onChange={(event) => setAvailableNow(event.target.checked)} />
          Available now
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={emergencyAvailable} onChange={(event) => setEmergencyAvailable(event.target.checked)} />
          Emergency availability
        </label>
      </div>

      {error ? <FormMessage message={error} variant="error" /> : null}
      {message ? <FormMessage message={message} variant="success" /> : null}

      <Button disabled={isPending}>{isPending ? "Saving profile..." : "Save Profile"}</Button>
    </form>
  );
}
