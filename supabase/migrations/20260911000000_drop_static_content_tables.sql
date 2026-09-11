-- 코드 상수로 옮긴 테이블을 정리한다.
--
-- footer_links, home_activities, recruit_core_values 는 1년에 한 번 바뀔까 말까
-- 한 소개 문구와 링크였는데, 매 요청마다 조회하느라 비용만 내고 있었다.
-- 내용은 src/lib/site-content.ts 로 옮겼고, 이 마이그레이션 이후로는 코드를
-- 고쳐 배포하는 방식으로 수정한다.
--
-- 되돌리려면 이 파일을 되돌리는 것만으로는 부족하다. 테이블을 다시 만들고
-- site-content.ts 의 값을 다시 넣어야 한다.

drop table if exists public.footer_links;
drop table if exists public.home_activities;
drop table if exists public.recruit_core_values;
