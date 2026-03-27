export type PlanTier = "basic" | "plus" | "pro";

export interface CustomAssetReference {
  id: string;
  name: string;
  prompt: string;
  r2Key: string;
  previewUrl?: string;
  mimeType?: string;
  size?: number;
  createdAt?: string;
}

export interface GenerateRequest {
  image: string | null;
  category: string;
  prompt?: string;
  planTier?: PlanTier | string;
  wallColor: string;
  tile: string;
  tileName?: string;
  tileImage?: string;
  curtain: string;
  curtainName?: string;
  curtainImage?: string;
  wallpaper: string;
  wallpaperName?: string;
  wallpaperImage?: string;
  furniture: string;
  furnitureName?: string;
  furnitureImage?: string;
  fabric: string;
  fabricName?: string;
  fabricImage?: string;
  perspective: string;
  customAssets?: CustomAssetReference[];
  session?: {
    sessionId: string;
    floorPlanHash?: string | null;
    previousRenderedImages?: string[];
    latestRenderedImage?: string | null;
    firstRenderedImage?: string | null;
    initialConfig?: {
      category: string;
      wallColor: string;
      tileStyle: string;
      curtainStyle: string;
      wallpaperStyle: string;
      furnitureStyle: string;
      fabricStyle: string;
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

