/* icons.js — 모든 영역이 공유하는 인라인 SVG 아이콘 라이브러리.
   외부 이미지 파일을 전혀 쓰지 않고, 문항에 필요한 그림단서를 코드로 직접 그린다.
   - "조각(fragment)" 아이콘: <g> 조각을 반환. 대략 -20..20 범위(40x40)를 기준으로 그려져
     buildScene()의 translate(x,y) 배치와 맞물려 쓰인다.
   - "장면(scene)" 아이콘: 완성된 <svg> 문자열 전체를 반환한다(문항의 최종 그림단서). */
(function (global) {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';

  // ---------------- 조각 아이콘 (fragment, <g>) ----------------
  var Frag = {
    apple: function () {
      return '<g>' +
        '<path d="M -1 -9 Q 1 -16 6 -13" stroke="#7a4a26" stroke-width="2.4" fill="none" stroke-linecap="round"/>' +
        '<ellipse cx="7" cy="-13" rx="6" ry="3.2" fill="#5bb35b" transform="rotate(-25 7 -13)"/>' +
        '<circle cx="0" cy="4" r="15" fill="#eb4b3f" stroke="#c23327" stroke-width="1.6"/>' +
        '<ellipse cx="-5" cy="-1" rx="4" ry="6" fill="#ffffff" opacity="0.35"/>' +
        '</g>';
    },
    marble: function (color) {
      color = color || '#4a90d9';
      return '<g>' +
        '<circle cx="0" cy="0" r="14" fill="' + color + '" stroke="rgba(0,0,0,0.2)" stroke-width="1.5"/>' +
        '<ellipse cx="-4.5" cy="-5" rx="4" ry="2.5" fill="#ffffff" opacity="0.55"/>' +
        '</g>';
    },
    star: function (filled) {
      var fill = filled === false ? '#e6e6e6' : '#ffc93c';
      var stroke = filled === false ? '#c9c9c9' : '#e0a300';
      return '<g><path d="M0,-16 L4.5,-5.5 16,-4.7 7.2,2.6 9.9,14 0,7.5 -9.9,14 -7.2,2.6 -16,-4.7 -4.5,-5.5 Z" ' +
        'fill="' + fill + '" stroke="' + stroke + '" stroke-width="1.4" stroke-linejoin="round"/></g>';
    },
    unitSquare: function (color) {
      color = color || '#5aa9e6';
      return '<g><rect x="-7" y="-7" width="14" height="14" rx="2.5" fill="' + color + '" stroke="#2f6fa3" stroke-width="1.3"/></g>';
    },
    banana: function () {
      return '<g>' +
        '<path d="M -12 10 Q -14 -8 4 -14 Q 12 -16 14 -11 Q 8 -12 3 -8 Q -8 -2 -9 12 Z" ' +
        'fill="#f6d743" stroke="#c9a416" stroke-width="1.4"/>' +
        '<path d="M 12 -12 Q 15 -13 15 -9" stroke="#8a6d1a" stroke-width="1.6" fill="none" stroke-linecap="round"/>' +
        '</g>';
    },
    candy: function () {
      return '<g>' +
        '<circle cx="0" cy="0" r="10" fill="#ff7aa8" stroke="#d94f81" stroke-width="1.4"/>' +
        '<path d="M -18 -6 L -10 0 L -18 6 Z" fill="#ff7aa8" stroke="#d94f81" stroke-width="1.2"/>' +
        '<path d="M 18 -6 L 10 0 L 18 6 Z" fill="#ff7aa8" stroke="#d94f81" stroke-width="1.2"/>' +
        '</g>';
    },
    coin: function (value) {
      var label = value >= 1000 ? Math.round(value / 1000) + 'k' : String(value);
      var body = value >= 500 ? '#e8c257' : '#c9ccd1';
      var edge = value >= 500 ? '#a9822c' : '#8b8f96';
      return '<g><circle cx="0" cy="0" r="17" fill="' + body + '" stroke="' + edge + '" stroke-width="2.4"/>' +
        '<circle cx="0" cy="0" r="12.5" fill="none" stroke="' + edge + '" stroke-width="1.1" opacity="0.6"/>' +
        '<text x="0" y="4.5" text-anchor="middle" font-size="9.5" font-weight="700" fill="' + edge + '">' + value + '</text>' +
        '</g>';
    },
    bill: function (value) {
      var palette = { 1000: '#8fb9e8', 5000: '#e89aa8', 10000: '#8fd0a0' };
      var color = palette[value] || '#c9c9c9';
      var dark = { 1000: '#2f5f95', 5000: '#a6415a', 10000: '#2f7d4c' }[value] || '#666';
      return '<g><rect x="-27" y="-15" width="54" height="30" rx="3.5" fill="' + color + '" stroke="' + dark + '" stroke-width="2"/>' +
        '<rect x="-22" y="-10" width="44" height="20" rx="2" fill="none" stroke="' + dark + '" stroke-width="1" stroke-dasharray="2 2" opacity="0.7"/>' +
        '<circle cx="9" cy="0" r="6.5" fill="#fff" opacity="0.55"/>' +
        '<text x="-3" y="4.5" text-anchor="middle" font-size="8.5" font-weight="700" fill="' + dark + '">' + value + '</text>' +
        '</g>';
    },
    badge: function (color) {
      color = color || '#f0a63a';
      return '<g><circle cx="0" cy="-2" r="16" fill="' + color + '" stroke="#00000022" stroke-width="1.5"/>' +
        '<path d="M -13 10 L -8 26 0 20 8 26 13 10 Z" fill="' + color + '"/>' +
        '<circle cx="0" cy="-2" r="10.5" fill="#fff8ec" />' +
        '<path d="M0,-9 L2.6,-3 9,-2.4 4.2,1.7 5.6,8 0,4.4 -5.6,8 -4.2,1.7 -9,-2.4 -2.6,-3 Z" fill="' + color + '"/>' +
        '</g>';
    }
  };

  // ---------------- 장면 배치 헬퍼 ----------------
  function layoutGrid(count, opts) {
    opts = opts || {};
    var cols = opts.cols || Math.min(5, count) || 1;
    var spacingX = opts.spacingX || 42;
    var spacingY = opts.spacingY || 42;
    var startX = opts.startX !== undefined ? opts.startX : 0;
    var startY = opts.startY !== undefined ? opts.startY : 0;
    var pts = [];
    for (var i = 0; i < count; i++) {
      var col = i % cols;
      var row = Math.floor(i / cols);
      pts.push({ x: startX + col * spacingX, y: startY + row * spacingY });
    }
    return pts;
  }

  function layoutScatter(count, opts) {
    opts = opts || {};
    var w = opts.width || 260;
    var h = opts.height || 160;
    var pts = [];
    for (var i = 0; i < count; i++) {
      pts.push({
        x: Utils.randInt(24, Math.max(25, w - 24)),
        y: Utils.randInt(24, Math.max(25, h - 24)),
        rotate: Utils.randInt(-25, 25),
        scale: 0.85 + Math.random() * 0.4
      });
    }
    return pts;
  }

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function buildScene(elements, opts) {
    opts = opts || {};
    var w = opts.width || 300;
    var h = opts.height || 200;
    var inner = elements.map(function (el) {
      var fragFn = typeof el.icon === 'function' ? el.icon : Frag[el.icon];
      var g = fragFn ? fragFn(el.extra) : '';
      var scale = el.scale || 1;
      var rot = el.rotate || 0;
      var extraAttrs = el.dim ? ' opacity="0.4"' : '';
      return '<g transform="translate(' + el.x + ',' + el.y + ') rotate(' + rot + ') scale(' + scale + ')"' + extraAttrs + '>' + g + '</g>';
    }).join('');
    var mark = '';
    if (opts.crosses) {
      mark = opts.crosses.map(function (el) {
        return '<g transform="translate(' + el.x + ',' + el.y + ')">' +
          '<line x1="-13" y1="-13" x2="13" y2="13" stroke="#e05252" stroke-width="4" stroke-linecap="round"/>' +
          '<line x1="13" y1="-13" x2="-13" y2="13" stroke="#e05252" stroke-width="4" stroke-linecap="round"/>' +
          '</g>';
      }).join('');
    }
    return '<svg viewBox="0 0 ' + w + ' ' + h + '" width="100%" height="' + h + '" ' +
      'xmlns="' + NS + '" role="img" aria-label="' + esc(opts.label || '') + '" preserveAspectRatio="xMidYMid meet">' +
      (opts.bg || '') + inner + mark + '</svg>';
  }

  // count개의 동일 아이콘을 격자로 배치한 완성 장면
  function renderCountGroup(iconName, count, opts) {
    opts = opts || {};
    var cols = opts.cols || Math.min(5, count) || 1;
    var w = opts.width || (cols * 46 + 20);
    var rows = Math.ceil(count / cols);
    var h = opts.height || (rows * 46 + 20);
    var pts = layoutGrid(count, { cols: cols, spacingX: 46, spacingY: 46, startX: 30, startY: 30 });
    var elements = pts.map(function (p, i) {
      return { icon: iconName, x: p.x, y: p.y, scale: opts.scale || 1, extra: opts.extra };
    });
    return buildScene(elements, { width: w, height: h, label: opts.label || (count + '개') });
  }

  // 두 묶음(비교용) 나란히 배치
  function renderTwoGroups(iconName, countA, countB, opts) {
    opts = opts || {};
    var cols = Math.min(5, Math.max(countA, countB, 1));
    var colW = cols * 46 + 20;
    var rowsA = Math.ceil(countA / cols) || 1;
    var rowsB = Math.ceil(countB / cols) || 1;
    var h = Math.max(rowsA, rowsB) * 46 + 46;
    var w = colW * 2 + 20;
    var ptsA = layoutGrid(countA, { cols: cols, spacingX: 46, spacingY: 46, startX: 30, startY: 30 });
    var ptsB = layoutGrid(countB, { cols: cols, spacingX: 46, spacingY: 46, startX: colW + 30, startY: 30 });
    var elements = ptsA.map(function (p) { return { icon: iconName, x: p.x, y: p.y, extra: opts.extraA }; })
      .concat(ptsB.map(function (p) { return { icon: iconName, x: p.x, y: p.y, extra: opts.extraB || opts.extraA }; }));
    var divider = '<line x1="' + colW + '" y1="10" x2="' + colW + '" y2="' + (h - 10) + '" stroke="#d8d8d8" stroke-width="2" stroke-dasharray="6 6"/>';
    return buildScene(elements, { width: w, height: h, bg: divider, label: '두 묶음 비교' });
  }

  // 두 묶음을 "+" 기호로 합치는 장면 (덧셈용)
  // A그룹과 B그룹은 서로 다른 개수를 가질 수 있으므로 각자 자신의 실제 개수 기준으로 독립적으로
  // 배치한다(공통 cols를 max(countA,countB)로 잡으면, 개수가 적은 쪽의 실제 그림 너비가 그 공통
  // 너비보다 훨씬 좁아져서 "+" 기호가 반대쪽 그림과 겹치는 문제가 생긴다).
  function renderCombineGroups(iconName, countA, countB, opts) {
    opts = opts || {};
    var colsA = Math.min(5, Math.max(countA, 1));
    var colsB = Math.min(5, Math.max(countB, 1));
    var rowsA = Math.ceil(countA / colsA) || 1;
    var rowsB = Math.ceil(countB / colsB) || 1;
    var h = Math.max(rowsA, rowsB) * 46 + 46;
    var startXA = 30;
    var widthA = colsA * 46 + 20; // A그룹이 실제로 차지하는 너비(아이콘 반지름 여유 포함)
    var widthB = colsB * 46 + 20;
    var gap = 70; // "+" 기호가 들어갈 고정 간격 — A그룹의 실제 끝과 B그룹 시작 사이
    var startXB = startXA + widthA + gap;
    var w = startXB + widthB - 20;
    var ptsA = layoutGrid(countA, { cols: colsA, spacingX: 46, spacingY: 46, startX: startXA, startY: 30 });
    var ptsB = layoutGrid(countB, { cols: colsB, spacingX: 46, spacingY: 46, startX: startXB, startY: 30 });
    var elements = ptsA.map(function (p) { return { icon: iconName, x: p.x, y: p.y, extra: opts.extraA }; })
      .concat(ptsB.map(function (p) { return { icon: iconName, x: p.x, y: p.y, extra: opts.extraB || opts.extraA }; }));
    var plusX = startXA + widthA + gap / 2; // A그룹 실제 너비와 B그룹 시작 사이의 정중앙
    var plus = '<text x="' + plusX + '" y="' + (h / 2 + 10) + '" text-anchor="middle" font-size="34" font-weight="700" fill="#e0a63a">+</text>';
    return buildScene(elements, { width: w, height: h, bg: plus, label: countA + '개 더하기 ' + countB + '개' });
  }

  // 전체 중 일부를 지워서(X표) 덜어내는 장면 (뺄셈용)
  function renderRemoveGroup(iconName, total, removeCount, opts) {
    opts = opts || {};
    var cols = Math.min(5, total) || 1;
    var w = cols * 46 + 20;
    var rows = Math.ceil(total / cols);
    var h = rows * 46 + 20;
    var pts = layoutGrid(total, { cols: cols, spacingX: 46, spacingY: 46, startX: 30, startY: 30 });
    var elements = pts.map(function (p) { return { icon: iconName, x: p.x, y: p.y, extra: opts.extra }; });
    var crosses = pts.slice(total - removeCount).map(function (p) { return { x: p.x, y: p.y }; });
    return buildScene(elements, { width: w, height: h, crosses: crosses, label: total + '개 중 ' + removeCount + '개 덜어내기' });
  }

  // 흩어놓거나 겹쳐놓은 복잡한 배열(수감각 L4)
  function renderScatterGroup(iconName, count, opts) {
    opts = opts || {};
    var w = opts.width || 260;
    var h = opts.height || 170;
    var pts = layoutScatter(count, { width: w, height: h });
    var elements = pts.map(function (p) {
      return { icon: iconName, x: p.x, y: p.y, rotate: p.rotate, scale: p.scale, extra: opts.extra };
    });
    return buildScene(elements, { width: w, height: h, label: count + '개(흩어짐)' });
  }

  // 10개씩 묶음 + 낱개로 수를 표현 (수세기/덧셈/뺄셈 자릿값)
  function renderBundles(tens, ones, opts) {
    opts = opts || {};
    var iconName = opts.icon || 'unitSquare';
    var color = opts.color || '#5aa9e6';
    var bundleColor = opts.bundleColor || '#f4a53a';
    var els = [];
    var bg = [];
    var cursorX = 30, y = 34;
    var perRowBundles = 5;
    for (var t = 0; t < tens; t++) {
      var bx = cursorX + (t % perRowBundles) * 54;
      var by = y + Math.floor(t / perRowBundles) * 150;
      bg.push('<rect x="' + (bx - 20) + '" y="' + (by - 24) + '" width="40" height="118" rx="8" fill="none" stroke="' + bundleColor + '" stroke-width="2.4"/>');
      for (var u = 0; u < 10; u++) {
        els.push({ icon: iconName, x: bx, y: by - 12 + u * 12.4, scale: 0.42, extra: color });
      }
    }
    var bundleRows = Math.ceil(tens / perRowBundles) || (tens > 0 ? 1 : 0);
    var onesStartX = cursorX + Math.min(tens, perRowBundles) * 54 + 10;
    var onesY = y;
    if (tens > 0 && bundleRows > 1) { onesStartX = cursorX; onesY = y + bundleRows * 150; }
    var onesRows = ones > 0 ? Math.ceil(ones / 5) : 0;
    var onesPts = layoutGrid(ones, { cols: 5, spacingX: 34, spacingY: 34, startX: onesStartX, startY: onesY });
    onesPts.forEach(function (p) { els.push({ icon: iconName, x: p.x, y: p.y, scale: 0.8, extra: color }); });
    var w = Math.max(onesStartX + 60, cursorX + Math.min(tens, perRowBundles) * 54 + 40);
    // 실제로 그려지는 내용의 최대 y좌표를 기준으로 높이를 계산한다(빈 여백 예약 금지).
    // 묶음 사각형: top = by-24, height = 118 -> 실제 바닥 = by+94 (마지막 줄 기준)
    var bundleBottom = tens > 0 ? (y + (bundleRows - 1) * 150 + 94) : y;
    // 낱개 아이콘: scale 0.8 기준 반지름 여유 + 여백
    var onesBottom = onesRows > 0 ? (onesY + (onesRows - 1) * 34 + 14) : onesY;
    var h = Math.max(90, bundleBottom, onesBottom) + 24;
    return buildScene(els, { width: w, height: h, bg: bg.join(''), label: tens + '묶음 ' + ones + '개' });
  }

  // 100판 + 10묶음 + 낱개 (수세기 L5/L6)
  function renderPlaceValueScene(hundreds, tens, ones, opts) {
    opts = opts || {};
    var els = [];
    var bg = [];
    var x = 26, y = 26;
    for (var h100 = 0; h100 < hundreds; h100++) {
      var fx = x + (h100 % 3) * 132;
      var fy = y + Math.floor(h100 / 3) * 132;
      bg.push('<rect x="' + fx + '" y="' + fy + '" width="112" height="112" rx="6" fill="#fdf3e0" stroke="#e0a63a" stroke-width="2.4"/>');
      for (var r = 0; r < 10; r++) {
        for (var c = 0; c < 10; c++) {
          bg.push('<rect x="' + (fx + 3 + c * 10.9) + '" y="' + (fy + 3 + r * 10.9) + '" width="9.4" height="9.4" fill="#f7d68f" stroke="#e0a63a" stroke-width="0.4"/>');
        }
      }
    }
    var hundredRows = Math.ceil(hundreds / 3) || 0;
    var afterHundredsY = hundreds > 0 ? y + hundredRows * 132 : y;
    var afterHundredsX = hundreds > 0 && hundredRows === 1 ? x + Math.min(hundreds, 3) * 132 : x;
    var tensY = hundreds > 0 && hundredRows > 1 ? afterHundredsY : y;
    var tensX = hundreds > 0 && hundredRows === 1 ? afterHundredsX : x;
    var perRowBundles = 5;
    for (var t = 0; t < tens; t++) {
      var bx = tensX + 20 + (t % perRowBundles) * 40;
      var by = tensY + 20 + Math.floor(t / perRowBundles) * 118;
      bg.push('<rect x="' + (bx - 15) + '" y="' + (by - 14) + '" width="30" height="98" rx="6" fill="none" stroke="#4a90d9" stroke-width="2.2"/>');
      for (var u = 0; u < 10; u++) {
        els.push({ icon: 'unitSquare', x: bx, y: by - 4 + u * 9.6, scale: 0.34, extra: '#4a90d9' });
      }
    }
    var tensRows = Math.ceil(tens / perRowBundles) || 0;
    var onesY = tens > 0 ? tensY + 20 + tensRows * 118 : (hundreds > 0 ? tensY + 20 : y);
    var onesX = tensX;
    if (tens === 0 && hundreds === 0) { onesY = y; onesX = x; }
    var onesPts = layoutGrid(ones, { cols: 5, spacingX: 32, spacingY: 32, startX: onesX + 16, startY: onesY + 16 });
    onesPts.forEach(function (p) { els.push({ icon: 'unitSquare', x: p.x, y: p.y, scale: 0.75, extra: '#7bc17b' }); });
    var w = Math.max(360, (hundreds > 0 ? Math.min(hundreds, 3) * 132 + 50 : 0), onesX + 200);
    var h = Math.max(160, onesY + 70);
    return buildScene(els, { width: w, height: h, bg: bg.join(''), label: hundreds + '백 ' + tens + '십 ' + ones });
  }

  // 십 프레임(ten-frame): a색 dot aCount개 -> 프레임 채우고 남으면 b색으로 이어채움 -> 넘치면 아래 여분줄
  function renderTenFrame(opts) {
    opts = opts || {};
    var aCount = opts.aCount || 0;
    var bCount = opts.bCount || 0;
    var colorA = opts.colorA || '#4a90d9';
    var colorB = opts.colorB || '#eb824b';
    var removeCount = opts.removeCount || 0;
    var cellW = 44, cellH = 44, ox = 24, oy = 24;
    var bg = [];
    // 2행 5열 프레임
    for (var r = 0; r < 2; r++) {
      for (var c = 0; c < 5; c++) {
        bg.push('<rect x="' + (ox + c * cellW) + '" y="' + (oy + r * cellH) + '" width="' + (cellW - 4) + '" height="' + (cellH - 4) + '" rx="6" fill="#ffffff" stroke="#b8c4d0" stroke-width="2.2"/>');
      }
    }
    // 채우는 순서: 위 줄 왼->오, 아래 줄 왼->오 (표준 ten-frame 순서)
    var order = [];
    for (var i = 0; i < 10; i++) {
      var rr = Math.floor(i / 5), cc = i % 5;
      order.push({ x: ox + cc * cellW + (cellW - 4) / 2, y: oy + rr * cellH + (cellH - 4) / 2 });
    }
    var total = aCount + bCount;
    var els = [];
    var overflow = [];
    var filledSlots = []; // {x,y,color,isOverflow}
    for (var k = 0; k < total; k++) {
      var color = k < aCount ? colorA : colorB;
      if (k < 10) {
        filledSlots.push({ x: order[k].x, y: order[k].y, color: color, isOverflow: false });
      } else {
        var ov = k - 10;
        filledSlots.push({ x: ox + (ov % 5) * cellW + (cellW - 4) / 2, y: oy + 2 * cellH + 14 + Math.floor(ov / 5) * cellW, color: color, isOverflow: true });
      }
    }
    filledSlots.forEach(function (s) {
      els.push({ icon: 'marble', x: s.x, y: s.y, scale: 0.7, extra: s.color });
    });
    var crosses = [];
    if (removeCount > 0) {
      // 제거 순서: 여분(overflow) 먼저, 그 다음 프레임 뒤에서부터
      var overflowSlots = filledSlots.filter(function (s) { return s.isOverflow; });
      var frameSlots = filledSlots.filter(function (s) { return !s.isOverflow; });
      var removalOrder = overflowSlots.concat(frameSlots.slice().reverse());
      removalOrder.slice(0, removeCount).forEach(function (s) {
        crosses.push({ x: s.x, y: s.y });
      });
    }
    var maxOverflowRows = Math.ceil(Math.max(0, total - 10) / 5);
    var h = oy + 2 * cellH + 14 + maxOverflowRows * cellW + 10;
    var w = ox + 5 * cellW + 20;
    return buildScene(els, { width: w, height: Math.max(h, 140), bg: bg.join(''), crosses: crosses, label: '십 프레임' });
  }

  // 배열(array) — 곱셈용, rows x cols 그리드 + 행 구분선
  function renderArray(rows, cols, iconName, opts) {
    opts = opts || {};
    var spacing = opts.spacing || 40;
    var ox = 26, oy = 26;
    var els = [];
    var bg = [];
    for (var r = 0; r < rows; r++) {
      bg.push('<rect x="' + (ox - 14) + '" y="' + (oy + r * spacing - 14) + '" width="' + (cols * spacing + 4) + '" height="' + (spacing - 8) + '" rx="8" fill="' + (r % 2 === 0 ? '#f3f7fc' : '#ffffff') + '" stroke="#dbe6f0" stroke-width="1.4"/>');
      for (var c = 0; c < cols; c++) {
        els.push({ icon: iconName, x: ox + c * spacing, y: oy + r * spacing, scale: 0.75, extra: opts.extra });
      }
    }
    var w = ox + cols * spacing + 16;
    var h = oy + rows * spacing + 16;
    return buildScene(els, { width: w, height: h, bg: bg.join(''), label: rows + '줄 ' + cols + '개씩' });
  }

  // 낱개 아이콘 하나만 크게 (화폐 매칭/인식용)
  function renderSingleIcon(iconName, value, opts) {
    opts = opts || {};
    var w = opts.width || 90, h = opts.height || 90;
    return buildScene([{ icon: iconName, x: w / 2, y: h / 2, scale: opts.scale || 1.9, extra: value }], { width: w, height: h, label: opts.label || String(value) });
  }

  // 아날로그 시계
  // opts.hotspot: true면 시침/분침 각각을 data-hotspot(0=시침, 1=분침)이 달린 탭 가능 영역으로 만든다.
  // 실제 바늘(가는 선)은 손가락으로 짚기 어려우므로, 눈에는 안 보이지만 훨씬 두꺼운 히트라인을 겹쳐
  // pointer-events로 받고, 정답/오답 시 바늘 끝에 원(hotspot-tip)이 나타나 시각 강조를 준다.
  function renderClock(hour, minute, opts) {
    opts = opts || {};
    var w = 220, h = 220, cx = 110, cy = 110, r = 92;
    var colorHour = opts.hourColor || '#e05a3c';
    var colorMinute = opts.minuteColor || '#3c6fe0';
    var hideNumbers = !!opts.hideNumbers;
    var hotspot = !!opts.hotspot;
    var bg = [];
    bg.push('<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="#fffdf7" stroke="#3a3a3a" stroke-width="4"/>');
    for (var i = 0; i < 60; i++) {
      var ang = (i / 60) * Math.PI * 2;
      var isHourTick = i % 5 === 0;
      var rOuter = r - 6;
      var rInner = isHourTick ? r - 16 : r - 10;
      var x1 = cx + Math.sin(ang) * rOuter, y1 = cy - Math.cos(ang) * rOuter;
      var x2 = cx + Math.sin(ang) * rInner, y2 = cy - Math.cos(ang) * rInner;
      bg.push('<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="#3a3a3a" stroke-width="' + (isHourTick ? 3 : 1.4) + '"/>');
    }
    if (!hideNumbers) {
      for (var n = 1; n <= 12; n++) {
        var nAng = (n / 12) * Math.PI * 2;
        var nx = cx + Math.sin(nAng) * (r - 30), ny = cy - Math.cos(nAng) * (r - 30) + 6;
        bg.push('<text x="' + nx + '" y="' + ny + '" text-anchor="middle" font-size="18" font-weight="700" fill="#333">' + n + '</text>');
      }
    }
    var minuteAngle = (minute / 60) * 360;
    var hourAngle = ((hour % 12) / 12) * 360 + (minute / 60) * 30;
    var minuteLen = r - 26, hourLen = r - 50;
    var minEls, hourEls;
    if (hotspot) {
      hourEls = '<g class="hotspot" data-hotspot="0" tabindex="0" role="button" aria-label="짧은 바늘(시침)" ' +
        'transform="rotate(' + hourAngle + ' ' + cx + ' ' + cy + ')">' +
        '<line class="hotspot-hit" x1="' + cx + '" y1="' + cy + '" x2="' + cx + '" y2="' + (cy - hourLen) + '" stroke="#000" stroke-opacity="0.001" stroke-width="26" stroke-linecap="round" pointer-events="stroke"/>' +
        '<line x1="' + cx + '" y1="' + cy + '" x2="' + cx + '" y2="' + (cy - hourLen) + '" stroke="' + colorHour + '" stroke-width="7" stroke-linecap="round"/>' +
        '<circle class="hotspot-tip" cx="' + cx + '" cy="' + (cy - hourLen) + '" r="11"/>' +
        '</g>';
      minEls = '<g class="hotspot" data-hotspot="1" tabindex="0" role="button" aria-label="긴 바늘(분침)" ' +
        'transform="rotate(' + minuteAngle + ' ' + cx + ' ' + cy + ')">' +
        '<line class="hotspot-hit" x1="' + cx + '" y1="' + cy + '" x2="' + cx + '" y2="' + (cy - minuteLen) + '" stroke="#000" stroke-opacity="0.001" stroke-width="26" stroke-linecap="round" pointer-events="stroke"/>' +
        '<line x1="' + cx + '" y1="' + cy + '" x2="' + cx + '" y2="' + (cy - minuteLen) + '" stroke="' + colorMinute + '" stroke-width="5" stroke-linecap="round"/>' +
        '<circle class="hotspot-tip" cx="' + cx + '" cy="' + (cy - minuteLen) + '" r="11"/>' +
        '</g>';
    } else {
      minEls = '<g transform="rotate(' + minuteAngle + ' ' + cx + ' ' + cy + ')">' +
        '<line x1="' + cx + '" y1="' + cy + '" x2="' + cx + '" y2="' + (cy - minuteLen) + '" stroke="' + colorMinute + '" stroke-width="5" stroke-linecap="round"/></g>';
      hourEls = '<g transform="rotate(' + hourAngle + ' ' + cx + ' ' + cy + ')">' +
        '<line x1="' + cx + '" y1="' + cy + '" x2="' + cx + '" y2="' + (cy - hourLen) + '" stroke="' + colorHour + '" stroke-width="7" stroke-linecap="round"/></g>';
    }
    var pin = '<circle cx="' + cx + '" cy="' + cy + '" r="7" fill="#3a3a3a"/>';
    return '<svg viewBox="0 0 ' + w + ' ' + h + '" width="100%" height="220" xmlns="' + NS + '" role="img" aria-label="시계 그림">' +
      bg.join('') + hourEls + minEls + pin + '</svg>';
  }

  // 식품 진열대(화폐 실전 문항)
  function renderShelf(items, highlightIndex) {
    // items: [{icon, value, label}]
    var slotW = 110, h = 170, ox = 20, oy = 30;
    var els = [];
    var bg = ['<rect x="4" y="' + (oy + 78) + '" width="' + (items.length * slotW + 20) + '" height="10" rx="3" fill="#c8a06a"/>'];
    items.forEach(function (item, i) {
      var cx = ox + i * slotW + slotW / 2 - 10;
      els.push({ icon: item.icon, x: cx, y: oy + 30, scale: 1.5, extra: item.value });
      var tagY = oy + 78;
      var highlighted = highlightIndex === i;
      bg.push('<rect x="' + (cx - 34) + '" y="' + tagY + '" width="68" height="26" rx="5" ' +
        'fill="' + (highlighted ? '#fff3c4' : '#ffffff') + '" stroke="' + (highlighted ? '#e0a63a' : '#c9c9c9') + '" stroke-width="' + (highlighted ? 2.6 : 1.6) + '"/>');
      bg.push('<text x="' + cx + '" y="' + (tagY + 18) + '" text-anchor="middle" font-size="13" font-weight="700" fill="#555">' + item.value.toLocaleString() + '원</text>');
    });
    var w = items.length * slotW + 20;
    return buildScene(els, { width: w, height: h, bg: bg.join(''), label: '진열대' });
  }

  global.ICONS = {
    frag: Frag,
    buildScene: buildScene,
    layoutGrid: layoutGrid,
    layoutScatter: layoutScatter,
    renderCountGroup: renderCountGroup,
    renderTwoGroups: renderTwoGroups,
    renderCombineGroups: renderCombineGroups,
    renderRemoveGroup: renderRemoveGroup,
    renderScatterGroup: renderScatterGroup,
    renderBundles: renderBundles,
    renderPlaceValueScene: renderPlaceValueScene,
    renderTenFrame: renderTenFrame,
    renderArray: renderArray,
    renderSingleIcon: renderSingleIcon,
    renderClock: renderClock,
    renderShelf: renderShelf
  };
})(window);
