Feature: 홈 화면

  As a LLM 툴을 쓰는 개발자/기획자
  I want 프레젠테이션 폴더를 열고 최근 항목을 관리하고 싶다
  So that 매번 폴더를 찾지 않고 바로 작업을 재개할 수 있다

  Background:
    Given 앱이 실행되어 있다

  Scenario: 홈 화면이 정상적으로 표시된다
    Then "SlideHTML" 텍스트가 보인다
    And "폴더 열기" 텍스트가 보인다

  Scenario: 히스토리 항목에 우클릭하면 컨텍스트 메뉴가 표시된다
    Given 히스토리 목록이 존재한다
    When 히스토리 항목을 우클릭한다
    Then "히스토리에서 제거" 텍스트가 보인다

  @nfr
  Scenario: 앱이 빠르게 시작된다
    Then 홈 화면이 3초 이내에 표시된다
