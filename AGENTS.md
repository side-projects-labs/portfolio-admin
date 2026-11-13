# AGENTS.md

이 문서는 portfolio-admin 저장소 전체에서 작업하는 에이전트의 공통 지침입니다. 아래 Hub 관리 구간과 함께 적용하며 사용자 지시를 우선합니다.

## 프로젝트와 책임

- Next.js 15 App Router·React 19·TypeScript 기반 포트폴리오 관리자 UI입니다. 프로젝트·프로필·기술 스택 관리와 마크다운 편집을 제공합니다.
- 실제 콘텐츠 저장과 관리자 인증은 portfolio-api가 담당합니다. 이 저장소는 화면, Next.js API 중계, 서버 측 파일 처리와 맞춤법 검사 연결을 소유합니다.
- 런타임·패키지 버전과 명령은 package.json·pnpm-lock.yaml을 기준으로 확인합니다. README의 과거 버전·포트·통계 설명을 구현 사실로 단정하지 않습니다.

## 구조와 공통 코드

- src/app은 화면·layout과 api/**/route.ts 요청 중계를, src/components는 UI·탐색·provider·차트를 소유합니다.
- src/lib/api.ts·axiosInstance.ts·fetcher.ts의 기존 요청 흐름을 재사용하고 서버용 API_URL과 공개 NEXT_PUBLIC_API_URL의 소비 경계를 구분합니다.
- src/lib/auth.ts·oauth-login.ts·safe-callback-url.ts와 middleware.ts의 로그인·쿠키·복귀 경로 검증을 유지합니다. 외부 OAuth 로그인과 토큰 발급을 이 앱에서 별도로 구현하지 않습니다.
- src/lib/file은 Supabase Storage 파일 처리와 WebP 변환을 소유합니다. 이미지 URL과 메타데이터 저장을 구분하며 임의의 새 저장소나 업로드 경로를 추가하지 않습니다.
- src/hooks·src/lib/zustand·src/lib/atoms.ts의 기존 상태 소유권을 확인하고 같은 상태를 여러 곳에 복제하지 않습니다. SWR 변경 후 관련 캐시 갱신과 로딩·빈 결과·실패 상태를 함께 확인합니다.
- API 타입은 docs/api.ts, 화면 타입은 src/types에서 확인합니다. docs/api.ts는 생성물이므로 API 계약 변경이 필요할 때만 pnpm fetch-schema로 갱신합니다.

## 실행과 검증

- 패키지 매니저는 pnpm입니다. pnpm dev는 5001 포트를 사용합니다. pnpm dev:https는 mkcert·로컬 인증서가 필요한 server.js 실행이므로 준비 상태를 먼저 확인합니다.
- 정적 검증은 pnpm lint, pnpm type-check이며 단위·컴포넌트 테스트는 pnpm test, 빌드는 pnpm build입니다. 존재하지 않는 명령을 다른 저장소에서 가져오지 않습니다.
- 실행 동작을 수정하면 기존 Vitest·React Testing Library 구성에서 대응 *.test.ts 또는 *.test.tsx에 회귀 조건을 먼저 작성하고 실패 확인 후 구현합니다. 인증·리디렉션 변경은 인접 로그인 테스트도 확인합니다.
- 문서만 변경하면 새 실행 테스트를 억지로 만들지 않고 링크·경로·계약·민감정보 포함 여부를 검증합니다. PROJECT.md는 Hub의 기존 v1 파서로 검증합니다.
- .husky/pre-push는 lint와 type-check를 실행합니다. 검증 실패나 인증 문제를 훅 우회·느슨한 기본값으로 숨기지 않습니다. 실제로 실행하지 않은 검증은 통과로 보고하지 않습니다.
- 개발 서버는 사용자 요청이나 이미 실행된 서버가 있을 때만 사용합니다. 의존성·인증·외부 API가 필요한 검증을 수행하지 못했다면 이유를 구분해 보고합니다.

## 코드 스타일과 안전

