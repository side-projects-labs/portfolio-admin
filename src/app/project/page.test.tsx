import { render, screen, within, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ProjectSource, type AdminProjectResponse } from '@/docs/api';
import Project from './page';
import type { ReactNode } from 'react';

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  mutate: vi.fn(),
  patch: vi.fn(),
  remove: vi.fn(),
  projects: [] as unknown[],
  error: undefined as unknown,
  loading: false,
  store: { table: { body: [], pagination: null }, checkbox: [], setBody: vi.fn() },
}));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: mocks.push }) }));
vi.mock('swr', () => ({
  default: (url: string) =>
    url.includes('/api/stacks')
      ? { data: { data: [] } }
      : {
          data: { data: { data: mocks.projects, total: mocks.projects.length, allTotal: mocks.projects.length } },
          error: mocks.error,
          isLoading: mocks.loading,
          mutate: mocks.mutate,
        },
}));
vi.mock('@/lib/api', () => ({
  patchData: (...args: unknown[]) => mocks.patch(...args),
  deleteData: (...args: unknown[]) => mocks.remove(...args),
}));
vi.mock('@/lib/zustand/table', () => ({ useTableStore: () => mocks.store }));
vi.mock('@yeoncheols/portfolio-core-ui', () => ({ StackIcon: () => null }));
vi.mock('@/components/ui/table', () => ({
  Table: ({
    table,
  }: {
    table: {
      body: Record<string, unknown>[];
      rowClassName?: (row: Record<string, unknown>, index: number) => string | undefined;
    };
  }) => (
    <div>
      {table.body.map((row, index) => (
        <section key={index} aria-label={`프로젝트 ${index + 1}`} className={table.rowClassName?.(row, index)}>
          {Object.entries(row).map(([key, value]) => {
            if (value && typeof value === 'object' && 'link' in value) {
              const link = value.link as { href: string; title: string };
              return (
                <a key={key} href={link.href}>
                  {link.title}
                </a>
              );
            }
            if (value && typeof value === 'object' && ('checkbox' in value || 'status' in value)) return null;
            return <div key={key}>{value as ReactNode}</div>;
          })}
        </section>
      ))}
    </div>
  ),
}));
const project = (source: ProjectSource, id: number): AdminProjectResponse => ({
  id,
  source,
  isBlocked: source === ProjectSource.Personal,
  title: source === ProjectSource.Personal ? '개인 프로젝트' : '회사 프로젝트',
  slug: `project-${id}`,
  description: '설명',
  image: '',
  stacks: '[]',
  content: '프로젝트 본문',
  isShow: true,
  linkDemo: '',
  linkGithub: `https://github.com/example/project-${id}`,
  order: id,
  updatedAt: '2026-11-16',
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(window, 'confirm').mockReturnValue(true);
  mocks.loading = false;
  mocks.error = undefined;
  mocks.projects = [project(ProjectSource.Personal, 2), project(ProjectSource.Company, 1)];
});
describe('프로젝트 목록 수정 정책', () => {
  it('읽기 전용 프로젝트의 행 전체를 배경과 강조선으로 구분한다', () => {
    render(<Project />);
    const personal = screen.getByRole('region', { name: '프로젝트 1' });
    const company = screen.getByRole('region', { name: '프로젝트 2' });
    expect(personal).toHaveClass('bg-slate-100', 'border-l-4');
    expect(company).not.toHaveClass('bg-slate-100');
    expect(within(personal).getByRole('button', { name: '숨김' })).toBeEnabled();
    expect(within(personal).getByRole('button', { name: '삭제' })).toBeEnabled();
  });
  it('전체 목록을 유지하면서 개인 프로젝트의 콘텐츠 수정만 비활성화한다', () => {
    render(<Project />);
    const personal = within(screen.getByRole('region', { name: '프로젝트 1' }));
    const company = within(screen.getByRole('region', { name: '프로젝트 2' }));
    expect(personal.getByText('자동 동기화 · 읽기 전용')).toBeInTheDocument();
    expect(personal.getByRole('button', { name: '수정' })).toBeDisabled();
    expect(company.getByRole('button', { name: '수정' })).toBeEnabled();
    expect(personal.getByRole('button', { name: '삭제' })).toBeEnabled();
  });
});

