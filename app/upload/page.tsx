"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { callHuggingFaceModel } from "@/lib/huggingface";

export default function UploadPage() {
  const router = useRouter();

  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [patientName, setPatientName] = useState("");

  const [status, setStatus] = useState<
    "idle" | "calling-model" | "saving" | "done" | "error"
  >("idle");

  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─────────────────────────────────────────────
  // AUTH GUARD
  // ─────────────────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/auth");
        return;
      }

      setFirebaseUser(user);
      setAuthLoading(false);
    });

    return () => unsub();
  }, [router]);

  // ─────────────────────────────────────────────
  // READ FILE
  // ─────────────────────────────────────────────
  const readFile = (f: File) => {
    if (!f.type.startsWith("image/")) {
      setError("Only image files are allowed.");
      return;
    }

    setError("");
    setFile(f);

    const reader = new FileReader();

    reader.onload = () => {
      setPreview(reader.result as string);
    };

    reader.readAsDataURL(f);
  };

  // ─────────────────────────────────────────────
  // FILE INPUT
  // ─────────────────────────────────────────────
  const handleFileInput = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const f = e.target.files?.[0];

    if (f) {
      readFile(f);
    }
  };

  // ─────────────────────────────────────────────
  // DRAG DROP
  // ─────────────────────────────────────────────
  const handleDrop = (
    e: React.DragEvent<HTMLDivElement>
  ) => {
    e.preventDefault();

    const f = e.dataTransfer.files?.[0];

    if (f) {
      readFile(f);
    }
  };

  // ─────────────────────────────────────────────
  // ANALYZE IMAGE
  // ─────────────────────────────────────────────
  const analyzeImage = async () => {
    if (!file || !firebaseUser || !preview) return;

    try {
      setError("");
      setProgress(10);
      setStatus("calling-model");

      // 1️⃣ CALL HUGGING FACE MODEL
      const modelResult =
        await callHuggingFaceModel(preview);

      setProgress(65);

      // 2️⃣ SAVE TO FIRESTORE
      setStatus("saving");

      await addDoc(collection(db, "cases"), {
        userId: firebaseUser.uid,
        userEmail: firebaseUser.email ?? "",

        patientName:
          patientName.trim() || "Unknown",

        prediction:
          modelResult.prediction || "Unknown",

        confidence:
          modelResult.confidence || 0,

        fractureProbability:
          modelResult.fractureProbability || 0,

        riskLevel:
          modelResult.riskLevel || "Low",

        yoloConfidence:
          modelResult.yoloConfidence || 0,

        boxes:
          modelResult.boxes || [],

        summary:
          modelResult.summary ||
          "No summary generated.",

        recommendation:
          modelResult.recommendation ||
          "Clinical review recommended.",

        annotatedImageBase64:
          modelResult.annotatedImageBase64 || "",

        gradCamBase64:
          modelResult.gradCamBase64 || "",

        originalImageBase64: preview,

        createdAt: serverTimestamp(),
      });

      // 3️⃣ DONE
      setProgress(100);
      setStatus("done");

      // 4️⃣ REDIRECT TO RESULTS PAGE
      setTimeout(() => {
        router.push("/results");
      }, 1200);

    } catch (err: any) {
      console.error(err);

      setError(
        err?.message ||
          "Something went wrong."
      );

      setStatus("error");
      setProgress(0);
    }
  };

  const isLoading =
    status === "calling-model" ||
    status === "saving";

  // ─────────────────────────────────────────────
  // LOADING
  // ─────────────────────────────────────────────
  if (authLoading) {
    return (
      <main className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <p className="text-[var(--primary-dark)] font-semibold">
          Loading…
        </p>
      </main>
    );
  }

  // ─────────────────────────────────────────────
  // UI
  // ─────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-[var(--background)] p-4 sm:p-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-xl bg-white rounded-[28px] shadow-[var(--shadow-card)] p-6 sm:p-10 flex flex-col gap-6">

        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <img
              src="/logo.png"
              alt="MEDORA"
              className="w-8 h-8"
            />

            <h1 className="text-2xl font-bold text-[var(--primary-dark)]">
              Upload X-Ray
            </h1>
          </div>

          <p className="text-sm text-[var(--text-soft)]">
            Upload a pediatric wrist X-ray.
            The AI model will detect fractures
            and save results automatically.
          </p>
        </div>

        {/* Patient Name */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-[var(--foreground)]">
            Patient Name{" "}
            <span className="text-[var(--text-soft)]">
              (optional)
            </span>
          </label>

          <input
            type="text"
            value={patientName}
            onChange={(e) =>
              setPatientName(e.target.value)
            }
            placeholder="e.g. Arun Kumar"
            disabled={isLoading}
            className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--primary)] disabled:opacity-50"
          />
        </div>

        {/* Upload Box */}
        <div
          onDragOver={(e) =>
            e.preventDefault()
          }
          onDrop={handleDrop}
          onClick={() =>
            !isLoading &&
            fileInputRef.current?.click()
          }
          className={`cursor-pointer rounded-2xl border-2 border-dashed transition-colors flex flex-col items-center justify-center py-10 px-4 gap-3 ${
            isLoading
              ? "border-[var(--border)] bg-[var(--background)] opacity-60 cursor-not-allowed"
              : "border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)]"
          }`}
        >
          {preview ? (
            <img
              src={preview}
              alt="Preview"
              className="max-h-52 rounded-xl object-contain"
            />
          ) : (
            <>
              <div className="rounded-full bg-[var(--primary)]/10 p-4">
                <svg
                  className="w-8 h-8 text-[var(--primary)]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 12V4m0 0L8 8m4-4l4 4"
                  />
                </svg>
              </div>

              <p className="text-sm text-[var(--text-soft)] text-center">
                Drag & drop or{" "}
                <span className="text-[var(--primary)] font-medium">
                  browse
                </span>{" "}
                to upload
              </p>

              <p className="text-xs text-[var(--text-soft)]">
                PNG, JPG, WEBP — up to 10 MB
              </p>
            </>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
          />
        </div>

        {/* Remove */}
        {preview && !isLoading && (
          <button
            onClick={() => {
              setFile(null);
              setPreview("");
              setError("");
              setStatus("idle");
            }}
            className="text-sm text-[var(--primary)] underline text-left"
          >
            Remove image and choose another
          </button>
        )}

        {/* Progress */}
        {isLoading && (
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-[var(--primary-dark)]">
              {status === "calling-model"
                ? "🔬 Running AI fracture detection…"
                : "💾 Saving results to database…"}
            </p>

            <div className="h-2 w-full rounded-full bg-[var(--secondary)]/40 overflow-hidden">
              <div
                className="h-full rounded-full bg-[var(--primary)] transition-all duration-700"
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 leading-relaxed">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Button */}
        <button
          onClick={analyzeImage}
          disabled={!file || isLoading}
          className="rounded-xl bg-[var(--primary-dark)] text-white font-semibold py-3 text-sm hover:bg-[var(--primary)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading
            ? "Analyzing…"
            : "Analyze X-Ray"}
        </button>

        {/* Footer */}
        <div className="flex justify-between text-sm text-[var(--text-soft)]">
          <button
            onClick={() =>
              router.push("/dashboard")
            }
            className="hover:text-[var(--primary)]"
          >
            ← Dashboard
          </button>

          <button
            onClick={() =>
              router.push("/results")
            }
            className="hover:text-[var(--primary)]"
          >
            View Last Result →
          </button>
        </div>
      </div>
    </main>
  );
}
