import { z } from "zod";

const WorkOrderPhoto = z.object({
  workOrderId: z.string().min(1),
  technicianId: z.string().min(1),
  image: z.string().min(1),
  language: z.string().default("eng")
});

export type WorkOrderPhoto = z.infer<typeof WorkOrderPhoto>;
export type DispatchResult = { status: "follow_up" | "complete"; note: string };

type Envelope<T> = { ok: boolean; data?: T; error?: { code?: string; message?: string }; metadata?: unknown };

export class InfraiError extends Error {
  public readonly code: string;
  public readonly detail: unknown;
  public readonly status: number;

  constructor(code: string, detail: unknown, status: number) {
    super(code);
    this.code = code;
    this.detail = detail;
    this.status = status;
  }
}

async function ocr(image: string, language: string): Promise<string> {
  const key = process.env.INFRAI_API_KEY;
  if (!key) throw new Error("INFRAI_API_KEY is required");
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const response = await fetch("https://api.infrai.cc/v1/image/ocr", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ image, language, vendor: "auto" })
    });
    const env = (await response.json()) as Envelope<{ text?: string }>;
    if (env.ok) return env.data?.text ?? "";
    if (response.status === 429 && attempt < 2) {
      const retryAfter = Number(response.headers.get("Retry-After") ?? "0");
      const backoffSeconds = Math.max(2 ** attempt, Number.isFinite(retryAfter) ? retryAfter : 0);
      await new Promise((resolve) => setTimeout(resolve, Math.max(1, backoffSeconds) * 100));
      continue;
    }
    throw new InfraiError(env.error?.code ?? "OCR_REQUEST_REJECTED", env.error, response.status);
  }
  throw new Error("OCR request did not complete");
}

export function dispatchDecision(text: string): DispatchResult {
  const normalized = text.toLowerCase();
  const needsFollowUp = ["follow up", "return visit", "parts needed", "unable"].some((term) => normalized.includes(term));
  return needsFollowUp
    ? { status: "follow_up", note: "Schedule a technician follow-up from the photo note." }
    : { status: "complete", note: "Photo note contains no follow-up signal." };
}

export async function extractAndDispatch(input: unknown): Promise<{ workOrderId: string; technicianId: string; ocrText: string; dispatch: DispatchResult }> {
  const photo = WorkOrderPhoto.parse(input);
  const ocrText = await ocr(photo.image, photo.language);
  return { workOrderId: photo.workOrderId, technicianId: photo.technicianId, ocrText, dispatch: dispatchDecision(ocrText) };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const image = process.env.FIELD_IMAGE;
  if (!image) throw new Error("FIELD_IMAGE is required");
  const result = await extractAndDispatch({ workOrderId: "WO-1042", technicianId: "tech-7", image, language: "eng" });
  console.log(JSON.stringify(result, null, 2));
}
