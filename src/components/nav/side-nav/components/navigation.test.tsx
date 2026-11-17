import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import Navigation from './navigation';
const state = vi.hoisted(() => ({ pathname: '/project/edit' }));
vi.mock('next/navigation', () => ({ usePathname: () => state.pathname }));
afterEach(cleanup);
describe('관리 메뉴', () => {
  it('상세·편집 경로에서도 상위 프로젝트 메뉴를 현재 위치로 표시한다', () => {
    render(<Navigation />);
    expect(screen.getByRole('link', { name: '프로젝트' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: '프로필' })).not.toHaveAttribute('aria-current');
    expect(screen.queryByRole('link', { name: /dashboard/i })).not.toBeInTheDocument();
  });
});
