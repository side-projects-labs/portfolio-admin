'use client';
import { ExternalLink, Menu, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import Navigation from './components/navigation';
import User from './components/user';
export default function SideNav() {
  const [isOpen, setIsOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLDivElement>(null);
  const close = () => {
    setIsOpen(false);
    trigger.current?.focus();
  };
  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.current?.querySelector<HTMLButtonElement>('button')?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
      }
      if (event.key !== 'Tab') return;
      const elements = dialog.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])');
      if (!elements?.length) return;
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    const onResize = () => {
      if (window.innerWidth >= 750) close();
    };
    window.addEventListener('resize', onResize);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', onResize);
    };
  }, [isOpen]);
  const content = (
    <>
      <User />
      <Navigation onNavigate={close} />
      <a
        href="https://www.ycseng.com"
        target="_blank"
        rel="noreferrer"
        className="mx-3 mb-5 flex items-center justify-between rounded-md px-3 py-3 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        포트폴리오 보기
        <ExternalLink size={14} aria-hidden="true" />
      </a>
      <div className="border-t border-border px-6 py-4 text-[11px] text-muted-foreground">콘텐츠 관리 공간</div>
    </>
  );
  return (
    <>
      <button
        ref={trigger}
        type="button"
        aria-label="메뉴 열기"
        aria-expanded={isOpen}
        aria-controls="mobile-navigation"
        onClick={() => setIsOpen(true)}
        className="fixed left-4 top-5 z-30 flex size-9 items-center justify-center rounded-md border border-border bg-background text-foreground shadow-sm tablet:hidden"
      >
        <Menu size={18} />
      </button>
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-border bg-muted/50 tablet:flex">
        {content}
      </aside>
      {isOpen && (
        <div
          ref={dialog}
          id="mobile-navigation"
          role="dialog"
          aria-modal="true"
          aria-label="관리 메뉴"
          className="fixed inset-0 z-50 tablet:hidden"
        >
          <button type="button" aria-label="메뉴 닫기" onClick={close} className="absolute inset-0 bg-black/30" />
          <div className="relative flex h-full w-72 max-w-[85vw] flex-col border-r border-border bg-background shadow-xl">
            <button
              type="button"
              aria-label="메뉴 닫기"
              onClick={close}
              className="absolute right-3 top-6 rounded-md p-1 text-muted-foreground hover:bg-muted"
            >
              <X size={18} />
            </button>
            {content}
          </div>
        </div>
      )}
    </>
  );
}
