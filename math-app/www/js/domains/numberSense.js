/* domains/numberSense.js — 수감각 (4레벨). 숫자 기호 없이 순수 양 지각만 다룬다. */
(function (global) {
  'use strict';
  var U = Utils, I = ICONS;
  var ICON_POOL = ['apple', 'marble', 'star', 'banana', 'candy'];

  function pairVisual(icon, leftCount, rightCount, leftArr, rightArr) {
    var leftSvg = leftArr === 'scatter' ? I.renderScatterGroup(icon, leftCount) : I.renderCountGroup(icon, leftCount);
    var rightSvg = rightArr === 'scatter' ? I.renderScatterGroup(icon, rightCount) : I.renderCountGroup(icon, rightCount);
    return '<div class="compare-pair">' +
      '<div class="compare-side">' + leftSvg + '</div>' +
      '<div class="compare-vs">VS</div>' +
      '<div class="compare-side">' + rightSvg + '</div>' +
      '</div>';
  }

  var OPTIONS = ['왼쪽이 더 많아요', '오른쪽이 더 많아요', '두 쪽이 똑같아요'];

  function buildCompareItem(mode, leftCount, rightCount, arrLeft, arrRight) {
    var icon = U.pick(ICON_POOL);
    var visual = pairVisual(icon, leftCount, rightCount, arrLeft, arrRight);
    var correctIndex = leftCount === rightCount ? 2 : (leftCount > rightCount ? 0 : 1);
    return U.mcItem('어느 쪽이 더 많을까요? 그림을 보고 골라 보세요.', visual, OPTIONS, correctIndex, {
      speakText: '어느 쪽이 더 많을까요?'
    });
  }

  function level1(itemIndex) {
    var leftBigger = itemIndex % 2 === 0;
    var small = U.randInt(1, 3);
    var big = small + U.randInt(3, 5);
    var leftCount = leftBigger ? big : small;
    var rightCount = leftBigger ? small : big;
    return buildCompareItem('extreme', leftCount, rightCount, 'grid', 'grid');
  }

  function level2(itemIndex) {
    var mode = itemIndex % 3;
    if (mode === 2) {
      var n = U.randInt(2, 6);
      return buildCompareItem('equal', n, n, 'grid', 'scatter');
    }
    var small = U.randInt(1, 4);
    var big = small + U.randInt(2, 4);
    var leftCount = mode === 0 ? big : small;
    var rightCount = mode === 0 ? small : big;
    return buildCompareItem('diff', leftCount, rightCount, 'grid', 'grid');
  }

  function level3(itemIndex) {
    var mode = itemIndex % 3;
    var base = U.randInt(2, 6);
    if (mode === 2) return buildCompareItem('equal', base, base, 'grid', 'grid');
    var other = mode === 0 ? base + 1 : base - 1;
    if (other < 1) other = base + 1;
    var leftCount = mode === 0 ? Math.max(base, other) : Math.min(base, other);
    var rightCount = mode === 0 ? Math.min(base, other) : Math.max(base, other);
    // mode0: 왼쪽이 더 많이(정확히 diff1), mode1: 오른쪽이 더 많이
    if (mode === 0) { leftCount = base + 1; rightCount = base; }
    else { leftCount = base; rightCount = base + 1; }
    return buildCompareItem('close', leftCount, rightCount, 'grid', 'grid');
  }

  function level4(itemIndex) {
    var mode = itemIndex % 3;
    var base = U.randInt(3, 7);
    var leftCount, rightCount;
    if (mode === 2) { leftCount = base; rightCount = base; }
    else if (mode === 0) { leftCount = base + U.randInt(1, 3); rightCount = base; }
    else { leftCount = base; rightCount = base + U.randInt(1, 3); }
    return buildCompareItem('complex', leftCount, rightCount, 'scatter', 'scatter');
  }

  global.Domains = global.Domains || {};
  global.Domains.numberSense = {
    id: 'numberSense',
    name: '수감각',
    shortName: '수감각',
    color: '#4a90d9',
    levels: [
      { id: 1, label: '많다/적다 (큰 차이)', description: '개수 차이가 큰 두 묶음에서 어느 쪽이 많은지 알 수 있어요', maxItems: 4, generateItem: level1 },
      { id: 2, label: '같다 개념', description: '배열이 달라도 같은 개수인 것을 알 수 있어요', maxItems: 4, generateItem: level2 },
      { id: 3, label: '근접한 양 변별', description: '개수가 하나 차이 나는 두 묶음도 비교할 수 있어요', maxItems: 4, generateItem: level3 },
      { id: 4, label: '복잡한 배열 판별', description: '흩어지거나 겹친 복잡한 배열에서도 양을 비교할 수 있어요', maxItems: 4, generateItem: level4 }
    ]
  };
})(window);
