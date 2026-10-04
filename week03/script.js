document.addEventListener('DOMContentLoaded', () => {
  const slopeSlider = document.getElementById('slopeSlider');
  const interceptSlider = document.getElementById('interceptSlider');
  const slopeValDisplay = document.getElementById('slopeValDisplay');
  const interceptValDisplay = document.getElementById('interceptValDisplay');
  const currentFormula = document.getElementById('currentFormula');
  const yInterceptPoint = document.getElementById('yInterceptPoint');
  const tableYRow = document.getElementById('tableYRow');
  const canvas = document.getElementById('functionCanvas');
  const ctx = canvas.getContext('2d');
  const presetButtons = document.querySelectorAll('.btn-preset');
  const observationMemo = document.getElementById('observationMemo');
  const copyMemoBtn = document.getElementById('copyMemoBtn');
  const toast = document.getElementById('toast');

  let m = 2.0;
  let b = 1.0;

  // Coordinate plane settings
  const xMin = -6;
  const xMax = 6;
  const yMin = -6;
  const yMax = 6;

  function toScreenX(x) {
    return ((x - xMin) / (xMax - xMin)) * canvas.width;
  }

  function toScreenY(y) {
    return canvas.height - ((y - yMin) / (yMax - yMin)) * canvas.height;
  }

  function formatFormula(m, b) {
    if (m === 0) {
      return `y = ${b}`;
    }
    let mStr = '';
    if (m === 1) mStr = 'x';
    else if (m === -1) mStr = '-x';
    else mStr = `${m}x`;

    if (b === 0) return `y = ${mStr}`;
    else if (b > 0) return `y = ${mStr} + ${b}`;
    else return `y = ${mStr} - ${Math.abs(b)}`;
  }

  function drawGraph() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const theme = document.documentElement.getAttribute('data-theme') || 'dark';
    const isLightLike = theme === 'light' || theme === 'pastel' || theme === 'sky';

    // Canvas Background
    ctx.fillStyle = isLightLike ? (theme === 'pastel' ? '#fffbf7' : '#ffffff') : '#020617';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const gridColor = isLightLike ? (theme === 'pastel' ? '#ebded6' : '#e2e8f0') : '#1e293b';
    const axesColor = isLightLike ? '#64748b' : '#475569';
    const textColor = isLightLike ? '#64748b' : '#94a3b8';
    const lineColor = isLightLike ? (theme === 'pastel' ? '#c4666f' : '#2563eb') : '#38bdf8';
    const pointColor = lineColor;

    // 1. Grid
    ctx.lineWidth = 1;
    ctx.strokeStyle = gridColor;

    for (let x = xMin; x <= xMax; x++) {
      ctx.beginPath();
      ctx.moveTo(toScreenX(x), 0);
      ctx.lineTo(toScreenX(x), canvas.height);
      ctx.stroke();
    }
    for (let y = yMin; y <= yMax; y++) {
      ctx.beginPath();
      ctx.moveTo(0, toScreenY(y));
      ctx.lineTo(canvas.width, toScreenY(y));
      ctx.stroke();
    }

    // 2. Axes
    ctx.lineWidth = 2;
    ctx.strokeStyle = axesColor;

    // X Axis
    ctx.beginPath();
    ctx.moveTo(0, toScreenY(0));
    ctx.lineTo(canvas.width, toScreenY(0));
    ctx.stroke();

    // Y Axis
    ctx.beginPath();
    ctx.moveTo(toScreenX(0), 0);
    ctx.lineTo(toScreenX(0), canvas.height);
    ctx.stroke();

    // Axis numbers
    ctx.fillStyle = textColor;
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    for (let x = xMin; x <= xMax; x++) {
      if (x !== 0) {
        ctx.fillText(x, toScreenX(x), toScreenY(0) + 4);
      }
    }
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let y = yMin; y <= yMax; y++) {
      if (y !== 0) {
        ctx.fillText(y, toScreenX(0) - 5, toScreenY(y));
      }
    }

    // Origin
    ctx.fillText('0', toScreenX(0) - 5, toScreenY(0) + 12);

    // 3. Line plot y = mx + b
    const startX = xMin - 1;
    const endX = xMax + 1;
    const startY = m * startX + b;
    const endY = m * endX + b;

    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.clip();

    ctx.lineWidth = 3.5;
    ctx.strokeStyle = lineColor;
    ctx.shadowColor = isLightLike ? 'transparent' : 'rgba(56, 189, 248, 0.4)';
    ctx.shadowBlur = isLightLike ? 0 : 8;

    ctx.beginPath();
    ctx.moveTo(toScreenX(startX), toScreenY(startY));
    ctx.lineTo(toScreenX(endX), toScreenY(endY));
    ctx.stroke();
    ctx.restore();

    // 4. Sample Points (-2, -1, 0, 1, 2, 3)
    const points = [-2, -1, 0, 1, 2, 3];
    points.forEach(px => {
      const py = m * px + b;
      if (py >= yMin && py <= yMax) {
        ctx.beginPath();
        ctx.arc(toScreenX(px), toScreenY(py), 4, 0, Math.PI * 2);
        ctx.fillStyle = pointColor;
        ctx.fill();
        ctx.strokeStyle = isLightLike ? '#ffffff' : '#0f172a';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    });

    // 5. Highlight Y-Intercept (0, b)
    if (b >= yMin && b <= yMax) {
      ctx.beginPath();
      ctx.arc(toScreenX(0), toScreenY(b), 6.5, 0, Math.PI * 2);
      ctx.fillStyle = '#c084fc';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`(0, ${b})`, toScreenX(0) + 10, toScreenY(b) - 6);
    }
  }

  function update() {
    m = parseFloat(slopeSlider.value);
    b = parseFloat(interceptSlider.value);

    slopeValDisplay.textContent = m.toFixed(1);
    interceptValDisplay.textContent = b.toFixed(1);

    currentFormula.textContent = formatFormula(m, b);
    yInterceptPoint.textContent = `y절편 위치: (0, ${b})`;

    // Update Coordinate Table
    const xVals = [-2, -1, 0, 1, 2, 3];
    const yCells = xVals.map(x => {
      const y = (m * x + b);
      return `<td>${Number.isInteger(y) ? y : y.toFixed(1)}</td>`;
    });
    tableYRow.innerHTML = `<th>y</th>${yCells.join('')}`;

    drawGraph();
  }

  // Preset Buttons
  presetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      presetButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const presetM = parseFloat(btn.getAttribute('data-m'));
      const presetB = parseFloat(btn.getAttribute('data-b'));
      slopeSlider.value = presetM;
      interceptSlider.value = presetB;
      update();
    });
  });

  slopeSlider.addEventListener('input', () => {
    presetButtons.forEach(b => b.classList.remove('active'));
    update();
  });

  interceptSlider.addEventListener('input', () => {
    presetButtons.forEach(b => b.classList.remove('active'));
    update();
  });

  // Copy memo
  copyMemoBtn.addEventListener('click', () => {
    const text = observationMemo.value.trim();
    navigator.clipboard.writeText(text).then(() => {
      showToast('탐구 관찰 문장이 복사되었습니다!');
    }).catch(() => {
      prompt('아래 문구를 복사하세요:', text);
    });
  });

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2500);
  }

  // Redraw graph on theme change
  window.addEventListener('edutech:themechange', () => {
    drawGraph();
  });

  update();
});
