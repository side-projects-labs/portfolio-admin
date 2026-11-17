'use client';
import { X } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { type ModalProps } from '@/types/modal';
function Modal({ children, footer, isOpen = false, headerTitle = '', onClose }: ModalProps) {
  const [portal, setPortal] = useState<HTMLElement | null>(null);
  const panel = useRef<HTMLDivElement>(null);
  const close = useRef(onClose);
  close.current = onClose;
  const titleId = useId();
  useEffect(() => {
    setPortal(document.getElementById('modal'));
  }, []);
  useEffect(() => {
    if (!isOpen || !portal) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const firstInput = panel.current?.querySelector<HTMLElement>(
      'input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled])',
    );
    firstInput?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close.current?.();
      }
      if (event.key !== 'Tab') return;
      const controls = panel.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled])',
      );
      if (!controls?.length) return;
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      }
      if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, [isOpen, portal]);
  if (!portal || !isOpen) return null;
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/30 p-4 backdrop-blur-sm"
      onClick={event => {
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative my-auto max-h-[90dvh] w-full max-w-2xl overflow-y-auto rounded-xl border border-border bg-background text-foreground shadow-xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
          <div>
            <p className="mb-1 text-[11px] text-muted-foreground">콘텐츠 관리</p>
            <h2 id={titleId} className="text-lg font-semibold tracking-tight">
              {headerTitle}
            </h2>
          </div>
        </header>
        <div className="px-6 py-6">{children}</div>
        {footer ?? (
          <footer className="border-t border-border px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-border px-4 py-2 text-sm hover:bg-muted"
            >
              닫기
            </button>
          </footer>
        )}
        <button
          type="button"
          aria-label="모달 닫기"
          onClick={onClose}
          className="absolute right-5 top-5 rounded-md p-2 text-muted-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X size={16} />
        </button>
      </div>
    </div>,
    portal,
  );
}
export { Modal };
