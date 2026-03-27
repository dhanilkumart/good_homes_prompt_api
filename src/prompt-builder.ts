import type { GenerateRequest, PlanTier } from "./types.js";

export type PromptBuildResult = {
  prompt: string;
  isBathroomCategory: boolean;
  previousRenderedImages: string[];
  latestRenderedImage: string | null;
};

type CategoryKey =
  | "bathroom"
  | "kitchen"
  | "bedroom"
  | "living"
  | "office_workroom"
  | "office_meeting"
  | "office_reception"
  | "dining";

type CategorySnippet = {
  label: string;
  atmosphere: string;
  lighting: string;
  camera: string;
  composition: string;
  realismRules: string;
  elementsToLookFor: string[];
};

type VisibleElement = {
  name: string;
  position: string;
  count: number;
};

type CustomPromptOverrides = {
  perspective?: string;
  tile?: string;
  wallColor?: string;
  furniture?: string;
};

type EffectivePromptControls = {
  perspective: string;
  tile: string;
  curtain: string;
  wallpaper: string;
  wallColor: string;
  furniture: string;
  fabric: string;
};

type ReferenceAssetKind = "tile" | "curtain" | "wallpaper" | "fabric";

type ReferenceAssetDescriptors = {
  tile: string;
  curtain: string;
  wallpaper: string;
  fabric: string;
};

type CustomAssetReference = NonNullable<GenerateRequest["customAssets"]>[number];

type SynonymEntry = {
  canonical: string;
  phrases: string[];
};

const CATEGORY_SNIPPETS: Record<CategoryKey, CategorySnippet> = {
  bathroom: {
    label: "Bathroom",
    atmosphere: "Create a clean, spa-like bathroom environment that feels calm, modern, and refreshing.",
    lighting:
      "Use balanced bathroom lighting that works naturally with reflective surfaces such as tiles, mirrors, and fixtures. Combine soft ambient lighting with subtle highlights around mirrors or vanity areas.",
    camera:
      "Render the space from a natural interior perspective that clearly shows the main fixtures and layout of the bathroom.",
    composition:
      "Arrange bathroom fixtures logically along walls or defined wet zones. Maintain clear walking space and realistic spacing between elements.",
    realismRules:
      "Ensure proper bathroom layout with realistic scale and placement of fixtures.",
    elementsToLookFor: [
      "toilet",
      "sink or vanity basin",
      "shower enclosure or shower area",
      "bathtub if space allows",
      "mirror",
      "towel rail",
    ],
  },
  kitchen: {
    label: "Kitchen",
    atmosphere: "Create a warm, functional kitchen environment designed for daily cooking and activity.",
    lighting:
      "Use practical kitchen lighting that supports work surfaces. Combine ambient room lighting with brighter task lighting over counters and cooking areas.",
    camera:
      "Render the kitchen from an interior perspective that clearly shows counters, storage, and circulation space.",
    composition:
      "Place countertops along walls or layout boundaries. Arrange cooking, sink, and preparation zones in a practical workflow layout.",
    realismRules:
      "Maintain realistic appliance sizes, cabinet proportions, and clear working space between kitchen elements.",
    elementsToLookFor: [
      "countertops along walls",
      "sink",
      "stove or hob",
      "refrigerator",
      "kitchen island if space allows",
      "overhead cabinets",
    ],
  },
  bedroom: {
    label: "Bedroom",
    atmosphere: "Create a calm, cozy bedroom environment designed for relaxation and rest.",
    lighting:
      "Use natural interior lighting that complements the selected wall color, tiles, and furniture materials. Combine soft ambient lighting with subtle bedside or ceiling lights to produce realistic shadows and depth.",
    camera:
      "Render the room from a natural interior perspective that clearly shows the layout and furniture arrangement.",
    composition:
      "The bed should be the focal point of the room, positioned naturally within the layout. Arrange supporting furniture logically around the space without overcrowding.",
    realismRules:
      "Maintain realistic furniture scale, correct room proportions, and natural spacing between objects.",
    elementsToLookFor: ["bed", "wardrobe", "bedside tables", "dressing table", "study desk"],
  },
  living: {
    label: "Hall or Living Room",
    atmosphere: "Create an open and welcoming living room environment designed for relaxation and social interaction.",
    lighting:
      "Use natural daylight behavior supported by interior ambient lighting to create depth and comfort.",
    camera:
      "Use a wide interior perspective that captures the seating arrangement and main focal points of the room.",
    composition:
      "Arrange seating areas around a central coffee table or focal point such as a TV or feature wall. Maintain open circulation space.",
    realismRules:
      "Ensure furniture scale matches realistic living room proportions and avoid overcrowding.",
    elementsToLookFor: [
      "sofa",
      "coffee table",
      "TV unit or media wall",
      "accent chairs",
      "dining area if visible",
      "main entrance or circulation path",
    ],
  },
  office_workroom: {
    label: "Office Workroom",
    atmosphere: "Create a clean and productive workspace designed for focused individual work.",
    lighting:
      "Use neutral office lighting that ensures clear visibility of desks and work surfaces.",
    camera:
      "Render from an interior perspective showing workstation layout and circulation paths.",
    composition:
      "Arrange desks in organized workstation clusters or rows depending on available space.",
    realismRules:
      "Ensure ergonomic spacing between desks and realistic office furniture proportions.",
    elementsToLookFor: ["desks", "office chairs", "workstation clusters", "storage units", "plants"],
  },
  office_meeting: {
    label: "Office Meeting Room",
    atmosphere: "Create a formal and focused meeting environment suitable for discussions and presentations.",
    lighting:
      "Use balanced overhead lighting that highlights the central meeting table while maintaining comfortable room brightness.",
    camera:
      "Render from a perspective that centers the meeting table and seating arrangement.",
    composition:
      "Place a meeting table centrally with chairs arranged around it and clear circulation space.",
    realismRules:
      "Maintain realistic proportions between table size, chairs, and available room space.",
    elementsToLookFor: ["central meeting table", "chairs arranged around table", "presentation wall or screen"],
  },
  office_reception: {
    label: "Office Reception",
    atmosphere: "Create a welcoming and professional reception environment that forms the first impression of the office.",
    lighting:
      "Use soft feature lighting that highlights the reception desk and entry area.",
    camera:
      "Render from a perspective that shows the reception desk as the focal point of the entrance area.",
    composition:
      "Position the reception desk prominently near the entrance with waiting seating nearby.",
    realismRules:
      "Maintain clear circulation space for visitors entering and approaching the reception desk.",
    elementsToLookFor: ["reception desk", "waiting chairs or lounge seating", "entrance area"],
  },
  dining: {
    label: "Dining Room",
    atmosphere: "Create a warm and intimate dining environment designed for gathering and shared meals.",
    lighting:
      "Use pendant or overhead lighting centered above the dining table with supportive ambient lighting.",
    camera:
      "Render from an interior perspective that highlights the dining table as the focal point.",
    composition:
      "Place the dining table centrally with chairs evenly arranged and clear walking space around it.",
    realismRules:
      "Ensure realistic table size and comfortable spacing for seating and movement.",
    elementsToLookFor: ["dining table", "dining chairs", "sideboard or storage cabinet", "lighting above the table"],
  },
};

