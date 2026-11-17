import { cleanup, render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Edit from './edit/page';
import Write from './write/[slug]/page';

const mocks = vi.hoisted(() => ({
  response: undefined as unknown,
  error: undefined as unknown,
  loading: false,
  patch: vi.fn(),
  push: vi.fn(),
  mutate: vi.fn(),
  upload: vi.fn(),
  context: vi.fn(),
}));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mocks.push }),
  useParams: () => ({ slug: 'project-1' }),
  useSearchParams: () => new URLSearchParams('slug=project-1'),
}));
vi.mock('next/image', () => ({ default: () => null }));
vi.mock('next-themes', () => ({ useTheme: () => ({ theme: 'light' }) }));
vi.mock('swr', () => ({
  default: (url: string) =>
    url?.includes('/api/stacks')
      ? { data: { data: [] } }
      : { data: mocks.response, error: mocks.error, isLoading: mocks.loading, mutate: mocks.mutate },
}));
vi.mock('@/lib/api', () => ({ patchData: (...args: unknown[]) => mocks.patch(...args), getData: vi.fn() }));
vi.mock('@/lib/file/upload', () => ({ uploadFile: (...args: unknown[]) => mocks.upload(...args) }));
vi.mock('@/lib/file/read', () => ({ getFileUrl: vi.fn() }));
vi.mock('@yeoncheols/portfolio-core-ui', () => ({ StackSelector: () => null }));
vi.mock('@/lib/context/props', () => ({ usePropsContext: () => ({ setContextProps: mocks.context }) }));
vi.mock('@/components/nav', () => ({ TopNav: () => null }));
vi.mock('@/components/ui/editor', () => ({
  Editor: ({ markdown, onEditorChange }: { markdown: string; onEditorChange: (value: string) => void }) => (
    <textarea aria-label="본문 편집" value={markdown} onChange={e => onEditorChange(e.target.value)} />
  ),
}));
const project = {
  id: 1,
  slug: 'project-1',
  title: '개인 프로젝트',
  description: '프로젝트 설명',
  content: '프로젝트 본문',
  image: '',
  stacks: '[]',
  source: 'personal',
  isBlocked: true,
  isShow: true,
  linkDemo: '',
  linkGithub: 'https://github.com/example/project',
  updatedAt: '2026-11-16',
  order: 1,
};
afterEach(cleanup);
beforeEach(() => {
  vi.clearAllMocks();
  mocks.response = { status: true, data: project };
  mocks.loading = false;
  mocks.error = undefined;
});
describe('프로젝트 편집 URL 직접 접근', () => {
  it.each([
    ['정보', Edit],
    ['본문', Write],
  ] as const)('%s 수정 URL에서도 읽기 전용 안내와 미리보기만 제공한다', (_, Page) => {
    render(<Page />);
    expect(screen.getByRole('status')).toHaveTextContent('자동 동기화 · 읽기 전용');
    expect(screen.getByRole('link', { name: '프로젝트 미리보기' })).toHaveAttribute(
      'href',
      '/project/preview/project-1',
    );
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /프로젝트 수정|출간하기/ })).not.toBeInTheDocument();
    expect(mocks.patch).not.toHaveBeenCalled();
    expect(mocks.upload).not.toHaveBeenCalled();
  });
});

describe('편집 상태 확인과 회사 프로젝트 저장', () => {
  it.each([
    ['정보', Edit],
    ['본문', Write],
  ] as const)('%s 화면은 로딩·실패·정책 미수신 상태에서 편집을 활성화하지 않는다', (_, Page) => {
    const view = render(<Page />);
    mocks.response = { status: true, data: { ...project, source: 'company', isBlocked: false } };
    mocks.loading = true;
    view.rerender(<Page />);
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    mocks.loading = false;
    mocks.error = new Error('fixture failure');
    view.rerender(<Page />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    mocks.error = undefined;
    const { isBlocked, ...withoutPolicy } = project;
    void isBlocked;
    mocks.response = { status: true, data: withoutPolicy };
    view.rerender(<Page />);
    expect(screen.getByRole('alert')).toHaveTextContent('편집 상태를 확인할 수 없습니다');
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(mocks.patch).not.toHaveBeenCalled();
  });
  it.each([
    ['정보', Edit, '프로젝트 수정'],
    ['본문', Write, '출간하기'],
  ] as const)('%s 화면에서 회사 프로젝트를 저장하고 목록으로 이동한다', async (_, Page, button) => {
    mocks.response = { status: true, data: { ...project, source: 'company', isBlocked: false } };
    mocks.patch.mockResolvedValue({ status: 200 });
    render(<Page />);
    await userEvent.setup().click(screen.getByRole('button', { name: button }));
    await waitFor(() =>
      expect(mocks.patch).toHaveBeenCalledWith('/api/project/edit', expect.objectContaining({ slug: project.slug })),
    );
    await waitFor(() => expect(mocks.push).toHaveBeenCalledWith('/project'));
  });
  it('본문 수정이 서버에서 거부되면 성공으로 이동하지 않고 편집 상태를 재조회한다', async () => {
    mocks.response = { status: true, data: { ...project, source: 'company', isBlocked: false } };
    mocks.patch.mockResolvedValue({ status: false, error: { response: { status: 409 } } });
    render(<Write />);
    fireEvent.change(screen.getByRole('textbox', { name: '본문 편집' }), { target: { value: '회사 본문 수정' } });
    await userEvent.setup().click(screen.getByRole('button', { name: '출간하기' }));
    expect(mocks.mutate).toHaveBeenCalled();
    expect(mocks.push).not.toHaveBeenCalled();
  });
});
