document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const authorInput = document.getElementById('authorInput');
  const titleInput = document.getElementById('titleInput');
  const petalCountSlider = document.getElementById('petalCount');
  const petalCountDisplay = document.getElementById('petalCountDisplay');
  const showAxesCheckbox = document.getElementById('showAxes');
  const userMemo = document.getElementById('userMemo');
  const angleBadge = document.getElementById('angleBadge');
  const mathDescText = document.getElementById('mathDescText');
  const formulaCode = document.getElementById('formulaCode');
  const svgContainer = document.getElementById('svgContainer');
  const downloadSvgBtn = document.getElementById('downloadSvgBtn');
  const copyCommentBtn = document.getElementById('copyCommentBtn');
  const colorDots = document.querySelectorAll('.color-dot');
  const toast = document.getElementById('toast');

  let currentHue = 175; // Default Mint

  function escapeXml(unsafe) {
    return unsafe.replace(/[<>&'"]/g, c => {
      switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case '\'': return '&apos;';
        case '"': return '&quot;';
      }
    });
  }

  function generateSvgString(author, title, count, hue, showAxes) {
    const angle = (360 / count).toFixed(1);
    const primaryColor = `hsl(${hue}, 85%, 68%)`;

    // Petal paths
    let petalsSvg = '';
    for (let i = 0; i < count; i++) {
      const rot = (i * 360) / count;
      petalsSvg += `  <path d="M300 285 Q224 160 300 75 Q376 160 300 285Z" fill="${primaryColor}" fill-opacity="0.32" stroke="${primaryColor}" stroke-width="2" transform="rotate(${rot} 300 285)"/>\n`;
    }

    // Axes lines
    let axesSvg = '';
    if (showAxes) {
      axesSvg = `  <path d="M75 285H525 M300 60V510" stroke="#ffffff" stroke-opacity="0.25" stroke-dasharray="5 5" stroke-width="1.5"/>\n  <circle cx="300" cy="285" r="4" fill="${primaryColor}"/>\n`;
    }

    const safeTitle = escapeXml(title || '수학 꽃이 피었습니다');
    const safeAuthor = escapeXml(author || '수현T');

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 640" width="100%" height="100%" role="img" aria-label="${safeTitle}">
  <title>${safeTitle}</title>
  <desc>같은 모양을 ${count}번 회전해 배치했습니다. 한 번의 회전각은 360° ÷ ${count} = ${angle}°입니다.</desc>
  <rect width="600" height="640" rx="24" fill="#10172e"/>
  <circle cx="300" cy="285" r="223" fill="none" stroke="#2a3754" stroke-width="1.5"/>
  <circle cx="300" cy="285" r="140" fill="none" stroke="#1d2842" stroke-dasharray="3 3"/>
${petalsSvg}${axesSvg}  <text x="300" y="556" text-anchor="middle" fill="#ffffff" font-family="'Pretendard', sans-serif" font-size="18" font-weight="600">${safeTitle}</text>
  <text x="300" y="590" text-anchor="middle" fill="#94a3b8" font-family="'Pretendard', sans-serif" font-size="13" font-weight="500">${safeAuthor} · MATH ART / WEEK 04</text>
</svg>`;
  }

  function update() {
    const count = parseInt(petalCountSlider.value, 10);
    const author = authorInput.value.trim() || '수현T';
    const title = titleInput.value.trim() || '수학 꽃이 피었습니다';
    const showAxes = showAxesCheckbox.checked;
    const angle = (360 / count).toFixed(1);

    // Update displays
    petalCountDisplay.textContent = `${count}개`;
    angleBadge.textContent = `회전각: ${angle}°`;
    formulaCode.textContent = `360° ÷ ${count} = ${angle}°`;

    mathDescText.innerHTML = `같은 모양의 꽃잎을 중심점(300, 285)을 기준으로 <strong>${count}번</strong> 균등 회전하여 배치했습니다.<br>한 번의 회전각은 <code>360° ÷ ${count} = ${angle}°</code>이며, 세로 중심축을 기준으로 좌우 대칭을 이룹니다.`;

    // Render SVG
    const svgCode = generateSvgString(author, title, count, currentHue, showAxes);
    svgContainer.innerHTML = svgCode;
  }

  // Color picker events
  colorDots.forEach(dot => {
    dot.addEventListener('click', () => {
      colorDots.forEach(d => d.classList.remove('active'));
      dot.classList.add('active');
      currentHue = parseInt(dot.getAttribute('data-color'), 10);
      update();
    });
  });

  // Input listeners
  petalCountSlider.addEventListener('input', update);
  authorInput.addEventListener('input', update);
  titleInput.addEventListener('input', update);
  showAxesCheckbox.addEventListener('change', update);

  // Download SVG
  downloadSvgBtn.addEventListener('click', () => {
    const count = parseInt(petalCountSlider.value, 10);
    const author = authorInput.value.trim() || '수현T';
    const title = titleInput.value.trim() || '수학 꽃이 피었습니다';
    const showAxes = showAxesCheckbox.checked;

    const svgContent = generateSvgString(author, title, count, currentHue, showAxes);
    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `회전대칭엽서_${author}_${count}꽃잎.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('SVG 엽서 파일이 다운로드되었습니다!');
  });

  // Copy comment
  copyCommentBtn.addEventListener('click', () => {
    const author = authorInput.value.trim() || '수현T';
    const memo = userMemo.value.trim() || '회전각과 꽃잎 수가 반비례 관계임을 시각적으로 체험했습니다.';
    const currentUrl = window.location.href;

    const commentText = `이름: ${author}
선택 난이도: 개초보
결과물 링크: ${currentUrl}
만들면서 발견하거나 배운 점 한 문장: ${memo}`;

    navigator.clipboard.writeText(commentText).then(() => {
      showToast('제출용 댓글 양식이 복사되었습니다!');
    }).catch(() => {
      prompt('아래 텍스트를 복사하세요:', commentText);
    });
  });

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }

  // Initial render
  update();
});