describe('개인 프로젝트 관리 기능', () => {
  it('읽기 전용이어도 게시·숨김과 삭제 요청을 전송하고 목록을 갱신한다', async () => {
    mocks.patch.mockResolvedValue({ status: 200 });
    mocks.remove.mockResolvedValue({ status: 200 });
    const view = render(<Project />);
    const user = userEvent.setup();
    await user.click(within(screen.getByRole('region', { name: '프로젝트 1' })).getByRole('button', { name: '숨김' }));
    expect(mocks.patch).toHaveBeenLastCalledWith('/api/project/show', { slug: 'project-2', isShow: false });
    mocks.projects = [{ ...project(ProjectSource.Personal, 2), isShow: false }, project(ProjectSource.Company, 1)];
    view.rerender(<Project />);
    await user.click(within(screen.getByRole('region', { name: '프로젝트 1' })).getByRole('button', { name: '게시' }));
    expect(mocks.patch).toHaveBeenLastCalledWith('/api/project/show', { slug: 'project-2', isShow: true });
    await user.click(within(screen.getByRole('region', { name: '프로젝트 1' })).getByRole('button', { name: '삭제' }));
    expect(mocks.remove).toHaveBeenCalledWith('/api/project/delete?slug=project-2');
    expect(mocks.mutate).toHaveBeenCalledTimes(3);
  });
  it('개인 본문은 미리보기로 연결하고 회사 본문은 편집 화면으로 연결한다', () => {
    render(<Project />);
    expect(
      within(screen.getByRole('region', { name: '프로젝트 1' })).getByRole('link', { name: '본문 보기' }),
    ).toHaveAttribute('href', '/project/preview/project-2');
    expect(
      within(screen.getByRole('region', { name: '프로젝트 2' })).getByRole('link', { name: '본문 편집' }),
    ).toHaveAttribute('href', '/project/write/project-1');
  });
  it('차단 정책이 누락되면 콘텐츠 편집을 활성화하지 않는다', () => {
    mocks.projects = [{ ...project(ProjectSource.Personal, 2), isBlocked: undefined, content: '' }];
    render(<Project />);
    expect(screen.getByRole('button', { name: '수정' })).toBeDisabled();
    expect(screen.queryByRole('link', { name: '본문 편집' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '삭제' })).toBeEnabled();
  });
});

describe('프로젝트 목록 탐색', () => {
  it('검색과 게시 상태를 함께 적용하고 전체 게시 집계를 유지한다', async () => {
    mocks.projects = [project(ProjectSource.Personal, 2), { ...project(ProjectSource.Company, 1), isShow: false }];
    const user = userEvent.setup();
    render(<Project />);
    await user.type(screen.getByRole('searchbox', { name: '프로젝트 검색' }), '회사');
    expect(screen.queryByText('개인 프로젝트')).not.toBeInTheDocument();
    expect(screen.getByText('회사 프로젝트')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '게시 1' }));
    expect(screen.queryByText('회사 프로젝트')).not.toBeInTheDocument();
    expect(screen.getByText('조건에 맞는 프로젝트가 없습니다.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '필터 초기화' }));
    expect(screen.getByText('개인 프로젝트')).toBeInTheDocument();
    expect(screen.getByText('회사 프로젝트')).toBeInTheDocument();
  });
  it('조회 실패를 빈 목록으로 표시하지 않고 재시도를 제공한다', async () => {
    mocks.error = new Error('fixture failure');
    render(<Project />);
    expect(screen.getByRole('alert')).toHaveTextContent('프로젝트를 불러오지 못했습니다');
    await userEvent.setup().click(screen.getByRole('button', { name: '다시 시도' }));
    expect(mocks.mutate).toHaveBeenCalled();
  });
});

describe('목록 조작 경계', () => {
  it('출처 필터로 개인 프로젝트만 보더라도 전체 집계는 유지한다', async () => {
    render(<Project />);
    await userEvent.setup().selectOptions(screen.getByRole('combobox', { name: '프로젝트 출처' }), 'personal');
    expect(screen.getByRole('button', { name: '개인 프로젝트' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '회사 프로젝트' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '전체 2' })).toBeInTheDocument();
  });
  it('읽기 전용이어도 기본 노출 순서를 변경하고 목록을 갱신한다', async () => {
    mocks.patch.mockResolvedValue({ status: 200 });
    render(<Project />);
    await userEvent.setup().click(screen.getByRole('button', { name: '개인 프로젝트 순서 아래로' }));
    expect(mocks.patch).toHaveBeenCalledWith('/api/project/order', {
      nextSlug: 'project-2',
      nextOrderNo: 1,
      prevSlug: 'project-1',
      prevOrderNo: 2,
    });
    expect(mocks.mutate).toHaveBeenCalledTimes(1);
  });
  it('삭제 확인을 취소하면 요청하지 않는다', async () => {
    vi.mocked(window.confirm).mockReturnValue(false);
    render(<Project />);
    await userEvent
      .setup()
      .click(within(screen.getByRole('region', { name: '프로젝트 1' })).getByRole('button', { name: '삭제' }));
    expect(mocks.remove).not.toHaveBeenCalled();
  });
});
