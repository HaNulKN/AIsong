/* engine.js — 7개 영역이 공유하는 공통 진단 엔진.
   규칙:
   1) 레벨 내 연속 3문항 정답 -> 즉시 다음 레벨로 승급(남은 문항 생략)
   2) 연속 3정답 없이 레벨 문항 소진 -> 정답률 50% 이상이면 승급, 미만이면 그 레벨이 "최종 도달 레벨"
   3) 레벨 경계 무관, 전체 문항 스트림에서 3연속 오답 -> 즉시 해당 영역 진단 종료(정답 시 리셋)
   4) 시작 레벨 지정 가능
   5) 교사용 컨트롤: 문항 건너뛰기(채점 제외) / 레벨 건너뛰기(강제 이동) / 즉시 종료("미도달")
*/
(function (global) {
  'use strict';

  function createSession(domain, opts) {
    opts = opts || {};
    var startLevelIndex = opts.startLevelIndex || 0;
    if (startLevelIndex < 0) startLevelIndex = 0;
    if (startLevelIndex >= domain.levels.length) startLevelIndex = domain.levels.length - 1;
    return {
      domain: domain,
      levelIndex: startLevelIndex,
      startLevelIndex: startLevelIndex,
      currentItem: null,
      consecCorrect: 0,
      consecWrongGlobal: 0,
      correctInLevel: 0,
      answeredInLevel: 0,
      presentedInLevel: 0,
      allAnswered: 0,
      allCorrect: 0,
      levelResults: [],
      finished: false,
      stopReason: null,
      noData: false,
      log: [],
      startedAt: new Date().toISOString()
    };
  }

  function currentLevel(session) {
    return session.domain.levels[session.levelIndex];
  }

  function gradeItem(item, userAnswer) {
    if (item.type === 'mc') return userAnswer === item.correctIndex;
    if (item.type === 'input') return Number(userAnswer) === Number(item.correctValue);
    return false;
  }

  function nextItem(session) {
    if (session.finished) return null;
    if (session.currentItem) return session.currentItem;
    var level = currentLevel(session);
    var item = level.generateItem(session.presentedInLevel);
    item._levelIndex = session.levelIndex;
    session.currentItem = item;
    session.presentedInLevel++;
    return item;
  }

  function finalizeLevel(session, promotedBy) {
    var level = currentLevel(session);
    var rate = session.answeredInLevel > 0 ? session.correctInLevel / session.answeredInLevel : 0;
    session.levelResults.push({
      levelIndex: session.levelIndex,
      levelId: level.id,
      label: level.label,
      description: level.description,
      correctCount: session.correctInLevel,
      answeredCount: session.answeredInLevel,
      presentedCount: session.presentedInLevel,
      rate: rate,
      promotedBy: promotedBy // 'streak' | 'rate' | 'teacher_skip' | 'teacher_stop' | 'exhausted_fail'
    });
  }

  function resetLevelCounters(session) {
    session.correctInLevel = 0;
    session.answeredInLevel = 0;
    session.presentedInLevel = 0;
    session.consecCorrect = 0;
    session.currentItem = null;
  }

  function finishDomain(session, stopReason) {
    session.finished = true;
    session.stopReason = stopReason;
    if (session.allAnswered === 0) session.noData = true;
  }

  function promoteOrEnd(session, promotedBy) {
    finalizeLevel(session, promotedBy);
    if (session.levelIndex >= session.domain.levels.length - 1) {
      finishDomain(session, 'completed');
      return;
    }
    session.levelIndex++;
    resetLevelCounters(session);
  }

  // 교사/학생이 답을 제출
  function submitAnswer(session, userAnswer) {
    if (session.finished || !session.currentItem) return null;
    var item = session.currentItem;
    var correct = gradeItem(item, userAnswer);
    session.log.push({ levelIndex: session.levelIndex, item: item, userAnswer: userAnswer, correct: correct, skipped: false });
    session.answeredInLevel++;
    session.allAnswered++;
    if (correct) {
      session.correctInLevel++;
      session.allCorrect++;
      session.consecCorrect++;
      session.consecWrongGlobal = 0;
    } else {
      session.consecCorrect = 0;
      session.consecWrongGlobal++;
    }
    session.currentItem = null;

    var result = { correct: correct, promoted: false, finished: false, stopReason: null };

    // 규칙 3: 전역 3연속 오답 -> 즉시 종료(레벨 경계 무관)
    if (session.consecWrongGlobal >= 3) {
      finalizeLevel(session, 'wrong_streak_end');
      finishDomain(session, 'wrong_streak');
      result.finished = true;
      result.stopReason = 'wrong_streak';
      return result;
    }

    var level = currentLevel(session);
    if (session.consecCorrect >= 3) {
      // 규칙 1: 연속 3정답 -> 즉시 승급
      promoteOrEnd(session, 'streak');
      result.promoted = true;
      if (session.finished) { result.finished = true; result.stopReason = session.stopReason; }
      return result;
    }

    if (session.presentedInLevel >= level.maxItems) {
      // 규칙 2: 레벨 소진 -> 정답률 50% 기준 판정
      var rate = session.answeredInLevel > 0 ? session.correctInLevel / session.answeredInLevel : 0;
      if (rate >= 0.5) {
        promoteOrEnd(session, 'rate');
        result.promoted = true;
      } else {
        finalizeLevel(session, 'exhausted_fail');
        finishDomain(session, 'completed');
        result.finished = true;
        result.stopReason = 'completed';
      }
      if (session.finished) { result.finished = true; result.stopReason = session.stopReason; }
      return result;
    }

    return result;
  }

  // 교사용: 현재 문항 건너뛰기(채점 제외, 문항 예산은 소모)
  function skipItem(session) {
    if (session.finished || !session.currentItem) return null;
    session.log.push({ levelIndex: session.levelIndex, item: session.currentItem, userAnswer: null, correct: null, skipped: true });
    session.currentItem = null;
    var level = currentLevel(session);
    var result = { finished: false, stopReason: null };
    if (session.presentedInLevel >= level.maxItems) {
      var rate = session.answeredInLevel > 0 ? session.correctInLevel / session.answeredInLevel : 0;
      if (rate >= 0.5 && session.answeredInLevel > 0) {
        promoteOrEnd(session, 'rate');
      } else {
        finalizeLevel(session, session.answeredInLevel > 0 ? 'exhausted_fail' : 'teacher_skip');
        finishDomain(session, 'completed');
      }
      if (session.finished) { result.finished = true; result.stopReason = session.stopReason; }
    }
    return result;
  }

  // 교사용: 레벨 강제 이동
  function skipLevel(session, direction) {
    if (session.finished) return null;
    finalizeLevel(session, 'teacher_skip');
    if (direction === 'prev') {
      if (session.levelIndex <= 0) {
        resetLevelCounters(session);
        session.levelResults.pop(); // 이동 불가 시 되돌림
        return { finished: false, stopReason: null };
      }
      session.levelIndex--;
    } else {
      if (session.levelIndex >= session.domain.levels.length - 1) {
        finishDomain(session, 'completed');
        return { finished: true, stopReason: 'completed' };
      }
      session.levelIndex++;
    }
    resetLevelCounters(session);
    return { finished: false, stopReason: null };
  }

  // 교사용: 즉시 종료 ("미도달" 판정 가능)
  function endNow(session) {
    if (session.finished) return null;
    finalizeLevel(session, 'teacher_stop');
    finishDomain(session, 'teacher_stopped');
    return { finished: true, stopReason: 'teacher_stopped' };
  }

  function summarize(session) {
    var last = session.levelResults[session.levelResults.length - 1];
    var finalLevelIndex = last ? last.levelIndex : session.levelIndex;
    var accuracy = session.allAnswered > 0 ? session.allCorrect / session.allAnswered : 0;
    return {
      domainId: session.domain.id,
      domainName: session.domain.name,
      startLevelIndex: session.startLevelIndex,
      finalLevelIndex: finalLevelIndex,
      totalLevels: session.domain.levels.length,
      stopReason: session.stopReason,
      noData: session.noData,
      totalCorrect: session.allCorrect,
      totalAnswered: session.allAnswered,
      accuracy: accuracy,
      levelResults: session.levelResults,
      finishedAt: new Date().toISOString()
    };
  }

  global.Engine = {
    createSession: createSession,
    currentLevel: currentLevel,
    nextItem: nextItem,
    submitAnswer: submitAnswer,
    skipItem: skipItem,
    skipLevel: skipLevel,
    endNow: endNow,
    summarize: summarize
  };
})(window);
