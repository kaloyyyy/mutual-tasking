"use client";

import { useRouter } from "next/navigation";

interface BackButtonProps {
  label?: string; // optional custom text
  className?: string; // optional extra styling
}

export default function BackButton({ label = "← Back", className = "" }: BackButtonProps) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className={`text-sm sm:text-base font-medium text-blue-400 hover:text-blue-500 transition ${className}`}
    >
      {label}
    </button>
  );
}
