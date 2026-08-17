/* domains/money.js — 화폐 (11레벨). 10원·50원 제외, 100/500/1000/5000/10000원만 사용. 거스름돈 계산은 범위 밖. */
(function (global) {
  'use strict';
  var U = Utils, I = ICONS;
  var ALL_VALUES = [100, 500, 1000, 5000, 10000];
  var COIN_VALUES = [100, 500];
  var BILL_VALUES = [1000, 5000, 10000];
  var FOODS = [
    { icon: 'banana', name: '바나나' },
    { icon: 'candy', name: '사탕' },
    { icon: 'apple', name: '사과' }
  ];

  function iconFor(value) { return value < 1000 ? 'coin' : 'bill'; }
  function unitFor(value) { return value < 1000 ? '개' : '장'; }
  function fmtWon(v) { return v.toLocaleString() + '원'; }

  function twoScenesVisual(svgA, svgB, symbol) {
    return '<div class="compare-pair"><div class="compare-side">' + svgA + '</div>' +
      '<div class="compare-vs">' + (symbol || '+') + '</div>' +
      '<div class="compare-side">' + svgB + '</div></div>';
  }

  function level1() {
    var value = U.pick(ALL_VALUES);
    var iconName = iconFor(value);
    var targetSvg = I.renderSingleIcon(iconName, value, { width: 110, height: 110, scale: 2.1 });
    var pool = ALL_VALUES.filter(function (v) { return v !== value; });
    var chosen = U.shuffle(pool).slice(0, 3);
    var opts = [{ v: value, svg: I.renderSingleIcon(iconName, value, { width: 100, height: 100, scale: 1.9 }) }]
      .concat(chosen.map(function (v) { return { v: v, svg: I.renderSingleIcon(iconFor(v), v, { width: 100, height: 100, scale: 1.9 }) }; }));
    var shuffled = U.shuffle(opts);
    var correctIndex = shuffled.findIndex(function (o) { return o.v === value; });
    return {
      type: 'mc',
      optionType: 'visual',
      prompt: '이 돈과 완전히 똑같이 생긴 것을 고르세요.',
      speakText: '이 돈과 완전히 똑같이 생긴 것을 고르세요.',
      visual: targetSvg,
      options: shuffled.map(function (o) { return { svg: o.svg, speak: fmtWon(o.v) }; }),
      correctIndex: correctIndex
    };
  }

  function level2() {
    var value = U.pick(ALL_VALUES);
    var visual = I.renderSingleIcon(iconFor(value), value, { width: 130, height: 130, scale: 2.3 });
    var mc = U.mcFromLabels(fmtWon(value), ALL_VALUES.map(fmtWon));
    return U.mcItem('이 돈은 얼마예요?', visual, mc.labels, mc.correctIndex);
  }

  function countLevel(value, minCount, maxCount) {
    return function () {
      var count = U.randInt(minCount, maxCount);
      var visual = I.renderCountGroup(iconFor(value), count, { extra: value, cols: Math.min(5, count) });
      var total = value * count;
      var prompt = fmtWon(value) + '짜리가 ' + count + unitFor(value) + ' 있어요. 모두 얼마일까요?';
      return U.inputItem(prompt, visual, total, { suffix: '원', speakText: prompt });
    };
  }

  function level8() {
    var c100 = U.randInt(1, 4);
    var c500 = U.randInt(1, 3);
    var visual = twoScenesVisual(
      I.renderCountGroup('coin', c100, { extra: 100, cols: Math.min(5, c100) }),
      I.renderCountGroup('coin', c500, { extra: 500, cols: Math.min(5, c500) }), '+');
    var total = c100 * 100 + c500 * 500;
    return U.inputItem('동전을 모두 더하면 얼마일까요?', visual, total, { suffix: '원' });
  }

  function level9() {
    var denoms = U.shuffle(BILL_VALUES).slice(0, 2);
    var cA = U.randInt(1, 3), cB = U.randInt(1, 3);
    var visual = twoScenesVisual(
      I.renderCountGroup('bill', cA, { extra: denoms[0], cols: Math.min(5, cA) }),
      I.renderCountGroup('bill', cB, { extra: denoms[1], cols: Math.min(5, cB) }), '+');
    var total = denoms[0] * cA + denoms[1] * cB;
    return U.inputItem('지폐를 모두 더하면 얼마일까요?', visual, total, { suffix: '원' });
  }

  var SHELF_PRICES = [100, 300, 500, 700, 1000, 1500, 2000, 3000, 4000, 5000];

  function level10() {
    var foods = U.shuffle(FOODS).slice(0, 3);
    var prices = U.shuffle(SHELF_PRICES).slice(0, 4); // 3개 진열 + 여분 오답 1개
    var items = foods.map(function (f, i) { return { icon: f.icon, name: f.name, value: prices[i] }; });
    var targetIndex = U.randInt(0, 2);
    var visual = I.renderShelf(items, targetIndex);
    var correctLabel = fmtWon(items[targetIndex].value);
    var labelPool = items.map(function (it) { return fmtWon(it.value); }).concat([fmtWon(prices[3])]);
    var mc = U.mcFromLabels(correctLabel, labelPool);
    var prompt = items[targetIndex].name + '은(는) 얼마입니까?';
    return U.mcItem(prompt, visual, mc.labels, mc.correctIndex, { speakText: prompt });
  }

  function describeCombo(counts) {
    var parts = [];
    ALL_VALUES.forEach(function (v) {
      if (counts[v] > 0) parts.push(fmtWon(v) + ' ' + counts[v] + unitFor(v));
    });
    return parts.length ? parts.join(' + ') : '0원';
  }

  function comboSum(counts) {
    var s = 0;
    ALL_VALUES.forEach(function (v) { s += v * counts[v]; });
    return s;
  }

  function randomCombo() {
    var counts = { 100: U.randInt(0, 3), 500: U.randInt(0, 2), 1000: U.randInt(0, 3), 5000: U.randInt(0, 1), 10000: 0 };
    var nonZero = ALL_VALUES.filter(function (v) { return counts[v] > 0; }).length;
    if (nonZero < 2 || comboSum(counts) === 0) return randomCombo();
    return counts;
  }

  function level11() {
    var correctCounts = randomCombo();
    var total = comboSum(correctCounts);
    var foods = U.shuffle(FOODS);
    var items = [{ icon: foods[0].icon, name: foods[0].name, value: total }];
    var visual = I.renderShelf(items, 0);
    var labels = [{ text: describeCombo(correctCounts), sum: total }];
    var guard = 0;
    while (labels.length < 4 && guard < 30) {
      guard++;
      var mutated = Object.assign({}, correctCounts);
      var v = U.pick(ALL_VALUES.slice(0, 4));
      var delta = U.pick([-1, 1, 2]);
      mutated[v] = Math.max(0, (mutated[v] || 0) + delta);
      var s = comboSum(mutated);
      if (s > 0 && s !== total && !labels.some(function (l) { return l.sum === s; })) {
        labels.push({ text: describeCombo(mutated), sum: s });
      }
    }
    while (labels.length < 4) labels.push({ text: labels[labels.length - 1].text + ' ', sum: -1 - labels.length });
    var shuffled = U.shuffle(labels);
    var correctIndex = shuffled.findIndex(function (l) { return l.sum === total; });
    var prompt = items[0].name + ' 가격(' + fmtWon(total) + ')에 맞게 낸 돈 조합을 고르세요.';
    return U.mcItem(prompt, visual, shuffled.map(function (l) { return l.text; }), correctIndex, { speakText: prompt });
  }

  global.Domains = global.Domains || {};
  global.Domains.money = {
    id: 'money',
    name: '화폐',
    shortName: '화폐',
    color: '#3fae5c',
    levels: [
      { id: 1, label: '같은 모양 돈 찾기', description: '똑같이 생긴 동전·지폐를 찾을 수 있어요', maxItems: 6, generateItem: level1 },
      { id: 2, label: '화폐 낱개 인식', description: '동전과 지폐를 보고 얼마인지 알 수 있어요', maxItems: 6, generateItem: level2 },
      { id: 3, label: '100원 동전 세기', description: '100원짜리를 세어 합계를 구할 수 있어요', maxItems: 6, generateItem: countLevel(100, 2, 5) },
      { id: 4, label: '500원 동전 세기', description: '500원짜리를 세어 합계를 구할 수 있어요', maxItems: 6, generateItem: countLevel(500, 2, 5) },
      { id: 5, label: '1000원 지폐 세기', description: '1000원짜리를 세어 합계를 구할 수 있어요', maxItems: 6, generateItem: countLevel(1000, 2, 5) },
      { id: 6, label: '10000원 지폐 세기', description: '10000원짜리를 세어 합계를 구할 수 있어요', maxItems: 6, generateItem: countLevel(10000, 2, 5) },
      { id: 7, label: '5000원 지폐 세기', description: '5000원짜리를 세어 합계를 구할 수 있어요', maxItems: 6, generateItem: countLevel(5000, 2, 5) },
      { id: 8, label: '동전 섞어서 세기', description: '100원과 500원을 섞어서 합계를 구할 수 있어요', maxItems: 6, generateItem: level8 },
      { id: 9, label: '지폐 섞어서 세기', description: '여러 지폐를 섞어서 합계를 구할 수 있어요', maxItems: 6, generateItem: level9 },
      { id: 10, label: '진열대 가격표 읽기', description: '가격표를 보고 물건 값을 읽을 수 있어요', maxItems: 6, generateItem: level10 },
      { id: 11, label: '동전+지폐로 가격 맞추기', description: '동전과 지폐를 섞어서 정확한 가격을 맞출 수 있어요', maxItems: 6, generateItem: level11 }
    ]
  };
})(window);
