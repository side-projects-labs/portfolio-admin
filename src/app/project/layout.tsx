'use client';

import { usePathname } from 'next/navigation';

import Container from '@/components/container';
import { TopNav } from '@/components/nav';
import { usePropsContext } from '@/lib/context/props';

export default function ProjectLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const title =
    pathname === '/project/create'
      ? '새 프로젝트'
      : pathname === '/project/edit'
        ? '프로젝트 수정'
        : pathname.startsWith('/project/write/')
          ? '프로젝트 본문 편집'
          : pathname.startsWith('/project/preview/')
            ? '프로젝트 미리보기'
            : '프로젝트 목록';
  const { contextProps } = usePropsContext<{ header: React.ReactNode }>();

  return (
    <>
      {contextProps && contextProps?.header ? contextProps.header : <TopNav title={title} />}
      <main id="main-content" tabIndex={-1} className="admin-content py-6 tablet:py-8">
        <Container>{children}</Container>
      </main>
    </>
  );
}
