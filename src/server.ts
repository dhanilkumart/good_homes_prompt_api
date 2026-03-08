import "dotenv/config";
import express from "express";
import { z } from "zod";
import { buildPromptAndContext } from "./prompt-builder.js";
import { normalizePlanTier, type GenerateRequest } from "./types.js";

const app = express();
app.use(express.json({ limit: "10mb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/build-prompt", (req, res) => {
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
  const result = buildPromptAndContext(body as GenerateRequest, floorPlanAnalysis, normalizePlanTier(planTier));
  return res.json(result);
});

const port = Number(process.env.PORT || 8787);
app.listen(port, () => {
  console.log(`Prompt API running on http://localhost:${port}`);
});
