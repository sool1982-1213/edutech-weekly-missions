/**
 * 초강스 에듀테크 LAB 9주차 고수 미션: 움직이는 수학 (직각삼각형 내접 직사각형 넓이)
 * 2022 개정 공통수학1 [10공수1-02-06] 이차함수의 최대·최소 (미분·적분·행렬 배제)
 * 지도교사: 수현T
 */

(function () {
  'use strict';

  const SVG_NS = 'http://www.w3.org/2000/svg';

  const state = {
    author: '수현T',
    title: '오늘은 선생님 대신 도형이 설명합니다',
    opening: '직각삼각형 안에 들어가는 직사각형의 가로가 길수록 넓이도 계속 넓어질까요? 언제 가장 넓어질까요?',
    W: 12,
    H: 8,
    x: 3,
    showTwin: true,
    guessValue: null,
    graphRevealed: false,
    observations: [], // max 6
    formulaRevealed: false,
    targetRatio: 75, // 25 | 50 | 75 | 100
    targetX1: '',
    targetX2: '',
    targetAnswerRevealed: false,
    teacherChecks: {
      vertex: false,
      scale: false,
      target: false
    },
    isPlaying: false
  };

  // --- Utilities ---
  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, m => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[m]);
  }

  function gcd(a, b) {
    let x = Math.abs(Math.round(a));
    let y = Math.abs(Math.round(b));
    while (y !== 0) {
      const t = x % y;
      x = y;
      y = t;
    }
    return x || 1;
  }

  function formatFrac(num, den) {
    if (num === 0) return '0';
    const sign = (num * den < 0) ? '−' : '';
    const n = Math.abs(num);
    const d = Math.abs(den);
    const g = gcd(n, d);
    const rn = n / g;
    const rd = d / g;
    return rd === 1 ? `${sign}${rn}` : `${sign}${rn}/${rd}`;
  }

  function formatCoeffFrac(num, den) {
    const g = gcd(num, den);
    const rn = Math.abs(num) / g;
    const rd = Math.abs(den) / g;
    if (rd === 1) return rn === 1 ? '' : `${rn}`;
    return `(${rn}/${rd})`;
  }

  function formatHalfPlusMinusRad(W, radNum) {
    const half = formatFrac(W, 2);
    const g = gcd(W, 4);
    const num = W / g;
    const den = 4 / g;
    const radPart = den === 1
      ? `${num === 1 ? '' : num}√${radNum}`
      : `(${num === 1 ? '' : num}√${radNum})/${den}`;
    return {
      minus: `${half} − ${radPart}`,
      plus: `${half} + ${radPart}`
    };
  }

  function calcY(W, H, x) {
    return H * (1 - x / W);
  }

  function calcArea(W, H, x) {
    return x * calcY(W, H, x);
  }

  function formatNum(v) {
    const rounded = Math.round(v * 100) / 100;
    return Number.isInteger(rounded) ? `${rounded}.00` : rounded.toFixed(2);
  }

  function getTargetSolutions(W, H, ratioPct) {
    const maxAreaFrac = formatFrac(W * H, 4);
    const maxAreaDec = (W * H) / 4;

    if (ratioPct === 100) {
      const solX = W / 2;
      return {
        ratioPct: 100,
        targetFrac: maxAreaFrac,
        targetDec: maxAreaDec,
        count: 1,
        exactList: [formatFrac(W, 2)],
        decList: [solX],
        note: '최대 넓이(꼭짓점)이므로 가로 x는 오직 1개입니다.'
      };
    }

    if (ratioPct === 75) {
      const targetDec = (3 * W * H) / 16;
      return {
        ratioPct: 75,
        targetFrac: formatFrac(3 * W * H, 16),
        targetDec,
        count: 2,
        exactList: [formatFrac(W, 4), formatFrac(3 * W, 4)],
        decList: [W / 4, (3 * W) / 4],
        note: '대칭축 x = W/2의 양쪽에 넓이가 같은 지점이 대칭으로 2개 존재합니다.'
      };
    }

    if (ratioPct === 50) {
      const targetDec = (W * H) / 8;
      const rad = formatHalfPlusMinusRad(W, 2);
      const x1 = (W * (2 - Math.SQRT2)) / 4;
      const x2 = (W * (2 + Math.SQRT2)) / 4;
      return {
        ratioPct: 50,
        targetFrac: formatFrac(W * H, 8),
        targetDec,
        count: 2,
        exactList: [rad.minus, rad.plus],
        decList: [x1, x2],
        note: '포물선과 수평선이 두 점에서 만나므로 해가 2개이며, 두 해의 합은 항상 W입니다.'
      };
    }

    // 25%
    const targetDec = (W * H) / 16;
    const rad = formatHalfPlusMinusRad(W, 3);
    const sqrt3 = Math.sqrt(3);
    const x1 = (W * (2 - sqrt3)) / 4;
    const x2 = (W * (2 + sqrt3)) / 4;
    return {
      ratioPct: 25,
      targetFrac: formatFrac(W * H, 16),
      targetDec,
      count: 2,
      exactList: [rad.minus, rad.plus],
      decList: [x1, x2],
      note: '포물선과 수평선이 두 점에서 만나므로 해가 2개이며, 두 해의 합은 항상 W입니다.'
    };
  }

  // --- SVG Construction & Live Coordinate Updates ---
  let geoRefs = null;
  let graphRefs = null;

  function createSvgEl(tag, attrs = {}) {
    const el = document.createElementNS(SVG_NS, tag);
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, String(v)));
    return el;
  }

  function buildGeoSvgStructure(mount) {
    mount.innerHTML = '';
    const W = state.W;
    const H = state.H;
    const svgW = 440;
    const svgH = 310;
    const padL = 48;
    const padR = 26;
    const padT = 26;
    const padB = 42;
    const plotW = svgW - padL - padR;
    const plotH = svgH - padT - padB;

    const toPxX = x => padL + (x / W) * plotW;
    const toPxY = y => padT + plotH - (y / H) * plotH;
    const fromPxX = px => Math.max(0, Math.min(W, ((px - padL) / plotW) * W));

    const svg = createSvgEl('svg', {
      viewBox: `0 0 ${svgW} ${svgH}`,
      role: 'img',
      'aria-label': `밑변 ${W}, 높이 ${H} 직각삼각형 안의 직사각형 탐구 도형`
    });

    // Background & grid
    svg.appendChild(createSvgEl('rect', { width: svgW, height: svgH, fill: '#0f172a' }));
    for (let gx = 0; gx <= W; gx++) {
      const px = toPxX(gx);
      svg.appendChild(createSvgEl('line', {
        x1: px, y1: padT, x2: px, y2: padT + plotH,
        stroke: '#1e293b', 'stroke-width': gx === 0 ? 1.5 : 1
      }));
    }
    for (let gy = 0; gy <= H; gy++) {
      const py = toPxY(gy);
      svg.appendChild(createSvgEl('line', {
        x1: padL, y1: py, x2: padL + plotW, y2: py,
        stroke: '#1e293b', 'stroke-width': gy === 0 ? 1.5 : 1
      }));
    }

    // Triangle OAB
    const triPts = `${toPxX(0)},${toPxY(0)} ${toPxX(W)},${toPxY(0)} ${toPxX(0)},${toPxY(H)}`;
    svg.appendChild(createSvgEl('polygon', {
      points: triPts,
      fill: 'rgba(56, 189, 248, 0.08)',
      stroke: '#38bdf8',
      'stroke-width': 2.5
    }));

    // Twin Rectangle (behind primary)
    const twinRect = createSvgEl('rect', {
      fill: 'rgba(244, 63, 94, 0.18)',
      stroke: '#fb7185',
      'stroke-width': 2,
      'stroke-dasharray': '6 4'
    });
    const twinPoint = createSvgEl('circle', {
      r: 5.5,
      fill: '#fb7185',
      stroke: '#ffffff',
      'stroke-width': 1.5
    });
    svg.appendChild(twinRect);
    svg.appendChild(twinPoint);

    // Primary Rectangle
    const mainRect = createSvgEl('rect', {
      fill: 'rgba(45, 212, 191, 0.28)',
      stroke: '#2dd4bf',
      'stroke-width': 2.8
    });
    svg.appendChild(mainRect);

    // Dimension labels
    const dimXText = createSvgEl('text', {
      fill: '#2dd4bf',
      'font-size': 12,
      'font-weight': 700,
      'text-anchor': 'middle'
    });
    const dimYText = createSvgEl('text', {
      fill: '#2dd4bf',
      'font-size': 12,
      'font-weight': 700,
      'text-anchor': 'end'
    });
    svg.appendChild(dimXText);
    svg.appendChild(dimYText);

    // Axes & Vertices Labels
    const lblO = createSvgEl('text', { x: toPxX(0) - 8, y: toPxY(0) + 16, fill: '#cbd5e1', 'font-size': 12, 'font-weight': 700, 'text-anchor': 'end' });
    lblO.textContent = 'O(0,0)';
    const lblA = createSvgEl('text', { x: toPxX(W), y: toPxY(0) + 18, fill: '#38bdf8', 'font-size': 12, 'font-weight': 700, 'text-anchor': 'middle' });
    lblA.textContent = `A(${W}, 0)`;
    const lblB = createSvgEl('text', { x: toPxX(0) - 6, y: toPxY(H) + 4, fill: '#38bdf8', 'font-size': 12, 'font-weight': 700, 'text-anchor': 'end' });
    lblB.textContent = `B(0, ${H})`;
    svg.appendChild(lblO);
    svg.appendChild(lblA);
    svg.appendChild(lblB);

    // Interactive Point P(x, y) handle
    const handleGroup = createSvgEl('g', { class: 'geo-drag-handle', tabindex: 0, role: 'slider', 'aria-label': '점 P 위치 조절' });
    const handleRing = createSvgEl('circle', { r: 16, fill: 'rgba(45, 212, 191, 0.18)' });
    const handleDot = createSvgEl('circle', { r: 7.5, fill: '#2dd4bf', stroke: '#ffffff', 'stroke-width': 2.5 });
    const handleLabel = createSvgEl('text', { fill: '#f8fafc', 'font-size': 11.5, 'font-weight': 800 });
    handleGroup.appendChild(handleRing);
    handleGroup.appendChild(handleDot);
    handleGroup.appendChild(handleLabel);
    svg.appendChild(handleGroup);

    // Pointer Drag Binding (on persistent SVG group)
    let dragging = false;
    function updateFromPointer(e) {
      const rect = svg.getBoundingClientRect();
      const svgX = ((e.clientX - rect.left) / rect.width) * svgW;
      const newX = fromPxX(svgX);
      stopPlayback();
      state.x = Math.round(newX * 20) / 20;
      syncAllDynamicViews();
    }

    svg.addEventListener('pointerdown', (e) => {
      dragging = true;
      if (svg.setPointerCapture) {
        try { svg.setPointerCapture(e.pointerId); } catch (err) {}
      }
      updateFromPointer(e);
    });
    svg.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      updateFromPointer(e);
    });
    const endDrag = (e) => {
      if (!dragging) return;
      dragging = false;
      if (svg.releasePointerCapture) {
        try { svg.releasePointerCapture(e.pointerId); } catch (err) {}
      }
    };
    svg.addEventListener('pointerup', endDrag);
    svg.addEventListener('pointercancel', endDrag);

    mount.appendChild(svg);
    geoRefs = {
      toPxX, toPxY, mainRect, twinRect, twinPoint,
      dimXText, dimYText, handleRing, handleDot, handleLabel, handleGroup
    };
  }

  function updateGeoSvgCoords() {
    if (!geoRefs) return;
    const { W, H, x, showTwin } = state;
    const y = calcY(W, H, x);
    const twinX = W - x;
    const twinY = calcY(W, H, twinX);

    const ox = geoRefs.toPxX(0);
    const oy = geoRefs.toPxY(0);
    const px = geoRefs.toPxX(x);
    const py = geoRefs.toPxY(y);

    geoRefs.mainRect.setAttribute('x', ox);
    geoRefs.mainRect.setAttribute('y', py);
    geoRefs.mainRect.setAttribute('width', Math.max(0, px - ox));
    geoRefs.mainRect.setAttribute('height', Math.max(0, oy - py));

    const tx = geoRefs.toPxX(twinX);
    const ty = geoRefs.toPxY(twinY);
    geoRefs.twinRect.style.display = showTwin ? '' : 'none';
    geoRefs.twinPoint.style.display = showTwin ? '' : 'none';
    if (showTwin) {
      geoRefs.twinRect.setAttribute('x', ox);
      geoRefs.twinRect.setAttribute('y', ty);
      geoRefs.twinRect.setAttribute('width', Math.max(0, tx - ox));
      geoRefs.twinRect.setAttribute('height', Math.max(0, oy - ty));
      geoRefs.twinPoint.setAttribute('cx', tx);
      geoRefs.twinPoint.setAttribute('cy', ty);
    }

    geoRefs.handleRing.setAttribute('cx', px);
    geoRefs.handleRing.setAttribute('cy', py);
    geoRefs.handleDot.setAttribute('cx', px);
    geoRefs.handleDot.setAttribute('cy', py);
    geoRefs.handleLabel.setAttribute('x', Math.min(px + 10, 355));
    geoRefs.handleLabel.setAttribute('y', Math.max(py - 10, 20));
    geoRefs.handleLabel.textContent = `P(${x.toFixed(1)}, ${y.toFixed(1)})`;

    geoRefs.dimXText.setAttribute('x', (ox + px) / 2);
    geoRefs.dimXText.setAttribute('y', oy + 16);
    geoRefs.dimXText.textContent = x > 0.4 ? `x=${x.toFixed(1)}` : '';

    geoRefs.dimYText.setAttribute('x', ox - 6);
    geoRefs.dimYText.setAttribute('y', (oy + py) / 2 + 4);
    geoRefs.dimYText.textContent = y > 0.4 ? `y=${y.toFixed(1)}` : '';
  }

  function buildGraphSvgStructure(mount) {
    mount.innerHTML = '';
    const W = state.W;
    const H = state.H;
    const maxS = (W * H) / 4;
    const yCeil = Math.ceil(maxS * 1.15);

    const svgW = 440;
    const svgH = 310;
    const padL = 52;
    const padR = 24;
    const padT = 26;
    const padB = 42;
    const plotW = svgW - padL - padR;
    const plotH = svgH - padT - padB;

    const toPxX = x => padL + (x / W) * plotW;
    const toPxY = s => padT + plotH - (s / yCeil) * plotH;

    const svg = createSvgEl('svg', {
      viewBox: `0 0 ${svgW} ${svgH}`,
      role: 'img',
      'aria-label': '직사각형 넓이 S(x) 이차함수 그래프'
    });
    svg.appendChild(createSvgEl('rect', { width: svgW, height: svgH, fill: '#0f172a' }));

    // Horizontal grid & labels
    const steps = 4;
    for (let i = 0; i <= steps; i++) {
      const val = (yCeil * i) / steps;
      const py = toPxY(val);
      svg.appendChild(createSvgEl('line', {
        x1: padL, y1: py, x2: padL + plotW, y2: py,
        stroke: '#1e293b', 'stroke-width': i === 0 ? 1.5 : 1
      }));
      const txt = createSvgEl('text', {
        x: padL - 7, y: py + 4, fill: '#94a3b8', 'font-size': 10.5, 'text-anchor': 'end'
      });
      txt.textContent = Number.isInteger(val) ? `${val}` : val.toFixed(1);
      svg.appendChild(txt);
    }

    // X-axis ticks (0, W/2, W)
    [0, W / 2, W].forEach(xv => {
      const px = toPxX(xv);
      svg.appendChild(createSvgEl('line', { x1: px, y1: padT, x2: px, y2: padT + plotH, stroke: '#1e293b', 'stroke-width': 1 }));
      const txt = createSvgEl('text', { x: px, y: padT + plotH + 16, fill: '#94a3b8', 'font-size': 11, 'text-anchor': 'middle' });
      txt.textContent = Number.isInteger(xv) ? `${xv}` : xv.toFixed(1);
      svg.appendChild(txt);
    });

    const axisXLabel = createSvgEl('text', { x: padL + plotW, y: padT + plotH + 32, fill: '#cbd5e1', 'font-size': 11, 'text-anchor': 'end' });
    axisXLabel.textContent = '가로 x';
    const axisYLabel = createSvgEl('text', { x: padL, y: padT - 9, fill: '#cbd5e1', 'font-size': 11, 'font-weight': 700 });
    axisYLabel.textContent = `넓이 S(x) · 최댓값 ${formatFrac(W * H, 4)}`;
    svg.appendChild(axisXLabel);
    svg.appendChild(axisYLabel);

    // Target Area dashed line
    const targetLine = createSvgEl('line', {
      x1: padL, x2: padL + plotW,
      stroke: '#facc15', 'stroke-width': 1.5, 'stroke-dasharray': '5 4'
    });
    const targetText = createSvgEl('text', {
      x: padL + plotW - 4, fill: '#facc15', 'font-size': 10.5, 'font-weight': 700, 'text-anchor': 'end'
    });
    svg.appendChild(targetLine);
    svg.appendChild(targetText);

    // Parabola path
    let d = '';
    const N = 80;
    for (let i = 0; i <= N; i++) {
      const xv = (W * i) / N;
      const sv = calcArea(W, H, xv);
      d += (i === 0 ? 'M' : 'L') + `${toPxX(xv).toFixed(2)} ${toPxY(sv).toFixed(2)} `;
    }
    svg.appendChild(createSvgEl('path', {
      d, fill: 'none', stroke: '#38bdf8', 'stroke-width': 3
    }));

    // Vertex dot
    const vx = toPxX(W / 2);
    const vy = toPxY(maxS);
    svg.appendChild(createSvgEl('line', { x1: vx, y1: vy, x2: vx, y2: padT + plotH, stroke: '#475569', 'stroke-dasharray': '4 4' }));
    svg.appendChild(createSvgEl('circle', { cx: vx, cy: vy, r: 4.5, fill: '#38bdf8' }));

    // Student initial guess vertical marker
    const guessLine = createSvgEl('line', {
      y1: padT, y2: padT + plotH, stroke: '#a855f7', 'stroke-width': 1.8, 'stroke-dasharray': '3 3', display: 'none'
    });
    const guessText = createSvgEl('text', {
      y: padT + 14, fill: '#c084fc', 'font-size': 10.5, 'font-weight': 700, 'text-anchor': 'middle', display: 'none'
    });
    svg.appendChild(guessLine);
    svg.appendChild(guessText);

    // Equal area connecting line between x and W-x
    const twinLine = createSvgEl('line', {
      stroke: '#fb7185', 'stroke-width': 1.5, 'stroke-dasharray': '4 3'
    });
    const twinDot = createSvgEl('circle', {
      r: 5.5, fill: '#fb7185', stroke: '#ffffff', 'stroke-width': 1.5
    });
    svg.appendChild(twinLine);
    svg.appendChild(twinDot);

    // Active dot (x, S(x))
    const activeDot = createSvgEl('circle', {
      r: 7, fill: '#2dd4bf', stroke: '#ffffff', 'stroke-width': 2.5
    });
    const activeText = createSvgEl('text', {
      fill: '#2dd4bf', 'font-size': 11, 'font-weight': 800, 'text-anchor': 'middle'
    });
    svg.appendChild(activeDot);
    svg.appendChild(activeText);

    mount.appendChild(svg);
    graphRefs = {
      toPxX, toPxY, targetLine, targetText, guessLine, guessText,
      twinLine, twinDot, activeDot, activeText
    };
  }

  function updateGraphSvgCoords() {
    if (!graphRefs) return;
    const { W, H, x, showTwin, guessValue, targetRatio } = state;
    const s = calcArea(W, H, x);
    const px = graphRefs.toPxX(x);
    const py = graphRefs.toPxY(s);
    const tx = graphRefs.toPxX(W - x);

    graphRefs.activeDot.setAttribute('cx', px);
    graphRefs.activeDot.setAttribute('cy', py);
    graphRefs.activeText.setAttribute('x', Math.min(Math.max(px, 66), 375));
    graphRefs.activeText.setAttribute('y', Math.max(py - 12, 22));
    graphRefs.activeText.textContent = `(${x.toFixed(1)}, ${s.toFixed(1)})`;

    if (showTwin) {
      graphRefs.twinLine.style.display = '';
      graphRefs.twinDot.style.display = '';
      graphRefs.twinLine.setAttribute('x1', px);
      graphRefs.twinLine.setAttribute('y1', py);
      graphRefs.twinLine.setAttribute('x2', tx);
      graphRefs.twinLine.setAttribute('y2', py);
      graphRefs.twinDot.setAttribute('cx', tx);
      graphRefs.twinDot.setAttribute('cy', py);
    } else {
      graphRefs.twinLine.style.display = 'none';
      graphRefs.twinDot.style.display = 'none';
    }

    if (guessValue !== null && !Number.isNaN(guessValue)) {
      const gx = graphRefs.toPxX(guessValue);
      graphRefs.guessLine.style.display = '';
      graphRefs.guessText.style.display = '';
      graphRefs.guessLine.setAttribute('x1', gx);
      graphRefs.guessLine.setAttribute('x2', gx);
      graphRefs.guessText.setAttribute('x', Math.min(Math.max(gx, 66), 375));
      graphRefs.guessText.textContent = `내 예상 x=${guessValue}`;
    } else {
      graphRefs.guessLine.style.display = 'none';
      graphRefs.guessText.style.display = 'none';
    }

    const tInfo = getTargetSolutions(W, H, targetRatio);
    const ty = graphRefs.toPxY(tInfo.targetDec);
    graphRefs.targetLine.setAttribute('y1', ty);
    graphRefs.targetLine.setAttribute('y2', ty);
    graphRefs.targetText.setAttribute('y', Math.max(ty - 5, 16));
    graphRefs.targetText.textContent = `목표 ${targetRatio}% (${tInfo.targetFrac})`;
  }

  // --- Playback Timer ---
  let rafId = null;
  let lastTs = null;

  function stopPlayback() {
    state.isPlaying = false;
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    lastTs = null;
    const btn = document.getElementById('btnPlayPause');
    if (btn) btn.textContent = '▶ 1회 자동 재생';
  }

  function startPlayback() {
    if (state.isPlaying) {
      stopPlayback();
      return;
    }
    if (state.x >= state.W - 0.01) {
      state.x = 0;
    }
    state.isPlaying = true;
    const btn = document.getElementById('btnPlayPause');
    if (btn) btn.textContent = '⏸ 일시정지';
    lastTs = null;

    const step = (ts) => {
      if (!state.isPlaying) return;
      if (lastTs === null) lastTs = ts;
      const dt = (ts - lastTs) / 1000;
      lastTs = ts;
      const speed = state.W / 5; // 5 seconds across full width
      state.x = Math.min(state.W, state.x + dt * speed);
      syncAllDynamicViews();
      if (state.x >= state.W) {
        state.x = state.W;
        syncAllDynamicViews();
        stopPlayback();
        return;
      }
      rafId = requestAnimationFrame(step);
    };
    rafId = requestAnimationFrame(step);
  }

  // --- Dynamic DOM Sync ---
  function syncAllDynamicViews() {
    const { W, H, x } = state;
    const y = calcY(W, H, x);
    const area = calcArea(W, H, x);
    const twinX = W - x;
    const twinArea = calcArea(W, H, twinX);

    updateGeoSvgCoords();
    updateGraphSvgCoords();

    document.getElementById('sliderX').value = x;
    document.getElementById('valXBadge').textContent = `x = ${formatNum(x)}`;
    document.getElementById('metricX').textContent = formatNum(x);
    document.getElementById('metricY').textContent = formatNum(y);
    document.getElementById('metricArea').textContent = formatNum(area);
    document.getElementById('metricTwinX').textContent = formatNum(twinX);
    document.getElementById('metricTwinArea').textContent = formatNum(twinArea);

    const isMid = Math.abs(x - W / 2) < 0.04;
    const twinMatchBadge = document.getElementById('twinMatchBadge');
    twinMatchBadge.hidden = !isMid;

    const degNotice = document.getElementById('degenerateNotice');
    degNotice.hidden = !(x <= 0.01 || x >= W - 0.01);
  }

  function renderFormulaExplanation() {
    const box = document.getElementById('formulaRevealBox');
    box.hidden = !state.formulaRevealed;
    document.getElementById('btnToggleFormula').textContent = state.formulaRevealed
      ? '식으로 설명 접기 ▴'
      : '식으로 설명 펼치기 ▾';

    if (!state.formulaRevealed) return;
    const { W, H } = state;
    const slope = formatFrac(H, W);
    const maxS = formatFrac(W * H, 4);
    const halfW = formatFrac(W, 2);

    box.innerHTML = `
      <div><strong>1. 직선 위의 점 조건 (닮음비):</strong> O(0, 0), A(${W}, 0), B(0, ${H})에서 빗변 AB 위 점 P(x, y)는</div>
      <div class="math-line">y = ${H} · (1 − x/${W}) = −${slope === '1' ? '' : slope}x + ${H} &nbsp; (0 ≤ x ≤ ${W})</div>
      <div><strong>2. 넓이 이차식과 완전제곱식 (미분 없이 최대 판정):</strong></div>
      <div class="math-line">S(x) = x · y = −${slope === '1' ? '' : slope}x² + ${H}x = −${slope === '1' ? '' : slope}(x − ${halfW})² + ${maxS}</div>
      <div><strong>3. 최댓값과 쌍둥이 대칭 이유:</strong> 이차항 계수가 음수이므로 <strong>x = ${halfW}</strong>에서 최댓값 <strong>${maxS}</strong> (= ${formatNum((W * H) / 4)})을 가집니다. 또한 x와 ${W} − x는 중심 x = ${halfW}에서 같은 거리에 있으므로 <strong>S(${W} − x) = S(x)</strong>로 넓이가 항상 같습니다.</div>
    `;
  }

  function renderObservations() {
    const tbody = document.getElementById('obsTableBody');
    document.getElementById('obsCountLabel').textContent = state.observations.length;
    if (state.observations.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="obs-empty">점 P를 움직이며 '관찰 기록 추가'를 눌러 6개까지 비교해 보세요.</td></tr>`;
      return;
    }

    tbody.innerHTML = state.observations.map((obs, idx) => `
      <tr>
        <td>${idx + 1}</td>
        <td>${obs.x.toFixed(2)}</td>
        <td>${obs.y.toFixed(2)}</td>
        <td><strong>${obs.area.toFixed(2)}</strong></td>
        <td>${obs.twinX.toFixed(2)}</td>
        <td>${escapeHtml(obs.tag)}</td>
        <td><button type="button" class="btn-mini btn-del-obs" data-idx="${idx}">삭제</button></td>
      </tr>
    `).join('');

    tbody.querySelectorAll('.btn-del-obs').forEach(btn => {
      btn.addEventListener('click', () => {
        const i = parseInt(btn.getAttribute('data-idx'), 10);
        state.observations.splice(i, 1);
        renderObservations();
      });
    });
  }

  function renderTargetSection() {
    const { W, H, targetRatio } = state;
    const tInfo = getTargetSolutions(W, H, targetRatio);

    document.querySelectorAll('.btn-ratio').forEach(btn => {
      btn.classList.toggle('active', parseInt(btn.getAttribute('data-ratio'), 10) === targetRatio);
    });

    document.getElementById('targetGoalLabel').textContent = `목표: 최대 넓이의 ${targetRatio}%`;
    document.getElementById('targetInfoBanner').innerHTML = `
      현재 삼각형(${W} × ${H})의 최대 넓이는 <strong>${formatFrac(W * H, 4)}</strong> (= ${((W * H) / 4).toFixed(2)})이며,<br>
      목표 넓이(${targetRatio}%)는 <strong>S = ${tInfo.targetFrac}</strong> (근삿값 약 ${tInfo.targetDec.toFixed(2)})입니다.
    `;

    const x2Col = document.getElementById('targetX2Col');
    x2Col.style.display = targetRatio === 100 ? 'none' : '';

    const ansBox = document.getElementById('targetAnswerBox');
    if (state.targetAnswerRevealed) {
      ansBox.hidden = false;
      const sumCheck = tInfo.count === 2
        ? `두 해의 합: ${tInfo.decList[0].toFixed(2)} + ${tInfo.decList[1].toFixed(2)} = ${W}.00 (= W)`
        : `유일해 x = ${tInfo.decList[0].toFixed(2)} (= W/2)`;

      ansBox.innerHTML = `
        <div style="font-weight:800; color:var(--accent); margin-bottom:6px;">
          🎯 목표 넓이 ${targetRatio}% (S = ${tInfo.targetFrac}) → 해의 개수: <strong>${tInfo.count}개</strong>
        </div>
        <div>• <strong>정확한 식 해:</strong> ${tInfo.exactList.map((e, i) => `x${tInfo.count === 1 ? '' : i + 1} = ${escapeHtml(e)}`).join(', ')}</div>
        <div>• <strong>근삿값 확인:</strong> ${tInfo.decList.map((d, i) => `x${tInfo.count === 1 ? '' : i + 1} ≈ ${d.toFixed(2)} (S = ${calcArea(W, H, d).toFixed(2)})`).join(' / ')}</div>
        <div style="margin-top:4px; color:var(--text-muted); font-size:0.84rem;">• ${escapeHtml(sumCheck)} — ${escapeHtml(tInfo.note)}</div>
      `;
    } else {
      ansBox.hidden = true;
    }

    updateGraphSvgCoords();
  }

  function renderExportGate() {
    const allChecked = state.teacherChecks.vertex && state.teacherChecks.scale && state.teacherChecks.target;
    const gateBox = document.getElementById('exportGateBox');
    const badge = document.getElementById('gateBadge');
    gateBox.classList.toggle('unlocked', allChecked);
    badge.className = `gate-badge ${allChecked ? 'unlocked' : 'locked'}`;
    badge.textContent = allChecked ? '저장 가능' : '검토 필요';

    document.getElementById('btnDownloadStudent').disabled = !allChecked;
    document.getElementById('btnPrintStudent').disabled = !allChecked;
    document.getElementById('btnDownloadTeacher').disabled = !allChecked;
    document.getElementById('btnPrintTeacher').disabled = !allChecked;
  }

  // --- Export HTML (Strict Separation: Student Exploration vs Teacher Guide) ---
  function buildExportHtml(isTeacher) {
    const safeAuthor = escapeHtml(state.author || '수현T');
    const safeTitle = escapeHtml(state.title || '움직이는 수학');
    const safeOpening = escapeHtml(state.opening || '');
    const { W, H } = state;
    const today = new Date().toLocaleDateString('ko-KR');

    if (!isTeacher) {
      // STUDENT EXPLORATION SHEET (예상 -> 관찰 -> 식 -> 목표 넓이): NO answers, NO completed square, NO solutions
      const blankTriSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 220" style="max-width:320px; height:auto;">
          <polygon points="40,190 310,190 40,25" fill="#f0fdfa" stroke="#0f766e" stroke-width="2.5"/>
          <rect x="40" y="95" width="155" height="95" fill="rgba(15,118,110,0.12)" stroke="#0f766e" stroke-width="2" stroke-dasharray="5 3"/>
          <circle cx="195" cy="95" r="5" fill="#0f766e"/>
          <text x="202" y="90" font-size="12" font-weight="700" fill="#0f766e">P(x, y)</text>
          <text x="28" y="205" font-size="11" fill="#334155">O(0,0)</text>
          <text x="310" y="206" font-size="11" fill="#334155" text-anchor="middle">A(${W}, 0)</text>
          <text x="36" y="20" font-size="11" fill="#334155" text-anchor="end">B(0, ${H})</text>
          <text x="118" y="204" font-size="11" fill="#0f766e" font-weight="700">가로 x</text>
          <text x="28" y="145" font-size="11" fill="#0f766e" font-weight="700" text-anchor="end">세로 y</text>
        </svg>
      `;
      return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <title>[학생용 탐구지] ${safeTitle} (${safeAuthor})</title>
  <style>
    @page { size: A4 portrait; margin: 11mm 12mm; }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    body { max-width: 820px; margin: 10px auto; padding: 10px 16px; font-family: -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif; color: #0f172a; line-height: 1.5; font-size: 13px; }
    .no-print { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 10px 14px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; }
    .print-btn { background: #0f766e; color: #fff; border: none; padding: 7px 14px; border-radius: 6px; font-weight: 700; cursor: pointer; }
    header { border-bottom: 2px solid #0f766e; padding-bottom: 6px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: flex-end; }
    header h1 { font-size: 18px; margin: 0 0 2px; color: #0f766e; }
    header p { margin: 0; font-size: 11.5px; color: #475569; }
    .info { border: 1px solid #cbd5e1; padding: 4px 10px; border-radius: 6px; font-size: 12px; }
    .step-box { border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px 12px; margin-bottom: 10px; break-inside: avoid; }
    .step-title { font-weight: 800; color: #0f766e; margin-bottom: 6px; font-size: 13.5px; }
    .write-blank { border: 1px dashed #94a3b8; border-radius: 6px; padding: 10px; min-height: 58px; background: #fafafa; color: #64748b; line-height: 1.8; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; text-align: center; margin-top: 6px; }
    th, td { border: 1px solid #cbd5e1; padding: 6px; height: 28px; }
    th { background: #e2e8f0; }
    @media print { .no-print { display: none !important; } body { margin: 0; padding: 0; } }
  </style>
</head>
<body>
  <div class="no-print">
    <span>💡 인쇄 창에서 <strong>'PDF로 저장'</strong>으로 깔끔한 탐구지를 저장하세요.</span>
    <button class="print-btn" onclick="window.print()">🖨️ 인쇄 / PDF</button>
  </div>
  <header>
    <div>
      <h1>[학생용 탐구지] ${safeTitle}</h1>
      <p>2022 개정 공통수학1 [10공수1-02-06] · 직각삼각형 OA = ${W}, OB = ${H} · ${safeAuthor} (${today})</p>
    </div>
    <div class="info">학년/반: _______ 이름: _______________</div>
  </header>

  <div class="step-box">
    <div class="step-title">01. 먼저 예상하기</div>
    <p style="margin:0 0 8px;"><strong>질문:</strong> ${safeOpening}</p>
    <div style="display:flex; gap:14px; align-items:center; flex-wrap:wrap;">
      <div>${blankTriSvg}</div>
      <div class="write-blank" style="flex:1; min-width:240px;">
        • 내가 예상한 가장 넓을 때의 가로 x = ___________ <br>
        • 그렇게 생각한 이유:
      </div>
    </div>
  </div>

  <div class="step-box">
    <div class="step-title">02. 움직이며 관찰하기 (쌍둥이 넓이 비교)</div>
    <p style="margin:0 0 4px;">가로 x와 ${W} − x일 때 직사각형의 가로·세로·넓이를 5가지 이상 기록하고, 넓이가 같아지는 순간을 찾아보세요.</p>
    <table>
      <thead><tr><th>가로 x</th><th>세로 y</th><th>직사각형 넓이 S(x)</th><th>쌍둥이 가로 (${W} − x)</th><th>관찰 메모</th></tr></thead>
      <tbody>
        <tr><td>0</td><td></td><td></td><td>${W}</td><td></td></tr>
        <tr><td></td><td></td><td></td><td></td><td></td></tr>
        <tr><td></td><td></td><td></td><td></td><td></td></tr>
        <tr><td></td><td></td><td></td><td></td><td></td></tr>
        <tr><td>${W}</td><td></td><td></td><td>0</td><td></td></tr>
      </tbody>
    </table>
  </div>

  <div class="step-box">
    <div class="step-title">03. 식으로 설명하기 (완전제곱식)</div>
    <div class="write-blank">
      • 빗변 AB 위 점 P(x, y)의 관계식: y = _______________________ (0 ≤ x ≤ ${W})<br>
      • 직사각형 넓이 S(x) = x · y = _______________________________________<br>
      • 완전제곱식으로 정리한 식과 최댓값:
    </div>
  </div>

  <div class="step-box">
    <div class="step-title">04. 목표 넓이 도전하기 (해가 몇 개일까요?)</div>
    <table>
      <thead><tr><th>목표 넓이 비율</th><th>목표 넓이 값</th><th>만들어지는 가로 x (모두 쓰기)</th><th>해의 개수</th></tr></thead>
      <tbody>
        <tr><td>최대 넓이의 25%</td><td></td><td></td><td>개</td></tr>
        <tr><td>최대 넓이의 50%</td><td></td><td></td><td>개</td></tr>
        <tr><td>최대 넓이의 75%</td><td></td><td></td><td>개</td></tr>
        <tr><td>최대 넓이의 100%</td><td></td><td></td><td>개</td></tr>
      </tbody>
    </table>
  </div>
</body>
</html>`;
    }

    // TEACHER GUIDE: Complete independent verification & exact fractions
    const slope = formatFrac(H, W);
    const maxSFrac = formatFrac(W * H, 4);
    const halfW = formatFrac(W, 2);
    const keyPts = [0, W / 4, W / 2, (3 * W) / 4, W];
    const keyLabels = ['x = 0 (퇴화)', 'x = W/4', 'x = W/2 (최대)', 'x = 3W/4', 'x = W (퇴화)'];
    const verifyRows = keyPts.map((xv, i) => {
      const yv = calcY(W, H, xv);
      const sv = xv * yv;
      return `<tr><td>${keyLabels[i]}</td><td>${xv.toFixed(2)}</td><td>${yv.toFixed(2)}</td><td><strong>${sv.toFixed(2)}</strong></td></tr>`;
    }).join('');

    const targetRows = [25, 50, 75, 100].map(r => {
      const info = getTargetSolutions(W, H, r);
      return `<tr><td>${r}%</td><td><strong>${info.targetFrac}</strong> (${info.targetDec.toFixed(2)})</td><td>${info.count}개</td><td>${info.exactList.map(escapeHtml).join(', ')}</td></tr>`;
    }).join('');

    return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <title>[교사용 해설] ${safeTitle} (${safeAuthor})</title>
  <style>
    @page { size: A4 portrait; margin: 11mm 12mm; }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    body { max-width: 820px; margin: 10px auto; padding: 10px 16px; font-family: -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif; color: #0f172a; line-height: 1.5; font-size: 13px; }
    .no-print { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 10px 14px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; }
    .print-btn { background: #0f766e; color: #fff; border: none; padding: 7px 14px; border-radius: 6px; font-weight: 700; cursor: pointer; }
    header { border-bottom: 2px solid #0f766e; padding-bottom: 6px; margin-bottom: 10px; }
    header h1 { font-size: 18px; margin: 0 0 2px; color: #0f766e; }
    header p { margin: 0; font-size: 11.5px; color: #475569; }
    .box { border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px 12px; margin-bottom: 10px; break-inside: avoid; }
    .box h2 { margin: 0 0 6px; font-size: 14px; color: #0f766e; }
    .math { font-family: "Cambria Math", serif; font-weight: 700; color: #0f766e; font-size: 14px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; text-align: center; margin-top: 6px; }
    th, td { border: 1px solid #cbd5e1; padding: 5px 6px; }
    th { background: #e2e8f0; }
    .warn { background: #fffbeb; border-left: 4px solid #d97706; padding: 8px 10px; font-size: 12px; margin-top: 8px; }
    @media print { .no-print { display: none !important; } body { margin: 0; padding: 0; } }
  </style>
</head>
<body>
  <div class="no-print">
    <span>💡 교사용 해설 및 독립 검산표입니다.</span>
    <button class="print-btn" onclick="window.print()">🖨️ 인쇄 / PDF</button>
  </div>
  <header>
    <h1>[교사용 해설] ${safeTitle}</h1>
    <p>2022 개정 공통수학1 [10공수1-02-06] · 삼각형 O(0,0), A(${W},0), B(0,${H}) · 지도교사: ${safeAuthor} (${today})</p>
  </header>

  <div class="box">
    <h2>1. 완전제곱식 유도 및 대칭성 (미분 배제)</h2>
    <p>• 빗변 AB의 방정식: <span class="math">y = ${H}(1 − x/${W}) = −${slope === '1' ? '' : slope}x + ${H}</span> (단, 0 ≤ x ≤ ${W})</p>
    <p>• 직사각형 넓이: <span class="math">S(x) = x · y = −${slope === '1' ? '' : slope}(x − ${halfW})² + ${maxSFrac}</span></p>
    <p>• 최댓값 판정: <span class="math">x = ${halfW}</span>일 때 최댓값 <span class="math">${maxSFrac}</span> (= ${((W * H) / 4).toFixed(2)}). 대칭축 x = ${halfW} 기준으로 <span class="math">S(${W} − x) = S(x)</span>가 항상 성립합니다.</p>
  </div>

  <div class="box">
    <h2>2. 5개 핵심 지점 독립 검산표 (좌표 × 곱셈)</h2>
    <table>
      <thead><tr><th>기준 지점</th><th>가로 x</th><th>세로 y = ${H}(1 − x/${W})</th><th>넓이 x · y</th></tr></thead>
      <tbody>${verifyRows}</tbody>
    </table>
    <div class="warn"><strong>⚠️ 축척 지도 유의:</strong> W·H가 바뀌면 그래프 세로 축척도 함께 바뀌므로, 곡선의 화면상 높이만으로 서로 다른 삼각형의 최대 넓이를 비교하지 않도록 지도합니다.</div>
  </div>

  <div class="box">
    <h2>3. 목표 넓이별 정답 및 해의 개수</h2>
    <table>
      <thead><tr><th>목표 비율</th><th>목표 넓이 S</th><th>해의 개수</th><th>정확한 가로 x</th></tr></thead>
      <tbody>${targetRows}</tbody>
    </table>
  </div>
</body>
</html>`;
  }

  function downloadHtmlFile(filename, content) {
    const blob = new Blob([content], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  // --- Accessible Validation Helper ---
  let ariaTimer = null;
  function setFieldError(inputEl, isInvalid, customMsg = null, announce = true) {
    const errorId = inputEl.dataset.error;
    const errorEl = errorId ? document.getElementById(errorId) : null;
    if (errorEl && customMsg) errorEl.textContent = customMsg;

    if (isInvalid) {
      inputEl.setAttribute('aria-invalid', 'true');
      inputEl.classList.add('user-invalid-fallback');
      if (errorId) inputEl.setAttribute('aria-describedby', errorId);
      if (errorEl) errorEl.classList.add('visible');

      if (announce && errorEl) {
        const announcer = document.getElementById('ariaAnnouncer');
        clearTimeout(ariaTimer);
        announcer.textContent = '';
        ariaTimer = setTimeout(() => {
          announcer.textContent = errorEl.textContent;
        }, 120);
      }
    } else {
      inputEl.setAttribute('aria-invalid', 'false');
      inputEl.classList.remove('user-invalid-fallback');
      inputEl.removeAttribute('aria-describedby');
      if (errorEl) errorEl.classList.remove('visible');
    }
  }

  function parseBoundedNumber(raw, maxVal) {
    const trimmed = String(raw).trim();
    if (trimmed === '') return { ok: false, msg: `빈 칸입니다. 0 이상 ${maxVal} 이하의 숫자를 입력해 주세요.` };
    const normalized = trimmed.replace(/\u2212/g, '-');
    const num = Number(normalized);
    if (!Number.isFinite(num)) return { ok: false, msg: '올바른 숫자를 입력해 주세요.' };
    if (num < 0 || num > maxVal) return { ok: false, msg: `0부터 ${maxVal} 사이의 값만 입력할 수 있습니다.` };
    return { ok: true, value: num };
  }

  // --- Full Reset on W or H Change ---
  function resetOnDimensionChange(notify = true) {
    stopPlayback();
    state.guessValue = null;
    state.graphRevealed = false;
    state.observations = [];
    state.formulaRevealed = false;
    state.targetAnswerRevealed = false;
    state.targetX1 = '';
    state.targetX2 = '';
    state.teacherChecks = { vertex: false, scale: false, target: false };
    state.x = Number((state.W / 4).toFixed(2));

    document.getElementById('valW').textContent = state.W;
    document.getElementById('valH').textContent = state.H;
    document.getElementById('sliderW').value = state.W;
    document.getElementById('sliderH').value = state.H;

    const sliderX = document.getElementById('sliderX');
    sliderX.max = state.W;
    sliderX.value = state.x;
    document.getElementById('maxXLabel').textContent = state.W;
    document.getElementById('guessRangeHint').textContent = `0부터 ${state.W}까지`;

    const guessInput = document.getElementById('guessInput');
    const targetX1Input = document.getElementById('targetX1Input');
    const targetX2Input = document.getElementById('targetX2Input');
    guessInput.max = state.W;
    targetX1Input.max = state.W;
    targetX2Input.max = state.W;
    guessInput.value = '';
    targetX1Input.value = '';
    targetX2Input.value = '';
    setFieldError(guessInput, false, null, false);
    setFieldError(targetX1Input, false, null, false);
    setFieldError(targetX2Input, false, null, false);

    document.getElementById('guessStatusBadge').textContent = '그래프 공개 대기 중';
    document.getElementById('guessFeedbackBar').hidden = true;
    document.getElementById('graphLockOverlay').hidden = false;
    document.getElementById('graphStateBadge').textContent = '예상 후 공개';
    document.getElementById('targetExploreFeedback').hidden = true;

    document.getElementById('chkReviewVertex').checked = false;
    document.getElementById('chkReviewScale').checked = false;
    document.getElementById('chkReviewTarget').checked = false;

    buildGeoSvgStructure(document.getElementById('geoSvgMount'));
    buildGraphSvgStructure(document.getElementById('graphSvgMount'));
    syncAllDynamicViews();
    renderObservations();
    renderFormulaExplanation();
    renderTargetSection();
    renderExportGate();

    if (notify) {
      const alertBox = document.getElementById('resetAlert');
      alertBox.classList.add('show');
      setTimeout(() => alertBox.classList.remove('show'), 3200);
    }
  }

  function init() {
    const authorInput = document.getElementById('authorInput');
    const titleInput = document.getElementById('titleInput');
    const openingInput = document.getElementById('openingInput');
    const openingPromptDisplay = document.getElementById('openingPromptDisplay');

    const sliderW = document.getElementById('sliderW');
    const sliderH = document.getElementById('sliderH');
    const presetBtns = document.querySelectorAll('.btn-preset');

    const guessForm = document.getElementById('guessForm');
    const guessInput = document.getElementById('guessInput');
    const sliderX = document.getElementById('sliderX');
    const chkShowTwin = document.getElementById('chkShowTwin');
    const btnPlayPause = document.getElementById('btnPlayPause');
    const btnRecordObs = document.getElementById('btnRecordObs');
    const btnClearObs = document.getElementById('btnClearObs');
    const btnToggleFormula = document.getElementById('btnToggleFormula');

    const ratioBtns = document.querySelectorAll('.btn-ratio');
    const targetExploreForm = document.getElementById('targetExploreForm');
    const targetX1Input = document.getElementById('targetX1Input');
    const targetX2Input = document.getElementById('targetX2Input');
    const btnFillX1 = document.getElementById('btnFillX1');
    const btnFillX2 = document.getElementById('btnFillX2');
    const btnRevealTargetAnswer = document.getElementById('btnRevealTargetAnswer');

    const chkReviewVertex = document.getElementById('chkReviewVertex');
    const chkReviewScale = document.getElementById('chkReviewScale');
    const chkReviewTarget = document.getElementById('chkReviewTarget');
    const btnDownloadStudent = document.getElementById('btnDownloadStudent');
    const btnPrintStudent = document.getElementById('btnPrintStudent');
    const btnDownloadTeacher = document.getElementById('btnDownloadTeacher');
    const btnPrintTeacher = document.getElementById('btnPrintTeacher');
    const btnCopySubmission = document.getElementById('btnCopySubmission');

    const copyModal = document.getElementById('copyModal');
    const copyModalTextarea = document.getElementById('copyModalTextarea');
    const btnModalCopy = document.getElementById('btnModalCopy');
    const toast = document.getElementById('toast');

    let toastTimer = null;
    function showToast(msg) {
      toast.textContent = msg;
      toast.classList.add('show');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
    }

    copyModal.addEventListener('close', () => { copyModal.returnValue = ''; });
    if (!('closedBy' in HTMLDialogElement.prototype)) {
      const outside = (e, dlg) => {
        const r = dlg.getBoundingClientRect();
        return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
      };
      let pressedOutside = false;
      copyModal.addEventListener('pointerdown', (e) => { pressedOutside = outside(e, copyModal); });
      copyModal.addEventListener('pointerup', (e) => { if (pressedOutside && outside(e, copyModal)) copyModal.close(); });
    }

    // Metadata
    authorInput.addEventListener('input', e => { state.author = e.target.value.trim() || '선생님'; });
    titleInput.addEventListener('input', e => { state.title = e.target.value.trim() || '움직이는 수학'; });
    openingInput.addEventListener('input', e => {
      state.opening = e.target.value.trim();
      openingPromptDisplay.textContent = state.opening;
    });

    // Presets & W/H sliders
    presetBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        presetBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.W = parseInt(btn.getAttribute('data-w'), 10);
        state.H = parseInt(btn.getAttribute('data-h'), 10);
        resetOnDimensionChange(true);
      });
    });

    sliderW.addEventListener('input', e => {
      presetBtns.forEach(b => b.classList.remove('active'));
      state.W = parseInt(e.target.value, 10);
      resetOnDimensionChange(true);
    });

    sliderH.addEventListener('input', e => {
      presetBtns.forEach(b => b.classList.remove('active'));
      state.H = parseInt(e.target.value, 10);
      resetOnDimensionChange(true);
    });

    // Step 01: Guess Form
    document.querySelectorAll('.btn-chip-guess').forEach(btn => {
      btn.addEventListener('click', () => {
        const frac = parseFloat(btn.getAttribute('data-frac'));
        const val = Number((state.W * frac).toFixed(2));
        guessInput.value = val;
        setFieldError(guessInput, false);
      });
    });

    guessInput.addEventListener('input', () => {
      if (guessInput.getAttribute('aria-invalid') === 'true') {
        const check = parseBoundedNumber(guessInput.value, state.W);
        setFieldError(guessInput, !check.ok, check.ok ? null : check.msg, false);
      }
    });

    guessForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const check = parseBoundedNumber(guessInput.value, state.W);
      if (!check.ok) {
        setFieldError(guessInput, true, check.msg, true);
        guessInput.focus();
        return;
      }
      setFieldError(guessInput, false);
      state.guessValue = check.value;
      state.graphRevealed = true;

      document.getElementById('graphLockOverlay').hidden = true;
      document.getElementById('graphStateBadge').textContent = '그래프 공개됨';
      document.getElementById('guessStatusBadge').textContent = `내 예상: x = ${state.guessValue}`;

      const fb = document.getElementById('guessFeedbackBar');
      fb.hidden = false;
      const gArea = calcArea(state.W, state.H, state.guessValue);
      fb.innerHTML = `<strong>예상 기록 완료!</strong> 내 예상 <strong>x = ${state.guessValue}</strong>일 때 넓이는 <strong>${gArea.toFixed(2)}</strong>입니다. 이제 아래 점 P를 움직여 실제 가장 넓어지는 순간과 비교해 보세요.`;
      updateGraphSvgCoords();
      showToast('예상이 기록되어 넓이 그래프가 공개되었습니다!');
    });

    // Step 02: Slider, Twin, Playback, Keypoints, Observations
    sliderX.addEventListener('input', e => {
      stopPlayback();
      state.x = parseFloat(e.target.value);
      syncAllDynamicViews();
    });

    chkShowTwin.addEventListener('change', e => {
      state.showTwin = e.target.checked;
      syncAllDynamicViews();
    });

    btnPlayPause.addEventListener('click', startPlayback);

    document.querySelectorAll('.btn-keypoint').forEach(btn => {
      btn.addEventListener('click', () => {
        stopPlayback();
        const k = parseFloat(btn.getAttribute('data-k'));
        state.x = Number((state.W * k).toFixed(2));
        syncAllDynamicViews();
      });
    });

    btnRecordObs.addEventListener('click', () => {
      if (state.observations.length >= 6) {
        showToast('관찰 기록은 최대 6개까지만 담을 수 있습니다.');
        return;
      }
      const x = state.x;
      const y = calcY(state.W, state.H, x);
      const area = calcArea(state.W, state.H, x);
      const twinX = state.W - x;
      let tag = '일반 위치';
      if (x <= 0.01 || x >= state.W - 0.01) tag = '양 끝점 (넓이 0)';
      else if (Math.abs(x - state.W / 2) < 0.04) tag = '가운데 · 최대 넓이';

      state.observations.push({ x, y, area, twinX, tag });
      renderObservations();
      showToast(`관찰 기록을 추가했습니다 (${state.observations.length}/6).`);
    });

    btnClearObs.addEventListener('click', () => {
      state.observations = [];
      renderObservations();
      showToast('관찰 기록표를 비웠습니다.');
    });

    // Step 03: Formula Explanation Toggle
    btnToggleFormula.addEventListener('click', () => {
      state.formulaRevealed = !state.formulaRevealed;
      renderFormulaExplanation();
    });

    // Step 04: Target Area Challenge
    ratioBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        state.targetRatio = parseInt(btn.getAttribute('data-ratio'), 10);
        state.targetAnswerRevealed = false;
        document.getElementById('targetExploreFeedback').hidden = true;
        setFieldError(targetX1Input, false, null, false);
        setFieldError(targetX2Input, false, null, false);
        renderTargetSection();
      });
    });

    btnFillX1.addEventListener('click', () => {
      targetX1Input.value = state.x.toFixed(2);
      setFieldError(targetX1Input, false);
    });

    btnFillX2.addEventListener('click', () => {
      targetX2Input.value = state.x.toFixed(2);
      setFieldError(targetX2Input, false);
    });

    targetExploreForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const c1 = parseBoundedNumber(targetX1Input.value, state.W);
      if (!c1.ok) {
        setFieldError(targetX1Input, true, c1.msg, true);
        targetX1Input.focus();
        return;
      }
      setFieldError(targetX1Input, false);

      const tInfo = getTargetSolutions(state.W, state.H, state.targetRatio);
      const fb = document.getElementById('targetExploreFeedback');
      fb.hidden = false;

      if (state.targetRatio === 100) {
        const s1 = calcArea(state.W, state.H, c1.value);
        const diff = Math.abs(s1 - tInfo.targetDec);
        fb.innerHTML = diff < 0.25
          ? `✅ <strong>x₁ = ${c1.value}</strong>에서의 넓이 <strong>${s1.toFixed(2)}</strong>은 목표 최대 넓이(${tInfo.targetDec.toFixed(2)})에 매우 가깝습니다! (해는 1개입니다)`
          : `🔎 x₁ = ${c1.value}일 때 넓이는 ${s1.toFixed(2)}입니다. 목표 넓이 ${tInfo.targetDec.toFixed(2)}와 비교해 점 P를 더 옮겨 보세요.`;
        return;
      }

      // For 25%, 50%, 75%: validate second input if non-empty, or encourage finding both
      const raw2 = targetX2Input.value.trim();
      const s1 = calcArea(state.W, state.H, c1.value);
      if (raw2 === '') {
        setFieldError(targetX2Input, false);
        fb.innerHTML = `📌 x₁ = ${c1.value}일 때 넓이는 <strong>${s1.toFixed(2)}</strong>입니다. 쌍둥이 도형 원리(W − x)를 이용해 <strong>두 번째 가로 x₂</strong>도 함께 찾아보세요!`;
        return;
      }

      const c2 = parseBoundedNumber(raw2, state.W);
      if (!c2.ok) {
        setFieldError(targetX2Input, true, c2.msg, true);
        targetX2Input.focus();
        return;
      }
      setFieldError(targetX2Input, false);

      const s2 = calcArea(state.W, state.H, c2.value);
      const distinct = Math.abs(c1.value - c2.value) > 0.1;
      const close1 = Math.abs(s1 - tInfo.targetDec) < 0.25;
      const close2 = Math.abs(s2 - tInfo.targetDec) < 0.25;

      if (distinct && close1 && close2) {
        fb.innerHTML = `✅ 훌륭합니다! <strong>x₁ = ${c1.value}</strong> (넓이 ${s1.toFixed(2)}), <strong>x₂ = ${c2.value}</strong> (넓이 ${s2.toFixed(2)})로 서로 다른 2개의 해를 모두 찾았습니다.`;
      } else {
        fb.innerHTML = `🔎 x₁ = ${c1.value} (넓이 ${s1.toFixed(2)}), x₂ = ${c2.value} (넓이 ${s2.toFixed(2)})입니다. 목표 넓이 <strong>${tInfo.targetDec.toFixed(2)}</strong>와 x₁ + x₂ = ${state.W}가 되는지 살펴보세요.`;
      }
    });

    btnRevealTargetAnswer.addEventListener('click', () => {
      state.targetAnswerRevealed = true;
      renderTargetSection();
    });

    // Teacher Review Check Gate
    function syncChecks() {
      state.teacherChecks.vertex = chkReviewVertex.checked;
      state.teacherChecks.scale = chkReviewScale.checked;
      state.teacherChecks.target = chkReviewTarget.checked;
      renderExportGate();
    }
    chkReviewVertex.addEventListener('change', syncChecks);
    chkReviewScale.addEventListener('change', syncChecks);
    chkReviewTarget.addEventListener('change', syncChecks);

    function runGuardedExport(isTeacher, mode) {
      const ok = state.teacherChecks.vertex && state.teacherChecks.scale && state.teacherChecks.target;
      if (!ok) {
        showToast('교사 검토 체크 3가지를 모두 완료해야 저장할 수 있습니다.');
        return;
      }
      const html = buildExportHtml(isTeacher);
      const label = isTeacher ? '교사용 해설' : '학생용 탐구지';
      if (mode === 'download') {
        downloadHtmlFile(isTeacher ? 'week09_teacher_guide.html' : 'week09_student_worksheet.html', html);
        showToast(`💾 ${label} HTML 파일을 저장했습니다.`);
      } else if (typeof window.EdutechPrint === 'function') {
        window.EdutechPrint(html, label);
        showToast(`🖨️ ${label} 인쇄 창을 열었습니다.`);
      }
    }

    btnDownloadStudent.addEventListener('click', () => runGuardedExport(false, 'download'));
    btnPrintStudent.addEventListener('click', () => runGuardedExport(false, 'print'));
    btnDownloadTeacher.addEventListener('click', () => runGuardedExport(true, 'download'));
    btnPrintTeacher.addEventListener('click', () => runGuardedExport(true, 'print'));

    btnCopySubmission.addEventListener('click', () => {
      const origin = window.location.origin;
      const pathname = window.location.pathname.replace(/\/index\.html$/, '').replace(/\/$/, '');
      const cleanUrl = origin.includes('github.io') || origin.includes('vercel.app')
        ? `${origin}${pathname}/`
        : 'https://sool1982-1213.github.io/edutech-weekly-missions/week09/';

      const comment = `9주차 / ${state.author || '수현T'} / 고수 / 미션 완료\n결과 링크 또는 파일: ${cleanUrl}\n우리 반에서는 이렇게 질문해 볼게요: 가로가 길수록 넓이가 넓어질지 먼저 예상해 본 뒤, 넓이가 같은 두 직사각형이 왜 가운데에서 하나로 만나는지 완전제곱식으로 설명해 보자고 질문하겠습니다.`;

      navigator.clipboard.writeText(comment).then(() => {
        showToast('9주차 제출 댓글 양식이 복사되었습니다!');
      }).catch(() => {
        copyModalTextarea.value = comment;
        copyModal.showModal();
      });
    });

    btnModalCopy.addEventListener('click', () => {
      copyModalTextarea.select();
      navigator.clipboard?.writeText(copyModalTextarea.value).catch(() => {});
      try { document.execCommand('copy'); } catch (e) {}
      copyModal.close();
      showToast('복사되었습니다!');
    });

    // Safe read-only debug/export hook for automated verification
    window.__week09Verify = {
      buildExportHtml: (isTeacher) => buildExportHtml(isTeacher),
      getTargetSolutions: (ratioPct) => getTargetSolutions(state.W, state.H, ratioPct),
      getState: () => JSON.parse(JSON.stringify(state))
    };

    resetOnDimensionChange(false);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
