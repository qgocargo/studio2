import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("text-primary", className)}
    >
      <path d="M9 18V5l2-2 2 2v13" />
      <path d="M11 18h10" />
      <path d="M3 22v-6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v6Z" />
      <path d="M3 12V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v6Z" />
    </svg>
  );
}
