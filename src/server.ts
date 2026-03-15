import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import express from "express";
import { z } from "zod";
import { buildPromptAndContext } from "./prompt-builder.js";
import { normalizePlanTier, type GenerateRequest } from "./types.js";

function loadEnvFiles() {
  const currentFileDir = path.dirname(fileURLToPath(import.meta.url));
  const candidates = [
    path.resolve(process.cwd(), ".env"),
    path.resolve(process.cwd(), ".env.server"),
    path.resolve(process.cwd(), "..", ".env"),
    path.resolve(process.cwd(), "..", ".env.server"),
    path.resolve(currentFileDir, "..", ".env"),
    path.resolve(currentFileDir, "..", "..", ".env.server"),
  ];

  const seen = new Set<string>();
  for (const envPath of candidates) {
    if (seen.has(envPath)) continue;
    seen.add(envPath);
    if (!fs.existsSync(envPath)) continue;
    dotenv.config({ path: envPath });
  }

  if (!process.env.OPENAI_API_KEY && process.env.PROMPT_OPENAI_API_KEY) {
    process.env.OPENAI_API_KEY = process.env.PROMPT_OPENAI_API_KEY;
  }
}

loadEnvFiles();

const app = express();
app.use(express.json({ limit: "10mb" }));

function summarizeDataUrl(value: unknown) {
  if (!value || typeof value !== "string") return null;
  const match = value.match(/^data:([^;]+);base64,/);
  return {
    mimeType: match?.[1] || "unknown",
    length: value.length,
    preview: `${value.slice(0, 60)}...${value.slice(-16)}`,
  };
}

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/build-prompt", async (req, res) => {
  const auth = req.header("authorization");
  const expected = `Bearer ${process.env.PROMPT_API_KEY}`;
  if (!auth || auth !== expected) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const schema = z.object({
    body: z.any(),
    floorPlanAnalysis: z.string(),
    planTier: z.string().optional()
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid payload", details: parsed.error.flatten() });
  }

  const { body, floorPlanAnalysis, planTier } = parsed.data;
  try {
    console.log("[Prompt API] build-prompt payload summary:", {
      timestamp: new Date().toISOString(),
      category: (body as GenerateRequest)?.category || null,
      tile: (body as GenerateRequest)?.tile || null,
      tileName: (body as GenerateRequest)?.tileName || null,
      tileImageSummary: summarizeDataUrl((body as GenerateRequest)?.tileImage),
      furniture: (body as GenerateRequest)?.furniture || null,
      promptLength: (body as GenerateRequest)?.prompt ? String((body as GenerateRequest).prompt).length : 0,
      hasImage: Boolean((body as GenerateRequest)?.image),
      imageSummary: summarizeDataUrl((body as GenerateRequest)?.image),
      floorPlanAnalysisLength: floorPlanAnalysis.length,
      planTier: planTier || "default",
    });

    const result = await buildPromptAndContext(
      body as GenerateRequest,
      floorPlanAnalysis,
      normalizePlanTier(planTier)
    );
    return res.json(result);
  } catch (error: unknown) {
    const typed = (error || {}) as { status?: number; code?: string; message?: string };
    const status = Number.isFinite(typed.status) ? Number(typed.status) : 500;
    const message = typed.message || "Failed to build prompt.";
    return res.status(status).json({
      error: message,
      code: typed.code || null,
    });
  }
});

const port = Number(process.env.PORT || 8787);
app.listen(port, () => {
  console.log(`Prompt API running on http://localhost:${port}`);
});
