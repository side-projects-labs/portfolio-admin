# 연철s 포트폴리오 어드민

개인 포트폴리오 웹사이트를 관리하기 위한 관리자 대시보드입니다. Next.js와 VisActor를 활용하여 현대적이고 직관적인 인터페이스를 제공합니다.

## 기능

- 📊 **포트폴리오 관리** - 프로젝트, 기술 스택, 경력 등 포트폴리오 콘텐츠 관리
- 📝 **콘텐츠 에디터** - 마크다운 기반의 풍부한 텍스트 에디터
- 🌗 **다크 모드** - 시스템 환경설정을 지원하는 다크/라이트 모드
- 📱 **반응형 디자인** - 모든 디바이스에서 사용 가능
- 🔒 **인증 시스템** - 관리자 로그인
- 📈 **데이터 시각화** - 포트폴리오 방문자 통계 및 분석

## 기술 스택

- [Next.js 15.0.1](https://nextjs.org/) - React 프레임워크
- [React 19.0.0-rc](https://react.dev/) - UI 라이브러리
- [TypeScript 5.5.4](https://www.typescriptlang.org/) - 타입 안정성
- [Tailwind CSS 3.4.1](https://tailwindcss.com/) - 스타일링
- [Supabase 2.49.4](https://supabase.com/) - 백엔드 및 데이터베이스
- [React Hook Form 7.56.4](https://react-hook-form.com/) - 폼 관리
- [SWR 2.3.3](https://swr.vercel.app/) - 데이터 페칭
- [React Markdown 10.1.0](https://github.com/remarkjs/react-markdown) - 마크다운 렌더링
- [Next Themes 0.3.0](https://github.com/pacocoursey/next-themes) - 테마 관리
- [React Hot Toast 2.5.2](https://react-hot-toast.com/) - 토스트 알림
- [Radix UI 2.1.1](https://www.radix-ui.com/) - 접근성 컴포넌트
- [Lucide React 0.436.0](https://lucide.dev/) - 아이콘

## 시작하기

1. 저장소를 클론합니다

```bash
git clone https://github.com/your-username/portfolio-admin.git
cd portfolio-admin
```

2. 의존성을 설치합니다

```bash
pnpm install
```

3. 환경 변수를 설정합니다

```bash
cp .env.example .env.local
```

4. 개발 서버를 실행합니다

```bash
pnpm dev
```

5. 브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인합니다.

## 프로젝트 구조

```bash
src/
├── app/                    # Next.js 앱 라우터
│   ├── (dashboard)/        # 대시보드 페이지
│   ├── project/            # 프로젝트 관련 페이지
│   │   ├── create/         # 프로젝트 생성
│   │   ├── edit/           # 프로젝트 수정
│   │   ├── preview/        # 프로젝트 미리보기
│   │   └── write/          # 프로젝트 작성
│   ├── ticket/             # 티켓 관련 페이지
│   └── api/                # API 라우트
├── components/             # React 컴포넌트
│   ├── nav/                # 네비게이션 컴포넌트
│   ├── providers/          # Provider 컴포넌트
│   └── ui/                 # UI 컴포넌트
├── config/                 # 설정 파일
├── data/                   # 정적 데이터 및 샘플 데이터
├── hooks/                  # 커스텀 React 훅
├── lib/                    # 유틸리티 함수 및 상태 관리
│   ├── context/            # 컨텍스트 관련
│   ├── file/               # 파일 관련 유틸
│   └── zustand/            # Zustand 상태 관리
├── docs/                   # api type
├── style/                  # 전역 및 커스텀 스타일
└── types/                  # 내부에서 사용하는 type
```

## 주요 기능 상세

### 포트폴리오 관리

- 프로젝트 CRUD 작업
- 마크다운 콘텐츠 미리보기
- 프로젝트 상태 관리
- 프로젝트 이미지 업로드
- 기술 stack 관리
- 프로젝트 순서 정렬 기능

### 콘텐츠 에디터

- 마크다운 지원
- 이미지 업로드
- 코드 하이라이팅
- 실시간 미리보기

### 데이터 시각화

- 방문자 통계
- 페이지별 조회수
- 사용자 행동 분석
- 트래픽 소스 분석

## 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다 - 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.
