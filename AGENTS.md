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

## 에이전트 스킬

모든 에이전트(Cursor, Claude Code, Codex 등)가 공통으로 사용하는 스킬은 `.agents/skills/<skill-name>/SKILL.md`에 있습니다. `.cursor/skills/`와 `.claude/skills/`의 항목은 같은 디렉터리를 가리키는 심볼릭 링크입니다.

### 필수 규칙

아래 작업을 할 때는 해당 `SKILL.md`를 먼저 읽고 그 절차를 따릅니다. 사용자가 스킬 이름을 언급하지 않아도 적용하며, 임의의 방식으로 대체하지 않습니다. 스킬은 작업 절차를 정할 뿐이며 커밋·푸시·PR 생성·머지·이슈 생성과 종료는 위 "코드 스타일과 안전"의 규칙대로 사용자가 요청했을 때만 수행합니다.

1. **코드 수정 → `tdd` 스킬**
   - `src/`와 `src/middleware.ts`의 코드(기능 추가, 버그 수정, 리팩터링)를 수정할 때는 `tdd` 스킬로 진행합니다.
   - 실패하는 테스트를 먼저 작성하고 실패를 확인한 뒤에 구현 코드를 수정합니다. 코드를 수정하면 관련 파일의 테스트도 추가하거나 수정합니다.
   - 문서(`*.md`)와 설정만 바꾸는 경우는 예외이며, 그 판단 근거를 사용자에게 알립니다.
   - 요구사항·불변조건을 구현 소유자와 테스트에 연결하고 실제 Red·Green 명령과 결과를 기록합니다. 원인 대신 fallback·타입 우회·테스트 전용 분기로 통과시키지 않습니다.
2. **커밋 → `commit` 스킬**
   - 커밋은 사용자가 요청했을 때 `commit` 스킬의 절차로만 수행합니다.
   - 코드 변경 커밋은 직전에 `review` 스킬(staged)을 실행하고, 🔴 항목이 있으면 커밋하지 않고 보고합니다.
3. **PR 생성 → `pr` 스킬**
   - PR은 사용자가 요청했을 때 `pr` 스킬의 절차와 `.github/pull_request_template.md` 형식으로만 생성합니다.
   - **PR 템플릿 사용은 필수입니다.** 본문은 템플릿의 모든 절(설명, 관련 이슈, 변경사항, 체크리스트, 검증 결과, 스크린샷, 추가 참고사항)을 순서대로 채웁니다. 절을 빼거나 순서를 바꾸거나 템플릿 없이 자유 형식으로 쓰지 않습니다. 해당하지 않는 절도 "없음"과 이유로 채웁니다.
   - `gh pr create --body`와 `--body-file`은 템플릿을 자동으로 채워 주지 않습니다. 생성 전에 템플릿 파일을 읽어 절과 체크리스트를 그대로 옮기고 안내 주석(`[//]: # ...`)만 지웁니다. 이미 만든 PR이 템플릿을 따르지 않으면 `gh pr edit`으로 본문을 고칩니다.
   - 체크리스트는 실제로 확인한 항목만 `[x]`로 표시하고, 확인하지 못한 항목은 비워 두고 이유를 적습니다.
   - PR 담당자(assignee)는 현재 `gh`에 로그인된 활성 GitHub 계정으로 지정합니다.
   - PR 생성 후 `review` 스킬(branch) 결과를 PR 댓글로 남깁니다. CI가 실패했거나 최신 리뷰에 🔴가 있으면 머지하지 않습니다.
   - `AGENTS.md`와 `.agents/skills/` 같은 지침 변경 PR은 담당자가 직접 머지합니다.
4. **코드 리뷰 기준 → `review` 스킬**
   - 리뷰 댓글 본문은 `.agents/skills/review/TEMPLATE.md`만 채웁니다. 이슈 목적, 데이터 흐름, 공통 모델 소유권, 불변조건과 미확인 사항을 검토하고 발견마다 코드·계약 근거와 기존 또는 필요한 회귀 테스트를 적습니다.
   - 이 저장소에는 CI 리뷰 워크플로가 없으므로 리뷰는 로컬 에이전트가 실행합니다. 수정 후에는 최신 변경 상태에서 다시 리뷰합니다.
