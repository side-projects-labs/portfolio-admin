import { describe, expect, it, vi } from 'vitest';
import Home from './page';
const { redirect } = vi.hoisted(() => ({ redirect: vi.fn() }));
vi.mock('next/navigation', () => ({ redirect }));
describe('관리 첫 화면', () => {
  it('샘플 대시보드 대신 프로젝트 목록으로 연결한다', () => {
    Home();
    expect(redirect).toHaveBeenCalledWith('/project');
  });
});
