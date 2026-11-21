/**
 * 초강스 에듀테크 LAB 8주차 고수 미션: 우리 반 과제 묶음 제작기 (이차부등식 3~9문항)
 * 2022 개정 공통수학1 [10공수1-02-11] 이차부등식의 해와 이차함수 그래프
 * 지도교사: 수현T
 */

(function () {
  'use strict';

  const OP_MAP = { lt: '<', le: '≤', gt: '>', ge: '≥' };
  const OP_FLIP_EQ = { lt: 'le', le: 'lt', gt: 'ge', ge: 'gt' };
  const TYPE_LABELS = {
    solve: '직접 풀기',
    compare: '조건 비교',
    explain: '이유 설명'
  };

  let nextId = 1;
  function makeItem(type, a, r, s, op, memo) {
    return {
      id: `q8_${nextId++}`,
      type,
      a,
      r,
      s,
      op,
      memo: memo || '',
      checked: false,
      inspectorOpen: false
    };
  }

  function createPresetBundle(key) {
    if (key === 'basic') {
      return [
        makeItem('solve', 1, -1, 3, 'le', '두 근 바깥과 사이에 값을 대입해 부호를 확인하게 지도할 것'),
        makeItem('solve', -2, -2, 1, 'gt', '최고차항 계수가 음수(위로 볼록)일 때 사잇값 범위를 직접 검산할 것'),
        makeItem('compare', 1, 0, 4, 'ge', '등호 포함(≥)과 제외(>)일 때 경계값 0, 4의 포함 여부를 비교시킬 것')
      ];
    }
    if (key === 'mixed6') {
      return [
        makeItem('solve', 1, -1, 3, 'le', '기준 문제: 닫힌 점과 사잇값 구간 연결'),
        makeItem('solve', -1, 1, 4, 'gt', '음수 계수: 위로 볼록 그래프에서 0보다 큰 구간 확인'),
        makeItem('compare', 2, -2, 1, 'le', '≤와 <의 차이: 두 영점 포함 vs 제외 비교'),
        makeItem('compare', -2, -3, 2, 'gt', '음수 계수에서 >와 ≥의 수직선 열린 점·닫힌 점 비교'),
        makeItem('explain', 1, -2, 2, 'le', '경계값 ±2를 대입하면 0이 되어 참임을 말로 설명하게 할 것'),
        makeItem('explain', -3, -1, 3, 'ge', '음수 계수와 등호 조건을 함께 점검하며 잘못된 해를 고쳐 설명할 것')
      ];
    }
    // default 'explain' (설명 연습 세트: 3문항)
    return [
      makeItem('solve', 1, -1, 3, 'le', '두 근 바깥과 사이의 부호를 대입해 직접 풀고 수직선에 표시할 것'),
      makeItem('compare', -1, 1, 4, 'ge', '최고차항 계수가 음수일 때 ≥와 >의 해와 수직선 차이를 비교할 것'),
      makeItem('explain', -2, -3, 2, 'le', '영점을 빠뜨린 오답을 보고 등호와 영점 포함 관계를 말로 설명하게 할 것')
    ];
  }

  const state = {
    author: '수현T',
    title: '이차부등식 우리 반 맞춤 과제',
    instruction: '두 근의 바깥과 사이 구간의 부호를 대입으로 확인하고, 등호 유무에 따른 영점 포함 여부를 설명해 보세요.',
    activePresetKey: 'explain',
    builder: {
      type: 'solve',
      a: 1,
      r: -1,
      s: 3,
      op: 'le',
      memo: '영점 포함 여부와 대입 검산 과정을 꼭 짚어줄 것'
    },
    previewSelectedOptionIdx: null,
    previewSolutionRevealed: false,
    bundle: createPresetBundle('explain')
  };

  // --- Security & Math Helpers ---
  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, m => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[m]);
  }

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

    let strA = A === 1 ? 'x²' : (A === -1 ? '−x²' : `${A}x²`);
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
    return { inner: isInner, closed: isClosed, r: params.r, s: params.s };
  }

  function answerString(params) {
    const sol = solveInterval(params);
    const opLo = sol.closed ? '≤' : '<';
    const opHi = sol.closed ? '≥' : '>';
    if (sol.inner) {
      return `${params.r} ${opLo} x ${opLo} ${params.s}`;
    }
    return `x ${opLo} ${params.r} 또는 x ${opHi} ${params.s}`;
  }

  function generateChoices(params) {
    const ops = ['lt', 'le', 'gt', 'ge'];
    const shift = (Math.abs(params.r + params.s) + Math.abs(params.a)) % 4;
    const ordered = [...ops.slice(shift), ...ops.slice(0, shift)];
    return ordered.map(testOp => ({
      op: testOp,
      text: answerString({ ...params, op: testOp }),
      isCorrect: testOp === params.op
    }));
  }

  function generateSteps(params) {
    const sol = solveInterval(params);
    const aText = params.a > 0 ? '양수(아래로 볼록)' : '음수(위로 볼록)';
    const outsideSign = params.a > 0 ? '양수(+)' : '음수(−)';
    const insideSign = params.a > 0 ? '음수(−)' : '양수(+)';
    const regionText = sol.inner ? '두 근 사이' : '두 근 바깥';
    const closedText = sol.closed
      ? '등호가 있으므로 f(x) = 0이 되는 두 영점을 해에 포함합니다(닫힌 점 ●).'
      : '등호가 없으므로 f(x) = 0이 되는 두 영점을 해에서 제외합니다(열린 점 ○).';

    return [
      `<strong>영점 확인:</strong> f(x) = 0의 두 실근은 x = ${params.r}, x = ${params.s}입니다.`,
      `<strong>그래프와 부호 판정:</strong> 최고차항 계수 a = ${params.a} (${aText})이므로 바깥 구간은 ${outsideSign}, 사이 구간은 ${insideSign}입니다.`,
      `<strong>부등호 구간 선택:</strong> ${escapeHtml(ineqString(params))}에서 0보다 ${params.op === 'lt' || params.op === 'le' ? '작거나 같은' : '크거나 같은'} <strong>${regionText}</strong> 구간을 선택합니다.`,
      `<strong>영점 포함 여부 확정:</strong> ${closedText} 따라서 해는 <strong>${escapeHtml(answerString(params))}</strong>입니다.`
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

  function generateSvg(params) {
    const sol = solveInterval(params);
    const signs = params.a > 0 ? ['+', '−', '+'] : ['−', '+', '−'];
    const ansText = answerString(params);

    const activeInnerPath = `<path d="M155 145H445" stroke="#087f82" stroke-width="7"/>`;
    const activeOuterPath = `
      <path d="M30 145H155M445 145H570" stroke="#087f82" stroke-width="7"/>
      <path d="M42 138L30 145L42 152M558 138L570 145L558 152" fill="none" stroke="#087f82" stroke-width="3"/>
    `;

    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 210" role="img" aria-label="부호와 해의 수직선: ${escapeHtml(ansText)}">
        <rect width="600" height="210" rx="14" fill="#eef4ef"/>
        <text x="24" y="28" fill="#284354" font-size="14" font-weight="700">f(x) = ${escapeHtml(exprString(params))}</text>
        <text x="576" y="28" text-anchor="end" fill="#58737e" font-size="12">${params.a > 0 ? '아래로 볼록 (a > 0)' : '위로 볼록 (a < 0)'}</text>
        <path d="M30 92H570M155 44V172M445 44V172" stroke="#9bb0ae" stroke-dasharray="4 4"/>
        <text x="80" y="76" text-anchor="middle" font-size="26" font-weight="800" fill="${signs[0] === '+' ? '#0b787e' : '#c4666f'}">${signs[0]}</text>
        <text x="300" y="76" text-anchor="middle" font-size="26" font-weight="800" fill="${signs[1] === '+' ? '#0b787e' : '#c4666f'}">${signs[1]}</text>
        <text x="520" y="76" text-anchor="middle" font-size="26" font-weight="800" fill="${signs[2] === '+' ? '#0b787e' : '#c4666f'}">${signs[2]}</text>
        <text x="155" y="76" text-anchor="middle" font-size="20" font-weight="700" fill="#284354">0</text>
        <text x="445" y="76" text-anchor="middle" font-size="20" font-weight="700" fill="#284354">0</text>
        <path d="M30 145H570" stroke="#728e91" stroke-width="2"/>
        ${sol.inner ? activeInnerPath : activeOuterPath}
        <circle cx="155" cy="145" r="7" fill="${sol.closed ? '#087f82' : '#ffffff'}" stroke="#087f82" stroke-width="3"/>
        <text x="155" y="185" text-anchor="middle" font-size="17" font-weight="800" fill="#284354">${params.r}</text>
        <circle cx="445" cy="145" r="7" fill="${sol.closed ? '#087f82' : '#ffffff'}" stroke="#087f82" stroke-width="3"/>
        <text x="445" y="185" text-anchor="middle" font-size="17" font-weight="800" fill="#284354">${params.s}</text>
        <text x="580" y="150" font-size="14" font-weight="700" fill="#728e91">x</text>
      </svg>
    `;
  }

  function generateBlankNumberLineSvg(params) {
    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 84" style="max-width: 440px; height: auto;" role="img" aria-label="빈 수직선">
        <line x1="30" y1="42" x2="570" y2="42" stroke="#64748b" stroke-width="2"/>
        <polygon points="570,38 580,42 570,46" fill="#64748b"/>
        <polygon points="30,38 20,42 30,46" fill="#64748b"/>
        <line x1="155" y1="32" x2="155" y2="52" stroke="#94a3b8" stroke-width="2"/>
        <text x="155" y="70" text-anchor="middle" font-size="14" font-weight="700" fill="#334155">${params.r}</text>
        <line x1="445" y1="32" x2="445" y2="52" stroke="#94a3b8" stroke-width="2"/>
        <text x="445" y="70" text-anchor="middle" font-size="14" font-weight="700" fill="#334155">${params.s}</text>
        <text x="585" y="46" font-size="12" fill="#64748b">x</text>
        <text x="80" y="23" text-anchor="middle" font-size="11" fill="#94a3b8">[부호: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;]</text>
        <text x="300" y="23" text-anchor="middle" font-size="11" fill="#94a3b8">[부호: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;]</text>
        <text x="520" y="23" text-anchor="middle" font-size="11" fill="#94a3b8">[부호: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;]</text>
      </svg>
    `;
  }

  // --- Bundle Validation & Export Gate ---
  function getExportStatus() {
    const count = state.bundle.length;
    if (count < 3) {
      return { ok: false, reason: `최소 3문제 이상 담아야 합니다 (현재 ${count}문항).` };
    }
    if (count > 9) {
      return { ok: false, reason: `최대 9문제까지만 담을 수 있습니다 (현재 ${count}문항).` };
    }
    const unchecked = state.bundle.filter(item => !item.checked).length;
    if (unchecked > 0) {
      return { ok: false, reason: `미확인 문항 ${unchecked}개의 확인 체크를 완료해 주세요.` };
    }
    return { ok: true, reason: `총 ${count}문항 검토 완료 · 학생용 과제와 교사용 해설을 분리 저장할 수 있습니다.` };
  }

  // --- Export HTML Generator (Strict Separation) ---
  function buildExportHtml(isTeacher) {
    const safeAuthor = escapeHtml(state.author || '수현T');
    const safeTitle = escapeHtml(state.title || '이차부등식 우리 반 맞춤 과제');
    const safeInst = escapeHtml(state.instruction || '');
    const docTitle = `${isTeacher ? '[교사용 해설]' : '[학생용 과제]'} ${safeTitle} (${safeAuthor})`;
    const today = new Date().toLocaleDateString('ko-KR');

    const blocks = state.bundle.map((item, idx) => {
      const num = idx + 1;
      const ineq = ineqString(item);
      const expanded = expandedString(item);
      const compareParams = { ...item, op: OP_FLIP_EQ[item.op] };
      const compareIneq = ineqString(compareParams);

      if (!isTeacher) {
        // STUDENT WORKSHEET: ZERO answers, ZERO solution steps, ZERO teacher memos!
        if (item.type === 'solve') {
          return `
            <article class="q-card">
              <div class="q-head">
                <span class="q-num">문제 ${num}</span>
                <span class="q-type">직접 풀기</span>
              </div>
              <p class="q-prompt">이차부등식 <span class="math">${escapeHtml(ineq)}</span> 의 해를 구하고, 수직선 위에 부호(+ / −)와 해의 영역을 나타내세요.</p>
              <div class="write-box">
                <div>1. 영점 (f(x) = 0): x = ________ , x = ________</div>
                <div>2. 부호 판정 (a = ${item.a}): 두 근 바깥 ( &nbsp;&nbsp;&nbsp; ), 두 근 사이 ( &nbsp;&nbsp;&nbsp; )</div>
                <div>3. 최종 해: __________________________________________________</div>
              </div>
              <div class="nl-box">${generateBlankNumberLineSvg(item)}</div>
            </article>
          `;
        }
        if (item.type === 'compare') {
          return `
            <article class="q-card">
              <div class="q-head">
                <span class="q-num">문제 ${num}</span>
                <span class="q-type">조건 비교</span>
              </div>
              <p class="q-prompt">두 이차부등식 <span class="math">${escapeHtml(ineq)}</span> 과 <span class="math">${escapeHtml(compareIneq)}</span> 의 해를 각각 구하고, 등호의 유무에 따라 달라지는 점을 설명하세요.</p>
              <div class="write-box">
                <div>• 첫 번째 부등식 (${escapeHtml(ineq)})의 해: _____________________________________</div>
                <div>• 두 번째 부등식 (${escapeHtml(compareIneq)})의 해: _____________________________________</div>
                <div>• 영점 x = ${item.r}, ${item.s}의 포함 여부 및 수직선 점 모양(○ / ●) 차이:</div>
              </div>
            </article>
          `;
        }
        // explain type: contains ONLY the flawed student answer as the prompt to critique (NO correct answer, NO memo)
        const flawedAns = answerString(compareParams);
        return `
          <article class="q-card">
            <div class="q-head">
              <span class="q-num">문제 ${num}</span>
              <span class="q-type">이유 설명</span>
            </div>
            <p class="q-prompt">이차부등식 <span class="math">${escapeHtml(ineq)}</span> 에 대해 어떤 학생이 답을 <strong>"${escapeHtml(flawedAns)}"</strong> 라고 적었습니다. 잘못된 부분을 바르게 고치고, 그 이유를 설명하세요.</p>
            <div class="write-box">
              <div>• 바르게 고친 해: _________________________________________________</div>
              <div>• 잘못된 이유 (x = ${item.r}, ${item.s} 대입 결과와 등호 조건 연결):</div>
            </div>
          </article>
        `;
      }

      // TEACHER GUIDE: Full answers, SVGs, step-by-step, 3-point verification, and teacher memo
      const ans = answerString(item);
      const sol = solveInterval(item);
      const steps = generateSteps(item);
      const testPts = generateTestPoints(item);
      const safeMemo = escapeHtml(item.memo || '별도 메모 없음');

      let extraTeacherHtml = '';
      if (item.type === 'compare') {
        const compAns = answerString(compareParams);
        const compSol = solveInterval(compareParams);
        extraTeacherHtml = `
          <div class="compare-grid-print">
            <div class="compare-col-print">
              <strong>식 A: ${escapeHtml(ineq)}</strong>
              <div>해: <span class="math">${escapeHtml(ans)}</span></div>
              <div class="sub">${sol.closed ? '영점 포함 (닫힌 점 ●)' : '영점 제외 (열린 점 ○)'}</div>
              ${generateSvg(item)}
            </div>
            <div class="compare-col-print">
              <strong>식 B: ${escapeHtml(compareIneq)}</strong>
              <div>해: <span class="math">${escapeHtml(compAns)}</span></div>
              <div class="sub">${compSol.closed ? '영점 포함 (닫힌 점 ●)' : '영점 제외 (열린 점 ○)'}</div>
              ${generateSvg(compareParams)}
            </div>
          </div>
        `;
      } else if (item.type === 'explain') {
        const flawedAns = answerString(compareParams);
        extraTeacherHtml = `
          <div class="explain-box-print">
            <div><strong>가상 오답:</strong> "${escapeHtml(flawedAns)}" → <strong>바른 해:</strong> "<span class="math">${escapeHtml(ans)}</span>"</div>
            <div class="sub">지도 포인트: x = ${item.r}, ${item.s}에서 f(x) = 0이 되므로 부등호(${OP_MAP[item.op]})의 등호 조건에 따라 경계 포함 여부를 결정해야 합니다.</div>
          </div>
        `;
      }

      return `
        <article class="q-card">
          <div class="q-head">
            <span class="q-num">문제 ${num} · ${TYPE_LABELS[item.type]}</span>
            <span class="math">${escapeHtml(ineq)} <small>(전개: ${escapeHtml(expanded)} ${OP_MAP[item.op]} 0)</small></span>
          </div>
          <div class="ans-banner">정답 해: <span class="math">${escapeHtml(ans)}</span></div>
          ${item.type !== 'compare' ? `<div class="svg-print">${generateSvg(item)}</div>` : ''}
          ${extraTeacherHtml}
          <ol class="steps-print">${steps.map(s => `<li>${s}</li>`).join('')}</ol>
          <table class="check-table">
            <thead><tr><th>검산 구간</th><th>대입 계산</th><th>부호</th><th>부호 일치</th></tr></thead>
            <tbody>
              ${testPts.map(t => `<tr><td>${escapeHtml(t.point)}</td><td><code>${escapeHtml(t.expr)}</code></td><td><strong>${t.sign}</strong></td><td>${t.isMatch ? '일치' : '불일치'}</td></tr>`).join('')}
            </tbody>
          </table>
          <div class="memo-print"><strong>교사 메모:</strong> ${safeMemo}</div>
        </article>
      `;
    }).join('');

    return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${docTitle}</title>
  <style>
    @page { size: A4 portrait; margin: 11mm 12mm; }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    body {
      max-width: 820px;
      margin: 12px auto;
      padding: 12px 16px;
      font-family: -apple-system, BlinkMacSystemFont, "Pretendard", "Segoe UI", sans-serif;
      color: #0f172a;
      line-height: 1.5;
      font-size: 13px;
    }
    .no-print {
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 8px;
      padding: 10px 14px;
      margin-bottom: 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 10px;
    }
    .print-btn {
      background: #0f766e;
      color: #fff;
      border: none;
      padding: 7px 14px;
      border-radius: 6px;
      font-weight: 700;
      cursor: pointer;
    }
    .sheet-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      border-bottom: 2px solid #0f766e;
      padding-bottom: 8px;
      margin-bottom: 10px;
      gap: 12px;
      flex-wrap: wrap;
    }
    .sheet-header h1 { font-size: 19px; margin: 0 0 2px; color: #0f766e; }
    .sheet-header p { margin: 0; font-size: 11.5px; color: #475569; }
    .info-box {
      border: 1px solid #cbd5e1;
      background: #f8fafc;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 12px;
    }
    .inst-box {
      background: #f0fdf4;
      border-left: 4px solid #0f766e;
      padding: 8px 12px;
      margin-bottom: 12px;
      font-size: 12.5px;
    }
    .q-card {
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 12px;
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .q-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 6px;
      margin-bottom: 8px;
      gap: 8px;
      flex-wrap: wrap;
    }
    .q-num { font-weight: 800; color: #0f766e; font-size: 13.5px; }
    .q-type { background: #e2e8f0; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; }
    .q-prompt { margin: 0 0 8px; font-size: 13px; }
    .math { font-family: "Cambria Math", serif; font-weight: 700; color: #0f766e; font-size: 14.5px; }
    .write-box {
      border: 1px dashed #94a3b8;
      border-radius: 6px;
      padding: 10px;
      min-height: 86px;
      background: #fafafa;
      font-size: 12px;
      color: #475569;
      line-height: 1.9;
    }
    .nl-box { text-align: center; margin-top: 8px; }
    .ans-banner {
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      padding: 6px 10px;
      border-radius: 6px;
      font-weight: 700;
      margin-bottom: 8px;
    }
    .svg-print { margin: 6px 0; max-width: 460px; }
    .svg-print svg, .compare-col-print svg { width: 100%; height: auto; display: block; }
    .compare-grid-print { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 8px 0; }
    .compare-col-print { border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px; background: #f8fafc; font-size: 12px; }
    .explain-box-print { background: #fffbeb; border: 1px solid #fde68a; border-radius: 6px; padding: 8px 10px; margin: 6px 0; font-size: 12px; }
    .sub { font-size: 11.5px; color: #475569; margin-top: 3px; }
    .steps-print { margin: 6px 0 8px 18px; padding: 0; font-size: 11.5px; }
    .check-table { width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 8px; }
    .check-table th, .check-table td { border: 1px solid #cbd5e1; padding: 4px 6px; text-align: center; }
    .check-table th { background: #e2e8f0; }
    .memo-print { background: #eff6ff; border-left: 4px solid #2563eb; padding: 6px 10px; font-size: 11.5px; color: #1e3a8a; }
    .footer-note { border-top: 1px solid #e2e8f0; padding-top: 8px; margin-top: 12px; text-align: center; font-size: 11px; color: #64748b; }
    @media print { .no-print { display: none !important; } body { margin: 0; padding: 0; } }
  </style>
</head>
<body>
  <div class="no-print">
    <span>💡 인쇄 창에서 <strong>'PDF로 저장'</strong>을 선택해 수업 자료로 활용하세요.</span>
    <button class="print-btn" onclick="window.print()">🖨️ 인쇄 / PDF 저장</button>
  </div>
  <header class="sheet-header">
    <div>
      <h1>${isTeacher ? '[교사용 해설]' : '[학생용 과제]'} ${safeTitle}</h1>
      <p>2022 개정 공통수학1 [10공수1-02-11] · 총 ${state.bundle.length}문항 · 지도교사: ${safeAuthor} (${today})</p>
    </div>
    <div class="info-box">
      ${isTeacher ? '<strong>교사용 지도·검산 자료</strong>' : '학년/반: _______ 이름: _______________'}
    </div>
  </header>
  <div class="inst-box"><strong>안내:</strong> ${safeInst}</div>
  ${blocks}
  <footer class="footer-note">초강스 에듀테크 LAB · 8주차 고수 미션 (실제 학생 개인정보 미수집 · 중근/허근 제외)</footer>
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

  // --- DOM Init & Rendering ---
  function init() {
    const authorInput = document.getElementById('authorInput');
    const titleInput = document.getElementById('titleInput');
    const instructionInput = document.getElementById('instructionInput');
    const builderMemoInput = document.getElementById('builderMemoInput');

    const btnSetBasic = document.getElementById('btnSetBasic');
    const btnSetExplain = document.getElementById('btnSetExplain');
    const btnSetMixed6 = document.getElementById('btnSetMixed6');

    const typeBtns = document.querySelectorAll('.btn-type');
    const pillBtnsA = document.querySelectorAll('.btn-pill-a');
    const opBtns = document.querySelectorAll('.btn-op');
    const sliderR = document.getElementById('sliderR');
    const sliderS = document.getElementById('sliderS');
    const valR = document.getElementById('valR');
    const valS = document.getElementById('valS');

    const dispFormulaMain = document.getElementById('dispFormulaMain');
    const dispFormulaExpanded = document.getElementById('dispFormulaExpanded');
    const badgeGraphType = document.getElementById('badgeGraphType');
    const badgeClosedType = document.getElementById('badgeClosedType');
    const btnAddToBundle = document.getElementById('btnAddToBundle');
    const addBtnCount = document.getElementById('addBtnCount');

    const exportGateBox = document.getElementById('exportGateBox');
    const gateBadge = document.getElementById('gateBadge');
    const gateReason = document.getElementById('gateReason');
    const btnDownloadStudent = document.getElementById('btnDownloadStudent');
    const btnPrintStudent = document.getElementById('btnPrintStudent');
    const btnDownloadTeacher = document.getElementById('btnDownloadTeacher');
    const btnPrintTeacher = document.getElementById('btnPrintTeacher');
    const btnCopySubmission = document.getElementById('btnCopySubmission');

    const tabBtns = document.querySelectorAll('.task-tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    const tabBundleCountBadge = document.getElementById('tabBundleCountBadge');
    const resetAlert = document.getElementById('resetAlert');

    const summaryTotal = document.getElementById('summaryTotal');
    const summaryChecked = document.getElementById('summaryChecked');
    const summaryBreakdown = document.getElementById('summaryBreakdown');
    const btnToggleCheckAll = document.getElementById('btnToggleCheckAll');
    const bundleListMount = document.getElementById('bundleListMount');

    const previewTypeTag = document.getElementById('previewTypeTag');
    const previewMount = document.getElementById('previewMount');

    const copyModal = document.getElementById('copyModal');
    const copyModalTextarea = document.getElementById('copyModalTextarea');
    const btnModalCopy = document.getElementById('btnModalCopy');
    const toast = document.getElementById('toast');

    let resetTimer = null;
    let toastTimer = null;

    function showToast(msg) {
      toast.textContent = msg;
      toast.classList.add('show');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
    }

    function showCopyFallback(text) {
      copyModalTextarea.value = text;
      copyModal.showModal();
    }

    // Native <dialog> close cleanup & Safari closedby="any" fallback
    copyModal.addEventListener('close', () => {
      copyModal.returnValue = '';
    });
    if (!('closedBy' in HTMLDialogElement.prototype)) {
      const outside = (e, dlg) => {
        const rect = dlg.getBoundingClientRect();
        return e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom;
      };
      let pressedOutside = false;
      copyModal.addEventListener('pointerdown', (e) => { pressedOutside = outside(e, copyModal); });
      copyModal.addEventListener('pointerup', (e) => { if (pressedOutside && outside(e, copyModal)) copyModal.close(); });
    }

    function onBuilderConditionChange(notify = true) {
      state.previewSelectedOptionIdx = null;
      state.previewSolutionRevealed = false;

      if (state.builder.r >= state.builder.s) {
        state.builder.s = Math.min(4, state.builder.r + 1);
        sliderS.value = state.builder.s;
      }
      sliderR.max = state.builder.s - 1;
      sliderS.min = state.builder.r + 1;
      valR.textContent = state.builder.r;
      valS.textContent = state.builder.s;

      renderBuilder();
      renderPreview();

      if (notify) {
        resetAlert.classList.add('show');
        clearTimeout(resetTimer);
        resetTimer = setTimeout(() => resetAlert.classList.remove('show'), 3000);
      }
    }

    function renderBuilder() {
      const b = state.builder;
      typeBtns.forEach(btn => btn.classList.toggle('active', btn.getAttribute('data-type') === b.type));
      pillBtnsA.forEach(btn => btn.classList.toggle('active', parseInt(btn.getAttribute('data-a'), 10) === b.a));
      opBtns.forEach(btn => btn.classList.toggle('active', btn.getAttribute('data-op') === b.op));

      const ineq = ineqString(b);
      const expanded = expandedString(b);
      const sol = solveInterval(b);

      dispFormulaMain.textContent = ineq;
      dispFormulaExpanded.textContent = `전개형: ${expanded} ${OP_MAP[b.op]} 0`;
      badgeGraphType.textContent = b.a > 0 ? '아래로 볼록 (a > 0)' : '위로 볼록 (a < 0)';
      badgeClosedType.textContent = sol.closed ? '등호 포함 (닫힌 점 ●)' : '등호 미포함 (열린 점 ○)';
      badgeClosedType.className = `f-badge ${sol.closed ? 'active-closed' : ''}`;

      addBtnCount.textContent = state.bundle.length;
      btnAddToBundle.disabled = state.bundle.length >= 9;
    }

    function renderGate() {
      const status = getExportStatus();
      exportGateBox.classList.toggle('unlocked', status.ok);
      gateBadge.className = `gate-badge ${status.ok ? 'unlocked' : 'locked'}`;
      gateBadge.textContent = status.ok ? '저장 가능' : '저장 잠김';
      gateReason.textContent = status.reason;

      btnDownloadStudent.disabled = !status.ok;
      btnPrintStudent.disabled = !status.ok;
      btnDownloadTeacher.disabled = !status.ok;
      btnPrintTeacher.disabled = !status.ok;
    }

    function renderBundle() {
      const n = state.bundle.length;
      const checkedCount = state.bundle.filter(item => item.checked).length;
      const counts = { solve: 0, compare: 0, explain: 0 };
      state.bundle.forEach(item => { counts[item.type]++; });

      tabBundleCountBadge.textContent = `${n}문항`;
      summaryTotal.textContent = `${n} / 9문항`;
      summaryChecked.textContent = `${checkedCount} / ${n} 완료`;
      summaryBreakdown.textContent = `풀기 ${counts.solve} · 비교 ${counts.compare} · 설명 ${counts.explain}`;
      addBtnCount.textContent = n;
      btnAddToBundle.disabled = n >= 9;

      const allChecked = n > 0 && checkedCount === n;
      btnToggleCheckAll.textContent = allChecked ? '⬜ 전체 체크 해제' : '✅ 전체 확인 체크';
      btnToggleCheckAll.disabled = n === 0;

      if (n === 0) {
        bundleListMount.innerHTML = `<div class="bundle-empty">담긴 문항이 없습니다. 왼쪽에서 세트를 선택하거나 새 문항을 추가해 주세요 (3~9문항).</div>`;
        renderGate();
        return;
      }

      bundleListMount.innerHTML = state.bundle.map((item, idx) => {
        const ineq = ineqString(item);
        const expanded = expandedString(item);
        const ans = answerString(item);
        const compareParams = { ...item, op: OP_FLIP_EQ[item.op] };
        const testPts = generateTestPoints(item);
        const promptPreview = item.type === 'solve'
          ? `${ineq} 의 해를 구하고 수직선에 나타내세요.`
          : (item.type === 'compare'
            ? `${ineq} 과 ${ineqString(compareParams)} 의 해와 수직선 차이를 비교하세요.`
            : `${ineq} 에 대한 오답 "${answerString(compareParams)}" 을 고치고 이유를 설명하세요.`);

        const inspectorHtml = item.inspectorOpen ? `
          <div class="bundle-inspector">
            <div style="font-weight:700; color:var(--accent); margin-bottom:8px;">정답: ${escapeHtml(ans)}</div>
            <div class="svg-wrap">${generateSvg(item)}</div>
            <div class="table-wrap">
              <table class="calc-table">
                <thead><tr><th>검산 구간</th><th>대입 계산</th><th>부호</th><th>일치 여부</th></tr></thead>
                <tbody>
                  ${testPts.map(t => `<tr><td>${escapeHtml(t.point)}</td><td><code>${escapeHtml(t.expr)}</code></td><td class="${t.sign === '+' ? 'sign-pos' : 'sign-neg'}">${t.sign}</td><td>${t.isMatch ? '일치 ✅' : '불일치 ❌'}</td></tr>`).join('')}
                </tbody>
              </table>
            </div>
          </div>
        ` : '';

        return `
          <article class="bundle-card ${item.checked ? 'checked' : ''}" data-item-id="${item.id}">
            <div class="bundle-card-top">
              <div class="bundle-badges">
                <span class="order-badge">${idx + 1}번</span>
                <span class="type-badge ${item.type}">${TYPE_LABELS[item.type]}</span>
              </div>
              <div class="bundle-controls">
                <button type="button" class="btn-mini btn-move-up" data-idx="${idx}" ${idx === 0 ? 'disabled' : ''} aria-label="${idx + 1}번 문항 위로">▲</button>
                <button type="button" class="btn-mini btn-move-down" data-idx="${idx}" ${idx === n - 1 ? 'disabled' : ''} aria-label="${idx + 1}번 문항 아래로">▼</button>
                <button type="button" class="btn-mini btn-toggle-inspect" data-idx="${idx}">${item.inspectorOpen ? '▲ 검산 닫기' : '👁 정답·검산'}</button>
                <button type="button" class="btn-mini btn-mini-danger btn-delete-item" data-idx="${idx}" aria-label="${idx + 1}번 문항 삭제">🗑 삭제</button>
              </div>
            </div>
            <div class="bundle-expr-row">
              <span class="bundle-formula">${escapeHtml(ineq)}</span>
              <span class="bundle-expanded">(전개: ${escapeHtml(expanded)} ${OP_MAP[item.op]} 0)</span>
            </div>
            <p class="bundle-prompt-preview">${escapeHtml(promptPreview)}</p>
            <div class="bundle-memo-row">
              <div class="memo-field">
                <label for="memo_${item.id}">교사 메모 (교사용 해설에만 포함)</label>
                <input type="text" id="memo_${item.id}" class="bundle-memo-input" data-idx="${idx}" maxlength="250" value="${escapeHtml(item.memo)}" placeholder="지도 시 유의점을 입력하세요">
              </div>
              <label class="check-toggle-label">
                <input type="checkbox" class="bundle-check-input" data-idx="${idx}" ${item.checked ? 'checked' : ''}>
                <span>확인 체크 완료</span>
              </label>
            </div>
            ${inspectorHtml}
          </article>
        `;
      }).join('');

      // Bind dynamic item controls
      bundleListMount.querySelectorAll('.btn-move-up').forEach(btn => {
        btn.addEventListener('click', () => {
          const i = parseInt(btn.getAttribute('data-idx'), 10);
          if (i > 0) {
            [state.bundle[i - 1], state.bundle[i]] = [state.bundle[i], state.bundle[i - 1]];
            renderBundle();
          }
        });
      });

      bundleListMount.querySelectorAll('.btn-move-down').forEach(btn => {
        btn.addEventListener('click', () => {
          const i = parseInt(btn.getAttribute('data-idx'), 10);
          if (i < state.bundle.length - 1) {
            [state.bundle[i], state.bundle[i + 1]] = [state.bundle[i + 1], state.bundle[i]];
            renderBundle();
          }
        });
      });

      bundleListMount.querySelectorAll('.btn-toggle-inspect').forEach(btn => {
        btn.addEventListener('click', () => {
          const i = parseInt(btn.getAttribute('data-idx'), 10);
          state.bundle[i].inspectorOpen = !state.bundle[i].inspectorOpen;
          renderBundle();
        });
      });

      bundleListMount.querySelectorAll('.btn-delete-item').forEach(btn => {
        btn.addEventListener('click', () => {
          const i = parseInt(btn.getAttribute('data-idx'), 10);
          state.bundle.splice(i, 1);
          state.activePresetKey = null;
          syncPresetHighlight();
          renderBundle();
          showToast('문항을 묶음에서 삭제했습니다.');
        });
      });

      bundleListMount.querySelectorAll('.bundle-memo-input').forEach(inp => {
        inp.addEventListener('input', (e) => {
          const i = parseInt(inp.getAttribute('data-idx'), 10);
          state.bundle[i].memo = e.target.value;
        });
      });

      bundleListMount.querySelectorAll('.bundle-check-input').forEach(chk => {
        chk.addEventListener('change', (e) => {
          const i = parseInt(chk.getAttribute('data-idx'), 10);
          state.bundle[i].checked = e.target.checked;
          renderBundle();
        });
      });

      renderGate();
    }

    function renderPreview() {
      const b = state.builder;
      const ineq = ineqString(b);
      previewTypeTag.textContent = `현재 조건 · ${TYPE_LABELS[b.type]} 미리보기`;

      if (b.type === 'solve') {
        const choices = generateChoices(b);
        const correctChoice = choices.find(c => c.isCorrect);
        const userChoice = state.previewSelectedOptionIdx !== null ? choices[state.previewSelectedOptionIdx] : null;
        const testPts = generateTestPoints(b);

        let solutionHtml = '';
        if (state.previewSolutionRevealed) {
          let verdictCls = 'correct';
          let verdictLabel = '해설 보기';
          let verdictText = `올바른 해는 '${correctChoice.text}'입니다.`;
          if (userChoice && userChoice.isCorrect) {
            verdictLabel = '정답입니다!';
            verdictText = `선택한 '${correctChoice.text}'이(가) 올바른 해입니다.`;
          } else if (userChoice) {
            verdictCls = 'incorrect';
            verdictLabel = '다시 확인해 보세요';
            verdictText = `선택한 '${userChoice.text}' 대신, 올바른 해는 '${correctChoice.text}'입니다.`;
          }

          solutionHtml = `
            <div class="solution-box" id="previewSolutionBox">
              <div class="verdict-row">
                <span class="verdict-tag ${verdictCls}">${verdictLabel}</span>
                <span>${escapeHtml(verdictText)}</span>
              </div>
              <div class="svg-wrap">${generateSvg(b)}</div>
              <ol class="step-list">${generateSteps(b).map(s => `<li>${s}</li>`).join('')}</ol>
              <div class="table-wrap">
                <table class="calc-table">
                  <thead><tr><th>검산 구간</th><th>대입 계산</th><th>부호</th><th>일치 여부</th></tr></thead>
                  <tbody>
                    ${testPts.map(t => `<tr><td>${escapeHtml(t.point)}</td><td><code>${escapeHtml(t.expr)}</code></td><td class="${t.sign === '+' ? 'sign-pos' : 'sign-neg'}">${t.sign}</td><td>${t.isMatch ? '일치 ✅' : '불일치 ❌'}</td></tr>`).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          `;
        }

        previewMount.innerHTML = `
          <p class="task-prompt"><span class="formula-highlight">${escapeHtml(ineq)}</span> 의 해를 구하고 수직선에 나타내세요.</p>
          <div class="options-grid" role="radiogroup" aria-label="미리보기 보기">
            ${choices.map((c, idx) => {
              const cls = [
                'option-card',
                state.previewSelectedOptionIdx === idx ? 'selected' : '',
                state.previewSolutionRevealed && c.isCorrect ? 'correct' : '',
                state.previewSolutionRevealed && !c.isCorrect && state.previewSelectedOptionIdx === idx ? 'incorrect' : ''
              ].filter(Boolean).join(' ');
              return `
                <button type="button" class="${cls}" data-opt-idx="${idx}">
                  <span class="opt-indicator">${String.fromCharCode(65 + idx)}</span>
                  <span class="opt-text">${escapeHtml(c.text)}</span>
                </button>
              `;
            }).join('')}
          </div>
          <div class="opt-actions">
            <button type="button" class="btn-primary" id="btnPreviewCheck">정답 및 해설 확인 🔍</button>
            <button type="button" class="btn-secondary" id="btnPreviewReset">선택 초기화 ↺</button>
          </div>
          ${solutionHtml}
        `;

        previewMount.querySelectorAll('.option-card').forEach(btn => {
          btn.addEventListener('click', () => {
            state.previewSelectedOptionIdx = parseInt(btn.getAttribute('data-opt-idx'), 10);
            renderPreview();
          });
        });
        document.getElementById('btnPreviewCheck').addEventListener('click', () => {
          state.previewSolutionRevealed = true;
          renderPreview();
        });
        document.getElementById('btnPreviewReset').addEventListener('click', () => {
          state.previewSelectedOptionIdx = null;
          state.previewSolutionRevealed = false;
          renderPreview();
        });
      } else if (b.type === 'compare') {
        const compParams = { ...b, op: OP_FLIP_EQ[b.op] };
        const solA = solveInterval(b);
        const solB = solveInterval(compParams);
        previewMount.innerHTML = `
          <p class="task-prompt">같은 식 <span class="formula-highlight">${escapeHtml(exprString(b))}</span> 에서 등호 유무만 바꾸어 해와 수직선을 비교합니다.</p>
          <div class="compare-grid">
            <div class="compare-card-col">
              <div class="compare-col-header">조건 A (현재 부등호)</div>
              <div class="compare-expr">${escapeHtml(ineq)}</div>
              <div class="compare-ans">해: ${escapeHtml(answerString(b))}</div>
              <div style="font-size:0.84rem; color:var(--text-muted);">${solA.closed ? '영점 포함 (닫힌 점 ●)' : '영점 제외 (열린 점 ○)'}</div>
              <div class="svg-wrap">${generateSvg(b)}</div>
            </div>
            <div class="compare-card-col">
              <div class="compare-col-header">조건 B (등호 반대)</div>
              <div class="compare-expr">${escapeHtml(ineqString(compParams))}</div>
              <div class="compare-ans">해: ${escapeHtml(answerString(compParams))}</div>
              <div style="font-size:0.84rem; color:var(--text-muted);">${solB.closed ? '영점 포함 (닫힌 점 ●)' : '영점 제외 (열린 점 ○)'}</div>
              <div class="svg-wrap">${generateSvg(compParams)}</div>
            </div>
          </div>
        `;
      } else {
        const compParams = { ...b, op: OP_FLIP_EQ[b.op] };
        const flawed = answerString(compParams);
        const sol = solveInterval(b);
        previewMount.innerHTML = `
          <p class="task-prompt">두 근의 포함 여부를 잘못 쓴 해를 고치고, 그 수학적 이유를 설명하는 문항입니다.</p>
          <div class="misconception-box">
            <strong>⚠️ 가상 학생의 오답 사례</strong>
            <p style="margin-top:6px;">이차부등식 <strong>${escapeHtml(ineq)}</strong> 의 해를 <strong>"${escapeHtml(flawed)}"</strong> 라고 썼습니다.</p>
          </div>
          <div class="fix-box">
            <strong>✅ 바른 해 및 설명 방향</strong>
            <p style="margin-top:6px;">바른 해: <strong>"${escapeHtml(answerString(b))}"</strong></p>
            <p style="margin-top:4px; color:var(--text-muted); font-size:0.9rem;">
              x = ${b.r}, ${b.s}일 때 f(x) = 0입니다. ${sol.closed ? `등호(${OP_MAP[b.op]})가 있으므로 두 영점이 부등식을 참으로 만들어 해에 포함됩니다.` : `등호(${OP_MAP[b.op]})가 없으므로 0은 조건을 만족하지 않아 두 영점을 제외해야 합니다.`}
            </p>
          </div>
        `;
      }
    }

    function syncPresetHighlight() {
      btnSetBasic.classList.toggle('active', state.activePresetKey === 'basic');
      btnSetExplain.classList.toggle('active', state.activePresetKey === 'explain');
      btnSetMixed6.classList.toggle('active', state.activePresetKey === 'mixed6');
    }

    // Event Bindings
    authorInput.addEventListener('input', e => { state.author = e.target.value.trim() || '선생님'; });
    titleInput.addEventListener('input', e => { state.title = e.target.value.trim() || '이차부등식 우리 반 맞춤 과제'; });
    instructionInput.addEventListener('input', e => { state.instruction = e.target.value.trim(); });
    builderMemoInput.addEventListener('input', e => { state.builder.memo = e.target.value; });

    function applySetPreset(key, label) {
      state.activePresetKey = key;
      state.bundle = createPresetBundle(key);
      syncPresetHighlight();
      renderBundle();
      showToast(`${label}를 불러왔습니다. 문항을 검토한 뒤 확인 체크를 완료해 주세요.`);
    }

    btnSetBasic.addEventListener('click', () => applySetPreset('basic', '기본 연습 세트(3문항)'));
    btnSetExplain.addEventListener('click', () => applySetPreset('explain', '설명 연습 세트(3문항)'));
    btnSetMixed6.addEventListener('click', () => applySetPreset('mixed6', '혼합 6문항 세트'));

    typeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        state.builder.type = btn.getAttribute('data-type');
        onBuilderConditionChange();
      });
    });

    pillBtnsA.forEach(btn => {
      btn.addEventListener('click', () => {
        state.builder.a = parseInt(btn.getAttribute('data-a'), 10);
        onBuilderConditionChange();
      });
    });

    opBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        state.builder.op = btn.getAttribute('data-op');
        onBuilderConditionChange();
      });
    });

    sliderR.addEventListener('input', e => {
      state.builder.r = parseInt(e.target.value, 10);
      onBuilderConditionChange();
    });

    sliderS.addEventListener('input', e => {
      state.builder.s = parseInt(e.target.value, 10);
      onBuilderConditionChange();
    });

    btnAddToBundle.addEventListener('click', () => {
      if (state.bundle.length >= 9) {
        showToast('최대 9문항까지만 담을 수 있습니다.');
        return;
      }
      const b = state.builder;
      state.bundle.push(makeItem(b.type, b.a, b.r, b.s, b.op, b.memo.trim()));
      state.activePresetKey = null;
      syncPresetHighlight();
      renderBundle();
      showToast(`${state.bundle.length}번 문항(${TYPE_LABELS[b.type]})을 묶음에 추가했습니다. 확인 체크를 해주세요.`);
    });

    btnToggleCheckAll.addEventListener('click', () => {
      const allChecked = state.bundle.length > 0 && state.bundle.every(item => item.checked);
      state.bundle.forEach(item => { item.checked = !allChecked; });
      renderBundle();
      showToast(!allChecked ? '모든 문항을 확인 체크 완료했습니다.' : '전체 확인 체크를 해제했습니다.');
    });

    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        tabPanes.forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        const target = document.getElementById(btn.getAttribute('data-tab'));
        if (target) target.classList.add('active');
      });
    });

    function runGuardedExport(isTeacher, mode) {
      const status = getExportStatus();
      if (!status.ok) {
        showToast(status.reason);
        return;
      }
      const html = buildExportHtml(isTeacher);
      const label = isTeacher ? '교사용 해설' : '학생용 과제';
      if (mode === 'download') {
        const prefix = isTeacher ? 'week08_teacher_guide' : 'week08_student_worksheet';
        downloadHtmlFile(`${prefix}.html`, html);
        showToast(`💾 ${label} HTML 파일을 저장했습니다.`);
      } else {
        if (typeof window.EdutechPrint === 'function') {
          window.EdutechPrint(html, label);
          showToast(`🖨️ ${label} 인쇄 창을 열었습니다.`);
        } else {
          downloadHtmlFile(`${isTeacher ? 'teacher' : 'student'}.html`, html);
        }
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
        : 'https://sool1982-1213.github.io/edutech-weekly-missions/week08/';

      const comment = `8주차 / ${state.author || '수현T'} / 고수 / 미션 완료\n결과 링크 또는 파일: ${cleanUrl}\n수업에 써볼 방법: 우리 반 반응에 맞춰 기본 연습과 설명 연습 문항을 3~9개로 묶고, 검토 체크 후 학생용 과제와 교사용 해설로 나눠 활용하겠습니다.`;

      navigator.clipboard.writeText(comment).then(() => {
        showToast('8주차 제출 댓글 양식이 복사되었습니다!');
      }).catch(() => {
        showCopyFallback(comment);
      });
    });

    btnModalCopy.addEventListener('click', () => {
      copyModalTextarea.select();
      navigator.clipboard?.writeText(copyModalTextarea.value).catch(() => {});
      try { document.execCommand('copy'); } catch (e) {}
      copyModal.close();
      showToast('복사되었습니다!');
    });

    // Expose safe read-only debug/export hook for automated verification without modifying state
    window.__week08Verify = {
      buildExportHtml: (isTeacher) => buildExportHtml(isTeacher),
      getState: () => JSON.parse(JSON.stringify(state))
    };

    onBuilderConditionChange(false);
    renderBundle();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
