---
name: pr
description: 현재 브랜치의 변경사항으로 저장소 PR 템플릿(.github/pull_request_template.md)에 맞춘 GitHub Pull Request를 gh CLI로 생성한다. 사용자가 PR 생성, PR 올리기, PR 설명 작성을 요청할 때 사용한다.
disable-model-invocation: true
---

# Pull Request

PR 생성과 푸시는 사용자가 요청했을 때만 한다. 머지는 사용자가 명시적으로 요청하지 않으면 하지 않는다.

## 절차

```
- [ ] 1. 브랜치 확인: git branch --show-current (master면 중단하고 사용자 확인)
- [ ] 2. 베이스 결정: 기본 master (사용자가 지정하면 그 브랜치)
- [ ] 3. 커밋되지 않은 변경 확인 → 있으면 commit 스킬 진행 여부를 사용자에게 확인
- [ ] 4. 변경 분석: git fetch origin && git log --oneline origin/<base>..HEAD, git diff origin/<base>...HEAD --stat
- [ ] 5. 검증: pnpm lint, pnpm type-check, pnpm test (설정·의존성 변경이면 pnpm build도)
- [ ] 6. 원격 푸시: git push -u origin HEAD
- [ ] 7. 담당자 계정 확인: gh api user --jq .login
- [ ] 8. 템플릿 파일을 읽어 모든 절을 채운 본문을 작성한 뒤 gh pr create --assignee <login> (템플릿 필수)
- [ ] 9. 담당자 지정 검증: gh pr view --json assignees
- [ ] 10. 코드 리뷰: review 스킬 branch 모드 → 결과를 PR 댓글로 작성
- [ ] 11. PR URL과 리뷰 요약 보고
```

이미 열린 PR이 있는지 `gh pr list --head <branch>`로 확인한다. 있으면 새로 만들지 않고 `gh pr edit`로 갱신할지 사용자에게 묻는다.

UI를 바꿨으면 5단계 뒤에, 사용자가 이미 개발 서버를 띄운 경우에만 해당 화면을 확인한다. 서버는 자동으로 실행하지 않는다.

푸시할 때 `.husky/pre-push`가 `pnpm lint`와 `pnpm type-check`를 실행한다. 실패하면 `--no-verify`로 우회하지 않고 원인을 고치거나 보고한다.

## 제목

마지막 커밋이 아니라 **브랜치 전체 변경**을 요약한다. 커밋 컨벤션과 동일하게 `<type>(<scope>): <제목>`.

## 본문 (`.github/pull_request_template.md` 기반)

**PR 템플릿 사용은 필수다.** 본문은 템플릿의 모든 절을 순서대로 채운다. 절을 빼거나 순서를 바꾸거나 자유 형식으로 쓰지 않는다. 해당하지 않는 절도 "없음"과 이유로 채운다.

`gh pr create --body`와 `--body-file`은 GitHub 웹 화면과 달리 템플릿을 자동으로 채워 주지 않는다. 생성 전에 `.github/pull_request_template.md`를 읽어 절과 체크리스트를 그대로 옮겨 적고, 안내 주석(`[//]: # ...`)만 지운다. 이미 만든 PR이 템플릿을 따르지 않으면 `gh pr edit <번호> --body-file <파일>`로 고친다.

```markdown
## 설명

<이 PR이 해결하는 문제와 접근 방식 1~3문장>

## 관련 이슈

<#번호 / 없으면 "없음">

## 변경사항

- <파일 또는 영역 단위 변경 요약>
- <화면, API 라우트, 인증·미들웨어 동작 변화>
- <환경변수 추가 여부>

## 체크리스트

- [x] 프로젝트의 코딩 스타일 가이드라인을 준수했습니다.
- [x] 코드가 오류 없이 컴파일되고 실행됩니다.
- [ ] 제안된 변경사항에 대해 테스트를 완료했으며 예상대로 동작합니다.
- [ ] 기존의 모든 테스트가 성공적으로 통과됩니다.
- [ ] 변경사항에 대한 새로운 테스트가 추가되었습니다 (해당되는 경우).
- [ ] 문서가 업데이트되었습니다 (해당되는 경우).

관리자 앱 확인 항목:

- [ ] `pnpm lint`, `pnpm type-check`, `pnpm test`를 실행했고 결과를 아래 "검증 결과"에 적었습니다. 실행하지 않은 검증은 통과로 적지 않았습니다.
- [ ] 로그인·쿠키·복귀 경로 검증(`access_token`, OAuth state, `safeCallbackUrl`)을 우회하거나 느슨하게 바꾸지 않았습니다 (해당되는 경우).
- [ ] `.env*`, 인증서, 토큰, API 비밀키, 개인정보를 포함하지 않았고 서버용 값을 `NEXT_PUBLIC_*`나 클라이언트 코드로 옮기지 않았습니다.
- [ ] UI를 바꿨다면 반응형, 다크 모드, 접근성을 확인했습니다 (해당되는 경우).
- [ ] `docs/api.ts`는 API 계약 변경이 필요할 때만 `pnpm fetch-schema`로 갱신했습니다 (해당되는 경우).
- [ ] 실제 기능이나 기술 스택이 바뀌어 루트 `PROJECT.md`를 함께 갱신했습니다 (해당되는 경우).

## 검증 결과

<실행한 명령과 결과. 실행하지 못한 검증은 이유와 함께>

## 스크린샷 (해당되는 경우)

<UI 변경이 있으면 설명 또는 캡처. 없으면 "없음">

## 추가 참고사항

<배포 시 주의점, 환경변수, 확인하지 못한 화면>
```

