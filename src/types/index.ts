export type UserRole = "ADMIN" | "REQUESTER" | "PROVIDER" | "SQUAD_LEADER";
export type ModerationStatus = "PENDING" | "APPROVED" | "REJECTED" | "FLAGGED" | "SUSPENDED";
export type JobMode = "INSTANT" | "QUOTE_BASED";
export type JobStatus =
  | "DRAFT"
  | "OPEN"
  | "IN_REVIEW"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "DISPUTED"
  | "EXPIRED";
export type ApplicationStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "WITHDRAWN";
export type VerificationStatus = "UNVERIFIED" | "PENDING" | "VERIFIED" | "REJECTED";
export type PricingModel = "HOURLY" | "DAILY" | "PROJECT_BASED" | "NEGOTIABLE";
export type ReviewType = "REQUESTER_TO_PROVIDER" | "PROVIDER_TO_REQUESTER";

export interface PaginationParams {
  page?: number;
  limit?: number;
  cursor?: string;
}

export interface SearchParams extends PaginationParams {
  q?: string;
  category?: string;
  urgency?: string;
  location?: string;
  area?: string;
  sortBy?: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
