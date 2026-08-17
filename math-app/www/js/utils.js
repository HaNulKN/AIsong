/* utils.js — 공용 헬퍼 함수 (난수, 배열, 보기 생성) */
(function (global) {
  'use strict';

  function randInt(min, max) {
    // 정수 min~max(포함) 사이 난수
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function pick(arr) {
    return arr[randInt(0, arr.length - 1)];
  }

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = randInt(0, i);
      var tmp = a[i];
      a[i] = a[j];
      a[j] = tmp;
    }
    return a;
  }

  function uniqueRandomExcept(min, max, exceptValues, count) {
    // exceptValues를 제외한 범위에서 서로 다른 count개의 정수를 뽑는다
    var except = {};
    (exceptValues || []).forEach(function (v) { except[v] = true; });
    var pool = [];
    for (var n = min; n <= max; n++) {
      if (!except[n]) pool.push(n);
    }
    var picked = shuffle(pool).slice(0, count);
    return picked;
  }

  // 숫자 정답 하나 + 보기 개수(기본 4)로 4지선다 구성. 오답은 정답과 겹치지 않게, spread 범위 내에서 생성
  function buildNumberChoices(correctValue, optCount, spread, minValue, maxValue) {
    optCount = optCount || 4;
    spread = spread || Math.max(3, Math.round(correctValue * 0.3) + 2);
    minValue = minValue === undefined ? 0 : minValue;
    maxValue = maxValue === undefined ? correctValue + spread : maxValue;
    var lo = Math.max(minValue, correctValue - spread);
    var hi = Math.max(lo + optCount, Math.min(maxValue, correctValue + spread));
    var distractors = uniqueRandomExcept(lo, hi, [correctValue], optCount - 1);
    // 혹시 범위가 좁아 부족하면 보정
    var guard = 0;
    while (distractors.length < optCount - 1 && guard < 20) {
      var candidate = correctValue + randInt(-spread - guard, spread + guard);
      if (candidate >= 0 && candidate !== correctValue && distractors.indexOf(candidate) === -1) {
        distractors.push(candidate);
      }
      guard++;
    }
    var values = shuffle([correctValue].concat(distractors));
    var correctIndex = values.indexOf(correctValue);
    return { values: values, correctIndex: correctIndex };
  }

  function mcFromLabels(correctLabel, allLabels) {
    // allLabels: 정답 포함 전체 보기 텍스트 배열(중복 없이) — 셔플만 수행
    var shuffled = shuffle(allLabels);
    var correctIndex = shuffled.indexOf(correctLabel);
    return { labels: shuffled, correctIndex: correctIndex };
  }

  function zeroPad(n, len) {
    var s = String(n);
    while (s.length < len) s = '0' + s;
    return s;
  }

  // 문항 객체 생성 헬퍼 (모든 도메인 공용 포맷)
  function mcItem(prompt, visual, optionTexts, correctIndex, opts) {
    opts = opts || {};
    return {
      type: 'mc',
      prompt: prompt,
      speakText: opts.speakText || prompt,
      visual: visual,
      options: optionTexts.map(function (t) { return { text: String(t), speak: opts.optionSpeak ? opts.optionSpeak(t) : String(t) }; }),
      correctIndex: correctIndex
    };
  }

  function inputItem(prompt, visual, correctValue, opts) {
    opts = opts || {};
    return {
      type: 'input',
      prompt: prompt,
      speakText: opts.speakText || prompt,
      visual: visual,
      correctValue: correctValue,
      suffix: opts.suffix || ''
    };
  }

  global.Utils = {
    randInt: randInt,
    pick: pick,
    shuffle: shuffle,
    uniqueRandomExcept: uniqueRandomExcept,
    buildNumberChoices: buildNumberChoices,
    mcFromLabels: mcFromLabels,
    zeroPad: zeroPad,
    mcItem: mcItem,
    inputItem: inputItem
  };
})(window);
