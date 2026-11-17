import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import Layout from './layout';
const route = vi.hoisted(() => ({ pathname: '' }));
vi.mock('next/navigation', () => ({ usePathname: () => route.pathname }));
vi.mock('@/components/nav', () => ({ TopNav: ({ title }: { title: string }) => <h1>{title}</h1> }));
vi.mock('@/lib/context/props', () => ({ usePropsContext: () => ({ contextProps: null }) }));
afterEach(cleanup);
describe('관리 화면 현재 위치', () => {
  it.each([
    ['/project', '프로젝트 목록'],
    ['/project/create', '새 프로젝트'],
    ['/project/edit', '프로젝트 수정'],
    ['/project/write/project-1', '프로젝트 본문 편집'],
    ['/project/preview/project-1', '프로젝트 미리보기'],
  ])('%s에서 화면 목적에 맞는 제목을 표시한다', (pathname, title) => {
    route.pathname = pathname;
    render(
      <Layout>
        <p>관리 콘텐츠</p>
      </Layout>,
    );
    expect(screen.getByRole('heading', { level: 1, name: title })).toBeInTheDocument();
    expect(screen.getByText('관리 콘텐츠')).toBeInTheDocument();
  });
});
