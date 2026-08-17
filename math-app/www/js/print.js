/* print.js — 인쇄 친화적 1페이지 리포트(학생정보 + 레이더 + 영역별 요약) 및 인쇄 실행. */
(function (global) {
  'use strict';

  function escHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  var STOP_LABELS = {
    completed: '전체 문항 완료',
    wrong_streak: '3연속 오답으로 종료'
  };

  function stopReasonLabel(s) {
    if (s.stopReason === 'teacher_stopped') {
      return s.noData ? '교사가 즉시 종료 (미도달)' : '교사가 진행 중 조기 종료';
    }
    return STOP_LABELS[s.stopReason] || s.stopReason;
  }

  function render(container, data) {
    // data: {studentName, date, domainSummaries: [summary...], radarDataUrl}
    var rows = data.domainSummaries.map(function (s) {
      var domain = window.Domains[s.domainId];
      var levelInfo = domain.levels[s.finalLevelIndex];
      var reachSentence = s.noData ? '진단을 시작하기 전에 종료되었어요' : levelInfo.description;
      return '<tr>' +
        '<td>' + escHtml(domain.name) + '</td>' +
        '<td>' + escHtml(reachSentence) + '</td>' +
        '<td>' + Math.round(s.accuracy * 100) + '%</td>' +
        '<td>' + escHtml(stopReasonLabel(s)) + '</td>' +
        '</tr>';
    }).join('');

    container.innerHTML =
      '<div class="print-page">' +
      '<h1>수학 진단평가 결과 리포트</h1>' +
      '<div class="print-meta">' +
      '<div><strong>학생명:</strong> ' + escHtml(data.studentName) + '</div>' +
      '<div><strong>평가일:</strong> ' + escHtml(data.date) + '</div>' +
      '</div>' +
      (data.radarDataUrl ? '<div class="print-radar"><img src="' + data.radarDataUrl + '" alt="영역별 도달률 레이더 차트"/></div>' : '') +
      '<table class="print-table">' +
      '<thead><tr><th>영역</th><th>도달 수준</th><th>정답률</th><th>종료 사유</th></tr></thead>' +
      '<tbody>' + rows + '</tbody>' +
      '</table>' +
      '<p class="print-footnote">본 리포트는 발달장애 학생용 수학 진단평가 앱에서 자동 생성되었습니다. ' +
      '학부모 상담 및 IEP(개별화교육계획) 자료로 활용하실 수 있습니다.</p>' +
      '</div>';
  }

  function openPrintDialog() {
    // TODO(네이티브 강화): 안드로이드 네이티브 인쇄 다이얼로그(프린터 출력 / PDF 저장)를
    // 직접 호출하려면 커스텀 Capacitor 플러그인(android.print.PrintManager 브릿지) 또는
    // 검증된 커뮤니티 print 플러그인을 추가해 아래 분기에서 호출하도록 확장한다.
    // 현재는 신뢰할 수 있는 커뮤니티 플러그인이 확인되지 않아 window.print()로 폴백한다
    // (Capacitor WebView에서도 대부분의 안드로이드 버전은 시스템 인쇄 다이얼로그를 띄운다).
    if (global.Capacitor && global.Capacitor.Plugins && global.Capacitor.Plugins.Printer &&
      typeof global.Capacitor.Plugins.Printer.print === 'function') {
      global.Capacitor.Plugins.Printer.print().catch(function () { window.print(); });
      return;
    }
    window.print();
  }

  global.PrintReport = { render: render, openPrintDialog: openPrintDialog };
})(window);
