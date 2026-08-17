/* domains/numberSense.js — 수감각 (4레벨). 숫자 기호 없이 순수 양 지각만 다룬다. */
(function (global) {
  'use strict';
  var U = Utils, I = ICONS;
  var ICON_POOL = ['apple', 'marble', 'star', 'banana', 'candy'];

  // 글을 못 읽는 학생도 풀 수 있도록, 텍스트 보기 대신 그림(왼쪽 묶음/오른쪽 묶음) 자체와
  // 가운데 "=" 표시를 직접 탭해서 답하는 hotspot 구조. data-hotspot: 0=왼쪽, 1=오른쪽, 2=같음(=)
  // showEqual이 false인 레벨(예: L1 큰 차이 비교)은 두 묶음이 항상 다르므로 "=" 탭 영역을 아예 표시하지 않는다.
  function pairVisual(icon, leftCount, rightCount, leftArr, rightArr, showEqual) {
    var leftSvg = leftArr === 'scatter' ? I.renderScatterGroup(icon, leftCount) : I.renderCountGroup(icon, leftCount);
    var rightSvg = rightArr === 'scatter' ? I.renderScatterGroup(icon, rightCount) : I.renderCountGroup(icon, rightCount);
    var middle = showEqual
      ? '<div class="compare-vs" data-hotspot="2" tabindex="0" role="button" aria-label="두 쪽이 똑같아요">=</div>'
      : '<div class="compare-vs compare-vs-plain" aria-hidden="true">VS</div>';
    return '<div class="compare-pair">' +
      '<div class="compare-side" data-hotspot="0" tabindex="0" role="button" aria-label="왼쪽 묶음">' + leftSvg + '</div>' +
      middle +
      '<div class="compare-side" data-hotspot="1" tabindex="0" role="button" aria-label="오른쪽 묶음">' + rightSvg + '</div>' +
      '</div>';
  }

  function buildCompareItem(mode, leftCount, rightCount, arrLeft, arrRight) {
    var icon = U.pick(ICON_POOL);
    var showEqual = mode !== 'extreme'; // extreme(L1)은 항상 다른 두 수량만 나오므로 "같아요"가 정답일 수 없다
    var visual = pairVisual(icon, leftCount, rightCount, arrLeft, arrRight, showEqual);
    var correctIndex = leftCount === rightCount ? 2 : (leftCount > rightCount ? 0 : 1);
    var correctLabel = leftCount === rightCount ? '두 쪽이 똑같아요' : (leftCount > rightCount ? '왼쪽 묶음' : '오른쪽 묶음');
    var speakText = showEqual
      ? '어느 쪽이 더 많을까요? 더 많은 쪽 그림을 짚어 보세요. 두 쪽이 같으면 가운데 = 표시를 짚어 보세요.'
      : '어느 쪽이 더 많을까요? 더 많은 쪽 그림을 짚어 보세요.';
    return U.hotspotItem('어느 쪽이 더 많을까요? 더 많은 쪽 그림을 직접 짚어 보세요.', visual, correctIndex, {
      speakText: speakText,
      correctLabel: correctLabel
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
