import { PanelsTopLeft } from 'lucide-react';
import Link from 'next/link';
export default function User() {
  return (
    <Link
      href="/project"
      className="flex h-20 items-center gap-3 px-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="flex size-8 items-center justify-center rounded-lg border border-border bg-background text-foreground">
        <PanelsTopLeft size={18} aria-hidden="true" />
      </span>
      <span>
        <span className="block text-sm font-semibold tracking-tight">Portfolio</span>
        <span className="block text-xs text-muted-foreground">콘텐츠 워크스페이스</span>
      </span>
    </Link>
  );
}
