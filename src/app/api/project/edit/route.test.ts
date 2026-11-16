import { AxiosError } from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PATCH } from './route';
const { patch } = vi.hoisted(() => ({ patch: vi.fn() }));
vi.mock('@/lib/api', () => ({ patchData: (...args: unknown[]) => patch(...args) }));
beforeEach(() => vi.clearAllMocks());
describe('프로젝트 수정 중계', () => {
  it('백엔드가 콘텐츠 수정을 차단하면 HTTP 409와 안내를 유지한다', async () => {
    const error = Object.assign(new AxiosError('blocked'), {
      response: { status: 409, data: { message: '자동 동기화 프로젝트는 어드민에서 수정할 수 없습니다.' } },
    });
    patch.mockResolvedValue({ status: false, error });
    const response = await PATCH(
      new Request('http://localhost/api/project/edit', {
        method: 'PATCH',
        body: JSON.stringify({ slug: 'personal', title: '수정' }),
      }),
    );
    expect(response.status).toBe(409);
    expect(await response.json()).toEqual({
      status: 409,
      message: '자동 동기화 프로젝트는 어드민에서 수정할 수 없습니다.',
    });
  });
});

describe('수정 중계 정상·실패 경계', () => {
  it('회사 프로젝트 정상 수정 결과를 그대로 반환한다', async () => {
    patch.mockResolvedValue({ status: 200, message: 'success' });
    const response = await PATCH(
      new Request('http://localhost/api/project/edit', {
        method: 'PATCH',
        body: JSON.stringify({ slug: 'company', title: '수정' }),
      }),
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: 200, message: 'success' });
    expect(patch).toHaveBeenCalledWith('/project/company', { slug: 'company', title: '수정' });
  });
  it('내부 예외의 원문을 노출하지 않는다', async () => {
    patch.mockRejectedValue(new Error('private fixture detail'));
    const response = await PATCH(new Request('http://localhost/api/project/edit', { method: 'PATCH', body: '{}' }));
    expect(response.status).toBe(500);
    expect(await response.text()).not.toContain('private fixture detail');
  });
});
