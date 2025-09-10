// Utility: cn (classNames) for merging Tailwind classes
// Simple version for Tailwind/React
export function cn(...args: (string | false | null | undefined)[]): string {
  return args.filter(Boolean).join(' ');
}
