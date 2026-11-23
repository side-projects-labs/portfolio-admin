import { describe, expect, it } from 'vitest';
import { isRejectedTokenError } from './auth-error';

describe('isRejectedTokenError', () => {
  it.each([401, 403])('인증 서버가 토큰을 거절하면(%i) true다', status => {
    expect(isRejectedTokenError({ response: { status } })).toBe(true);
  });

  it.each([400, 404, 500, 502, 503])('그 밖의 응답 상태(%i)는 거절이 아니다', status => {
    expect(isRejectedTokenError({ response: { status } })).toBe(false);
  });

  it.each([
    ['응답 없음(네트워크 오류)', { code: 'ECONNREFUSED' }],
    ['응답에 상태가 없음', { response: {} }],
    ['undefined', undefined],
    ['null', null],
    ['문자열', '401'],
  ])('판단할 수 없는 값(%s)은 거절이 아니다', (_name, error) => {
    expect(isRejectedTokenError(error)).toBe(false);
  });
});