- 기존 @/ 경로 별칭과 .prettierrc·.eslintrc.json을 따릅니다. 작은따옴표·세미콜론·2칸 들여쓰기를 사용하고 관련 없는 파일 전체를 재포맷하지 않습니다.
- 기존 UI·@yeoncheols/portfolio-core-ui를 먼저 확인하고 중복 컴포넌트를 만들지 않습니다. 서버·클라이언트 경계, 접근성, 반응형·다크 모드 동작을 보존합니다.
- access_token 쿠키·OAuth state·복귀 URL 검증을 우회하지 않습니다. middleware에서 API 경로를 제외하므로 화면 보호만으로 API 요청 권한까지 검증됐다고 판단하지 않습니다.
- .env*·인증서·토큰·API 비밀키·사용자 개인정보를 출력하거나 커밋하지 않습니다. 서버용 비밀값을 NEXT_PUBLIC_* 또는 클라이언트 코드로 옮기지 않습니다.
- src/data의 예시 데이터·차트를 실제 운영 통계나 수집 성과로 소개하지 않습니다. 외부 API·저장소 권한·배포 설정은 요청 범위 없이 변경하지 않습니다.
- master에 직접 커밋하지 않습니다. 작업 브랜치에서 요청한 변경만 다루고 사용자 요청 없이 커밋·푸시·PR 생성·머지·이슈 종료를 수행하지 않습니다.
- 포트폴리오에 공개되는 소개의 원본은 루트 PROJECT.md입니다. 실제 기능·기술 스택이 바뀌면 함께 갱신하고 아래 Hub 관리 구간은 수동 재작성하지 않습니다.

<!-- portfolio-hub:project-guidance:start -->
## 포트폴리오 문서 입력 계약

- 기본 브랜치 루트 PROJECT.md를 프로젝트 소개의 원본으로 유지합니다. 프로젝트 초안 작업에서 이 저장소의 AI가 아래 규격으로 생성하고 내용 변경 시 함께 갱신합니다. Hub는 내용을 AI로 다시 생성하지 않고 검증한 필드를 그대로 전송합니다.
- PROJECT.md는 첫 번째 JSON 코드 블록에 아래 메타데이터를 작성하고, 블록 뒤 빈 줄 다음에 마크다운 본문을 작성합니다. 본문의 제목·목차·내용 구성은 자유입니다.

```json
{
  "schemaVersion": 1,
  "slug": "project-slug",
  "title": "프로젝트 제목",
  "description": "프로젝트 설명",
  "stacks": ["TypeScript"],
  "image": "https://example.com/public-project.png",
  "linkDemo": null,
  "linkGithub": null
}
```

- schemaVersion, slug, title, description, stacks는 필수입니다. slug는 기존 프로젝트 식별자로 유지하며 변경하면 다른 프로젝트가 생성될 수 있습니다. stacks는 문자열 배열입니다. JSON에 계약 밖 필드를 추가하지 않습니다.
- image는 선택적인 공개 HTTP(S) 이미지 URL입니다. URL이 제공된 경우에만 기존 이미지를 교체합니다. 생략/null/빈 문자열이면 기존 이미지를 유지하며, 신규 프로젝트는 이미지 없이 생성합니다. 로컬 파일 경로·비공개 GitHub 원본 URL·자격 증명이 필요한 URL을 넣지 않습니다.
- 대표 이미지 파일을 저장소에 보관할 때는 루트 PROJECT.png를 사용합니다. 적절한 배포 화면이 있으면 활용하고 없으면 이 저장소에서 생성형 썸네일을 준비합니다. 필요한 경우 갱신하며 일반 코드 변경마다 재생성하지 않습니다.
- 공개 이미지 업로드와 공개 URL 준비는 이 저장소가 담당합니다. Hub는 이미지 파일을 읽거나 업로드하지 않습니다. 도구를 사용할 수 없거나 URL을 제공하지 못하면 image를 생략할 수 있습니다.
- linkDemo와 linkGithub는 선택적인 HTTP(S) 링크이며 생략/null/빈 문자열이면 기존 링크 값을 지웁니다. JSON 뒤 마크다운 전체를 API의 content로 사용하므로 중복 생성하지 않습니다.
- 이 규격 문서가 있으면 Hub가 프로젝트를 생성·업데이트하며 즉시 공개하고 관리자 편집 내용도 교체합니다. 공개 가능한 소개만 작성하고 비밀값·내부 정보는 넣지 않습니다. 이 지침은 다른 비공개 파일을 공개할 권한을 부여하지 않습니다.
- 기존 프로젝트 규칙과 함께 적용하며 충돌은 담당자에게 확인합니다. Hub는 이 구간 밖의 기존 규칙과 원본 PROJECT.md를 변경하지 않습니다. 지침 PR은 담당자가 직접 머지합니다.
<!-- portfolio-hub:project-guidance:end -->
