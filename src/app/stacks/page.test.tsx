import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Stacks from './page';
const state = vi.hoisted(() => ({ urls: [] as string[] }));
beforeEach(() => {
  state.urls = [];
});
vi.mock('@/lib/zustand/table', () => ({
  useTableStore: () => ({ table: { body: [], pagination: { page: 3, size: 10 } }, setBody: vi.fn() }),
}));
vi.mock('swr', () => ({
  default: (url: string) => {
    state.urls.push(url);
    return { data: { status: false }, isLoading: false, mutate: vi.fn() };
  },
}));
vi.mock('@/lib/api', () => ({ postData: vi.fn(), putData: vi.fn(), deleteData: vi.fn(), getData: vi.fn() }));
vi.mock('@yeoncheols/portfolio-core-ui', () => ({ StackTag: () => null, StackIcon: () => null }));
afterEach(cleanup);
describe('기술 스택 오류 상태', () => {
  it('HTTP 성공이어도 API 실패 응답은 빈 목록 대신 오류 안내를 보여 준다', () => {
    render(<Stacks />);
    expect(screen.getByRole('alert')).toHaveTextContent('기술 스택을 불러오지 못했습니다.');
    expect(screen.getByRole('button', { name: '다시 시도' })).toBeEnabled();
  });
});

it('다른 목록의 페이지 번호가 남아 있어도 기술 스택은 첫 페이지에서 시작한다', () => {
  render(<Stacks />);
  expect(state.urls[0]).toBe('/api/stacks?page=1&size=10');
});
