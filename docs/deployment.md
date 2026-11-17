# CI/CD 배포

GitHub Actions가 검사와 Vercel 빌드·배포를 담당합니다. Vercel 빌드에 필요한 앱 환경변수는 비공개 `portfolio-config` 저장소에서 읽습니다.

## GitHub 저장소 설정

`side-projects-labs/portfolio-admin` 저장소에 다음 Actions Secrets를 등록합니다.

| Secret | 용도 |
| --- | --- |
| `PORTFOLIO_CONFIG_READ_TOKEN` | `YeonCheols/portfolio-config`와 CLI 릴리스 읽기 |
| `VERCEL_TOKEN` | Vercel 프로젝트 빌드·배포 |

Actions Variables에는 다음 값을 등록합니다.

| Variable | 용도 |
| --- | --- |
| `VERCEL_ORG_ID` | Vercel 팀 식별자 |
| `VERCEL_PROJECT_ID` | `portfolio-admin` Vercel 프로젝트 식별자 |

`PORTFOLIO_CONFIG_READ_TOKEN`은 비공개 설정 저장소와 릴리스 자산을 읽을 수 있어야 합니다. private GitHub Packages 설치 토큰은 `portfolio-config`에서 함께 읽습니다. 토큰 값은 워크플로 로그에 출력하지 않습니다.

## 실행 흐름

- 기능 브랜치 push와 `master` 대상 Pull Request는 린트·타입 검사·테스트를 실행하고, 성공하면 `development` 설정으로 Vercel Preview를 배포합니다.
- `master` 푸시는 같은 검사를 통과한 뒤 `production` 설정으로 Vercel Production을 배포합니다.
- CLI는 `cli-v0.4.0` 릴리스에서 내려받고 SHA256 체크섬을 확인합니다.
- `vercel.json`의 `ignoreCommand`가 Git 연동 배포를 건너뛰어 GitHub Actions와 중복 배포되지 않게 합니다.

Vercel의 기본 Git 배포를 건너뛰므로 Actions Secrets를 등록하고 최초 워크플로 실행이 성공하는지 확인한 뒤 이 흐름을 운영에 적용해야 합니다.
