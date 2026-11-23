import { NextResponse } from 'next/server';
import { type AdminLoginResponse } from '@/docs/api';
import { getData } from './lib/api';
import { getAccessToken } from './lib/auth';
import { isRejectedTokenError } from './lib/auth-error';
import { safeCallbackUrl } from './lib/safe-callback-url';
import type { NextRequest } from 'next/server';

function redirectToLogin(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const loginUrl = new URL('/login', request.url);
  // 경로에 &나 ? 가 있어도 쿼리가 새지 않도록 인코딩해서 붙인다
  loginUrl.searchParams.set('callbackUrl', safeCallbackUrl(`${pathname}${search}`));
  return NextResponse.redirect(loginUrl);
}

const unavailablePage = `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<title>일시적으로 이용할 수 없습니다</title>
</head>
<body style="font-family:system-ui,sans-serif;max-width:32rem;margin:20vh auto;padding:0 1rem;line-height:1.6">
<h1 style="font-size:1.25rem">인증 서버에 연결할 수 없습니다</h1>
<p>잠시 후 다시 시도해주세요.</p>
<p><a href="">다시 시도</a></p>
</body>
</html>
`;

// 인증 서버 장애는 로그인이 필요한 상태가 아니므로 로그인 화면으로 보내지 않고 다시 시도를 안내한다
function authServiceUnavailable() {
  return new NextResponse(unavailablePage, {
    status: 503,
    headers: { 'content-type': 'text/html; charset=utf-8', 'retry-after': '10', 'cache-control': 'no-store' },
  });
}

export async function middleware(request: NextRequest) {
  const token = await getAccessToken();

  // 인증이 필요한 경로 설정
  const isLogin = request.nextUrl.pathname.startsWith('/login');
  const isWellKnown = request.nextUrl.pathname.match(/((?!\.well-known(?:\/.*)?)(?:[^/]+\/)*[^/]+\.\w+)/);

  if (!token) {
    return !isLogin && !isWellKnown ? redirectToLogin(request) : NextResponse.next();
  }

  // 토큰이 존재하면 인증 재시도
  const authCheck = await getData<AdminLoginResponse>(`/user/auth/check`);
  if (authCheck.status) {
    // 이미 로그인된 사용자는 로그인 화면 대신 첫 화면으로 보낸다
    return isLogin ? NextResponse.redirect(new URL('/', request.url)) : NextResponse.next();
  }

  // 로그인 화면은 토큰이 만료·거절되었거나 인증 서버가 장애여도 열려 있어야 한다(리디렉션 반복 방지)
  if (isLogin) return NextResponse.next();
  return isRejectedTokenError(authCheck.error) ? redirectToLogin(request) : authServiceUnavailable();
}

// 적용할 경로 설정 (/api 제외). 로그인 화면도 거쳐야 로그인된 사용자를 돌려보낼 수 있다
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
