import { describe, expect, it, vi } from 'vitest';
import { GET as list } from './route';
import { GET as detail } from './slug/route';
const { get } = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock('@/lib/api', () => ({ getData: (...args: unknown[]) => get(...args) }));
describe('프로젝트 조회 중계', () => {
  it('혼합 목록과 상세의 출처 및 차단 값을 그대로 전달한다', async () => {
    const projects = [
      { slug: 'personal', source: 'personal', isBlocked: true },
      { slug: 'company', source: 'company', isBlocked: false },
    ];
    const data = { data: projects, total: 2, allTotal: 2 };
    get.mockResolvedValue({ status: true, data });
    expect(await (await list(new Request('http://localhost/api/project?page=1&size=10'))).json()).toEqual({
      status: true,
      data,
    });
    for (const project of projects) {
      get.mockResolvedValue({ status: true, data: project });
      expect(
        await (await detail(new Request('http://localhost/api/project/slug?slug=' + project.slug))).json(),
      ).toEqual({ status: true, data: project });
    }
  });
});
