import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const client = vi.hoisted(() => ({
  defaults: { baseURL: 'https://server.example.test' as string | undefined },
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
}));

vi.mock('./axiosInstance', () => ({ default: client }));

import { deleteData, getData, patchData, postData, putData } from './api';

describe('요청 baseURL', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    client.defaults.baseURL = 'https://server.example.test';
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'https://public.example.test');
    for (const method of [client.get, client.post, client.patch, client.put, client.delete]) {
      method.mockResolvedValue({ data: {} });
    }
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('client 요청은 공개 API 주소를 이번 요청에만 적용한다', async () => {
    await postData('/user/logout', {}, true);

    expect(client.post.mock.calls[0][2]).toMatchObject({ baseURL: 'https://public.example.test' });
  });

  it('client 요청이 공유 인스턴스의 기본 주소를 바꾸지 않는다', async () => {
    await postData('/user/logout', {}, true);

    expect(client.defaults.baseURL).toBe('https://server.example.test');
  });

  it('client 요청 뒤의 서버 요청은 기본 주소를 그대로 쓴다', async () => {
    await postData('/user/logout', {}, true);
    await getData('/project/search');

    expect(client.get.mock.calls[0][1].baseURL).toBeUndefined();
  });

  it.each([
    ['getData', () => getData('/x', undefined, true), () => client.get.mock.calls[0][1]],
    ['postData', () => postData('/x', {}, true), () => client.post.mock.calls[0][2]],
    ['patchData', () => patchData('/x', {}, true), () => client.patch.mock.calls[0][2]],
    ['putData', () => putData('/x', {}, true), () => client.put.mock.calls[0][2]],
    ['deleteData', () => deleteData('/x', {}, true), () => client.delete.mock.calls[0][1]],
  ])('%s도 요청별 주소를 쓰고 기본 주소를 유지한다', async (_name, call, configOf) => {
    await call();

    expect(configOf()).toMatchObject({ baseURL: 'https://public.example.test' });
    expect(client.defaults.baseURL).toBe('https://server.example.test');
  });
});
