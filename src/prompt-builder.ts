import { getCategoryObjectRules, itemExplicitlyRequestedByUser } from "./category-rules.js";
import type { GenerateRequest, PlanTier } from "./types.js";

export type PromptBuildResult = {
  prompt: string;
  isBathroomCategory: boolean;
  previousRenderedImages: string[];
  latestRenderedImage: string | null;
};

function getPlanRequirements(planTier: PlanTier): string[] {
  if (planTier === "basic") {
    return [
      "Maintain original wall layout and proportions.",
      "Preserve structural geometry from the input floor plan image.",
      "Use practical realistic design choices.",
      "If any control is none/auto, select the best option automatically."
    ];
  }

  if (planTier === "pro") {
    return [
      "Maintain original wall layout and proportions.",
      "Preserve structural geometry from the input floor plan image.",
      "Deliver premium photoreal output with high-end detailing.",
      "For continuation edits, preserve previous render identity and modify only requested changes.",
      "If any control is none/auto, select the best option automatically."
    ];
  }

  return [
    "Maintain original wall layout and proportions.",
    "Preserve structural geometry from the input floor plan image.",
    "Professional architectural rendering quality.",
    "For continuation edits, preserve previous render identity and modify only requested changes.",
    "If any control is none/auto, select the best option automatically."
  ];
}

export function buildPromptAndContext(body: GenerateRequest, floorPlanAnalysis: string, planTier: PlanTier): PromptBuildResult {
  const ceilingInstruction =
    body.ceilingHeight === "none" ? "Auto-select realistic ceiling height." : body.ceilingHeight;

  const wallColorInstruction =
    body.wallColor === "none" ? "Auto-select best wall paint color." : body.wallColor;

  const tileInstruction =
    body.tile === "none" ? "Auto-select suitable tile style." : `${body.tileName || body.tile} (${body.tile})`;

  const isBathroomCategory = body.category === "Bathroom";
  const categoryObjectRules = getCategoryObjectRules(body.category);
  const promptText = body.prompt || "";

  const contextualAvoidList = categoryObjectRules.avoid.filter(
    (item) => !itemExplicitlyRequestedByUser(item, promptText)
  );

  const furnitureInstruction =
    isBathroomCategory || body.furniture === "none"
      ? "Auto-select suitable furniture style."
      : `${body.furnitureName || body.furniture} (${body.furniture})`;

  const previousRenderedImages = body.session?.previousRenderedImages?.slice(-2) || [];
  const latestRenderedImage = body.session?.latestRenderedImage || null;
  const isContinuation = Boolean(latestRenderedImage);

  const generationSpec = {
    schemaVersion: "2.0",
    planTier,
    session: {
      sessionId: body.session?.sessionId || "ad-hoc-session",
      isContinuation,
      previousRenderCount: previousRenderedImages.length
    },
    planCategory: body.category,
    selectedControls: {
      ceilingHeight: ceilingInstruction,
      wallPaintColor: wallColorInstruction,
      tile: {
        instruction: tileInstruction,
        imageReference: body.tileImage || "Not provided"
      },
      furniture: {
        instruction: furnitureInstruction,
        imageReference: isBathroomCategory ? "Disabled for Bathroom category" : body.furnitureImage || "Not provided"
      },
      perspective: body.perspective
    },
    additionalFeatures: body.additionalFeatures || body.requirementsJson || {},
    userPrompt: body.prompt || "No custom prompt provided.",
    floorPlanAnalysis,
    requirements: [
      ...getPlanRequirements(planTier),
      `Strictly include only category-relevant objects for "${body.category}".`,
      `Allowed object examples: ${categoryObjectRules.allowed.join(", ")}.`,
      `Avoid unless user explicitly asks: ${contextualAvoidList.join(", ") || "none"}.`
    ]
  };

  const prompt = `Use this JSON spec as source of truth.
Output a realistic 3D interior image.
Return only the edited/generated image.

JSON_SPEC:
${JSON.stringify(generationSpec, null, 2)}`;

  return {
    prompt,
    isBathroomCategory,
    previousRenderedImages,
    latestRenderedImage
  };
}
