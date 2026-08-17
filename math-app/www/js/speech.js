/* speech.js — 기존 index.html(노래앱)의 speak() 패턴(Web Speech API, ko-KR, rate 0.85)을 재사용한 TTS 헬퍼.
   한글 텍스트가 등장하는 모든 곳(문항 지문/보기/버튼/결과 메시지)에서 공용으로 사용한다. */
(function (global) {
  'use strict';

  var highlightedEl = null;

  function clearHighlight() {
    if (highlightedEl) {
      highlightedEl.classList.remove('tts-active');
      highlightedEl = null;
    }
  }

  function speak(text, el) {
    if (!text) return;
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    clearHighlight();
    var utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'ko-KR';
    utter.rate = 0.85;
    utter.pitch = 1.05;
    if (el) {
      utter.onstart = function () {
        el.classList.add('tts-active');
        highlightedEl = el;
      };
      utter.onend = clearHighlight;
      utter.onerror = clearHighlight;
    }
    window.speechSynthesis.speak(utter);
  }

  function stop() {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    clearHighlight();
  }

  function escAttr(s) {
    return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // 스피커 버튼 HTML 조각 생성
  function btn(text, extraClass) {
    return '<button type="button" class="speak-btn ' + (extraClass || '') + '" data-speak="' + escAttr(text) + '" aria-label="음성으로 듣기">🔊</button>';
  }

  // 이벤트 위임: 문서 내 어디서든 .speak-btn 클릭 시 음성 재생
  document.addEventListener('click', function (e) {
    var btnEl = e.target.closest && e.target.closest('.speak-btn');
    if (!btnEl) return;
    e.preventDefault();
    var text = btnEl.getAttribute('data-speak');
    var host = btnEl.closest('.speak-highlight-host') || btnEl.parentElement;
    speak(text, host);
  });

  global.Speech = {
    speak: speak,
    stop: stop,
    btn: btn,
    escAttr: escAttr
  };
})(window);
