# SMSOLUX - 숙명여자대학교 개발 동아리 솔룩스 공식 웹사이트

이 프로젝트는 숙명여자대학교 프로그래밍 중앙 동아리 **SOLUX**의 공식 웹사이트입니다.
React 기반의 Next.js 프레임워크를 사용하여 구축되었으며, 모던한 웹 기술을 활용하여 동아리의 활동, 프로젝트, 리크루팅 정보를 제공합니다.

## 🛠 기술 스택 (Tech Stack)

### Core
- **Next.js 16 (App Router)**: 최신 React 기능을 활용한 웹 프레임워크
- **TypeScript**: 정적 타입 지정을 통한 안정적인 개발 환경
- **Supabase**: 백엔드 데이터베이스 및 스토리지 (PostgreSQL 기반)

### Styling & UI
- **Tailwind CSS**: 유틸리티 퍼스트 CSS 프레임워크
- **Framer Motion**: 부드러운 애니메이션 구현
- **Three.js (@react-three/fiber)**: 3D 인터랙티브 그래픽 요소 (히어로 섹션 등)
- **Lucide React**: 깔끔한 아이콘 라이브러리

## 📂 프로젝트 구조 (Project Structure)

프로젝트는 **기능과 역할**에 따라 명확하게 분리되어 있습니다. 리팩토링을 통해 Next.js에 익숙하지 않은 개발자도 쉽게 이해할 수 있도록 구조화했습니다.

```
smsolux-next/
├── public/              # 정적 파일 (이미지, 폰트 등)
├── src/
│   ├── app/             # Next.js App Router 페이지 (라우팅)
│   │   ├── layout.tsx   # 전역 레이아웃
│   │   ├── page.tsx     # 메인 페이지
│   │   ├── activity/    # 활동 소개 페이지
│   │   ├── project/     # 프로젝트 아카이브 페이지
│   │   ├── recruit/     # 리크루팅 페이지
│   │   └── about/       # 동아리 소개 페이지
│   │
│   ├── components/      # UI 컴포넌트 모음
│   │   ├── common/      # 공통 사용 컴포넌트 (버튼, 배지 등)
│   │   ├── layout/      # 레이아웃 관련 컴포넌트 (헤더, 푸터)
│   │   ├── home/        # 메인 페이지 전용 컴포넌트 섹션
│   │   └── ...          # 기타 기능별 컴포넌트
│   │
│   ├── constants/       # 상수 데이터 매니지먼트 (텍스트, 메뉴 등)
│   │   └── activities.tsx # 활동 데이터 등 UI에서 분리된 정적 데이터
│   │
│   ├── lib/             # 외부 라이브러리 설정 (Supabase 클라이언트 등)
│   ├── types/           # TypeScript 타입 정의 (Project, Activity 등)
│   └── utils/           # 유틸리티 함수 (데이터 변환 등 로직 분리)
│
└── ...config files      # 설정 파일들 (tailwind, next.config, etc.)
```

## 🚀 시작하기 (Getting Started)

### 1. 프로젝트 클론 및 의존성 설치

```bash
git clone <repository-url>
cd smsolux-next
npm install
```

### 2. 환경 변수 설정 (.env.local)

프로젝트 루트에 `.env.local` 파일을 생성하고 Supabase 관련 키를 입력해야 합니다.


`SUPABASE_SERVICE_ROLE_KEY`는 `/admin`의 서버 액션에서만 사용되며 브라우저에
노출하면 안 됩니다. 개발 환경은 기본적으로 관리자 로그인을 우회하지만, 이 상태에서
DB 저장·삭제를 사용하려면 서비스 역할 키가 필요합니다. 실제 로그인 흐름을 테스트하려면
`ADMIN_BYPASS_AUTH=false`를 추가하세요. 서비스 역할 키가 없을 때는 허용된 계정의
Supabase 세션과 해당 테이블의 RLS 쓰기 정책을 사용합니다.

프로젝트 이미지는 Supabase Storage의 공개 `project-thumbnail` 버킷에 저장됩니다.
`supabase/migrations/20260802000000_create_project_thumbnail_bucket.sql`을 적용해 버킷을
생성한 뒤, 관리자 저장 작업에는 `SUPABASE_SERVICE_ROLE_KEY`를 사용하는 것을 권장합니다.
서비스 역할 키 없이 로그인 세션으로 저장한다면 해당 버킷에도 관리자 계정만 허용하는
Storage RLS 정책을 별도로 설정해야 합니다.

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## ✨ 주요 리팩토링 포인트

이 프로젝트는 유지보수성을 높이기 위해 다음과 같은 원칙으로 리팩토링 되었습니다:

1.  **관심사의 분리 (Separation of Concerns)**:
    -   데이터(Logic)와 화면(UI)을 분리했습니다. 예를 들어, 복잡한 데이터 변환 로직은 `src/utils`로, 정적인 텍스트 데이터는 `src/constants`로 이동했습니다.
2.  **컴포넌트 구조화**:
    -   `components` 폴더를 `layout`, `home`, `common` 등으로 세분화하여 찾기 쉽게 정리했습니다.
3.  **Client vs Server**:
    -   Next.js의 App Router 특성을 살려, 데이터 페칭은 서버 컴포넌트(`page.tsx`)에서 수행하고, 인터랙션이 필요한 부분만 클라이언트 컴포넌트(`...Client.tsx`)로 분리했습니다.

---

Made with 💙 by SOLUX