const PERSPECTIVE_SYNONYMS: SynonymEntry[] = [
  {
    canonical: "top view",
    phrases: ["top view", "ceiling view", "overhead view", "bird eye view", "birds eye view", "aerial view"],
  },
  {
    canonical: "view from the bed",
    phrases: ["view from bed", "view from the bed", "from bed view", "bed view", "bedside view"],
  },
  {
    canonical: "from door view of area",
    phrases: ["door view", "from door", "entrance view", "from entrance", "entry view"],
  },
  {
    canonical: "wide corner view",
    phrases: ["corner view", "wide view", "wide angle view", "wide-angle view"],
  },
];

const TILE_SYNONYMS: SynonymEntry[] = [
  { canonical: "White Marble", phrases: ["white marble"] },
  { canonical: "Black Marble", phrases: ["black marble"] },
  { canonical: "Carrara Marble", phrases: ["carrara marble"] },
  { canonical: "Calacatta", phrases: ["calacatta"] },
  { canonical: "Oak Wood", phrases: ["oak wood"] },
  { canonical: "Walnut Wood", phrases: ["walnut wood"] },
  { canonical: "Ash Wood", phrases: ["ash wood"] },
  { canonical: "Herringbone Oak", phrases: ["herringbone oak"] },
  { canonical: "Chevron Walnut", phrases: ["chevron walnut"] },
  { canonical: "Grey Concrete", phrases: ["grey concrete", "gray concrete"] },
  { canonical: "White Concrete", phrases: ["white concrete"] },
  { canonical: "Terrazzo Classic", phrases: ["terrazzo classic"] },
  { canonical: "Terrazzo Modern", phrases: ["terrazzo modern"] },
  { canonical: "Subway White", phrases: ["subway white"] },
  { canonical: "Subway Black", phrases: ["subway black"] },
  { canonical: "Hexagon White", phrases: ["hexagon white"] },
  { canonical: "Hexagon Marble", phrases: ["hexagon marble"] },
  { canonical: "Slate Grey", phrases: ["slate grey", "slate gray"] },
  { canonical: "Travertine", phrases: ["travertine"] },
  { canonical: "Mosaic Blue", phrases: ["mosaic blue"] },
  { canonical: "Penny Round", phrases: ["penny round"] },
  { canonical: "Zellige", phrases: ["zellige"] },
  { canonical: "black tile", phrases: ["black tile", "black tiles"] },
  { canonical: "blue tile", phrases: ["blue tile", "blue tiles"] },
  { canonical: "grey tile", phrases: ["grey tile", "gray tile", "grey tiles", "gray tiles"] },
  { canonical: "white tile", phrases: ["white tile", "white tiles"] },
];

const WALL_COLOR_SYNONYMS: SynonymEntry[] = [
  { canonical: "Off White", phrases: ["off white"] },
  { canonical: "Cream", phrases: ["cream wall", "cream color", "cream paint", "cream"] },
  { canonical: "Beige", phrases: ["beige wall", "beige color", "beige paint", "beige"] },
  { canonical: "Sky", phrases: ["sky blue", "sky wall", "sky"] },
  { canonical: "Sage", phrases: ["sage green", "sage wall", "sage"] },
  { canonical: "Blush", phrases: ["blush", "blush pink"] },
  { canonical: "Lavender", phrases: ["lavender"] },
  { canonical: "Charcoal", phrases: ["charcoal", "dark gray wall", "dark grey wall"] },
  { canonical: "Navy", phrases: ["navy", "navy blue"] },
  { canonical: "Walnut", phrases: ["walnut wall", "walnut brown"] },
  { canonical: "Forest", phrases: ["forest green", "forest"] },
  { canonical: "blue", phrases: ["blue wall", "blue paint"] },
  { canonical: "black", phrases: ["black wall", "black paint"] },
  { canonical: "white", phrases: ["white wall", "white paint"] },
];

const FURNITURE_SYNONYMS: SynonymEntry[] = [
  { canonical: "Minimal", phrases: ["minimal furniture", "minimal style", "minimalist furniture", "minimalist"] },
  { canonical: "Modern", phrases: ["modern furniture", "modern style", "contemporary furniture", "contemporary"] },
  { canonical: "Classic", phrases: ["classic furniture", "classic style", "traditional furniture", "traditional"] },
  { canonical: "None", phrases: ["no furniture", "without furniture", "empty room furniture"] },
];

