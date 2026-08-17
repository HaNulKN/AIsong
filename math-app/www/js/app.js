/* app.js — 화면 전환/컨트롤러. 학생 프로필 -> 영역선택 -> 시작레벨선택 -> 문제풀이 -> 결과 -> 전체요약 -> 설정 */
(function () {
  'use strict';

  var DOMAIN_ORDER = ['numberSense', 'counting', 'addition', 'subtraction', 'multiplication', 'clock', 'money'];

  var STOP_LABELS = {
    completed: '전체 문항 완료',
    wrong_streak: '3연속 오답으로 종료',
    teacher_stopped: '교사가 즉시 종료(미도달)'
  };

  function stopReasonLabel(summary) {
    if (summary.stopReason === 'teacher_stopped') {
      return summary.noData ? '교사가 즉시 종료 (미도달)' : '교사가 진행 중 조기 종료';
    }
    return STOP_LABELS[summary.stopReason] || summary.stopReason;
  }

  var State = {
    student: { name: '' },
    startLevelChoice: {},
    sessions: {},
    results: {},
    badges: {},
    currentDomainId: null,
    answered: false,
    previousScreen: 'screen-profile'
  };

  // 테스트/디버그 훅: Playwright 시나리오에서 현재 문항의 정답을 확인하기 위해 노출
  window.__MATH_APP_DEBUG__ = {
    getState: function () { return State; },
    getCurrentItem: function () {
      var s = State.sessions[State.currentDomainId];
      return s ? s.currentItem : null;
    }
  };

  function $(id) { return document.getElementById(id); }

  function showScreen(id) {
    document.querySelectorAll('.screen').forEach(function (s) { s.classList.remove('active'); });
    $(id).classList.add('active');
  }

  function todayStr() {
    var d = new Date();
    return d.getFullYear() + '-' + Utils.zeroPad(d.getMonth() + 1, 2) + '-' + Utils.zeroPad(d.getDate(), 2);
  }

  // 정답 시 화면에 흩뿌릴 별 파티클 여러 개를 만들어 star-row에 붙인다 (역동적인 정답 연출)
  function burstStars(count) {
    var row = $('star-row');
    for (var i = 0; i < count; i++) {
      var wrap = document.createElement('div');
      wrap.className = 'burst-particle';
      var angle = (Math.PI * 2 * i) / count + (Math.random() * 0.6 - 0.3);
      var dist = 60 + Math.random() * 40;
      wrap.style.setProperty('--dx', (Math.cos(angle) * dist).toFixed(1) + 'px');
      wrap.style.setProperty('--dy', (Math.sin(angle) * dist - 20).toFixed(1) + 'px');
      wrap.style.setProperty('--rot', (Math.random() * 360 - 180).toFixed(0) + 'deg');
      wrap.style.animationDelay = (i * 0.03) + 's';
      wrap.innerHTML = starSvg();
      row.appendChild(wrap);
    }
  }

  function badgeSvg(color, size) {
    size = size || 70;
    return ICONS.buildScene([{ icon: 'badge', x: size / 2, y: size / 2, scale: size / 60, extra: color }], { width: size, height: size, label: '배지' });
  }

  function starSvg() {
    return ICONS.buildScene([{ icon: 'star', x: 15, y: 15, scale: 0.9 }], { width: 30, height: 30 });
  }

  function thresholdColor(pct) {
    if (pct >= 70) return '#4caf6f';
    if (pct >= 40) return '#f0b429';
    return '#e0625a';
  }

  /* ---------------- 1. 학생 프로필 ---------------- */
  $('btn-start-profile').addEventListener('click', function () {
    var name = $('input-student-name').value.trim();
    State.student.name = name || '학생';
    State.sessions = {}; State.results = {}; State.badges = {};
    renderDomainSelect();
    showScreen('screen-domain-select');
  });

  /* ---------------- 2. 영역 선택 ---------------- */
  function renderDomainSelect() {
    $('domain-select-title').textContent = State.student.name + ' 학생 — 영역을 선택하세요';
    var grid = $('domain-grid');
    grid.innerHTML = '';
    DOMAIN_ORDER.forEach(function (id) {
      var domain = window.Domains[id];
      var done = !!State.results[id];
      var card = document.createElement('div');
      card.className = 'domain-card' + (done ? ' done' : '');
      var startIdx = State.startLevelChoice[id] || 0;
      var optionsHtml = domain.levels.map(function (lvl, idx) {
        return '<option value="' + idx + '"' + (idx === startIdx ? ' selected' : '') + '>Lv' + (idx + 1) + '. ' + lvl.label + '</option>';
      }).join('');
      var statusText = done ? ('완료: ' + domain.levels[State.results[id].finalLevelIndex].description) : domain.levels[startIdx].description;
      card.innerHTML =
        '<div style="display:flex;align-items:center;gap:8px;">' +
        '<span class="dot" style="background:' + domain.color + '"></span>' +
        '<strong>' + domain.name + '</strong>' +
        Speech.btn(domain.name) +
        '</div>' +
        '<div class="level-desc">' + statusText + '</div>' +
        '<label style="font-size:0.8rem;margin-top:6px;">시작 레벨</label>' +
        '<select data-domain="' + id + '" class="start-level-select">' + optionsHtml + '</select>' +
        '<button type="button" class="btn small" data-start-domain="' + id + '" style="margin-top:10px;">' + (done ? '다시 진단하기' : '진단 시작') + '</button>';
      grid.appendChild(card);
    });

    grid.querySelectorAll('.start-level-select').forEach(function (sel) {
      sel.addEventListener('change', function () {
        State.startLevelChoice[sel.getAttribute('data-domain')] = Number(sel.value);
      });
    });
    grid.querySelectorAll('[data-start-domain]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        startDomain(btn.getAttribute('data-start-domain'));
      });
    });
  }

  $('btn-goto-summary').addEventListener('click', function () { renderSummary(); showScreen('screen-summary'); });

  function startDomain(domainId) {
    var domain = window.Domains[domainId];
    var startIdx = State.startLevelChoice[domainId] || 0;
    State.sessions[domainId] = Engine.createSession(domain, { startLevelIndex: startIdx });
    State.currentDomainId = domainId;
    renderQuizItem();
    showScreen('screen-quiz');
  }

  /* ---------------- 3. 문제 풀이 ---------------- */
  function buildProgressDots(session) {
    var level = Engine.currentLevel(session);
    var levelLog = session.log.filter(function (e) { return e.levelIndex === session.levelIndex; });
    var html = '';
    for (var i = 0; i < level.maxItems; i++) {
      var cls = 'progress-dot';
      if (i < levelLog.length) {
        var entry = levelLog[i];
        cls += entry.skipped ? ' skip' : (entry.correct ? ' correct' : ' wrong');
      } else if (i === levelLog.length) {
        cls += ' current';
      }
      html += '<div class="' + cls + '">' + (i + 1) + '</div>';
    }
    return html;
  }

  function renderQuizItem() {
    var session = State.sessions[State.currentDomainId];
    var domain = window.Domains[State.currentDomainId];
    if (!session || session.finished) { completeDomain(); return; }
    var item = Engine.nextItem(session);
    State.answered = false;

    var level = Engine.currentLevel(session);
    $('quiz-level-badge').textContent = 'Lv' + (session.levelIndex + 1) + '. ' + level.label;
    $('quiz-domain-name').textContent = domain.name + ' 진단';
    $('progress-path').innerHTML = buildProgressDots(session);
    $('streak-note').textContent = '연속 정답 ' + session.consecCorrect + '/3 · 전체 연속 오답 ' + session.consecWrongGlobal + '/3';

    $('quiz-prompt-text').textContent = item.prompt;
    $('quiz-speak-btn').setAttribute('data-speak', Speech.escAttr(item.speakText || item.prompt));
    $('quiz-visual').innerHTML = item.visual || '';
    $('quiz-feedback').style.display = 'none';
    $('quiz-feedback').className = 'feedback-banner';
    $('star-row').innerHTML = '';
    document.querySelector('.quiz-card').classList.remove('pulse-correct', 'shake-wrong');

    var answerArea = $('quiz-answer-area');
    if (item.type === 'mc') {
      var grid = document.createElement('div');
      grid.className = 'options-grid';
      item.options.forEach(function (opt, idx) {
        var el = document.createElement('div');
        el.className = 'option-btn' + (item.optionType === 'visual' ? ' visual' : '');
        el.setAttribute('data-index', idx);
        el.setAttribute('tabindex', '0');
        if (item.optionType === 'visual') {
          el.innerHTML = opt.svg + Speech.btn(opt.speak, 'small');
        } else {
          el.innerHTML = '<span class="option-text">' + opt.text + '</span>' + Speech.btn(opt.speak);
        }
        grid.appendChild(el);
      });
      answerArea.innerHTML = '';
      answerArea.appendChild(grid);
      grid.addEventListener('click', mcClickHandler);
    } else if (item.type === 'hotspot') {
      // 정답 후보는 텍스트 보기가 아니라 #quiz-visual 안의 [data-hotspot] 요소 자체다.
      // 클릭은 module-level hotspotClickHandler(이벤트 위임)에서 처리하므로 여기서는 보기 영역을 비운다.
      answerArea.innerHTML = '';
    } else {
      answerArea.innerHTML =
        '<div class="numpad-input">' +
        '<input type="text" inputmode="numeric" id="quiz-numeric-input" autocomplete="off">' +
        '<span>' + (item.suffix || '') + '</span>' +
        '</div>' +
        '<div class="numpad-grid" id="numpad-grid">' +
        [1, 2, 3, 4, 5, 6, 7, 8, 9, '⌫', 0, '확인'].map(function (k) {
          return '<button type="button" class="numpad-key" data-key="' + k + '">' + k + '</button>';
        }).join('') +
        '</div>';
      $('numpad-grid').addEventListener('click', numpadClickHandler);
    }

    // 문항이 새로 나오면 자동으로 지문을 읽어준다 (글을 못 읽는 학생을 위한 필수 접근성)
    setTimeout(function () { Speech.speak(item.speakText || item.prompt, $('quiz-prompt-host')); }, 200);
  }

  function mcClickHandler(e) {
    if (State.answered) return;
    if (e.target.closest('.speak-btn')) return; // 음성 듣기 버튼은 채점과 무관
    var optBtn = e.target.closest('.option-btn');
    if (!optBtn) return;
    var idx = Number(optBtn.getAttribute('data-index'));
    gradeAndAdvance(idx);
  }

  // type:'hotspot' 문항 전용: 정답 후보가 #quiz-visual 안의 [data-hotspot] 요소 자체이므로,
  // 매 문항마다 답안 버튼을 새로 그리는 대신 #quiz-visual 자체에 한 번만 이벤트 위임을 건다.
  function hotspotClickHandler(e) {
    if (State.answered) return;
    var session = State.sessions[State.currentDomainId];
    var item = session && session.currentItem;
    if (!item || item.type !== 'hotspot') return;
    var spot = e.target.closest('[data-hotspot]');
    if (!spot) return;
    var idx = Number(spot.getAttribute('data-hotspot'));
    gradeAndAdvance(idx);
  }
  function hotspotKeyHandler(e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var spot = e.target.closest && e.target.closest('[data-hotspot]');
    if (!spot) return;
    e.preventDefault();
    hotspotClickHandler({ target: spot });
  }
  $('quiz-visual').addEventListener('click', hotspotClickHandler);
  $('quiz-visual').addEventListener('keydown', hotspotKeyHandler);

  function numpadClickHandler(e) {
    var keyBtn = e.target.closest('.numpad-key');
    if (!keyBtn) return;
    var key = keyBtn.getAttribute('data-key');
    var input = $('quiz-numeric-input');
    if (key === '⌫') { input.value = input.value.slice(0, -1); return; }
    if (key === '확인') {
      if (State.answered) return;
      if (input.value === '') return;
      gradeAndAdvance(input.value);
      return;
    }
    input.value = (input.value + key).slice(0, 6);
  }

  function gradeAndAdvance(userAnswer) {
    var session = State.sessions[State.currentDomainId];
    var item = session.currentItem;
    var isMc = item.type === 'mc';
    var isHotspot = item.type === 'hotspot';
    var res = Engine.submitAnswer(session, userAnswer);
    if (!res) return;
    State.answered = true;

    if (isMc) {
      var buttons = document.querySelectorAll('#quiz-answer-area .option-btn');
      buttons.forEach(function (b) {
        var idx = Number(b.getAttribute('data-index'));
        if (idx === userAnswer) b.classList.add(res.correct ? 'selected-correct' : 'selected-wrong');
        if (!res.correct && idx === item.correctIndex) b.classList.add('reveal-correct');
      });
    } else if (isHotspot) {
      // 그림(또는 시계 바늘) 자체가 정답 후보이므로, 클릭된 요소와 정답 요소에 직접 시각 강조를 준다.
      var spots = document.querySelectorAll('#quiz-visual [data-hotspot]');
      spots.forEach(function (s) {
        var idx = Number(s.getAttribute('data-hotspot'));
        if (idx === userAnswer) s.classList.add(res.correct ? 'selected-correct' : 'selected-wrong');
        if (!res.correct && idx === item.correctIndex) s.classList.add('reveal-correct');
      });
    } else {
      $('quiz-numeric-input').disabled = true;
      document.querySelectorAll('#numpad-grid .numpad-key').forEach(function (b) { b.disabled = true; });
    }

    var fb = $('quiz-feedback');
    var quizCard = document.querySelector('.quiz-card');
    fb.style.display = 'block';
    var msg;
    if (res.correct) {
      fb.className = 'feedback-banner correct';
      msg = '정답이에요! 참 잘했어요.';
      quizCard.classList.add('pulse-correct');
      burstStars(6);
      Sound.playCorrect();
    } else {
      fb.className = 'feedback-banner wrong';
      var correctText;
      if (isMc) correctText = item.options[item.correctIndex].text || item.options[item.correctIndex].speak;
      else if (isHotspot) correctText = item.correctLabel || '그림에 초록색으로 표시된 곳';
      else correctText = String(item.correctValue) + (item.suffix || '');
      msg = '괜찮아요, 정답은 ' + correctText + '(이)에요.';
      quizCard.classList.add('shake-wrong');
      Sound.playGentle();
    }
    if (res.promoted && !res.finished) {
      msg += ' 🎉 다음 레벨로 올라가요!';
      setTimeout(function () { Sound.playPromote(); }, 260);
    }
    fb.textContent = msg;

    var cont = document.createElement('button');
    cont.type = 'button';
    cont.className = 'btn';
    cont.style.marginTop = '14px';
    cont.textContent = res.finished ? '결과 보기' : '다음 문제 ▶';
    cont.addEventListener('click', function () {
      cont.remove();
      if (res.finished) completeDomain(); else renderQuizItem();
    });
    fb.parentNode.insertBefore(cont, fb.nextSibling);
  }

  $('btn-skip-item').addEventListener('click', function () {
    if (State.answered) return;
    var session = State.sessions[State.currentDomainId];
    if (!session || session.finished) return;
    var res = Engine.skipItem(session);
    if (res && res.finished) completeDomain(); else renderQuizItem();
  });
  $('btn-skip-level-prev').addEventListener('click', function () {
    var session = State.sessions[State.currentDomainId];
    if (!session || session.finished) return;
    Engine.skipLevel(session, 'prev');
    renderQuizItem();
  });
  $('btn-skip-level-next').addEventListener('click', function () {
    var session = State.sessions[State.currentDomainId];
    if (!session || session.finished) return;
    var res = Engine.skipLevel(session, 'next');
    if (res && res.finished) completeDomain(); else renderQuizItem();
  });
  $('btn-end-now').addEventListener('click', function () {
    var session = State.sessions[State.currentDomainId];
    if (!session || session.finished) return;
    Engine.endNow(session);
    completeDomain();
  });

  /* ---------------- 4. 영역별 결과 ---------------- */
  function completeDomain() {
    var domainId = State.currentDomainId;
    var session = State.sessions[domainId];
    var summary = Engine.summarize(session);
    State.results[domainId] = summary;
    State.badges[domainId] = true;

    var domain = window.Domains[domainId];
    Sync.queueResult({
      학생명: State.student.name,
      날짜: todayStr(),
      영역: domain.name,
      도달레벨: domain.levels[summary.finalLevelIndex].label,
      정답률: Math.round(summary.accuracy * 100) + '%',
      중단사유: stopReasonLabel(summary)
    });

    renderDomainResult(summary);
    showScreen('screen-result-domain');
  }

  function renderDomainResult(summary) {
    var domain = window.Domains[summary.domainId];
    var levelInfo = domain.levels[summary.finalLevelIndex];
    var reachSentence = summary.noData ? '진단을 시작하기 전에 종료되었어요. 사전 기술 관찰이 필요해요.' : levelInfo.description;
    var pct = Math.round(summary.accuracy * 100);
    var color = thresholdColor(pct);

    var stairsHtml = domain.levels.map(function (lvl, idx) {
      var h = 34 + idx * (110 / Math.max(1, domain.levels.length - 1));
      var reached = idx === summary.finalLevelIndex;
      return '<div class="stair-step' + (reached ? ' reached' : '') + '" style="height:' + h + 'px;">' +
        (reached ? '<div class="stair-character">' + starSvg() + '</div>' : '') +
        (idx + 1) +
        '</div>';
    }).join('');

    var card = $('result-domain-card');
    card.innerHTML =
      '<div class="result-header">' +
      '<h2>' + domain.name + ' 결과 ' + Speech.btn(domain.name + ' 결과. ' + reachSentence) + '</h2>' +
      '<span class="badge-pill ' + summary.stopReason + '">' + stopReasonLabel(summary) + '</span>' +
      '</div>' +
      '<div class="staircase">' + stairsHtml + '</div>' +
      '<div class="reach-sentence">' + reachSentence + '</div>' +
      '<div class="gauge-wrap"><div class="gauge-track"><div class="gauge-fill" style="width:' + pct + '%;background:' + color + ';"></div></div><strong>' + pct + '%</strong></div>' +
      '<p style="margin-top:8px;color:var(--ink-soft);font-size:0.9rem;">총 ' + summary.totalAnswered + '문항 중 ' + summary.totalCorrect + '문항 정답</p>';

    Sound.playBadge();
  }

  $('btn-back-to-domains').addEventListener('click', function () { renderDomainSelect(); showScreen('screen-domain-select'); });
  $('btn-to-summary-from-result').addEventListener('click', function () { renderSummary(); showScreen('screen-summary'); });
  $('btn-back-to-domains-2').addEventListener('click', function () { renderDomainSelect(); showScreen('screen-domain-select'); });

  /* ---------------- 5. 전체 요약 ---------------- */
  function domainAttainmentPct(id) {
    var r = State.results[id];
    if (!r) return 0;
    return (r.finalLevelIndex + 1) / r.totalLevels * 100;
  }

  function drawRadar(canvas, axesLabels, values, attempted) {
    var ctx = canvas.getContext('2d');
    var w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    var cx = w / 2, cy = h / 2, radius = Math.min(w, h) / 2 - 56;
    var n = axesLabels.length;

    ctx.strokeStyle = '#e6ddc9';
    ctx.fillStyle = '#7a6f5f';
    ctx.font = '13px sans-serif';
    ctx.textAlign = 'center';

    for (var ring = 1; ring <= 4; ring++) {
      var rr = radius * ring / 4;
      ctx.beginPath();
      for (var i = 0; i <= n; i++) {
        var ang = -Math.PI / 2 + (i % n) * (2 * Math.PI / n);
        var x = cx + Math.cos(ang) * rr, y = cy + Math.sin(ang) * rr;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    for (i = 0; i < n; i++) {
      ang = -Math.PI / 2 + i * (2 * Math.PI / n);
      x = cx + Math.cos(ang) * radius; y = cy + Math.sin(ang) * radius;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(x, y); ctx.stroke();
      var lx = cx + Math.cos(ang) * (radius + 22), ly = cy + Math.sin(ang) * (radius + 22);
      ctx.fillText(axesLabels[i], lx, ly + 4);
    }

    ctx.beginPath();
    for (i = 0; i <= n; i++) {
      ang = -Math.PI / 2 + (i % n) * (2 * Math.PI / n);
      var v = values[i % n] / 100 * radius;
      x = cx + Math.cos(ang) * v; y = cy + Math.sin(ang) * v;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = 'rgba(255, 158, 74, 0.28)';
    ctx.fill();
    ctx.strokeStyle = '#ff9e4a';
    ctx.lineWidth = 2.4;
    ctx.stroke();

    for (i = 0; i < n; i++) {
      ang = -Math.PI / 2 + i * (2 * Math.PI / n);
      v = values[i] / 100 * radius;
      x = cx + Math.cos(ang) * v; y = cy + Math.sin(ang) * v;
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fillStyle = attempted[i] ? thresholdColor(values[i]) : '#c9c9c9';
      ctx.fill();
    }
  }

  function renderSummary() {
    $('summary-title').textContent = State.student.name + ' 학생 — 전체 진단 요약';
    var axes = DOMAIN_ORDER.map(function (id) { return window.Domains[id].shortName; });
    var values = DOMAIN_ORDER.map(domainAttainmentPct);
    var attempted = DOMAIN_ORDER.map(function (id) { return !!State.results[id]; });
    drawRadar($('radar-canvas'), axes, values, attempted);

    var barsHtml = DOMAIN_ORDER.map(function (id) {
      var domain = window.Domains[id];
      var pct = domainAttainmentPct(id);
      var attemptedFlag = !!State.results[id];
      var color = attemptedFlag ? thresholdColor(pct) : '#cfc4a9';
      var pctText = attemptedFlag ? Math.round(pct) + '%' : '미실시';
      return '<div class="summary-bar-row">' +
        '<span class="summary-bar-label">' + domain.shortName + '</span>' +
        '<div class="summary-bar-track"><div class="summary-bar-fill" style="width:' + pct + '%;background:' + color + ';"></div></div>' +
        '<span class="summary-bar-pct">' + pctText + '</span>' +
        '</div>';
    }).join('');
    $('summary-bars').innerHTML = barsHtml;

    var badgesHtml = DOMAIN_ORDER.filter(function (id) { return State.badges[id]; }).map(function (id) {
      var domain = window.Domains[id];
      return '<div style="text-align:center;">' + badgeSvg(domain.color) + '<div style="font-size:0.75rem;">' + domain.shortName + '</div></div>';
    }).join('');
    $('summary-badges').innerHTML = badgesHtml || '<p style="color:var(--ink-soft);">아직 완료한 영역이 없어요.</p>';
  }

  $('btn-print-report').addEventListener('click', function () {
    var summaries = DOMAIN_ORDER.filter(function (id) { return State.results[id]; }).map(function (id) { return State.results[id]; });
    var radarDataUrl = $('radar-canvas').toDataURL('image/png');
    PrintReport.render($('printReportRoot'), {
      studentName: State.student.name,
      date: todayStr(),
      domainSummaries: summaries,
      radarDataUrl: radarDataUrl
    });
    setTimeout(function () { PrintReport.openPrintDialog(); }, 80);
  });

  $('btn-new-student').addEventListener('click', function () {
    State.student = { name: '' };
    State.sessions = {}; State.results = {}; State.badges = {}; State.startLevelChoice = {};
    $('input-student-name').value = '';
    showScreen('screen-profile');
  });

  /* ---------------- 6. 설정 ---------------- */
  $('btn-settings-nav').addEventListener('click', function () {
    var active = document.querySelector('.screen.active');
    if (active) State.previousScreen = active.id;
    $('input-sheets-url').value = Sync.getSettings().sheetsUrl || '';
    updateSyncStatus();
    showScreen('screen-settings');
  });
  $('btn-close-settings').addEventListener('click', function () { showScreen(State.previousScreen || 'screen-profile'); });
  $('btn-save-settings').addEventListener('click', function () {
    Sync.saveSettings({ sheetsUrl: $('input-sheets-url').value.trim() });
    $('sync-status').textContent = '저장되었습니다.';
  });
  $('btn-sync-now').addEventListener('click', function () {
    $('sync-status').textContent = '동기화 중...';
    Sync.trySyncNow().then(function (res) {
      updateSyncStatus(res);
    });
  });
  function updateSyncStatus(res) {
    var queueLen = Sync.getQueue().length;
    if (res) {
      $('sync-status').textContent = '전송 ' + res.sent + '건 / 대기 중 ' + queueLen + '건' + (res.reason === 'no_url' ? ' (URL 미설정)' : '');
    } else {
      $('sync-status').textContent = '대기 중인 결과: ' + queueLen + '건';
    }
  }

  // 앱 시작 시 큐 재전송 시도
  window.addEventListener('load', function () { Sync.trySyncNow(); });
})();
