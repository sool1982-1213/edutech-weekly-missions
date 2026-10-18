/**
 * 수현T의 5주차 중수 미션: 행렬 오답 클리닉 (곱셈 순서 재도전)
 * 2022 개정 공통수학1 [10공수1-04-01, 10공수1-04-02]
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elements - Inputs & Controls
  const teacherInput = document.getElementById('teacherInput');
  const teacherFeedback = document.getElementById('teacherFeedback');
  const cardTeacherTag = document.getElementById('cardTeacherTag');
  const paramASlider = document.getElementById('paramA');
  const paramBSlider = document.getElementById('paramB');
  const paramCSlider = document.getElementById('paramC');
  const dispA = document.getElementById('dispA');
  const dispB = document.getElementById('dispB');
  const dispC = document.getElementById('dispC');
  const resetParamsBtn = document.getElementById('resetParamsBtn');

  // Elements - Matrix A & B Cells
  const cellA11 = document.getElementById('cellA11');
  const cellA12 = document.getElementById('cellA12');
  const cellA21 = document.getElementById('cellA21');
  const cellA22 = document.getElementById('cellA22');
  const wrongLine3_11 = document.getElementById('wrongLine3_11');
  const wrongLine3_12 = document.getElementById('wrongLine3_12');
  const wrongLine3_21 = document.getElementById('wrongLine3_21');
  const wrongLine3_22 = document.getElementById('wrongLine3_22');
  const wrongLine3Text = document.getElementById('wrongLine3Text');

  // Elements - Step 1: Worked Lines
  const workedLineItems = document.querySelectorAll('.worked-line-item');
  const lineFeedbackAlert = document.getElementById('lineFeedbackAlert');

  // Elements - Step 2: Hints
  const hintsProgress = document.getElementById('hintsProgress');
  const hintCard1 = document.getElementById('hintCard1');
  const hintCard2 = document.getElementById('hintCard2');
  const hintCard3 = document.getElementById('hintCard3');
  const hintBody3 = document.getElementById('hintBody3');
  const nextHintBtn = document.getElementById('nextHintBtn');
  const foldHintsBtn = document.getElementById('foldHintsBtn');

  // Elements - Step 3: Solution & Verification
  const revealSolutionBtn = document.getElementById('revealSolutionBtn');
  const solutionBox = document.getElementById('solutionBox');
  const stepCalcAB = document.getElementById('stepCalcAB');
  const stepCalcBA = document.getElementById('stepCalcBA');
  const resAB11 = document.getElementById('resAB11');
  const resAB12 = document.getElementById('resAB12');
  const resAB21 = document.getElementById('resAB21');
  const resAB22 = document.getElementById('resAB22');
  const resBA11 = document.getElementById('resBA11');
  const resBA12 = document.getElementById('resBA12');
  const resBA21 = document.getElementById('resBA21');
  const resBA22 = document.getElementById('resBA22');
  const compDescription = document.getElementById('compDescription');
  const diagVerification = document.getElementById('diagVerification');
  const diagAB11 = document.getElementById('diagAB11');
  const diagAB12 = document.getElementById('diagAB12');
  const diagAB21 = document.getElementById('diagAB21');
  const diagAB22 = document.getElementById('diagAB22');
  const diagBA11 = document.getElementById('diagBA11');
  const diagBA12 = document.getElementById('diagBA12');
  const diagBA21 = document.getElementById('diagBA21');
  const diagBA22 = document.getElementById('diagBA22');
  const diagVerificationText = document.getElementById('diagVerificationText');
  const diagTeacherMemo = document.getElementById('diagTeacherMemo');

  // Elements - Step 4: Retry
  const retryA11 = document.getElementById('retryA11');
  const retryA12 = document.getElementById('retryA12');
  const retryA21 = document.getElementById('retryA21');
  const retryA22 = document.getElementById('retryA22');
  const opt0_11 = document.getElementById('opt0_11');
  const opt0_12 = document.getElementById('opt0_12');
  const opt0_21 = document.getElementById('opt0_21');
  const opt0_22 = document.getElementById('opt0_22');
  const opt1_11 = document.getElementById('opt1_11');
  const opt1_12 = document.getElementById('opt1_12');
  const opt1_21 = document.getElementById('opt1_21');
  const opt1_22 = document.getElementById('opt1_22');
  const optSub0 = document.getElementById('optSub0');
  const optSub1 = document.getElementById('optSub1');
  const retryRadio0 = document.getElementById('retryOpt0');
  const retryRadio1 = document.getElementById('retryOpt1');
  const retryOptionItems = document.querySelectorAll('.retry-option-item');
  const checkRetryBtn = document.getElementById('checkRetryBtn');
  const retryResultAlert = document.getElementById('retryResultAlert');

  // Elements - Export & Comment
  const copyCardTextBtn = document.getElementById('copyCardTextBtn');
  const downloadStudentHtmlBtn = document.getElementById('downloadStudentHtmlBtn');
  const downloadTeacherHtmlBtn = document.getElementById('downloadTeacherHtmlBtn');
  const printPageBtn = document.getElementById('printPageBtn');
  const copyCommentBtn = document.getElementById('copyCommentBtn');
  const commentTemplatePreview = document.getElementById('commentTemplatePreview');
  const toast = document.getElementById('toast');

  // State Variables
  let currentHintCount = 0;
  let correctRetryOptionIndex = 1; // 0 or 1

  // Format matrix to string (a, b; c, d) - 2022 개정 공통수학1 소괄호 표준
  function formatMatrix(m) {
    return `(${m.map(row => row.join(', ')).join('; ')})`;
  }

  // Get Korean subject particle (이/가) for integers
  function getSubjectParticle(num) {
    const n = Math.abs(num);
    const lastDigit = n % 10;
    if (n > 0 && lastDigit === 0) return '이';
    return [0, 1, 3, 6, 7, 8].includes(lastDigit) ? '이' : '가';
  }

  // Escape HTML characters
  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, match => {
      const escapeMap = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      };
      return escapeMap[match];
    });
  }

  // Toast notification
  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }

  // Recalculate and render all components
  function updateClinic() {
    const a = parseInt(paramASlider.value, 10);
    const b = parseInt(paramBSlider.value, 10);
    const c = parseInt(paramCSlider.value, 10);
    const teacher = teacherInput.value.trim() || '수현T';
    const memo = teacherFeedback.value.trim();

    // 1. Update parameter displays
    dispA.textContent = a;
    dispB.textContent = b;
    dispC.textContent = c;
    cardTeacherTag.textContent = teacher;

    // 2. Matrices A and B
    // A = [[a, b], [1, c]]
    // B = [[1, 1], [0, 1]]
    cellA11.textContent = a;
    cellA12.textContent = b;
    cellA21.textContent = '1';
    cellA22.textContent = c;

    // 3. Matrix Multiplications
    // AB = [[a*1 + b*0, a*1 + b*1], [1*1 + c*0, 1*1 + c*1]]
    //    = [[a, a + b], [1, 1 + c]]
    const mAB = [
      [a, a + b],
      [1, 1 + c]
    ];

    // BA = [[1*a + 1*1, 1*b + 1*c], [0*a + 1*1, 0*b + 1*c]]
    //    = [[a + 1, b + c], [1, c]]
    const mBA = [
      [a + 1, b + c],
      [1, c]
    ];

    // Step 1: Wrong Line 03 Matrix (the student mistakenly equated AB to BA)
    if (wrongLine3_11) wrongLine3_11.textContent = mBA[0][0];
    if (wrongLine3_12) wrongLine3_12.textContent = mBA[0][1];
    if (wrongLine3_21) wrongLine3_21.textContent = mBA[1][0];
    if (wrongLine3_22) wrongLine3_22.textContent = mBA[1][1];
    if (wrongLine3Text) wrongLine3Text.textContent = `AB = ${formatMatrix(mBA)}`;

    // Step 2: Hint 3 Calculation Clue
    hintBody3.innerHTML = `AB의 (1,1)은 ${a}×1 + ${b}×0 = <strong>${a}</strong>, BA의 (1,1)은 1×${a} + 1×1 = <strong>${a + 1}</strong>입니다.`;

    // Step 3: Detailed Calculations for AB and BA
    stepCalcAB.innerHTML = `(1,1): ${a}×1 + ${b}×0 = <strong>${a}</strong><br>` +
                           `(1,2): ${a}×1 + ${b}×1 = <strong>${a + b}</strong><br>` +
                           `(2,1): 1×1 + ${c}×0 = <strong>1</strong><br>` +
                           `(2,2): 1×1 + ${c}×1 = <strong>${1 + c}</strong>`;

    stepCalcBA.innerHTML = `(1,1): 1×${a} + 1×1 = <strong>${a + 1}</strong><br>` +
                           `(1,2): 1×${b} + 1×${c} = <strong>${b + c}</strong><br>` +
                           `(2,1): 0×${a} + 1×1 = <strong>1</strong><br>` +
                           `(2,2): 0×${b} + 1×${c} = <strong>${c}</strong>`;

    resAB11.textContent = mAB[0][0];
    resAB12.textContent = mAB[0][1];
    resAB21.textContent = mAB[1][0];
    resAB22.textContent = mAB[1][1];

    resBA11.textContent = mBA[0][0];
    resBA12.textContent = mBA[0][1];
    resBA21.textContent = mBA[1][0];
    resBA22.textContent = mBA[1][1];

    compDescription.innerHTML = `(AB)₁₁ = <strong>${mAB[0][0]}</strong>, (BA)₁₁ = <strong>${mBA[0][0]}</strong> 이므로 <span class="diff-highlight">AB ≠ BA</span> 입니다!`;
    
    // Step 3: Verification 2x2 Matrix with Curved Parentheses
    if (diagAB11) diagAB11.textContent = mAB[0][0];
    if (diagAB12) diagAB12.textContent = mAB[0][1];
    if (diagAB21) diagAB21.textContent = mAB[1][0];
    if (diagAB22) diagAB22.textContent = mAB[1][1];

    if (diagBA11) diagBA11.textContent = mBA[0][0];
    if (diagBA12) diagBA12.textContent = mBA[0][1];
    if (diagBA21) diagBA21.textContent = mBA[1][0];
    if (diagBA22) diagBA22.textContent = mBA[1][1];

    const particle = getSubjectParticle(mBA[0][0]);
    if (diagVerificationText) {
      diagVerificationText.innerHTML = `첫 성분 <strong>${mAB[0][0]}</strong>과 <strong>${mBA[0][0]}</strong>${particle} 다릅니다. 이 구체적인 계산에서 순서를 바꾼 풀이가 틀렸음을 명확히 확인할 수 있습니다.`;
    }
    diagTeacherMemo.textContent = memo;

    // Step 4: Retry Problem Generation (Using official curriculum generator rule)
    // a' = a === 9 ? 2 : a + 1
    // b' = b === 8 ? 1 : b + 1
    // c' = c === 9 ? 1 : c + 1
    const aPrime = a === 9 ? 2 : a + 1;
    const bPrime = b === 8 ? 1 : b + 1;
    const cPrime = c === 9 ? 1 : c + 1;

    retryA11.textContent = aPrime;
    retryA12.textContent = bPrime;
    retryA21.textContent = '1';
    retryA22.textContent = cPrime;

    // Retry Correct Answer: A'B'
    const retryAB = [
      [aPrime, aPrime + bPrime],
      [1, 1 + cPrime]
    ];

    // Retry Distractor: B'A' (Wrong order)
    const retryBA = [
      [aPrime + 1, bPrime + cPrime],
      [1, cPrime]
    ];

    // Distribute options:
    // Option 0: B'A' (Wrong reverse order)
    opt0_11.textContent = retryBA[0][0];
    opt0_12.textContent = retryBA[0][1];
    opt0_21.textContent = retryBA[1][0];
    opt0_22.textContent = retryBA[1][1];
    optSub0.textContent = '순서를 바꾼 계산 (BA)';

    // Option 1: A'B' (Correct order)
    opt1_11.textContent = retryAB[0][0];
    opt1_12.textContent = retryAB[0][1];
    opt1_21.textContent = retryAB[1][0];
    opt1_22.textContent = retryAB[1][1];
    optSub1.textContent = '올바른 행·열 계산 (AB)';

    correctRetryOptionIndex = 1;

    // Update Submission Comment Template Preview
    const origin = window.location.origin;
    const pathname = window.location.pathname.replace(/\/index\.html$/, '').replace(/\/$/, '');
    const currentUrl = `${origin}${pathname}/index.html`;
    const cleanHubUrl = `${origin}${pathname.replace(/\/week05$/, '')}/week05/`;
    const displayUrl = origin.includes('github.io') || origin.includes('vercel.app') 
      ? cleanHubUrl 
      : 'https://sool1982-1213.github.io/edutech-weekly-missions/week05/';

    const commentText = `${teacher} / 중수 / 미션 완료 / ${displayUrl} / 학생이 처음 틀린 줄(AB=BA 가정)을 직접 찾고, 숫자를 바꾼 재도전 문제로 행렬 곱셈의 순서 규칙을 체화하도록 수업에 활용하겠습니다.`;
    commentTemplatePreview.textContent = commentText;
  }

  // Reset interactive workflow state when parameters change (Criteria 3)
  function resetInteractiveWorkflow() {
    // 1. Reset Worked Lines
    workedLineItems.forEach(item => {
      item.classList.remove('selected-wrong', 'selected-correct');
      item.setAttribute('aria-pressed', 'false');
      item.querySelector('.line-status-icon').textContent = '';
    });
    lineFeedbackAlert.style.display = 'none';
    lineFeedbackAlert.className = 'feedback-alert';

    // 2. Reset Hints
    currentHintCount = 0;
    hintsProgress.textContent = '0 / 3 힌트 오픈';
    hintCard1.style.display = 'none';
    hintCard2.style.display = 'none';
    hintCard3.style.display = 'none';
    nextHintBtn.disabled = false;
    foldHintsBtn.disabled = true;

    // 3. Reset Solution
    solutionBox.style.display = 'none';
    revealSolutionBtn.textContent = '👁️ 교정 풀이 · 성분별 검산 확인하기';

    // 4. Reset Retry
    retryRadio0.checked = false;
    retryRadio1.checked = false;
    retryOptionItems.forEach(item => item.classList.remove('selected'));
    retryResultAlert.style.display = 'none';
    retryResultAlert.className = 'retry-result-alert';
  }

  // Handle Worked Line Click (오류 줄 찾기)
  workedLineItems.forEach(item => {
    item.addEventListener('click', () => {
      const lineNum = parseInt(item.getAttribute('data-line'), 10);

      workedLineItems.forEach(it => {
        it.classList.remove('selected-wrong', 'selected-correct');
        it.setAttribute('aria-pressed', 'false');
        it.querySelector('.line-status-icon').textContent = '';
      });

      item.setAttribute('aria-pressed', 'true');
      lineFeedbackAlert.style.display = 'block';

      if (lineNum === 2) {
        // Correct answer!
        item.classList.add('selected-correct');
        item.querySelector('.line-status-icon').textContent = '✅';
        lineFeedbackAlert.className = 'feedback-alert alert-success';
        lineFeedbackAlert.innerHTML = `
          <strong>🎉 정답입니다! 2번 줄에서 처음으로 규칙이 어긋났습니다.</strong><br>
          실수의 곱셈에서는 <em>ab = ba</em>가 성립하지만, 행렬의 곱셈에서는 일반적으로 <strong>AB ≠ BA</strong> 입니다. 
          따라서 임의로 순서를 바꾸어 곱할 수 없습니다.
        `;
      } else if (lineNum === 1) {
        item.classList.add('selected-wrong');
        item.querySelector('.line-status-icon').textContent = '⚠️';
        lineFeedbackAlert.className = 'feedback-alert alert-info';
        lineFeedbackAlert.innerHTML = `
          <strong>1번 줄은 문제 풀이의 시작 단계입니다.</strong><br>
          "행렬의 곱 AB를 계산한다"는 올바른 문제 해결 목표입니다. 이 다음 줄에서 어떤 잘못된 가정이 쓰였는지 확인해 보세요.
        `;
      } else if (lineNum === 3) {
        item.classList.add('selected-wrong');
        item.querySelector('.line-status-icon').textContent = '❌';
        lineFeedbackAlert.className = 'feedback-alert alert-warning';
        lineFeedbackAlert.innerHTML = `
          <strong>3번 줄은 잘못된 풀이의 최종 결과입니다.</strong><br>
          결과가 틀린 근본적인 원인은 그 앞의 <strong>2번 줄</strong>에서 곱셈 순서를 바꿀 수 있다고 잘못 가정한 데 있습니다. 처음 규칙이 어긋난 줄(02번)을 확인하세요.
        `;
      }
    });
  });

  // Handle Guided Hints (3단계 힌트)
  nextHintBtn.addEventListener('click', () => {
    if (currentHintCount === 0) {
      hintCard1.style.display = 'block';
      currentHintCount = 1;
      foldHintsBtn.disabled = false;
    } else if (currentHintCount === 1) {
      hintCard2.style.display = 'block';
      currentHintCount = 2;
    } else if (currentHintCount === 2) {
      hintCard3.style.display = 'block';
      currentHintCount = 3;
      nextHintBtn.disabled = true;
    }
    hintsProgress.textContent = `${currentHintCount} / 3 힌트 오픈`;
  });

  foldHintsBtn.addEventListener('click', () => {
    hintCard1.style.display = 'none';
    hintCard2.style.display = 'none';
    hintCard3.style.display = 'none';
    currentHintCount = 0;
    hintsProgress.textContent = '0 / 3 힌트 오픈';
    nextHintBtn.disabled = false;
    foldHintsBtn.disabled = true;
  });

  // Handle Solution Reveal
  revealSolutionBtn.addEventListener('click', () => {
    if (solutionBox.style.display === 'none' || !solutionBox.style.display) {
      solutionBox.style.display = 'block';
      revealSolutionBtn.textContent = '접기 ▲ (교정 풀이 닫기)';
    } else {
      solutionBox.style.display = 'none';
      revealSolutionBtn.textContent = '👁️ 교정 풀이 · 성분별 검산 확인하기';
    }
  });

  // Handle Retry Option Selection
  retryOptionItems.forEach(item => {
    item.addEventListener('click', () => {
      retryOptionItems.forEach(it => it.classList.remove('selected'));
      item.classList.add('selected');
    });
  });

  // Check Retry Answer
  checkRetryBtn.addEventListener('click', () => {
    let selectedVal = null;
    if (retryRadio0.checked) selectedVal = 0;
    if (retryRadio1.checked) selectedVal = 1;

    if (selectedVal === null) {
      retryResultAlert.style.display = 'block';
      retryResultAlert.className = 'retry-result-alert alert-warning';
      retryResultAlert.textContent = '👉 보기 중에서 하나를 선택한 후 확인 버튼을 눌러주세요.';
      return;
    }

    retryResultAlert.style.display = 'block';
    if (selectedVal === correctRetryOptionIndex) {
      retryResultAlert.className = 'retry-result-alert alert-success';
      retryResultAlert.innerHTML = `
        <strong>🎉 완벽합니다! 정답입니다!</strong><br>
        A'의 각 행과 B'의 각 열을 차례대로 곱하고 더하여 올바른 <strong>AB</strong>를 구했습니다.<br>
        행렬의 곱셈에서는 순서가 바뀌면 결과가 달라지므로 (AB ≠ BA), 순서 준수가 핵심입니다!
      `;
    } else {
      retryResultAlert.className = 'retry-result-alert alert-warning';
      retryResultAlert.innerHTML = `
        <strong>앗! 아쉽게도 순서를 바꾸어 계산한 BA를 선택하셨습니다.</strong><br>
        행렬 곱셈은 실수의 곱셈과 달리 교환법칙이 성립하지 않습니다. 앞 행렬 A'의 행과 뒤 행렬 B'의 열 순서로 다시 곱해 보세요.
      `;
    }
  });

  // Input Listeners with Automatic State Reset (Criteria 3)
  function handleParamChange() {
    updateClinic();
    resetInteractiveWorkflow();
  }

  paramASlider.addEventListener('input', handleParamChange);
  paramBSlider.addEventListener('input', handleParamChange);
  paramCSlider.addEventListener('input', handleParamChange);
  teacherInput.addEventListener('input', updateClinic);
  teacherFeedback.addEventListener('input', updateClinic);

  // Reset to default button
  resetParamsBtn.addEventListener('click', () => {
    paramASlider.value = 3;
    paramBSlider.value = 2;
    paramCSlider.value = 4;
    teacherFeedback.value = '“실수의 곱셈처럼 순서를 바꾸면 안 돼요!” 행렬에서는 곱하는 순서에 따라 결과가 완전히 달라집니다. 성분별로 꼼꼼히 행과 열을 곱해 더합시다. 😊';
    handleParamChange();
    showToast('기본 예시(a=3, b=2, c=4)로 초기화되었습니다.');
  });

  // Copy Card Text Button
  copyCardTextBtn.addEventListener('click', () => {
    const a = parseInt(paramASlider.value, 10);
    const b = parseInt(paramBSlider.value, 10);
    const c = parseInt(paramCSlider.value, 10);
    const teacher = teacherInput.value.trim() || '수현T';
    const memo = teacherFeedback.value.trim();

    const mA = [[a, b], [1, c]];
    const mB = [[1, 1], [0, 1]];
    const mAB = [[a, a + b], [1, 1 + c]];
    const mBA = [[a + 1, b + c], [1, c]];

    const textToCopy = `[${teacher}의 행렬 오답 클리닉 · 곱셈 순서 재도전]
문제: 주어진 행렬에서 AB를 구하고 BA와 비교하시오.
A = ${formatMatrix(mA)}, B = ${formatMatrix(mB)}

예시 오답 풀이:
1. 행렬의 곱 AB를 계산한다.
2. 실수의 곱처럼 이 예시에서도 AB = BA라고 두고 순서를 바꾼다.
3. AB = ${formatMatrix(mBA)}

틀린 줄: 02번 줄
원인: 실수 계산처럼 곱셈 순서를 바꾸어 계산했습니다. 주어진 두 행렬에서는 순서가 바뀌면 결과도 달라집니다.
처방: 이 수치 예시에서 AB와 BA를 따로 계산하고 같은 위치의 성분을 비교하세요.
교정 풀이:
- AB = ${formatMatrix(mAB)}
- BA = ${formatMatrix(mBA)}
검산: 첫 성분 ${a}와 ${a + 1}이 다릅니다. 이 구체적인 계산에서 순서를 바꾼 풀이가 틀렸음을 확인할 수 있습니다.
교사 메모: ${memo}
수업 질문: A의 숫자를 바꾸어도 같은 위치의 성분을 각각 비교하면 어떤 차이가 보이나요?`;

    navigator.clipboard.writeText(textToCopy).then(() => {
      showToast('설명 카드 텍스트가 복사되었습니다!');
    }).catch(() => {
      prompt('아래 내용을 복사하세요:', textToCopy);
    });
  });

  // Generate and Download HTML Files (Student Worksheet vs Teacher Solution)
  function downloadHtmlFile(isTeacher) {
    const a = parseInt(paramASlider.value, 10);
    const b = parseInt(paramBSlider.value, 10);
    const c = parseInt(paramCSlider.value, 10);
    const teacher = teacherInput.value.trim() || '수현T';
    const memo = teacherFeedback.value.trim();

    const aPrime = a === 9 ? 2 : a + 1;
    const bPrime = b === 8 ? 1 : b + 1;
    const cPrime = c === 9 ? 1 : c + 1;

    const mA = [[a, b], [1, c]];
    const mB = [[1, 1], [0, 1]];
    const mAB = [[a, a + b], [1, 1 + c]];
    const mBA = [[a + 1, b + c], [1, c]];

    const rA = [[aPrime, bPrime], [1, cPrime]];
    const rB = [[1, 1], [0, 1]];
    const rAB = [[aPrime, aPrime + bPrime], [1, 1 + cPrime]];

    const matrixHtml = (label, mat) => `
      <figure style="display:inline-block; vertical-align:top; margin:10px 20px 10px 0;">
        <figcaption style="font-size:13px; font-weight:bold; color:#475569; margin-bottom:4px;">${escapeHtml(label)}</figcaption>
        <div style="position:relative; display:inline-block; padding:3px 16px;">
          <span style="position:absolute; left:2px; top:0; bottom:0; width:12px; border-left:2.5px solid #0f172a; border-top:2px solid #0f172a; border-bottom:2px solid #0f172a; border-top-left-radius:14px 50%; border-bottom-left-radius:14px 50%;"></span>
          <table style="border-collapse:collapse;">
            <tr><td style="padding:4px 12px; font-size:18px; font-weight:bold; text-align:center;">${mat[0][0]}</td><td style="padding:4px 12px; font-size:18px; font-weight:bold; text-align:center;">${mat[0][1]}</td></tr>
            <tr><td style="padding:4px 12px; font-size:18px; font-weight:bold; text-align:center;">${mat[1][0]}</td><td style="padding:4px 12px; font-size:18px; font-weight:bold; text-align:center;">${mat[1][1]}</td></tr>
          </table>
          <span style="position:absolute; right:2px; top:0; bottom:0; width:12px; border-right:2.5px solid #0f172a; border-top:2px solid #0f172a; border-bottom:2px solid #0f172a; border-top-right-radius:14px 50%; border-bottom-right-radius:14px 50%;"></span>
        </div>
      </figure>
    `;

    const matrixInlineHtml = (mat) => `
      <span style="position:relative; display:inline-block; padding:1px 12px; vertical-align:middle;">
        <span style="position:absolute; left:1px; top:0; bottom:0; width:8px; border-left:2px solid #0f172a; border-top:1.5px solid #0f172a; border-bottom:1.5px solid #0f172a; border-top-left-radius:12px 50%; border-bottom-left-radius:12px 50%;"></span>
        <table style="border-collapse:collapse; display:inline-table; vertical-align:middle;">
          <tr><td style="padding:1px 5px; font-size:15px; font-weight:bold; text-align:center; font-family:'Times New Roman',serif;">${mat[0][0]}</td><td style="padding:1px 5px; font-size:15px; font-weight:bold; text-align:center; font-family:'Times New Roman',serif;">${mat[0][1]}</td></tr>
          <tr><td style="padding:1px 5px; font-size:15px; font-weight:bold; text-align:center; font-family:'Times New Roman',serif;">${mat[1][0]}</td><td style="padding:1px 5px; font-size:15px; font-weight:bold; text-align:center; font-family:'Times New Roman',serif;">${mat[1][1]}</td></tr>
        </table>
        <span style="position:absolute; right:1px; top:0; bottom:0; width:8px; border-right:2px solid #0f172a; border-top:1.5px solid #0f172a; border-bottom:1.5px solid #0f172a; border-top-right-radius:12px 50%; border-bottom-right-radius:12px 50%;"></span>
      </span>
    `;

    const htmlContent = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(teacher)}의 행렬 오답 클리닉 - ${isTeacher ? '교사용 해설본' : '학생용 활동지'}</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; max-width: 840px; margin: 30px auto; padding: 24px; color: #1e293b; line-height: 1.6; }
    header { border-bottom: 2px solid #0f766e; padding-bottom: 14px; margin-bottom: 24px; }
    h1 { margin: 0 0 8px; font-size: 24px; color: #0f766e; }
    .meta { font-size: 14px; color: #64748b; }
    article { border: 1px solid #cbd5e1; border-radius: 12px; padding: 20px; margin: 20px 0; background: #ffffff; }
    h2 { font-size: 18px; margin-top: 0; color: #0f172a; }
    pre { background: #f8fafc; border: 1px solid #e2e8f0; padding: 14px; border-radius: 8px; font-size: 15px; }
    .answer-box { background: #f0fdfa; border: 1px solid #99f6e4; border-radius: 8px; padding: 16px; margin-top: 18px; }
    .answer-box strong { color: #0f766e; }
    .print-btn { background: #0f766e; color: #ffffff; border: none; padding: 10px 18px; border-radius: 6px; font-weight: bold; cursor: pointer; margin-bottom: 16px; }
    @media print { .no-print { display: none; } body { padding: 0; } }
  </style>
</head>
<body>
  <div class="no-print">
    <button class="print-btn" onclick="window.print()">🖨️ 인쇄 / PDF 저장</button>
  </div>
  <header>
    <h1>${escapeHtml(teacher)}의 행렬 오답 클리닉</h1>
    <div class="meta">초강스 에듀테크 LAB · 5주차 중수 미션 · ${isTeacher ? '교사용 해설본 (답안·검산 포함)' : '학생용 활동지'}</div>
    <div class="meta">2022 개정 공통수학1 [10공수1-04-01, 10공수1-04-02] · 행렬의 곱셈 순서</div>
  </header>

  <article>
    <h2>1. 오답 찾기 및 분석</h2>
    <p><strong>[문제]</strong> 주어진 행렬에서 AB를 구하고 BA와 비교하시오.</p>
    <div>
      ${matrixHtml('행렬 A', mA)}
      ${matrixHtml('행렬 B', mB)}
    </div>
    <p><strong>[학생의 오답 풀이]</strong></p>
    <div style="background:#f8fafc; border:1px solid #e2e8f0; padding:14px; border-radius:8px; font-size:15px; line-height:1.8;">
      1. 행렬의 곱 AB를 계산한다.<br>
      2. 실수의 곱처럼 이 예시에서도 AB = BA라고 두고 순서를 바꾼다.<br>
      3. AB = ${matrixInlineHtml(mBA)}
    </div>
    <p>Q1. 위 풀이에서 처음으로 규칙이 어긋난 줄은 몇 번인가요? [ _________ 번 ]</p>
    <p>Q2. 그 줄이 틀린 이유를 자신의 말로 설명해 보세요:</p>
    <div style="border-bottom: 1px dashed #94a3b8; height: 32px; margin: 8px 0 16px;"></div>

    <p><strong>💡 힌트:</strong> 이 수치 예시에서 AB의 (1,1)성분과 BA의 (1,1)성분을 각각 구해 비교해 보세요.</p>

    <h2>2. 같은 규칙, 다른 숫자 (재도전)</h2>
    <p><strong>[재도전 문제]</strong> 주어진 새 행렬에서 AB를 구하시오.</p>
    <div>
      ${matrixHtml("새 행렬 A'", rA)}
      ${matrixHtml("새 행렬 B'", rB)}
    </div>
    <p>나의 풀이 과정 및 답: __________________________________________________</p>

    ${isTeacher ? `
    <section class="answer-box">
      <strong>[교사용 정답 및 해설]</strong>
      <p><strong>1. 교정 풀이:</strong></p>
      <ul style="list-style:none; padding-left:0; line-height:2;">
        <li>• 올바른 AB = ${matrixInlineHtml(mAB)}</li>
        <li>• 순서 바꾼 BA = ${matrixInlineHtml(mBA)}</li>
        <li>• (AB)₁₁ = <strong>${a}</strong>, (BA)₁₁ = <strong>${a + 1}</strong> 이므로 AB ≠ BA 입니다.</li>
      </ul>
      <p><strong>2. 오류 원인:</strong> 실수의 교환법칙을 행렬 곱셈에 무비판적으로 적용함.</p>
      <p><strong>3. 지도 처방:</strong> 성분별 계산(행×열)을 전개하여 같은 위치 성분의 수치가 다름을 직접 목격하도록 지도.</p>
      <p><strong>4. 재도전 정답:</strong> A'B' = ${matrixInlineHtml(rAB)}</p>
      <p><strong>5. 교사 지도 메모:</strong> ${escapeHtml(memo)}</p>
    </section>
    ` : ''}
  </article>

  <footer style="margin-top: 30px; font-size: 13px; color: #94a3b8; text-align: center;">
    초강스 에듀테크 LAB · 함께 성장하는 수학 수업 · 실제 학생 정보는 포함되지 않은 교재입니다.
  </footer>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${teacher}_행렬오답클리닉_${isTeacher ? '교사용해설' : '학생용활동지'}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`${isTeacher ? '교사용 해설지' : '학생용 활동지'}가 다운로드되었습니다!`);
  }

  downloadStudentHtmlBtn.addEventListener('click', () => downloadHtmlFile(false));
  downloadTeacherHtmlBtn.addEventListener('click', () => downloadHtmlFile(true));
  printPageBtn.addEventListener('click', () => window.print());

  // Copy Comment Template
  copyCommentBtn.addEventListener('click', () => {
    const commentText = commentTemplatePreview.textContent;
    navigator.clipboard.writeText(commentText).then(() => {
      showToast('5주차 완료 댓글 양식이 복사되었습니다!');
    }).catch(() => {
      prompt('아래 댓글 양식을 복사하세요:', commentText);
    });
  });

  // Initial render
  updateClinic();
});