function normalizeControl(value: unknown): string {
  if (value === null || value === undefined || value === "") return "auto";
  const text = String(value).trim();
  if (!text) return "auto";
  return text.toLowerCase() === "none" ? "auto" : text;
}

function buildWallColorPolicyLine(wallColor: string): string {
  const normalized = normalizeControl(wallColor);
  if (normalized === "auto") {
    return "Wall paint rule: if no wall color is selected, choose one harmonious paint color that matches flooring and furniture and keep it consistent across all walls.";
  }
  if (/^#[0-9A-Fa-f]{3,8}$/.test(normalized)) {
    return `Wall paint rule: match the selected wall color exactly (${normalized}) with high fidelity under neutral interior lighting.`;
  }
  return `Wall paint rule: match the selected wall color "${normalized}" as the dominant painted wall tone with high fidelity.`;
}

function buildWallColorHardConstraintLine(wallColor: string): string {
  const normalized = normalizeControl(wallColor);
  if (normalized === "auto") {
    return "- Keep all walls as painted surfaces (no wall tiles/cladding). Pick one harmonious wall paint color and keep it consistent.";
  }
  return `- Keep all walls as painted surfaces (no wall tiles/cladding). Wall paint color must stay faithful to: ${normalized}.`;
}

function normalizePromptForMatching(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9#\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function stripUiAutoCriticalInstruction(value: string): string {
  return value
    .replace(
      /\s*CRITICAL INSTRUCTION:\s*Only change the following specific items from the provided image:[\s\S]*$/i,
      ""
    )
    .trim();
}

function findBestSynonymMatch(normalizedPrompt: string, entries: SynonymEntry[]): string | undefined {
  let bestCanonical: string | undefined;
  let bestLength = -1;

  for (const entry of entries) {
    for (const phrase of entry.phrases) {
      const normalizedPhrase = normalizePromptForMatching(phrase);
      if (!normalizedPhrase) continue;
      if (!normalizedPrompt.includes(normalizedPhrase)) continue;
      if (normalizedPhrase.length > bestLength) {
        bestLength = normalizedPhrase.length;
        bestCanonical = entry.canonical;
      }
    }
  }

  return bestCanonical;
}

function detectPerspectiveOverride(normalizedPrompt: string): string | undefined {
  return findBestSynonymMatch(normalizedPrompt, PERSPECTIVE_SYNONYMS);
}

function extractCustomPromptAndOverrides(rawPrompt: string | undefined): {
  userPrompt: string;
  overrides: CustomPromptOverrides;
} {
  const cleanedPrompt = stripUiAutoCriticalInstruction(String(rawPrompt || ""));
  const normalizedPrompt = normalizePromptForMatching(cleanedPrompt);

  const overrides: CustomPromptOverrides = {};
  const perspective = detectPerspectiveOverride(normalizedPrompt);
  const tile = findBestSynonymMatch(normalizedPrompt, TILE_SYNONYMS);
  const wall = findBestSynonymMatch(normalizedPrompt, WALL_COLOR_SYNONYMS);
  const furniture = findBestSynonymMatch(normalizedPrompt, FURNITURE_SYNONYMS);

  if (perspective) overrides.perspective = perspective;
  if (tile) overrides.tile = tile;
  if (wall) overrides.wallColor = wall;
  if (furniture) overrides.furniture = furniture;

  const wallHexMatch = cleanedPrompt.match(/#[0-9A-Fa-f]{3,8}\b/);
  if (wallHexMatch && /wall|paint|color/i.test(cleanedPrompt)) {
    overrides.wallColor = wallHexMatch[0];
  }

  return {
    userPrompt: cleanedPrompt,
    overrides,
  };
}

function resolveEffectiveControls(body: GenerateRequest, overrides: CustomPromptOverrides): EffectivePromptControls {
  return {
    perspective: normalizeControl(overrides.perspective || body.perspective),
    tile: normalizeControl(overrides.tile || body.tileName || body.tile),
    curtain: normalizeControl(body.curtainName || body.curtain),
    wallpaper: normalizeControl(body.wallpaperName || body.wallpaper),
    wallColor: normalizeControl(overrides.wallColor || body.wallColor),
    furniture: normalizeControl(overrides.furniture || body.furnitureName || body.furniture),
    fabric: normalizeControl(body.fabricName || body.fabric),
  };
}

function buildOverridesSummary(overrides: CustomPromptOverrides, controls: EffectivePromptControls): string {
  const lines: string[] = [];
  if (overrides.perspective) lines.push(`- Camera/view override: ${controls.perspective}`);
  if (overrides.tile) lines.push(`- Tile/flooring override: ${controls.tile}`);
  if (overrides.wallColor) lines.push(`- Paint color override: ${controls.wallColor}`);
  if (overrides.furniture) lines.push(`- Furniture style override: ${controls.furniture}`);
  return lines.join("\n");
}

function normalizeCategoryKey(value: string): CategoryKey {
  const text = String(value || "").toLowerCase();
  if (text.includes("bath")) return "bathroom";
  if (text.includes("kitchen")) return "kitchen";
  if (text.includes("bed")) return "bedroom";
  if (text.includes("dining")) return "dining";
  if (text.includes("meeting") || text.includes("conference")) return "office_meeting";
  if (text.includes("reception")) return "office_reception";
  if (text.includes("office") || text.includes("study") || text.includes("work")) return "office_workroom";
  if (text.includes("hall") || text.includes("living") || text.includes("lounge")) return "living";
  return "living";
}

function polishPromptText(value: string | undefined): string {
  const cleaned = String(value || "").replace(/\s+/g, " ").trim();
  if (!cleaned) return "";
  return /[.!?]$/.test(cleaned) ? cleaned : `${cleaned}.`;
}

function perspectiveToCamera(perspective: string): string {
  const p = perspective.toLowerCase();
  if (p.includes("isometric") || p.includes("top") || p.includes("aerial") || p.includes("ceiling") || p.includes("overhead")) {
    return "isometric aerial 3D view from a 45-degree elevated angle showing complete room layout";
  }
  if (p.includes("bed")) {
    return "human eye-level interior perspective from the bed-side, looking across the room layout";
  }
  if (p.includes("eye") || p.includes("human") || p.includes("walkthrough")) {
    return "human eye-level perspective standing inside the room and looking toward the main feature wall";
  }
  if (p.includes("door") || p.includes("entrance") || p.includes("entry")) {
    return "human eye-level architectural interior perspective from an entrance-facing position";
  }
  if (p.includes("corner") || p.includes("wide")) {
    return "wide-angle corner perspective capturing both wall depth and primary furniture arrangement";
  }
  return "human eye-level architectural interior perspective from an entrance-facing position";
}

function safeParseJson(rawText: string): Record<string, unknown> {
  try {
    return JSON.parse(rawText) as Record<string, unknown>;
  } catch {
    const match = rawText.match(/\{[\s\S]*\}/);
    if (!match) return {};
    try {
      return JSON.parse(match[0]) as Record<string, unknown>;
    } catch {
      return {};
    }
  }
}

function sanitizeElements(value: unknown): VisibleElement[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      const record = (item || {}) as Record<string, unknown>;
      const name = String(record.name || record.element || "").trim();
      const position = String(record.position || "unspecified").trim();
      const countRaw = Number(record.count);
      const count = Number.isFinite(countRaw) && countRaw > 0 ? Math.round(countRaw) : 1;
      return { name, position, count };
    })
    .filter((item) => item.name.length > 0);
}

