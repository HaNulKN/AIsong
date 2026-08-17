/* domains/subtraction.js — 뺄셈 (5레벨). 덧셈과 대칭 구조, 동일한 십 프레임·묶음/낱개 모형을 재사용한다. */
(function (global) {
  'use strict';
  var U = Utils, I = ICONS;
  var ICON_POOL = ['apple', 'marble', 'star'];

  function twoScenesVisual(svgA, svgB, symbol) {
    return '<div class="compare-pair"><div class="compare-side">' + svgA + '</div>' +
      '<div class="compare-vs">' + (symbol || '-') + '</div>' +
      '<div class="compare-side">' + svgB + '</div></div>';
  }

  function level1() {
    var a = U.randInt(2, 5);
    var remove = U.randInt(1, a - 1);
    var icon = U.pick(ICON_POOL);
    var visual = I.renderRemoveGroup(icon, a, remove);
    return U.inputItem('빗금 친 것을 지우고 몇 개 남았는지 세어 보세요.', visual, a - remove, { suffix: '개' });
  }

  function level2() {
    var a = U.randInt(2, 10);
    var b = U.randInt(1, a - 1);
    var icon = U.pick(ICON_POOL);
    var visual = I.renderRemoveGroup(icon, a, b);
    var prompt = a + ' - ' + b + ' = □';
    return U.inputItem(prompt, visual, a - b, { suffix: '개', speakText: a + ' 빼기 ' + b + '는 얼마일까요?' });
  }

  function level3() {
    var a = U.randInt(11, 18);
    var onesA = a - 10;
    var b = U.randInt(onesA + 1, 9);
    var visual = I.renderTenFrame({ aCount: 10, bCount: onesA, colorA: '#4a90d9', colorB: '#4a90d9', removeCount: b });
    var prompt = a + ' - ' + b + ' = □ (묶음을 열어서 지워가며 빼보세요)';
    return U.inputItem(prompt, visual, a - b, { suffix: '개', speakText: a + ' 빼기 ' + b + '는 얼마일까요? 묶음을 열어서 빼야 해요.' });
  }

  function level4() {
    var numA, numB, tensA, onesA, tensB, onesB;
    if (Math.random() < 0.5) {
      tensA = U.randInt(1, 9); onesA = U.randInt(1, 9);
      var b = U.randInt(1, onesA);
      tensB = 0; onesB = b;
      numA = tensA * 10 + onesA; numB = b;
    } else {
      tensA = U.randInt(2, 9);
      tensB = U.randInt(1, tensA - 1);
      onesA = 0; onesB = 0;
      numA = tensA * 10; numB = tensB * 10;
    }
    var visual = twoScenesVisual(I.renderBundles(tensA, onesA), I.renderBundles(tensB, onesB), '−');
    var prompt = numA + ' - ' + numB + ' = □';
    return U.inputItem(prompt, visual, numA - numB, { speakText: numA + ' 빼기 ' + numB + '는 얼마일까요?' });
  }

  function level5() {
    var tensA = U.randInt(3, 9);
    var tensB = U.randInt(1, tensA - 1);
    var onesB = U.randInt(1, 9);
    var onesA = U.randInt(0, onesB - 1);
    var numA = tensA * 10 + onesA;
    var numB = tensB * 10 + onesB;
    var visual = twoScenesVisual(I.renderBundles(tensA, onesA), I.renderBundles(tensB, onesB), '−');
    var prompt = numA + ' - ' + numB + ' = □';
    return U.inputItem(prompt, visual, numA - numB, { speakText: numA + ' 빼기 ' + numB + '는 얼마일까요? 십의 자리에서 빌려와야 해요.' });
  }

  global.Domains = global.Domains || {};
  global.Domains.subtraction = {
    id: 'subtraction',
    name: '뺄셈',
    shortName: '뺄셈',
    color: '#c76b5f',
    levels: [
      { id: 1, label: '한 자리 뺄셈 (5 이내) — 덜어내기', description: '구체물에서 덜어내고 남은 개수를 셀 수 있어요 (5 이내)', maxItems: 6, generateItem: level1 },
      { id: 2, label: '한 자리 뺄셈 (10 이내) — 숫자식', description: '숫자식으로 한 자리 뺄셈을 할 수 있어요 (10 이내)', maxItems: 6, generateItem: level2 },
      { id: 3, label: '십몇 빼기 한 자리 — 받아내림', description: '묶음을 열어서 받아내림 뺄셈을 할 수 있어요', maxItems: 6, generateItem: level3 },
      { id: 4, label: '두 자리 뺄셈 (받아내림 없음)', description: '받아내림이 없는 두 자리 수 뺄셈을 할 수 있어요', maxItems: 6, generateItem: level4 },
      { id: 5, label: '두 자리 뺄셈 (받아내림 있음)', description: '받아내림이 있는 두 자리 수 뺄셈을 할 수 있어요', maxItems: 6, generateItem: level5 }
    ]
  };
})(window);
