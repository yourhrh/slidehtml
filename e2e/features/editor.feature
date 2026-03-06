Feature: 편집 화면

  As a 발표 준비 중인 개발자
  I want 슬라이드 목록을 보고 현재 슬라이드를 탐색하고 싶다
  So that LLM이 만든 슬라이드를 확인하며 발표를 준비할 수 있다

  Background:
    Given 앱이 실행되어 있다
    And 슬라이드 폴더가 열려 있다

  Scenario: 슬라이드가 없을 때 안내 메시지가 표시된다
    Given 슬라이드 폴더가 비어 있다
    Then "슬라이드가 없습니다" 텍스트가 보인다

  Scenario: 슬라이드가 있으면 썸네일이 표시된다
    Given slides/ 폴더에 HTML 파일이 2개 있다
    Then 썸네일이 2개 표시된다

  Scenario: 다음 버튼으로 슬라이드를 이동할 수 있다
    Given slides/ 폴더에 HTML 파일이 3개 있다
    And 현재 슬라이드가 1번이다
    When "다음 슬라이드" 버튼을 클릭한다
    Then 슬라이드 번호가 "2 / 3"으로 표시된다

  Scenario: 터미널 열기 버튼이 표시된다
    Then "터미널" 텍스트가 보인다

  @nfr
  Scenario: 슬라이드 전환이 즉각 반응한다
    Given slides/ 폴더에 HTML 파일이 2개 있다
    When "다음 슬라이드" 버튼을 클릭한다
    Then 1초 이내에 슬라이드 번호가 업데이트된다
