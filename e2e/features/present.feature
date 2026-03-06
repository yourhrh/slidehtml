Feature: 발표 모드

  As a 발표자
  I want 슬라이드를 풀스크린으로 보며 키보드로 넘기고 싶다
  So that 마우스 없이 자연스럽게 발표할 수 있다

  Background:
    Given 앱이 실행되어 있다
    And 슬라이드 폴더가 열려 있다
    And slides/ 폴더에 HTML 파일이 3개 있다

  Scenario: 발표 모드 버튼으로 진입할 수 있다
    When "발표 모드" 버튼을 클릭한다
    Then 발표 모드 화면이 표시된다

  Scenario: ESC 키로 편집 모드로 돌아간다
    Given 발표 모드 화면이 표시된다
    When ESC 키를 누른다
    Then 편집 화면이 표시된다

  Scenario: 화살표 키로 슬라이드를 이동한다
    Given 발표 모드 화면이 표시된다
    And 현재 슬라이드가 1번이다
    When 오른쪽 화살표 키를 누른다
    Then 현재 슬라이드가 2번이 된다

  Scenario: 스페이스바로 다음 슬라이드로 이동한다
    Given 발표 모드 화면이 표시된다
    And 현재 슬라이드가 1번이다
    When 스페이스바를 누른다
    Then 현재 슬라이드가 2번이 된다