5. **이슈 생성 → `issue` 스킬**
   - 이슈는 사용자가 요청했을 때 `issue` 스킬과 `.github/ISSUE_TEMPLATE.md`로만 만듭니다. 상태는 GitHub Project의 Status이고 값은 `ToDo`, `In Progress`, `Review`, `Done`만 씁니다. 새 이슈는 `ToDo`입니다. 라벨로 상태를 만들지 않습니다.
   - 예상, 변경범위, 코드, 1급 시민, 불변조건, TDD 기준 테스트 조건은 목록입니다. 테스트 조건을 빼거나 뒤로 미루지 않습니다.
   - 제목과 본문 문장은 `~습니다` 또는 `~ㅂ니다`로 끝냅니다. `~다`로 끝내지 않습니다.

### 스킬 목록

| 스킬     | 경로                             | 사용 시점                                                              |
| -------- | -------------------------------- | ---------------------------------------------------------------------- |
| `tdd`    | `.agents/skills/tdd/SKILL.md`    | **코드를 수정할 때 항상**                                              |
| `commit` | `.agents/skills/commit/SKILL.md` | **커밋을 요청받았을 때**                                               |
| `pr`     | `.agents/skills/pr/SKILL.md`     | **PR 생성을 요청받았을 때**                                            |
| `qa`     | `.agents/skills/qa/SKILL.md`     | 작업 완료 전 검증, 커밋/PR 직전, "QA 해줘" 요청 시                     |
| `review` | `.agents/skills/review/SKILL.md` | **커밋 직전(staged), PR 생성 직후(branch)**, "리뷰 해줘" 요청 시        |
| `issue`  | `.agents/skills/issue/SKILL.md`  | **이슈 생성을 요청받았을 때**. 본문은 `.github/ISSUE_TEMPLATE.md`      |

일반적인 작업 흐름: `tdd` → `qa` → `commit`(→ `review` staged) → `pr`(→ `review` branch 댓글) → CI(`Lint, type-check, and test`)가 성공하고 🔴가 없을 때만 사용자 요청으로 머지합니다.

새 스킬 추가 방법:

```bash
mkdir -p .agents/skills/<kebab-case-name>   # SKILL.md 작성
ln -s ../../.agents/skills/<kebab-case-name> .cursor/skills/<kebab-case-name>
ln -s ../../.agents/skills/<kebab-case-name> .claude/skills/<kebab-case-name>
```

그다음 위 표에 등록합니다. 스킬 수정은 항상 `.agents/skills/` 원본에서 합니다.

## 에이전트별 진입점

에이전트마다 자동으로 읽는 파일이 달라서, 각 도구가 이 파일(`AGENTS.md`)로 오도록 진입점 파일을 둡니다. 진입점 파일에는 내용을 늘리지 않고, 지침은 항상 이 파일에서 수정합니다.

| 에이전트       | 자동으로 읽는 파일                                  | 스킬 위치         |
| -------------- | --------------------------------------------------- | ----------------- |
| Cursor         | `AGENTS.md`, `.cursor/rules/agents.mdc` (항상 적용) | `.cursor/skills/` |
| Codex          | `AGENTS.md`                                         | `.agents/skills/` |
| Claude Code    | `CLAUDE.md` (`@AGENTS.md` 포함)                     | `.claude/skills/` |
| Gemini CLI     | `GEMINI.md` (`@AGENTS.md` 포함)                     | `.agents/skills/` |
| GitHub Copilot | `.github/copilot-instructions.md`                   | `.agents/skills/` |

- 필수 규칙(스킬 목록, 필수 사용 시점)을 바꾸면 요약이 들어 있는 `.cursor/rules/agents.mdc`와 `.github/copilot-instructions.md`도 함께 갱신합니다.
- 새 에이전트를 지원하려면 그 도구가 읽는 파일을 만들어 이 파일을 가리키게 하고 위 표에 추가합니다.

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
