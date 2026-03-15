export type PlanTier = "basic" | "plus" | "pro";

export interface GenerateRequest {
  image: string | null;
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
    floorPlanHash?: string | null;
    previousRenderedImages?: string[];
    latestRenderedImage?: string | null;
    firstRenderedImage?: string | null;
    initialConfig?: {
      category: string;
      ceilingHeight: string;
      wallColor: string;
      tileStyle: string;
      furnitureStyle: string;
      customPrompt: string;
    };
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
