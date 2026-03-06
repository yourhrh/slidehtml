Feature: 애플리케이션 기본 기능
  slidehtml Electron 앱의 기본 동작을 검증합니다.

  Background:
    Given 앱이 실행되어 있다

  Scenario: 앱 창이 정상적으로 열린다
    Then 메인 창이 표시된다

  Scenario: 앱 타이틀이 올바르다
    Then 페이지 타이틀이 존재한다