function formatElementPlacementBlock(elements: VisibleElement[]): string {
  if (!elements.length) {
    return "- no clearly identifiable elements were visible in the floor plan";
  }
  return elements
    .map((item) => `- ${item.count} x ${item.name} at ${item.position}`)
    .join("\n");
}

function createTypedError(message: string, status: number, code: string): Error & { status: number; code: string } {
  const error = new Error(message) as Error & { status: number; code: string };
  error.status = status;
  error.code = code;
  return error;
}

function createMismatchError(reason: string): Error & { status: number; code: string } {
  return createTypedError(reason, 400, "CATEGORY_MISMATCH");
}

function extractAssistantContent(payload: Record<string, unknown>): string {
  const choices = payload.choices;
  if (!Array.isArray(choices) || choices.length === 0) return "{}";
  const firstChoice = choices[0] as Record<string, unknown>;
  const message = (firstChoice.message || {}) as Record<string, unknown>;
  const content = message.content;

  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (!part || typeof part !== "object") return "";
        const typed = part as Record<string, unknown>;
        return typeof typed.text === "string" ? typed.text : "";
      })
      .join("\n");
  }

  return "{}";
}

async function callVisionJson(params: {
  imageDataUrl: string;
  temperature: number;
  userText: string;
  systemText: string;
}): Promise<Record<string, unknown>> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw createTypedError(
      "OPENAI_API_KEY is missing in good_homes_prompt_api. Set it in good_homes_prompt_api/.env or root .env.server (or use PROMPT_OPENAI_API_KEY).",
      500,
      "MISSING_OPENAI_KEY"
    );
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      temperature: params.temperature,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: params.systemText },
        {
          role: "user",
          content: [
            { type: "text", text: params.userText },
            { type: "image_url", image_url: { url: params.imageDataUrl, detail: "high" } },
          ],
        },
      ],
    }),
  });

  const raw = await response.text();
  if (!response.ok) {
    throw createTypedError(`OpenAI vision call failed (${response.status}).`, 500, "VISION_CALL_FAILED");
  }

  const parsedPayload = safeParseJson(raw);
  const assistantText = extractAssistantContent(parsedPayload);
  return safeParseJson(assistantText);
}

async function runCategoryValidation(params: {
  imageDataUrl: string;
  selectedCategoryLabel: string;
}): Promise<{ isMatch: boolean; reason: string }> {
  const result = await callVisionJson({
    imageDataUrl: params.imageDataUrl,
    temperature: 0,
    systemText:
      "You are a strict architectural validator. Judge whether selected category matches visible floor-plan symbols and furniture layout. Return only JSON.",
    userText: [
      `Selected category: ${params.selectedCategoryLabel}`,
      "Return exactly:",
      '{"result":"MATCH|MISMATCH","reason":"one short reason"}',
      "Output MATCH only if floor-plan symbols and layout clearly match the category.",
    ].join("\n"),
  });

  const resultValue = String(result.result || "").toUpperCase();
  const reason = String(result.reason || "Selected category does not match visible architectural symbols.").trim();
  return { isMatch: resultValue === "MATCH", reason };
}

async function runVisibleElementAnalysis(params: {
  imageDataUrl: string;
  selectedCategoryLabel: string;
  expectedElements: string[];
}): Promise<VisibleElement[]> {
  const result = await callVisionJson({
    imageDataUrl: params.imageDataUrl,
    temperature: 0.1,
    systemText:
      "You extract only physically visible floor-plan elements. Never invent. Return only JSON.",
    userText: [
      `Category context: ${params.selectedCategoryLabel}`,
      `Look for these element types if visible: ${params.expectedElements.join(", ")}.`,
      "Return strict JSON:",
      '{"elements":[{"name":"element name","position":"left wall|center|right corner|etc","count":1}]}',
      "Only report elements that are actually visible in the floor plan image.",
    ].join("\n"),
  });

  return sanitizeElements(result.elements);
}

