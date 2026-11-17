'use client';

import dynamic from 'next/dynamic';
import { type ReactNode } from 'react';
import { SideNav } from '../../nav';
import AppContainer from './container';

const ProgressBar = dynamic(() => import('@/components/ui/progressbar'), { ssr: false });

export default function AppLayout({ children, isLogin }: { children: ReactNode; isLogin: boolean }) {
  if (!isLogin) {
    return (
      <AppContainer>
        <ProgressBar />
        <div className="min-w-0 flex-1">{children}</div>
      </AppContainer>
    );
  }

  return (
    <>
      <AppContainer>
        <ProgressBar />
        <a
          href="#main-content"
          className="sr-only z-50 rounded-md bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:left-4 focus:top-2"
        >
          본문으로 건너뛰기
        </a>
        <SideNav />
        <div className="min-w-0 flex-1">{children}</div>
      </AppContainer>
    </>
  );
}
