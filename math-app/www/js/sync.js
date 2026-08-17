/* sync.js — Google Sheets(Apps Script 웹앱) 동기화 큐.
   진단 종료 시 즉시 POST 시도 -> 실패(오프라인/URL 미설정) 시 localStorage 큐에 저장
   -> 앱 시작 시 및 "지금 동기화" 버튼으로 재전송.
   TODO(네이티브 강화): Capacitor Preferences 플러그인을 설치하면 아래 localStorage 호출을
   Preferences.get/set으로 교체해 안드로이드 네이티브 저장소를 사용하도록 확장할 수 있다. */
(function (global) {
  'use strict';

  var SETTINGS_KEY = 'mathapp_settings_v1';
  var QUEUE_KEY = 'mathapp_sync_queue_v1';

  function getSettings() {
    try {
      var raw = localStorage.getItem(SETTINGS_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) { return {}; }
  }

  function saveSettings(settings) {
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch (e) { /* ignore */ }
  }

  function getQueue() {
    try {
      var raw = localStorage.getItem(QUEUE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  }

  function setQueue(queue) {
    try { localStorage.setItem(QUEUE_KEY, JSON.stringify(queue)); } catch (e) { /* ignore */ }
  }

  // row: {학생명, 날짜, 영역, 도달레벨, 정답률, 중단사유}
  function queueResult(row) {
    var queue = getQueue();
    queue.push(row);
    setQueue(queue);
    return trySyncNow();
  }

  function postRow(url, row) {
    // Apps Script 웹앱은 별도 CORS 헤더를 붙이지 않으므로, preflight를 유발하지 않는
    // text/plain + no-cors 조합으로 전송한다(opaque 응답이라 성공 여부는 네트워크 오류
    // 유무로만 판단할 수 있다 — GAS doPost 연동에서 흔히 쓰이는 방식).
    return fetch(url, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(row)
    });
  }

  function trySyncNow() {
    var settings = getSettings();
    var queue = getQueue();
    if (!settings.sheetsUrl) {
      return Promise.resolve({ sent: 0, total: queue.length, reason: 'no_url' });
    }
    if (queue.length === 0) {
      return Promise.resolve({ sent: 0, total: 0 });
    }
    var remaining = [];
    var sentCount = 0;
    var chain = Promise.resolve();
    queue.forEach(function (row) {
      chain = chain.then(function () {
        return postRow(settings.sheetsUrl, row).then(function () {
          sentCount++;
        }).catch(function () {
          remaining.push(row);
        });
      });
    });
    return chain.then(function () {
      setQueue(remaining);
      return { sent: sentCount, total: queue.length, remaining: remaining.length };
    });
  }

  global.Sync = {
    getSettings: getSettings,
    saveSettings: saveSettings,
    getQueue: getQueue,
    queueResult: queueResult,
    trySyncNow: trySyncNow
  };
})(window);
