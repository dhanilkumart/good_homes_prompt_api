export type PlanTier = "basic" | "plus" | "pro";

export interface GenerateRequest {
  image: string;
  category: string;
  prompt?: string;
  planTier?: PlanTier | string;
  ceilingHeight: string;
  wallColor: string;
  tile: string;
  tileName?: string;
  tileImage?: string;
  furniture: string;
  furnitureName?: string;
  furnitureImage?: string;
  perspective: string;
  session?: {
    sessionId: string;
    previousRenderedImages?: string[];
    latestRenderedImage?: string | null;
  };
  requirementsJson?: Record<string, unknown>;
  additionalFeatures?: Record<string, unknown>;
}

export function normalizePlanTier(value: GenerateRequest["planTier"]): PlanTier {
  const normalized = String(value || "plus").toLowerCase();
  if (normalized === "basic" || normalized === "plus" || normalized === "pro") {
    return normalized;
  }
  return "plus";
}
