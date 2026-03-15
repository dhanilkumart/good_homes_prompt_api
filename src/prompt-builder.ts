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

function normalizeControl(value: unknown): string {
  if (value === null || value === undefined || value === "") return "auto";
  const text = String(value).trim();
  if (!text) return "auto";
  return text.toLowerCase() === "none" ? "auto" : text;
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
  if (p.includes("isometric") || p.includes("top") || p.includes("aerial")) {
    return "isometric aerial 3D view from a 45-degree elevated angle showing complete room layout";
  }
  if (p.includes("eye") || p.includes("human") || p.includes("walkthrough")) {
    return "human eye-level perspective standing inside the room and looking toward the main feature wall";
  }
  if (p.includes("corner") || p.includes("wide")) {
    return "wide-angle corner perspective capturing both wall depth and primary furniture arrangement";
  }
  return "human eye-level architectural interior perspective from an entrance-facing position";
}

function ceilingToDescription(ceiling: string): string {
  const c = ceiling.toLowerCase();
  if (c.includes("8")) return "standard 8-foot ceiling with a cozy proportion";
  if (c.includes("9")) return "9-foot ceiling with balanced modern proportion";
  if (c.includes("10")) return "10-foot ceiling with an airy spatial feel";
  if (c.includes("12") || c.includes("high") || c.includes("tall")) return "12-foot high ceiling with a premium open feel";
  return "ceiling height appropriate to the selected space";
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

async function runTileReferenceAnalysis(params: {
  tileImageDataUrl: string;
  tileName: string;
}): Promise<string> {
  const result = await callVisionJson({
    imageDataUrl: params.tileImageDataUrl,
    temperature: 0.1,
    systemText:
      "You analyze tile/material reference images for architectural rendering prompts. Return only JSON.",
    userText: [
      `Tile selection label: ${params.tileName}`,
      "Describe only visible tile properties in one concise sentence.",
      "Include: base color, vein/pattern style, finish feel (matte/gloss/polished), and tone.",
      "Return strict JSON:",
      '{"tileDescriptor":"..."}',
    ].join("\n"),
  });

  return String(result.tileDescriptor || "").trim();
}

function detectContinuationChange(body: GenerateRequest): string {
  const initialConfig = body.session?.initialConfig;
  if (!initialConfig) {
    return "No explicit parameter diff found; preserve everything exactly and apply only user-requested material/style edit.";
  }

  const changes: string[] = [];

  const currentTile = normalizeControl(body.tile);
  const initialTile = normalizeControl(initialConfig.tileStyle === "auto" ? "none" : initialConfig.tileStyle);
  if (currentTile !== initialTile) {
    changes.push(`tile/flooring -> ${normalizeControl(body.tileName || body.tile)}`);
  }

  const currentWall = normalizeControl(body.wallColor);
  const initialWall = normalizeControl(initialConfig.wallColor);
  if (currentWall !== initialWall) {
    changes.push(`paint color -> ${normalizeControl(body.wallColor)}`);
  }

  const currentFurniture = normalizeControl(body.furniture);
  const initialFurniture = normalizeControl(initialConfig.furnitureStyle === "auto" ? "none" : initialConfig.furnitureStyle);
  if (currentFurniture !== initialFurniture) {
    changes.push(`furniture style -> ${normalizeControl(body.furnitureName || body.furniture)}`);
  }

  if (changes.length === 1) {
    return `Apply only this change: ${changes[0]}.`;
  }

  if (changes.length > 1) {
    return `Apply only these changes together: ${changes.join(", ")}.`;
  }

  return "No clear tile/paint/furniture diff detected; preserve geometry and camera and only apply explicit user edit text.";
}

function buildGenerationPrompt(params: {
  snippet: CategorySnippet;
  selectedCategoryLabel: string;
  elementPlacementBlock: string;
  body: GenerateRequest;
  userPrompt: string;
  floorPlanAnalysis: string;
  tileReferenceDescriptor: string;
}): string {
  const cameraDescription = perspectiveToCamera(normalizeControl(params.body.perspective));
  const ceilingDescription = ceilingToDescription(normalizeControl(params.body.ceilingHeight));

  const materialsBlock = [
    `- Tile/flooring: ${normalizeControl(params.body.tileName || params.body.tile)}`,
    params.tileReferenceDescriptor ? `- Tile reference details: ${params.tileReferenceDescriptor}` : "",
    `- Paint color: ${normalizeControl(params.body.wallColor)}`,
    `- Furniture style: ${normalizeControl(params.body.furnitureName || params.body.furniture)}`,
  ]
    .filter(Boolean)
    .join("\n");

  const hardConstraints = [
    "- Do not add any rooms or spaces not present in the floor plan.",
    "- Do not add furniture not listed in the element placement block.",
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
    `Ceiling guidance: ${ceilingDescription}.`,
    `Realism rules: ${params.snippet.realismRules}`,
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
  body: GenerateRequest;
  userPrompt: string;
  changeInstruction: string;
  tileReferenceDescriptor: string;
}): string {
  const hardConstraints = [
    "- Lock room geometry and camera angle exactly as previous generated image.",
    "- Apply only the changed parameter (tile or paint or furniture).",
    "- Do not alter object positions, walls, openings, proportions, or composition.",
    "- Do not render as diagram/sketch/floor-plan style.",
  ].join("\n");

  return [
    "Photorealistic architectural interior rendering update.",
    `Atmosphere baseline: ${params.snippet.atmosphere}`,
    `Composition baseline: ${params.snippet.composition}`,
    "EDIT / CONTINUATION MODE:",
    params.changeInstruction,
    params.tileReferenceDescriptor ? `Tile reference details: ${params.tileReferenceDescriptor}` : "",
    `Camera template guidance: ${params.snippet.camera}`,
    `Camera and perspective: preserve exact previous perspective (${normalizeControl(params.body.perspective)}).`,
    `Realism rules: ${params.snippet.realismRules}`,
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
  const userPrompt = polishPromptText(body.prompt);
  const hasTileReference = Boolean(body.tileImage) && !["none", "auto"].includes(normalizeControl(body.tile));
  let tileReferenceDescriptor = "";

  if (hasTileReference && typeof body.tileImage === "string") {
    try {
      tileReferenceDescriptor = await runTileReferenceAnalysis({
        tileImageDataUrl: body.tileImage,
        tileName: normalizeControl(body.tileName || body.tile),
      });
    } catch (error) {
      console.warn("[Prompt Builder] Tile reference analysis failed. Continuing without tile descriptor.", {
        tile: normalizeControl(body.tileName || body.tile),
        error: error instanceof Error ? error.message : String(error),
      });
      tileReferenceDescriptor = "";
    }
  }

  let prompt: string;

  if (isContinuation) {
    prompt = buildContinuationPrompt({
      snippet,
      body,
      userPrompt,
      changeInstruction: detectContinuationChange(body),
      tileReferenceDescriptor,
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
      body,
      userPrompt,
      floorPlanAnalysis,
      tileReferenceDescriptor,
    });
  }

  return {
    prompt,
    isBathroomCategory,
    previousRenderedImages,
    latestRenderedImage,
  };
}