function buildReferenceAssetAnalysisPrompt(params: {
  assetType: ReferenceAssetKind;
  assetName: string;
}): string[] {
  const shared = [
    `Requested asset type: ${params.assetType}.`,
    `Selected asset label: ${params.assetName}.`,
    "First verify that the requested asset type is actually visible in the image.",
    "If multiple candidate items are visible, choose the largest, most dominant, or most central matching item as the reference target.",
  ];

  if (params.assetType === "tile") {
    return [
      ...shared,
      "Describe only the dominant tile/flooring reference.",
      "Include: base color, vein/pattern style, finish feel, and overall tone.",
    ];
  }

  if (params.assetType === "curtain") {
    return [
      ...shared,
      "Describe only the dominant curtain or drape reference.",
      "Include: fabric weight, opacity, pleat/header style, drape behavior, dominant colors, motif/pattern, and trim details.",
    ];
  }

  if (params.assetType === "wallpaper") {
    return [
      ...shared,
      "Describe only the dominant wallpaper reference.",
      "Include: base color, motif/pattern type, repeat scale, finish feel, and visual density.",
    ];
  }

  return [
    ...shared,
    "Describe only the dominant upholstery or textile fabric reference.",
    "Include: weave/material feel, texture, dominant colors, motif/pattern, and whether it reads matte, rich, soft, or structured.",
  ];
}

async function runReferenceAssetAnalysis(params: {
  assetImageDataUrl: string;
  assetName: string;
  assetType: ReferenceAssetKind;
}): Promise<string> {
  const result = await callVisionJson({
    imageDataUrl: params.assetImageDataUrl,
    temperature: 0.1,
    systemText:
      "You analyze interior design reference images for rendering prompts. Return only JSON.",
    userText: [
      ...buildReferenceAssetAnalysisPrompt({
        assetType: params.assetType,
        assetName: params.assetName,
      }),
      "Return strict JSON:",
      '{"matched":true,"referenceDescriptor":"...","reason":"short reason if not matched"}',
      "If the requested asset type is not clearly visible, set matched to false and keep referenceDescriptor empty.",
    ].join("\n"),
  });

  const matched = result.matched === true || String(result.matched || "").toLowerCase() === "true";
  if (!matched) return "";
  return String(result.referenceDescriptor || "").trim();
}

function sanitizeCustomAssets(customAssets: GenerateRequest["customAssets"]): Array<CustomAssetReference & { previewUrl: string }> {
  if (!Array.isArray(customAssets)) return [];
  return customAssets
    .map((asset, index) => ({
      ...asset,
      id: String(asset?.id || `custom-${index + 1}`).trim(),
      name: String(asset?.name || `Custom Asset ${index + 1}`).trim(),
      prompt: String(asset?.prompt || "").trim(),
      previewUrl: String(asset?.previewUrl || "").trim(),
    }))
    .filter((asset) => asset.previewUrl)
    .slice(0, 4);
}

async function runCustomAssetAnalysis(params: {
  imageDataUrl: string;
  assetName: string;
  userPrompt: string;
}): Promise<string> {
  const result = await callVisionJson({
    imageDataUrl: params.imageDataUrl,
    temperature: 0.1,
    systemText:
      "You analyze a custom interior design reference image and return only JSON.",
    userText: [
      `Asset name: ${params.assetName}.`,
      params.userPrompt
        ? `User instruction for this asset: ${params.userPrompt}`
        : "No explicit user instruction was provided for this asset.",
      "Describe the dominant visible subject, materials, colors, style cues, and likely use within an interior scene in one concise sentence.",
      "Return strict JSON:",
      '{"descriptor":"concise visual summary"}',
    ].join("\n"),
  });

  return String(result.descriptor || "").trim();
}

function buildCustomAssetInstructionBlock(params: {
  customAssets: Array<CustomAssetReference & { previewUrl: string }>;
  analyzedDescriptors: Record<string, string>;
}): string {
  if (!params.customAssets.length) return "";

  return [
    "Custom uploaded asset references (highest priority after direct user prompt):",
    ...params.customAssets.map((asset, index) => {
      const parts = [`- Asset ${index + 1}: ${asset.name}.`];
      if (asset.prompt) {
        parts.push(`User instruction: ${polishPromptText(asset.prompt)}`);
      }
      if (params.analyzedDescriptors[asset.id]) {
        parts.push(`Visual reference summary: ${params.analyzedDescriptors[asset.id]}.`);
      }
      parts.push("Use this as style/material/furniture/decor guidance only unless the user explicitly asks to change room structure.");
      return parts.join(" ");
    }),
  ].join("\n");
}

