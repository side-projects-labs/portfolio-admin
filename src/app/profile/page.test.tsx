import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import Profile from './page';
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('swr', () => ({ default: () => ({ data: { data: [] }, isLoading: false, mutate: vi.fn() }) }));
vi.mock('@/lib/file/resizeFile', () => ({ resizeFile: vi.fn() }));
vi.mock('@/lib/api', () => ({ patchData: vi.fn(), deleteData: vi.fn() }));
afterEach(cleanup);
describe('프로필 목록', () => {
  it('프로필이 없으면 빈 결과를 명시하고 등록을 안내한다', () => {
    render(<Profile />);
    expect(screen.getByText('등록된 프로필이 없습니다.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '프로필 생성' })).toBeEnabled();
  });
});
