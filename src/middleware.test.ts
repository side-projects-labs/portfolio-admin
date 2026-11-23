// @vitest-environment node
import { unstable_doesMiddlewareMatch } from 'next/experimental/testing/server';
import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { config, middleware } from './middleware';

const getAccessToken = vi.fn();
const getData = vi.fn();

vi.mock('./lib/auth', () => ({ getAccessToken: () => getAccessToken() }));
vi.mock('./lib/api', () => ({ getData: (...args: unknown[]) => getData(...args) }));

const request = (path: string) => new NextRequest(new URL(path, 'https://admin.example.test'));

describe('middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('토큰이 없으면 로그인 화면으로 보내고 callbackUrl을 인코딩한다', async () => {
    getAccessToken.mockResolvedValue(undefined);

    const response = await middleware(request('/stacks/a&b=1?x=2&y=3'));

    const location = new URL(response.headers.get('location') ?? '');
    expect(location.pathname).toBe('/login');
    expect([...location.searchParams.keys()]).toEqual(['callbackUrl']);
    expect(location.searchParams.get('callbackUrl')).toBe('/stacks/a&b=1?x=2&y=3');
  });

  it.each([401, 403])('토큰이 거절되면(%i) 로그인 화면으로 보낸다', async httpStatus => {
    getAccessToken.mockResolvedValue('token');
    getData.mockResolvedValue({ status: false, error: { response: { status: httpStatus } } });

    const response = await middleware(request('/stacks'));

    expect(new URL(response.headers.get('location') ?? '').pathname).toBe('/login');
  });

  it.each([
    ['서버 오류(500)', { response: { status: 500 } }],
    ['서비스 불가(503)', { response: { status: 503 } }],
    ['응답 없음(네트워크 오류)', { code: 'ECONNREFUSED' }],
  ])('인증 서버 장애(%s)는 로그인 화면으로 보내지 않고 503으로 알린다', async (_name, error) => {
    getAccessToken.mockResolvedValue('token');
    getData.mockResolvedValue({ status: false, error });

    const response = await middleware(request('/stacks'));

    expect(response.status).toBe(503);
    expect(response.headers.get('location')).toBeNull();
  });

  it('토큰이 없으면 인증 서버를 호출하지 않는다', async () => {
    getAccessToken.mockResolvedValue(undefined);

    await middleware(request('/login'));

    expect(getData).not.toHaveBeenCalled();
  });

  describe('로그인 화면', () => {
    it('토큰이 없으면 로그인 화면을 보여준다', async () => {
      getAccessToken.mockResolvedValue(undefined);

      const response = await middleware(request('/login'));

      expect(response.headers.get('location')).toBeNull();
      expect(response.status).toBe(200);
    });

    it('이미 로그인된 사용자는 첫 화면으로 보낸다', async () => {
      getAccessToken.mockResolvedValue('token');
      getData.mockResolvedValue({ status: true });

      const response = await middleware(request('/login?error=AUTH_FAILED'));

      const location = new URL(response.headers.get('location') ?? '');
      expect(location.pathname).toBe('/');
      expect(location.search).toBe('');
    });

    it('만료되었거나 거절된 토큰이면 로그인 화면을 그대로 보여준다(리디렉션 반복 없음)', async () => {
      getAccessToken.mockResolvedValue('stale');
      getData.mockResolvedValue({ status: false, error: { response: { status: 401 } } });

      const response = await middleware(request('/login'));

      expect(response.headers.get('location')).toBeNull();
      expect(response.status).toBe(200);
    });

    it('인증 서버 장애에도 로그인 화면은 열린다', async () => {
      getAccessToken.mockResolvedValue('token');
      getData.mockResolvedValue({ status: false, error: { response: { status: 503 } } });

      const response = await middleware(request('/login'));

      expect(response.headers.get('location')).toBeNull();
      expect(response.status).toBe(200);
    });
  });

  describe('matcher', () => {
    const matches = (path: string) => unstable_doesMiddlewareMatch({ config, url: `https://admin.example.test${path}` });

    it('화면 경로와 로그인 화면은 미들웨어를 거친다', () => {
      expect(matches('/')).toBe(true);
      expect(matches('/stacks')).toBe(true);
      expect(matches('/login')).toBe(true);
    });

    it('API 경로와 정적 자원은 거치지 않는다', () => {
      expect(matches('/api/project')).toBe(false);
      expect(matches('/_next/static/chunk.js')).toBe(false);
      expect(matches('/favicon.ico')).toBe(false);
    });
  });

  it('토큰이 유효하면 그대로 진행한다', async () => {
    getAccessToken.mockResolvedValue('token');
    getData.mockResolvedValue({ status: true });

    const response = await middleware(request('/stacks'));

    expect(response.headers.get('location')).toBeNull();
  });
});