function detectContinuationChange(params: {
  body: GenerateRequest;
  controls: EffectivePromptControls;
  overrides: CustomPromptOverrides;
  userPrompt: string;
}): string {
  const { body, controls, overrides, userPrompt } = params;
  const hasCustomInstruction = Boolean(String(userPrompt || "").trim());
  const initialConfig = body.session?.initialConfig;
  if (!initialConfig) {
    if (overrides.perspective) {
      return hasCustomInstruction
        ? `Base parameter change: camera perspective -> ${controls.perspective}.`
        : `Apply only this change: camera perspective -> ${controls.perspective}.`;
    }
    return hasCustomInstruction
      ? "No explicit parameter diff found. Apply Additional user instruction while preserving room geometry and camera unless explicitly overridden."
      : "No explicit parameter diff found; preserve everything exactly and apply only user-requested material/style edit.";
  }

  const changes: string[] = [];

  if (overrides.tile) {
    changes.push(`tile/flooring -> ${controls.tile}`);
  } else {
    const currentTile = normalizeControl(body.tile);
    const initialTile = normalizeControl(initialConfig.tileStyle === "auto" ? "none" : initialConfig.tileStyle);
    if (currentTile !== initialTile) {
      changes.push(`tile/flooring -> ${normalizeControl(body.tileName || body.tile)}`);
    }
  }

  const currentCurtain = normalizeControl(body.curtain);
  const initialCurtain = normalizeControl(initialConfig.curtainStyle === "auto" ? "none" : initialConfig.curtainStyle);
  if (currentCurtain !== initialCurtain) {
    changes.push(`curtain treatment -> ${normalizeControl(body.curtainName || body.curtain)}`);
  }

  const currentWallpaper = normalizeControl(body.wallpaper);
  const initialWallpaper = normalizeControl(initialConfig.wallpaperStyle === "auto" ? "none" : initialConfig.wallpaperStyle);
  if (currentWallpaper !== initialWallpaper) {
    changes.push(`wallpaper -> ${normalizeControl(body.wallpaperName || body.wallpaper)}`);
  }

  if (overrides.wallColor) {
    changes.push(`paint color -> ${controls.wallColor}`);
  } else {
    const currentWall = normalizeControl(body.wallColor);
    const initialWall = normalizeControl(initialConfig.wallColor);
    if (currentWall !== initialWall) {
      changes.push(`paint color -> ${normalizeControl(body.wallColor)}`);
    }
  }

  if (overrides.furniture) {
    changes.push(`furniture style -> ${controls.furniture}`);
  } else {
    const currentFurniture = normalizeControl(body.furniture);
    const initialFurniture = normalizeControl(initialConfig.furnitureStyle === "auto" ? "none" : initialConfig.furnitureStyle);
    if (currentFurniture !== initialFurniture) {
      changes.push(`furniture style -> ${normalizeControl(body.furnitureName || body.furniture)}`);
    }
  }

  const currentFabric = normalizeControl(body.fabric);
  const initialFabric = normalizeControl(initialConfig.fabricStyle === "auto" ? "none" : initialConfig.fabricStyle);
  if (currentFabric !== initialFabric) {
    changes.push(`fabric/upholstery -> ${normalizeControl(body.fabricName || body.fabric)}`);
  }

  if (overrides.perspective) {
    changes.push(`camera perspective -> ${controls.perspective}`);
  }

  if (changes.length === 1) {
    return hasCustomInstruction
      ? `Base parameter change: ${changes[0]}.`
      : `Apply only this change: ${changes[0]}.`;
  }

  if (changes.length > 1) {
    return hasCustomInstruction
      ? `Base parameter changes: ${changes.join(", ")}.`
      : `Apply only these changes together: ${changes.join(", ")}.`;
  }

  return hasCustomInstruction
    ? "No base parameter diff detected. Apply Additional user instruction while preserving room geometry/camera lock unless explicitly requested."
    : "No clear tile/curtain/wallpaper/paint/furniture/fabric diff detected; preserve geometry and camera and only apply explicit user edit text.";
}

function buildGenerationPrompt(params: {
  snippet: CategorySnippet;
  selectedCategoryLabel: string;
  elementPlacementBlock: string;
  controls: EffectivePromptControls;
  userPrompt: string;
  overridesSummary: string;
  floorPlanAnalysis: string;
  referenceDescriptors: ReferenceAssetDescriptors;
  customAssetBlock: string;
}): string {
  const cameraDescription = perspectiveToCamera(normalizeControl(params.controls.perspective));
  const wallColorPolicyLine = buildWallColorPolicyLine(params.controls.wallColor);
  const wallColorHardConstraintLine = buildWallColorHardConstraintLine(params.controls.wallColor);

  const materialsBlock = [
    `- Tile/flooring: ${normalizeControl(params.controls.tile)}`,
    params.referenceDescriptors.tile ? `- Tile reference details: ${params.referenceDescriptors.tile}` : "",
    "- Tile placement policy: if tile/flooring is specified, apply it only on floor surfaces.",
    "- Tile size policy: if tile/flooring is specified, render as uniform 4x4 square tiles with realistic grout joints.",
    `- Curtains/window treatment: ${normalizeControl(params.controls.curtain)}`,
    params.referenceDescriptors.curtain ? `- Curtain reference details: ${params.referenceDescriptors.curtain}` : "",
    "- Curtain placement policy: if curtains are specified, place them only on logical window/opening treatments with realistic length and fullness.",
    `- Wallpaper: ${normalizeControl(params.controls.wallpaper)}`,
    params.referenceDescriptors.wallpaper ? `- Wallpaper reference details: ${params.referenceDescriptors.wallpaper}` : "",
    "- Wallpaper placement policy: if wallpaper is specified, apply it only to wall surfaces and keep remaining visible painted walls aligned with the selected wall color.",
    `- Paint color: ${normalizeControl(params.controls.wallColor)}`,
    `- ${wallColorPolicyLine}`,
    `- Furniture style: ${normalizeControl(params.controls.furniture)}`,
    `- Fabric/upholstery: ${normalizeControl(params.controls.fabric)}`,
    params.referenceDescriptors.fabric ? `- Fabric reference details: ${params.referenceDescriptors.fabric}` : "",
    "- Fabric application policy: if fabric is specified, apply it only to upholstery and soft furnishings that naturally belong to the room type.",
  ]
    .filter(Boolean)
    .join("\n");

  const hardConstraints = [
    "- Do not add any rooms or spaces not present in the floor plan.",
    "- Do not add furniture not listed in the element placement block.",
    "- If tile/flooring is specified, apply tile texture only to floor surfaces.",
    "- Never apply tile texture to walls, wardrobes, cabinets, furniture, upholstery, ceiling, doors, or decor.",
    "- If tile/flooring is specified, use a consistent 4x4 square tile grid with realistic scale and grout spacing.",
    "- If curtains are specified, apply them only to windows/openings and never as wall panels, room dividers, or upholstery.",
    "- If wallpaper is specified, apply it only to wall surfaces and never to floors, ceilings, curtains, furniture, cabinetry, or decor.",
    "- If fabric is specified, apply it only to upholstery or soft furnishings and never to walls, floors, cabinetry, or curtains unless explicitly requested.",
    "- Treat uploaded custom assets only as style/material/furniture/decor references unless the user explicitly requests structural change.",
    wallColorHardConstraintLine,
    "- Do not render as a diagram or sketch or floor plan view.",
    "- Do not hallucinate any elements.",
  ].join("\n");

  return [
    "Generate a photorealistic 3D architectural interior rendering. Output must look like professional CGI studio visualization, not a sketch, not a diagram, not a cartoon.",
    `Room category: ${params.selectedCategoryLabel}.`,
    `Atmosphere: ${params.snippet.atmosphere}`,
    `Composition guidance: ${params.snippet.composition}`,
    "Element placement block:",
    params.elementPlacementBlock,
    "Materials block:",
    materialsBlock,
    `Lighting: ${params.snippet.lighting}`,
    `Camera template guidance: ${params.snippet.camera}`,
    `Camera and perspective: ${cameraDescription}.`,
    `Realism rules: ${params.snippet.realismRules}`,
    "Decor accent: optionally add at most one subtle framed wall painting/artwork if it naturally fits the room type; otherwise keep walls clean.",
    params.overridesSummary
      ? `Custom prompt structured overrides (highest priority):\n${params.overridesSummary}`
      : "",
    params.customAssetBlock,
    params.floorPlanAnalysis ? `Structural reference from floor plan analysis: ${params.floorPlanAnalysis}` : "",
    params.userPrompt ? `Additional user instruction: ${params.userPrompt}` : "",
    "Hard constraints:",
    hardConstraints,
    "Render quality: physically based materials, realistic lighting, accurate shadows, ambient occlusion, high texture realism.",
    "Output only the generated image.",
  ]
    .filter(Boolean)
    .join("\n\n");
}

