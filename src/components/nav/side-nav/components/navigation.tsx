'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { navigations } from '@/config/site';
import { cn } from '@/lib/utils';
export default function Navigation({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav aria-label="콘텐츠 관리" className="flex flex-1 flex-col gap-1 px-3 py-5">
      <p className="px-3 pb-2 text-[11px] font-medium tracking-wider text-muted-foreground">워크스페이스</p>
      {navigations.map(({ icon: Icon, name, href }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex min-h-10 items-center gap-3 rounded-md px-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              active
                ? 'bg-white font-medium text-foreground shadow-sm ring-1 ring-black/5 dark:bg-white/10 dark:ring-white/5'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            <Icon size={17} strokeWidth={1.7} aria-hidden="true" />
            {name}
          </Link>
        );
      })}
    </nav>
  );
}
