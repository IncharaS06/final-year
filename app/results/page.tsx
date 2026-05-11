"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { auth, db } from "@/lib/firebase";

import { onAuthStateChanged } from "firebase/auth";

import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";

export default function ResultsPage() {

  const router = useRouter();

  const [loading, setLoading] =
    useState(true);

  const [data, setData] =
    useState<any>(null);

  // ─────────────────────────────────────────────
  // FETCH LATEST RESULT
  // ─────────────────────────────────────────────
  useEffect(() => {

    const unsub = onAuthStateChanged(
      auth,
      async (user) => {

        if (!user) {

          router.push("/auth");

          return;
        }

        try {

          const q = query(

            collection(db, "cases"),

            where(
              "userId",
              "==",
              user.uid
            ),

            orderBy(
              "createdAt",
              "desc"
            ),

            limit(1)
          );

          const snap =
            await getDocs(q);

          if (!snap.empty) {

            const doc =
              snap.docs[0];

            setData({
              id: doc.id,
              ...doc.data(),
            });
          }

        } catch (err) {

          console.error(err);

        } finally {

          setLoading(false);
        }
      }
    );

    return () => unsub();

  }, [router]);

  // ─────────────────────────────────────────────
  // LOADING
  // ─────────────────────────────────────────────
  if (loading) {

    return (
      <main className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <p className="text-[var(--primary-dark)] font-semibold">
          Loading result...
        </p>
      </main>
    );
  }

  // ─────────────────────────────────────────────
  // NO DATA
  // ─────────────────────────────────────────────
  if (!data) {

    return (

      <main className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[var(--background)]">

        <h1 className="text-2xl font-bold text-[var(--primary-dark)]">
          No Results Found
        </h1>

        <button
          onClick={() =>
            router.push("/upload")
          }
          className="px-5 py-3 rounded-xl bg-[var(--primary-dark)] text-white"
        >
          Upload X-Ray
        </button>
      </main>
    );
  }

  // ─────────────────────────────────────────────
  // UI
  // ─────────────────────────────────────────────
  return (

    <main className="min-h-screen bg-[var(--background)] p-4 sm:p-8">

      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">

          <div>
            <h1 className="text-3xl font-bold text-[var(--primary-dark)]">
              Fracture Analysis Result
            </h1>

            <p className="text-sm text-[var(--text-soft)] mt-1">
              AI-powered pediatric wrist fracture detection
            </p>
          </div>

          <button
            onClick={() =>
              router.push("/upload")
            }
            className="rounded-xl bg-[var(--primary-dark)] text-white px-5 py-3 text-sm font-medium hover:bg-[var(--primary)] transition"
          >
            Analyze New X-Ray
          </button>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">

          <div className="bg-white rounded-2xl shadow-[var(--shadow-card)] p-5">
            <p className="text-sm text-[var(--text-soft)]">
              Prediction
            </p>

            <h2 className="text-2xl font-bold mt-2 text-[var(--primary-dark)]">
              {data.prediction}
            </h2>
          </div>

          <div className="bg-white rounded-2xl shadow-[var(--shadow-card)] p-5">
            <p className="text-sm text-[var(--text-soft)]">
              Risk Level
            </p>

            <h2 className="text-2xl font-bold mt-2 text-[var(--primary-dark)]">
              {data.riskLevel}
            </h2>
          </div>

          <div className="bg-white rounded-2xl shadow-[var(--shadow-card)] p-5">
            <p className="text-sm text-[var(--text-soft)]">
              Confidence
            </p>

            <h2 className="text-2xl font-bold mt-2 text-[var(--primary-dark)]">
              {Number(
                data.confidence || 0
              ).toFixed(2)}%
            </h2>
          </div>

          <div className="bg-white rounded-2xl shadow-[var(--shadow-card)] p-5">
            <p className="text-sm text-[var(--text-soft)]">
              Patient
            </p>

            <h2 className="text-2xl font-bold mt-2 text-[var(--primary-dark)]">
              {data.patientName}
            </h2>
          </div>
        </div>

        {/* Images */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Original */}
          <div className="bg-white rounded-2xl shadow-[var(--shadow-card)] p-5">

            <h3 className="text-lg font-semibold mb-4 text-[var(--primary-dark)]">
              Original X-Ray
            </h3>

            <img
              src={data.originalImageBase64}
              alt="Original X-Ray"
              className="w-full rounded-xl border object-contain"
            />
          </div>

          {/* Annotated */}
          <div className="bg-white rounded-2xl shadow-[var(--shadow-card)] p-5">

            <h3 className="text-lg font-semibold mb-4 text-[var(--primary-dark)]">
              Annotated Detection
            </h3>

            <img
              src={data.annotatedImageBase64}
              alt="Annotated Detection"
              className="w-full rounded-xl border object-contain"
            />
          </div>
        </div>

        {/* GradCAM */}
        {data.gradCamBase64 && (

          <div className="mt-6 bg-white rounded-2xl shadow-[var(--shadow-card)] p-5">

            <h3 className="text-lg font-semibold mb-4 text-[var(--primary-dark)]">
              GradCAM Heatmap
            </h3>

            <img
              src={data.gradCamBase64}
              alt="GradCAM"
              className="w-full max-w-3xl rounded-xl border object-contain"
            />
          </div>
        )}

        {/* Summary */}
        <div className="mt-6 bg-white rounded-2xl shadow-[var(--shadow-card)] p-6">

          <h3 className="text-lg font-semibold mb-4 text-[var(--primary-dark)]">
            Clinical Summary
          </h3>

          <p className="text-[var(--foreground)] leading-relaxed">
            {data.summary}
          </p>

          <div className="mt-4 rounded-xl bg-[var(--background)] p-4 border border-[var(--border)]">
            <p className="text-sm text-[var(--text-soft)]">
              Recommendation
            </p>

            <p className="mt-1 text-sm text-[var(--foreground)]">
              {data.recommendation}
            </p>
          </div>
        </div>

      </div>
    </main>
  );
}
