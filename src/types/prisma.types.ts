import type {
  User,
  ProviderProfile,
  RequesterProfile,
  Category,
  Skill,
  ProviderSkill,
  PortfolioProject,
  PortfolioMedia,
  Squad,
  SquadMember,
  Job,
  JobApplication,
  Review,
  Notification,
  Badge,
  UserBadge,
} from "@prisma/client";

export type {
  User,
  ProviderProfile,
  RequesterProfile,
  Category,
  Skill,
  ProviderSkill,
  PortfolioProject,
  PortfolioMedia,
  Squad,
  SquadMember,
  Job,
  JobApplication,
  Review,
  Notification,
  Badge,
  UserBadge,
};

export type ProviderWithProfile = User & {
  providerProfile: ProviderProfile & {
    skills: (ProviderSkill & { skill: Skill })[];
    portfolio: (PortfolioProject & { media: PortfolioMedia[] })[];
  };
};

export type JobWithDetails = Job & {
  requester: User;
  category: Category | null;
  applications: JobApplication[];
};

export type SquadWithMembers = Squad & {
  members: (SquadMember & { user: User; providerProfile: ProviderProfile | null })[];
  categories: Category[];
};