체크리스트는 5단계 검증 결과에 따라 **실제로 확인된 항목만** `[x]`로 표시한다. 브라우저에서 직접 확인하지 못한 동작이 있으면 "테스트를 완료했으며 예상대로 동작합니다"는 비워 두고 그 이유를 추가 참고사항에 적는다.

관련 이슈에는 `Fixes`나 `Closes` 대신 `#번호`만 적어 머지로 이슈가 자동으로 닫히지 않게 한다. 닫는 시점은 사용자가 정한다.

## 담당자 (assignee) — 필수

PR 담당자는 **반드시 현재 `gh`에 로그인된 활성 GitHub 계정**으로 지정한다. 담당자 없이 PR을 만들지 않는다.

```bash
gh auth status
ASSIGNEE=$(gh api user --jq .login)
```

- 계정이 여러 개 로그인돼 있으면 활성 계정을 사용하고, 어떤 계정으로 지정했는지 보고한다
- 로그인돼 있지 않거나 `gh api user`가 실패하면 PR을 만들지 말고 `gh auth login`을 사용자에게 요청한다
- 다른 계정을 지정하려고 `gh auth switch`를 임의로 실행하지 않는다

## 생성 명령

```bash
gh pr create --base master --assignee "$ASSIGNEE" --title "fix(login): 로그아웃 실패 시 이동하지 않도록 수정" --body-file <본문 파일>
```

생성 후 담당자를 검증한다. 비어 있으면 `gh pr edit <번호> --add-assignee "$ASSIGNEE"`로 지정하고 다시 확인한다.

```bash
gh pr view <번호> --json assignees --jq '.assignees[].login'
```

- 사용자가 요청하면 `--draft`, `--reviewer`, `--label` 추가
- 머지는 사용자 명시 요청 없이는 하지 않는다

## 코드 리뷰 댓글

PR 생성 후 `review` 스킬을 branch 모드로 실행하고, 결과를 PR 댓글로 남긴다. 본문은 `.agents/skills/review/TEMPLATE.md`만 채운다. 본인 PR은 approve할 수 없으므로 리뷰는 댓글로 남긴다.

```bash
gh pr comment <번호> --body-file <리뷰 파일>
```

댓글 파일 첫 줄은 `<!-- ai-review:local -->` 이고, 그 다음에 템플릿 본문만 붙인다. 이 저장소에는 CI 리뷰 워크플로가 없으므로 리뷰는 로컬에서만 실행한다.

- PR에 커밋을 추가로 푸시한 경우 리뷰를 다시 실행해 새 댓글을 남긴다
- 리뷰는 연결 이슈의 본문·댓글과 PR 목적, 실제 base/head SHA, 데이터 흐름·공통 소유권·불변조건·미확인 사항을 포함합니다. 원격 head와 다른 로컬 상태의 결과를 최신 PR 리뷰로 게시하지 않습니다.
- 기존 지적과 미해결 스레드는 최신 head에서 유효성을 재확인합니다. 수정 후에는 목적·전체 변경 범위·주변 영향·검증을 다시 확인하며 이전 판정을 그대로 재사용하지 않습니다.
- 중요한 미확인 사항의 검증 보류는 차단으로 취급합니다. 테스트 통과만으로 전체 서비스 안전성을 보증하지 않습니다.
- 🔴 항목은 모두 머지 전 확인 대상이다

## 머지 (요청 시) — CI 성공과 차단 리뷰 없음이 모두 필요

머지는 사용자가 명시적으로 요청했을 때만 한다. `Lint, type-check, and test` 체크가 성공해야 한다. 이 저장소에는 브랜치 보호 규칙이 없을 수 있으므로 머지 전에 직접 확인한다. 실패하거나 빠지면 머지하지 않는다.

```bash
gh pr checks <번호> --watch --fail-fast
gh pr view <번호> --json comments --jq '[.comments[] | select(.body | test("ai-review:"))] | last | .body' | grep "🔴"
gh pr merge <번호> --merge
```

- `gh pr checks`가 실패하면 머지 명령을 실행하지 않고, 실패한 체크와 이유를 `~습니다`로 보고한다
- 최신 `ai-review:local` 댓글에 🔴가 있으면 머지 명령을 실행하지 않는다
- `AGENTS.md`와 `.agents/skills/` 같은 지침 변경 PR은 담당자가 직접 머지한다. 에이전트는 머지하지 않는다
- `master` 머지는 `CI and Vercel deployment` 워크플로로 배포까지 이어진다. 머지 후 배포 잡의 결과를 확인해 보고한다

## 보고

PR 링크를 마크다운 링크로 제공하고, 지정된 담당자 계정과 검증 중 실패하거나 건너뛴 항목을 함께 알린다.
