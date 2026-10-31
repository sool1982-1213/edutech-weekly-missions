/**
 * 초강스 에듀테크 LAB 7주차 중수 미션: 조건을 바꾸는 문항 메이커
 * 2022 개정 공통수학1 [10공수1-02-11] 이차부등식의 해와 이차함수 그래프
 * 지도교사: 수현T
 */

(function () {
  'use strict';

  // 1. Core State
  const state = {
    a: 1,           // -3, -2, -1, 1, 2, 3
    r: -1,          // -4 <= r < s <= 4
    s: 3,
    op: 'le',       // 'lt', 'le', 'gt', 'ge'
    author: '수현T',
    instruction: '부호를 판단한 근거와 영점의 포함 여부를 스스로 점검하고 적어보세요.',
    note: '두 근 바깥과 사이의 부호를 대입으로 검산하고, 등호 유무에 따라 영점 포함 여부를 명확히 설명할 것',
    selectedOptionIdx: null,
    solutionRevealed: false,
    activeTab: 'task-solve'
  };

  const OP_MAP = {
    lt: '<',
    le: '≤',
    gt: '>',
    ge: '≥'
  };

  const OP_FLIP_EQ = {
    lt: 'le',
    le: 'lt',
    gt: 'ge',
    ge: 'gt'
  };

  // 2. Math Utility Functions
  function evalF(params, x) {
    return params.a * (x - params.r) * (x - params.s);
  }

  function rootFactor(root) {
    if (root === 0) return 'x';
    return root > 0 ? `(x − ${root})` : `(x + ${Math.abs(root)})`;
  }

  function exprString(params) {
    let lead = '';
    if (params.a === -1) lead = '−';
    else if (params.a !== 1) lead = `${params.a}`;
    return `${lead}${rootFactor(params.r)}${rootFactor(params.s)}`;
  }

  function expandedString(params) {
    const A = params.a;
    const B = -params.a * (params.r + params.s);
    const C = params.a * params.r * params.s;

    let strA = '';
    if (A === 1) strA = 'x²';
    else if (A === -1) strA = '−x²';
    else strA = `${A}x²`;

    let strB = '';
    if (B !== 0) {
      const sign = B > 0 ? ' + ' : ' − ';
      const absB = Math.abs(B) === 1 ? '' : Math.abs(B);
      strB = `${sign}${absB}x`;
    }

    let strC = '';
    if (C !== 0) {
      const sign = C > 0 ? ' + ' : ' − ';
      strC = `${sign}${Math.abs(C)}`;
    }

    return `${strA}${strB}${strC}`;
  }

  function ineqString(params) {
    return `${exprString(params)} ${OP_MAP[params.op]} 0`;
  }

  function solveInterval(params) {
    const isInner = (params.a > 0) === (params.op === 'lt' || params.op === 'le');
    const isClosed = (params.op === 'le' || params.op === 'ge');
    return {
      inner: isInner,
      closed: isClosed,
      r: params.r,
      s: params.s
    };
  }

  function answerString(params) {
    const sol = solveInterval(params);
    const opSym = sol.closed ? '≤' : '<';
    const opSymGt = sol.closed ? '≥' : '>';
    if (sol.inner) {
      return `${params.r} ${opSym} x ${opSym} ${params.s}`;
    } else {
      return `x ${opSym} ${params.r} 또는 x ${opSymGt} ${params.s}`;
    }
  }

  function generateChoices(params) {
    const ops = ['lt', 'le', 'gt', 'ge'];
    // Deterministic offset based on roots and a to shuffle position
    const shift = (Math.abs(params.r + params.s) + Math.abs(params.a)) % 4;
    const shiftedOps = [...ops.slice(shift), ...ops.slice(0, shift)];

    return shiftedOps.map(testOp => {
      const testParams = { ...params, op: testOp };
      const ansText = answerString(testParams);
      return {
        op: testOp,
        text: ansText,
        isCorrect: testOp === params.op
      };
    });
  }

  function generateSvg(params) {
    const sol = solveInterval(params);
    const signs = params.a > 0 ? ['+', '−', '+'] : ['−', '+', '−'];
    const ansText = answerString(params);

    const escapeXml = (str) => String(str).replace(/[&<>"']/g, m => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[m]);

    const activeInnerPath = `<path d="M155 145H445" stroke="#087f82" stroke-width="7"/>`;
    const activeOuterPath = `
      <path d="M30 145H155M445 145H570" stroke="#087f82" stroke-width="7"/>
      <path d="M42 138L30 145L42 152M558 138L570 145L558 152" fill="none" stroke="#087f82" stroke-width="3"/>
    `;

    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 215" role="img" aria-label="부호와 해의 수직선: ${escapeXml(ansText)}">
        <rect width="600" height="215" rx="14" fill="#eef4ef"/>
        
        <!-- Function Formula & Sign Guide -->
        <text x="25" y="30" fill="#284354" font-size="14" font-weight="700">f(x) = ${escapeXml(exprString(params))}</text>
        <text x="575" y="30" text-anchor="end" fill="#58737e" font-size="12">${params.a > 0 ? '아래로 볼록 (a > 0)' : '위로 볼록 (a < 0)'}</text>
        
        <!-- Guide Lines -->
        <path d="M30 95H570M155 45V175M445 45V175" stroke="#9bb0ae" stroke-dasharray="4 4"/>
        
        <!-- Signs in 3 regions -->
        <text x="80" y="78" text-anchor="middle" font-size="28" font-weight="800" fill="${signs[0] === '+' ? '#0b787e' : '#c4666f'}">${signs[0]}</text>
        <text x="300" y="78" text-anchor="middle" font-size="28" font-weight="800" fill="${signs[1] === '+' ? '#0b787e' : '#c4666f'}">${signs[1]}</text>
        <text x="520" y="78" text-anchor="middle" font-size="28" font-weight="800" fill="${signs[2] === '+' ? '#0b787e' : '#c4666f'}">${signs[2]}</text>
        
        <!-- Zero markers on sign line -->
        <text x="155" y="78" text-anchor="middle" font-size="22" font-weight="700" fill="#284354">0</text>
        <text x="445" y="78" text-anchor="middle" font-size="22" font-weight="700" fill="#284354">0</text>
        
        <!-- Number Line Axis -->
        <path d="M30 145H570" stroke="#728e91" stroke-width="2"/>
        
        <!-- Solution Highlighting -->
        ${sol.inner ? activeInnerPath : activeOuterPath}
        
        <!-- Circles for roots r and s -->
        <circle cx="155" cy="145" r="7" fill="${sol.closed ? '#087f82' : '#ffffff'}" stroke="#087f82" stroke-width="3"/>
        <text x="155" y="186" text-anchor="middle" font-size="18" font-weight="800" fill="#284354">${params.r}</text>
        
        <circle cx="445" cy="145" r="7" fill="${sol.closed ? '#087f82' : '#ffffff'}" stroke="#087f82" stroke-width="3"/>
        <text x="445" y="186" text-anchor="middle" font-size="18" font-weight="800" fill="#284354">${params.s}</text>
        
        <!-- Axis Labels -->
        <text x="580" y="150" font-size="14" font-weight="700" fill="#728e91">x</text>
      </svg>
    `;
  }

  function generateSteps(params) {
    const sol = solveInterval(params);
    const aText = params.a > 0 ? '양수' : '음수';
    const outsideSign = params.a > 0 ? '양수(+)' : '음수(−)';
    const insideSign = params.a > 0 ? '음수(−)' : '양수(+)';
    const regionText = sol.inner ? '두 근 사이' : '두 근 바깥';
    const closedText = sol.closed
      ? '등호가 있으므로 두 영점을 포함합니다(닫힌 점).'
      : '등호가 없으므로 두 영점을 제외합니다(열린 점).';

    return [
      `<strong>영점(Zero Points) 확인:</strong> f(x) = 0을 만족하는 두 실근은 x = ${params.r}, x = ${params.s}입니다.`,
      `<strong>그래프 개형과 부호 판정:</strong> 최고차항 계수 a = ${params.a} (${aText})이므로, 두 근 바깥의 부호는 ${outsideSign}, 두 근 사이의 부호는 ${insideSign}입니다.`,
      `<strong>부등호 방향 판정:</strong> ${ineqString(params)}에서 0보다 ${params.op === 'lt' || params.op === 'le' ? '작거나 같은(음수)' : '크거나 같은(양수)'} 구간인 <strong>${regionText}</strong>를 선택합니다.`,
      `<strong>영점 포함 여부 판정:</strong> ${closedText} 따라서 최종 해는 <strong>${answerString(params)}</strong>입니다.`
    ];
  }

  function generateTestPoints(params) {
    const p1 = params.r - 1;
    const v1 = evalF(params, p1);

    const mid = (params.r + params.s) / 2;
    const p2Str = Number.isInteger(mid) ? `${mid}` : mid.toFixed(1);
    const v2 = evalF(params, mid);
    const v2Str = Number.isInteger(v2) ? `${v2}` : v2.toFixed(2);

    const p3 = params.s + 1;
    const v3 = evalF(params, p3);

    return [
      { point: `x = ${p1} (x < ${params.r})`, expr: `f(${p1}) = ${v1}`, sign: v1 > 0 ? '+' : '−', isMatch: (v1 > 0) === (params.a > 0) },
      { point: `x = ${p2Str} (${params.r} < x < ${params.s})`, expr: `f(${p2Str}) = ${v2Str}`, sign: v2 > 0 ? '+' : '−', isMatch: (v2 > 0) !== (params.a > 0) },
      { point: `x = ${p3} (x > ${params.s})`, expr: `f(${p3}) = ${v3}`, sign: v3 > 0 ? '+' : '−', isMatch: (v3 > 0) === (params.a > 0) }
    ];
  }

  // 3. Standalone HTML Export Generators (Student vs Teacher)
  function exportHtml(isTeacher) {
    const sol = solveInterval(state);
    const ansText = answerString(state);
    const ineq = ineqString(state);
    const compareOp = OP_FLIP_EQ[state.op];
    const compareParams = { ...state, op: compareOp };
    const compareIneq = ineqString(compareParams);
    const compareAns = answerString(compareParams);

    const misconceptionAns = compareAns; // omitted endpoints or added endpoints

    const title = `${state.author}의 이차부등식 3단계 후속 과제 · ${isTeacher ? '교사용 해설집' : '학생용 과제지'}`;

    return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <style>
    body {
      max-width: 820px;
      margin: 30px auto;
      padding: 24px;
      color: #1e293b;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Pretendard", sans-serif;
      line-height: 1.7;
    }
    .header-box {
      border-bottom: 2px solid #0f766e;
      padding-bottom: 14px;
      margin-bottom: 24px;
    }
    .title-row {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
    }
    h1 {
      font-size: 24px;
      color: #0f766e;
      margin: 0 0 6px 0;
    }
    .meta-line {
      font-size: 14px;
      color: #64748b;
    }
    .instruction-card {
      background: #f1f5f9;
      border-left: 4px solid #0f766e;
      padding: 10px 16px;
      margin-bottom: 24px;
      font-size: 14.5px;
    }
    .card {
      border: 1px solid #cbd5e1;
      border-radius: 10px;
      padding: 18px 20px;
      margin-bottom: 24px;
      break-inside: avoid;
    }
    .card-header {
      font-size: 16px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 10px;
      border-bottom: 1px dashed #cbd5e1;
      padding-bottom: 6px;
    }
    .math-formula {
      font-family: "Cambria Math", serif;
      font-size: 18px;
      font-weight: 700;
      color: #0f766e;
    }
    .answer-space {
      min-height: 110px;
      border: 1px dashed #94a3b8;
      border-radius: 8px;
      margin-top: 12px;
      background: #fafafa;
      padding: 12px;
      font-size: 13px;
      color: #94a3b8;
    }
    .solution-part {
      background: #f0fdf4;
      border: 1px solid #86efac;
      border-radius: 8px;
      padding: 14px 16px;
      margin-top: 14px;
    }
    .solution-title {
      font-weight: 800;
      color: #166534;
      margin-bottom: 8px;
      font-size: 15px;
    }
    svg {
      max-width: 100%;
      height: auto;
      margin: 10px 0;
    }
    ol {
      margin-left: 20px;
      margin-bottom: 10px;
    }
    li {
      margin-bottom: 4px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 10px 0;
      font-size: 13px;
    }
    th, td {
      border: 1px solid #cbd5e1;
      padding: 6px 10px;
      text-align: center;
    }
    th {
      background: #e2e8f0;
    }
    .teacher-note {
      background: #eff6ff;
      border-left: 4px solid #3b82f6;
      padding: 10px 14px;
      margin-top: 10px;
      font-size: 13.5px;
      color: #1e3a8a;
    }
    .print-bar {
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 10px 16px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
    }
    .print-tip {
      font-size: 13.5px;
      color: #475569;
    }
    .print-bar-btn {
      background: #0f766e;
      color: #ffffff;
      border: none;
      padding: 7px 16px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      white-space: nowrap;
    }
    .footer {
      border-top: 1px solid #e2e8f0;
      padding-top: 14px;
      margin-top: 30px;
      font-size: 12px;
      color: #94a3b8;
      text-align: center;
    }
    @media print {
      body { margin: 0; padding: 12px; max-width: 100%; color: #000; }
      .no-print { display: none !important; }
      .card { break-inside: avoid; page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="no-print print-bar">
    <span class="print-tip">💡 인쇄 창에서 대상을 <strong>'PDF로 저장'</strong>으로 선택하시면 깔끔한 A4 규격으로 저장됩니다.</span>
    <button class="print-bar-btn" onclick="window.print()">🖨️ PDF 저장 / 인쇄</button>
  </div>
  <div class="header-box">
    <div class="title-row">
      <h1>${title}</h1>
      ${!isTeacher ? '<div><strong>이름:</strong> ____________________</div>' : ''}
    </div>
    <div class="meta-line">
      2022 개정 공통수학1 [10공수1-02-11] · 지도: <strong>${state.author}</strong> | 출력일자: ${new Date().toLocaleDateString('ko-KR')}
    </div>
  </div>

  <div class="instruction-card">
    <strong>과제 안내:</strong> ${state.instruction}
  </div>

  <!-- Task 1: 따라 풀기 -->
  <div class="card">
    <div class="card-header">01. 따라 풀기 (숫자를 바꿔 원리 적용하기)</div>
    <p>다음 이차부등식의 해를 구하고, 수직선 위에 부호와 해의 범위를 나타내세요.</p>
    <p style="text-align: center; margin: 14px 0;"><span class="math-formula">${ineq}</span></p>
    
    ${!isTeacher ? `
      <div class="answer-space">
        [풀이 과정 및 수직선 작도란]<br>
        1. f(x) = 0의 두 실근:<br>
        2. a의 부호에 따른 그래프 개형 및 구간별 부호 (+ / −):<br>
        3. 부등호와 등호 조건에 따른 최종 해:
      </div>
    ` : `
      <div class="solution-part">
        <div class="solution-title">★ 정답 및 해설 (교사용)</div>
        <p><strong>정답 해:</strong> <span class="math-formula">${ansText}</span></p>
        ${generateSvg(state)}
        <ol>
          ${generateSteps(state).map(s => `<li>${s}</li>`).join('')}
        </ol>
        <table>
          <thead>
            <tr><th>검산 구간</th><th>대입값 x</th><th>f(x) 계산 결과</th><th>부호 판정</th></tr>
          </thead>
          <tbody>
            ${generateTestPoints(state).map(t => `
              <tr><td>${t.point}</td><td>-</td><td>${t.expr}</td><td><strong>${t.sign}</strong></td></tr>
            `).join('')}
          </tbody>
        </table>
        <div class="teacher-note">
          <strong>교사 지도 메모:</strong> ${state.note}
        </div>
      </div>
    `}
  </div>

  <!-- Task 2: 조건 비교 -->
  <div class="card">
    <div class="card-header">02. 조건 비교 (등호 하나, 달라지는 해)</div>
    <p>두 부등식 <span class="math-formula">${ineq}</span> 과 <span class="math-formula">${compareIneq}</span> 의 해를 각각 구하고, 등호의 유무가 해의 범위와 수직선 표현에 미치는 차이점을 설명하세요.</p>
    
    ${!isTeacher ? `
      <div class="answer-space">
        [비교 및 서술란]<br>
        - 식 1의 해: <br>
        - 식 2의 해: <br>
        - 달라지는 점(영점 x = ${state.r}, ${state.s}의 포함 여부와 수직선 점의 모양):
      </div>
    ` : `
      <div class="solution-part">
        <div class="solution-title">★ 정답 및 해설 (교사용)</div>
        <p><strong>비교 결과:</strong></p>
        <ul>
          <li><strong>${ineq}</strong> → ${ansText} (${sol.closed ? '두 영점을 포함, 닫힌 점' : '두 영점을 제외, 열린 점'})</li>
          <li><strong>${compareIneq}</strong> → ${compareAns} (${!sol.closed ? '두 영점을 포함, 닫힌 점' : '두 영점을 제외, 열린 점'})</li>
        </ul>
        <p><strong>핵심 원리:</strong> 등호가 있을 때에는 f(x)=0이 되는 경계점(영점)이 부등식을 만족하므로 해에 포함되지만, 등호가 없을 때에는 영점에서 부등식을 만족하지 않으므로 해에서 제외됩니다.</p>
      </div>
    `}
  </div>

  <!-- Task 3: 이유 설명 -->
  <div class="card">
    <div class="card-header">03. 이유 설명 (오답 분석 및 올바른 논리 서술)</div>
    <p>이차부등식 <span class="math-formula">${ineq}</span> 의 해를 구하는 과정에서 어떤 학생이 답을 <span class="math-formula">"${misconceptionAns}"</span> 라고 작성했습니다. 이 학생이 놓친 수학적 조건을 찾아 바르게 고치고, 그 이유를 영점과 등호의 관계를 들어 설명하세요.</p>
    
    ${!isTeacher ? `
      <div class="answer-space">
        [오답 고치기 및 이유 서술란]<br>
        - 올바른 해:<br>
        - 학생이 놓친 조건 및 오류 이유:
      </div>
    ` : `
      <div class="solution-part">
        <div class="solution-title">★ 정답 및 해설 (교사용)</div>
        <p><strong>올바른 해:</strong> <span class="math-formula">${ansText}</span></p>
        <p><strong>오류 원인:</strong> 학생은 부등식의 등호(${OP_MAP[state.op]}) 조건을 제대로 고려하지 못하고 ${OP_MAP[compareOp]}의 해로 오인했습니다.</p>
        <p><strong>지도 가이드:</strong> x = ${state.r} 또는 x = ${state.s}일 때 f(x) = 0이 됨을 직접 대입해 보여주고, 등호가 부등식에 포함되어 있는지 반드시 확인하는 습관을 강조합니다.</p>
      </div>
    `}
  </div>

  <div class="footer">
    초강스 에듀테크 LAB · 7주차 주간미션 / 가상 학습 예시 (실제 학생 개인정보 일체 없음)
  </div>
</body>
</html>`;
  }

  // 4. UI Updating and DOM binding
  function init() {
    // Cache DOM Elements
    const authorInput = document.getElementById('authorInput');
    const instructionInput = document.getElementById('instructionInput');
    const teacherNoteInput = document.getElementById('teacherNoteInput');

    const dispFormulaMain = document.getElementById('dispFormulaMain');
    const dispFormulaExpanded = document.getElementById('dispFormulaExpanded');
    const badgeGraphType = document.getElementById('badgeGraphType');
    const badgeClosedType = document.getElementById('badgeClosedType');

    const sliderR = document.getElementById('sliderR');
    const sliderS = document.getElementById('sliderS');
    const valR = document.getElementById('valR');
    const valS = document.getElementById('valS');

    const pillBtnsA = document.querySelectorAll('.btn-pill-a');
    const opBtns = document.querySelectorAll('.btn-op');
    const presetBtns = document.querySelectorAll('.btn-preset');
    const randomPresetBtn = document.getElementById('btnRandomPreset');

    const resetAlert = document.getElementById('resetAlert');

    // Content Display Elements
    const taskPromptSolve = document.getElementById('taskPromptSolve');
    const optionsGrid = document.getElementById('optionsGrid');
    const btnCheckAnswer = document.getElementById('btnCheckAnswer');
    const btnResetSelection = document.getElementById('btnResetSelection');
    const solutionBox = document.getElementById('solutionBox');
    const verdictTag = document.getElementById('verdictTag');
    const verdictMsg = document.getElementById('verdictMsg');
    const svgMount = document.getElementById('svgMount');
    const stepList = document.getElementById('stepList');
    const calcTableBody = document.getElementById('calcTableBody');

    // Compare Elements
    const compareExpr1 = document.getElementById('compareExpr1');
    const compareAns1 = document.getElementById('compareAns1');
    const comparePoint1 = document.getElementById('comparePoint1');
    const compareExpr2 = document.getElementById('compareExpr2');
    const compareAns2 = document.getElementById('compareAns2');
    const comparePoint2 = document.getElementById('comparePoint2');
    const compareSummaryText = document.getElementById('compareSummaryText');

    // Explain Elements
    const explainMisconceptionExpr = document.getElementById('explainMisconceptionExpr');
    const explainMisconceptionAns = document.getElementById('explainMisconceptionAns');
    const explainFixAns = document.getElementById('explainFixAns');
    const explainFixReason = document.getElementById('explainFixReason');

    // Summary Elements
    const sumExpr1 = document.getElementById('sumExpr1');
    const sumAns1 = document.getElementById('sumAns1');
    const sumExpr2 = document.getElementById('sumExpr2');
    const sumAns2 = document.getElementById('sumAns2');
    const sumExpr3 = document.getElementById('sumExpr3');
    const sumAns3 = document.getElementById('sumAns3');

    // Action Buttons
    const btnPrintStudent = document.getElementById('btnPrintStudent');
    const btnPrintTeacher = document.getElementById('btnPrintTeacher');
    const btnCopyTasks = document.getElementById('btnCopyTasks');
    const btnCopySubmission = document.getElementById('btnCopySubmission');

    const toast = document.getElementById('toast');

    // Modal Elements
    const copyModal = document.getElementById('copyModal');
    const copyModalTextarea = document.getElementById('copyModalTextarea');
    const btnCloseModal = document.getElementById('btnCloseModal');
    const btnModalCopy = document.getElementById('btnModalCopy');

    function showToast(msg) {
      toast.textContent = msg;
      toast.classList.add('show');
      setTimeout(() => {
        toast.classList.remove('show');
      }, 2800);
    }

    // Condition Change Handler (Triggers Criteria 2: Automatic Reset)
    function onConditionChange(notifyReset = true) {
      state.selectedOptionIdx = null;
      state.solutionRevealed = false;

      // Update Slider Constraints (r must be strictly less than s)
      if (state.r >= state.s) {
        state.s = Math.min(4, state.r + 1);
        sliderS.value = state.s;
      }
      sliderR.max = state.s - 1;
      sliderS.min = state.r + 1;

      valR.textContent = state.r;
      valS.textContent = state.s;

      render();

      if (notifyReset) {
        resetAlert.classList.add('show');
        setTimeout(() => {
          resetAlert.classList.remove('show');
        }, 3200);
      }
    }

    // Full Render Function
    function render() {
      // 1. Controls State Sync
      pillBtnsA.forEach(btn => {
        const val = parseInt(btn.getAttribute('data-a'), 10);
        btn.classList.toggle('active', val === state.a);
      });

      opBtns.forEach(btn => {
        const opVal = btn.getAttribute('data-op');
        btn.classList.toggle('active', opVal === state.op);
      });

      // 2. Formula Card
      const ineq = ineqString(state);
      const expanded = expandedString(state);
      const sol = solveInterval(state);

      dispFormulaMain.textContent = ineq;
      dispFormulaExpanded.textContent = `전개형: ${expanded} ${OP_MAP[state.op]} 0`;

      if (state.a > 0) {
        badgeGraphType.textContent = '아래로 볼록 (a > 0)';
        badgeGraphType.className = 'f-badge active-a';
      } else {
        badgeGraphType.textContent = '위로 볼록 (a < 0)';
        badgeGraphType.className = 'f-badge active-a';
      }

      if (sol.closed) {
        badgeClosedType.textContent = '등호 포함 (닫힌 점 ●)';
        badgeClosedType.className = 'f-badge active-closed';
      } else {
        badgeClosedType.textContent = '등호 미포함 (열린 점 ○)';
        badgeClosedType.className = 'f-badge';
      }

      // 3. Task 1 (따라 풀기) Card
      taskPromptSolve.innerHTML = `<span class="formula-highlight">${ineq}</span> 의 해를 구하고 수직선에 나타내세요.`;

      // Render 4 Options
      const choices = generateChoices(state);
      optionsGrid.innerHTML = '';
      choices.forEach((choice, idx) => {
        const card = document.createElement('div');
        card.className = `option-card ${state.selectedOptionIdx === idx ? 'selected' : ''}`;
        if (state.solutionRevealed) {
          if (choice.isCorrect) card.classList.add('correct');
          else if (state.selectedOptionIdx === idx) card.classList.add('incorrect');
        }

        card.innerHTML = `
          <div class="opt-indicator">${String.fromCharCode(65 + idx)}</div>
          <div class="opt-text">${choice.text}</div>
        `;

        card.addEventListener('click', () => {
          state.selectedOptionIdx = idx;
          renderOptionsSelectionOnly();
        });

        optionsGrid.appendChild(card);
      });

      // Solution Box Rendering
      if (state.solutionRevealed) {
        solutionBox.classList.add('show');
        const correctChoice = choices.find(c => c.isCorrect);
        const userChoice = state.selectedOptionIdx !== null ? choices[state.selectedOptionIdx] : null;

        if (userChoice && userChoice.isCorrect) {
          verdictTag.className = 'verdict-tag correct';
          verdictTag.textContent = '정답입니다! 👏';
          verdictMsg.textContent = `정답인 '${correctChoice.text}'을(를) 바르게 선택했습니다.`;
        } else if (userChoice) {
          verdictTag.className = 'verdict-tag incorrect';
          verdictTag.textContent = '다시 확인해 보세요 ✍️';
          verdictMsg.textContent = `선택한 '${userChoice.text}' 대신, 올바른 해는 '${correctChoice.text}'입니다.`;
        } else {
          verdictTag.className = 'verdict-tag correct';
          verdictTag.textContent = '해설 보기 📖';
          verdictMsg.textContent = `올바른 해는 '${correctChoice.text}'입니다.`;
        }

        svgMount.innerHTML = generateSvg(state);

        stepList.innerHTML = generateSteps(state).map(s => `<li>${s}</li>`).join('');

        const testPoints = generateTestPoints(state);
        calcTableBody.innerHTML = testPoints.map(t => `
          <tr>
            <td>${t.point}</td>
            <td><code>${t.expr}</code></td>
            <td class="${t.sign === '+' ? 'sign-pos' : 'sign-neg'}">${t.sign}</td>
            <td>${t.isMatch ? '일치 ✅' : '일치 ✅'}</td>
          </tr>
        `).join('');
      } else {
        solutionBox.classList.remove('show');
      }

      // 4. Task 2 (조건 비교) Card
      const compareOp = OP_FLIP_EQ[state.op];
      const compareParams = { ...state, op: compareOp };
      const compareSol = solveInterval(compareParams);

      compareExpr1.textContent = ineq;
      compareAns1.textContent = `해: ${answerString(state)}`;
      comparePoint1.textContent = sol.closed ? `등호 포함: 영점 ${state.r}, ${state.s} 포함 (닫힌 점 ●)` : `등호 제외: 영점 ${state.r}, ${state.s} 제외 (열린 점 ○)`;

      compareExpr2.textContent = ineqString(compareParams);
      compareAns2.textContent = `해: ${answerString(compareParams)}`;
      comparePoint2.textContent = compareSol.closed ? `등호 포함: 영점 ${state.r}, ${state.s} 포함 (닫힌 점 ●)` : `등호 제외: 영점 ${state.r}, ${state.s} 제외 (열린 점 ○)`;

      compareSummaryText.textContent = `두 부등식의 식은 동일하지만 등호의 유무에 따라 영점 x = ${state.r}, ${state.s}의 포함 여부가 정반대로 바뀝니다. 부등호 밑에 막대기(=) 하나가 붙고 떨어짐에 따라 수직선의 점이 꽉 찬 원(●)과 빈 원(○)으로 달라집니다.`;

      // 5. Task 3 (이유 설명) Card
      const misconceptionAns = answerString(compareParams);
      explainMisconceptionExpr.textContent = ineq;
      explainMisconceptionAns.textContent = `오답 사례: "${misconceptionAns}"`;
      explainFixAns.textContent = `바른 해: "${answerString(state)}"`;
      explainFixReason.textContent = `주어진 부등식 '${ineq}'은 ${OP_MAP[state.op]} 0 형태입니다. ${sol.closed ? `등호(≤ 또는 ≥)가 있으므로 x = ${state.r}, x = ${state.s}를 대입하면 f(x) = 0이 되어 부등식을 참으로 만듭니다. 따라서 두 영점을 해의 영역에 반드시 포함해야 합니다.` : `등호(< 또는 >)가 없으므로 x = ${state.r}, x = ${state.s}를 대입하면 f(x) = 0이 되지만 0보다 크거나 작아야 한다는 조건을 만족하지 못합니다. 따라서 두 영점을 해에서 반드시 제외해야 합니다.`}`;

      // 6. Task 4 (종합 요약)
      sumExpr1.textContent = ineq;
      sumAns1.textContent = answerString(state);
      sumExpr2.textContent = `${ineq} vs ${ineqString(compareParams)}`;
      sumAns2.textContent = `영점 ${state.r}, ${state.s} 포함 여부 차이 (${sol.closed ? '포함' : '제외'} ↔ ${compareSol.closed ? '포함' : '제외'})`;
      sumExpr3.textContent = `오답 "${misconceptionAns}" 교정`;
      sumAns3.textContent = `등호 유무에 따른 영점 대입 검증 및 바른 해 도출`;
    }

    function renderOptionsSelectionOnly() {
      const cards = optionsGrid.querySelectorAll('.option-card');
      cards.forEach((card, idx) => {
        card.classList.toggle('selected', state.selectedOptionIdx === idx);
      });
    }

    // Event Listeners
    authorInput.addEventListener('input', (e) => {
      state.author = e.target.value.trim() || '선생님';
    });

    instructionInput.addEventListener('input', (e) => {
      state.instruction = e.target.value.trim();
    });

    teacherNoteInput.addEventListener('input', (e) => {
      state.note = e.target.value.trim();
    });

    // Pill buttons for coefficient a
    pillBtnsA.forEach(btn => {
      btn.addEventListener('click', () => {
        state.a = parseInt(btn.getAttribute('data-a'), 10);
        onConditionChange();
      });
    });

    // Pill buttons for operator op
    opBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        state.op = btn.getAttribute('data-op');
        onConditionChange();
      });
    });

    // Sliders for r and s
    sliderR.addEventListener('input', (e) => {
      state.r = parseInt(e.target.value, 10);
      onConditionChange();
    });

    sliderS.addEventListener('input', (e) => {
      state.s = parseInt(e.target.value, 10);
      onConditionChange();
    });

    // Preset Buttons
    presetBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        presetBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        state.a = parseInt(btn.getAttribute('data-a'), 10);
        state.r = parseInt(btn.getAttribute('data-r'), 10);
        state.s = parseInt(btn.getAttribute('data-s'), 10);
        state.op = btn.getAttribute('data-op');

        sliderR.value = state.r;
        sliderS.value = state.s;

        onConditionChange();
      });
    });

    // Random Preset Button
    randomPresetBtn.addEventListener('click', () => {
      presetBtns.forEach(b => b.classList.remove('active'));

      const aChoices = [-3, -2, -1, 1, 2, 3];
      const opChoices = ['lt', 'le', 'gt', 'ge'];

      state.a = aChoices[Math.floor(Math.random() * aChoices.length)];
      state.op = opChoices[Math.floor(Math.random() * opChoices.length)];

      const r = Math.floor(Math.random() * 7) - 4; // -4 to 2
      const s = r + Math.floor(Math.random() * (4 - r)) + 1; // r+1 to 4

      state.r = r;
      state.s = s;

      sliderR.value = state.r;
      sliderS.value = state.s;

      onConditionChange();
      showToast(`🎲 랜덤 부등식이 생성되었습니다: ${ineqString(state)}`);
    });

    // Task Tabs Switching
    const tabBtns = document.querySelectorAll('.task-tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        tabPanes.forEach(p => p.classList.remove('active'));

        btn.classList.add('active');
        const targetId = btn.getAttribute('data-tab');
        const targetPane = document.getElementById(targetId);
        if (targetPane) {
          targetPane.classList.add('active');
        }
      });
    });

    // Check Answer Button
    btnCheckAnswer.addEventListener('click', () => {
      state.solutionRevealed = true;
      render();
      solutionBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });

    // Reset Selection Button
    btnResetSelection.addEventListener('click', () => {
      state.selectedOptionIdx = null;
      state.solutionRevealed = false;
      render();
      showToast('답안 선택과 해설 표시가 초기화되었습니다.');
    });

    // Print & Export Action Handlers (Chrome Native Print / Save as PDF Dialog)
    function printPdfDirectly(isTeacher) {
      const docLabel = isTeacher ? '교사용 해설집' : '학생용 과제지';
      const htmlContent = exportHtml(isTeacher);

      showToast(`🖨️ ${docLabel} 인쇄 창을 열었습니다. 대상에서 'PDF로 저장'을 선택하세요.`);

      if (typeof window.EdutechPrint === 'function') {
        window.EdutechPrint(htmlContent, docLabel);
      } else {
        let printIframe = document.getElementById('edutechPrintHiddenIframe');
        if (!printIframe) {
          printIframe = document.createElement('iframe');
          printIframe.id = 'edutechPrintHiddenIframe';
          printIframe.setAttribute('aria-hidden', 'true');
          printIframe.style.position = 'fixed';
          printIframe.style.right = '0';
          printIframe.style.bottom = '0';
          printIframe.style.width = '0';
          printIframe.style.height = '0';
          printIframe.style.border = '0';
          printIframe.style.visibility = 'hidden';
          document.body.appendChild(printIframe);
        }

        const doc = printIframe.contentWindow.document;
        doc.open();
        doc.write(htmlContent);
        doc.close();

        setTimeout(() => {
          try {
            printIframe.contentWindow.focus();
            printIframe.contentWindow.print();
          } catch (e) {
            console.error('[EdutechPrint] 인쇄 대화상자 호출 오류:', e);
          }
        }, 280);
      }
    }

    btnPrintStudent.addEventListener('click', () => {
      printPdfDirectly(false);
    });

    btnPrintTeacher.addEventListener('click', () => {
      printPdfDirectly(true);
    });

    // Copy Task Text
    btnCopyTasks.addEventListener('click', () => {
      const text = `[초강스 에듀테크 LAB 7주차 · ${state.author}의 이차부등식 3단계 후속 과제]

■ 교육과정: 2022 개정 공통수학1 [10공수1-02-11]
■ 안내: ${state.instruction}

[01 따라 풀기]
문제: ${ineqString(state)} 의 해를 구하고 수직선에 나타내세요.
정답: ${answerString(state)}

[02 조건 비교]
문제: ${ineqString(state)} 과 ${ineqString({ ...state, op: OP_FLIP_EQ[state.op] })} 의 해를 비교하고 달라지는 점을 설명하세요.

[03 이유 설명]
문제: ${ineqString(state)}의 해를 "${answerString({ ...state, op: OP_FLIP_EQ[state.op] })}"라고 쓴 학생이 놓친 조건을 찾아 고치고 이유를 설명하세요.`;

      navigator.clipboard.writeText(text).then(() => {
        showToast('3단계 과제 내용이 클립보드에 복사되었습니다!');
      }).catch(() => {
        copyModalTextarea.value = text;
        copyModal.classList.add('show');
      });
    });

    // Copy Mission Submission Comment
    btnCopySubmission.addEventListener('click', () => {
      const origin = window.location.origin;
      const pathname = window.location.pathname.replace(/\/index\.html$/, '').replace(/\/$/, '');
      const cleanUrl = origin.includes('github.io') || origin.includes('vercel.app')
        ? `${origin}${pathname}/`
        : 'https://sool1982-1213.github.io/edutech-weekly-missions/week07/';

      const comment = `${state.author} / 중수 / 미션 완료 / ${cleanUrl} / 근・계수・부등호를 조작하면 문제와 해설이 함께 바뀌는 도구로 학생 맞춤형 3단계 후속 과제를 지도하겠습니다.`;

      navigator.clipboard.writeText(comment).then(() => {
        showToast('7주차 제출 댓글 양식이 복사되었습니다!');
      }).catch(() => {
        copyModalTextarea.value = comment;
        copyModal.classList.add('show');
      });
    });

    // Modal Close and Copy
    btnCloseModal.addEventListener('click', () => {
      copyModal.classList.remove('show');
    });

    btnModalCopy.addEventListener('click', () => {
      copyModalTextarea.select();
      document.execCommand('copy');
      copyModal.classList.remove('show');
      showToast('복사되었습니다!');
    });

    // Initial render
    onConditionChange(false);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
