(() => {
  'use strict';

  const state = { currentId: 'L04', tab: 'guide' };
  const doneKey = 'geo-course-done-v1';
  const notesKey = 'geo-course-notes-v1';
  const $ = (sel) => document.querySelector(sel);

  const safeGet = (key, fallback) => {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
  };
  const safeSet = (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} };
  const done = () => safeGet(doneKey, {});
  const notes = () => safeGet(notesKey, {});
  const current = () => LECTURES.find(l => l.id === state.currentId) || LECTURES[0];
  const enhance = (lecture) => (window.COURSE_ENHANCEMENTS && window.COURSE_ENHANCEMENTS[lecture.id]) || {};
  const fullQuiz = (lecture) => [...(lecture.quiz || []), ...(enhance(lecture).extraQuiz || [])];
  const sectionKey = (lectureId, i) => `${lectureId}:${i}`;
  const esc = (s) => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const strip = (s) => String(s).replace(/<[^>]*>/g, '');
  const studyText = (parts) => (Array.isArray(parts) ? parts : [parts]).filter(Boolean).join('\n\n');
  const studyButton = (title, body) => `<button type="button" class="study-open" data-study-open data-study-title="${esc(title)}" data-study-body="${esc(body)}">放大阅读</button>`;
  const mathInline = (tex, label = tex) => `<span class="math-inline text-math" data-tex="${esc(tex)}">${esc(label)}</span>`;

  const formulaTokenRules = [
    { label: 'χ²=(m−1)s²/x̄', pattern: /χ²=\(m−1\)s²\/x̄/g, tex: String.raw`\chi^2=(m-1)\frac{s^2}{\bar{x}}` },
    { label: 'χ²=(12−1)×2.00=22.00', pattern: /χ²=\(12−1\)×2\.00=22\.00/g, tex: String.raw`\chi^2=(12-1)\times 2.00=22.00` },
    { label: 'VMR=8.4/4.2=2.00', pattern: /VMR=8\.4\/4\.2=2\.00/g, tex: String.raw`\mathrm{VMR}=\frac{8.4}{4.2}=2.00` },
    { label: 'VMR=s²/x̄', pattern: /VMR=s²\/x̄/g, tex: String.raw`\mathrm{VMR}=\frac{s^2}{\bar{x}}` },
    { label: 'z=(Rₒ−Rₑ)/SE', pattern: /z=\(Rₒ−Rₑ\)\/SE/g, tex: String.raw`z=\frac{R_o-R_e}{SE}` },
    { label: 'z=(140−200)/25=−60/25=−2.40', pattern: /z=\(140−200\)\/25=−60\/25=−2\.40/g, tex: String.raw`z=\frac{140-200}{25}=\frac{-60}{25}=-2.40` },
    { label: 'z=(I−E[I])/√Var[I]', pattern: /z=\(I−E\[I\]\)\/√Var\[I\]/g, tex: String.raw`z=\frac{I-E[I]}{\sqrt{\operatorname{Var}[I]}}` },
    { label: 'p=(r+1)/(999+1)', pattern: /p=\(r\+1\)\/\(999\+1\)/g, tex: String.raw`p=\frac{r+1}{999+1}` },
    { label: 'p=(6+1)/(999+1)=7/1000=0.007', pattern: /p=\(6\+1\)\/\(999\+1\)=7\/1000=0\.007/g, tex: String.raw`p=\frac{6+1}{999+1}=\frac{7}{1000}=0.007` },
    { label: 'F=(R²/k)', pattern: /F=\(R²\/k\)\/\[\(1−R²\)\/\(n−k−1\)\]/g, tex: String.raw`F=\frac{R^2/k}{(1-R^2)/(n-k-1)}` },
    { label: 't=β/SE', pattern: /t=β\/SE/g, tex: String.raw`t=\frac{\beta}{SE}` },
    { label: 't=mean/SE', pattern: /t=mean\/SE/g, tex: String.raw`t=\frac{\bar{x}}{SE}` },
    { label: 'ANN：R = r̄ₒ / r̄ₑ', pattern: /ANN：R = r̄ₒ \/ r̄ₑ/g, tex: String.raw`\mathrm{ANN}: R=\frac{\bar{r}_o}{\bar{r}_e}` },
    { label: 'r = Σ[(xᵢ−x̄)(yᵢ−ȳ)]', pattern: /r = Σ\[\(xᵢ−x̄\)\(yᵢ−ȳ\)\] \/ √\[Σ\(xᵢ−x̄\)² Σ\(yᵢ−ȳ\)²\]/g, tex: String.raw`r=\frac{\sum_i(x_i-\bar{x})(y_i-\bar{y})}{\sqrt{\sum_i(x_i-\bar{x})^2\sum_i(y_i-\bar{y})^2}}` },
    { label: 'r=0', pattern: /r=0/g, tex: String.raw`r=0` },
    { label: 'I = [n / S₀]', pattern: /I = \[n \/ S₀\] · \[ΣᵢΣⱼ wᵢⱼ\(zᵢzⱼ\) \/ Σᵢ zᵢ²\]/g, tex: String.raw`I=\frac{n}{S_0}\frac{\sum_i\sum_jw_{ij}z_iz_j}{\sum_i z_i^2}` },
    { label: 'zᵢ=xᵢ−x̄', pattern: /zᵢ=xᵢ−x̄/g, tex: String.raw`z_i=x_i-\bar{x}` },
    { label: 'yᵢ = a + bxᵢ + eᵢ', pattern: /yᵢ = a \+ bxᵢ \+ eᵢ/g, tex: String.raw`y_i=a+bx_i+e_i` },
    { label: 'ŷᵢ = a + bxᵢ', pattern: /ŷᵢ = a \+ bxᵢ/g, tex: String.raw`\hat{y}_i=a+bx_i` },
    { label: 'eᵢ = yᵢ − ŷᵢ', pattern: /eᵢ = yᵢ − ŷᵢ/g, tex: String.raw`e_i=y_i-\hat{y}_i` },
    { label: 'Σeᵢ²', pattern: /Σeᵢ²/g, tex: String.raw`\sum_i e_i^2` },
    { label: 'SST = SSR + SSE', pattern: /SST = SSR \+ SSE/g, tex: String.raw`\mathrm{SST}=\mathrm{SSR}+\mathrm{SSE}` },
    { label: 'R²=SSR/SST', pattern: /R²=SSR\/SST/g, tex: String.raw`R^2=\frac{\mathrm{SSR}}{\mathrm{SST}}` },
    { label: 'H₀: β=0', pattern: /H₀: β=0/g, tex: String.raw`H_0:\beta=0` },
    { label: 'ŷ = β₀ + β₁x₁ + β₂x₂ + … + βₚxₚ + e', pattern: /ŷ = β₀ \+ β₁x₁ \+ β₂x₂ \+ … \+ βₚxₚ \+ e/g, tex: String.raw`\hat{y}=\beta_0+\beta_1x_1+\beta_2x_2+\cdots+\beta_px_p+e` },
    { label: 'yᵢ = β₀(uᵢ,vᵢ) + Σβₖ(uᵢ,vᵢ)xᵢₖ + εᵢ', pattern: /yᵢ = β₀\(uᵢ,vᵢ\) \+ Σβₖ\(uᵢ,vᵢ\)xᵢₖ \+ εᵢ/g, tex: String.raw`y_i=\beta_0(u_i,v_i)+\sum_k\beta_k(u_i,v_i)x_{ik}+\varepsilon_i` },
    { label: 'SSE = Σₖ Σₓ∈Cₖ', pattern: /SSE = Σₖ Σₓ∈Cₖ \|\|x−μₖ\|\|²/g, tex: String.raw`\mathrm{SSE}=\sum_k\sum_{x\in C_k}\lVert x-\mu_k\rVert^2` },
    { label: 'H(S)=−Σp(c)log₂p(c)', pattern: /H\(S\)=−Σp\(c\)log₂p\(c\)/g, tex: String.raw`H(S)=-\sum_c p(c)\log_2p(c)` },
    { label: 'z = Σwᵢxᵢ+b；a=f(z)', pattern: /z = Σwᵢxᵢ\+b；a=f\(z\)/g, tex: String.raw`z=\sum_iw_ix_i+b,\quad a=f(z)` },
    { label: 'a=f(Σwᵢxᵢ+b)', pattern: /a=f\(Σwᵢxᵢ\+b\)/g, tex: String.raw`a=f\!\left(\sum_iw_ix_i+b\right)` },
    { label: 'z = Σwᵢxᵢ+b', pattern: /z = Σwᵢxᵢ\+b/g, tex: String.raw`z=\sum_iw_ix_i+b` },
    { label: 'Σwᵢxᵢ+b', pattern: /Σwᵢxᵢ\+b/g, tex: String.raw`\sum_iw_ix_i+b` },
    { label: 'K(d)=πd²', pattern: /K\(d\)=πd²/g, tex: String.raw`K(d)=\pi d^2` },
    { label: 'K(d)', pattern: /K\(d\)/g, tex: String.raw`K(d)` },
    { label: 'L(d)', pattern: /L\(d\)/g, tex: String.raw`L(d)` },
    { label: 'πd²', pattern: /πd²/g, tex: String.raw`\pi d^2` },
    { label: 'Moran’s I', pattern: /Moran’s I/g, tex: String.raw`\mathrm{Moran's}\ I` },
    { label: 'Local Moran’s I', pattern: /Local Moran’s I/g, tex: String.raw`\mathrm{Local\ Moran's}\ I` },
    { label: 'Gi*', pattern: /Gi\*/g, tex: String.raw`G_i^\*` },
    { label: 'IoU=TP/(TP+FP+FN)', pattern: /IoU=TP\/\(TP\+FP\+FN\)/g, tex: String.raw`\mathrm{IoU}=\frac{TP}{TP+FP+FN}` },
    { label: 'Precision=TP/(TP+FP)', pattern: /Precision=TP\/\(TP\+FP\)/g, tex: String.raw`\mathrm{Precision}=\frac{TP}{TP+FP}` },
    { label: 'Recall=TP/(TP+FN)', pattern: /Recall=TP\/\(TP\+FN\)/g, tex: String.raw`\mathrm{Recall}=\frac{TP}{TP+FN}` },
    { label: 'F1=2PR/(P+R)', pattern: /F1=2PR\/\(P\+R\)/g, tex: String.raw`F_1=\frac{2PR}{P+R}` },
    { label: 'PSNR=10log10', pattern: /PSNR=10log10\(MSE_baseline\/MSE_new\)/g, tex: String.raw`\Delta\mathrm{PSNR}=10\log_{10}\frac{\mathrm{MSE}_{baseline}}{\mathrm{MSE}_{new}}` },
    { label: '10log10(100/64)', pattern: /10log10\(100\/64\)/g, tex: String.raw`10\log_{10}\frac{100}{64}` },
    { label: 's^2/\\bar{x}', pattern: /s\^2\/\\bar\{x\}/g, tex: String.raw`\frac{s^2}{\bar{x}}` },
    { label: '\\chi^2_{m-1}', pattern: /\\chi\^2_\{m-1\}/g, tex: String.raw`\chi^2_{m-1}` },
    { label: '\\chi^2', pattern: /\\chi\^2/g, tex: String.raw`\chi^2` },
    { label: '\\left(1-d_i^2/h^2\\right)^2', pattern: /\\left\(1-d_i\^2\/h\^2\\right\)\^2/g, tex: String.raw`\left(1-\frac{d_i^2}{h^2}\right)^2` },
    { label: 'd_i^2/h^2', pattern: /d_i\^2\/h\^2/g, tex: String.raw`\frac{d_i^2}{h^2}` },
    { label: '1/h^2', pattern: /1\/h\^2/g, tex: String.raw`\frac{1}{h^2}` },
    { label: 'K_CSR(d)', pattern: /K_CSR\(d\)/g, tex: String.raw`K_{\mathrm{CSR}}(d)` },
    { label: 'X^T X β=X^T y', pattern: /X\^T X β=X\^T y/g, tex: String.raw`X^\mathsf{T}X\boldsymbol{\beta}=X^\mathsf{T}\mathbf{y}` },
    { label: 'X^T W_i X', pattern: /X\^T W_i X/g, tex: String.raw`X^\mathsf{T}W_iX` },
    { label: 'X^T X', pattern: /X\^T X/g, tex: String.raw`X^\mathsf{T}X` },
    { label: 'X^T y', pattern: /X\^T y/g, tex: String.raw`X^\mathsf{T}\mathbf{y}` },
    { label: 'W_i', pattern: /W_i/g, tex: String.raw`W_i` },
    { label: 'x_{g,t}', pattern: /x_\{g,t\}/g, tex: String.raw`x_{g,t}` },
    { label: 'a^{(l-1)}', pattern: /a\^\{\(l-1\)\}/g, tex: String.raw`a^{(l-1)}` },
    { label: '1/(2\\sqrt{\\lambda})', pattern: /1\/\(2\\sqrt\{\\lambda\}\)/g, tex: String.raw`\frac{1}{2\sqrt{\lambda}}` },
    { label: '\\lambda=n/A', pattern: /\\lambda=n\/A/g, tex: String.raw`\lambda=\frac{n}{A}` },
    { label: '\\sum_j w_ij z_j', pattern: /\\sum_j w_ij z_j/g, tex: String.raw`\sum_j w_{ij} z_j` },
    { label: '\\sum w_ij x_j', pattern: /\\sum w_ij x_j/g, tex: String.raw`\sum_j w_{ij} x_j` },
    { label: '\\sum w_k MS_k', pattern: /\\sum w_k MS_k/g, tex: String.raw`\sum_k w_k \mathrm{MS}_k` },
    { label: '\\pi d²', pattern: /\\pi d²/g, tex: String.raw`\pi d^2` },
    { label: '\\sqrt{\\lambda}', pattern: /\\sqrt\{\\lambda\}/g, tex: String.raw`\sqrt{\lambda}` },
    { label: '\\lambda', pattern: /\\lambda/g, tex: String.raw`\lambda` },
    { label: '\\pi', pattern: /\\pi/g, tex: String.raw`\pi` },
    { label: 's²/x̄', pattern: /s²\/x̄/g, tex: String.raw`\frac{s^2}{\bar{x}}` },
    { label: 'x̄', pattern: /x̄/g, tex: String.raw`\bar{x}` },
    { label: 's²', pattern: /s²/g, tex: String.raw`s^2` },
    { label: 'R²', pattern: /R²/g, tex: String.raw`R^2` },
    { label: 'Rₒ', pattern: /Rₒ/g, tex: String.raw`R_o` },
    { label: 'Rₑ', pattern: /Rₑ/g, tex: String.raw`R_e` },
    { label: 'χ²', pattern: /χ²/g, tex: String.raw`\chi^2` },
    { label: 'x_i', pattern: /x_i|xᵢ/g, tex: String.raw`x_i` },
    { label: 'z_i', pattern: /z_i|zᵢ/g, tex: String.raw`z_i` },
    { label: 'w_ij', pattern: /w_ij|wᵢⱼ/g, tex: String.raw`w_{ij}` },
    { label: 'SE', pattern: /\bSE\b/g, tex: String.raw`\mathrm{SE}` },
    { label: 'VMR', pattern: /\bVMR\b/g, tex: String.raw`\mathrm{VMR}` },
    { label: 'CSR', pattern: /\bCSR\b/g, tex: String.raw`\mathrm{CSR}` },
    { label: 'MSE', pattern: /\bMSE\b/g, tex: String.raw`\mathrm{MSE}` },
    { label: 'RMSE', pattern: /\bRMSE\b/g, tex: String.raw`\mathrm{RMSE}` },
    { label: 'SSIM', pattern: /\bSSIM\b/g, tex: String.raw`\mathrm{SSIM}` },
    { label: 'PSNR', pattern: /\bPSNR\b/g, tex: String.raw`\mathrm{PSNR}` },
    { label: 'F1', pattern: /\bF1\b/g, tex: String.raw`F_1` },
    { label: 'IoU', pattern: /\bIoU\b/g, tex: String.raw`\mathrm{IoU}` },
    { label: 'z', pattern: /\bz\b/g, tex: String.raw`z` },
    { label: '−1.96', pattern: /−1\.96/g, tex: String.raw`-1.96` },
  ];
  const keyPointPattern = /(零假设|备择假设|标准误|显著|拒绝随机分布|拒绝|不能拒绝|聚集|离散|随机|带宽|核函数|蒙特卡洛|p 值|z 检验|t 检验|F 检验|上侧临界值|空间权重|残差|热点|冷点|置换检验)/g;

  function withMathPlaceholders(html, transform) {
    const placeholders = [];
    const protect = (tex, label) => {
      const key = `@@MATH_${placeholders.length}@@`;
      placeholders.push([key, mathInline(tex, label)]);
      return key;
    };
    let draft = transform(html, protect);
    placeholders.forEach(([key, value]) => {
      draft = draft.replaceAll(key, value);
    });
    return draft;
  }

  const latexCommandFragmentPattern = /\\[A-Za-z]+(?:\{[^{}]*\})?(?:[_^]\{?[-+\w,]+\}?)*(?:(?:\s*(?:[=+\-*/]|\\cdot|\\times)\s*|\s+)(?:\\[A-Za-z]+(?:\{[^{}]*\})?(?:[_^]\{?[-+\w,]+\}?)*|[A-Za-z]+(?:_[A-Za-z0-9]+|\^\d+|[¹²³])?|\d+(?:\.\d+)?|\([^()]*\)))*/g;

  function normalizeLatexFragment(tex) {
    return tex
      .replace(/¹/g, '^1')
      .replace(/²/g, '^2')
      .replace(/³/g, '^3')
      .replace(/([A-Za-z])_([A-Za-z0-9]{2,})/g, '$1_{$2}')
      .replace(/([A-Za-z])\^([0-9]+)/g, '$1^{$2}');
  }

  function renderLatexFragments(html, protect) {
    return html.replace(latexCommandFragmentPattern, (match) => {
      const tex = normalizeLatexFragment(match.trim());
      if (!tex || tex === '\\text') return match;
      return protect(tex, match);
    });
  }

  function renderRichText(text) {
    return withMathPlaceholders(esc(text || ''), (html, protect) => {
      formulaTokenRules.forEach((rule) => {
        html = html.replace(rule.pattern, (match) => protect(typeof rule.tex === 'function' ? rule.tex(match) : rule.tex, match));
      });
      html = renderLatexFragments(html, protect);
      return html.replace(keyPointPattern, '<strong class="key-point">$1</strong>');
    });
  }

  function restoreGuideInlineMarkup(html) {
    return html
      .replace(/&lt;strong&gt;/g, '<strong>')
      .replace(/&lt;\/strong&gt;/g, '</strong>');
  }

  function splitCalcSteps(calculation) {
    const pieces = String(calculation.explanation || '')
      .split(/[；;。]/)
      .map((part) => part.trim())
      .filter(Boolean);
    const labels = ['公式与代入', '计算结果', '统计判断', '空间含义'];
    return pieces.map((text, index) => ({
      label: labels[index] || `步骤 ${index + 1}`,
      text,
    }));
  }

  function getProgress() {
    const all = LECTURES.flatMap(l => l.sections.map((_, i) => sectionKey(l.id, i)));
    const map = done();
    const completed = all.filter(k => map[k]).length;
    return { completed, total: all.length, map };
  }

  function setAccent(lecture) {
    document.documentElement.style.setProperty('--accent', lecture.accent);
  }

  function renderNav() {
    const nav = $('#lectureNav');
    const map = done();
    nav.innerHTML = LECTURES.map(l => {
      const allDone = l.sections.every((_,i) => map[sectionKey(l.id,i)]);
      return `<button data-nav-id="${l.id}" class="${l.id === state.currentId ? 'is-current' : ''}" type="button">
        <span class="nav-no">${esc(l.number.replace('Lect. ', 'L'))}</span>
        <span class="nav-title">${esc(l.title)}</span>
        <span class="nav-dot ${allDone ? 'is-complete' : ''}"></span>
      </button>`;
    }).join('');
  }

  function updateProgressUI() {
    const { completed, total } = getProgress();
    $('#progressText').textContent = `${completed} / ${total}`;
    $('#progressBar').style.width = `${(completed / total) * 100}%`;
  }

  function renderHero() {
    const l = current();
    setAccent(l);
    $('#lectureNumber').textContent = l.number;
    $('#lectureTitle').textContent = l.title;
    $('#lectureEn').textContent = l.en;
    $('#lectureIntro').textContent = l.intro;
    $('#heroImage').src = l.hero;
    $('#heroImage').alt = `${l.number} ${l.title} 课件关键页截图`;
    $('#openPdf').href = l.source;
    $('#markLectureDone').textContent = `${l.number} 全部标记为已读`;
  }

  function renderOverview() {
    const l = current();
    $('#lectureOverview').innerHTML = `
      <article class="overview-card">
        <p class="eyebrow">本讲路线</p>
        <h2>你会沿着这四步理解问题</h2>
        <p>每一讲都按照“概念 → 方法 → 参数/假设 → 案例与误区”展开。先理解问题，再记公式和工具名。</p>
        <div class="route-list">${l.route.map((r,i) => `<span class="route-chip">${i+1}. ${esc(r)}</span>`).join('')}</div>
      </article>
      <article class="overview-card">
        <p class="eyebrow">学完应能做到</p>
        <ul class="outcome-list">${l.outcomes.map(o => `<li>${esc(o)}</li>`).join('')}</ul>
      </article>`;
  }

  function markSection(key, value) {
    const map = done();
    if (value) map[key] = true; else delete map[key];
    safeSet(doneKey, map);
    updateProgressUI();
    renderNav();
    if (state.tab === 'guide') renderTab();
  }

  function renderGuide(l) {
    const map = done();
    return `
      <div class="guide-header">
        <div><p class="eyebrow">深度讲解</p><h2>${esc(l.title)}：从概念到能解释结果</h2></div>
        <p>每个小节展开后都包含：核心、为什么、案例与常见误区。</p>
      </div>
      <div class="lesson-stack">
        ${l.sections.map((s,i) => {
          const key = sectionKey(l.id, i);
          const isDone = !!map[key];
          return `<details class="lesson-card" ${i === 0 ? 'open' : ''}>
            <summary>
              <span class="lesson-num">${i+1}</span>
              <span>
                <h3>${s.title}</h3>
                <div class="lesson-page">${esc(s.pages)}</div>
                <p class="lesson-take">${esc(strip(s.core).slice(0, 85))}${strip(s.core).length > 85 ? '…' : ''}</p>
              </span>
            </summary>
            <div class="lesson-body">
              <p class="lesson-core">${restoreGuideInlineMarkup(renderRichText(s.core))}</p>
              ${s.formula ? `<div class="lesson-formula text-block">${renderRichText(s.formula)}</div>` : ''}
              ${s.details.map(p => `<p>${renderRichText(p)}</p>`).join('')}
              <div class="lesson-grid">
                <div class="insight-box"><strong>案例化理解</strong><p>${renderRichText(s.case)}</p></div>
                <div class="insight-box trap"><strong>常见误区</strong><p>${renderRichText(s.trap)}</p></div>
              </div>
              <div class="lesson-actions">
                <button type="button" class="mark-section ${isDone ? 'is-done' : ''}" data-section-key="${key}" data-section-done="${isDone ? '1' : '0'}">${isDone ? '已读：点击取消' : '标记本节已读'}</button>
              </div>
            </div>
          </details>`;
        }).join('')}
      </div>`;
  }

  function labIntro(title, description, extra='') {
    return `<div class="lab-intro"><p class="eyebrow">概念互动</p><h2>${title}</h2><p>${description}</p>${extra ? `<p class="lab-caption">${extra}</p>` : ''}</div>`;
  }

  function renderPatternLab() {
    return `${labIntro('样方与点模式实验室', '切换点的生成机制、改变网格数，观察同一批点的格内数量方差如何改变 VMR。', '这是教学模拟：用于理解 VMR 与尺度，不替代正式随机化检验。')}
      <div class="lab-card"><div class="lab-title-row"><h3>点模式 → 网格计数 → VMR</h3><span id="patternStatus" class="status-pill"></span></div>
        <div class="lab-grid"><div class="canvas-wrap"><canvas id="patternCanvas" width="720" height="400"></canvas></div>
        <div class="lab-controls">
          <div class="control-group"><label for="patternMode">点模式</label><select id="patternMode"><option value="random">随机</option><option value="cluster">聚集</option><option value="regular">离散 / 均匀</option></select></div>
          <div class="control-group"><label for="patternGrid">网格边数：<span id="patternGridValue">6</span></label><input id="patternGrid" type="range" min="3" max="12" value="6" /></div>
          <button class="control-button" id="patternRegenerate" type="button">重新生成点</button>
          <div class="metric-list"><div class="metric"><span>每格均值 x̄</span><strong id="patternMean">—</strong></div><div class="metric"><span>格内方差 s²</span><strong id="patternVar">—</strong></div><div class="metric"><span>VMR=s²/x̄</span><strong id="patternVMR">—</strong></div></div>
        </div></div>
        <p class="lab-caption">观察：聚集模式通常让少数格子很多点、许多格子空，因此 VMR 增大；均匀模式让格间点数接近，VMR 变小。切换网格尺寸会改变结果，这正是空间尺度问题。</p>
      </div>`;
  }

  function renderMoranLab() {
    return `${labIntro('空间自相关实验室', '让 5×5 格网呈现正相关、随机或负相关结构，观察 Global Moran’s I 与“邻居定义”的关系。', '本演示使用 Queen 邻接与简单数值格网，用于理解方向；正式分析应采用真实空间权重、置换检验与显著性判断。')}
      <div class="lab-card"><div class="lab-title-row"><h3>值与邻居共同决定 Moran’s I</h3><span id="moranInterpret" class="status-pill"></span></div>
        <div class="lab-grid"><div class="canvas-wrap"><canvas id="moranCanvas" width="620" height="420"></canvas></div>
        <div class="lab-controls">
          <div class="control-group"><label for="moranMode">空间结构</label><select id="moranMode"><option value="positive">正空间自相关：高邻高、低邻低</option><option value="random">近似随机</option><option value="negative">负空间自相关：高低交错</option></select></div>
          <button class="control-button" id="moranRefresh" type="button">重新生成 / 计算</button>
          <div class="metric-list"><div class="metric"><span>观测 Moran’s I</span><strong id="moranI">—</strong></div><div class="metric"><span>邻接规则</span><strong>Queen</strong></div><div class="metric"><span>随机期望约</span><strong id="moranExpected">—</strong></div></div>
        </div></div>
        <p class="lab-caption">同一组值若改变邻接关系（例如从 Queen 改成距离阈值），Moran’s I 也会改变。因此 W 不是默认背景，而是研究假设的一部分。</p>
      </div>`;
  }

  function renderRegressionLab() {
    return `${labIntro('OLS 与“空间非平稳”直觉实验室', '调节真实斜率和噪声，查看 OLS 直线、估计斜率和 R²；开启空间异质性后，观察一条全局线如何掩盖局部关系。', '图中“空间异质性”只是概念模拟，正式 GWR 需要坐标、空间权重、带宽选择和完整诊断。')}
      <div class="lab-card"><div class="lab-title-row"><h3>一条全局线能否代表所有地点？</h3><span id="regressionStatus" class="status-pill"></span></div>
        <div class="lab-grid"><div class="canvas-wrap"><canvas id="regressionCanvas" width="720" height="400"></canvas></div>
        <div class="lab-controls">
          <div class="control-group"><label for="regSlope">基础斜率：<span id="regSlopeValue">1.2</span></label><input id="regSlope" type="range" min="-2" max="3" value="1.2" step="0.1" /></div>
          <div class="control-group"><label for="regNoise">噪声：<span id="regNoiseValue">1.0</span></label><input id="regNoise" type="range" min="0" max="3" value="1" step="0.1" /></div>
          <div class="control-group"><label><input id="regNonstationary" type="checkbox" /> 模拟空间非平稳（两片区域斜率不同）</label></div>
          <button class="control-button" id="regenerateRegression" type="button">生成样本并拟合</button>
          <div class="metric-list"><div class="metric"><span>OLS 估计斜率 b</span><strong id="regSlopeFit">—</strong></div><div class="metric"><span>截距 a</span><strong id="regInterceptFit">—</strong></div><div class="metric"><span>R²</span><strong id="regR2">—</strong></div></div>
        </div></div>
        <p class="lab-caption">全局 OLS 总是能画出一条“平均”线；但当不同地点的真实关系不同，平均线可能掩盖局部机制。这是讨论 GWR 的出发点，而不是 GWR 必然优于 OLS 的理由。</p>
      </div>`;
  }

  function renderProjectLab() {
    return `${labIntro('项目问题生成器', '选择研究主题、空间范围与主要问题，自动生成一个可用于开题的 PPDAC 骨架。', '生成结果是写作框架，不是现成研究结论。需要结合真实数据可得性、课程要求与方法前提继续细化。')}
      <div class="lab-card"><div class="lab-title-row"><h3>把宽泛兴趣收敛成可回答项目</h3><span class="status-pill">PPDAC</span></div>
        <div class="project-builder">
          <div class="control-group"><label for="projectTheme">研究主题</label><select id="projectTheme"><option value="生态环境">生态环境 / 热环境</option><option value="公共服务">公共服务与可达性</option><option value="风险事件">风险事件与热点</option><option value="土地利用">土地利用与遥感变化</option></select></div>
          <div class="control-group"><label for="projectScale">空间分析单元</label><select id="projectScale"><option value="街区或规则网格">街区或规则网格</option><option value="行政区">行政区</option><option value="点位与缓冲区">点位与缓冲区</option><option value="遥感像元或对象">遥感像元或对象</option></select></div>
          <div class="control-group"><label for="projectTime">时间范围</label><select id="projectTime"><option value="单期空间格局">单期空间格局</option><option value="多年份变化">多年份变化</option><option value="月/季节变化">月/季节变化</option><option value="小时级时空过程">小时级时空过程</option></select></div>
          <div class="control-group"><label for="projectMethod">核心方法</label><select id="projectMethod"><option value="空间自相关 + 热点分析">空间自相关 + 热点分析</option><option value="回归 / GWR">回归 / GWR</option><option value="聚类 / 分类">聚类 / 分类</option><option value="时空立方体 + 新兴热点">时空立方体 + 新兴热点</option></select></div>
          <button class="control-button" id="buildProject" type="button">生成项目骨架</button>
          <div id="projectOutput" class="project-output"><h4>等待选择</h4><p>选择四项后点击按钮。输出会按 Problem—Plan—Data—Analysis—Conclusion 组织。</p></div>
        </div>
      </div>`;
  }

  function renderClusterLab() {
    return `${labIntro('K-means 迭代实验室', '选择 k，逐步执行“分配 → 更新中心”，观察中心如何移动、为什么初始化和 k 的选择会改变结果。', '本演示使用二维模拟点。真实地理聚类前还要标准化变量、处理异常值、选择距离并评估类别画像。')}
      <div class="lab-card"><div class="lab-title-row"><h3>从随机中心到稳定簇</h3><span id="clusterStatus" class="status-pill"></span></div>
        <div class="lab-grid"><div class="canvas-wrap"><canvas id="clusterCanvas" width="720" height="400"></canvas></div>
        <div class="lab-controls">
          <div class="control-group"><label for="clusterK">簇数 k：<span id="clusterKValue">3</span></label><input id="clusterK" type="range" min="2" max="5" value="3" /></div>
          <button class="control-button" id="clusterReset" type="button">重新初始化中心</button>
          <button class="control-button" id="clusterStep" type="button">执行一步迭代</button>
          <button class="control-button" id="clusterRun" type="button">自动迭代至稳定</button>
          <div class="metric-list"><div class="metric"><span>当前迭代</span><strong id="clusterIteration">0</strong></div><div class="metric"><span>簇内 SSE</span><strong id="clusterSSE">—</strong></div><div class="metric"><span>状态</span><strong id="clusterState">待初始化</strong></div></div>
        </div></div>
        <p class="lab-caption">注意：K-means 追求的是特征空间中的紧凑簇，不会自动保证地图上连片；如果需要连续区域，应使用空间约束聚类。</p>
      </div>`;
  }

  function renderForestLab() {
    return `${labIntro('随机森林投票实验室', '改变一个模拟像元的 NDVI、NDWI 与纹理特征，观察多棵“略有不同”的树怎样分别判断，再通过投票输出类别。', '规则树是教学简化版；真实随机森林会用很多树、随机特征候选、Bootstrap 样本与 OOB 评估。')}
      <div class="lab-card"><div class="lab-title-row"><h3>五棵树如何汇总成一票</h3><span id="forestFinal" class="status-pill"></span></div>
        <div class="lab-grid"><div>
          <div class="rf-forest" id="forestTrees"></div>
        </div><div class="lab-controls">
          <div class="control-group"><label for="rfNDVI">NDVI：<span id="rfNDVIValue">0.55</span></label><input id="rfNDVI" type="range" min="-0.2" max="0.9" step="0.05" value="0.55" /></div>
          <div class="control-group"><label for="rfNDWI">NDWI：<span id="rfNDWIValue">0.05</span></label><input id="rfNDWI" type="range" min="-0.5" max="0.8" step="0.05" value="0.05" /></div>
          <div class="control-group"><label for="rfTexture">纹理：<span id="rfTextureValue">0.45</span></label><input id="rfTexture" type="range" min="0" max="1" step="0.05" value="0.45" /></div>
          <button class="control-button" id="forestVote" type="button">让森林投票</button>
          <div class="metric-list"><div class="metric"><span>候选类别</span><strong>水体 / 植被 / 建成区</strong></div><div class="metric"><span>说明</span><strong>多数投票</strong></div></div>
        </div></div>
        <p class="lab-caption">当特征接近阈值，树之间可能意见不同；这正说明随机森林的“集成”价值。它并不等于模型知道真实地物，还需独立验证。 </p>
      </div>`;
  }

  function renderSpacetimeLab() {
    return `${labIntro('时空立方体与新兴热点动画', '在 4×4 空间格与 8 个时间步中播放一个热点从“新出现”到“强化”的过程。', '分类标签只用于解释新兴热点思想；真实工具还依赖 Gi*、趋势检验、空间/时间 bin 尺寸和显著性设置。')}
      <div class="lab-card"><div class="lab-title-row"><h3>位置 × 时间：单期热点与变化趋势不是一回事</h3><span id="spaceTimeLabel" class="status-pill"></span></div>
        <div class="lab-grid"><div class="canvas-wrap"><canvas id="spaceTimeCanvas" width="640" height="410"></canvas></div>
        <div class="lab-controls">
          <div class="control-group"><label for="stFrame">时间步：<span id="stFrameValue">1</span> / 8</label><input id="stFrame" type="range" min="1" max="8" value="1" /></div>
          <button class="control-button" id="stPlay" type="button">播放变化</button>
          <button class="control-button" id="stReset" type="button">回到第 1 步</button>
          <div class="metric-list"><div class="metric"><span>中心 bin 值</span><strong id="stCenterValue">—</strong></div><div class="metric"><span>当前叙述</span><strong id="stNarrative">—</strong></div></div>
        </div></div>
        <p class="lab-caption">同一中心位置在后期值变高，并不自动成为“强化热点”。真正的新兴热点分析还要求相邻区域、每期显著性与时间趋势都满足相应规则。</p>
      </div>`;
  }

  function renderCnnLab() {
    return `${labIntro('卷积运算可视化', '查看 5×5 小影像经过 3×3 卷积核后的输出特征图。切换算子后可观察“边缘特征”如何被强调。', '这只展示卷积层的一次局部计算。真实 CNN 会学习卷积核，并叠加多个卷积、激活、下采样和训练过程。')}
      <div class="lab-card"><div class="lab-title-row"><h3>局部感受野与特征图</h3><span id="cnnStatus" class="status-pill"></span></div>
        <div class="cnn-lab-grid">
          <div class="matrix-box"><h4>输入影像（5×5）</h4><div id="cnnInput" class="matrix-grid"></div></div>
          <div class="lab-controls"><div class="control-group"><label for="cnnKernel">卷积核</label><select id="cnnKernel"><option value="edgeX">垂直边缘（Sobel X）</option><option value="edgeY">水平边缘（Sobel Y）</option><option value="sharpen">锐化</option></select></div><button class="control-button" id="cnnApply" type="button">应用卷积</button><div id="cnnKernelDisplay" class="kernel-display"></div><div class="metric-list"><div class="metric"><span>输出尺寸</span><strong>3 × 3</strong></div><div class="metric"><span>移动步长</span><strong>1</strong></div></div></div>
          <div class="matrix-box"><h4>输出特征图（3×3）</h4><div id="cnnOutput" class="matrix-grid"></div></div>
        </div>
        <p class="lab-caption">卷积核在不同位置共享同一组权重，因此参数数量远小于全连接层；它可在整幅影像上寻找同一种局部模式。</p>
      </div>`;
  }

  function renderBigDataLab() {
    return `${labIntro('并行地理处理小实验', '将 32 个空间分片任务分给不同数量的 worker，观察“任务波次”如何减少，并理解为什么并行仍有调度与合并开销。', '这是一张概念性的任务调度图，不模拟真实网络、I/O 或数据倾斜。')}
      <div class="lab-card"><div class="lab-title-row"><h3>切片 → 并行 worker → 汇总</h3><span id="bigDataStatus" class="status-pill"></span></div>
        <div class="lab-grid"><div><div id="workerGrid" class="bigdata-workers"></div><div id="taskGrid" class="bigdata-workers" style="margin-top:12px"></div></div>
        <div class="lab-controls"><div class="control-group"><label for="workerCount">worker 数：<span id="workerCountValue">4</span></label><input id="workerCount" type="range" min="1" max="8" value="4" /></div><button class="control-button" id="runBigData" type="button">运行并行任务</button><div class="metric-list"><div class="metric"><span>任务数</span><strong>32</strong></div><div class="metric"><span>理论波次</span><strong id="taskWaves">8</strong></div><div class="metric"><span>含合并开销</span><strong id="taskEstimate">—</strong></div></div></div></div>
        <p class="lab-caption">worker 越多不一定线性加速：数据读取、分区不均、网络传输、汇总和内存都可能限制速度。正确的分区策略与数据格式和算法同等重要。</p>
      </div>`;
  }

  function renderSuperResLab() {
    return `${labIntro('超分辨率概念对比', '用一个简化的“河岸/道路边界”图案，比较最近邻、双线性式平滑与边缘保持式重建的视觉结果。', '右图是概念动画，不是深度学习模型输出。它用来说明：更锐利的边缘可能有价值，但也可能是没有真值支持的伪细节。')}
      <div class="lab-card"><div class="lab-title-row"><h3>“增加像素”与“恢复可信细节”之间的差别</h3><span id="superResStatus" class="status-pill"></span></div>
        <div class="lab-grid"><div class="superres-grid"><div class="superres-panel"><h4>低分辨率输入</h4><canvas id="lrCanvas" width="220" height="220"></canvas></div><div class="superres-panel"><h4 id="srTitle">重建结果</h4><canvas id="srCanvas" width="220" height="220"></canvas></div></div>
        <div class="lab-controls"><div class="control-group"><label for="srMethod">重建方式</label><select id="srMethod"><option value="nearest">最近邻插值</option><option value="bilinear">平滑插值（概念）</option><option value="edge">边缘保持式“超分”概念</option></select></div><button class="control-button" id="srRender" type="button">渲染对比</button><div class="metric-list"><div class="metric"><span>空间细节</span><strong id="srSpatial">—</strong></div><div class="metric"><span>光谱真实性</span><strong>需用参考数据验证</strong></div></div></div></div>
        <p class="lab-caption">在遥感定量任务中，除了视觉质量，还应评估 PSNR/SSIM、光谱角、几何一致性与下游分类/检测是否真的改善。</p>
      </div>`;
  }

  function renderLab(l) {
    const renderers = { pattern: renderPatternLab, moran: renderMoranLab, regression: renderRegressionLab, project: renderProjectLab, cluster: renderClusterLab, forest: renderForestLab, spacetime: renderSpacetimeLab, cnn: renderCnnLab, bigdata: renderBigDataLab, superres: renderSuperResLab };
    return `<div class="lab-shell">${renderers[l.lab] ? renderers[l.lab]() : '<div class="lab-card">本讲没有配置互动实验。</div>'}</div>`;
  }

  function renderLabSupplement(labName) {
    const note = window.LAB_DEMO_NOTES && window.LAB_DEMO_NOTES[labName];
    if (!note) return '';
    return `<article class="lab-supplement">
      <div class="lab-supplement-head">
        <p class="eyebrow">补全 PPT 省略步骤</p>
        <h3>${esc(note.title)}</h3>
      </div>
      <div class="lab-equation math-display" data-tex="${esc(note.latex)}">${esc(note.latex)}</div>
      <div class="lab-explain-grid">
        <section>
          <h4>怎么操作</h4>
          <ol>${note.steps.map((step) => `<li>${renderRichText(step)}</li>`).join('')}</ol>
        </section>
        <section>
          <h4>观察什么</h4>
          <ul>${note.observe.map((item) => `<li>${renderRichText(item)}</li>`).join('')}</ul>
        </section>
      </div>
      <p class="lab-takeaway"><strong>理解重点：</strong>${renderRichText(note.takeaway)}</p>
    </article>`;
  }

  function renderLab(l) {
    const renderers = { pattern: renderPatternLab, moran: renderMoranLab, regression: renderRegressionLab, project: renderProjectLab, cluster: renderClusterLab, forest: renderForestLab, spacetime: renderSpacetimeLab, cnn: renderCnnLab, bigdata: renderBigDataLab, superres: renderSuperResLab };
    const demo = renderers[l.lab] ? renderers[l.lab]() : '<div class="lab-card">本讲暂未配置互动实验。</div>';
    return `<div class="lab-shell">${demo}${renderLabSupplement(l.lab)}</div>`;
  }

  function renderSlides(l) {
    return `<div class="slide-section-header"><div><p class="eyebrow">课件图示</p><h2>六张关键页，带着目的回看原始课件</h2></div><p>点击任一页可放大；完整资料请使用页面顶部“打开原始 PDF”。</p></div>
      <div class="slide-gallery">${l.slides.map(slide => `<button type="button" class="slide-card" data-slide-src="${slide.src}" data-slide-caption="${esc(slide.label)}"><img loading="lazy" src="${slide.src}" alt="${esc(slide.label)}" /><span>${esc(slide.label)}</span></button>`).join('')}</div>`;
  }

  function renderCheat(l) {
    return `<div class="cheat-layout"><article class="cheat-card"><p class="eyebrow">术语快记</p><h2>先记“问题—工具—结果”</h2><div class="cheat-table">${l.cheat.map(row => `<div class="cheat-row"><strong>${esc(row[0])}</strong><span>${esc(row[1])}</span></div>`).join('')}</div></article>
      <article class="cheat-card"><p class="eyebrow">高分答题表达</p><h2>解释结果时的通用句式</h2><div class="method-rule">“在 <strong>研究尺度 / 邻域定义 / 模型设定</strong> 下，指标显示……；经 <strong>显著性或独立验证</strong> 后，说明……。这一结果支持……的空间/时间机制，但仍受……的数据和方法局限约束。”</div><p style="margin-top:16px;color:#566f7e">把“尺度、假设、检验、机制、局限”写出来，通常比只报一个数值或一张地图更完整。</p></article></div>`;
  }

  function renderFormula(l) {
    const e = enhance(l);
    const cards = e.formulas || [];
    return `<div class="formula-page">
      <section class="formula-hero">
        <p class="eyebrow">把公式读成一句人话</p>
        <h2>${esc(l.title)}：公式、变量与判断逻辑</h2>
        <p>不要求死背符号。每张卡都按“<strong>公式是什么 → 每个符号表示什么 → 算出来怎么解释 → 最容易错在哪里</strong>”组织。先理解，再做计算题。</p>
      </section>
      ${renderConceptBridge(e.conceptBridge)}
      <div class="formula-stack">
        ${cards.map((f, i) => `<article class="formula-card">
          <div class="formula-card-head"><span class="formula-index">公式 ${String(i+1).padStart(2,'0')}</span><span class="formula-tag">${f.tag}</span></div>
          <h3>${esc(f.name)}</h3>
          <div class="formula-display">${f.expression}</div>
          <p class="formula-read"><strong>怎么读：</strong>${esc(f.read)}</p>
          <div class="formula-vars">${(f.vars || []).map(v => `<div><b>${v[0]}</b><span>${esc(v[1])}</span></div>`).join('')}</div>
          <div class="formula-decision"><span>结果判断</span><p>${f.decision}</p></div>
          <details class="formula-why"><summary>为什么可以这样理解？</summary><p>${esc(f.why)}</p></details>
        </article>`).join('') || '<p class="empty-hint">本讲暂未配置公式卡。</p>'}
      </div>
      <section class="formula-reminder"><strong>计算题的四步：</strong>① 先写原公式；② 把题目给的数据和单位逐项代入；③ 保留中间计算；④ 写清数值对应的空间/统计含义。<span>仅写一个数字通常不够。</span></section>
    </div>`;
  }

  function renderKernelFamilyVisual() {
    return `<figure class="formula-visual formula-visual-wide formula-interactive" data-formula-visual="kernel-family">
      <figcaption>
        <span><strong class="key-point">核函数是距离权重曲线。</strong>切换不同核函数，观察中心点、边界点的贡献如何变化。</span>
        <button type="button" class="study-open visual-open" data-open-visual="kernel-family">单独查看</button>
      </figcaption>
      <div class="kernel-demo">
        <div class="kernel-controls" data-kernel-control>
          <button type="button" data-kernel-kind="uniform">均匀核</button>
          <button type="button" data-kernel-kind="triangular">三角核</button>
          <button type="button" data-kernel-kind="epanechnikov">Epanechnikov</button>
          <button type="button" data-kernel-kind="biweight" class="is-active">Biweight</button>
        </div>
        <div class="kernel-canvas-wrap">
          <canvas data-kernel-canvas width="760" height="330"></canvas>
        </div>
        <div class="kernel-reading zh-prose">
          <div class="kernel-equation math-display" data-kernel-formula data-tex=""></div>
          <p data-kernel-text></p>
        </div>
      </div>
    </figure>`;
  }

  function renderFormulaVisual(visual) {
    if (!visual || !visual.type) return '';
    if (visual.type === 'kernel-family') {
      return renderKernelFamilyVisual();
    }
    if (visual.type === 'distance-decay') {
      return `<figure class="formula-visual formula-visual-wide">
        <figcaption>距离权重衰减：GWR 中离目标位置越远的样本，对局部回归的影响越小。</figcaption>
        <svg viewBox="0 0 720 300" role="img" aria-label="Distance decay curves">
          <rect width="720" height="300" rx="12" fill="#f8fbfc"/>
          <g transform="translate(68 34)">
            <path d="M0 204 H585" stroke="#8ba1ad" stroke-width="2"/>
            <path d="M0 204 V14" stroke="#8ba1ad" stroke-width="2"/>
            <text x="-8" y="20" text-anchor="end" fill="#536b78" font-size="13">w</text>
            <text x="588" y="224" fill="#536b78" font-size="13">distance</text>
            <path d="M0 30 C70 78 140 116 220 144 C340 185 470 200 585 204" fill="none" stroke="#d46a57" stroke-width="4" stroke-linecap="round"/>
            <path d="M0 24 C95 34 180 75 272 132 C380 189 492 205 585 205" fill="none" stroke="#1c7f92" stroke-width="4" stroke-linecap="round"/>
            <path d="M0 28 C135 32 210 76 290 154 C328 192 348 204 374 204 H585" fill="none" stroke="#7463b6" stroke-width="4" stroke-linecap="round"/>
            <path d="M374 204 V24" stroke="#c8d5dc" stroke-width="2" stroke-dasharray="6 7"/>
            <text x="365" y="224" fill="#536b78" font-size="13">b</text>
            <g transform="translate(330 28)" font-size="13" fill="#304d5b" font-weight="700">
              <rect x="0" y="0" width="188" height="80" rx="8" fill="#fff" stroke="#dbe7ec"/>
              <circle cx="16" cy="22" r="5" fill="#d46a57"/><text x="30" y="26">inverse distance</text>
              <circle cx="16" cy="44" r="5" fill="#1c7f92"/><text x="30" y="48">Gaussian</text>
              <circle cx="16" cy="66" r="5" fill="#7463b6"/><text x="30" y="70">bi-square cutoff</text>
            </g>
          </g>
        </svg>
      </figure>`;
    }
    if (visual.type === 'confusion-metrics') {
      return `<figure class="formula-visual">
        <figcaption>混淆矩阵视角：不同指标回答的是不同错误代价。</figcaption>
        <svg viewBox="0 0 540 240" role="img" aria-label="Confusion matrix metrics">
          <rect width="540" height="240" rx="12" fill="#f8fbfc"/>
          <g transform="translate(48 42)">
            <text x="162" y="-12" text-anchor="middle" font-size="13" fill="#526b78" font-weight="700">Predicted</text>
            <text x="-30" y="88" transform="rotate(-90 -30 88)" text-anchor="middle" font-size="13" fill="#526b78" font-weight="700">Actual</text>
            <rect x="0" y="0" width="150" height="74" rx="8" fill="#dff2e6" stroke="#badfc7"/>
            <rect x="158" y="0" width="150" height="74" rx="8" fill="#fff0e8" stroke="#edc5b2"/>
            <rect x="0" y="82" width="150" height="74" rx="8" fill="#fff0e8" stroke="#edc5b2"/>
            <rect x="158" y="82" width="150" height="74" rx="8" fill="#edf3f6" stroke="#cbdde4"/>
            <text x="75" y="43" text-anchor="middle" font-size="23" fill="#25633c" font-weight="800">TP</text>
            <text x="233" y="43" text-anchor="middle" font-size="23" fill="#914c2d" font-weight="800">FP</text>
            <text x="75" y="125" text-anchor="middle" font-size="23" fill="#914c2d" font-weight="800">FN</text>
            <text x="233" y="125" text-anchor="middle" font-size="23" fill="#516a77" font-weight="800">TN</text>
            <g transform="translate(342 8)" font-size="13" fill="#304d5b">
              <text x="0" y="0" font-weight="800">Precision = TP / (TP + FP)</text>
              <text x="0" y="34" font-weight="800">Recall = TP / (TP + FN)</text>
              <text x="0" y="68" font-weight="800">IoU = TP / (TP + FP + FN)</text>
              <text x="0" y="102" font-weight="800">F1 balances P and R</text>
            </g>
          </g>
        </svg>
      </figure>`;
    }
    return '';
  }

  const variableGlossary = [
    { symbol: 'n', desc: '样本量或空间单元数量', pattern: /(^|[^A-Za-z\\])n([^A-Za-z]|$)/ },
    { symbol: 'A', desc: '研究区面积', pattern: /(^|[^A-Za-z\\])A([^A-Za-z]|$)/ },
    { symbol: 'd', desc: '距离或分析尺度', pattern: /(^|[^A-Za-z\\])d([^A-Za-z]|$)/ },
    { symbol: 'h', desc: '搜索半径或平滑带宽', pattern: /(^|[^A-Za-z\\])h([^A-Za-z]|$)/ },
    { symbol: '\\lambda', desc: '点密度或事件发生率', pattern: /\\lambda/ },
    { symbol: 'SE', desc: '标准误，用于把差异标准化为检验统计量', pattern: /(^|[^A-Za-z])SE([^A-Za-z]|$)/ },
    { symbol: '\\alpha', desc: '显著性水平，例如 0.05', pattern: /\\alpha/ },
    { symbol: 'p', desc: 'p 值，表示零假设下出现同样或更极端结果的概率', pattern: /(^|[^A-Za-z])p([^A-Za-z]|$)|p_/ },
    { symbol: 'w_{ij}', desc: '位置 i 与 j 之间的空间权重', pattern: /w_\{?ij\}?|wᵢⱼ/ },
    { symbol: 'z_i', desc: '第 i 个观测相对均值的标准化偏差', pattern: /z_\{?i\}?|zᵢ/ },
    { symbol: 'TP', desc: '真正例，真实为目标且被正确识别', pattern: /(^|[^A-Za-z])TP([^A-Za-z]|$)/ },
    { symbol: 'FP', desc: '假正例，非目标被误判为目标', pattern: /(^|[^A-Za-z])FP([^A-Za-z]|$)/ },
    { symbol: 'FN', desc: '假负例，目标被漏检', pattern: /(^|[^A-Za-z])FN([^A-Za-z]|$)/ },
    { symbol: 'MSE', desc: '均方误差，像元误差平方的平均值', pattern: /(^|[^A-Za-z])MSE([^A-Za-z]|$)/ },
  ];

  function formulaVarItems(f) {
    const latex = f.latex || f.expression || '';
    const existing = new Map((f.vars || []).map(([symbol, desc]) => [symbol, desc]));
    variableGlossary.forEach((item) => {
      if (!existing.has(item.symbol) && item.pattern.test(latex)) {
        existing.set(item.symbol, item.desc);
      }
    });
    return [...existing.entries()];
  }

  function renderFormulaCard(f, i) {
    const latex = f.latex || f.expression || '';
    const visual = renderFormulaVisual(f.visual);
    const varItems = formulaVarItems(f);
    return `<article class="formula-card">
      <div class="formula-card-head">
        <span class="formula-index">公式 ${String(i + 1).padStart(2, '0')}</span>
        <span class="formula-tag">${esc(f.tag || '')}</span>
      </div>
      <h3>${esc(f.name || '')}</h3>
      ${f.source ? `<p class="formula-source">${esc(f.source)}</p>` : ''}
      <div class="formula-display math-display" data-tex="${esc(latex)}">${esc(latex)}</div>
      <p class="formula-read text-block"><strong>怎么读：</strong>${renderRichText(f.read || '')}</p>
      <div class="formula-vars">${varItems.map(v => `<div><b class="math-inline" data-tex="${esc(v[0])}">${esc(v[0])}</b><span>${renderRichText(v[1])}</span></div>`).join('')}</div>
      <div class="formula-deep-grid">
        <section class="formula-derivation">
          <h4>推导过程 ${studyButton(`${f.name || ''}：推导过程`, studyText(f.derivation || []))}</h4>
          <ol>${(f.derivation || []).map(step => `<li>${renderRichText(step)}</li>`).join('')}</ol>
        </section>
        <section class="formula-assumptions">
          <h4>前提与易错点 ${studyButton(`${f.name || ''}：前提与易错点`, studyText(f.assumptions || []))}</h4>
          <ul>${(f.assumptions || []).map(item => `<li>${renderRichText(item)}</li>`).join('')}</ul>
        </section>
      </div>
      ${visual}
      <div class="formula-decision"><span>结果判断</span><p>${renderRichText(f.decision || '')}</p></div>
      <details class="formula-why"><summary>为什么可以这样理解？</summary><p>${renderRichText(f.why || '')}</p></details>
    </article>`;
  }

  function renderConceptBridge(items) {
    if (!Array.isArray(items) || !items.length) return '';
    return `<section class="concept-bridge">
      <div class="concept-bridge-head">
        <p class="eyebrow">概念底座</p>
        <h3>先把公式放回 GIS 空间概念里</h3>
      </div>
      <div class="concept-bridge-grid">
        ${items.map(([title, text]) => `<article><strong>${esc(title)}</strong><p>${renderRichText(text)}</p></article>`).join('')}
      </div>
    </section>`;
  }

  function renderMethodPrimer(primer) {
    if (!primer || !Array.isArray(primer.sections)) return '';
    return `<section class="method-primer zh-prose">
      <div class="method-primer-head">
        <p class="eyebrow">先补基础</p>
        <h3>${esc(primer.title)}</h3>
        <p>${renderRichText(primer.lead || '')}</p>
        ${studyButton(primer.title, studyText([primer.lead, ...primer.sections.map((section) => `${section.title}\n${section.body}`)]))}
      </div>
      <div class="method-primer-grid">
        ${primer.sections.map((section) => `<article>
          <h4>${esc(section.title)}</h4>
          <p>${renderRichText(section.body)}</p>
        </article>`).join('')}
      </div>
    </section>`;
  }

  function renderMathBlocks(root = document) {
    if (!window.katex) return;
    root.querySelectorAll('.math-display[data-tex]').forEach(el => {
      window.katex.render(el.dataset.tex, el, {
        displayMode: true,
        throwOnError: false,
        strict: 'ignore',
        trust: false,
      });
    });
    root.querySelectorAll('.math-inline[data-tex]').forEach(el => {
      window.katex.render(el.dataset.tex, el, {
        displayMode: false,
        throwOnError: false,
        strict: 'ignore',
        trust: false,
      });
    });
  }

  function mountFormulaVisuals(root = document) {
    const kernels = {
      uniform: {
        label: '均匀核',
        color: '#7c8d99',
        latex: String.raw`K(u)=\begin{cases}\frac{1}{2},&|u|\le 1\\0,&|u|>1\end{cases}`,
        read: '带宽内的点贡献相同，边界是硬切断；适合理解“窗口计数”，但不够平滑。',
        value: (u) => Math.abs(u) <= 1 ? 0.5 : 0,
      },
      triangular: {
        label: '三角核',
        color: '#d46a57',
        latex: String.raw`K(u)=\begin{cases}1-|u|,&|u|\le 1\\0,&|u|>1\end{cases}`,
        read: '从中心到边界线性递减，比均匀核更强调近距离点。',
        value: (u) => Math.abs(u) <= 1 ? 1 - Math.abs(u) : 0,
      },
      epanechnikov: {
        label: 'Epanechnikov 核',
        color: '#1c7f92',
        latex: String.raw`K(u)=\begin{cases}\frac{3}{4}(1-u^2),&|u|\le 1\\0,&|u|>1\end{cases}`,
        read: '中心权重大，向边界按二次曲线衰减，是核密度估计里常见的平滑权重。',
        value: (u) => Math.abs(u) <= 1 ? 0.75 * (1 - u * u) : 0,
      },
      biweight: {
        label: 'Biweight 核',
        color: '#7463b6',
        latex: String.raw`K(u)=\begin{cases}\frac{15}{16}(1-u^2)^2,&|u|\le 1\\0,&|u|>1\end{cases}`,
        read: '中心附近贡献更集中，边界附近衰减更柔和；ArcGIS 核密度公式常用这一类四次曲线。',
        value: (u) => Math.abs(u) <= 1 ? (15 / 16) * (1 - u * u) ** 2 : 0,
      },
    };

    function draw(container, kind) {
      const canvas = container.querySelector('[data-kernel-canvas]');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const w = canvas.width, h = canvas.height;
      const pad = { left: 62, right: 30, top: 30, bottom: 54 };
      const plotW = w - pad.left - pad.right;
      const plotH = h - pad.top - pad.bottom;
      const active = kernels[kind] || kernels.biweight;
      const x = (u) => pad.left + ((u + 1.15) / 2.3) * plotW;
      const y = (v) => pad.top + (1 - v / 1.05) * plotH;

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#f8fbfc';
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = '#c7d9e1';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(pad.left, y(0));
      ctx.lineTo(w - pad.right, y(0));
      ctx.moveTo(x(0), pad.top - 5);
      ctx.lineTo(x(0), h - pad.bottom);
      ctx.stroke();
      ctx.fillStyle = '#587180';
      ctx.font = '13px system-ui';
      ctx.fillText('u=-1', x(-1) - 16, h - 20);
      ctx.fillText('0', x(0) - 4, h - 20);
      ctx.fillText('u=1', x(1) - 12, h - 20);
      ctx.fillText('K(u)', 20, pad.top + 4);

      Object.entries(kernels).forEach(([id, kernel]) => {
        ctx.beginPath();
        for (let i = 0; i <= 180; i++) {
          const u = -1.15 + (2.3 * i) / 180;
          const px = x(u);
          const py = y(kernel.value(u));
          if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.strokeStyle = id === kind ? kernel.color : 'rgba(111,132,145,.26)';
        ctx.lineWidth = id === kind ? 4 : 2;
        ctx.stroke();
      });

      ctx.fillStyle = active.color;
      ctx.font = 'bold 16px system-ui';
      ctx.fillText(active.label, pad.left, 24);
      ctx.fillStyle = '#385867';
      ctx.font = '13px system-ui';
      ctx.fillText('同一带宽内，曲线越高表示该距离位置的点对密度贡献越大。', pad.left + 116, 24);

      const formula = container.querySelector('[data-kernel-formula]');
      const text = container.querySelector('[data-kernel-text]');
      if (formula) {
        formula.dataset.tex = active.latex;
        formula.textContent = active.latex;
        if (window.katex) window.katex.render(active.latex, formula, { displayMode: true, throwOnError: false, strict: 'ignore' });
      }
      if (text) text.innerHTML = renderRichText(active.read);
      container.querySelectorAll('[data-kernel-kind]').forEach((button) => {
        button.classList.toggle('is-active', button.dataset.kernelKind === kind);
      });
    }

    root.querySelectorAll('[data-formula-visual="kernel-family"]').forEach((container) => {
      if (container.dataset.kernelMounted === '1') return;
      container.dataset.kernelMounted = '1';
      container.querySelectorAll('[data-kernel-kind]').forEach((button) => {
        button.addEventListener('click', () => draw(container, button.dataset.kernelKind));
      });
      draw(container, 'biweight');
    });
  }

  function renderFormula(l) {
    const e = enhance(l);
    const cards = e.formulas || [];
    return `<div class="formula-page">
      <section class="formula-hero">
        <p class="eyebrow">公式、推导与图像</p>
        <h2>${esc(l.title)}：把 PPT 公式补成可计算、可解释的卡片</h2>
        <p>每张卡都按“原公式 → 变量 → 推导过程 → 前提假设 → 结果判断”组织。公式使用 KaTeX 渲染，分式、求和、根号和分段函数都会按数学排版显示。</p>
      </section>
      <div class="formula-stack">
        ${cards.map(renderFormulaCard).join('') || '<p class="empty-hint">本讲暂未配置公式卡。</p>'}
      </div>
      <section class="formula-reminder"><strong>答计算题时：</strong>先写零假设或模型假设，再写统计量公式，代入数值，最后用显著性或业务阈值解释空间含义。<span>只写一个数字通常不够。</span></section>
    </div>`;
  }

  function renderChinese(l) {
    const e = enhance(l);
    return `<div class="chinese-page">
      <section class="chinese-hero">
        <p class="eyebrow">英文课件中文导读</p>
        <h2>先读懂中文逻辑，再回看英文术语</h2>
        <p>${esc(e.chineseLead || l.intro)}</p>
        <p class="translation-note">这里是对课件主要篇章的中文重述与学习提示，不是逐字机械翻译。英文原页仍可在“课件图示”和原始 PDF 中查看。</p>
      </section>
      <section class="translation-section">
        <h3>按课件页段重新说一遍</h3>
        <div class="translation-stack">${l.sections.map((s, i) => `<article class="translation-card">
          <div class="translation-no">${String(i+1).padStart(2,'0')}</div>
          <div><p class="translation-page">${esc(s.pages)}</p><h4>${esc(s.title)}</h4><p>${strip(s.core)}</p><p class="translation-detail">${esc((s.details || [])[0] || '')}</p></div>
        </article>`).join('')}</div>
      </section>
      <section class="glossary-card"><div><p class="eyebrow">双语术语表</p><h3>看到英文不要卡住</h3><p>建议先记中文含义，再把英文当作软件、论文与检索中的“标签”。</p></div>
        <div class="glossary-grid">${(e.terms || []).map(t => `<div class="glossary-item"><strong>${esc(t[0])}</strong><span>${esc(t[1])}</span></div>`).join('')}</div>
      </section>
    </div>`;
  }

  function caseSvg(kind) {
    const common = 'viewBox="0 0 700 350" role="img" aria-label="概念图解"';
    if (kind === 'moran') return `<svg ${common} class="case-svg"><rect width="700" height="350" fill="#f5fafc"/><g transform="translate(82,48)">${Array.from({length:16},(_,i)=>{const r=Math.floor(i/4),c=i%4; const high=(r<2&&c<2)||(r>1&&c>1); return `<rect x="${c*95}" y="${r*62}" width="86" height="54" rx="9" fill="${high?'#d66252':'#91bed1'}"/><text x="${c*95+43}" y="${r*62+33}" text-anchor="middle" font-size="18" font-weight="700" fill="#fff">${high?'高':'低'}</text>`;}).join('')}</g><path d="M70 300 C205 262 270 322 390 281 S570 240 640 286" fill="none" stroke="#1e6f95" stroke-width="5" stroke-linecap="round"/><text x="350" y="324" text-anchor="middle" font-size="17" fill="#345a6d" font-weight="700">同类值在邻域内成片出现 → 正空间自相关</text></svg>`;
    if (kind === 'project') return `<svg ${common} class="case-svg"><rect width="700" height="350" fill="#faf8fc"/><g transform="translate(58,40)"><rect width="124" height="76" rx="15" fill="#7a4f92"/><text x="62" y="34" text-anchor="middle" font-size="20" fill="#fff" font-weight="700">问题</text><text x="62" y="58" text-anchor="middle" font-size="14" fill="#eadff1">可持续餐饮</text><path d="M142 38 H205" stroke="#7a4f92" stroke-width="6"/><polygon points="205,38 190,28 190,48" fill="#7a4f92"/><rect x="220" y="0" width="124" height="76" rx="15" fill="#a77abb"/><text x="282" y="34" text-anchor="middle" font-size="20" fill="#fff" font-weight="700">数据</text><text x="282" y="58" text-anchor="middle" font-size="14" fill="#f8f1fb">POI / 交通 / 价格</text><path d="M362 38 H425" stroke="#7a4f92" stroke-width="6"/><polygon points="425,38 410,28 410,48" fill="#7a4f92"/><rect x="440" y="0" width="124" height="76" rx="15" fill="#d3b3e0"/><text x="502" y="34" text-anchor="middle" font-size="20" fill="#4d255f" font-weight="700">指数</text><text x="502" y="58" text-anchor="middle" font-size="14" fill="#4d255f">标准化 / 权重</text><path d="M500 90 V145" stroke="#7a4f92" stroke-width="6"/><polygon points="500,145 490,130 510,130" fill="#7a4f92"/><rect x="438" y="162" width="128" height="76" rx="15" fill="#f1e5f5" stroke="#7a4f92" stroke-width="2"/><text x="502" y="196" text-anchor="middle" font-size="20" fill="#4d255f" font-weight="700">结论</text><text x="502" y="220" text-anchor="middle" font-size="14" fill="#4d255f">不平等 / 优化</text><circle cx="90" cy="200" r="38" fill="#efc765"/><circle cx="180" cy="230" r="26" fill="#f2a36b"/><circle cx="282" cy="191" r="31" fill="#80b9b1"/><text x="184" y="293" text-anchor="middle" font-size="16" fill="#654173">每一步都应回到问题</text></g></svg>`;
    if (kind === 'cluster') return `<svg ${common} class="case-svg"><rect width="700" height="350" fill="#f7fcfd"/><g fill="#0c7c84" opacity=".92">${[[100,92],[135,130],[153,76],[184,112],[220,146],[112,168],[400,87],[448,114],[480,70],[504,140],[438,168],[545,116]].map(p=>`<circle cx="${p[0]}" cy="${p[1]}" r="11"/>`).join('')}</g><g fill="#f2a95e" opacity=".94">${[[88,238],[138,271],[186,230],[214,284],[260,252],[310,278],[352,230],[385,270]].map(p=>`<circle cx="${p[0]}" cy="${p[1]}" r="11"/>`).join('')}</g><path d="M55 55 C90 30 250 30 275 130 C286 180 220 196 95 183 C42 177 24 112 55 55Z" fill="none" stroke="#0c7c84" stroke-width="3" stroke-dasharray="8 6"/><path d="M57 213 C120 188 370 203 405 270 C432 325 100 327 56 284 C25 254 25 232 57 213Z" fill="none" stroke="#e4903e" stroke-width="3" stroke-dasharray="8 6"/><text x="510" y="245" font-size="18" font-weight="700" fill="#2c5968">相似 ≠ 必然连片</text><text x="510" y="273" font-size="15" fill="#506f7b">方法选择取决于研究目标</text></svg>`;
    if (kind === 'forest') return `<svg ${common} class="case-svg"><rect width="700" height="350" fill="#fff9f7"/><g transform="translate(45,38)">${[0,1,2,3,4].map(i=>`<g transform="translate(${i*120},0)"><rect width="92" height="172" rx="13" fill="#fff" stroke="#e2c1b3"/><text x="46" y="30" text-anchor="middle" font-size="15" fill="#a64c3b" font-weight="700">Tree ${i+1}</text><path d="M46 48 V76 M46 76 L24 102 M46 76 L68 102 M24 102 L12 130 M24 102 L37 130 M68 102 L55 130 M68 102 L80 130" stroke="#905d47" stroke-width="4" stroke-linecap="round"/><text x="46" y="158" text-anchor="middle" font-size="14" fill="#9b5737">${i<3?'植被':'建设'}</text></g>`).join('')}</g><path d="M354 235 V274" stroke="#b04457" stroke-width="6"/><polygon points="354,296 341,274 367,274" fill="#b04457"/><rect x="245" y="300" width="220" height="36" rx="18" fill="#b04457"/><text x="355" y="325" text-anchor="middle" font-size="17" fill="#fff" font-weight="700">多数投票：植被</text></svg>`;
    if (kind === 'spacetime') return `<svg ${common} class="case-svg"><rect width="700" height="350" fill="#f8f9ff"/><g transform="translate(165,45)">${[0,1,2,3].map(z=>`<g transform="translate(${z*52},${z*-17})">${Array.from({length:9},(_,i)=>{const r=Math.floor(i/3),c=i%3;const hot=(r===1&&c===1)||(z>1&&r===1&&c===2);return `<rect x="${c*44}" y="${r*44}" width="37" height="37" rx="5" fill="${hot?'#d9554a':'#a2c5d1'}"/>`;}).join('')}</g>`).join('')}</g><path d="M450 272 H610" stroke="#5b64b8" stroke-width="6"/><polygon points="630,272 608,259 608,285" fill="#5b64b8"/><text x="520" y="248" text-anchor="middle" font-size="16" fill="#4d559d" font-weight="700">时间推进</text><text x="350" y="330" text-anchor="middle" font-size="17" fill="#435b6a">空间格 × 时间步 = 时空 bin</text></svg>`;
    if (kind === 'cnn') return `<svg ${common} class="case-svg"><rect width="700" height="350" fill="#faf9fe"/><g transform="translate(45,65)"><rect width="135" height="135" rx="14" fill="#e8edf5" stroke="#5f4ca1" stroke-width="3"/>${Array.from({length:5},(_,r)=>Array.from({length:5},(_,c)=>`<rect x="${12+c*22}" y="${12+r*22}" width="18" height="18" fill="${(r===2||c===2)?'#6e57bb':'#b9c5d3'}" rx="3"/>`).join('')).join('')}<text x="67" y="165" text-anchor="middle" font-size="15" fill="#3b2b70" font-weight="700">输入影像</text><path d="M162 69 H244" stroke="#5f4ca1" stroke-width="6"/><polygon points="257,69 236,57 236,81" fill="#5f4ca1"/><rect x="270" y="10" width="120" height="120" rx="14" fill="#5f4ca1"/><text x="330" y="64" text-anchor="middle" font-size="21" fill="#fff" font-weight="700">卷积</text><text x="330" y="91" text-anchor="middle" font-size="13" fill="#eee9ff">局部模式</text><path d="M405 69 H482" stroke="#5f4ca1" stroke-width="6"/><polygon points="496,69 475,57 475,81" fill="#5f4ca1"/><rect x="510" y="10" width="120" height="120" rx="14" fill="#dcd4f3"/><text x="570" y="64" text-anchor="middle" font-size="19" fill="#44347e" font-weight="700">预测</text><text x="570" y="91" text-anchor="middle" font-size="13" fill="#44347e">类别 / 目标</text></g><text x="350" y="305" text-anchor="middle" font-size="17" fill="#4b5577">从边缘、纹理到地物语义</text></svg>`;
    if (kind === 'landsat') return `<svg ${common} class="case-svg"><rect width="700" height="350" fill="#f9fcfd"/><circle cx="140" cy="170" r="90" fill="#77b8df"/><path d="M50 165 Q145 80 230 166 Q145 262 50 165" fill="#5a9bc1" opacity=".75"/><g transform="translate(390,85)"><rect width="190" height="108" rx="16" fill="#1d4861"/><rect x="20" y="18" width="150" height="70" rx="8" fill="#9ecaae"/><path d="M20 60 Q60 20 95 60 T170 60" fill="none" stroke="#2f7e99" stroke-width="9"/><path d="M20 44 H170" stroke="#d7b86c" stroke-width="18" stroke-dasharray="55 14"/><text x="95" y="135" text-anchor="middle" font-size="16" fill="#315769">长期观测 → 时序分析</text></g><path d="M220 165 H360" stroke="#9a6434" stroke-width="6"/><polygon points="375,165 352,151 352,179" fill="#9a6434"/><text x="350" y="310" text-anchor="middle" font-size="17" fill="#355867">开放影像、跨年对比、规模化处理</text></svg>`;
    return `<svg ${common} class="case-svg"><rect width="700" height="350" fill="#fffdf6"/><g transform="translate(65,50)"><rect width="220" height="190" rx="16" fill="#dbe8d5"/>${Array.from({length:7},(_,r)=>Array.from({length:7},(_,c)=>`<rect x="${12+c*28}" y="${12+r*24}" width="23" height="19" rx="2" fill="${(c===3||r===4)?'#536a7b':'#dbe8d5'}"/>`).join('')).join('')}<text x="110" y="220" text-anchor="middle" font-size="16" fill="#4d6570" font-weight="700">低分辨率 / 块状</text><path d="M245 95 H340" stroke="#7f6b22" stroke-width="6"/><polygon points="355,95 334,83 334,107" fill="#7f6b22"/><rect x="375" width="220" height="190" rx="16" fill="#dbe8d5"/>${Array.from({length:14},(_,r)=>Array.from({length:14},(_,c)=>`<rect x="${8+c*14}" y="${8+r*13}" width="12" height="11" rx="1" fill="${(c>5&&c<9)||(r>7&&r<10)?'#3e586a':'#dbe8d5'}"/>`).join('')).join('')}<text x="485" y="220" text-anchor="middle" font-size="16" fill="#4d6570" font-weight="700">输出更细，但须验证</text></g><text x="350" y="310" text-anchor="middle" font-size="17" fill="#67581b">锐利 ≠ 一定真实</text></svg>`;
  }

  function renderCases(l) {
    const e = enhance(l); const ids = e.caseIds || []; const cases = (window.REAL_CASES || {});
    return `<div class="case-page"><section class="case-hero"><p class="eyebrow">课程外真实案例与原创图解</p><h2>不要只看英文 PDF：用真实数据链理解方法</h2><p>案例卡把课程方法放回真实问题。带“外部来源”的图像和说明已注明来源；原创图解用于解释方法步骤。</p></section>
      <div class="case-grid">${ids.map(id => {
        const c=cases[id]; if(!c) return ''; const visual=c.images ? `<div class="case-image-pair">${c.images.map((src,i)=>`<img loading="lazy" src="${src}" alt="${esc((c.alt||[])[i] || c.title)}"/>`).join('')}</div>` : c.image ? `<img class="case-image" loading="lazy" src="${c.image}" alt="${esc(c.alt || c.title)}"/>` : caseSvg(c.svg);
        const link=c.sourceUrl ? `<a class="case-link" href="${c.sourceUrl}" target="_blank" rel="noopener">查看来源 / 原始案例 ↗</a>` : `<span class="case-link case-link-muted">${esc(c.sourceName)}</span>`;
        return `<article class="case-card"><div class="case-visual">${visual}</div><div class="case-body"><p class="case-kicker">${esc(c.kicker)}</p><h3>${esc(c.title)}</h3><p>${esc(c.text)}</p><div class="case-prompt"><strong>带着问题看：</strong>${esc(c.prompt)}</div><div class="case-source"><span>${esc(c.credit)}</span>${link}</div></div></article>`;
      }).join('')}</div></div>`;
  }

  function renderQuiz(l) {
    const qs = fullQuiz(l); const calcs = enhance(l).calculations || [];
    return `<div class="quiz-card"><p class="eyebrow">概念自测</p><h2>先判断，再看解释</h2><p class="quiz-intro">本讲共 ${qs.length} 道选择题，后面还有 ${calcs.length} 道可输入答案的计算题。答错并不扣分，重点是看“为什么”。</p><div class="quiz-stack">${qs.map((q,qi) => `<div class="question" data-quiz="${qi}"><p>${qi+1}. ${esc(q.q)}</p><div class="options">${q.options.map((o,oi) => `<button type="button" class="option" data-quiz-option="${qi}" data-option="${oi}">${String.fromCharCode(65+oi)}. ${esc(o)}</button>`).join('')}</div><p class="answer-note" id="answer-${qi}"></p></div>`).join('')}</div>
      <div class="calculation-area"><div class="calculation-header"><p class="eyebrow">公式与检验训练</p><h3>先写统计量，再判断含义</h3><p>按题目指定的小数位输入。结果为小数时，输入 <strong>0.85</strong>，不要输入 <strong>85%</strong>；显著性结论会在解析中给出。</p></div><div class="calculation-stack">${calcs.map((c,ci) => `<article class="calc-question"><div class="calc-title"><span>计算 ${ci+1}</span><h4>${esc(c.title)}</h4></div><p class="calc-stem text-block">${renderRichText(c.stem)}</p><p class="calc-hint text-block">提示：${renderRichText(c.hint)}</p><div class="calc-input-row"><label for="calc-${ci}">你的答案</label><input id="calc-${ci}" inputmode="decimal" autocomplete="off" placeholder="例如 0.85" /><span>${esc(c.unit || '')}</span><button type="button" class="control-button" data-check-calc="${ci}">核对答案</button></div><div class="calc-note" id="calc-note-${ci}"></div></article>`).join('')}</div></div>
    </div>`;
  }

  function handleCalc(ci) {
    const l=current(), c=(enhance(l).calculations || [])[ci]; if(!c) return; const input=$(`#calc-${ci}`), note=$(`#calc-note-${ci}`); const raw=input.value.trim().replace(/，/g, '.').replace(/%/g, ''); const val=Number(raw);
    if(!Number.isFinite(val)){ note.innerHTML='<strong>请先输入一个有效数字</strong><p>例如 0.85 或 28.13。</p>'; note.className='calc-note is-show is-wrong'; return; }
    const ok=Math.abs(val-c.answer) <= (c.tolerance ?? 0.01);
    const steps = splitCalcSteps(c);
    note.innerHTML = `<div class="calc-result"><strong>${ok?'计算正确。':'需要再核对。'}</strong><span>参考答案：${esc(c.answer)}${esc(c.unit || '')}</span></div><ol class="calc-solution-steps">${steps.map((step) => `<li><span>${esc(step.label)}</span><p>${renderRichText(step.text)}</p></li>`).join('')}</ol>`;
    note.className=`calc-note is-show ${ok?'is-correct':'is-wrong'}`;
    renderMathBlocks(note);
  }


  function renderNotes(l) {
    const existing = notes()[l.id] || '';
    return `<div class="note-card"><p class="eyebrow">本地保存</p><h2>${esc(l.number)} · 我的笔记</h2><p style="color:#5b7280;font-size:13px">笔记保存在当前浏览器的本地存储中；不会上传，也不会影响原始 PDF。</p><textarea id="noteEditor" placeholder="记录公式、参数含义、老师可能提问、自己不懂的地方……">${esc(existing)}</textarea><div class="note-actions"><button type="button" id="saveNote" class="primary-btn">保存笔记</button><span id="noteStatus" class="note-status"></span></div></div>`;
  }

  function renderTab() {
    const l = current();
    document.querySelectorAll('.tab').forEach(btn => btn.classList.toggle('is-active', btn.dataset.tab === state.tab));
    const renderers = { guide: renderGuide, formula: renderFormula, chinese: renderChinese, cases: renderCases, lab: renderLab, slides: renderSlides, cheat: renderCheat, quiz: renderQuiz, notes: renderNotes };
    $('#tabContent').innerHTML = (renderers[state.tab] || renderGuide)(l);
    if (state.tab === 'formula' && !$('#tabContent .concept-bridge')) {
      const e = enhance(l);
      $('#tabContent .formula-hero')?.insertAdjacentHTML('afterend', `${renderMethodPrimer(e.methodPrimer)}${renderConceptBridge(e.conceptBridge)}`);
    }
    if (state.tab === 'lab') mountLab(l.lab);
    if (state.tab === 'guide' || state.tab === 'formula' || state.tab === 'lab' || state.tab === 'quiz') renderMathBlocks($('#tabContent'));
    if (state.tab === 'formula') mountFormulaVisuals($('#tabContent'));
  }

  function renderAll() {
    renderNav(); updateProgressUI(); renderHero(); renderOverview(); renderTab();
  }

  function changeLecture(id, tab = 'guide') {
    if (!LECTURES.some(l => l.id === id)) return;
    state.currentId = id; state.tab = tab;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    renderAll();
  }

  function mountPatternLab() {
    const canvas = $('#patternCanvas'); if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const mode = $('#patternMode'); const grid = $('#patternGrid');
    let points = [];
    const rand = (a,b) => a + Math.random()*(b-a);
    function generate() {
      const n = 90; points=[];
      if (mode.value === 'random') {
        for(let i=0;i<n;i++) points.push([rand(.04,.96),rand(.06,.94)]);
      } else if (mode.value === 'cluster') {
        const centers=[[.28,.30],[.70,.35],[.55,.72]];
        for(let i=0;i<n;i++){ const c=centers[i%centers.length]; points.push([Math.max(.02,Math.min(.98,c[0]+(Math.random()+Math.random()+Math.random()-1.5)*.12)),Math.max(.03,Math.min(.97,c[1]+(Math.random()+Math.random()+Math.random()-1.5)*.12))]); }
      } else {
        const k=10; for(let r=0;r<9;r++) for(let c=0;c<10;c++) points.push([.08+c*.095+rand(-.018,.018),.1+r*.095+rand(-.018,.018)]);
      }
      draw();
    }
    function draw() {
      const w=canvas.width,h=canvas.height; const g=+grid.value; const counts=Array(g*g).fill(0);
      points.forEach(([x,y])=>{let c=Math.min(g-1,Math.floor(x*g)), r=Math.min(g-1,Math.floor(y*g)); counts[r*g+c]++;});
      ctx.clearRect(0,0,w,h); ctx.fillStyle='#fafdff';ctx.fillRect(0,0,w,h);
      ctx.strokeStyle='#c9dde5';ctx.lineWidth=1;
      for(let i=0;i<=g;i++){ctx.beginPath();ctx.moveTo(i*w/g,0);ctx.lineTo(i*w/g,h);ctx.stroke();ctx.beginPath();ctx.moveTo(0,i*h/g);ctx.lineTo(w,i*h/g);ctx.stroke();}
      // light counts
      counts.forEach((n,i)=>{ if(!n) return; const c=i%g,r=Math.floor(i/g);ctx.fillStyle='rgba(30,111,149,.08)';ctx.fillRect(c*w/g,r*h/g,w/g,h/g);ctx.fillStyle='#66818e';ctx.font='11px system-ui';ctx.fillText(n,c*w/g+4,r*h/g+13); });
      ctx.fillStyle='#143748'; points.forEach(([x,y])=>{ctx.beginPath();ctx.arc(x*w,y*h,4.2,0,Math.PI*2);ctx.fill();});
      const mean=points.length/(g*g); const variance=counts.reduce((s,v)=>s+(v-mean)**2,0)/(counts.length-1); const vmr=variance/mean;
      $('#patternGridValue').textContent=g; $('#patternMean').textContent=mean.toFixed(2); $('#patternVar').textContent=variance.toFixed(2); $('#patternVMR').textContent=vmr.toFixed(2);
      const label=vmr<.8?'倾向离散/均匀':vmr>1.25?'倾向聚集':'接近随机'; $('#patternStatus').textContent=label;
    }
    mode.addEventListener('change',generate); grid.addEventListener('input',draw); $('#patternRegenerate').addEventListener('click',generate); generate();
  }

  function mountMoranLab() {
    const canvas=$('#moranCanvas'); if(!canvas) return; const ctx=canvas.getContext('2d'); const mode=$('#moranMode');
    function valuesFor(type) {
      const n=5, a=[];
      for(let r=0;r<n;r++){a[r]=[];for(let c=0;c<n;c++){
        if(type==='positive') a[r][c]=(c<3&&r<3?9:2)+Math.random()*1.5;
        else if(type==='negative') a[r][c]=((r+c)%2?2:9)+Math.random()*.7;
        else a[r][c]=1+Math.random()*9;
      }} return a;
    }
    function moran(a) { const n=25, vals=a.flat(), mean=vals.reduce((x,y)=>x+y,0)/n; let numerator=0,denom=0,s0=0; for(let r=0;r<5;r++)for(let c=0;c<5;c++){const i=r*5+c,zi=vals[i]-mean;denom+=zi*zi; for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){if(!dr&&!dc)continue;let rr=r+dr,cc=c+dc;if(rr>=0&&rr<5&&cc>=0&&cc<5){const zj=vals[rr*5+cc]-mean;numerator+=zi*zj;s0++;}}} return {I:(n/s0)*numerator/denom, exp:-1/(n-1)}; }
    function draw() { const a=valuesFor(mode.value); const {I,exp}=moran(a); const w=canvas.width,h=canvas.height, cell=Math.min(w/5,h/5), ox=(w-cell*5)/2,oy=(h-cell*5)/2;ctx.clearRect(0,0,w,h);ctx.fillStyle='#fff';ctx.fillRect(0,0,w,h);
      for(let r=0;r<5;r++) for(let c=0;c<5;c++){const v=a[r][c]; const t=(v-1)/9; const red=Math.round(45+205*t), blue=Math.round(200-160*t); ctx.fillStyle=`rgb(${red},${Math.round(130-80*t)},${blue})`;ctx.fillRect(ox+c*cell,oy+r*cell,cell-2,cell-2);ctx.fillStyle=t>.55?'#fff':'#163343';ctx.font='bold 17px system-ui';ctx.textAlign='center';ctx.fillText(v.toFixed(1),ox+c*cell+cell/2,oy+r*cell+cell/2+6); }
      ctx.textAlign='left';ctx.fillStyle='#5a7180';ctx.font='13px system-ui';ctx.fillText('深色：高值；浅色：低值。Queen 邻接：共享边或角的格子为邻居。',12,h-15);
      $('#moranI').textContent=I.toFixed(3); $('#moranExpected').textContent=exp.toFixed(3); $('#moranInterpret').textContent=I>.18?'正空间自相关':I<-.18?'负空间自相关':'接近随机';
    }
    mode.addEventListener('change',draw); $('#moranRefresh').addEventListener('click',draw); draw();
  }

  function mountRegressionLab() {
    const canvas=$('#regressionCanvas'); if(!canvas) return; const ctx=canvas.getContext('2d'); const slope=$('#regSlope'), noise=$('#regNoise'), ns=$('#regNonstationary');
    function normal(){let u=0,v=0;while(!u)u=Math.random();while(!v)v=Math.random();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);}
    function draw() { const b=+slope.value, eps=+noise.value, non=ns.checked; const pts=[]; for(let i=0;i<70;i++){const x=Math.random()*10; const region=i<35?0:1; const local=non?(region?b*1.8:b*.35):b; const y=4+local*x+normal()*eps; pts.push({x,y,region});}
      const xbar=pts.reduce((s,p)=>s+p.x,0)/pts.length,ybar=pts.reduce((s,p)=>s+p.y,0)/pts.length; let num=0,den=0; pts.forEach(p=>{num+=(p.x-xbar)*(p.y-ybar);den+=(p.x-xbar)**2;});const bhat=num/den,ahat=ybar-bhat*xbar;let sse=0,sst=0;pts.forEach(p=>{sse+=(p.y-(ahat+bhat*p.x))**2;sst+=(p.y-ybar)**2;});const r2=Math.max(0,1-sse/sst);
      const w=canvas.width,h=canvas.height;ctx.clearRect(0,0,w,h);ctx.fillStyle='#fff';ctx.fillRect(0,0,w,h); const yMin=Math.min(...pts.map(p=>p.y),ahat)-1,yMax=Math.max(...pts.map(p=>p.y),ahat+bhat*10)+1; const px=x=>55+x/10*(w-80),py=y=>h-45-(y-yMin)/(yMax-yMin)*(h-85);
      ctx.strokeStyle='#b5c9d2';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(55,15);ctx.lineTo(55,h-45);ctx.lineTo(w-25,h-45);ctx.stroke();ctx.fillStyle='#6a7f8a';ctx.font='12px system-ui';ctx.fillText('x',w-18,h-31);ctx.fillText('y',38,18);
      pts.forEach(p=>{ctx.fillStyle=p.region?'rgba(185,80,70,.76)':'rgba(30,111,149,.74)';ctx.beginPath();ctx.arc(px(p.x),py(p.y),4.3,0,Math.PI*2);ctx.fill();});
      ctx.strokeStyle='#1f3340';ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(px(0),py(ahat));ctx.lineTo(px(10),py(ahat+bhat*10));ctx.stroke();
      if(non){ctx.fillStyle='#bb5046';ctx.font='12px system-ui';ctx.fillText('区域 B：较陡局部关系',w-185,27);ctx.fillStyle='#1e6f95';ctx.fillText('区域 A：较缓局部关系',w-185,44);}
      $('#regSlopeValue').textContent=b.toFixed(1);$('#regNoiseValue').textContent=eps.toFixed(1);$('#regSlopeFit').textContent=bhat.toFixed(2);$('#regInterceptFit').textContent=ahat.toFixed(2);$('#regR2').textContent=r2.toFixed(2);$('#regressionStatus').textContent=non?'局部机制不同：全局线是平均结果':'全局关系模拟';
    }
    [slope,noise,ns].forEach(el=>el.addEventListener('input',draw)); $('#regenerateRegression').addEventListener('click',draw); draw();
  }

  function mountProjectLab() {
    const themes={
      '生态环境':'区域热环境或生态质量的空间差异及其驱动机制',
      '公共服务':'公共服务资源的可达性、覆盖与公平性',
      '风险事件':'风险事件的空间热点、时间变化与影响因素',
      '土地利用':'土地利用/覆盖变化及其生态或社会效应'
    };
    function build(){ const theme=$('#projectTheme').value, scale=$('#projectScale').value,time=$('#projectTime').value,method=$('#projectMethod').value; const title=`基于${scale}的${theme}：${time}视角下的空间格局与机制研究`;
      $('#projectOutput').innerHTML=`<h4>${esc(title)}</h4><p><strong>Problem：</strong>识别${themes[theme]}在研究区中的差异，并回答这种差异是否具有空间/时间结构。</p><p><strong>Plan：</strong>以${scale}为分析单位，${time}，设置对照、尺度与验证方案；先定义指标方向、权重和预期机制。</p><p><strong>Data：</strong>建议整合基础边界、遥感/POI/统计数据与辅助环境数据，统一投影、时间与分辨率，并记录缺失和偏差。</p><p><strong>Analysis：</strong>以“${method}”为主线；同时输出描述图、统计检验、参数敏感性或独立验证。</p><p><strong>Conclusion：</strong>回答热点/差异在哪里、是否显著、可能机制是什么、可给出何种分区化建议，以及结论受哪些数据/尺度限制。</p>`; }
    $('#buildProject').addEventListener('click',build);
  }

  function mountClusterLab() {
    const canvas=$('#clusterCanvas');if(!canvas)return;const ctx=canvas.getContext('2d');const colors=['#1e6f95','#d26945','#3e9b69','#8759b0','#d59d2a'];let pts=[],centers=[],assign=[],iter=0;
    function buildPts(){pts=[];const groups=[{x:.25,y:.30},{x:.72,y:.30},{x:.50,y:.72},{x:.24,y:.78},{x:.78,y:.74}];groups.forEach((g,gi)=>{for(let i=0;i<20;i++){const a=Math.random()*Math.PI*2,r=Math.sqrt(Math.random())*.11;pts.push({x:g.x+Math.cos(a)*r,y:g.y+Math.sin(a)*r,base:gi});}});}
    function reset(){buildPts();const k=+$('#clusterK').value;centers=[];for(let i=0;i<k;i++){const p=pts[Math.floor(Math.random()*pts.length)];centers.push({x:p.x,y:p.y});}assign=Array(pts.length).fill(-1);iter=0;draw();update();}
    function step(){if(!centers.length)reset();let changed=false;assign=pts.map((p)=>{let best=0,bd=Infinity;centers.forEach((c,ci)=>{const d=(p.x-c.x)**2+(p.y-c.y)**2;if(d<bd){bd=d;best=ci;}});return best;});const newCenters=centers.map((c,ci)=>{const arr=pts.filter((_,i)=>assign[i]===ci);if(!arr.length)return c;return{x:arr.reduce((s,p)=>s+p.x,0)/arr.length,y:arr.reduce((s,p)=>s+p.y,0)/arr.length};});centers.forEach((c,i)=>{if(Math.hypot(c.x-newCenters[i].x,c.y-newCenters[i].y)>0.0005)changed=true;});centers=newCenters;iter++;draw();update(changed);return changed;}
    function calcSSE(){return pts.reduce((s,p,i)=>s+(p.x-centers[assign[i]]?.x||p.x)**2+(p.y-centers[assign[i]]?.y||p.y)**2,0);}
    function draw(){const w=canvas.width,h=canvas.height;ctx.clearRect(0,0,w,h);ctx.fillStyle='#fff';ctx.fillRect(0,0,w,h);ctx.strokeStyle='#d5e2e7';for(let i=1;i<5;i++){ctx.beginPath();ctx.moveTo(i*w/5,0);ctx.lineTo(i*w/5,h);ctx.stroke();ctx.beginPath();ctx.moveTo(0,i*h/5);ctx.lineTo(w,i*h/5);ctx.stroke();}pts.forEach((p,i)=>{const ci=assign[i];ctx.fillStyle=ci<0?'#90a4ae':colors[ci];ctx.beginPath();ctx.arc(p.x*w,p.y*h,4,0,Math.PI*2);ctx.fill();});centers.forEach((c,i)=>{ctx.strokeStyle=colors[i];ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(c.x*w-8,c.y*h);ctx.lineTo(c.x*w+8,c.y*h);ctx.moveTo(c.x*w,c.y*h-8);ctx.lineTo(c.x*w,c.y*h+8);ctx.stroke();});}
    function update(changed){$('#clusterKValue').textContent=$('#clusterK').value;$('#clusterIteration').textContent=iter;$('#clusterSSE').textContent=centers.length&&assign.some(a=>a>=0)?calcSSE().toFixed(3):'—';const st=!centers.length?'待初始化':changed===false&&iter>0?'已接近稳定':'迭代中';$('#clusterState').textContent=st;$('#clusterStatus').textContent=st;}
    $('#clusterReset').addEventListener('click',reset);$('#clusterStep').addEventListener('click',step);$('#clusterK').addEventListener('input',()=>{$('#clusterKValue').textContent=$('#clusterK').value;});$('#clusterRun').addEventListener('click',()=>{let c=0;function go(){const moved=step();c++;if(moved&&c<25)setTimeout(go,260);}go();}); reset();
  }

  function mountForestLab(){
    function calc(){const ndvi=+$('#rfNDVI').value,ndwi=+$('#rfNDWI').value,tex=+$('#rfTexture').value;const rules=[
      {name:'树 1',rule:'若 NDWI > 0.20 → 水体；否则若 NDVI > 0.45 → 植被；否则建成区',vote:ndwi>.2?'水体':ndvi>.45?'植被':'建成区'},
      {name:'树 2',rule:'若 NDVI > 0.55 → 植被；否则若 NDWI > 0.12 → 水体；否则建成区',vote:ndvi>.55?'植被':ndwi>.12?'水体':'建成区'},
      {name:'树 3',rule:'若 NDWI > 0.08 且 NDVI < 0.25 → 水体；否则若纹理 < 0.38 → 植被；否则建成区',vote:ndwi>.08&&ndvi<.25?'水体':tex<.38?'植被':'建成区'},
      {name:'树 4',rule:'若 NDVI > 0.35 且纹理 < 0.65 → 植被；否则若 NDWI > 0.25 → 水体；否则建成区',vote:ndvi>.35&&tex<.65?'植被':ndwi>.25?'水体':'建成区'},
      {name:'树 5',rule:'若纹理 > 0.62 → 建成区；否则若 NDVI > 0.40 → 植被；否则水体',vote:tex>.62?'建成区':ndvi>.4?'植被':'水体'}
    ];const counts={水体:0,植被:0,建成区:0};rules.forEach(r=>counts[r.vote]++);const final=Object.entries(counts).sort((a,b)=>b[1]-a[1])[0][0];const cls=final==='水体'?'vote-water':final==='植被'?'vote-veg':'vote-built';$('#forestTrees').innerHTML=rules.map(r=>`<article class="tree-card"><h4>${r.name}</h4><p>${esc(r.rule)}</p><span class="tree-vote ${r.vote==='水体'?'vote-water':r.vote==='植被'?'vote-veg':'vote-built'}">投票：${r.vote}</span></article>`).join('');$('#forestFinal').textContent=`最终：${final}（${counts[final]} / 5 票）`;$('#forestFinal').className=`status-pill ${cls}`;$('#rfNDVIValue').textContent=ndvi.toFixed(2);$('#rfNDWIValue').textContent=ndwi.toFixed(2);$('#rfTextureValue').textContent=tex.toFixed(2);}
    ['#rfNDVI','#rfNDWI','#rfTexture'].forEach(s=>$(s).addEventListener('input',calc));$('#forestVote').addEventListener('click',calc);calc();
  }

  function mountSpacetimeLab(){const canvas=$('#spaceTimeCanvas');if(!canvas)return;const ctx=canvas.getContext('2d');const slider=$('#stFrame');let timer=null;function draw(){const f=+slider.value;const w=canvas.width,h=canvas.height,cell=Math.min(w/4,(h-60)/4),ox=(w-4*cell)/2,oy=18;ctx.clearRect(0,0,w,h);ctx.fillStyle='#fff';ctx.fillRect(0,0,w,h);for(let r=0;r<4;r++)for(let c=0;c<4;c++){const dist=Math.hypot(r-1.5,c-1.5);const v=Math.max(0,Math.round(1+(f-1)*1.1-dist*1.2+(Math.random()-.5)*.3));const t=Math.min(1,v/9);ctx.fillStyle=`rgb(${Math.round(244*t+242*(1-t))},${Math.round(89*t+217*(1-t))},${Math.round(73*t+237*(1-t))})`;ctx.fillRect(ox+c*cell,oy+r*cell,cell-3,cell-3);ctx.fillStyle=t>.55?'#fff':'#3c6070';ctx.font='bold 17px system-ui';ctx.textAlign='center';ctx.fillText(v,ox+c*cell+cell/2,oy+r*cell+cell/2+6);if(r===1&&c===1){$('#stCenterValue').textContent=v;}}
      const label=f<=2?'尚未显著 / 背景期':f<=4?'可能的新出现热点':f<=6?'持续热点': '强化热点（概念演示）';$('#spaceTimeLabel').textContent=label;$('#stNarrative').textContent=label;$('#stFrameValue').textContent=f;ctx.textAlign='left';ctx.fillStyle='#637985';ctx.font='13px system-ui';ctx.fillText(`时间步 ${f}：颜色越红表示该时空 bin 的事件强度越高。`,12,h-18);}
    function stop(){if(timer){clearInterval(timer);timer=null;$('#stPlay').textContent='播放变化';}}
    slider.addEventListener('input',()=>{stop();draw();});$('#stReset').addEventListener('click',()=>{stop();slider.value=1;draw();});$('#stPlay').addEventListener('click',()=>{if(timer){stop();return;}$('#stPlay').textContent='暂停播放';timer=setInterval(()=>{let n=+slider.value+1;if(n>8)n=1;slider.value=n;draw();},650);});draw();}

  function mountCnnLab(){const input=[[0,0,0,0,0],[0,0,1,1,1],[0,0,1,1,1],[0,0,1,1,1],[0,0,0,0,0]];const kernels={edgeX:[[ -1,0,1],[-2,0,2],[-1,0,1]],edgeY:[[-1,-2,-1],[0,0,0],[1,2,1]],sharpen:[[0,-1,0],[-1,5,-1],[0,-1,0]]};function renderGrid(el,data){const rows=data.length,cols=data[0].length;el.style.gridTemplateColumns=`repeat(${cols},1fr)`;const vals=data.flat();const mx=Math.max(...vals.map(v=>Math.abs(v)),1);el.innerHTML=data.map(row=>row.map(v=>{const t=Math.min(1,Math.abs(v)/mx);const bg=v>=0?`rgba(42,123,165,${.15+.75*t})`:`rgba(207,85,64,${.15+.75*t})`;return `<span class="matrix-cell" style="background:${bg};color:${t>.52?'white':'#22404f'}">${Number.isInteger(v)?v:v.toFixed(1)}</span>`;}).join('')).join('');}function apply(){const k=kernels[$('#cnnKernel').value],out=[];for(let r=0;r<3;r++){out[r]=[];for(let c=0;c<3;c++){let s=0;for(let kr=0;kr<3;kr++)for(let kc=0;kc<3;kc++)s+=input[r+kr][c+kc]*k[kr][kc];out[r][c]=s;}}renderGrid($('#cnnInput'),input);renderGrid($('#cnnOutput'),out);$('#cnnKernelDisplay').textContent=k.map(row=>row.map(v=>String(v).padStart(2,' ')).join(' ')).join('\n');$('#cnnStatus').textContent=$('#cnnKernel').selectedOptions[0].textContent;}
    $('#cnnKernel').addEventListener('change',apply);$('#cnnApply').addEventListener('click',apply);apply();}

  function mountBigDataLab(){function render(){const n=+$('#workerCount').value;$('#workerCountValue').textContent=n;$('#taskWaves').textContent=Math.ceil(32/n);$('#taskEstimate').textContent=`约 ${Math.ceil(32/n)} 波 + 汇总`;$('#workerGrid').innerHTML=Array.from({length:8},(_,i)=>`<div class="worker ${i<n?'is-working':''}">W${i+1}</div>`).join('');$('#taskGrid').innerHTML=Array.from({length:32},(_,i)=>`<div class="worker" data-task="${i}">T${i+1}</div>`).join('');$('#bigDataStatus').textContent=`${n} 个 worker 就绪`;}
    $('#workerCount').addEventListener('input',render);$('#runBigData').addEventListener('click',()=>{const n=+$('#workerCount').value;const tasks=[...$('#taskGrid').children];let i=0;$('#bigDataStatus').textContent='正在分发 / 汇总…';const timer=setInterval(()=>{for(let w=0;w<n&&i<tasks.length;w++,i++){tasks[i].classList.add('is-working');tasks[i].textContent='完成';}if(i>=tasks.length){clearInterval(timer);$('#bigDataStatus').textContent='完成：仍需进行结果合并与质量检查';}},110);});render();}

  function mountSuperresLab(){const lr=$('#lrCanvas'),sr=$('#srCanvas');function base(){const a=[];for(let r=0;r<11;r++){a[r]=[];for(let c=0;c<11;c++){const road=(c>4&&c<7)||(r>5&&r<8&&c<8);const water=r<4&&c>6;a[r][c]=water?2:road?1:0;}}return a;}function drawLR(){const c=lr.getContext('2d'),a=base(),s=20;c.clearRect(0,0,220,220);a.forEach((row,r)=>row.forEach((v,col)=>{c.fillStyle=v===2?'#75badd':v===1?'#596978':'#d9e7d2';c.fillRect(col*s,r*s,s-1,s-1);}));}function drawSR(){const method=$('#srMethod').value,c=sr.getContext('2d'),a=base(),size=220;c.clearRect(0,0,size,size);if(method==='nearest'){const s=20;a.forEach((row,r)=>row.forEach((v,col)=>{c.fillStyle=v===2?'#75badd':v===1?'#596978':'#d9e7d2';c.fillRect(col*s,r*s,s,s);}));$('#srTitle').textContent='最近邻插值：块状';$('#srSpatial').textContent='不增加真实细节';}else if(method==='bilinear'){const off=document.createElement('canvas');off.width=11;off.height=11;const oc=off.getContext('2d');a.forEach((row,r)=>row.forEach((v,col)=>{oc.fillStyle=v===2?'#75badd':v===1?'#596978':'#d9e7d2';oc.fillRect(col,r,1,1);}));c.imageSmoothingEnabled=true;c.drawImage(off,0,0,11,11,0,0,size,size);$('#srTitle').textContent='平滑插值：过渡更柔和';$('#srSpatial').textContent='边界可能更模糊';}else{const s=20;a.forEach((row,r)=>row.forEach((v,col)=>{c.fillStyle=v===2?'#75badd':v===1?'#465763':'#d3e4ca';c.fillRect(col*s,r*s,s,s);}));c.strokeStyle='#eef9ff';c.lineWidth=2; c.strokeRect(5*20,0,2*20,220);c.strokeRect(0,6*20,8*20,2*20);$('#srTitle').textContent='边缘保持式概念图';$('#srSpatial').textContent='更锐利，但须验证真实性';}$('#superResStatus').textContent=$('#srMethod').selectedOptions[0].textContent;}
    $('#srMethod').addEventListener('change',drawSR);$('#srRender').addEventListener('click',drawSR);drawLR();drawSR();}

  function renderPatternLab() {
    const modes = (enhance(current()).labModes || []);
    const firstMode = modes[0] || {
      id: 'quadrat',
      title: '样方计数',
      why: '把研究区切成同面积网格，用每格点数的均值与方差判断点模式是否偏离完全空间随机。',
      read: 'VMR 大于 1 倾向聚集，小于 1 倾向规则；但结论会受样方大小影响。'
    };
    const modeButtons = modes.map((mode, index) => `
      <button type="button" class="${index === 0 ? 'is-active' : ''}" data-pattern-mode="${esc(mode.id)}">
        ${esc(mode.title)}
      </button>`).join('');

    return `${labIntro(
      'Lect.4 空间模式综合实验室',
      '同一批点可以从样方、点密度、核密度、最近邻、Ripley K 和蒙特卡洛六个角度观察。这里重点不是“看起来像什么”，而是练习：先设定随机参照，再用统计量判断偏离是否足够大。',
      '建议先在“公式”页读完假设检验入门，再回到这里操作。点击小段说明右侧的“放大阅读”可以展开成大字号说明。'
    )}
      <div class="lab-card deep-lab-card pattern-lab">
        <input id="patternLabMode" type="hidden" value="${esc(firstMode.id)}" />
        <div class="lab-title-row pattern-title-row">
          <h3>点模式工具箱</h3>
          <span id="patternStatus" class="status-pill">等待计算</span>
        </div>
        <div class="mode-tabs" role="tablist" aria-label="Lect.4 空间模式实验模式">
          ${modeButtons}
        </div>
        <div class="lab-grid pattern-lab-grid">
          <div class="canvas-wrap pattern-canvas-wrap">
            <canvas id="patternCanvas" width="820" height="500"></canvas>
          </div>
          <div class="lab-controls">
            <div class="control-group">
              <label for="patternPointMode">点过程</label>
              <select id="patternPointMode">
                <option value="random">完全空间随机 CSR</option>
                <option value="cluster">聚集：热点中心吸引点</option>
                <option value="regular">规则：点之间保持间隔</option>
              </select>
            </div>
            <div class="control-group">
              <label for="patternBandwidth">搜索半径 / 带宽：<span id="patternBandwidthValue">0.18</span></label>
              <input id="patternBandwidth" type="range" min="0.08" max="0.36" step="0.01" value="0.18" />
            </div>
            <div class="control-group">
              <label for="patternGrid">样方网格：<span id="patternGridValue">6 × 6</span></label>
              <input id="patternGrid" type="range" min="3" max="12" value="6" />
            </div>
            <button class="control-button" id="patternRegenerate" type="button">重新生成点</button>
            <button class="control-button ghost-control" id="patternSimulate" type="button">运行蒙特卡洛</button>
            <div class="metric-list pattern-metrics">
              <div class="metric"><span id="patternMetricALabel">统计量 A</span><strong id="patternMetricA">-</strong></div>
              <div class="metric"><span id="patternMetricBLabel">统计量 B</span><strong id="patternMetricB">-</strong></div>
              <div class="metric"><span id="patternMetricCLabel">统计量 C</span><strong id="patternMetricC">-</strong></div>
              <div class="metric"><span id="patternMetricDLabel">判断</span><strong id="patternMetricD">-</strong></div>
            </div>
          </div>
        </div>
        <article class="lab-mode-note zh-prose">
          <div>
            <p class="eyebrow">当前工具</p>
            <h4 id="patternModeTitle">${esc(firstMode.title)}</h4>
          </div>
          <button type="button" class="study-open" id="patternModeStudy" data-study-open data-study-title="${esc(firstMode.title)}" data-study-body="${esc(studyText([firstMode.why, firstMode.read]))}">放大阅读</button>
          <p id="patternModeWhy">${esc(firstMode.why)}</p>
          <p id="patternModeRead">${esc(firstMode.read)}</p>
        </article>
      </div>`;
  }

  function mountPatternLab() {
    const canvas = $('#patternCanvas'); if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const pointMode = $('#patternPointMode');
    const gridInput = $('#patternGrid');
    const bandwidthInput = $('#patternBandwidth');
    const hiddenMode = $('#patternLabMode');
    const modeButtons = [...document.querySelectorAll('[data-pattern-mode]')];
    const modes = (enhance({ id: 'L04' }).labModes || []);
    let activeMode = hiddenMode?.value || 'quadrat';
    let points = [];
    let simulations = [];

    const clamp = (value, min = 0.025, max = 0.975) => Math.max(min, Math.min(max, value));
    const rand = (min, max) => min + Math.random() * (max - min);
    const pt = (x, y) => ({ x: clamp(x), y: clamp(y) });
    const fmt = (value, digits = 2) => Number.isFinite(value) ? value.toFixed(digits) : '-';

    function setMetric(labels, values, status) {
      ['A', 'B', 'C', 'D'].forEach((key, index) => {
        $(`#patternMetric${key}Label`).textContent = labels[index] || '';
        $(`#patternMetric${key}`).textContent = values[index] || '-';
      });
      $('#patternStatus').textContent = status;
    }

    function generatePointSet(kind = pointMode.value, n = 90) {
      const result = [];
      if (kind === 'cluster') {
        const centers = [{ x: .27, y: .30 }, { x: .72, y: .35 }, { x: .55, y: .72 }];
        for (let i = 0; i < n; i++) {
          const c = centers[i % centers.length];
          const spread = (Math.random() + Math.random() + Math.random() - 1.5) * .13;
          const angle = Math.random() * Math.PI * 2;
          result.push(pt(c.x + Math.cos(angle) * Math.abs(spread), c.y + Math.sin(angle) * Math.abs(spread)));
        }
      } else if (kind === 'regular') {
        const cols = 10, rows = 9;
        for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
          result.push(pt(.07 + c * .095 + rand(-.015, .015), .09 + r * .095 + rand(-.015, .015)));
        }
      } else {
        for (let i = 0; i < n; i++) result.push(pt(rand(.04, .96), rand(.05, .95)));
      }
      return result;
    }

    function regenerate() {
      points = generatePointSet();
      simulations = [];
      draw();
    }

    function plot(p, w, h, pad = 28) {
      return [pad + p.x * (w - pad * 2), pad + p.y * (h - pad * 2)];
    }

    function drawFrame() {
      const w = canvas.width, h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#fbfdfe';
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = '#d8e5eb';
      ctx.lineWidth = 1;
      ctx.strokeRect(24, 24, w - 48, h - 48);
      return { w, h, pad: 28 };
    }

    function drawPoints(radius = 4.2, color = '#17384a') {
      const { w, h } = canvas;
      ctx.fillStyle = color;
      points.forEach((point) => {
        const [x, y] = plot(point, w, h);
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    function quadratCounts(list = points, g = +gridInput.value) {
      const counts = Array(g * g).fill(0);
      list.forEach((point) => {
        const col = Math.min(g - 1, Math.floor(point.x * g));
        const row = Math.min(g - 1, Math.floor(point.y * g));
        counts[row * g + col]++;
      });
      const mean = list.length / counts.length;
      const variance = counts.reduce((sum, value) => sum + (value - mean) ** 2, 0) / Math.max(1, counts.length - 1);
      return { counts, mean, variance, vmr: variance / mean };
    }

    function drawQuadrat() {
      const { w, h, pad } = drawFrame();
      const g = +gridInput.value;
      const { counts, mean, variance, vmr } = quadratCounts(points, g);
      const cellW = (w - pad * 2) / g;
      const cellH = (h - pad * 2) / g;
      const maxCount = Math.max(...counts, 1);
      for (let i = 0; i <= g; i++) {
        ctx.strokeStyle = '#c7dce4';
        ctx.beginPath();
        ctx.moveTo(pad + i * cellW, pad);
        ctx.lineTo(pad + i * cellW, h - pad);
        ctx.moveTo(pad, pad + i * cellH);
        ctx.lineTo(w - pad, pad + i * cellH);
        ctx.stroke();
      }
      counts.forEach((count, index) => {
        const col = index % g, row = Math.floor(index / g);
        if (count) {
          const alpha = .08 + .32 * (count / maxCount);
          ctx.fillStyle = `rgba(30,111,149,${alpha})`;
          ctx.fillRect(pad + col * cellW, pad + row * cellH, cellW, cellH);
          ctx.fillStyle = '#496779';
          ctx.font = '12px system-ui';
          ctx.fillText(String(count), pad + col * cellW + 5, pad + row * cellH + 15);
        }
      });
      drawPoints();
      const chi = (g * g - 1) * vmr;
      const label = vmr > 1.25 ? '方差偏大：倾向聚集' : vmr < .80 ? '方差偏小：倾向规则' : '接近随机';
      setMetric(
        ['每格均值', '样本方差', 'VMR = s² / x̄', 'χ² 近似'],
        [fmt(mean), fmt(variance), fmt(vmr), fmt(chi)],
        label
      );
    }

    function densityValue(x, y, kernel) {
      const h = +bandwidthInput.value;
      let value = 0;
      points.forEach((point) => {
        const d = Math.hypot(point.x - x, point.y - y);
        if (d <= h) {
          if (kernel === 'point') value += 1;
          else value += (1 - (d * d) / (h * h)) ** 2;
        }
      });
      return value / (Math.PI * h * h);
    }

    function fillDensity(kind) {
      const { w, h, pad } = drawFrame();
      const cols = 58, rows = 35;
      const values = [];
      let maxValue = 0;
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        const x = (c + .5) / cols;
        const y = (r + .5) / rows;
        const value = densityValue(x, y, kind);
        values.push(value);
        maxValue = Math.max(maxValue, value);
      }
      const cellW = (w - pad * 2) / cols;
      const cellH = (h - pad * 2) / rows;
      values.forEach((value, index) => {
        const col = index % cols, row = Math.floor(index / cols);
        const t = maxValue ? value / maxValue : 0;
        const red = Math.round(252 * t + 232 * (1 - t));
        const green = Math.round(111 * t + 244 * (1 - t));
        const blue = Math.round(78 * t + 247 * (1 - t));
        ctx.fillStyle = `rgb(${red},${green},${blue})`;
        ctx.fillRect(pad + col * cellW, pad + row * cellH, cellW + .4, cellH + .4);
      });
      drawPoints(3.6, 'rgba(17,45,60,.86)');
      return maxValue;
    }

    function drawPointDensity() {
      const maxValue = fillDensity('point');
      const h = +bandwidthInput.value;
      setMetric(
        ['搜索半径 h', '最高点密度', '计算逻辑', '读图重点'],
        [fmt(h), fmt(maxValue, 1), '圆内计数 / 面积', '高值是否连片'],
        '点密度：硬边界计数'
      );
    }

    function drawKernelDensity() {
      const maxValue = fillDensity('kernel');
      const h = +bandwidthInput.value;
      setMetric(
        ['带宽 h', '最高核密度', '核函数', '读图重点'],
        [fmt(h), fmt(maxValue, 1), 'biweight 衰减', '平滑热点范围'],
        '核密度：距离衰减加权'
      );
    }

    function nearestStats() {
      const nearest = points.map((point, i) => {
        let best = Infinity, bestIndex = -1;
        points.forEach((other, j) => {
          if (i === j) return;
          const d = Math.hypot(point.x - other.x, point.y - other.y);
          if (d < best) { best = d; bestIndex = j; }
        });
        return { distance: best, index: bestIndex };
      });
      const observed = nearest.reduce((sum, item) => sum + item.distance, 0) / nearest.length;
      const expected = 1 / (2 * Math.sqrt(points.length));
      const se = 0.26136 / points.length;
      const z = (observed - expected) / se;
      return { nearest, observed, expected, se, z, ratio: observed / expected };
    }

    function drawANN() {
      const { w, h } = drawFrame();
      const stats = nearestStats();
      ctx.strokeStyle = 'rgba(210,105,69,.32)';
      ctx.lineWidth = 1.4;
      stats.nearest.forEach((item, index) => {
        const a = plot(points[index], w, h);
        const b = plot(points[item.index], w, h);
        ctx.beginPath();
        ctx.moveTo(a[0], a[1]);
        ctx.lineTo(b[0], b[1]);
        ctx.stroke();
      });
      drawPoints(4, '#17384a');
      const direction = stats.z < -1.96 ? '显著聚集' : stats.z > 1.96 ? '显著规则' : '未显著偏离 CSR';
      setMetric(
        ['观测平均距离', 'CSR 期望距离', 'z 值', 'R = 观测 / 期望'],
        [fmt(stats.observed, 3), fmt(stats.expected, 3), fmt(stats.z, 2), fmt(stats.ratio, 2)],
        `最近邻：${direction}`
      );
    }

    function ripleyValues(list = points) {
      const n = list.length;
      return Array.from({ length: 22 }, (_, i) => {
        const d = .035 + i * .014;
        let orderedPairs = 0;
        for (let a = 0; a < n; a++) for (let b = 0; b < n; b++) {
          if (a !== b && Math.hypot(list[a].x - list[b].x, list[a].y - list[b].y) <= d) orderedPairs++;
        }
        const k = orderedPairs / (n * (n - 1));
        return { d, l: Math.sqrt(k / Math.PI) - d };
      });
    }

    function drawRipley() {
      const { w, h } = drawFrame();
      const values = ripleyValues();
      const left = 72, right = w - 42, top = 48, bottom = h - 60;
      const minY = Math.min(-.08, ...values.map(v => v.l));
      const maxY = Math.max(.08, ...values.map(v => v.l));
      const xScale = (d) => left + (d - values[0].d) / (values.at(-1).d - values[0].d) * (right - left);
      const yScale = (value) => bottom - (value - minY) / (maxY - minY) * (bottom - top);
      ctx.strokeStyle = '#c9d9df';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(left, yScale(0));
      ctx.lineTo(right, yScale(0));
      ctx.moveTo(left, top);
      ctx.lineTo(left, bottom);
      ctx.lineTo(right, bottom);
      ctx.stroke();
      ctx.strokeStyle = '#1e6f95';
      ctx.lineWidth = 3;
      ctx.beginPath();
      values.forEach((item, index) => {
        const x = xScale(item.d), y = yScale(item.l);
        if (index === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.fillStyle = '#315768';
      ctx.font = '13px system-ui';
      ctx.fillText('L(d) > 0：该距离尺度邻居偏多', left, 28);
      ctx.fillText('距离 d', right - 42, bottom + 34);
      ctx.fillText('0', left - 20, yScale(0) + 4);
      const peak = values.reduce((best, item) => item.l > best.l ? item : best, values[0]);
      const trough = values.reduce((best, item) => item.l < best.l ? item : best, values[0]);
      setMetric(
        ['最大 L(d)', '出现距离 d', '最小 L(d)', '读图重点'],
        [fmt(peak.l, 3), fmt(peak.d, 3), fmt(trough.l, 3), '看尺度而非单值'],
        peak.l > .02 ? 'Ripley K：多尺度聚集' : 'Ripley K：接近 CSR'
      );
    }

    function runMonteCarlo(iterations = 199, redraw = true) {
      const g = +gridInput.value;
      simulations = Array.from({ length: iterations }, () => quadratCounts(generatePointSet('random', points.length), g).vmr);
      if (redraw) draw();
    }

    function drawMonteCarlo() {
      if (!simulations.length) runMonteCarlo(199, false);
      const { w, h } = drawFrame();
      const observed = quadratCounts(points, +gridInput.value).vmr;
      const maxValue = Math.max(observed, ...simulations, 2.5);
      const bins = 18;
      const counts = Array(bins).fill(0);
      simulations.forEach((value) => {
        const index = Math.min(bins - 1, Math.floor(value / maxValue * bins));
        counts[index]++;
      });
      const left = 58, right = w - 36, bottom = h - 58, top = 46;
      const barW = (right - left) / bins;
      const maxCount = Math.max(...counts, 1);
      counts.forEach((count, index) => {
        const barH = (bottom - top) * count / maxCount;
        ctx.fillStyle = '#9bc7d8';
        ctx.fillRect(left + index * barW + 2, bottom - barH, Math.max(3, barW - 4), barH);
      });
      const obsX = left + observed / maxValue * (right - left);
      ctx.strokeStyle = '#d05d48';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(obsX, top - 5);
      ctx.lineTo(obsX, bottom);
      ctx.stroke();
      ctx.fillStyle = '#315768';
      ctx.font = '13px system-ui';
      ctx.fillText('随机 CSR 模拟得到的 VMR 分布', left, 28);
      ctx.fillStyle = '#d05d48';
      ctx.fillText('观测 VMR', Math.min(obsX + 8, right - 78), top + 13);
      const tail = simulations.filter((value) => value >= observed).length;
      const p = (tail + 1) / (simulations.length + 1);
      setMetric(
        ['观测 VMR', '模拟次数', '右尾 p 值', '判断'],
        [fmt(observed), String(simulations.length), fmt(p, 3), p < .05 ? '拒绝 CSR' : '不能拒绝 CSR'],
        '蒙特卡洛：用随机参照判断'
      );
    }

    function updateModeNote() {
      const mode = modes.find((item) => item.id === activeMode);
      if (!mode) return;
      $('#patternModeTitle').textContent = mode.title;
      $('#patternModeWhy').textContent = mode.why;
      $('#patternModeRead').textContent = mode.read;
      const study = $('#patternModeStudy');
      study.dataset.studyTitle = mode.title;
      study.dataset.studyBody = studyText([mode.why, mode.read]);
    }

    function setMode(modeId) {
      activeMode = modeId;
      if (hiddenMode) hiddenMode.value = modeId;
      modeButtons.forEach((button) => button.classList.toggle('is-active', button.dataset.patternMode === modeId));
      updateModeNote();
      draw();
    }

    function draw() {
      $('#patternBandwidthValue').textContent = (+bandwidthInput.value).toFixed(2);
      $('#patternGridValue').textContent = `${gridInput.value} × ${gridInput.value}`;
      if (activeMode !== 'monte-carlo') simulations = [];
      if (activeMode === 'quadrat') drawQuadrat();
      else if (activeMode === 'point-density') drawPointDensity();
      else if (activeMode === 'kernel-density') drawKernelDensity();
      else if (activeMode === 'ann') drawANN();
      else if (activeMode === 'ripley-k') drawRipley();
      else drawMonteCarlo();
    }

    modeButtons.forEach((button) => button.addEventListener('click', () => setMode(button.dataset.patternMode)));
    pointMode.addEventListener('change', regenerate);
    gridInput.addEventListener('input', draw);
    bandwidthInput.addEventListener('input', draw);
    $('#patternRegenerate').addEventListener('click', regenerate);
    $('#patternSimulate').addEventListener('click', () => {
      if (activeMode !== 'monte-carlo') setMode('monte-carlo');
      runMonteCarlo(199);
    });
    regenerate();
  }

  function mountLab(name) {
    ({ pattern: mountPatternLab, moran: mountMoranLab, regression: mountRegressionLab, project: mountProjectLab, cluster: mountClusterLab, forest: mountForestLab, spacetime: mountSpacetimeLab, cnn: mountCnnLab, bigdata: mountBigDataLab, superres: mountSuperresLab }[name] || (()=>{}))();
  }

  function handleQuiz(qi, oi) {
    const l=current(), q=fullQuiz(l)[qi]; if(!q) return; const question=document.querySelector(`.question[data-quiz="${qi}"]`);question.querySelectorAll('.option').forEach(btn=>{const idx=+btn.dataset.option;btn.classList.remove('is-correct','is-wrong');if(idx===q.answer)btn.classList.add('is-correct');else if(idx===oi)btn.classList.add('is-wrong');btn.disabled=true;}); const note=$(`#answer-${qi}`);note.textContent=`${oi===q.answer?'回答正确。':'需要纠正。'} ${q.why}`;note.classList.add('is-show');
  }

  function initEvents() {
    document.addEventListener('click', (e) => {
      const nav=e.target.closest('[data-nav-id]'); if(nav){changeLecture(nav.dataset.navId);return;}
      const tab=e.target.closest('[data-tab]'); if(tab){state.tab=tab.dataset.tab;renderTab();return;}
      const sec=e.target.closest('[data-section-key]'); if(sec){markSection(sec.dataset.sectionKey,sec.dataset.sectionDone!=='1');return;}
      const slide=e.target.closest('[data-slide-src]'); if(slide){openSlide(slide.dataset.slideSrc,slide.dataset.slideCaption);return;}
      const opt=e.target.closest('[data-quiz-option]'); if(opt){handleQuiz(+opt.dataset.quizOption,+opt.dataset.option);return;}
      const calc=e.target.closest('[data-check-calc]'); if(calc){handleCalc(+calc.dataset.checkCalc);return;}
      const visual=e.target.closest('[data-open-visual]'); if(visual){openVisualModal(visual.dataset.openVisual);return;}
      const study=e.target.closest('[data-study-open]'); if(study){openStudyModal(study.dataset.studyTitle, study.dataset.studyBody);return;}
      if(e.target.id==='saveNote'){const l=current();const map=notes();map[l.id]=$('#noteEditor').value;safeSet(notesKey,map);$('#noteStatus').textContent='已保存到此浏览器。';return;}
    });
    $('#markLectureDone').addEventListener('click',()=>{const l=current(),map=done();l.sections.forEach((_,i)=>map[sectionKey(l.id,i)]=true);safeSet(doneKey,map);renderAll();});
    $('#modalClose').addEventListener('click',()=>$('#slideModal').close());
    $('#slideModal').addEventListener('click',e=>{if(e.target.id==='slideModal')$('#slideModal').close();});
    $('#studyModalClose').addEventListener('click',()=>$('#studyModal').close());
    $('#studyModal').addEventListener('click',e=>{if(e.target.id==='studyModal')$('#studyModal').close();});
    $('#visualModalClose').addEventListener('click',()=>$('#visualModal').close());
    $('#visualModal').addEventListener('click',e=>{if(e.target.id==='visualModal')$('#visualModal').close();});
    $('#showRoadmap').addEventListener('click',()=>{$('#roadmapModal').hidden=false;document.body.style.overflow='hidden';});
    $('#roadmapClose').addEventListener('click',()=>{$('#roadmapModal').hidden=true;document.body.style.overflow='';});
    $('#roadmapModal').addEventListener('click',e=>{if(e.target.id==='roadmapModal'){$('#roadmapModal').hidden=true;document.body.style.overflow='';}});
    $('#globalSearch').addEventListener('input',search);
  }

  function openSlide(src,caption){const modal=$('#slideModal');$('#modalImage').src=src;$('#modalCaption').textContent=caption;modal.showModal();}

  function openStudyModal(title, body) {
    const modal = $('#studyModal');
    $('#studyModalTitle').textContent = title || '放大阅读';
    $('#studyModalBody').innerHTML = String(body || '')
      .split(/\n{2,}/)
      .filter(Boolean)
      .map(part => `<p>${renderRichText(part).replace(/\n/g, '<br>')}</p>`)
      .join('');
    modal.showModal();
    renderMathBlocks(modal);
  }

  function openVisualModal(type) {
    const modal = $('#visualModal');
    const title = type === 'kernel-family' ? '核函数图像：距离权重如何衰减' : '函数图像演示';
    $('#visualModalTitle').textContent = title;
    $('#visualModalBody').innerHTML = type === 'kernel-family' ? renderKernelFamilyVisual() : '<p>这个图像暂未配置单独演示。</p>';
    modal.showModal();
    mountFormulaVisuals(modal);
    renderMathBlocks(modal);
  }

  function search(e){const q=e.target.value.trim().toLowerCase();const box=$('#searchResults');if(!q){box.innerHTML='';return;}const res=[];LECTURES.forEach(l=>{const hay=(l.title+' '+l.en+' '+l.intro+' '+l.route.join(' ')+' '+l.sections.map(s=>s.title+' '+strip(s.core)+' '+s.details.join(' ')).join(' ')).toLowerCase();if(hay.includes(q)){const match=l.sections.find(s=>(s.title+' '+strip(s.core)+' '+s.details.join(' ')).toLowerCase().includes(q));res.push({id:l.id,title:`${l.number} · ${l.title}`,text:match?match.title:l.intro});}});box.innerHTML=res.slice(0,8).map(r=>`<button class="search-result" type="button" data-nav-id="${r.id}"><strong>${esc(r.title)}</strong>${esc(r.text)}</button>`).join('')||'<div style="padding:7px;color:#a6c1ce;font-size:12px">没有匹配到。可试试英文术语或更短关键词。</div>';}

  if (window.__COURSE_TEST_MODE__) {
    window.__COURSE_TEST_HOOKS__ = {
      renderRichText,
      normalizeLatexFragment,
    };
    return;
  }

  function renderRoadmap(){const items=[
    ['Lect.4','空间模式','先回答“对象在哪里、聚集还是离散”。'],['Lect.5','空间相关','再回答“邻居是否相似、热点在哪里”。'],['Lect.6','回归解释','用模型解释 y 与多种因素的条件关系。'],['Lect.7','项目整合','用 PPDAC 组织问题、数据、方法和表达。'],['Lect.8','聚类分区','发现相似群体与连片区域。'],['Lect.9','机器学习','从训练样本学习分类规则并验证泛化。'],['Lect.10','时空过程','同时追踪位置与时间，理解变化和热点演进。'],['Lect.11','深度遥感','用 CNN 等网络处理检测与像素级任务。'],['Lect.12','大数据','处理海量、多源、快速变化的地理信息。'],['Lect.13','超分辨率','增强空间表达，同时约束并验证真实性。']
  ];$('#roadmapSteps').innerHTML=items.map((x,i)=>`<article class="roadmap-step"><span class="step-no">${x[0]}</span><strong>${x[1]}</strong><p>${x[2]}</p></article>`).join('');}

  renderRoadmap(); initEvents(); renderAll();
})();
