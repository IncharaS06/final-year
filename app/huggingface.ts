/**
 * lib/huggingface.ts
 *
 * Calls your HuggingFace Gradio space: https://huggingface.co/spaces/inchara07/medora-final
 *
 * HOW GRADIO SPACES WORK:
 *   Every Gradio space exposes a REST API automatically at:
 *     POST https://<owner>-<space-name>.hf.space/run/predict
 *   with body: { "data": [...inputs] }
 *
 *   But if your space uses FastAPI / Flask directly (not Gradio UI),
 *   the endpoint is whatever route you defined (e.g. POST /analyze).
 *
 * INSTRUCTIONS:
 *   1. Open your space: https://huggingface.co/spaces/inchara07/medora-final
 *   2. Click "Use via API" at the bottom — it shows your exact endpoint and input format.
 *   3. Update the HF_SPACE_URL and callHuggingFaceModel() below to match.
 */

export type ModelResult = {
    prediction: string;       // "Fracture" | "Normal"
    confidence: number;       // 0.0 – 1.0
    riskLevel: string;        // "High" | "Moderate" | "Low"
    annotatedImageBase64: string;
    gradCamBase64: string;
    boxes: { x1: number; y1: number; x2: number; y2: number }[];
    modelName: string;
    summary: string;
    recommendation: string;
};

// ─── Configuration ──────────────────────────────────────────────────────────
// Set NEXT_PUBLIC_HF_SPACE_URL in your .env.local:
//   NEXT_PUBLIC_HF_SPACE_URL=https://inchara07-medora-final.hf.space
const HF_SPACE_URL =
    process.env.NEXT_PUBLIC_HF_SPACE_URL ||
    "https://inchara07-medora-final.hf.space";

// ─── Main call ──────────────────────────────────────────────────────────────
export async function callHuggingFaceModel(
    imageDataUrl: string // full data:image/... base64 string
): Promise<ModelResult> {
    // Convert data URL → Blob for multipart upload
    const blob = dataUrlToBlob(imageDataUrl);

    // ── Option A: Your space uses a custom REST route (FastAPI / Flask) ───────
    // This matches the existing upload/page.tsx which called /analyze
    const formData = new FormData();
    formData.append("file", blob, "xray.jpg");

    const res = await fetch(`${HF_SPACE_URL}/analyze`, {
        method: "POST",
        body: formData,
    });

    if (!res.ok) {
        // If /analyze doesn't exist, the space is a pure Gradio UI.
        // See Option B below and update accordingly.
        const body = await res.text();
        throw new Error(
            `HuggingFace API returned ${res.status}. ` +
            `Check that your space exposes a POST /analyze endpoint. ` +
            `Response: ${body.slice(0, 300)}`
        );
    }

    const raw = await res.json();
    return normalizeResponse(raw);

    /*
    // ── Option B: Pure Gradio space (no custom route) ─────────────────────────
    // If your space is a standard Gradio app, use this instead of Option A.
    // Replace "predict" with the actual fn_index if needed (check /info endpoint).
    const res = await fetch(`${HF_SPACE_URL}/run/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: [
          { data: imageDataUrl, name: "xray.jpg", is_file: false }
        ],
      }),
    });
    if (!res.ok) throw new Error(`Gradio API error: ${res.status}`);
    const raw = await res.json();
    // Gradio returns { data: [output1, output2, ...] }
    // Adjust indices to match your space's output order
    return {
      prediction: raw.data[0] ?? "Unknown",
      confidence: raw.data[1] ?? 0,
      riskLevel: deriveRisk(raw.data[1]),
      annotatedImageBase64: raw.data[2]?.data ?? "",
      gradCamBase64: raw.data[3]?.data ?? "",
      boxes: raw.data[4] ?? [],
      modelName: "EfficientNet-B3 + YOLOv8",
      summary: raw.data[5] ?? "",
      recommendation: raw.data[6] ?? "",
    };
    */
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function dataUrlToBlob(dataUrl: string): Blob {
    const [header, base64] = dataUrl.split(",");
    const mime = header.match(/:(.*?);/)?.[1] ?? "image/jpeg";
    const bytes = atob(base64);
    const arr = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
    return new Blob([arr], { type: mime });
}

function deriveRisk(confidence: number | string | undefined): string {
    const c =
        typeof confidence === "number"
            ? confidence
            : parseFloat(String(confidence ?? "0"));
    if (c >= 0.8) return "High";
    if (c >= 0.5) return "Moderate";
    return "Low";
}

/**
 * Normalize whatever your HF space returns into a consistent ModelResult shape.
 * If your space returns different field names, update the mappings here.
 */
function normalizeResponse(data: Record<string, unknown>): ModelResult {
    const confidence =
        typeof data.confidence === "number"
            ? data.confidence
            : parseFloat(String(data.confidence ?? "0"));

    return {
        prediction:
            (data.prediction as string) ??
            (data.label as string) ??
            "Unknown",

        confidence,

        riskLevel:
            (data.riskLevel as string) ??
            (data.risk_level as string) ??
            deriveRisk(confidence),

        annotatedImageBase64:
            (data.annotatedImageBase64 as string) ??
            (data.annotated_image as string) ??
            (data.annotated_image_base64 as string) ??
            "",

        gradCamBase64:
            (data.gradCamBase64 as string) ??
            (data.grad_cam as string) ??
            (data.gradcam_base64 as string) ??
            "",

        boxes: Array.isArray(data.boxes)
            ? (data.boxes as { x1: number; y1: number; x2: number; y2: number }[])
            : [],

        modelName:
            (data.modelName as string) ??
            (data.model_name as string) ??
            "EfficientNet-B3 + YOLOv8",

        summary: (data.summary as string) ?? "",

        recommendation: (data.recommendation as string) ?? "",
    };
}