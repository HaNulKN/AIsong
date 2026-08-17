/* domains/clock.js — 시계 (6레벨). 바늘 구분 -> 정시 -> 30분 -> 사분위 -> 5분 단위 -> 1분 단위. */
(function (global) {
  'use strict';
  var U = Utils, I = ICONS;

  function formatTime(hour, minute) {
    return minute === 0 ? (hour + '시') : (hour + '시 ' + minute + '분');
  }

  function wrapHour(h) {
    var v = ((h - 1) % 12 + 12) % 12 + 1;
    return v;
  }

  function buildTimeItem(hour, minute, candidateGenerator, speakSuffix) {
    var visual = I.renderClock(hour, minute);
    var correctLabel = formatTime(hour, minute);
    var seen = {}; seen[correctLabel] = true;
    var labels = [correctLabel];
    var guard = 0;
    while (labels.length < 4 && guard < 40) {
      guard++;
      var cand = candidateGenerator();
      var lbl = formatTime(cand.hour, cand.minute);
      if (!seen[lbl]) { seen[lbl] = true; labels.push(lbl); }
    }
    while (labels.length < 4) { labels.push(labels[labels.length - 1] + ' '); } // 극히 드문 폴백
    var mc = U.mcFromLabels(correctLabel, labels);
    return U.mcItem('시계를 보고 몇 시 몇 분인지 골라 보세요.', visual, mc.labels, mc.correctIndex, {
      speakText: '시계가 가리키는 시각은 몇 시 몇 분일까요?' + (speakSuffix || '')
    });
  }

  function level1() {
    var pool = [
      { hex: '#e05a3c', name: '빨간색' },
      { hex: '#3c6fe0', name: '파란색' },
      { hex: '#3fae5c', name: '초록색' },
      { hex: '#e0a63a', name: '주황색' }
    ];
    var shuffled = U.shuffle(pool);
    var hourColor = shuffled[0], minuteColor = shuffled[1];
    var hour = U.randInt(1, 12), minute = U.pick([0, 15, 30, 45]);
    var visual = I.renderClock(hour, minute, { hourColor: hourColor.hex, minuteColor: minuteColor.hex });
    var names = shuffled.map(function (c) { return c.name; });
    var mc = U.mcFromLabels(minuteColor.name, names);
    return U.mcItem('긴 바늘(분침)은 무슨 색일까요?', visual, mc.labels, mc.correctIndex, {
      speakText: '긴 바늘, 분침은 무슨 색일까요?'
    });
  }

  function level2() {
    var hour = U.randInt(1, 12);
    return buildTimeItem(hour, 0, function () {
      return { hour: U.randInt(1, 12), minute: 0 };
    });
  }

  function level3() {
    var hour = U.randInt(1, 12);
    return buildTimeItem(hour, 30, function () {
      return { hour: U.randInt(1, 12), minute: 30 };
    });
  }

  function level4() {
    var hour = U.randInt(1, 12);
    var minute = U.pick([15, 45]);
    return buildTimeItem(hour, minute, function () {
      return { hour: wrapHour(hour + U.randInt(-1, 1)), minute: U.pick([0, 15, 30, 45]) };
    });
  }

  function level5() {
    var hour = U.randInt(1, 12);
    var minute = U.pick([5, 10, 20, 25, 35, 40, 50, 55]);
    return buildTimeItem(hour, minute, function () {
      var m = minute + U.pick([-10, -5, 5, 10]);
      if (m < 0) m += 60; if (m >= 60) m -= 60;
      return { hour: hour, minute: m };
    });
  }

  function level6() {
    var hour = U.randInt(1, 12);
    var minute;
    do { minute = U.randInt(1, 59); } while (minute % 5 === 0);
    return buildTimeItem(hour, minute, function () {
      var m = minute + U.pick([-3, -2, -1, 1, 2, 3]);
      if (m < 0) m += 60; if (m >= 60) m -= 60;
      return { hour: hour, minute: m };
    }, ' 분침이 가리키는 눈금을 정확히 세어 보세요.');
  }

  global.Domains = global.Domains || {};
  global.Domains.clock = {
    id: 'clock',
    name: '시계',
    shortName: '시계',
    color: '#3c6fe0',
    levels: [
      { id: 1, label: '긴바늘/짧은바늘 구분', description: '긴 바늘(분침)과 짧은 바늘(시침)을 구분할 수 있어요', maxItems: 6, generateItem: level1 },
      { id: 2, label: '정시 읽기', description: '시계에서 정각(몇 시)을 읽을 수 있어요', maxItems: 6, generateItem: level2 },
      { id: 3, label: '30분 읽기', description: '시계에서 몇 시 30분을 읽을 수 있어요', maxItems: 6, generateItem: level3 },
      { id: 4, label: '15분/45분 읽기', description: '시계에서 몇 시 15분, 45분을 읽을 수 있어요', maxItems: 6, generateItem: level4 },
      { id: 5, label: '5분 단위 읽기', description: '시계에서 5분 단위 시각을 모두 읽을 수 있어요', maxItems: 8, generateItem: level5 },
      { id: 6, label: '1분 단위 정밀 읽기', description: '시계에서 1분 단위까지 정확히 읽을 수 있어요', maxItems: 8, generateItem: level6 }
    ]
  };
})(window);