function buildContinuationPrompt(params: {
  snippet: CategorySnippet;
  controls: EffectivePromptControls;
  allowPerspectiveChange: boolean;
  userPrompt: string;
  changeInstruction: string;
  overridesSummary: string;
  referenceDescriptors: ReferenceAssetDescriptors;
  customAssetBlock: string;
}): string {
  const hasCustomInstruction = Boolean(String(params.userPrompt || "").trim());
  const wallColorPolicyLine = buildWallColorPolicyLine(params.controls.wallColor);
  const wallColorHardConstraintLine = buildWallColorHardConstraintLine(params.controls.wallColor);
  const hardConstraints = [
    "- Lock room geometry exactly as previous generated image.",
    params.allowPerspectiveChange
      ? "- Camera angle may change only if explicitly requested in additional user instruction."
      : "- Lock camera angle exactly as previous generated image.",
    hasCustomInstruction
      ? "- Apply both: (1) base parameter change(s) listed above and (2) Additional user instruction."
      : "- Apply only the changed parameter(s) listed above.",
    hasCustomInstruction
      ? "- Additional user instruction has higher priority over template defaults; keep edits limited to requested changes."
      : "",
    "- If tile/flooring is specified, apply tile texture only to floor surfaces.",
    "- Never apply tile texture to walls, wardrobes, cabinets, furniture, upholstery, ceiling, doors, or decor.",
    "- If tile/flooring is specified, use a consistent 4x4 square tile grid with realistic scale and grout spacing.",
    "- If curtains are specified, apply them only to windows/openings and never as wall panels, room dividers, or upholstery.",
    "- If wallpaper is specified, apply it only to wall surfaces and never to floors, ceilings, curtains, furniture, cabinetry, or decor.",
    "- If fabric is specified, apply it only to upholstery or soft furnishings and never to walls, floors, cabinetry, or curtains unless explicitly requested.",
    "- Treat uploaded custom assets only as style/material/furniture/decor references unless the user explicitly requests structural change.",
    wallColorHardConstraintLine,
    hasCustomInstruction
      ? "- Keep walls, openings, and structural proportions fixed. Object-level additions/styling are allowed only if requested above."
      : "- Do not alter object positions, walls, openings, proportions, or composition.",
    "- Do not render as diagram/sketch/floor-plan style.",
  ]
    .filter(Boolean)
    .join("\n");

  return [
    "Photorealistic architectural interior rendering update.",
    `Atmosphere baseline: ${params.snippet.atmosphere}`,
    `Composition baseline: ${params.snippet.composition}`,
    "EDIT / CONTINUATION MODE:",
    params.changeInstruction,
    params.referenceDescriptors.tile ? `Tile reference details: ${params.referenceDescriptors.tile}` : "",
    params.referenceDescriptors.curtain ? `Curtain reference details: ${params.referenceDescriptors.curtain}` : "",
    params.referenceDescriptors.wallpaper ? `Wallpaper reference details: ${params.referenceDescriptors.wallpaper}` : "",
    params.referenceDescriptors.fabric ? `Fabric reference details: ${params.referenceDescriptors.fabric}` : "",
    wallColorPolicyLine,
    `Camera template guidance: ${params.snippet.camera}`,
    params.allowPerspectiveChange
      ? `Camera and perspective override: ${perspectiveToCamera(normalizeControl(params.controls.perspective))}.`
      : `Camera and perspective: preserve exact previous perspective (${normalizeControl(params.controls.perspective)}).`,
    `Realism rules: ${params.snippet.realismRules}`,
    params.overridesSummary
      ? `Custom prompt structured overrides (highest priority):\n${params.overridesSummary}`
      : "",
    params.customAssetBlock,
    params.userPrompt ? `Additional user instruction: ${params.userPrompt}` : "",
    "Hard constraints:",
    hardConstraints,
    "Output only the generated image.",
  ]
    .filter(Boolean)
    .join("\n\n");
}

