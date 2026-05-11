"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { auth, db } from "@/lib/firebase";

import { onAuthStateChanged, User } from "firebase/auth";

import {
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

import { callHuggingFaceModel } from "@/lib/huggingface";

export default function UploadPage() {

  const router = useRouter();

  const [firebaseUser, setFirebaseUser] =
    useState<User | null>(null);

  const [authLoading, setAuthLoading] =
    useState(true);

  const [file, setFile] =
    useState<File | null>(null);

  const [preview, setPreview] =
    useState("");

  const [patientName, setPatientName] =
    useState("");

  const [status, setStatus] = useState<
    "idle" |
    "calling-model" |
    "saving" |
    "done" |
    "error"
  >("idle");

  const [error, setError] =
    useState("");

  const [progress, setProgress] =
    useState(0);

  const fileInputRef =
    useRef<HTMLInputElement>(null);

  // ─────────────────────────────────────────────
  // AUTH
  // ─────────────────────────────────────────────
  useEffect(() => {

    const unsub = onAuthStateChanged(
      auth,
      (user) => {

        if (!user) {
          router.push("/auth");
          return;
        }

        setFirebaseUser(user);

        setAuthLoading(false);
      }
    );

    return () => unsub();

  }, [router]);

  // ─────────────────────────────────────────────
  // FILE READER
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

    if (!file || !firebaseUser || !preview) {
      return;
    }

    setError("");

    setProgress(10);

    setStatus("calling-model");

    try {

      // CALL HUGGING FACE
      const modelResult =
        await callHuggingFaceModel(preview);

      setProgress(70);

      setStatus("saving");

      // SAVE TO FIRESTORE
      const docRef = await addDoc(
        collection(db, "cases"),
        {

          userId: firebaseUser.uid,

          userEmail:
            firebaseUser.email ?? "",

          patientName:
            patientName.trim() || "Unknown",

          prediction:
            modelResult.prediction,

          confidence:
            modelResult.confidence ?? 0,

          fractureProbability:
            modelResult.fractureProbability ?? 0,

          riskLevel:
            modelResult.riskLevel ?? "Unknown",

          boxes:
            modelResult.boxes ?? [],

          modelName:
            modelResult.modelName ??
            "EfficientNetB3 + YOLOv8",

          summary:
            modelResult.summary ??
            "AI analysis completed.",

          recommendation:
            modelResult.recommendation ??
            "Clinical review recommended.",

          originalImageBase64:
            preview,

          annotatedImageBase64:
            modelResult.annotatedImageBase64 ?? "",

          gradCamBase64:
            modelResult.gradCamBase64 ?? "",

          createdAt:
            serverTimestamp(),
        }
      );

      setProgress(100);

      setStatus("done");

      // REDIRECT TO RESULT PAGE
      setTimeout(() => {

        router.push(
          `/results/${docRef.id}`
        );

      }, 1200);

    } catch (err: any) {

      console.error(err);

      setError(
        err?.message ??
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
      <main className="min-h-screen flex items-center justify-center">
        Loading...
      </main>
    );
  }

  // ─────────────────────────────────────────────
  // UI
  // ─────────────────────────────────────────────
  return (

    <main className="min-h-screen bg-[#F8F7FF] p-4 sm:p-8 flex items-center justify-center">

      <div className="w-full max-w-xl bg-white rounded-[28px] shadow-xl p-6 sm:p-10 flex flex-col gap-6">

        {/* Header */}
        <div>

          <div className="flex items-center gap-3 mb-2">

            <img
              src="/logo.png"
              alt="MEDORA"
              className="w-8 h-8"
            />

            <h1 className="text-2xl font-bold text-[#2E2E3A]">
              Upload X-Ray
            </h1>
          </div>

          <p className="text-sm text-gray-500">
            Upload a pediatric wrist X-ray
            for AI fracture detection.
          </p>
        </div>

        {/* Patient */}
        <div className="flex flex-col gap-2">

          <label className="text-sm font-medium">
            Patient Name
          </label>

          <input
            type="text"
            value={patientName}
            onChange={(e) =>
              setPatientName(e.target.value)
            }
            placeholder="e.g. Arun Kumar"
            disabled={isLoading}
            className="rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#7C6EE6]"
          />
        </div>

        {/* Upload Area */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() =>
            !isLoading &&
            fileInputRef.current?.click()
          }
          className={`rounded-2xl border-2 border-dashed flex flex-col items-center justify-center py-10 px-4 transition cursor-pointer

          ${
            isLoading
              ? "opacity-60 cursor-not-allowed"
              : "hover:border-[#7C6EE6]"
          }`}
        >

          {preview ? (

            <img
              src={preview}
              alt="Preview"
              className="max-h-60 rounded-xl object-contain"
            />

          ) : (

            <>
              <div className="rounded-full bg-[#7C6EE6]/10 p-4 mb-3">

                <svg
                  className="w-8 h-8 text-[#7C6EE6]"
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

              <p className="text-sm text-gray-500 text-center">
                Drag & drop or browse to upload
              </p>

              <p className="text-xs text-gray-400 mt-1">
                PNG, JPG, WEBP
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
            className="text-sm text-[#7C6EE6] underline text-left"
          >
            Remove image
          </button>
        )}

        {/* Progress */}
        {isLoading && (

          <div className="flex flex-col gap-2">

            <p className="text-sm font-medium">

              {status === "calling-model"
                ? "🔬 Running AI model..."
                : "💾 Saving results..."}
            </p>

            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">

              <div
                className="h-full bg-[#7C6EE6] transition-all duration-700"
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Error */}
        {error && (

          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">

            {error}
          </div>
        )}

        {/* Button */}
        <button
          onClick={analyzeImage}
          disabled={!file || isLoading}
          className="rounded-xl bg-[#7C6EE6] text-white py-3 font-semibold hover:bg-[#6B5DDA] disabled:opacity-50"
        >

          {isLoading
            ? "Analyzing..."
            : "Analyze X-Ray"}
        </button>

      </div>

    </main>
  );
}
