"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function ManageClient({ manageToken }: { manageToken: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isDeleted, setIsDeleted] = useState(false); // New state for deleted profiles

  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    async function run() {
      setError(null);
      
      const token = (manageToken ?? "").trim();
      if (!token) {
        setError("Missing manage token.");
        return;
      }

      try {
        const res = await fetch("/api/resolve-manage-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ manage_token: token }),
        });

        // 1. Handle API Errors (like 404 or 500)
        if (!res.ok) {
          const text = await res.text();
          setError(text || `Failed to load (${res.status})`);
          return;
        }

        // 2. Parse Response
        const data = await res.json();

        // 3. Check if Deleted
        if (data.deleted) {
          setIsDeleted(true);
          return;
        }

        // 4. Success - Redirect to dashboard
        if (data.id) {
          router.replace(`/me?id=${encodeURIComponent(data.id)}`);
        } else {
          setError("Resolved token but got no id back.");
        }

      } catch (e: any) {
        setError(e?.message ?? "Network error while resolving token.");
      }
    }

    run();
  }, [manageToken, router]);

  // --- VIEW 1: SUBMISSION DELETED ---
  if (isDeleted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4 font-sans text-black">
        <div className="w-full max-w-lg rounded-2xl bg-white p-10 text-center shadow-xl">
          
          <div className="mb-6 flex justify-center">
             {/* Uses your existing logo */}
             <Image src="/binah_logo.png" alt="Logo" width={120} height={120} className="object-contain" priority />
          </div>

          <h1 className="mb-4 text-2xl font-bold text-red-600">
            Submission Deleted
          </h1>
          <p className="mb-8 text-lg text-zinc-600">
            This submission has been deleted. If you would like to rejoin, please submit a new form below.
          </p>

          <div className="flex flex-col gap-4">
            <a
              href="https://forms.shidduch-gmach.org/english"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full rounded-xl bg-black py-4 text-lg font-semibold text-white transition hover:bg-zinc-800"
            >
              Submit New (English)
            </a>

            <a
              href="https://forms.shidduch-gmach.org/hebrew"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full rounded-xl border-2 border-black bg-white py-4 text-lg font-semibold text-black transition hover:bg-zinc-50"
            >
              Submit New (Hebrew)
            </a>
          </div>
        </div>
      </div>
    );
  }

  // --- VIEW 2: ERROR ---
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4">
        <div className="max-w-md rounded-lg bg-white p-8 shadow text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">Access Error</h2>
          <p className="text-zinc-700">{error}</p>
        </div>
      </div>
    );
  }

  // --- VIEW 3: LOADING ---
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans text-zinc-500">
      Opening your submission...
    </div>
  );
}