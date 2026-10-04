/**
 * 수현T의 4대 시그니처 테마 컨트롤러
 * ('dark' | 'light' | 'pastel' | 'sky')
 */
(function () {
  const THEMES = [
    { id: 'dark', label: '다크', icon: '🌙' },
    { id: 'light', label: '라이트', icon: '☀️' },
    { id: 'pastel', label: '파스텔', icon: '🌸' },
    { id: 'sky', label: '스카이', icon: '🌊' }
  ];

  const STORAGE_KEY = 'edutech_theme';

  function getStoredTheme() {
    return localStorage.getItem(STORAGE_KEY) || 'dark';
  }

  function applyTheme(themeId, notify = true) {
    if (!THEMES.some(t => t.id === themeId)) themeId = 'dark';

    document.documentElement.setAttribute('data-theme', themeId);
    if (document.body) {
      document.body.setAttribute('data-theme', themeId);
    }
    localStorage.setItem(STORAGE_KEY, themeId);

    // Update switcher UI buttons if rendered
    const btns = document.querySelectorAll('.theme-pill-btn');
    btns.forEach(btn => {
      if (btn.getAttribute('data-theme-id') === themeId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Notify iframe or parent if needed
    if (notify) {
      // 1. If inside iframe, notify parent window
      if (window !== window.parent) {
        window.parent.postMessage({ type: 'EDUTECH_THEME_CHANGE', theme: themeId }, '*');
      }
      // 2. If parent has iframe, notify iframe
      const iframes = document.querySelectorAll('iframe');
      iframes.forEach(iframe => {
        try {
          iframe.contentWindow.postMessage({ type: 'EDUTECH_THEME_CHANGE', theme: themeId }, '*');
        } catch (e) {}
      });
    }

    // Dispatch custom event for local page adjustments (e.g., canvas redraws)
    window.dispatchEvent(new CustomEvent('edutech:themechange', { detail: { theme: themeId } }));
  }

  // Pre-apply theme immediately to avoid flash of wrong theme
  const initialTheme = getStoredTheme();
  document.documentElement.setAttribute('data-theme', initialTheme);

  // Detect if embedded inside an iframe (e.g., inside portal viewer)
  if (window.self !== window.top) {
    document.documentElement.classList.add('is-embedded');
  }

  // Mount UI when DOM is ready
  function initThemeUI() {
    applyTheme(getStoredTheme(), false);

    const containers = document.querySelectorAll('.theme-switcher-mount');
    containers.forEach(container => {
      container.innerHTML = `
        <div class="theme-selector-wrapper" role="radiogroup" aria-label="테마 선택">
          ${THEMES.map(t => `
            <button type="button" class="theme-pill-btn ${t.id === initialTheme ? 'active' : ''}" data-theme-id="${t.id}" title="${t.label} 테마">
              <span>${t.icon}</span>
              <span>${t.label}</span>
            </button>
          `).join('')}
        </div>
      `;

      container.querySelectorAll('.theme-pill-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const themeId = btn.getAttribute('data-theme-id');
          applyTheme(themeId, true);
        });
      });
    });
  }

  // Listen for sync messages from parent or child iframes
  window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'EDUTECH_THEME_CHANGE') {
      applyTheme(event.data.theme, false);
    }
  });

  // When iframe loads, sync current theme to it
  window.addEventListener('load', () => {
    const iframes = document.querySelectorAll('iframe');
    iframes.forEach(iframe => {
      iframe.addEventListener('load', () => {
        try {
          iframe.contentWindow.postMessage({ type: 'EDUTECH_THEME_CHANGE', theme: getStoredTheme() }, '*');
        } catch (e) {}
      });
    });
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initThemeUI);
  } else {
    initThemeUI();
  }

  // Expose to window
  window.EduTechTheme = {
    applyTheme,
    getCurrentTheme: getStoredTheme
  };
})();
