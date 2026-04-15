"use client";

import dynamic from "next/dynamic";

// Uppy packages (specifically @uppy/dashboard) bundle Preact internally.
// Evaluating these files during Next.js standard Server-Side Rendering sweeps causes SSR
// hooks mismatches inside the Preact context, triggering the '__H' undefined error.
// We must dynamically load the core uploader ONLY on the client to entirely bypass SSR evaluation.
export const UppyUploader = dynamic(
  () => import("./uppy-core").then((mod) => mod.UppyUploader),
  {
    ssr: false, // CRITICAL: This explicitly skips Next.js Server Rendering
    loading: () => (
      <div className="h-[450px] w-full animate-pulse bg-muted/20 border border-dashed rounded-lg flex flex-col gap-4 items-center justify-center text-muted-foreground mt-6">
        <svg
          className="w-8 h-8 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <span>Loading bulk storage pipeline...</span>
      </div>
    ),
  }
);
