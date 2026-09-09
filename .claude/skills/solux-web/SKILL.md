---
name: solux-web
description: Development workflow and conventions for the SOLUX official website (Next.js App Router + Supabase). Use for any change to this repository - adding or editing a page, a component, an admin action, or data access - and whenever verifying a change before commit. Covers the server/client component boundary, Supabase access paths, recruit-period date handling, and the automated verification pipeline.
---

# SOLUX 웹사이트 작업 절차

이 저장소의 변경은 매번 같은 순서를 밟는다. 순서를 고정해 두는 이유는,
단계를 건너뛰면 늘 같은 자리에서 같은 종류의 버그가 나기 때문이다.

## 순서

1. **요구사항 확인** — 무엇을 바꾸는지, 어떤 화면과 어떤 데이터가 영향을 받는지
   한 문장으로 적는다. 관리자 화면과 공개 화면 중 어디인지 먼저 가른다.
2. **코드 탐색** — 아래 「어디를 봐야 하는가」로 대상 파일을 좁힌다. 새 파일을
   만들기 전에 같은 일을 하는 기존 컴포넌트가 있는지 먼저 찾는다.
3. **계획** — 서버와 클라이언트 중 어디에서 처리할지, 데이터 접근 경로를 어느
   것으로 쓸지 정한다. 이 두 가지가 이 저장소에서 가장 자주 틀리는 지점이다.
4. **구현** — 아래 「규칙」을 지킨다.
5. **리팩토링** — 같은 마크업이 두 페이지에 생겼으면 `components/`로 올린다.
   상수와 타입은 `lib/`에 둔다.
6. **검증** — `npm run verify` 와 `npm run verify:ui`를 돌린다. 통과하지 못한
   상태로 커밋하지 않는다.

## 어디를 봐야 하는가

| 대상 | 위치 |
|---|---|
| 공개 페이지 | `src/app/{activity,project,recruit}/page.tsx` — 서버 컴포넌트 |
| 공개 페이지의 상호작용 | 같은 폴더의 `*Client.tsx` — `'use client'` |
| 관리자 화면 | `src/app/admin/**` |
| 서버 액션 | `src/app/**/actions.ts` |
| 데이터 접근 | `src/lib/` |
| 공통 컴포넌트 | `src/components/{common,home,admin}/` |

## 규칙

### 서버와 클라이언트의 경계

데이터 조회는 서버 컴포넌트가 맡고, 상호작용은 클라이언트 컴포넌트가 맡는다.
페이지(`page.tsx`)에서 조회한 결과를 props로 내려주고, `*Client.tsx`가 상태와
이벤트만 다룬다. 조회를 클라이언트로 내리면 첫 화면이 비어 보이고 로딩 상태가
하나 더 생긴다.

`'use client'`를 새로 붙이기 전에 정말 필요한지 확인한다. 필요한 이유는 보통
셋 중 하나다: 상태를 들고 있어야 한다, 이벤트 핸들러가 필요하다, 브라우저
API를 쓴다.

### Supabase 접근 경로

호출하는 위치에 따라 클라이언트를 나눠 뒀다. 아무거나 가져다 쓰면 인증
컨텍스트가 어긋난다.

| 위치 | 사용 |
|---|---|
| 서버 컴포넌트, 서버 액션 | `lib/supabase-server` |
| 클라이언트 컴포넌트 | `lib/supabase-browser` |
| 미들웨어 | `lib/supabase-middleware` |
| 권한이 필요한 관리자 작업 | `lib/supabase-admin` — 서비스 키를 쓰므로 서버에서만 |

`supabase-admin`을 클라이언트 번들에 들어가는 파일에서 import하면 서비스 키가
새어 나간다. 관리자 작업은 서버 액션을 거친다.

### 날짜와 모집 기간

모집 기간은 시각 비교가 걸려 있어 가장 자주 틀린다. 저장은 UTC로 하고 화면에
보일 때 현지 시간으로 바꾼다. 기간의 끝을 비교할 때는 그날 23:59:59까지
포함되는지 확인한다. 하루 차이는 화면을 열어 봐야 보이지 않으므로, 경계값을
직접 넣어 확인한다.

### 정렬

목록의 정렬 기준은 컴포넌트가 아니라 조회 지점에 둔다. 화면마다 다시 정렬하면
두 화면의 순서가 갈린다.

### 반응형과 브라우저

- 고정 폭(`w-[380px]` 같은 값)을 쓰기 전에 `max-w-*`로 되는지 본다. 모바일에서
  가로 스크롤이 생기는 원인의 대부분이 이것이다.
- 긴 한글 문장에는 `break-keep`을 준다. 어절 중간에서 잘리면 읽기 나쁘다.
- Safari는 폰트 굵기를 다르게 그린다. 굵기를 바꿨으면 Safari에서도 본다.

## 검증

```bash
npm run verify      # 타입 검사 → 린트 → 빌드
npm run verify:ui   # 개발 서버를 띄운 상태에서 실행
```

`verify:ui`는 공개 페이지 4개를 모바일·태블릿·데스크톱 뷰포트로 열어 가로
스크롤, 뷰포트를 넘는 요소, 콘솔 에러, 빈 화면을 확인하고 `.ui-snapshots/`에
스크린샷을 남긴다. 손으로 확인하던 항목을 자동으로 돌리는 것이 목적이므로,
새로 발견한 종류의 버그가 있으면 `scripts/verify-ui.mjs`의 검사 항목에 추가해
다음부터는 사람이 다시 찾지 않게 한다.

같은 검사가 `.github/workflows/ci.yml`에서 push와 PR마다 돈다. 타입 검사와
린트는 항상 돌고, 빌드와 UI 검증은 Supabase 비밀값이 설정된 저장소에서만
돈다.

## 커밋

커밋 메시지는 저장소 관례를 따른다: `feat:`, `fix:`, `refactor:` 뒤에 한국어로
무엇을 바꿨는지 적는다. 예) `feat: 모집 공고 기간 자동 반영`
