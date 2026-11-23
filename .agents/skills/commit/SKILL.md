---
name: commit
description: 변경사항을 검토·검증한 뒤 이 저장소의 컨벤션(Conventional Commits)으로 커밋한다. 사용자가 커밋, 커밋 메시지 작성, 커밋 후 푸시를 요청할 때 사용한다.
disable-model-invocation: true
---

# Commit

커밋과 푸시는 사용자가 요청했을 때만 한다. 이 절차는 요청받은 커밋을 만드는 방법이다.

## 절차

```
- [ ] 1. 상태 파악: git status, git diff, git diff --staged, git log --oneline -10
- [ ] 2. 커밋 대상 선별 (관련 없는 변경/민감 파일 제외)
- [ ] 3. 검증: pnpm lint, pnpm type-check, 변경 범위 관련 pnpm test <경로>
- [ ] 4. 논리 단위로 스테이징 (git add <파일>; git add -A 지양)
- [ ] 5. 코드 리뷰: review 스킬 staged 모드 (git diff --staged) → 🔴 있으면 커밋 중단 후 보고
- [ ] 6. 커밋 메시지 작성 및 커밋
- [ ] 7. git status로 결과 확인, 요청 시에만 푸시
```

5단계는 `src/`, `.github/workflows/` 변경이 스테이징된 경우 필수다. 문서(`*.md`)만 커밋할 때는 생략할 수 있고, 생략했다고 보고한다.

- 리뷰는 이슈 목적, 데이터 흐름, 공통 소유권과 불변조건을 포함하는 `review` 스킬의 기준을 따릅니다. 차단 검증 보류는 커밋하지 않고 보고합니다.
- 리뷰에서 확인된 문제를 사용자 요청으로 수정했다면 최신 스테이징 상태의 목적·변경·주변 영향·검증을 다시 확인한 뒤 커밋합니다. 커밋 후에도 실제 HEAD와 리뷰 대상의 일치를 확인하고, 훅 변경 등 차이가 있으면 영향 범위를 재검토합니다. 자동 수정·커밋 반복 루프는 실행하지 않습니다.

## 커밋 대상 제외

- `.env*`, `cert/`와 인증서·키 파일, `.next/`, `.pnpm-store/`, `.DS_Store`, 비밀값이 포함된 파일
- `docs/api.ts`는 생성물이다. API 계약 변경으로 `pnpm fetch-schema`를 실행했을 때만 포함한다
- 사용자가 작업 중인 무관한 변경 (건드리지 말고 그대로 둔다)
- 위 파일이 스테이징돼 있으면 커밋 전 사용자에게 알린다

## 메시지 형식

commitlint 설정은 없지만 저장소 이력은 Conventional Commits를 따른다.

```
<type>(<scope>): <제목>

<선택: 본문. 왜 바꿨는지. 72자 줄바꿈>
```

- type: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`
- scope는 선택. 화면이나 영역을 쓴다 (`project`, `login`, `nav`)
- 제목은 한글로 쓰고 마침표를 붙이지 않는다. 영문은 소문자로 시작한다
- 서로 다른 목적의 변경은 커밋을 분리한다

예시:

```
feat(project): 자동 동기화 프로젝트의 읽기 전용 UI 추가
fix: 로그인 인증 흐름의 기본 주소 오염과 장애 처리를 고친다
docs: PR 템플릿에 관리자 앱 확인 항목을 추가
```

## 커밋 실행

여러 줄 메시지는 HEREDOC 사용:

```bash
git commit -m "$(cat <<'EOF'
fix(login): 로그아웃 요청이 실패하면 이동하지 않는다

쿠키가 지워지지 않았는데 로그인 화면으로 보내면 로그아웃된 것으로 오해한다
EOF
)"
```

## 금지 사항

- `--no-verify`, `--amend`(사용자 요청 없을 때), `git push --force`
- `master`에 직접 커밋/푸시 — 현재 브랜치가 `master`면 멈추고 사용자에게 확인
- 검증 실패 상태로 커밋 — 실패 내용을 보고하고 사용자 판단을 받는다
- 훅 실패를 우회하지 않는다. `.husky/pre-push`는 푸시 때 `pnpm lint`와 `pnpm type-check`를 실행한다. 실패하면 원인을 고치거나 보고한다

## 푸시 (요청 시)

`git push` (업스트림 없으면 `git push -u origin <branch>`). 결과의 커밋 해시와 브랜치를 보고한다.
