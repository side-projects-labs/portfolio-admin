# Copilot Instructions

이 저장소의 에이전트 지침 원본은 루트의 `AGENTS.md`입니다. 작업 전에 `AGENTS.md`를 읽고 따릅니다.

필수 규칙 요약 (상세 절차는 `.agents/skills/<name>/SKILL.md`):

- 코드 수정 시 `tdd` 스킬: 실패하는 테스트를 먼저 작성하고, 수정한 파일의 관련 테스트를 반드시 추가하거나 수정합니다. 테스트는 Vitest와 React Testing Library입니다.
- TDD는 요구·불변조건·소유자·테스트를 연결하고 실제 Red·Green 결과를 기록합니다. 통과 목적의 우회 분기를 금지하고 인접 경계를 검증합니다. 임시 근거 파일은 현재 작업이 만든 경로만 정리합니다.
- 커밋은 사용자가 요청할 때만 `commit` 스킬로 합니다. `<type>(<scope>): <제목>` 형식, 검증 후 선별 스테이징, 코드 변경은 커밋 직전 `review` 스킬(staged)로 리뷰하고 🔴가 있으면 중단합니다.
- PR은 사용자가 요청할 때만 `pr` 스킬로 만듭니다. **`.github/pull_request_template.md` 사용은 필수**이며 모든 절을 순서대로 채웁니다(`gh pr create`는 템플릿을 자동으로 채우지 않으므로 파일을 읽어 옮겨 적습니다). 담당자는 `gh` 활성 계정, 생성 후 `review` 스킬(branch) 결과를 PR 댓글로 작성합니다.
- 검증은 `qa` 스킬: `pnpm lint`, `pnpm type-check`, `pnpm test`, 필요하면 `pnpm build`. PR CI는 `.github/workflows/ci-deploy.yml`의 `Lint, type-check, and test`입니다.
- 코드 리뷰 기준은 `review` 스킬을 따릅니다. 댓글은 `.agents/skills/review/TEMPLATE.md`만 채웁니다. 목적·데이터 흐름·공통 소유권·불변조건을 검토하고 발견마다 코드·계약 근거와 기존 또는 필요한 회귀 테스트를 적습니다. 중요한 로컬 검증 미확인은 차단 표시가 있는 검증 보류로 보고합니다. 이 저장소에는 CI 리뷰가 없어 로컬에서만 실행합니다.
- 이슈는 사용자가 요청할 때만 `issue` 스킬로 만듭니다. 본문은 `.github/ISSUE_TEMPLATE.md`만 채웁니다. 상태는 GitHub Project의 Status만 쓰고 값은 `ToDo`, `In Progress`, `Review`, `Done`이며 새 이슈는 `ToDo`입니다. 제목과 본문 문장은 `~습니다` 또는 `~ㅂ니다`로 끝냅니다.
- 로그인·쿠키·복귀 경로(`access_token`, OAuth state, `safeCallbackUrl`) 검증을 우회하지 않습니다. `.env*`·토큰·비밀키를 출력하거나 커밋하지 않습니다.
- 머지는 사용자가 요청했을 때만 합니다. `Lint, type-check, and test`가 실패했거나 최신 리뷰에 🔴가 있으면 머지하지 않습니다. 지침 변경 PR은 담당자가 직접 머지합니다.
- `master` 기준 작업 전에는 `git fetch origin`으로 `origin/master` 최신을 받습니다. `master`에 직접 커밋하지 않습니다.
- 개발 서버는 자동으로 실행하지 않습니다. 근거를 남기는 문장은 `~습니다`로 끝냅니다. 패키지 매니저는 pnpm입니다.

이 파일과 `AGENTS.md`가 다르면 `AGENTS.md`를 따릅니다.
