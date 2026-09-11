import type { HomeActivity, HomeStat } from "@/types/home";
import type { FooterLink } from "@/types/layout";
import type { CoreValue } from "@/types/recruit";

/**
 * 화면에 그대로 박히는 소개 문구와 링크를 모아 둔다.
 *
 * 원래 Supabase에 있었으나, 1년에 한 번 바뀔까 말까 한 값을 매 요청마다
 * 조회하느라 모든 페이지가 왕복 비용을 내고 있었다. 특히 푸터 링크는 루트
 * 레이아웃에 있어서 사이트 전체에 영향을 줬다.
 *
 * 여기 있는 값을 고치려면 코드를 고쳐 배포해야 한다. 그 주기로 충분한
 * 것들만 둔다. 시간이 지나며 쌓이거나(프로젝트, 후기) 날짜에 따라 노출이
 * 갈리는 것(모집 공고)은 계속 DB에 둔다.
 *
 * 배열 순서가 곧 화면 노출 순서다.
 */

/** 푸터 아이콘은 Footer의 FooterStyles가 key로 고른다. */
export const FOOTER_LINKS: FooterLink[] = [
  {
    key: "email",
    label: "Email",
    url: "mailto:sm.solux@gmail.com",
  },
  {
    key: "instagram",
    label: "Instagram",
    url: "https://www.instagram.com/only_solux/",
  },
  {
    key: "kakao",
    label: "KakaoTalk",
    url: "https://open.kakao.com/o/sKkticai",
  },
  {
    key: "github",
    label: "GitHub",
    url: "https://github.com/sm-solux",
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    url: "https://www.linkedin.com/company/sm-solux/",
  },
];

/** 홈 화면 활동 카드. 아이콘과 색은 Introduce의 ActivityStyles가 key로 고른다. */
export const HOME_ACTIVITIES: HomeActivity[] = [
  {
    key: "project",
    title: "프로젝트",
    description:
      "학기당 1회, 기획/디자인/FE/BE 파트의 구성원들이 한 팀으로 매칭되어 팀 프로젝트를 진행합니다. 게임, 웹, 앱 등 다양한 분야의 서비스를 구현해보고, 관련한 협업 능력을 함양합니다.",
  },
  {
    key: "study",
    title: "발표회",
    description:
      "매 프로젝트의 중후반부에는 각각 기획발표회와 최종발표회를 진행합니다. 솔룩스만의 독보적인 커뮤니티와 OB 네트워킹을 통해, 질의응답과 피드백을 나누며 프로젝트의 방향을 다듬고, 완성도를 평가합니다.",
  },
  {
    key: "seminar",
    title: "세미나",
    description:
      "비대면 구름에듀 플랫폼을 통한 자체 제작 세미나 과정을 운영합니다. 파트별 필수 세미나부터 선택 세미나까지, 전공 실력 증진은 물론 타 트랙의 스킬셋까지도 학습할 수 있습니다.",
  },
  {
    key: "starter",
    title: "스타터",
    description:
      "웹 개발 입문자를 위한 솔룩스만의 자체 트랙입니다. 기초 학습부터 실전 협업 프로젝트까지 단계적으로 경험할 수 있도록 설계되어, 향후 정규 웹프로젝트의 개발파트원으로 합류하기까지의 여정을 돕습니다.",
  },
];

export const HOME_STATS: HomeStat[] = [
  { key: "members", label: "Members", value: "100+" },
  { key: "projects", label: "Projects", value: "40+" },
  { key: "years", label: "Years", value: "28" },
];

/** 모집 페이지 인재상 카드. 아이콘은 RecruitClient의 ValueStyles가 key로 고른다. */
export const RECRUIT_CORE_VALUES: CoreValue[] = [
  {
    key: "growth",
    title: "성장",
    description:
      "지속적이고 꾸준한 노력을 투자하며 팀과 함께 발전하는 성장가능성을 지닌 분",
  },
  {
    key: "solidarity",
    title: "연대",
    description:
      "프로젝트 중 발생할 수 있는 여러 갈등 상황에서 각자의 입장을 공감, 정리하여 조화로운 해결책을 모색할 수 있는 분",
  },
  {
    key: "responsibility",
    title: "책임",
    description:
      "솔룩스에 높은 우선순위를 두며 각종 행사와 활동에 적극적으로 참여하고 프로젝트를 완주할 수 있는 분",
  },
];
