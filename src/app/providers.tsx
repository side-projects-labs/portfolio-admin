'use client';

import { ModeThemeProvider } from '@/components/providers/mode-theme-provider';
import { PropsProvider } from '@/lib/context/props';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PropsProvider>
      <ModeThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
        {children}
      </ModeThemeProvider>
    </PropsProvider>
  );
}
