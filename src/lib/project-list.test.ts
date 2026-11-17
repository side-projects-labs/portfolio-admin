import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetcher } from './fetcher';
import { loadProjectList } from './project-list';
vi.mock('./fetcher', () => ({ fetcher: vi.fn() }));
const fetch = vi.mocked(fetcher);
const response = (slugs: string[], allTotal = 3) => ({
  status: true,
  data: { data: slugs.map(slug => ({ slug })), allTotal, page: 1, size: 2, total: slugs.length },
});
beforeEach(() => vi.resetAllMocks());
describe('전체 프로젝트 집계 입력', () => {
  it('서버가 요청 크기를 제한해도 모든 페이지를 받은 뒤 목록을 반환한다', async () => {
    fetch.mockResolvedValueOnce(response(['a', 'b'])).mockResolvedValueOnce(response(['c']));
    const result = await loadProjectList();
    expect(result.data.data.map((item: { slug: string }) => item.slug)).toEqual(['a', 'b', 'c']);
    expect(fetch).toHaveBeenNthCalledWith(2, '/api/project?page=2&size=2');
  });
  it('후속 페이지 실패 시 일부 데이터를 전체 집계처럼 반환하지 않는다', async () => {
    fetch.mockResolvedValueOnce(response(['a', 'b'])).mockResolvedValueOnce({ status: false });
    await expect(loadProjectList()).rejects.toThrow();
  });
  it('같은 페이지가 반복되면 중단하고 불완전한 집계를 노출하지 않는다', async () => {
    fetch.mockResolvedValue(response(['a', 'b']));
    await expect(loadProjectList()).rejects.toThrow();
    expect(fetch).toHaveBeenCalledTimes(2);
  });
  it('실제 빈 목록은 오류 없이 반환한다', async () => {
    fetch.mockResolvedValueOnce(response([], 0));
    expect((await loadProjectList()).data.data).toEqual([]);
  });
});
