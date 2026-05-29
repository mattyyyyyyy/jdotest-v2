/**
 * Viewport Autofit for 2560×1600 IVI canvas.
 * - Detects design width from <meta name="viewport" content="width=…">
 * - Scales the body via CSS transform to fit the actual viewport
 * - Hides itself when window is wide enough (real car-display use)
 */
(function () {
  if (window.self !== window.top) return;

  var meta = document.querySelector('meta[name="viewport"]');
  var designWidth = 2560;
  var designHeight = 1600;
  if (meta) {
    var m = meta.content.match(/width=(\d+)/);
    if (m) designWidth = parseInt(m[1], 10);
    var h = meta.content.match(/height=(\d+)/);
    if (h) designHeight = parseInt(h[1], 10);
  }

  var currentScale = 1;
  var autofit = true;
  var MIN_SCALE = 0.15;
  var MAX_SCALE = 1.5;
  var STEP = 0.1;

  function applyScale(s) {
    s = Math.max(MIN_SCALE, Math.min(MAX_SCALE, s));
    currentScale = s;
    document.body.style.transform = 'scale(' + s + ')';
    document.body.style.transformOrigin = 'top left';
    document.body.style.width = designWidth + 'px';
    document.body.style.minWidth = designWidth + 'px';
    document.body.style.height = designHeight + 'px';
    document.body.style.overflowX = 'hidden';
    document.body.style.overflowY = 'hidden';
    var pctBtn = document.getElementById('z-pct');
    if (pctBtn) pctBtn.textContent = Math.round(s * 100) + '%';
  }

  function autoFit() {
    autofit = true;
    var sw = window.innerWidth / designWidth;
    var sh = window.innerHeight / designHeight;
    applyScale(Math.min(sw, sh));
  }

  var bar = document.createElement('div');
  bar.id = 'zoom-bar';
  bar.innerHTML =
    '<button id="z-fit" title="自适应">⟺</button>' +
    '<button id="z-out" title="缩小">−</button>' +
    '<button id="z-pct" title="当前缩放">100%</button>' +
    '<button id="z-in" title="放大">+</button>' +
    '<button id="z-raw" title="原始大小 100%">1:1</button>';

  var css = document.createElement('style');
  css.textContent =
    '#zoom-bar{position:fixed;bottom:16px;right:16px;z-index:9999;display:flex;gap:6px;align-items:center;padding:6px 10px;background:rgba(20,22,26,0.88);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,0.12);border-radius:12px;font-family:"Manrope","Noto Sans SC",system-ui,sans-serif;font-size:14px;font-weight:600;color:#F1F5F9;box-shadow:0 8px 24px rgba(0,0,0,0.40);user-select:none;transition:opacity 0.3s;opacity:0.55}' +
    '#zoom-bar:hover{opacity:1!important}' +
    '#zoom-bar button{height:32px;min-width:32px;padding:0 8px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.10);border-radius:8px;color:#F1F5F9;font-size:13px;font-weight:600;cursor:pointer;display:grid;place-items:center;transition:all 0.15s ease}' +
    '#zoom-bar button:hover{background:rgba(255,255,255,0.12);border-color:rgba(255,255,255,0.20)}' +
    '#zoom-bar #z-fit{color:#5EEAD4;border-color:rgba(94,234,212,0.30)}' +
    '#zoom-bar #z-raw{color:#94A3B8;font-size:12px}' +
    '#zoom-bar #z-pct{min-width:48px;font-family:"JetBrains Mono",monospace;font-size:12px}';
  document.head.appendChild(css);
  document.body.appendChild(bar);

  document.getElementById('z-fit').addEventListener('click', autoFit);
  document.getElementById('z-in').addEventListener('click', function () { autofit = false; applyScale(currentScale + STEP); });
  document.getElementById('z-out').addEventListener('click', function () { autofit = false; applyScale(currentScale - STEP); });
  document.getElementById('z-raw').addEventListener('click', function () { autofit = false; applyScale(1); });

  autoFit();
  window.addEventListener('resize', function () { if (autofit) autoFit(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === '+' || e.key === '=') { autofit = false; applyScale(currentScale + STEP); e.preventDefault(); }
    if (e.key === '-' || e.key === '_') { autofit = false; applyScale(currentScale - STEP); e.preventDefault(); }
    if (e.key === '0') { autoFit(); e.preventDefault(); }
    if (e.key === '1') { autofit = false; applyScale(1); e.preventDefault(); }
  });
})();
