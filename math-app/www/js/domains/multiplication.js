/* domains/multiplication.js — 곱셈 (5레벨). 구체물 조작 -> 기호 연결 -> 쉬운 단부터 확장. */
(function (global) {
  'use strict';
  var U = Utils, I = ICONS;
  var ICON_POOL = ['apple', 'marble', 'star'];

  function arrayVisual(groups, perGroup, icon) {
    var spacing = groups * perGroup > 28 ? 28 : 40;
    return I.renderArray(groups, perGroup, icon, { spacing: spacing });
  }

  function level1() {
    var perGroup = U.randInt(2, 4);
    var groups = U.randInt(2, 4);
    var icon = U.pick(ICON_POOL);
    var visual = arrayVisual(groups, perGroup, icon);
    var prompt = perGroup + '개씩 ' + groups + '묶음이 있어요. 모두 몇 개일까요?';
    return U.inputItem(prompt, visual, perGroup * groups, { suffix: '개' });
  }

  function level2() {
    var perGroup = U.randInt(2, 4);
    var groups = U.randInt(2, 4);
    var icon = U.pick(ICON_POOL);
    var visual = arrayVisual(groups, perGroup, icon);
    var prompt = perGroup + ' × ' + groups + ' = □';
    return U.inputItem(prompt, visual, perGroup * groups, { speakText: perGroup + ' 곱하기 ' + groups + '는 얼마일까요?' });
  }

  function danLevel(dans, maxGroups) {
    return function () {
      var dan = U.pick(dans);
      var groups = U.randInt(2, maxGroups);
      var icon = U.pick(ICON_POOL);
      var visual = arrayVisual(groups, dan, icon);
      var prompt = dan + ' × ' + groups + ' = □';
      return U.inputItem(prompt, visual, dan * groups, { speakText: dan + ' 곱하기 ' + groups + '는 얼마일까요?' });
    };
  }

  global.Domains = global.Domains || {};
  global.Domains.multiplication = {
    id: 'multiplication',
    name: '곱셈',
    shortName: '곱셈',
    color: '#8a63c9',
    levels: [
      { id: 1, label: '동수누가 (곱셈 기호 없이)', description: '같은 크기 묶음 그림을 보고 전체 개수를 셀 수 있어요', maxItems: 6, generateItem: level1 },
      { id: 2, label: '곱셈 기호(×) 연결', description: '배열 그림과 곱셈식을 연결할 수 있어요', maxItems: 6, generateItem: level2 },
      { id: 3, label: '구구단 2·5·10단', description: '2단, 5단, 10단 곱셈을 할 수 있어요', maxItems: 8, generateItem: danLevel([2, 5, 10], 9) },
      { id: 4, label: '구구단 3·4단', description: '3단, 4단 곱셈을 할 수 있어요', maxItems: 8, generateItem: danLevel([3, 4], 9) },
      { id: 5, label: '구구단 6~9단', description: '6단부터 9단까지 곱셈을 할 수 있어요', maxItems: 8, generateItem: danLevel([6, 7, 8, 9], 6) }
    ]
  };
})(window);
