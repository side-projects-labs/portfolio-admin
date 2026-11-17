'use client';
import { ChevronRight } from 'lucide-react';
import Container from '../container';
import { ThemeToggle } from '../theme-toggle';
import { LoginWithButton } from '@/components/ui/login-menu';
import { cn } from '@/lib/utils';
import { type Navigation } from '@/types/navigation';
export default function TopNav({ title, isTheme = true, isLogin = true, className }: Navigation) {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur-sm">
      <Container className={cn('flex min-h-20 items-center justify-between gap-4 py-4 pl-16 tablet:pl-8', className)}>
        <div className="min-w-0">
          <div className="mb-1 hidden items-center gap-2 text-[11px] text-muted-foreground tablet:flex">
            <span>워크스페이스</span>
            <ChevronRight size={12} aria-hidden="true" />
            <span>콘텐츠 관리</span>
          </div>
          <h1 className="truncate text-lg font-semibold tracking-tight">{title}</h1>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {isTheme && <ThemeToggle />}
          {isLogin && <LoginWithButton />}
        </div>
      </Container>
    </header>
  );
}
