/**
 * 수현T의 6주차 고수 미션: 15분 두 갈래 수업 설계 (제한된 구간의 이차함수 최대·최소)
 * 2022 개정 공통수학1 [10공수1-02-06]
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- 1. Global State ---
  const state = {
    author: '수현T',
    opening: '최대·최소를 찾으려면 어떤 x를 비교해야 할까? 꼭짓점이 보인다고 바로 써도 될까?',
    params: {
      a: 1,
      h: 1,
      k: -2,
      left: 2,
      right: 4
    },
    isTeacherAnswerRevealed: false,
    diagnosticAnswers: [-1, -1, -1],
    isDiagnosticFeedbackRevealed: false,
    classSize: 20,
    // 3 questions x 3 options counts
    counts: [
      [9, 8, 3],  // Q1 default mock
      [4, 14, 2], // Q2 default mock
      [6, 11, 3]  // Q3 default mock
    ],
    route: 'support', // 'support' (개념 다지기) | 'extend' (적용 확장)
    teacherNote: '학생들의 생각을 먼저 듣고, 제 설명 욕심은 잠깐 접어 두겠습니다. 익명 응답을 통해 어디서 망설이는지 확인하고 15분 후속 활동을 유연하게 진행하겠습니다.',
    isVerified: false
  };

  // --- 2. DOM Elements ---
  const authorInput = document.getElementById('authorInput');
  const openingInput = document.getElementById('openingInput');
  const paramA = document.getElementById('paramA');
  const paramH = document.getElementById('paramH');
  const paramK = document.getElementById('paramK');
  const paramLeft = document.getElementById('paramLeft');
  const paramRight = document.getElementById('paramRight');

  const presetOutside = document.getElementById('presetOutside');
  const presetInside = document.getElementById('presetInside');
  const presetBoundary = document.getElementById('presetBoundary');

  const cardTeacherTitle = document.getElementById('cardTeacherTitle');
  const formulaDisplay = document.getElementById('formulaDisplay');
  const intervalDisplay = document.getElementById('intervalDisplay');
  const quoteText = document.getElementById('quoteText');
  const graphContainer = document.getElementById('graphContainer');

  const btnToggleTeacherAnswer = document.getElementById('btnToggleTeacherAnswer');
  const teacherCheckDrawer = document.getElementById('teacherCheckDrawer');
  const vertexStatusChip = document.getElementById('vertexStatusChip');
  const valuesChipsRow = document.getElementById('valuesChipsRow');
  const minmaxSummaryBox = document.getElementById('minmaxSummaryBox');

  const questionsContainer = document.getElementById('questionsContainer');
  const btnCheckDiagnostic = document.getElementById('btnCheckDiagnostic');
  const btnResetDiagnostic = document.getElementById('btnResetDiagnostic');

  const classSizeInput = document.getElementById('classSizeInput');
  const btnLoadMockData = document.getElementById('btnLoadMockData');
  const btnClearCounts = document.getElementById('btnClearCounts');
  const countsGridContainer = document.getElementById('countsGridContainer');
  const priorityTitle = document.getElementById('priorityTitle');
  const priorityDesc = document.getElementById('priorityDesc');

  const btnRouteSupport = document.getElementById('btnRouteSupport');
  const btnRouteExtend = document.getElementById('btnRouteExtend');
  const routeTimelineContainer = document.getElementById('routeTimelineContainer');
  const btnCopyRoute = document.getElementById('btnCopyRoute');
  const manualCopyBox = document.getElementById('manualCopyBox');
  const manualCopyTextarea = document.getElementById('manualCopyTextarea');

  const teacherNoteInput = document.getElementById('teacherNoteInput');
  const checkVerified = document.getElementById('checkVerified');
  const btnDownloadStudent = document.getElementById('btnDownloadStudent');
  const btnPrintStudentPdf = document.getElementById('btnPrintStudentPdf');
  const btnDownloadTeacher = document.getElementById('btnDownloadTeacher');
  const btnPrintTeacherPdf = document.getElementById('btnPrintTeacherPdf');
  const teacherLockText = document.getElementById('teacherLockText');
  const toast = document.getElementById('toast');

  // --- 3. Mathematical Calculations ---
  function evalQuadratic(params, x) {
    return params.a * Math.pow(x - params.h, 2) + params.k;
  }

  function formatFormula(params) {
    const aPart = params.a === 1 ? '' : `${params.a}`;
    let hPart = '';
    if (params.h === 0) {
      hPart = 'x²';
    } else if (params.h > 0) {
      hPart = `(x − ${params.h})²`;
    } else {
      hPart = `(x + ${Math.abs(params.h)})²`;
    }

    let kPart = '';
    if (params.k > 0) {
      kPart = ` + ${params.k}`;
    } else if (params.k < 0) {
      kPart = ` − ${Math.abs(params.k)}`;
    }

    return `f(x) = ${aPart}${hPart}${kPart}`;
  }

  function computeIntervalAnalysis(params) {
    const inside = params.h >= params.left && params.h <= params.right;
    const isBoundary = params.h === params.left || params.h === params.right;

    const xPoints = [...new Set([
      params.left,
      params.right,
      ...(inside ? [params.h] : [])
    ])].sort((a, b) => a - b);

    const points = xPoints.map(x => ({
      x,
      y: evalQuadratic(params, x)
    }));

    const yValues = points.map(p => p.y);
    const minY = Math.min(...yValues);
    const maxY = Math.max(...yValues);

    return {
      inside,
      isBoundary,
      points,
      minY,
      maxY
    };
  }

  function getShiftedParams(params) {
    if (params.left > -4) {
      return { ...params, left: params.left - 1, right: params.right - 1 };
    }
    if (params.right < 4) {
      return { ...params, left: params.left + 1, right: params.right + 1 };
    }
    return { ...params, left: -3, right: 3 };
  }

  // --- 4. Questions & Diagnostics Data ---
  function buildOptionsDistractors(correctVal, distractorPool) {
    const opts = [correctVal];
    for (const d of distractorPool) {
      if (!opts.includes(d)) {
        opts.push(d);
      }
      if (opts.length >= 3) break;
    }
    while (opts.length < 3) {
      const fallback = typeof correctVal === 'number' ? correctVal + opts.length : `${correctVal}_${opts.length}`;
      if (!opts.includes(fallback)) opts.push(fallback);
    }
    return opts.slice(0, 3);
  }

  function generateQuestions(params) {
    const analysis = computeIntervalAnalysis(params);
    const candStr = analysis.points.map(p => p.x).join(', ');

    // Q1: 후보 x
    let q1DistractorA;
    if (analysis.inside) {
      q1DistractorA = `${params.left}, ${params.right}만`;
    } else {
      q1DistractorA = `${params.h}, ${params.left}, ${params.right}`;
    }
    const q1DistractorB = `${params.h}만`;
    const q1Options = [`x = ${candStr}`, `x = ${q1DistractorA}`, `x = ${q1DistractorB}`];
    // Deterministic shuffle
    const q1Answer = (Math.abs(params.h + params.k) + 0) % 3;
    [q1Options[0], q1Options[q1Answer]] = [q1Options[q1Answer], q1Options[0]];

    const q1 = {
      title: '최대·최소를 구하려면 어떤 x들을 비교해야 할까요?',
      skill: '구간과 후보',
      options: q1Options,
      answer: q1Answer,
      explanation: `${params.left} ≤ x ≤ ${params.right}에서 양 끝점(x=${params.left}, ${params.right})을 확인하고, 꼭짓점의 x좌표 ${params.h}은 ${
        analysis.inside ? '구간 안에 있으므로 포함합니다.' : '구간 밖에 있으므로 제외합니다.'
      }`,
      followup: '꼭짓점이 구간 밖에 있어도 후보에 넣어야 할까요? 수직선에 구간을 표시해 설명해 보세요.'
    };

    // Q2: 최솟값
    const q2Distractors = [
      params.k,
      evalQuadratic(params, params.left),
      evalQuadratic(params, params.right),
      analysis.minY + 2,
      analysis.minY - 1
    ];
    const q2RawOptions = buildOptionsDistractors(analysis.minY, q2Distractors).map(String);
    const q2Answer = (Math.abs(params.h + params.k) + 1) % 3;
    [q2RawOptions[0], q2RawOptions[q2Answer]] = [q2RawOptions[q2Answer], q2RawOptions[0]];

    const q2 = {
      title: '주어진 구간에서 최솟값은 얼마일까요?',
      skill: '최솟값',
      options: q2RawOptions,
      answer: q2Answer,
      explanation: `${analysis.points.map(p => `f(${p.x}) = ${p.y}`).join(', ')}를 비교하면 최솟값은 ${analysis.minY}입니다.`,
      followup: '최솟값과 그때의 x좌표를 각각 말해 보세요. 구간 밖 꼭짓점의 y값은 왜 사용할 수 없을까요?'
    };

    // Q3: 최댓값
    const q3Distractors = [
      analysis.minY,
      params.k,
      analysis.maxY + 1,
      analysis.maxY - 2,
      evalQuadratic(params, params.left)
    ];
    const q3RawOptions = buildOptionsDistractors(analysis.maxY, q3Distractors).map(String);
    const q3Answer = (Math.abs(params.h + params.k) + 2) % 3;
    [q3RawOptions[0], q3RawOptions[q3Answer]] = [q3RawOptions[q3Answer], q3RawOptions[0]];

    const q3 = {
      title: '주어진 구간에서 최댓값은 얼마일까요?',
      skill: '최댓값',
      options: q3RawOptions,
      answer: q3Answer,
      explanation: `비교한 함숫값 중 가장 큰 값은 ${analysis.maxY}입니다. 아래로 볼록한 포물선이어도 제한된 닫힌구간에서는 반드시 최댓값이 존재합니다.`,
      followup: '양 끝점의 함숫값 중 무엇이 더 큰가요? 축과의 거리를 이용해 그래프와 대입 계산을 연결해 설명해 보세요.'
    };

    return [q1, q2, q3];
  }

  // --- 5. SVG Graph Renderer ---
  function renderSvgGraph(params, showAnswers = false) {
    const xMin = Math.min(params.left, params.h) - 1;
    const xMax = Math.max(params.right, params.h) + 1;
    const sampleYs = [
      evalQuadratic(params, xMin),
      evalQuadratic(params, xMax),
      params.k,
      0
    ];
    const yMin = Math.min(...sampleYs) - 2;
    const yMax = Math.max(...sampleYs) + 2;

    const mapX = x => 42 + ((x - xMin) / (xMax - xMin)) * 536;
    const mapY = y => 278 - ((y - yMin) / (yMax - yMin)) * 236;

    // Generate curve points
    const stepCount = 100;
    const curvePoints = [];
    for (let i = 0; i <= stepCount; i++) {
      const cx = xMin + ((xMax - xMin) * i) / stepCount;
      const cy = evalQuadratic(params, cx);
      curvePoints.push(`${i === 0 ? 'M' : 'L'}${mapX(cx).toFixed(2)},${mapY(cy).toFixed(2)}`);
    }
    const pathD = curvePoints.join(' ');

    const intervalLeftX = mapX(params.left);
    const intervalRightX = mapX(params.right);
    const intervalWidth = Math.max(2, intervalRightX - intervalLeftX);

    const analysis = computeIntervalAnalysis(params);

    // Answer points circles
    let answerCircles = '';
    if (showAnswers) {
      answerCircles = analysis.points
        .map(p => {
          const cx = mapX(p.x);
          const cy = mapY(p.y);
          const labelY = Math.max(22, cy - 12);
          return `
            <circle cx="${cx}" cy="${cy}" r="6" fill="#173c50" stroke="#fff" stroke-width="2"/>
            <text x="${cx}" y="${labelY}" text-anchor="middle" fill="#173c50" font-size="14" font-weight="700">(${p.x}, ${p.y})</text>
          `;
        })
        .join('');
    }

    const y0Pos = mapY(0);
    const xAxisLine = y0Pos >= 42 && y0Pos <= 278 ? `<line x1="42" y1="${y0Pos}" x2="578" y2="${y0Pos}" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="2 2"/>` : '';

    const axisX = mapX(params.h);

    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 620 320" role="img" aria-label="${formatFormula(params)}, ${params.left} 이상 ${params.right} 이하의 구간">
        <rect width="620" height="320" rx="16" fill="#f0f6f5"/>
        
        <!-- Header Info in SVG (좌우 분리 배치로 중앙 축 라벨과의 겹침 방지) -->
        <text x="32" y="26" fill="#0f766e" font-size="13" font-weight="700">포물선 좌표평면</text>
        <text x="588" y="26" text-anchor="end" fill="#64748b" font-size="12" font-weight="600">${params.left} ≤ x ≤ ${params.right}</text>

        <!-- Interval Highlight Area -->
        <rect x="${intervalLeftX}" y="42" width="${intervalWidth}" height="236" fill="#d4edac" opacity="0.7"/>
        
        <!-- Axes -->
        ${xAxisLine}
        <line x1="42" y1="278" x2="578" y2="278" stroke="#6b818b" stroke-width="2"/>
        
        <!-- Parabola Curve -->
        <path d="${pathD}" stroke="#087f82" stroke-width="4" fill="none" stroke-linecap="round"/>
        
        <!-- Interval Boundaries -->
        <line x1="${intervalLeftX}" y1="42" x2="${intervalLeftX}" y2="278" stroke="#527566" stroke-width="2" stroke-dasharray="5 5"/>
        <text x="${intervalLeftX}" y="304" text-anchor="middle" fill="#183e49" font-size="14" font-weight="700">x=${params.left}</text>
        
        <line x1="${intervalRightX}" y1="42" x2="${intervalRightX}" y2="278" stroke="#527566" stroke-width="2" stroke-dasharray="5 5"/>
        <text x="${intervalRightX}" y="304" text-anchor="middle" fill="#183e49" font-size="14" font-weight="700">x=${params.right}</text>
        
        <!-- Vertex Dotted Line & Badge (상단 텍스트와 분리된 전용 배지) -->
        <line x1="${axisX}" y1="42" x2="${axisX}" y2="278" stroke="#0ea5e9" stroke-width="1.5" stroke-dasharray="3 3"/>
        <g transform="translate(${axisX}, 50)">
          <rect x="-30" y="-11" width="60" height="22" rx="11" fill="#e0f2fe" stroke="#38bdf8" stroke-width="1"/>
          <text x="0" y="4" text-anchor="middle" fill="#0369a1" font-size="11" font-weight="700">축 x=${params.h}</text>
        </g>
        
        <!-- Answer Points -->
        ${answerCircles}
      </svg>
    `;
  }

  // --- 6. 15-Minute Timeline Generator ---
  function generateTimeline(params, route, priorityInfo) {
    const analysis = computeIntervalAnalysis(params);
    const shifted = getShiftedParams(params);

    if (route === 'support') {
      return [
        {
          minutes: 3,
          title: '도입 · 구간 표시',
          task: `수직선과 좌표평면에 닫힌구간 ${params.left} ≤ x ≤ ${params.right}를 연두색으로 표시하고, 구간 밖의 영역을 지워 관찰 대상을 한정합니다.`
        },
        {
          minutes: 5,
          title: '함께 · 후보와 대입',
          task: priorityInfo && priorityInfo.followup
            ? `[중점 질문] "${priorityInfo.followup}" — 꼭짓점(x=${params.h})과 양 끝점 중 비교할 후보 x를 먼저 정하고 식 f(x)에 직접 대입합니다.`
            : `양 끝점 x=${params.left}, ${params.right}과 꼭짓점 x=${params.h}의 위치를 대조하고, 식 f(x)에 직접 대입하여 계산합니다.`
        },
        {
          minutes: 5,
          title: '짝 설명 · 값 비교',
          task: `후보 x좌표와 함숫값 f(x)를 구별하여 대입표를 완성하고, 양 끝점의 값(${evalQuadratic(params, params.left)}, ${evalQuadratic(params, params.right)})을 비교하여 왜 최솟값 ${analysis.minY}, 최댓값 ${analysis.maxY}인지 짝에게 설명합니다.`
        },
        {
          minutes: 2,
          title: '출구 질문',
          task: `구간을 [${shifted.left}, ${shifted.right}]로 1만큼 옮기면 비교할 후보 x는 어떻게 달라지나요? 1문장으로 적어 제출합니다.`
        }
      ];
    } else {
      return [
        {
          minutes: 2,
          title: '도입 · 근거 공유',
          task: '진단 문항의 답 번호가 같더라도, 각자가 후보 x를 선택한 수학적 이유와 근거가 일치하는지 짝과 비교합니다.'
        },
        {
          minutes: 5,
          title: '적용 · 구간 변경',
          task: `동일한 함수 f(x)에서 구간을 [${shifted.left}, ${shifted.right}]로 변경합니다. 축 x=${params.h}와의 거리를 계산하고 새로운 최대·최소를 신속하게 구합니다.`
        },
        {
          minutes: 5,
          title: '설명 · 경계 사례',
          task: `꼭짓점 x = ${params.h}이 구간의 한쪽 끝점(경계)이 될 때, 후보를 중복해서 셀 필요가 있는지와 최대·최소 판정 방식을 논리적으로 서술합니다.`
        },
        {
          minutes: 3,
          title: '출구 질문',
          task: '구간의 위치를 바꿀 때 일정하게 유지되는 성질(함수의 축/꼭짓점)과 다시 확인해야 하는 성질(후보 구성)을 한 문장으로 정리합니다.'
        }
      ];
    }
  }

  // --- 7. Core Render Functions ---

  function renderHeroAndGraph() {
    cardTeacherTitle.textContent = `${state.author}의 도입 질문 카드`;
    formulaDisplay.textContent = formatFormula(state.params);
    intervalDisplay.textContent = `${state.params.left} ≤ x ≤ ${state.params.right}`;
    quoteText.textContent = state.opening;

    // SVG
    graphContainer.innerHTML = renderSvgGraph(state.params, state.isTeacherAnswerRevealed);

    // Teacher check drawer
    const analysis = computeIntervalAnalysis(state.params);
    teacherCheckDrawer.hidden = !state.isTeacherAnswerRevealed;
    btnToggleTeacherAnswer.classList.toggle('active', state.isTeacherAnswerRevealed);
    btnToggleTeacherAnswer.setAttribute('aria-expanded', String(state.isTeacherAnswerRevealed));
    btnToggleTeacherAnswer.textContent = state.isTeacherAnswerRevealed
      ? '🔍 교사용 확인 닫기'
      : '🔍 교사용 확인 · 후보와 검산';

    let vertexText = '';
    if (analysis.inside && !analysis.isBoundary) {
      vertexText = `꼭짓점 x=${state.params.h}은 구간 안 (후보 포함)`;
    } else if (analysis.isBoundary) {
      vertexText = `꼭짓점 x=${state.params.h}은 구간의 경계점`;
    } else {
      vertexText = `꼭짓점 x=${state.params.h}은 구간 밖 (후보 제외)`;
    }
    vertexStatusChip.textContent = vertexText;

    valuesChipsRow.innerHTML = analysis.points
      .map(p => `
        <div class="val-chip">
          f(${p.x}) = <b>${p.y}</b>
        </div>
      `)
      .join('');

    minmaxSummaryBox.innerHTML = `
      <div class="summary-min">📉 최솟값: <b>${analysis.minY}</b></div>
      <div class="summary-max">📈 최댓값: <b>${analysis.maxY}</b></div>
    `;

    // Dynamic legend labels (사용자가 설정한 구간 값 반영)
    const legendInterval = document.getElementById('legendInterval');
    const legendBoundaries = document.getElementById('legendBoundaries');
    if (legendInterval) {
      legendInterval.textContent = `${state.params.left}, ${state.params.right}`;
    }
    if (legendBoundaries) {
      legendBoundaries.textContent = `x = ${state.params.left}, x = ${state.params.right}`;
    }
  }

  function renderDiagnostics() {
    const questions = generateQuestions(state.params);
    questionsContainer.innerHTML = '';

    questions.forEach((q, qIdx) => {
      const card = document.createElement('div');
      card.className = 'question-card';

      const legend = `
        <div class="question-legend">
          <span class="q-badge">0${qIdx + 1}</span>
          <span class="q-skill">${q.skill}</span>
        </div>
        <h3>${q.title}</h3>
      `;

      let optionsHtml = '<div class="options-group">';
      q.options.forEach((opt, optIdx) => {
        const isChecked = state.diagnosticAnswers[qIdx] === optIdx;
        optionsHtml += `
          <label class="option-label">
            <input type="radio" name="question_${qIdx}" value="${optIdx}" ${isChecked ? 'checked' : ''}>
            <span><strong>${optIdx + 1})</strong> ${opt}</span>
          </label>
        `;
      });
      optionsHtml += '</div>';

      let feedbackHtml = '';
      if (state.isDiagnosticFeedbackRevealed) {
        const userChoice = state.diagnosticAnswers[qIdx];
        const isCorrect = userChoice === q.answer;
        const boxClass = isCorrect ? 'correct' : 'retry';
        const titleText = isCorrect ? '✅ 선택을 확인했습니다 (정답)' : '💡 다시 생각해 볼 질문';

        feedbackHtml = `
          <div class="feedback-box ${boxClass}">
            <b>${titleText}</b>
            <p>${q.explanation}</p>
            <div class="feedback-followup">
              <strong>추가 질문:</strong> ${q.followup}
            </div>
          </div>
        `;
      }

      card.innerHTML = legend + optionsHtml + feedbackHtml;

      // Radio change listener
      const radios = card.querySelectorAll(`input[name="question_${qIdx}"]`);
      radios.forEach(r => {
        r.addEventListener('change', e => {
          state.diagnosticAnswers[qIdx] = parseInt(e.target.value, 10);
          state.isDiagnosticFeedbackRevealed = false;
          renderDiagnostics();
        });
      });

      questionsContainer.appendChild(card);
    });
  }

  function renderSignals() {
    classSizeInput.value = state.classSize;
    const questions = generateQuestions(state.params);
    countsGridContainer.innerHTML = '';

    const questionStats = [];

    questions.forEach((q, qIdx) => {
      const countsArr = state.counts[qIdx];
      const totalRespondents = countsArr.reduce((acc, cur) => acc + cur, 0);
      const unanswered = Math.max(0, state.classSize - totalRespondents);
      const correctCount = countsArr[q.answer] || 0;
      const rate = totalRespondents > 0 ? Math.round((correctCount / totalRespondents) * 100) : null;

      questionStats.push({
        qIdx,
        skill: q.skill,
        followup: q.followup,
        total: totalRespondents,
        correct: correctCount,
        rate
      });

      const card = document.createElement('div');
      card.className = 'count-card';

      let rowsHtml = '';
      q.options.forEach((opt, optIdx) => {
        const isCorrectOpt = optIdx === q.answer;
        rowsHtml += `
          <div class="count-input-row ${isCorrectOpt ? 'correct-target' : ''}">
            <span class="count-opt-text" title="${opt}"><strong>${optIdx + 1})</strong> ${opt}</span>
            <input type="number" min="0" max="${state.classSize}" value="${countsArr[optIdx]}" data-q="${qIdx}" data-opt="${optIdx}" aria-label="문항 ${qIdx + 1} 보기 ${optIdx + 1} 인원">
          </div>
        `;
      });

      card.innerHTML = `
        <div class="count-card-title">
          <span>Q${qIdx + 1}. ${q.skill}</span>
          <span style="font-size: 0.8rem; color: var(--text-dim);">${q.answer + 1}번 정답</span>
        </div>
        ${rowsHtml}
        <div class="count-stats-row">
          <div class="count-meta">
            <span>응답 ${totalRespondents} / ${state.classSize}명</span>
            <span>무응답 ${unanswered}명</span>
          </div>
          <div class="rate-bar-container">
            <div class="rate-bar-fill" style="width: ${rate !== null ? rate : 0}%"></div>
          </div>
          <div class="rate-label-row">
            <span>정답률 (응답자 기준)</span>
            <b>${rate !== null ? `${rate}%` : '집계 전'}</b>
          </div>
        </div>
      `;

      // Input event listener
      const inputs = card.querySelectorAll('input[type="number"]');
      inputs.forEach(inp => {
        inp.addEventListener('input', e => {
          const qi = parseInt(e.target.dataset.q, 10);
          const oi = parseInt(e.target.dataset.opt, 10);
          let val = parseInt(e.target.value, 10);
          if (isNaN(val) || val < 0) val = 0;
          if (val > state.classSize) val = state.classSize;

          state.counts[qi][oi] = val;
          renderSignals();
          renderRoutes();
        });
      });

      countsGridContainer.appendChild(card);
    });

    // Priority recommendation calculation
    const answeredStats = questionStats.filter(s => s.rate !== null && s.total > 0);
    if (answeredStats.length > 0) {
      // Sort by rate ascending, tie breaker lowest qIdx
      answeredStats.sort((a, b) => a.rate - b.rate || a.qIdx - b.qIdx);
      const lowest = answeredStats[0];
      priorityTitle.textContent = `Q${lowest.qIdx + 1} [${lowest.skill}]부터 한 번 더 물어보세요! (정답률 ${lowest.rate}%)`;
      priorityDesc.textContent = `💡 추천 추가 질문: "${lowest.followup}"`;
    } else {
      priorityTitle.textContent = '응답을 입력하면 추가 질문을 추천합니다.';
      priorityDesc.textContent = '집계가 없는 문항은 우선순위 계산에서 제외됩니다.';
    }
  }

  function getPriorityInfo() {
    const questions = generateQuestions(state.params);
    const questionStats = [];
    questions.forEach((q, qIdx) => {
      const countsArr = state.counts[qIdx];
      const total = countsArr.reduce((a, b) => a + b, 0);
      const rate = total > 0 ? Math.round((countsArr[q.answer] / total) * 100) : null;
      if (rate !== null && total > 0) {
        questionStats.push({
          qIdx,
          skill: q.skill,
          followup: q.followup,
          rate
        });
      }
    });

    if (questionStats.length > 0) {
      questionStats.sort((a, b) => a.rate - b.rate || a.qIdx - b.qIdx);
      return questionStats[0];
    }
    return null;
  }

  function renderRoutes() {
    btnRouteSupport.classList.toggle('active', state.route === 'support');
    btnRouteSupport.setAttribute('aria-selected', String(state.route === 'support'));
    btnRouteExtend.classList.toggle('active', state.route === 'extend');
    btnRouteExtend.setAttribute('aria-selected', String(state.route === 'extend'));

    const priorityInfo = getPriorityInfo();
    const timeline = generateTimeline(state.params, state.route, priorityInfo);

    routeTimelineContainer.innerHTML = '';
    timeline.forEach(step => {
      const card = document.createElement('div');
      card.className = 'timeline-step-card';
      card.innerHTML = `
        <div class="step-time-badge">${step.minutes}분</div>
        <div class="step-content">
          <h4 class="step-title">${step.title}</h4>
          <p class="step-desc">${step.task}</p>
        </div>
      `;
      routeTimelineContainer.appendChild(card);
    });
  }

  function renderAll() {
    renderHeroAndGraph();
    renderDiagnostics();
    renderSignals();
    renderRoutes();
  }

  // --- 8. Event Handlers ---

  // Author & Opening inputs
  authorInput.addEventListener('input', e => {
    state.author = e.target.value.trim() || '선생님';
    renderHeroAndGraph();
  });

  openingInput.addEventListener('input', e => {
    state.opening = e.target.value;
    renderHeroAndGraph();
  });

  // Params dropdowns
  function onParamsChange() {
    const a = parseInt(paramA.value, 10);
    const h = parseInt(paramH.value, 10);
    const k = parseInt(paramK.value, 10);
    let left = parseInt(paramLeft.value, 10);
    let right = parseInt(paramRight.value, 10);

    if (left >= right) {
      if (left === 4) left = 3;
      right = left + 1;
      paramLeft.value = left;
      paramRight.value = right;
    }

    state.params = { a, h, k, left, right };

    // Reset diagnostic answers and teacher reveal
    state.diagnosticAnswers = [-1, -1, -1];
    state.isDiagnosticFeedbackRevealed = false;
    state.isTeacherAnswerRevealed = false;
    state.isVerified = false;
    checkVerified.checked = false;
    btnDownloadTeacher.disabled = true;
    if (btnPrintTeacherPdf) btnPrintTeacherPdf.disabled = true;
    if (teacherLockText) {
      teacherLockText.textContent = '검산 확인 시 활성화';
    }

    // Reset preset active state
    presetOutside.classList.remove('active');
    presetInside.classList.remove('active');
    presetBoundary.classList.remove('active');

    renderAll();
    showToast('조건을 바꾸어 답 선택·해설 공개·검산을 초기화했습니다.');
  }

  [paramA, paramH, paramK, paramLeft, paramRight].forEach(el => {
    el.addEventListener('change', onParamsChange);
  });

  // Presets
  presetOutside.addEventListener('click', () => {
    paramA.value = 1;
    paramH.value = 1;
    paramK.value = -2;
    paramLeft.value = 2;
    paramRight.value = 4;
    onParamsChange();
    presetOutside.classList.add('active');
  });

  presetInside.addEventListener('click', () => {
    paramA.value = 1;
    paramH.value = 1;
    paramK.value = -2;
    paramLeft.value = -1;
    paramRight.value = 3;
    onParamsChange();
    presetInside.classList.add('active');
  });

  presetBoundary.addEventListener('click', () => {
    paramA.value = 1;
    paramH.value = 1;
    paramK.value = -2;
    paramLeft.value = 1;
    paramRight.value = 4;
    onParamsChange();
    presetBoundary.classList.add('active');
  });

  // Teacher check drawer toggle
  btnToggleTeacherAnswer.addEventListener('click', () => {
    state.isTeacherAnswerRevealed = !state.isTeacherAnswerRevealed;
    renderHeroAndGraph();
  });

  // Diagnostic actions
  btnCheckDiagnostic.addEventListener('click', () => {
    state.isDiagnosticFeedbackRevealed = true;
    renderDiagnostics();
    showToast('문항별 피드백과 추가 질문을 열었습니다.');
  });

  btnResetDiagnostic.addEventListener('click', () => {
    state.diagnosticAnswers = [-1, -1, -1];
    state.isDiagnosticFeedbackRevealed = false;
    renderDiagnostics();
    showToast('선택한 답을 초기화했습니다.');
  });

  // Classroom Signals buttons
  classSizeInput.addEventListener('change', e => {
    let size = parseInt(e.target.value, 10);
    if (isNaN(size) || size < 1) size = 1;
    if (size > 60) size = 60;
    state.classSize = size;
    renderSignals();
  });

  btnLoadMockData.addEventListener('click', () => {
    state.classSize = 20;
    state.counts = [
      [9, 8, 3],
      [4, 14, 2],
      [6, 11, 3]
    ];
    renderSignals();
    renderRoutes();
    showToast('가상 20명 응답 데이터를 불러왔습니다.');
  });

  btnClearCounts.addEventListener('click', () => {
    state.counts = [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0]
    ];
    renderSignals();
    renderRoutes();
    showToast('익명 집계 인원을 0명으로 비웠습니다.');
  });

  // Route selector
  btnRouteSupport.addEventListener('click', () => {
    state.route = 'support';
    renderRoutes();
    showToast('경로 A · 개념 다지기(15분)를 선택했습니다.');
  });

  btnRouteExtend.addEventListener('click', () => {
    state.route = 'extend';
    renderRoutes();
    showToast('경로 B · 적용 확장(15분)을 선택했습니다.');
  });

  // Copy Route Lesson Plan
  btnCopyRoute.addEventListener('click', () => {
    const priorityInfo = getPriorityInfo();
    const timeline = generateTimeline(state.params, state.route, priorityInfo);
    const routeTitle = state.route === 'support' ? '개념 다지기 (후보·대입·비교 중심)' : '적용 확장 (구간 변경·경계 사례 중심)';

    const textToCopy = `[${state.author}의 15분 후속 수업안 · ${routeTitle}]
함수식: ${formatFormula(state.params)}, 구간: ${state.params.left} ≤ x ≤ ${state.params.right}
도입 질문: "${state.opening}"

${timeline.map((s, idx) => `${idx + 1}. [${s.minutes}분] ${s.title}\n   - ${s.task}`).join('\n\n')}

교사 지도 메모: ${state.teacherNote}`;

    navigator.clipboard.writeText(textToCopy).then(() => {
      showToast('15분 수업안이 클립보드에 복사되었습니다!');
      manualCopyBox.hidden = true;
    }).catch(() => {
      manualCopyBox.hidden = false;
      manualCopyTextarea.value = textToCopy;
      manualCopyTextarea.select();
      showToast('클립보드 접근이 제한되어 아래 텍스트 상자에 복사할 내용을 표시했습니다.');
    });
  });

  // Teacher Note & Verification Checkbox
  teacherNoteInput.addEventListener('input', e => {
    state.teacherNote = e.target.value;
  });

  checkVerified.addEventListener('change', e => {
    state.isVerified = e.target.checked;
    btnDownloadTeacher.disabled = !state.isVerified;
    if (btnPrintTeacherPdf) btnPrintTeacherPdf.disabled = !state.isVerified;
    if (teacherLockText) {
      teacherLockText.textContent = state.isVerified ? '✅ 검산 완료 · 다운로드 가능' : '검산 확인 시 활성화';
    }
    if (state.isVerified) {
      showToast('검산이 확인되어 교사용 해설 저장 및 PDF 인쇄가 활성화되었습니다.');
    }
  });

  // --- 9. Export Functions (HTML Generation) ---

  function downloadFile(content, fileName, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast(`${fileName} 파일을 다운로드했습니다.`);
  }

  // Escape HTML helper
  function esc(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // --- 9. Export Functions (HTML Generation & Direct PDF Print) ---

  // Student Activity Sheet HTML (정답·해설·메모·집계 배제)
  function buildStudentHtml() {
    const questions = generateQuestions(state.params);
    const priorityInfo = getPriorityInfo();
    const timeline = generateTimeline(state.params, state.route, priorityInfo);
    const routeName = state.route === 'support' ? '개념 다지기' : '적용 확장';
    const svgCode = renderSvgGraph(state.params, false);

    return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>수업 시작 5분 진단 & 15분 활동지 - ${esc(state.author)}</title>
  <style>
    @page { size: A4 portrait; margin: 12mm 15mm; }
    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; box-sizing: border-box; }
    body {
      max-width: 820px;
      margin: 10px auto;
      padding: 10px 15px;
      font-family: -apple-system, BlinkMacSystemFont, "Pretendard", "Segoe UI", Roboto, sans-serif;
      color: #173c50;
      line-height: 1.5;
    }
    .no-print {
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 10px 16px;
      margin-bottom: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
    }
    .print-tip {
      font-size: 13px;
      font-weight: 700;
      color: #334155;
    }
    .print-bar-btn {
      background: #087f82;
      color: #fff;
      border: none;
      padding: 7px 16px;
      border-radius: 6px;
      font-weight: 700;
      font-size: 13px;
      cursor: pointer;
    }
    .sheet-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      border-bottom: 2px solid #087f82;
      padding-bottom: 8px;
      margin-bottom: 10px;
    }
    .sheet-title h1 {
      font-size: 19px;
      margin: 0 0 3px;
      color: #087f82;
    }
    .sheet-title p {
      margin: 0;
      font-size: 12px;
      color: #64748b;
    }
    .student-info-box {
      border: 1px solid #cbd5e1;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 12px;
      white-space: nowrap;
    }
    .formula-banner {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 8px 12px;
      margin-bottom: 10px;
      text-align: center;
    }
    .math-title {
      font-size: 17px;
      font-weight: 800;
      margin-bottom: 4px;
      font-family: serif;
    }
    .opening-quote {
      font-size: 12.5px;
      font-weight: 600;
      color: #0f766e;
    }
    .graph-box {
      text-align: center;
      margin-bottom: 10px;
    }
    .graph-box svg {
      max-width: 440px;
      max-height: 160px;
      height: auto;
      margin: 0 auto;
      display: block;
    }
    .section-heading {
      font-size: 14.5px;
      font-weight: 800;
      border-left: 4px solid #087f82;
      padding-left: 8px;
      margin: 12px 0 8px;
      color: #0f172a;
    }
    .question-item {
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 7px 10px;
      margin-bottom: 7px;
      break-inside: avoid;
    }
    .question-item h3 {
      font-size: 13px;
      margin: 0 0 4px;
      line-height: 1.35;
    }
    .options-row {
      display: flex;
      gap: 14px;
      font-size: 12px;
      margin-bottom: 4px;
    }
    .blank-box {
      height: 32px;
      border: 1px dashed #94a3b8;
      border-radius: 4px;
      background: #fdfdfd;
      padding: 3px 6px;
      font-size: 11px;
      color: #94a3b8;
    }
    .page-break {
      page-break-after: always;
      break-after: page;
    }
    .timeline-item {
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 10px 14px;
      margin-bottom: 10px;
      break-inside: avoid;
    }
    .timeline-top {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 4px;
    }
    .badge-min {
      background: #087f82;
      color: #fff;
      font-size: 11px;
      font-weight: 700;
      padding: 2px 7px;
      border-radius: 4px;
    }
    .timeline-title {
      font-size: 14px;
      font-weight: 700;
    }
    .timeline-desc {
      font-size: 12.5px;
      color: #334155;
      margin-bottom: 6px;
      line-height: 1.45;
    }
    .timeline-item .blank-box {
      height: 54px;
      font-size: 11.5px;
    }
    .footer-note {
      text-align: center;
      font-size: 11px;
      color: #94a3b8;
      margin-top: 20px;
      border-top: 1px solid #e2e8f0;
      padding-top: 10px;
    }
    @media print {
      body { margin: 0; padding: 0; max-width: 100%; }
      .no-print { display: none !important; }
      .page-break { page-break-after: always !important; break-after: page !important; }
    }
  </style>
</head>
<body>
  <div class="no-print">
    <span class="print-tip">💡 인쇄 창에서 대상을 <strong>'PDF로 저장'</strong>으로 선택하시면 2페이지 활동지로 깔끔하게 저장됩니다.</span>
    <button class="print-bar-btn" onclick="window.print()">🖨️ PDF 저장 / 인쇄</button>
  </div>

  <!-- [PAGE 1] PART 1: 5분 생각 꺼내기 (도입 + 그래프 + 3문항 전체가 한 페이지에 쏙!) -->
  <div class="sheet-page">
    <div class="sheet-header">
      <div class="sheet-title">
        <h1>수학1 · 제한된 구간에서 이차함수의 최대·최소</h1>
        <p>지도교사: ${esc(state.author)} | 2022 개정 공통수학1 [10공수1-02-06]</p>
      </div>
      <div class="student-info-box">
        <span>학년 / 반: _______  번호: _____  이름: ______________</span>
      </div>
    </div>

    <div class="formula-banner">
      <div class="math-title">${esc(formatFormula(state.params))} &nbsp; ( ${state.params.left} ≤ x ≤ ${state.params.right} )</div>
      <div class="opening-quote">“${esc(state.opening)}”</div>
    </div>

    <div class="graph-box">
      ${svgCode}
    </div>

    <div class="section-heading">PART 1 · 5분 생각 꺼내기 (답을 고르고 이유를 적어보세요)</div>
    ${questions.map((q, idx) => `
      <div class="question-item">
        <h3>${idx + 1}. [${esc(q.skill)}] ${esc(q.title)}</h3>
        <div class="options-row">
          ${q.options.map((opt, oIdx) => `<span>(${oIdx + 1}) ${esc(opt)}</span>`).join('&nbsp;&nbsp;&nbsp;&nbsp;')}
        </div>
        <div class="blank-box">선택한 이유와 풀이 과정을 간단히 서술하세요:</div>
      </div>
    `).join('')}
  </div>

  <!-- PART 1과 PART 2 분리를 위한 강제 페이지 넘김 -->
  <div class="page-break"></div>

  <!-- [PAGE 2] PART 2: 15분 후속 활동 (4단계 활동 순서 및 기록란이 한 페이지에 쏙!) -->
  <div class="sheet-page">
    <div class="section-heading" style="margin-top: 0;">PART 2 · 15분 후속 활동 [선택 경로: ${esc(routeName)}]</div>
    ${timeline.map(s => `
      <div class="timeline-item">
        <div class="timeline-top">
          <span class="badge-min">${s.minutes}분</span>
          <span class="timeline-title">${esc(s.title)}</span>
        </div>
        <p class="timeline-desc">${esc(s.task)}</p>
        <div class="blank-box">활동 기록 및 짝 설명 요약:</div>
      </div>
    `).join('')}

    <div class="footer-note">
      초강스 에듀테크 LAB · 6주차 수업 설계 활동지 | 가상 예시 · 개인정보 수집 없음
    </div>
  </div>
</body>
</html>`;
  }

  // Teacher Guide Sheet HTML (모든 정답·해설·검산표·교사메모 포함)
  function buildTeacherHtml() {
    const questions = generateQuestions(state.params);
    const analysis = computeIntervalAnalysis(state.params);
    const priorityInfo = getPriorityInfo();
    const timeline = generateTimeline(state.params, state.route, priorityInfo);
    const shifted = getShiftedParams(state.params);
    const shiftedAnalysis = computeIntervalAnalysis(shifted);
    const routeName = state.route === 'support' ? '개념 다지기' : '적용 확장';
    const svgCode = renderSvgGraph(state.params, true);

    return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[교사용 수업안] 수업 시작 5분 진단 & 15분 후속 설계 - ${esc(state.author)}</title>
  <style>
    @page { size: A4 portrait; margin: 12mm 15mm; }
    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; box-sizing: border-box; }
    body {
      max-width: 860px;
      margin: 10px auto;
      padding: 10px 15px;
      font-family: -apple-system, BlinkMacSystemFont, "Pretendard", "Segoe UI", Roboto, sans-serif;
      color: #0f172a;
      line-height: 1.5;
    }
    .no-print {
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 8px;
      padding: 10px 16px;
      margin-bottom: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
    }
    .print-tip {
      font-size: 13px;
      font-weight: 700;
      color: #1e40af;
    }
    .print-bar-btn {
      background: #2563eb;
      color: #fff;
      border: none;
      padding: 7px 16px;
      border-radius: 6px;
      font-weight: 700;
      font-size: 13px;
      cursor: pointer;
    }
    .header-bar {
      border-bottom: 2px solid #2563eb;
      padding-bottom: 8px;
      margin-bottom: 10px;
    }
    h1 {
      font-size: 19px;
      color: #1e3a8a;
      margin: 0 0 3px;
    }
    .meta-p {
      margin: 0;
      font-size: 12px;
      color: #64748b;
    }
    .box-info {
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 6px;
      padding: 8px 12px;
      margin-bottom: 10px;
      font-size: 12px;
      line-height: 1.5;
    }
    .section-title {
      font-size: 14.5px;
      font-weight: 800;
      color: #1e40af;
      border-left: 4px solid #2563eb;
      padding-left: 8px;
      margin: 10px 0 6px;
    }
    .side-by-side {
      display: flex;
      gap: 14px;
      align-items: center;
      margin-bottom: 8px;
    }
    .side-graph {
      flex: 1.1;
      text-align: center;
    }
    .side-graph svg {
      max-width: 100%;
      max-height: 155px;
      height: auto;
      display: block;
      margin: 0 auto;
    }
    .side-table {
      flex: 1;
    }
    .check-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11.5px;
    }
    .check-table th, .check-table td {
      border: 1px solid #cbd5e1;
      padding: 5px 6px;
      text-align: center;
    }
    .check-table th {
      background: #f1f5f9;
      font-weight: 700;
    }
    .q-box {
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 7px 10px;
      margin-bottom: 6px;
      background: #f8fafc;
      break-inside: avoid;
    }
    .q-box h3 {
      font-size: 12.5px;
      margin: 0 0 3px;
      color: #0f172a;
      line-height: 1.35;
    }
    .ans-tag {
      color: #2563eb;
      font-weight: 800;
    }
    .page-break {
      page-break-after: always;
      break-after: page;
    }
    .timeline-step-row {
      border-bottom: 1px dashed #cbd5e1;
      padding: 8px 0;
      font-size: 12px;
    }
    .memo-box {
      background: #fefce8;
      border: 1px solid #fef08a;
      border-radius: 6px;
      padding: 10px 14px;
      font-size: 12px;
      line-height: 1.55;
    }
    .caution-box {
      background: #f1f5f9;
      border-left: 4px solid #64748b;
      padding: 8px 12px;
      font-size: 11px;
      color: #475569;
      margin-top: 12px;
      line-height: 1.5;
    }
    .footer-note {
      text-align: center;
      font-size: 11px;
      color: #94a3b8;
      margin-top: 16px;
      border-top: 1px solid #e2e8f0;
      padding-top: 8px;
    }
    @media print {
      body { margin: 0; padding: 0; max-width: 100%; }
      .no-print { display: none !important; }
      .page-break { page-break-after: always !important; break-after: page !important; }
    }
  </style>
</head>
<body>
  <div class="no-print">
    <span class="print-tip">💡 인쇄 창에서 대상을 <strong>'PDF로 저장'</strong>으로 선택하시면 2페이지 교사용 수업안으로 깔끔하게 저장됩니다.</span>
    <button class="print-bar-btn" onclick="window.print()">🖨️ PDF 저장 / 인쇄</button>
  </div>

  <!-- [PAGE 1] 교사용 5분 진단 & 함수 분석 & 3문항 해설 전체가 한 페이지에 쏙! -->
  <div class="sheet-page">
    <div class="header-bar">
      <h1>[교사용 수업안 & 해설] 수업 시작 5분 → 15분 두 갈래 수업 설계</h1>
      <p class="meta-p">작성 교사: ${esc(state.author)} | 2022 개정 공통수학1 [10공수1-02-06] 제한된 구간에서 이차함수의 최대·최소</p>
    </div>

    <div class="box-info">
      <strong>📐 수업 기본 조건:</strong> ${esc(formatFormula(state.params))} &nbsp;|&nbsp; 닫힌구간: ${state.params.left} ≤ x ≤ ${state.params.right}<br>
      <strong>도입 질문:</strong> “${esc(state.opening)}”<br>
      <strong>꼭짓점 판정:</strong> x = ${state.params.h} (${analysis.inside ? '구간 안에 포함됨' : '구간 밖이므로 후보 제외'})
    </div>

    <div class="side-by-side">
      <div class="side-graph">
        ${svgCode}
      </div>
      <div class="side-table">
        <div class="section-title" style="margin-top: 0;">1. 후보점 및 대입 검산표</div>
        <table class="check-table">
          <thead>
            <tr>
              <th>후보 x</th>
              <th>f(x) 대입 과정</th>
              <th>함숫값</th>
              <th>판정</th>
            </tr>
          </thead>
          <tbody>
            ${analysis.points.map(p => `
              <tr>
                <td>x = ${p.x}</td>
                <td>f(${p.x}) = ${state.params.a === 1 ? '' : state.params.a}(${p.x} - ${state.params.h})² + (${state.params.k})</td>
                <td><strong>${p.y}</strong></td>
                <td>${p.y === analysis.minY ? '<span style="color:#0284c7;font-weight:700;">최솟값</span>' : p.y === analysis.maxY ? '<span style="color:#7c3aed;font-weight:700;">최댓값</span>' : '중간값'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <div class="section-title">2. 3문항 미니 진단 정답 & 교사용 해설</div>
    ${questions.map((q, idx) => `
      <div class="q-box">
        <h3>${idx + 1}. [${esc(q.skill)}] ${esc(q.title)}</h3>
        <p style="margin:2px 0;"><span class="ans-tag">정답: ${q.answer + 1}번 (${esc(q.options[q.answer])})</span></p>
        <p style="margin:2px 0 4px; font-size:11.5px; color:#334155;"><strong>해설:</strong> ${esc(q.explanation)}</p>
        <p style="margin:0; font-size:11.5px; color:#0369a1;"><strong>교사용 추가 발문:</strong> ${esc(q.followup)}</p>
      </div>
    `).join('')}
  </div>

  <!-- 페이지 분리를 위한 강제 페이지 넘김 -->
  <div class="page-break"></div>

  <!-- [PAGE 2] 오늘의 15분 후속 수업 설계 & 변경 구간 & 지도 메모 & 평가 원칙이 한 페이지에 쏙! -->
  <div class="sheet-page">
    <div class="section-title" style="margin-top: 0;">3. 오늘의 15분 후속 수업 설계 [선택 경로: ${esc(routeName)}]</div>
    <div style="margin-bottom: 12px;">
      ${timeline.map((s, idx) => `
        <div class="timeline-step-row">
          <strong>[${s.minutes}분] ${idx + 1}. ${esc(s.title)}</strong><br>
          <span style="color:#334155; line-height: 1.45;">${esc(s.task)}</span>
        </div>
      `).join('')}
    </div>

    <div class="section-title">4. 변경 구간 적용 검산 해설</div>
    <div class="box-info">
      <strong>새로운 구간:</strong> [ ${shifted.left}, ${shifted.right} ]<br>
      <strong>후보 대입 결과:</strong> ${shiftedAnalysis.points.map(p => `f(${p.x}) = ${p.y}`).join(', ')}<br>
      <strong>결과:</strong> 최솟값 <strong>${shiftedAnalysis.minY}</strong>, 최댓값 <strong>${shiftedAnalysis.maxY}</strong>
    </div>

    <div class="section-title">5. 교사 수업 지도 메모</div>
    <div class="memo-box">
      ${esc(state.teacherNote) || '작성된 교사 메모가 없습니다.'}
    </div>

    <div class="caution-box">
      ※ <strong>익명 집계 및 평가 원칙:</strong> 학급 보기별 응답 인원수는 오늘의 추가 질문과 후속 활동을 결정하기 위한 교육적 참고 신호이며, 개별 학생의 능력을 판정하거나 오개념을 확정하는 근거로 사용하지 않습니다.
    </div>

    <div class="footer-note">
      초강스 에듀테크 LAB · 6주차 교사용 수업안 | 가상 예시 · 개인정보 수집 없음
    </div>
  </div>
</body>
</html>`;
  }

  // Direct Print / Save as PDF via invisible iframe
  function printPdfDirectly(isTeacher) {
    if (isTeacher && !state.isVerified) {
      showToast('먼저 검산 완료 확인 체크박스를 체크해 주세요.');
      return;
    }

    let printIframe = document.getElementById('printHiddenIframe');
    if (!printIframe) {
      printIframe = document.createElement('iframe');
      printIframe.id = 'printHiddenIframe';
      printIframe.style.position = 'fixed';
      printIframe.style.right = '0';
      printIframe.style.bottom = '0';
      printIframe.style.width = '0';
      printIframe.style.height = '0';
      printIframe.style.border = '0';
      printIframe.style.visibility = 'hidden';
      document.body.appendChild(printIframe);
    }

    const htmlContent = isTeacher ? buildTeacherHtml() : buildStudentHtml();
    const doc = printIframe.contentWindow.document;
    doc.open();
    doc.write(htmlContent);
    doc.close();

    showToast(`${isTeacher ? '교사용 해설' : '학생용 활동지'} 인쇄 창을 열었습니다. 대상에서 'PDF로 저장'을 선택하세요.`);

    setTimeout(() => {
      printIframe.contentWindow.focus();
      printIframe.contentWindow.print();
    }, 280);
  }

  // Student download & print events
  btnDownloadStudent.addEventListener('click', () => {
    downloadFile(buildStudentHtml(), `week6-4-student-${state.params.left}_${state.params.right}.html`, 'text/html;charset=utf-8');
  });

  btnPrintStudentPdf.addEventListener('click', () => {
    printPdfDirectly(false);
  });

  // Teacher download & print events
  btnDownloadTeacher.addEventListener('click', () => {
    if (!state.isVerified) {
      showToast('먼저 검산 완료 확인 체크박스를 체크해 주세요.');
      return;
    }
    downloadFile(buildTeacherHtml(), `week6-4-teacher-${state.params.left}_${state.params.right}.html`, 'text/html;charset=utf-8');
  });

  btnPrintTeacherPdf.addEventListener('click', () => {
    printPdfDirectly(true);
  });

  // --- 10. Toast Notification Helper ---
  let toastTimer = null;
  function showToast(msg) {
    if (toastTimer) clearTimeout(toastTimer);
    toast.textContent = msg;
    toast.classList.add('show');
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }

  // --- 11. Initial Run ---
  renderAll();
});