export async function buildPromptAndContext(
  body: GenerateRequest,
  floorPlanAnalysis: string,
  planTier: PlanTier
): Promise<PromptBuildResult> {
  void planTier;

  const previousRenderedImages = body.session?.previousRenderedImages?.slice(-2) || [];
  const latestRenderedImage = body.session?.latestRenderedImage || null;
  const isContinuation = Boolean(latestRenderedImage);
  const categoryKey = normalizeCategoryKey(body.category);
  const snippet = CATEGORY_SNIPPETS[categoryKey];
  const isBathroomCategory = categoryKey === "bathroom";
  const { userPrompt: cleanedUserPrompt, overrides } = extractCustomPromptAndOverrides(body.prompt);
  const userPrompt = polishPromptText(cleanedUserPrompt);
  const controls = resolveEffectiveControls(body, overrides);
  const referenceDescriptors: ReferenceAssetDescriptors = {
    tile: "",
    curtain: "",
    wallpaper: "",
    fabric: "",
  };
  const customAssets = sanitizeCustomAssets(body.customAssets);
  const analyzedCustomAssetDescriptors: Record<string, string> = {};
  const overridesSummary = buildOverridesSummary(overrides, controls);

  const referenceAssets: Array<{
    kind: ReferenceAssetKind;
    imageDataUrl: string | undefined;
    selectedValue: string;
    selectedName: string;
    skipBecauseOverride?: boolean;
  }> = [
    {
      kind: "tile",
      imageDataUrl: body.tileImage,
      selectedValue: normalizeControl(body.tile),
      selectedName: normalizeControl(controls.tile),
      skipBecauseOverride: Boolean(overrides.tile),
    },
    {
      kind: "curtain",
      imageDataUrl: body.curtainImage,
      selectedValue: normalizeControl(body.curtain),
      selectedName: normalizeControl(controls.curtain),
    },
    {
      kind: "wallpaper",
      imageDataUrl: body.wallpaperImage,
      selectedValue: normalizeControl(body.wallpaper),
      selectedName: normalizeControl(controls.wallpaper),
    },
    {
      kind: "fabric",
      imageDataUrl: body.fabricImage,
      selectedValue: normalizeControl(body.fabric),
      selectedName: normalizeControl(controls.fabric),
    },
  ];

  for (const asset of referenceAssets) {
    if (!asset.imageDataUrl || ["none", "auto"].includes(asset.selectedValue) || asset.skipBecauseOverride) {
      continue;
    }

    try {
      referenceDescriptors[asset.kind] = await runReferenceAssetAnalysis({
        assetImageDataUrl: asset.imageDataUrl,
        assetName: asset.selectedName,
        assetType: asset.kind,
      });
    } catch (error) {
      console.warn(`[Prompt Builder] ${asset.kind} reference analysis failed. Continuing without descriptor.`, {
        selectedName: asset.selectedName,
        error: error instanceof Error ? error.message : String(error),
      });
      referenceDescriptors[asset.kind] = "";
    }
  }

  for (const asset of customAssets) {
    try {
      analyzedCustomAssetDescriptors[asset.id] = await runCustomAssetAnalysis({
        imageDataUrl: asset.previewUrl,
        assetName: asset.name,
        userPrompt: asset.prompt,
      });
    } catch (error) {
      console.warn("[Prompt Builder] Custom asset analysis failed. Continuing without descriptor.", {
        assetName: asset.name,
        error: error instanceof Error ? error.message : String(error),
      });
      analyzedCustomAssetDescriptors[asset.id] = "";
    }
  }

  const customAssetBlock = buildCustomAssetInstructionBlock({
    customAssets,
    analyzedDescriptors: analyzedCustomAssetDescriptors,
  });

  let prompt: string;

  if (isContinuation) {
    prompt = buildContinuationPrompt({
      snippet,
      controls,
      allowPerspectiveChange: Boolean(overrides.perspective),
      userPrompt,
      changeInstruction: detectContinuationChange({ body, controls, overrides, userPrompt }),
      overridesSummary,
      referenceDescriptors,
      customAssetBlock,
    });
  } else {
    if (!body.image) {
      throw createTypedError("Missing floor plan image for validation/analysis.", 400, "MISSING_IMAGE");
    }

    const validation = await runCategoryValidation({
      imageDataUrl: body.image,
      selectedCategoryLabel: snippet.label,
    });

    if (!validation.isMatch) {
      throw createMismatchError(validation.reason);
    }

    const elements = await runVisibleElementAnalysis({
      imageDataUrl: body.image,
      selectedCategoryLabel: snippet.label,
      expectedElements: snippet.elementsToLookFor,
    });

    prompt = buildGenerationPrompt({
      snippet,
      selectedCategoryLabel: snippet.label,
      elementPlacementBlock: formatElementPlacementBlock(elements),
      controls,
      userPrompt,
      overridesSummary,
      floorPlanAnalysis,
      referenceDescriptors,
      customAssetBlock,
    });
  }

  return {
    prompt,
    isBathroomCategory,
    previousRenderedImages,
    latestRenderedImage,
  };
}
