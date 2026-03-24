import { prisma } from "@/lib/prisma";

export interface CredibilityChecklistItem {
  key:
    | "profileImage"
    | "bio"
    | "mainTrade"
    | "minimumSkills"
    | "rankedSkills"
    | "portfolioProjects"
    | "review"
    | "phoneVerified"
    | "availability";
  label: string;
  description: string;
  met: boolean;
  weight: number;
}

export interface ProviderCredibilitySnapshot {
  score: number;
  checklist: CredibilityChecklistItem[];
}

function buildCredibilityChecklist(profile: Awaited<ReturnType<typeof getProfileForCredibility>>) {
  if (!profile) {
    return [];
  }

  return [
    {
      key: "profileImage",
      label: "Add a profile image",
      description: "Profiles with a clear photo build trust faster.",
      met: Boolean(profile.user.image),
      weight: 10,
    },
    {
      key: "bio",
      label: "Write a bio",
      description: "Describe your experience and services.",
      met: Boolean(profile.bio?.trim()),
      weight: 15,
    },
    {
      key: "mainTrade",
      label: "Select your main trade",
      description: "Help requesters understand your speciality.",
      met: Boolean(profile.mainTrade?.trim()),
      weight: 10,
    },
    {
      key: "minimumSkills",
      label: "Add at least 3 skills",
      description: "A fuller skill profile improves discoverability.",
      met: profile.skills.length >= 3,
      weight: 15,
    },
    {
      key: "rankedSkills",
      label: "Rank your skills",
      description: "Skill proficiency helps requesters compare providers.",
      met: profile.skills.length > 0 && profile.skills.every((skill) => skill.proficiencyRank >= 1),
      weight: 10,
    },
    {
      key: "portfolioProjects",
      label: "Publish at least 2 portfolio projects",
      description: "Visual proof of work is one of the strongest trust signals.",
      met: profile.portfolio.length >= 2,
      weight: 15,
    },
    {
      key: "review",
      label: "Earn your first review",
      description: "Completed jobs and reviews improve credibility.",
      met: profile.reviewCount >= 1,
      weight: 10,
    },
    {
      key: "phoneVerified",
      label: "Verify your phone",
      description: "Verified contact details reassure requesters.",
      met: profile.user.phoneVerified,
      weight: 5,
    },
    {
      key: "availability",
      label: "Set your availability",
      description: "Let requesters know whether you are available now or for emergencies.",
      met: profile.availableNow || profile.emergencyAvailable,
      weight: 10,
    },
  ] satisfies CredibilityChecklistItem[];
}

type CredibilityDb = Pick<typeof prisma, "providerProfile">;

async function getProfileForCredibility(providerProfileId: string, db: CredibilityDb = prisma) {
  return db.providerProfile.findUnique({
    where: { id: providerProfileId },
    include: {
      skills: true,
      portfolio: true,
      user: {
        select: {
          image: true,
          phoneVerified: true,
        },
      },
    },
  });
}

export async function getProviderCredibility(
  providerProfileId: string,
  db: CredibilityDb = prisma,
): Promise<ProviderCredibilitySnapshot> {
  const profile = await getProfileForCredibility(providerProfileId, db);

  if (!profile) {
    return { score: 0, checklist: [] };
  }

  const checklist = buildCredibilityChecklist(profile);
  const score = checklist.reduce((total, item) => total + (item.met ? item.weight : 0), 0);

  return {
    score: Math.min(score, 100),
    checklist,
  };
}

export async function calculateProfileStrength(
  providerProfileId: string,
  db: CredibilityDb = prisma,
): Promise<number> {
  const snapshot = await getProviderCredibility(providerProfileId, db);
  return snapshot.score;
}
