/**
 * 초강스 에듀테크 LAB 10주차 고수 미션: 우리 반 전용 수학 방탈출 교실
 * 2022 개정 공통수학1 · 다항식 · 이차방정식 · 이차부등식 · 범위가 주어진 이차함수의 최솟값 (미분 배제)
 * 지도교사: 수현T
 */

(function () {
  'use strict';

  const state = {
    author: '수현T',
    p: 0,           // -4 .. 2
    diff: 4,        // 2 | 4 | 6 (q = p + diff)
    lockCount: 4,   // 3 | 4
    requireReason: false,
    storyTitle: '칠판 속 단서를 구출하라',
    storyIntro: '쉬는 시간 직전, 칠판에 남아 있던 이차식 하나가 교실 문 자물쇠와 연결되어 잠겨 버렸습니다! 같은 식을 네 가지 관점으로 읽어 단서 숫자를 모으고, 모둠 친구들과 이유를 확인하며 교실 문을 열어 봅시다.',
    storyOutro: '네 개의 단서 중 가장 도움이 되었던 힌트는 무엇이었고, 그 문제의 풀이 이유를 친구에게 어떻게 설명했나요?',
    teacherReviewed: false,

    // Runtime Game State (strictly separated from exports)
    started: false,
    currentStep: 0, // 0..lockCount-1 = locks, lockCount = final door
    solved: [],     // boolean[] length lockCount
    clues: [],      // (string|null)[] length lockCount
    hintsOpened: [],// number[] (0..3) length lockCount
    studentInputs: [],
    studentReasons: [],
    lastRetryMsg: '',
    finalCodeInput: '',
    finalRetryMsg: '',
    escaped: false
  };

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, m => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[m]);
  }

  function factorStr(root) {
    if (root === 0) return 'x';
    return root > 0 ? `(x − ${root})` : `(x + ${Math.abs(root)})`;
  }

  function exprString(p, q) {
    if (p === 0) return `x${factorStr(q)}`;
    if (q === 0) return `x${factorStr(p)}`;
    return `${factorStr(p)}${factorStr(q)}`;
  }

  function expandedString(p, q) {
    const B = -(p + q);
    const C = p * q;
    let res = 'x²';
    if (B !== 0) {
      const sign = B > 0 ? ' + ' : ' − ';
      const absB = Math.abs(B) === 1 ? '' : Math.abs(B);
      res += `${sign}${absB}x`;
    }
    if (C !== 0) {
      const sign = C > 0 ? ' + ' : ' − ';
      res += `${sign}${Math.abs(C)}`;
    }
    return res;
  }

  function vertexFormString(p, diff) {
    const m = p + diff / 2;
    const minVal = -(diff * diff) / 4;
    const sq = m === 0 ? 'x²' : (m > 0 ? `(x − ${m})²` : `(x + ${Math.abs(m)})²`);
    return `${sq} − ${Math.abs(minVal)}`;
  }

  function buildLocks(p, diff, lockCount) {
    const q = p + diff;
    const expr = exprString(p, q);
    const expanded = expandedString(p, q);
    const m = p + diff / 2;
    const minVal = -(diff * diff) / 4;

    const locks = [
      {
        idx: 0,
        title: '잠금 1 · 다항식의 상수항',
        concept: '상수항',
        question: `식 f(x) = ${expr} 을 전개했을 때 상수항은 얼마일까요?`,
        answer: p * q,
        clue: String(Math.abs(p * q) % 10),
        hints: [
          '힌트 1 (개념): 식을 x² + Bx + C 꼴로 전개했을 때, 문자 x가 없는 수 부분을 상수항이라고 합니다.',
          '힌트 2 (접근 방법): 두 일차식의 상수 부분 (−p)와 (−q)를 곱하면 상수항이 됩니다. 한 근이 0이면 상수항은 어떻게 될까요?',
          `힌트 3 (계산 직전): (${p}) × (${q})를 계산하면 f(0)과 같은 상수항을 얻습니다. 전개형은 ${expanded} 입니다.`
        ],
        verifyText: (() => {
          const negP = p === 0 ? '0' : (p > 0 ? `(−${p})` : `${Math.abs(p)}`);
          const negQ = q === 0 ? '0' : (q > 0 ? `(−${q})` : `${Math.abs(q)}`);
          return `f(0) = ${negP} × ${negQ} = ${p * q}, 전개형: ${expanded}`;
        })()
      },
      {
        idx: 1,
        title: '잠금 2 · 이차방정식의 큰 근',
        concept: '방정식의 근',
        question: `이차방정식 f(x) = 0 의 두 실근 중 더 큰 근은 무엇일까요?`,
        answer: q,
        clue: String(Math.abs(q) % 10),
        hints: [
          '힌트 1 (개념): 두 식의 곱 A · B = 0이 되려면 A = 0 또는 B = 0이어야 합니다.',
          '힌트 2 (접근 방법): 인수분해된 식에서 각 괄호가 0이 되게 하는 x 값을 두 개 구합니다.',
          `힌트 3 (계산 직전): 두 근은 ${p}와 ${q}입니다. 수직선에서 더 오른쪽(큰 값)을 입력하세요.`
        ],
        verifyText: `f(${p}) = 0, f(${q}) = 0 이고 ${p} < ${q} 이므로 큰 근은 ${q}`
      },
      {
        idx: 2,
        title: '잠금 3 · 이차부등식의 정수 해 개수',
        concept: '부등식의 정수 해',
        question: `이차부등식 f(x) ≤ 0 을 만족하는 정수 x는 모두 몇 개일까요?`,
        answer: diff + 1,
        clue: String(Math.abs(diff + 1) % 10),
        hints: [
          '힌트 1 (개념): 최고차항 계수가 1(양수)인 f(x) ≤ 0의 해는 두 근 사이 구간이며, 등호(≤) 때문에 두 근을 포함합니다.',
          `힌트 2 (접근 방법): 해의 범위는 ${p} ≤ x ≤ ${q} 입니다. 양 끝 정수를 모두 포함해 세어야 합니다.`,
          `힌트 3 (계산 직전): (${q} − ${p}) + 1 또는 ${p}부터 ${q}까지 정수를 하나씩 나열해 개수를 세어 보세요.`
        ],
        verifyText: (() => {
          const list = [];
          for (let k = p; k <= q; k++) list.push(k);
          return `해: ${p} ≤ x ≤ ${q} → 정수: {${list.join(', ')}} (${diff + 1}개)`;
        })()
      }
    ];

    if (lockCount === 4) {
      const left = p - 1;
      const right = q + 1;
      const vForm = vertexFormString(p, diff);
      locks.push({
        idx: 3,
        title: '잠금 4 · 제한된 범위의 최솟값',
        concept: '이차함수의 최솟값',
        question: `범위 ${left} ≤ x ≤ ${right} 에서 이차함수 f(x)의 최솟값은 얼마일까요?`,
        answer: minVal,
        clue: String(Math.abs(minVal) % 10),
        hints: [
          '힌트 1 (개념): 아래로 볼록한 이차함수는 대칭축(꼭짓점)이 주어진 범위에 들어 있으면 꼭짓점에서 최솟값을 가집니다.',
          `힌트 2 (접근 방법): 두 근 ${p}와 ${q}의 한가운데 x = (${p} + ${q}) / 2 = ${m} 은 범위 ${left} ≤ x ≤ ${right} 안에 있습니다.`,
          `힌트 3 (계산 직전): 완전제곱식 f(x) = ${vForm} 또는 x = ${m}을 대입해 f(${m}) 값을 구하세요.`
        ],
        verifyText: `완전제곱식 f(x) = ${vForm}, 꼭짓점 x = ${m} ∈ [${left}, ${right}] → 최솟값 f(${m}) = ${minVal}`
      });
    }

    return locks;
  }

  function getExpectedPassword() {
    const locks = buildLocks(state.p, state.diff, state.lockCount);
    return locks.map(l => l.clue).join('');
  }

  function getSolvedCount() {
    return state.solved.filter(Boolean).length;
  }

  function isStepAccessible(stepIdx) {
    if (!state.started || state.escaped) return false;
    const solvedCount = getSolvedCount();
    if (stepIdx < state.lockCount) {
      return stepIdx <= solvedCount;
    }
    return stepIdx === state.lockCount && solvedCount === state.lockCount;
  }

  // Strict Integer Parser (rejects empty string, accepts 0, -4, Unicode −4)
  function parseIntegerInput(raw) {
    const trimmed = String(raw).trim();
    if (trimmed === '') {
      return { ok: false, msg: '답을 입력해 주세요. (빈 칸은 제출할 수 없습니다)' };
    }
    const normalized = trimmed.replace(/[\u2212\u2013\u2014]/g, '-');
    if (!/^[+-]?\d+$/.test(normalized)) {
      return { ok: false, msg: '정수만 입력해 주세요. (예: 0, -4, 5)' };
    }
    return { ok: true, value: parseInt(normalized, 10) };
  }

  // Accessible Error Helper
  let ariaTimer = null;
  function setFieldError(inputEl, isInvalid, msg = null, announce = true) {
    if (!inputEl) return;
    const errorId = inputEl.dataset.error;
    const errorEl = errorId ? document.getElementById(errorId) : null;
    if (errorEl && msg) errorEl.textContent = msg;

    if (isInvalid) {
      inputEl.setAttribute('aria-invalid', 'true');
      inputEl.classList.add('user-invalid-fallback');
      if (errorId) inputEl.setAttribute('aria-describedby', errorId);
      if (errorEl) errorEl.classList.add('visible');

      if (announce && errorEl) {
        const announcer = document.getElementById('ariaAnnouncer');
        clearTimeout(ariaTimer);
        announcer.textContent = '';
        ariaTimer = setTimeout(() => { announcer.textContent = errorEl.textContent; }, 120);
      }
    } else {
      inputEl.setAttribute('aria-invalid', 'false');
      inputEl.classList.remove('user-invalid-fallback');
      inputEl.removeAttribute('aria-describedby');
      if (errorEl) errorEl.classList.remove('visible');
    }
  }

  // --- Export HTML Generator (Strict Separation & Zero Student Inputs) ---
  function buildExportHtml(isTeacher) {
    const p = state.p;
    const q = p + state.diff;
    const expr = exprString(p, q);
    const locks = buildLocks(p, state.diff, state.lockCount);
    const expectedPwd = locks.map(l => l.clue).join('');
    const safeAuthor = escapeHtml(state.author || '수현T');
    const safeTitle = escapeHtml(state.storyTitle || '수학 방탈출 교실');
    const safeIntro = escapeHtml(state.storyIntro || '');
    const safeOutro = escapeHtml(state.storyOutro || '');
    const today = new Date().toLocaleDateString('ko-KR');

    if (!isTeacher) {
      // STUDENT INVESTIGATION NOTEBOOK: ZERO answers, ZERO hint texts, ZERO clue digits, ZERO final password, ZERO student inputs
      return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <title>[학생용 수사 노트] ${safeTitle} (${safeAuthor})</title>
  <style>
    @page { size: A4 portrait; margin: 11mm 12mm; }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    body { max-width: 820px; margin: 10px auto; padding: 10px 16px; font-family: -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif; color: #0f172a; line-height: 1.5; font-size: 13px; }
    .no-print { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 10px 14px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; }
    .print-btn { background: #0f766e; color: #fff; border: none; padding: 7px 14px; border-radius: 6px; font-weight: 700; cursor: pointer; }
    header { border-bottom: 2px solid #0f766e; padding-bottom: 6px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: flex-end; gap: 10px; flex-wrap: wrap; }
    header h1 { font-size: 18px; margin: 0 0 2px; color: #0f766e; }
    header p { margin: 0; font-size: 11.5px; color: #475569; }
    .info { border: 1px solid #cbd5e1; padding: 4px 10px; border-radius: 6px; font-size: 12px; }
    .story-box { background: #f0fdf4; border-left: 4px solid #0f766e; padding: 8px 12px; margin-bottom: 10px; font-size: 12.5px; }
    .roles { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-bottom: 10px; font-size: 11.5px; }
    .role { border: 1px solid #cbd5e1; border-radius: 6px; padding: 6px; background: #f8fafc; }
    .eq-box { border: 1.5px solid #0f766e; border-radius: 8px; padding: 8px 12px; text-align: center; font-family: "Cambria Math", serif; font-size: 17px; font-weight: 800; color: #0f766e; margin-bottom: 10px; }
    .lock-card { border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px 12px; margin-bottom: 10px; break-inside: avoid; }
    .lock-top { display: flex; justify-content: space-between; font-weight: 800; color: #0f766e; margin-bottom: 4px; }
    .write-box { border: 1px dashed #94a3b8; border-radius: 6px; padding: 8px 10px; min-height: 62px; background: #fafafa; color: #64748b; line-height: 1.85; margin-top: 6px; }
    .pwd-box { border: 1.5px solid #0f766e; border-radius: 8px; padding: 10px 12px; background: #f8fafc; margin-top: 10px; }
    @media print { .no-print { display: none !important; } body { margin: 0; padding: 0; } }
  </style>
</head>
<body>
  <div class="no-print">
    <span>💡 학생 배부용 수사 노트입니다 (정답·힌트·단서·최종 암호 제외).</span>
    <button class="print-btn" onclick="window.print()">🖨️ 인쇄 / PDF</button>
  </div>
  <header>
    <div>
      <h1>[학생용 수사 노트] ${safeTitle}</h1>
      <p>2022 개정 공통수학1 · 잠금 ${state.lockCount}개 · 지도교사: ${safeAuthor} (${today})</p>
    </div>
    <div class="info">모둠: _____ 이름: _______________</div>
  </header>

  <div class="story-box"><strong>미션 이야기:</strong> ${safeIntro}</div>

  <div class="roles">
    <div class="role"><strong>🔎 탐색자</strong><br>식의 조건 찾기</div>
    <div class="role"><strong>📝 기록자</strong><br>풀이와 단서 적기</div>
    <div class="role"><strong>💬 설명자</strong><br>모둠에 이유 설명</div>
    <div class="role"><strong>✅ 검산자</strong><br>대입으로 다시 확인</div>
  </div>

  <div class="eq-box">공통 이차식: f(x) = ${escapeHtml(expr)}</div>

  ${locks.map((l, i) => `
    <div class="lock-card">
      <div class="lock-top">
        <span>${escapeHtml(l.title)}</span>
        <span>단서 ${i + 1}: [ &nbsp;&nbsp;&nbsp; ] (정답 절댓값의 일의 자리)</span>
      </div>
      <div>${escapeHtml(l.question)}</div>
      <div class="write-box">
        • 풀이 과정 및 이유 한 문장: <br><br>
        • 내가 구한 정답: ______________ &nbsp;&nbsp; → 단서 숫자 ${i + 1}: [ &nbsp;&nbsp; ]
      </div>
    </div>
  `).join('')}

  <div class="pwd-box">
    <strong>🔓 마지막 문 암호:</strong> ${locks.map((_, i) => `[ 단서${i + 1} ]`).join(' ')} (앞자리가 0이어도 그대로 적으세요)<br>
    <div style="margin-top:6px; font-size:12px;"><strong>마무리 질문:</strong> ${safeOutro}</div>
  </div>
</body>
</html>`;
    }

    // TEACHER PROGRESSION GUIDE: Complete answers, hints, clues, leading-zero password, verification
    return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <title>[교사용 진행표] ${safeTitle} (${safeAuthor})</title>
  <style>
    @page { size: A4 portrait; margin: 11mm 12mm; }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    body { max-width: 820px; margin: 10px auto; padding: 10px 16px; font-family: -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif; color: #0f172a; line-height: 1.5; font-size: 13px; }
    .no-print { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 10px 14px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; }
    .print-btn { background: #0f766e; color: #fff; border: none; padding: 7px 14px; border-radius: 6px; font-weight: 700; cursor: pointer; }
    header { border-bottom: 2px solid #0f766e; padding-bottom: 6px; margin-bottom: 10px; }
    header h1 { font-size: 18px; margin: 0 0 2px; color: #0f766e; }
    header p { margin: 0; font-size: 11.5px; color: #475569; }
    .summary { background: #ecfdf5; border: 1px solid #6ee7b7; border-radius: 8px; padding: 10px 12px; margin-bottom: 12px; }
    .pwd { font-family: monospace; font-size: 17px; font-weight: 800; color: #0f766e; background: #fff; padding: 2px 8px; border-radius: 4px; border: 1px solid #a7f3d0; }
    .lock-box { border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px 12px; margin-bottom: 10px; break-inside: avoid; }
    .lock-head { display: flex; justify-content: space-between; font-weight: 800; color: #0f766e; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 6px; }
    .hints { margin: 6px 0 0 16px; padding: 0; font-size: 11.5px; color: #334155; }
    .verify { background: #eff6ff; padding: 6px 10px; border-left: 4px solid #2563eb; font-size: 12px; margin-top: 6px; }
    @media print { .no-print { display: none !important; } body { margin: 0; padding: 0; } }
  </style>
</head>
<body>
  <div class="no-print">
    <span>💡 교사용 진행표입니다 (정답·힌트·단서·앞자리 0 보존 최종 암호 포함).</span>
    <button class="print-btn" onclick="window.print()">🖨️ 인쇄 / PDF</button>
  </div>
  <header>
    <h1>[교사용 진행표] ${safeTitle}</h1>
    <p>f(x) = ${escapeHtml(expr)} (p = ${p}, q = ${q}, 잠금 ${state.lockCount}개) · 지도교사: ${safeAuthor} (${today})</p>
  </header>

  <div class="summary">
    <div><strong>최종 문 암호 (문자열 앞자리 0 보존):</strong> <span class="pwd">${escapeHtml(expectedPwd)}</span></div>
    <div style="font-size:12px; margin-top:4px;">권장 시간: ${state.lockCount === 3 ? '약 8~10분' : '약 12~15분'} (강제 시간 제한·탈락 없음 / 풀이 이유 자동 판정 없음)</div>
  </div>

  ${locks.map((l, i) => `
    <div class="lock-box">
      <div class="lock-head">
        <span>${escapeHtml(l.title)}</span>
        <span>정답: ${l.answer} &nbsp;|&nbsp; 단서 ${i + 1}: ${escapeHtml(l.clue)}</span>
      </div>
      <div><strong>문항:</strong> ${escapeHtml(l.question)}</div>
      <div class="verify"><strong>독립 검산:</strong> ${escapeHtml(l.verifyText)}</div>
      <ol class="hints">${l.hints.map(h => `<li>${escapeHtml(h)}</li>`).join('')}</ol>
    </div>
  `).join('')}

  <div class="verify"><strong>탈출 후 마무리 발문:</strong> ${safeOutro}</div>
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

  // --- Game Reset ---
  function resetGameProgress(notify = true, clearTeacherCheck = true) {
    state.started = false;
    state.currentStep = 0;
    state.solved = Array(state.lockCount).fill(false);
    state.clues = Array(state.lockCount).fill(null);
    state.hintsOpened = Array(state.lockCount).fill(0);
    state.studentInputs = Array(state.lockCount).fill('');
    state.studentReasons = Array(state.lockCount).fill('');
    state.lastRetryMsg = '';
    state.finalCodeInput = '';
    state.finalRetryMsg = '';
    state.escaped = false;

    if (clearTeacherCheck) {
      state.teacherReviewed = false;
      const chk = document.getElementById('chkTeacherReviewed');
      if (chk) chk.checked = false;
    }

    renderConfigUI();
    renderProgressMap();
    renderGameStage();

    if (notify) {
      const alertBox = document.getElementById('resetAlert');
      alertBox.classList.add('show');
      setTimeout(() => alertBox.classList.remove('show'), 3200);
    }
  }

  function renderConfigUI() {
    const p = state.p;
    const q = p + state.diff;
    const expr = exprString(p, q);
    const locks = buildLocks(p, state.diff, state.lockCount);
    const pwd = locks.map(l => l.clue).join('');

    document.querySelectorAll('.btn-diff').forEach(btn => {
      btn.classList.toggle('active', parseInt(btn.getAttribute('data-diff'), 10) === state.diff);
    });
    document.querySelectorAll('.btn-lock-count').forEach(btn => {
      btn.classList.toggle('active', parseInt(btn.getAttribute('data-locks'), 10) === state.lockCount);
    });

    document.getElementById('teacherPreviewCard').innerHTML = `
      <div><strong>교사 확인용 요약 (학생 시작 화면 비공개):</strong></div>
      <div>식: <code>f(x) = ${escapeHtml(expr)}</code> (p=${p}, q=${q})</div>
      <div>단서 순서: ${locks.map((l, i) => `${i + 1}번=${l.clue}(답 ${l.answer})`).join(' · ')}</div>
      <div>최종 암호(문자열): <strong>${escapeHtml(pwd)}</strong></div>
    `;

    const gateBox = document.getElementById('exportGateBox');
    const badge = document.getElementById('gateBadge');
    gateBox.classList.toggle('unlocked', state.teacherReviewed);
    badge.className = `gate-badge ${state.teacherReviewed ? 'unlocked' : 'locked'}`;
    badge.textContent = state.teacherReviewed ? '저장 가능' : '검토 필요';

    document.getElementById('btnDownloadStudent').disabled = !state.teacherReviewed;
    document.getElementById('btnPrintStudent').disabled = !state.teacherReviewed;
    document.getElementById('btnDownloadTeacher').disabled = !state.teacherReviewed;
    document.getElementById('btnPrintTeacher').disabled = !state.teacherReviewed;
  }

  function renderProgressMap() {
    const map = document.getElementById('progressMap');
    const locks = buildLocks(state.p, state.diff, state.lockCount);
    const solvedCount = getSolvedCount();
    map.classList.toggle('has-odd-nodes', state.lockCount === 4);

    const lockNodes = locks.map((l, idx) => {
      const isSolved = state.solved[idx];
      const accessible = isStepAccessible(idx);
      const isActive = state.started && !state.escaped && state.currentStep === idx;
      const cls = [
        'map-node',
        isSolved ? 'solved' : '',
        isActive ? 'active' : '',
        !accessible ? 'locked' : ''
      ].filter(Boolean).join(' ');

      const badgeText = isSolved ? `단서 ${state.clues[idx]}` : (accessible ? '도전 가능' : '🔒 잠김');
      return `
        <button type="button" class="${cls}" data-step="${idx}" ${!accessible ? 'disabled' : ''}>
          <span class="map-step-lbl">잠금 ${idx + 1}</span>
          <span class="map-clue-badge">${escapeHtml(badgeText)}</span>
        </button>
      `;
    }).join('');

    const doorAccessible = isStepAccessible(state.lockCount);
    const doorActive = state.started && !state.escaped && state.currentStep === state.lockCount;
    const doorCls = [
      'map-node',
      state.escaped ? 'solved' : '',
      doorActive ? 'active' : '',
      !doorAccessible && !state.escaped ? 'locked' : ''
    ].filter(Boolean).join(' ');

    const doorLabel = state.escaped ? '🔓 탈출 완료' : (doorAccessible ? '🚪 열기 가능' : `🔒 ${solvedCount}/${state.lockCount}`);

    map.innerHTML = `${lockNodes}
      <button type="button" class="${doorCls}" data-step="${state.lockCount}" ${!doorAccessible ? 'disabled' : ''}>
        <span class="map-step-lbl">마지막 문</span>
        <span class="map-clue-badge">${doorLabel}</span>
      </button>
    `;

    map.querySelectorAll('.map-node').forEach(btn => {
      btn.addEventListener('click', () => {
        const step = parseInt(btn.getAttribute('data-step'), 10);
        if (!isStepAccessible(step)) return;
        state.currentStep = step;
        state.lastRetryMsg = '';
        state.finalRetryMsg = '';
        renderProgressMap();
        renderGameStage();
      });
    });
  }

  function renderGameStage() {
    const mount = document.getElementById('gameStageMount');
    const locks = buildLocks(state.p, state.diff, state.lockCount);
    const p = state.p;
    const q = p + state.diff;
    const expr = exprString(p, q);
    const recTime = state.lockCount === 3 ? '약 8~10분' : '약 12~15분';

    // Phase 0: Before Start (problems strictly hidden!)
    if (!state.started) {
      mount.innerHTML = `
        <article class="stage-card">
          <span class="intro-badge">수학 방탈출 교실 · 시작 전 안내</span>
          <h2 class="intro-title">${escapeHtml(state.storyTitle)}</h2>
          <p class="intro-story">${escapeHtml(state.storyIntro)}</p>
          <div class="intro-meta-row">
            <span class="meta-pill">🔐 잠금 개수: ${state.lockCount}개</span>
            <span class="meta-pill">⏱ 권장 시간: ${recTime} (강제 시간 제한 없음)</span>
            <span class="meta-pill">💛 오답 탈락·감점 없음 · 힌트 3단계 지원</span>
          </div>
          <button type="button" class="btn-primary" id="btnStartGame">🚪 방탈출 시작하기 (문제 공개)</button>
        </article>
      `;
      document.getElementById('btnStartGame').addEventListener('click', () => {
        state.started = true;
        state.currentStep = 0;
        renderProgressMap();
        renderGameStage();
      });
      return;
    }

    // Phase 2: Escaped!
    if (state.escaped) {
      const expectedPwd = getExpectedPassword();
      mount.innerHTML = `
        <article class="escaped-banner">
          <h2>🎉 마지막 문이 열렸습니다! (탈출 성공)</h2>
          <p style="margin-bottom:12px;">
            하나의 식 <strong>f(x) = ${escapeHtml(expr)}</strong> 에서 ${state.lockCount}개의 단서를 모두 찾아 암호 <strong>"${escapeHtml(expectedPwd)}"</strong>로 문을 열었습니다. (순위나 점수 비교 없이 함께 배움을 나눕니다.)
          </p>
          <div class="clue-strip">
            ${locks.map((l, i) => `
              <div class="clue-box">
                <span>단서 ${i + 1} (${escapeHtml(l.concept)})</span>
                <strong>${escapeHtml(state.clues[i])}</strong>
              </div>
            `).join('')}
          </div>
          <div class="reflection-box">
            <div style="font-weight:800; color:var(--accent); margin-bottom:4px;">💬 탈출 후 모둠 나누기 질문</div>
            <div>${escapeHtml(state.storyOutro)}</div>
          </div>
          <button type="button" class="btn-primary" id="btnRestartEscape">🔄 처음부터 다시 시작하기</button>
        </article>
      `;
      document.getElementById('btnRestartEscape').addEventListener('click', () => {
        resetGameProgress(false, false);
      });
      return;
    }

    // Phase 1B: Final Door (strictly only if all locks solved)
    if (state.currentStep === state.lockCount && getSolvedCount() === state.lockCount) {
      mount.innerHTML = `
        <article class="stage-card">
          <div class="shared-eq-banner">
            <div>
              <div style="font-size:0.78rem; color:var(--accent); font-weight:700;">우리 반 공통 이차식</div>
              <div class="eq-main">f(x) = ${escapeHtml(expr)}</div>
            </div>
            <button type="button" class="btn-secondary" id="btnRestartMid">🔄 다시 시작</button>
          </div>
          <div class="lock-head">
            <span class="lock-tag">FINAL DOOR · 마지막 문 암호 입력</span>
            <span style="font-size:0.82rem; color:var(--text-muted);">모든 단서가 모였습니다</span>
          </div>
          <p class="lock-question">
            지금까지 모은 단서 숫자 ${state.lockCount}개를 <strong>잠금 순서대로 이어 붙여</strong> 암호를 입력하세요.
            <small style="display:block; color:var(--text-muted); font-weight:500; margin-top:4px;">※ 첫 번째 단서가 0인 경우에도 앞자리 0을 생략하지 말고 그대로 입력합니다.</small>
          </p>
          <div class="clue-strip">
            ${locks.map((_, i) => `
              <div class="clue-box">
                <span>단서 ${i + 1}</span>
                <strong>${escapeHtml(state.clues[i])}</strong>
              </div>
            `).join('')}
          </div>
          <form id="finalDoorForm" novalidate class="answer-form">
            <div>
              <label for="finalPasswordInput">최종 암호 (${state.lockCount}자리 숫자)</label>
              <div class="answer-submit-row">
                <input type="text" id="finalPasswordInput" inputmode="numeric" value="${escapeHtml(state.finalCodeInput)}" aria-invalid="false" data-error="finalPasswordError" placeholder="예: 0454">
                <button type="submit" class="btn-primary" id="btnOpenFinalDoor">🔓 마지막 문 열기</button>
              </div>
              <div id="finalPasswordError" class="error-msg">단서 숫자를 순서대로 입력해 주세요.</div>
            </div>
          </form>
          ${state.finalRetryMsg ? `<div class="feedback-banner retry">${escapeHtml(state.finalRetryMsg)}</div>` : ''}
        </article>
      `;

      document.getElementById('btnRestartMid').addEventListener('click', () => resetGameProgress(false, false));

      const pwdInput = document.getElementById('finalPasswordInput');
      pwdInput.addEventListener('input', e => {
        state.finalCodeInput = e.target.value;
        setFieldError(pwdInput, false, null, false);
      });

      document.getElementById('finalDoorForm').addEventListener('submit', e => {
        e.preventDefault();
        const trimmed = state.finalCodeInput.trim();
        if (trimmed === '') {
          setFieldError(pwdInput, true, '암호를 입력해 주세요. (빈 칸은 제출할 수 없습니다)', true);
          pwdInput.focus();
          return;
        }
        const expected = getExpectedPassword();
        if (trimmed === expected) {
          state.escaped = true;
          state.finalRetryMsg = '';
          renderProgressMap();
          renderGameStage();
        } else {
          state.finalRetryMsg = '암호가 일치하지 않습니다. 단서 숫자의 순서와 앞자리 0이 빠지지 않았는지 확인해 보세요.';
          renderGameStage();
        }
      });
      return;
    }

    // Phase 1A: Active Lock Card
    const idx = Math.min(state.currentStep, state.lockCount - 1);
    const lock = locks[idx];
    const isSolved = state.solved[idx];
    const hintsCount = state.hintsOpened[idx] || 0;

    mount.innerHTML = `
      <article class="stage-card">
        <div class="shared-eq-banner">
          <div>
            <div style="font-size:0.78rem; color:var(--accent); font-weight:700;">우리 반 공통 이차식</div>
            <div class="eq-main">f(x) = ${escapeHtml(expr)}</div>
          </div>
          <button type="button" class="btn-secondary" id="btnRestartMid">🔄 다시 시작</button>
        </div>

        <div class="lock-head">
          <span class="lock-tag">${escapeHtml(lock.title)}</span>
          <span style="font-size:0.82rem; color:${isSolved ? '#10b981' : 'var(--text-muted)'}; font-weight:700;">
            ${isSolved ? `✅ 해제 완료 (단서 ${idx + 1} = ${escapeHtml(lock.clue)})` : '🔒 잠김 상태'}
          </span>
        </div>

        <p class="lock-question">${escapeHtml(lock.question)}</p>

        <!-- 3-Stage Hints (no penalty) -->
        <div class="hint-box">
          <div class="hint-btns-row">
            <button type="button" class="btn-hint ${hintsCount >= 1 ? 'opened' : ''}" data-hint="1">💡 힌트 1 (개념)</button>
            <button type="button" class="btn-hint ${hintsCount >= 2 ? 'opened' : ''}" data-hint="2">🧭 힌트 2 (접근 방법)</button>
            <button type="button" class="btn-hint ${hintsCount >= 3 ? 'opened' : ''}" data-hint="3">🧮 힌트 3 (계산 직전)</button>
          </div>
          <div class="hint-list">
            ${hintsCount === 0 ? `<div style="font-size:0.8rem; color:var(--text-dim);">막힐 때는 힌트 버튼을 눌러 보세요. 감점이나 탈락이 없습니다.</div>` : ''}
            ${lock.hints.slice(0, hintsCount).map(h => `<div class="hint-item">${escapeHtml(h)}</div>`).join('')}
          </div>
        </div>

        <form id="lockAnswerForm" novalidate class="answer-form">
          ${state.requireReason ? `
            <div>
              <label for="lockReasonInput">풀이 이유 한 문장 (필수 입력 · 자동 판정 없음)</label>
              <textarea id="lockReasonInput" rows="2" maxlength="250" aria-invalid="false" data-error="lockReasonError" placeholder="예: 두 근 사이에 0이 포함되어 정수를 세었기 때문입니다." ${isSolved ? 'disabled' : ''}>${escapeHtml(state.studentReasons[idx] || '')}</textarea>
              <div id="lockReasonError" class="error-msg">정답 확인 전 풀이 이유 한 문장을 먼저 적어 주세요.</div>
              <div style="font-size:0.75rem; color:var(--text-muted); margin-top:4px;">※ 입력한 풀이 이유의 옳고 그름은 시스템이 자동 채점하지 않으며 선생님·친구와 함께 확인합니다.</div>
            </div>
          ` : ''}

          <div>
            <label for="lockAnswerInput">정답 입력 (0, 음수, − 기호 가능)</label>
            <div class="answer-submit-row">
              <input type="text" id="lockAnswerInput" value="${escapeHtml(state.studentInputs[idx] || '')}" aria-invalid="false" data-error="lockAnswerError" placeholder="정수 입력 (예: 0, -4)" ${isSolved ? 'disabled' : ''}>
              <button type="submit" class="btn-primary" id="btnSubmitLock" ${isSolved ? 'disabled' : ''}>
                ${isSolved ? '이미 해제됨 ✅' : '🔓 잠금 해제 시도'}
              </button>
            </div>
            <div id="lockAnswerError" class="error-msg">정수를 입력해 주세요.</div>
          </div>
        </form>

        ${state.lastRetryMsg && !isSolved ? `<div class="feedback-banner retry">${escapeHtml(state.lastRetryMsg)}</div>` : ''}

        ${isSolved ? `
          <div class="feedback-banner success">
            <div style="font-weight:800; color:#10b981; margin-bottom:4px;">✅ 잠금 ${idx + 1} 해제! 단서 숫자 "${escapeHtml(lock.clue)}" 을(를) 얻었습니다.</div>
            <div style="font-size:0.86rem; margin-bottom:10px;">• 확인: ${escapeHtml(lock.verifyText)}</div>
            <button type="button" class="btn-primary" id="btnNextStep">
              ${idx + 1 < state.lockCount ? `다음 잠금(${idx + 2}번)으로 이동 →` : '마지막 문(암호 입력)으로 이동 →'}
            </button>
          </div>
        ` : ''}
      </article>
    `;

    document.getElementById('btnRestartMid').addEventListener('click', () => resetGameProgress(false, false));

    mount.querySelectorAll('.btn-hint').forEach(btn => {
      btn.addEventListener('click', () => {
        const level = parseInt(btn.getAttribute('data-hint'), 10);
        state.hintsOpened[idx] = Math.max(state.hintsOpened[idx] || 0, level);
        renderGameStage();
      });
    });

    const reasonInput = document.getElementById('lockReasonInput');
    if (reasonInput) {
      reasonInput.addEventListener('input', e => {
        state.studentReasons[idx] = e.target.value;
        setFieldError(reasonInput, false, null, false);
      });
    }

    const ansInput = document.getElementById('lockAnswerInput');
    ansInput.addEventListener('input', e => {
      state.studentInputs[idx] = e.target.value;
      setFieldError(ansInput, false, null, false);
    });

    document.getElementById('lockAnswerForm').addEventListener('submit', e => {
      e.preventDefault();
      if (state.solved[idx]) return; // Guard against duplicate submissions

      if (state.requireReason) {
        const reasonVal = (state.studentReasons[idx] || '').trim();
        if (reasonVal === '') {
          setFieldError(reasonInput, true, '풀이 이유 한 문장을 먼저 작성해 주세요. (자동 판정은 하지 않습니다)', true);
          reasonInput.focus();
          return;
        }
      }

      const parsed = parseIntegerInput(state.studentInputs[idx] || '');
      if (!parsed.ok) {
        setFieldError(ansInput, true, parsed.msg, true);
        ansInput.focus();
        return;
      }

      setFieldError(ansInput, false, null, false);

      if (parsed.value === lock.answer) {
        state.solved[idx] = true;
        state.clues[idx] = lock.clue; // Indexed slot prevents duplicate clue pushing
        state.lastRetryMsg = '';
        renderProgressMap();
        renderGameStage();
      } else {
        state.lastRetryMsg = `입력한 ${parsed.value}은(는) 정답과 다릅니다. 감점이나 탈락이 없으니 위 힌트를 열어 보고 다시 도전해 보세요.`;
        renderGameStage();
      }
    });

    const nextBtn = document.getElementById('btnNextStep');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        state.currentStep = idx + 1;
        state.lastRetryMsg = '';
        renderProgressMap();
        renderGameStage();
      });
    }
  }

  function init() {
    const authorInput = document.getElementById('authorInput');
    const selectP = document.getElementById('selectP');
    const diffBtns = document.querySelectorAll('.btn-diff');
    const lockCountBtns = document.querySelectorAll('.btn-lock-count');
    const chkRequireReason = document.getElementById('chkRequireReason');

    const storyTitleInput = document.getElementById('storyTitleInput');
    const storyIntroInput = document.getElementById('storyIntroInput');
    const storyOutroInput = document.getElementById('storyOutroInput');

    const chkTeacherReviewed = document.getElementById('chkTeacherReviewed');
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

    authorInput.addEventListener('input', e => { state.author = e.target.value.trim() || '선생님'; });

    selectP.addEventListener('change', e => {
      state.p = parseInt(e.target.value, 10);
      resetGameProgress(true, true);
    });

    diffBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        state.diff = parseInt(btn.getAttribute('data-diff'), 10);
        resetGameProgress(true, true);
      });
    });

    lockCountBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        state.lockCount = parseInt(btn.getAttribute('data-locks'), 10);
        resetGameProgress(true, true);
      });
    });

    chkRequireReason.addEventListener('change', e => {
      state.requireReason = e.target.checked;
      resetGameProgress(true, true);
    });

    function onStoryChange() {
      state.storyTitle = storyTitleInput.value.trim() || '수학 방탈출 교실';
      state.storyIntro = storyIntroInput.value.trim();
      state.storyOutro = storyOutroInput.value.trim();
      state.teacherReviewed = false;
      chkTeacherReviewed.checked = false;
      renderConfigUI();
      if (!state.started || state.escaped) renderGameStage();
    }

    storyTitleInput.addEventListener('input', onStoryChange);
    storyIntroInput.addEventListener('input', onStoryChange);
    storyOutroInput.addEventListener('input', onStoryChange);

    chkTeacherReviewed.addEventListener('change', e => {
      state.teacherReviewed = e.target.checked;
      renderConfigUI();
    });

    function runGuardedExport(isTeacher, mode) {
      if (!state.teacherReviewed) {
        showToast('먼저 교사 검토 체크를 완료해 주세요.');
        return;
      }
      const html = buildExportHtml(isTeacher);
      const label = isTeacher ? '교사용 진행표' : '학생용 수사 노트';
      if (mode === 'download') {
        downloadHtmlFile(isTeacher ? 'week10_teacher_guide.html' : 'week10_student_notebook.html', html);
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
        : 'https://sool1982-1213.github.io/edutech-weekly-missions/week10/';

      const comment = `10주차 / ${state.author || '수현T'} / 고수 / 미션 완료\n게임 링크 또는 파일: ${cleanUrl}\n우리 반에서 써볼 방법 한 문장: 모둠별로 탐색자·기록자·설명자·검산자 역할을 나눠 같은 식의 네 가지 단서를 찾고, 탈출 후 풀이 이유를 발표하는 단원 복습 수업에 활용하겠습니다.`;

      navigator.clipboard.writeText(comment).then(() => {
        showToast('10주차 제출 댓글 양식이 복사되었습니다!');
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
    window.__week10Verify = {
      buildExportHtml: (isTeacher) => buildExportHtml(isTeacher),
      getExpectedPassword: () => getExpectedPassword(),
      getState: () => JSON.parse(JSON.stringify(state))
    };

    resetGameProgress(false, false);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
