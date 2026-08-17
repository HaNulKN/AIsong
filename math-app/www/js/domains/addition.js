/* domains/addition.js — 덧셈 (5레벨). 수세기의 묶음/낱개, 십 프레임 모형을 재사용한다. */
(function (global) {
  'use strict';
  var U = Utils, I = ICONS;
  var ICON_POOL = ['apple', 'marble', 'star'];

  function twoScenesVisual(svgA, svgB, symbol) {
    return '<div class="compare-pair"><div class="compare-side">' + svgA + '</div>' +
      '<div class="compare-vs">' + (symbol || '+') + '</div>' +
      '<div class="compare-side">' + svgB + '</div></div>';
  }

  function level1() {
    var a = U.randInt(1, 4);
    var maxB = 5 - a;
    var b = U.randInt(1, Math.max(1, maxB));
    var icon = U.pick(ICON_POOL);
    var visual = I.renderCombineGroups(icon, a, b);
    return U.inputItem('그림을 모두 합치면 몇 개일까요?', visual, a + b, { suffix: '개' });
  }

  function level2() {
    var a = U.randInt(1, 8);
    var b = U.randInt(1, Math.max(1, 10 - a));
    var icon = U.pick(ICON_POOL);
    var visual = I.renderCombineGroups(icon, a, b);
    var prompt = a + ' + ' + b + ' = □';
    return U.inputItem(prompt, visual, a + b, { suffix: '개', speakText: a + ' 더하기 ' + b + '는 얼마일까요?' });
  }

  function level3() {
    var total = U.randInt(11, 18);
    var a = U.randInt(Math.max(2, total - 9), Math.min(9, total - 2));
    var b = total - a;
    var visual = I.renderTenFrame({ aCount: a, bCount: b, colorA: '#4a90d9', colorB: '#eb824b' });
    var prompt = a + ' + ' + b + ' = □ (십 프레임을 채워서 10을 먼저 만들어 보세요)';
    return U.inputItem(prompt, visual, a + b, { suffix: '개', speakText: a + ' 더하기 ' + b + '는 얼마일까요? 열 개를 먼저 만들어보세요.' });
  }

  function level4() {
    var numA, numB, tensA, onesA, tensB, onesB;
    if (Math.random() < 0.5) {
      tensA = U.randInt(1, 8); onesA = U.randInt(0, 8);
      onesB = U.randInt(1, Math.max(1, 9 - onesA));
      tensB = 0;
      numA = tensA * 10 + onesA; numB = onesB;
    } else {
      tensA = U.randInt(1, 8);
      tensB = U.randInt(1, Math.max(1, 9 - tensA));
      onesA = 0; onesB = 0;
      numA = tensA * 10; numB = tensB * 10;
    }
    var visual = twoScenesVisual(I.renderBundles(tensA, onesA), I.renderBundles(tensB, onesB), '+');
    var prompt = numA + ' + ' + numB + ' = □';
    return U.inputItem(prompt, visual, numA + numB, { suffix: '', speakText: numA + ' 더하기 ' + numB + '는 얼마일까요?' });
  }

  function level5() {
    var tensA = U.randInt(1, 6);
    var onesA = U.randInt(1, 9);
    var onesB = U.randInt(Math.max(1, 10 - onesA), 9);
    var tensB = U.randInt(0, Math.max(0, 8 - tensA));
    var numA = tensA * 10 + onesA;
    var numB = tensB * 10 + onesB;
    var visual = twoScenesVisual(I.renderBundles(tensA, onesA), I.renderBundles(tensB, onesB), '+');
    var prompt = numA + ' + ' + numB + ' = □';
    return U.inputItem(prompt, visual, numA + numB, { suffix: '', speakText: numA + ' 더하기 ' + numB + '는 얼마일까요? 일의 자리를 더해서 10이 넘으면 십의 자리로 옮겨요.' });
  }

  global.Domains = global.Domains || {};
  global.Domains.addition = {
    id: 'addition',
    name: '덧셈',
    shortName: '덧셈',
    color: '#e0a63a',
    levels: [
      { id: 1, label: '한 자리 덧셈 (합 5 이내) — 전체 세기', description: '두 묶음을 합쳐 전체 개수를 셀 수 있어요 (합 5 이내)', maxItems: 6, generateItem: level1 },
      { id: 2, label: '한 자리 덧셈 (합 10 이내) — 숫자식', description: '숫자식으로 한 자리 덧셈을 할 수 있어요 (합 10 이내)', maxItems: 6, generateItem: level2 },
      { id: 3, label: '한 자리 덧셈 (받아올림) — 십 만들기', description: '십을 먼저 만드는 전략으로 받아올림 덧셈을 할 수 있어요', maxItems: 6, generateItem: level3 },
      { id: 4, label: '두 자리 덧셈 (받아올림 없음)', description: '받아올림이 없는 두 자리 수 덧셈을 할 수 있어요', maxItems: 6, generateItem: level4 },
      { id: 5, label: '두 자리 덧셈 (받아올림 있음)', description: '받아올림이 있는 두 자리 수 덧셈을 할 수 있어요', maxItems: 6, generateItem: level5 }
    ]
  };
})(window);
