/* domains/counting.js — 수세기 (6레벨, 수 범위 기준). 숫자 기호 인식 + 수량-숫자 대응을 처음 다룬다. */
(function (global) {
  'use strict';
  var U = Utils, I = ICONS;
  var ICON_POOL = ['apple', 'marble', 'star'];

  function stepChoices(correct, step, count, minValue) {
    minValue = minValue === undefined ? step : minValue;
    var candidates = [correct - step, correct + step, correct + 2 * step, correct - 2 * step, correct + 3 * step];
    candidates = candidates.filter(function (v) { return v >= minValue && v !== correct; });
    var distractors = U.shuffle(candidates).slice(0, count - 1);
    while (distractors.length < count - 1) {
      var v = correct + U.randInt(1, 5) * step * (Math.random() < 0.5 ? 1 : -1);
      if (v >= minValue && v !== correct && distractors.indexOf(v) === -1) distractors.push(v);
    }
    var values = U.shuffle([correct].concat(distractors));
    return { values: values, correctIndex: values.indexOf(correct) };
  }

  function countAndChoose(range, opts) {
    opts = opts || {};
    var n = U.randInt(range[0], range[1]);
    var icon = U.pick(ICON_POOL);
    var visual = opts.scatter ? I.renderScatterGroup(icon, n) : I.renderCountGroup(icon, n);
    var ch = U.buildNumberChoices(n, 4, 3, 1, range[1] + 3);
    return U.mcItem('그림을 보고 개수를 세어 알맞은 숫자를 고르세요.', visual, ch.values, ch.correctIndex);
  }

  function numberToPicture(range) {
    var n = U.randInt(range[0], range[1]);
    var icon = U.pick(ICON_POOL);
    var correctSvg = I.renderCountGroup(icon, n, { width: 130, height: 110, cols: Math.min(4, n) || 1 });
    var distractCounts = U.uniqueRandomExcept(Math.max(range[0], 1), range[1] + 2, [n], 3);
    var opts = [{ n: n, svg: correctSvg }].concat(distractCounts.map(function (dn) {
      return { n: dn, svg: I.renderCountGroup(icon, dn, { width: 130, height: 110, cols: Math.min(4, dn) || 1 }) };
    }));
    var shuffled = U.shuffle(opts);
    var correctIndex = shuffled.findIndex(function (o) { return o.n === n; });
    return {
      type: 'mc',
      optionType: 'visual',
      prompt: '숫자 ' + n + '(을)를 보고, ' + n + '개를 나타내는 그림을 고르세요.',
      speakText: '숫자 ' + n + '을 보고, ' + n + '개를 나타내는 그림을 고르세요.',
      visual: '<div class="big-number-visual">' + n + '</div>',
      options: shuffled.map(function (o) { return { svg: o.svg, speak: o.n + '개' }; }),
      correctIndex: correctIndex
    };
  }

  function sequenceNext(range, step) {
    var maxStart = range[1] - step * 3;
    var start = U.randInt(range[0], Math.max(range[0], maxStart));
    var seq = [start, start + step, start + step * 2];
    var correct = start + step * 3;
    var ch = stepChoices(correct, step, 4, step);
    var seqText = seq.join(', ') + ', □';
    return U.mcItem('순서에 맞게 다음에 올 숫자를 고르세요: ' + seqText, '<div class="big-number-visual">' + seqText + '</div>', ch.values, ch.correctIndex, {
      speakText: seq.join(', ') + '. 다음에 올 숫자는 무엇일까요?'
    });
  }

  function bundleValueItem(tens, ones) {
    var total = tens * 10 + ones;
    var visual = I.renderBundles(tens, ones);
    var ch = U.buildNumberChoices(total, 4, 8, 1, 99);
    return U.mcItem('묶음과 낱개를 보고 모두 몇 개인지 고르세요.', visual, ch.values, ch.correctIndex);
  }

  function digitPlaceItem(tens, ones) {
    var total = tens * 10 + ones;
    var visual = I.renderBundles(tens, ones);
    var askTens = Math.random() < 0.5;
    var correctDigit = askTens ? tens : ones;
    var promptText = (askTens ? '십의 자리' : '일의 자리') + ' 숫자는 무엇일까요? (전체 수: ' + total + ')';
    var distractors = U.uniqueRandomExcept(0, 9, [correctDigit], 3);
    var values = U.shuffle([correctDigit].concat(distractors));
    return U.mcItem(promptText, visual, values, values.indexOf(correctDigit));
  }

  function hundredValueItem(hundreds) {
    var total = hundreds * 100;
    var visual = I.renderPlaceValueScene(hundreds, 0, 0);
    var ch = stepChoices(total, 100, 4, 100);
    return U.mcItem('100판을 보고 모두 몇 개인지 고르세요.', visual, ch.values, ch.correctIndex);
  }

  function fullPlaceValueItem(hundreds, tens, ones) {
    var total = hundreds * 100 + tens * 10 + ones;
    var visual = I.renderPlaceValueScene(hundreds, tens, ones);
    var ch = U.buildNumberChoices(total, 4, 30, 1, 999);
    return U.mcItem('100판, 묶음, 낱개를 보고 모두 몇 개인지 고르세요.', visual, ch.values, ch.correctIndex);
  }

  function fullDigitPlaceItem(hundreds, tens, ones) {
    var total = hundreds * 100 + tens * 10 + ones;
    var visual = I.renderPlaceValueScene(hundreds, tens, ones);
    var which = U.pick(['백', '십', '일']);
    var correctDigit = which === '백' ? hundreds : (which === '십' ? tens : ones);
    var promptText = which + '의 자리 숫자는 무엇일까요? (전체 수: ' + total + ')';
    var distractors = U.uniqueRandomExcept(0, 9, [correctDigit], 3);
    var values = U.shuffle([correctDigit].concat(distractors));
    return U.mcItem(promptText, visual, values, values.indexOf(correctDigit));
  }

  function level1(itemIndex) {
    var t = itemIndex % 3;
    if (t === 0) return countAndChoose([1, 5]);
    if (t === 1) return numberToPicture([1, 5]);
    return sequenceNext([1, 5], 1);
  }

  function level2(itemIndex) {
    var t = itemIndex % 3;
    if (t === 0) return countAndChoose([1, 10], { scatter: Math.random() < 0.4 });
    if (t === 1) return numberToPicture([1, 10]);
    return sequenceNext([1, 10], 1);
  }

  function level3(itemIndex) {
    var t = itemIndex % 2;
    var tens = U.randInt(1, 9);
    if (t === 0) return bundleValueItem(tens, 0);
    return sequenceNext([10, 90], 10);
  }

  function level4(itemIndex) {
    var t = itemIndex % 2;
    var tens = U.randInt(1, 9), ones = U.randInt(1, 9);
    if (t === 0) return bundleValueItem(tens, ones);
    return digitPlaceItem(tens, ones);
  }

  function level5(itemIndex) {
    var t = itemIndex % 2;
    var hundreds = U.randInt(1, 9);
    if (t === 0) return hundredValueItem(hundreds);
    return sequenceNext([100, 900], 100);
  }

  function level6(itemIndex) {
    var t = itemIndex % 2;
    var hundreds = U.randInt(1, 9), tens = U.randInt(1, 9), ones = U.randInt(1, 9);
    if (t === 0) return fullPlaceValueItem(hundreds, tens, ones);
    return fullDigitPlaceItem(hundreds, tens, ones);
  }

  global.Domains = global.Domains || {};
  global.Domains.counting = {
    id: 'counting',
    name: '수세기',
    shortName: '수세기',
    color: '#5aa96f',
    levels: [
      { id: 1, label: '1~5 세기', description: '1부터 5까지 세고 숫자와 연결할 수 있어요', maxItems: 10, generateItem: level1 },
      { id: 2, label: '1~10 세기', description: '1부터 10까지 세고 순서를 이어갈 수 있어요', maxItems: 10, generateItem: level2 },
      { id: 3, label: '몇십 (10, 20 …)', description: '10개씩 묶어 세고 10씩 뛰어 셀 수 있어요', maxItems: 10, generateItem: level3 },
      { id: 4, label: '몇십몇 (34, 52 …)', description: '두 자리 수(몇십몇)를 읽고 자릿값을 알 수 있어요', maxItems: 10, generateItem: level4 },
      { id: 5, label: '몇백 (100, 200 …)', description: '100판을 세고 100씩 뛰어 셀 수 있어요', maxItems: 10, generateItem: level5 },
      { id: 6, label: '몇백몇십몇 (340, 352 …)', description: '세 자리 수(몇백몇십몇)를 읽고 자릿값을 알 수 있어요', maxItems: 10, generateItem: level6 }
    ]
  };
})(window);
