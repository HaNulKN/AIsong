/* domains/numberSense.js — 수감각 (4레벨). 숫자 기호 없이 순수 양 지각(많다/적다)만 다룬다.
   "같다" 판단은 흩어진 배열에서 정확히 평가하기 어려워 전 레벨에서 제외하고,
   항상 개수가 다른 두 묶음 중 더 많은 쪽을 직접 짚는 과제로만 구성한다. */
(function (global) {
  'use strict';
  var U = Utils, I = ICONS;
  var ICON_POOL = ['apple', 'marble', 'star', 'banana', 'candy'];

  // 글을 못 읽는 학생도 풀 수 있도록, 텍스트 보기 대신 그림(왼쪽 묶음/오른쪽 묶음) 자체를
  // 직접 탭해서 답하는 hotspot 구조. data-hotspot: 0=왼쪽, 1=오른쪽
  function pairVisual(icon, leftCount, rightCount, leftArr, rightArr) {
    var leftSvg = leftArr === 'scatter' ? I.renderScatterGroup(icon, leftCount) : I.renderCountGroup(icon, leftCount);
    var rightSvg = rightArr === 'scatter' ? I.renderScatterGroup(icon, rightCount) : I.renderCountGroup(icon, rightCount);
    return '<div class="compare-pair">' +
      '<div class="compare-side" data-hotspot="0" tabindex="0" role="button" aria-label="왼쪽 묶음">' + leftSvg + '</div>' +
      '<div class="compare-vs compare-vs-plain" aria-hidden="true">VS</div>' +
      '<div class="compare-side" data-hotspot="1" tabindex="0" role="button" aria-label="오른쪽 묶음">' + rightSvg + '</div>' +
      '</div>';
  }

  function buildCompareItem(leftCount, rightCount, arrLeft, arrRight) {
    var icon = U.pick(ICON_POOL);
    var visual = pairVisual(icon, leftCount, rightCount, arrLeft, arrRight);
    var correctIndex = leftCount > rightCount ? 0 : 1;
    var correctLabel = leftCount > rightCount ? '왼쪽 묶음' : '오른쪽 묶음';
    return U.hotspotItem('어느 쪽이 더 많을까요? 더 많은 쪽 그림을 직접 짚어 보세요.', visual, correctIndex, {
      speakText: '어느 쪽이 더 많을까요? 더 많은 쪽 그림을 짚어 보세요.',
      correctLabel: correctLabel
    });
  }

  function level1(itemIndex) {
    // 극단적 차이 (차이 3~5)
    var leftBigger = itemIndex % 2 === 0;
    var small = U.randInt(1, 3);
    var big = small + U.randInt(3, 5);
    var leftCount = leftBigger ? big : small;
    var rightCount = leftBigger ? small : big;
    return buildCompareItem(leftCount, rightCount, 'grid', 'grid');
  }

  function level2(itemIndex) {
    // 중간 정도 차이 (차이 2~3), 배열을 살짝 다르게 섞어 시각적 다양성을 준다
    var leftBigger = itemIndex % 2 === 0;
    var small = U.randInt(1, 4);
    var big = small + U.randInt(2, 3);
    var leftCount = leftBigger ? big : small;
    var rightCount = leftBigger ? small : big;
    return buildCompareItem(leftCount, rightCount, 'grid', 'scatter');
  }

  function level3(itemIndex) {
    // 근접한 차이(정확히 1) 미세 변별
    var leftBigger = itemIndex % 2 === 0;
    var base = U.randInt(2, 6);
    var leftCount = leftBigger ? base + 1 : base;
    var rightCount = leftBigger ? base : base + 1;
    return buildCompareItem(leftCount, rightCount, 'grid', 'grid');
  }

  function level4(itemIndex) {
    // 흩어지거나 겹친 복잡한 배열에서 판별 (차이 1~3)
    var leftBigger = itemIndex % 2 === 0;
    var base = U.randInt(3, 7);
    var diff = U.randInt(1, 3);
    var leftCount = leftBigger ? base + diff : base;
    var rightCount = leftBigger ? base : base + diff;
    return buildCompareItem(leftCount, rightCount, 'scatter', 'scatter');
  }

  global.Domains = global.Domains || {};
  global.Domains.numberSense = {
    id: 'numberSense',
    name: '수감각',
    shortName: '수감각',
    color: '#4a90d9',
    levels: [
      { id: 1, label: '많다/적다 (큰 차이)', description: '개수 차이가 큰 두 묶음에서 어느 쪽이 많은지 알 수 있어요', maxItems: 4, generateItem: level1 },
      { id: 2, label: '많다/적다 (중간 차이)', description: '개수 차이가 어느 정도 나는 두 묶음에서도 많은 쪽을 알 수 있어요', maxItems: 4, generateItem: level2 },
      { id: 3, label: '근접한 양 변별', description: '개수가 하나 차이 나는 두 묶음도 비교할 수 있어요', maxItems: 4, generateItem: level3 },
      { id: 4, label: '복잡한 배열 판별', description: '흩어지거나 겹친 복잡한 배열에서도 양을 비교할 수 있어요', maxItems: 4, generateItem: level4 }
    ]
  };
})(window);
