'use client';

import { usePathname } from 'next/navigation';

import Container from '@/components/container';
import { TopNav } from '@/components/nav';

export default function ProjectLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const title =
    pathname === '/profile/create' ? '새 프로필' : pathname === '/profile/edit' ? '프로필 수정' : '프로필 관리';

  return (
    <>
      <TopNav title={title} />
      <main id="main-content" tabIndex={-1} className="admin-content py-6 tablet:py-8">
        <Container>{children}</Container>
      </main>
    </>
  );
}
