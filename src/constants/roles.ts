export const USER_ROLES = {
  ADMIN: "ADMIN",
  REQUESTER: "REQUESTER",
  PROVIDER: "PROVIDER",
  SQUAD_LEADER: "SQUAD_LEADER",
} as const;

export type UserRoleKey = keyof typeof USER_ROLES;

export const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrator",
  REQUESTER: "Job Poster",
  PROVIDER: "Service Provider",
  SQUAD_LEADER: "Squad Leader",
};
