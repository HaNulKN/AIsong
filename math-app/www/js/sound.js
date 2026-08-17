/* sound.js — Web Audio API로 코드에서 직접 만드는 짧은 효과음 (외부 오디오 파일 없음). */
(function (global) {
  'use strict';
  var ctx = null;

  function getCtx() {
    if (!ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (AC) ctx = new AC();
    }
    return ctx;
  }

  function resumeIfNeeded() {
    var c = getCtx();
    if (c && c.state === 'suspended') c.resume();
  }

  function tone(c, freq, startTime, duration, type, gainPeak) {
    var osc = c.createOscillator();
    var gain = c.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, startTime);
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(gainPeak || 0.22, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    osc.connect(gain).connect(c.destination);
    osc.start(startTime);
    osc.stop(startTime + duration + 0.03);
  }

  function playCorrect() {
    resumeIfNeeded();
    var c = getCtx(); if (!c) return;
    var t = c.currentTime;
    tone(c, 523.25, t, 0.12, 'triangle');
    tone(c, 659.25, t + 0.1, 0.12, 'triangle');
    tone(c, 783.99, t + 0.2, 0.18, 'triangle');
  }

  function playPromote() {
    resumeIfNeeded();
    var c = getCtx(); if (!c) return;
    var t = c.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach(function (f, i) {
      tone(c, f, t + i * 0.11, 0.16, 'triangle', 0.28);
    });
  }

  function playGentle() {
    resumeIfNeeded();
    var c = getCtx(); if (!c) return;
    var t = c.currentTime;
    tone(c, 330, t, 0.16, 'sine', 0.16);
    tone(c, 294, t + 0.12, 0.22, 'sine', 0.13);
  }

  function playBadge() {
    resumeIfNeeded();
    var c = getCtx(); if (!c) return;
    var t = c.currentTime;
    [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach(function (f, i) {
      tone(c, f, t + i * 0.09, 0.2, 'triangle', 0.3);
    });
  }

  global.Sound = { playCorrect: playCorrect, playPromote: playPromote, playGentle: playGentle, playBadge: playBadge };
})(window);
