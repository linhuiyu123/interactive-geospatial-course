import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const dataSource = readFileSync(new URL('../data.js', import.meta.url), 'utf8');
const enhancementSource = readFileSync(new URL('../enhancements.js', import.meta.url), 'utf8');
const formulaSource = readFileSync(new URL('../formula-upgrades.js', import.meta.url), 'utf8');
const appSource = readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const stylesSource = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(`${dataSource}\nwindow.LECTURES = LECTURES;`, sandbox, { filename: 'data.js' });
vm.runInContext(enhancementSource, sandbox, { filename: 'enhancements.js' });
vm.runInContext(formulaSource, sandbox, { filename: 'formula-upgrades.js' });

const lectures = sandbox.window.LECTURES;
const enhancements = sandbox.window.COURSE_ENHANCEMENTS;
const lectureIds = lectures.map((lecture) => lecture.id);

const advancedPattern = /检验|假设|显著|p\s*值|p-value|z[-\s]?score|z\s*=|t\s*=|F\s*=|χ|蠂|卡方|置信|标准误|自由度|临界值|置换|Mann|Kendall|F1|Recall|Precision|PSNR|SSIM|RMSE|均方|误差矩阵|SE/iu;
const formulaPattern = /=|Σ|∑|危|χ|蠂|β|SE|SD|MSE|RMSE|PSNR|F1|Precision|Recall|p\s*值|z\s*=|t\s*=|F\s*=/iu;
const mathCommandPattern = /\\frac|\\sum|\\begin\{cases\}|\\sqrt|\\exp|\\log|\\lceil/;
const formulaCatalog = {
  L04: [/VMR|方差/, /Kernel|核密度|K_/, /Ripley|CSR|K\(/],
  L05: [/Pearson|相关/, /Moran/, /Gi|Getis/],
  L06: [/OLS|最小二乘|回归/, /F\s*=|F 检验|F-test/, /GWR|地理加权/],
  L07: [/Index|UFRI|指数/, /Mann|Kendall|趋势/],
  L08: [/Minkowski|Euclidean|距离/, /DBSCAN|core|核心距离/],
  L09: [/Entropy|信息熵|H\(/, /Information Gain|信息增益|IG/, /Gini|基尼/],
  L10: [/Mann|Kendall|趋势/, /Gi\*|Local Moran|新兴热点/],
  L11: [/Convolution|卷积/, /Cross Entropy|交叉熵|MSE/, /Precision|IoU|F1/],
  L12: [/并行|Amdahl|worker/, /轨迹|Euclidean|距离/],
  L13: [/Brovey|全色锐化/, /PSNR|SSIM|MSE/],
};

assert.equal(lectureIds.length, 10, 'should cover Lect.4 through Lect.13');

for (const lectureId of lectureIds) {
  const formulas = enhancements[lectureId].formulas || [];
  const conceptBridge = enhancements[lectureId].conceptBridge || [];
  assert.ok(formulas.length >= 3, `${lectureId} should have at least 3 formula cards`);
  assert.ok(conceptBridge.length >= 2, `${lectureId} should include GIS concept bridge notes`);

  for (const [index, formula] of formulas.entries()) {
    assert.equal(typeof formula.latex, 'string', `${lectureId} formula ${index + 1} needs LaTeX`);
    assert.ok(mathCommandPattern.test(formula.latex), `${lectureId} formula ${index + 1} should use mathematical layout commands`);
    assert.ok(Array.isArray(formula.vars) && formula.vars.length >= 3, `${lectureId} formula ${index + 1} should explain at least 3 variables`);
    for (const [symbol, explanation] of formula.vars) {
      assert.ok(String(symbol || '').trim().length >= 1, `${lectureId} formula ${index + 1} has an empty variable symbol`);
      assert.ok(String(explanation || '').trim().length >= 3, `${lectureId} formula ${index + 1} variable ${symbol} needs a readable explanation`);
    }
    assert.ok(Array.isArray(formula.derivation) && formula.derivation.length >= 2, `${lectureId} formula ${index + 1} needs derivation steps`);
    assert.ok(Array.isArray(formula.assumptions) && formula.assumptions.length >= 1, `${lectureId} formula ${index + 1} needs assumptions`);
  }

  for (const required of formulaCatalog[lectureId]) {
    const combined = formulas.map((formula) => `${formula.name} ${formula.tag} ${formula.latex} ${formula.read} ${formula.why}`).join('\n');
    assert.ok(required.test(combined), `${lectureId} is missing a key course formula: ${required}`);
  }

  const calculations = enhancements[lectureId].calculations;
  assert.equal(calculations.length, 2, `${lectureId} should keep 2 calculation questions`);

  const hasAdvancedCalculation = calculations.some((calculation) =>
    advancedPattern.test(`${calculation.title} ${calculation.stem} ${calculation.hint} ${calculation.explanation}`),
  );
  assert.ok(hasAdvancedCalculation, `${lectureId} should include at least one advanced statistical calculation`);

  for (const [index, calculation] of calculations.entries()) {
    const text = `${calculation.title} ${calculation.stem} ${calculation.hint} ${calculation.explanation}`;
    assert.equal(typeof calculation.answer, 'number', `${lectureId} calculation ${index + 1} needs numeric answer`);
    assert.ok(Number.isFinite(calculation.answer), `${lectureId} calculation ${index + 1} answer must be finite`);
    assert.ok(formulaPattern.test(text), `${lectureId} calculation ${index + 1} should cite a formula`);
    assert.ok(calculation.explanation.length >= 36, `${lectureId} calculation ${index + 1} explanation should include process and interpretation`);
  }
}

const allVisuals = lectureIds.flatMap((lectureId) => (enhancements[lectureId].formulas || []).map((formula) => formula.visual?.type).filter(Boolean));
assert.ok(allVisuals.includes('kernel-family'), 'formula page should include a kernel-function visual');
assert.ok(allVisuals.includes('distance-decay'), 'formula page should include a distance-decay visual');

const l04 = enhancements.L04;
assert.ok(l04.methodPrimer, 'Lect.4 should include a beginner-friendly method primer');
assert.ok(Array.isArray(l04.methodPrimer.sections) && l04.methodPrimer.sections.length >= 4, 'Lect.4 primer should explain hypothesis testing before formulas');
const primerText = l04.methodPrimer.sections.map((section) => `${section.title} ${section.body}`).join('\n');
for (const keyword of ['零假设', '备择假设', 'z 检验', 'p 值', '标准误']) {
  assert.ok(primerText.includes(keyword), `Lect.4 primer should explain ${keyword}`);
}

const l04LabModes = l04.labModes || [];
const l04LabModeIds = l04LabModes.map((mode) => mode.id);
for (const requiredMode of ['quadrat', 'point-density', 'kernel-density', 'ann', 'ripley-k', 'monte-carlo']) {
  assert.ok(l04LabModeIds.includes(requiredMode), `Lect.4 lab should include ${requiredMode}`);
}
for (const mode of l04LabModes) {
  assert.ok(mode.title && mode.why && mode.read, `Lect.4 lab mode ${mode.id} should explain what and why`);
}

assert.ok(appSource.includes('openStudyModal'), 'small explanatory text should open a readable modal');
assert.ok(appSource.includes('data-study-open'), 'readable blocks should expose click targets');
assert.ok(appSource.includes('renderMethodPrimer'), 'Lect.4 should render a method primer before formulas');
assert.ok(appSource.includes('patternLabMode'), 'Lect.4 lab should support multiple demo modes');
assert.ok(appSource.includes('math-inline'), 'variables such as x-bar should render as inline math instead of raw LaTeX');
assert.ok(appSource.includes('renderRichText'), 'text paragraphs should render inline formulas instead of raw math text');
assert.ok(appSource.includes('formulaTokenRules'), 'rich text formulas should use a broad token registry, not a few hard-coded examples');
assert.ok(appSource.includes('renderLatexFragments'), 'rich text should have a generic LaTeX fallback for derivation prose');
assert.ok(appSource.includes('latexCommandFragmentPattern'), 'generic LaTeX fallback should catch command-based fragments such as \\sum_j w_ij z_j');
assert.ok(appSource.includes('withMathPlaceholders'), 'rich text formula rendering should protect KaTeX spans from later text highlighting');
assert.ok(appSource.includes('renderRichText(s.core)'), 'guide core paragraphs should render inline formulas with KaTeX');
assert.ok(appSource.includes('renderRichText(s.formula)'), 'guide formula callouts should render slash fractions and symbols with KaTeX');
assert.ok(appSource.includes('s.details.map(p => `<p>${renderRichText(p)}</p>`)'), 'guide detail paragraphs should render inline formulas with KaTeX');
assert.ok(appSource.includes("state.tab === 'guide'") && appSource.includes("renderMathBlocks($('#tabContent'))"), 'guide tab should trigger KaTeX rendering after injecting rich math text');

const renderSandbox = { window: { __COURSE_TEST_MODE__: true } };
vm.createContext(renderSandbox);
vm.runInContext(appSource, renderSandbox, { filename: 'app.js' });
const { renderRichText, formulaVarItems } = renderSandbox.window.__COURSE_TEST_HOOKS__;
const genericLatex = renderRichText(String.raw`再计算邻域加权偏差 \sum_j w_ij z_j。`);
assert.match(genericLatex, /class="math-inline text-math"/, 'generic LaTeX fragments should become inline math spans');
assert.match(genericLatex, /data-tex="\\sum_j w_\{ij\} z_j"/, 'generic LaTeX fragments should normalize multi-letter subscripts');
const fractionLatex = renderRichText(String.raw`所以先用 s^2/\bar{x} 衡量方差是否过大。`);
assert.match(fractionLatex, /data-tex="\\frac\{s\^2\}\{\\bar\{x\}\}"/, 'slash fractions in prose should render as stacked KaTeX fractions');
const lambdaLatex = renderRichText(String.raw`由点密度 \lambda=n/A 得到期望距离。`);
assert.match(lambdaLatex, /data-tex="\\lambda=\\frac\{n\}\{A\}"/, 'density equations in prose should render as inline KaTeX');
const matrixLatex = renderRichText('写出残差平方和 RSS=(y-Xβ)^T(y-Xβ)。');
assert.match(matrixLatex, /data-tex="\\mathrm\{RSS\}=\(\\mathbf\{y\}-X\\boldsymbol\{\\beta\}\)\^\\mathsf\{T\}\(\\mathbf\{y\}-X\\boldsymbol\{\\beta\}\)"/, 'matrix transpose formulas should render as one inline KaTeX expression');

const rawLatexLeakPattern = /\\(?:sum|frac|sqrt|bar|chi|lambda|pi|left|right|hat|beta|alpha|mu|sigma|mathbf|mathrm|begin|operatorname)|\^[A-Za-z]/;
const removeMathSpans = (html) => html.replace(/<span class="math-inline text-math"[^>]*>.*?<\/span>/g, '');
for (const lectureId of lectureIds) {
  for (const [index, formula] of (enhancements[lectureId].formulas || []).entries()) {
    const textFields = [
      formula.read,
      formula.decision,
      formula.why,
      ...(formula.derivation || []),
      ...(formula.assumptions || []),
      ...(formula.vars || []).map(([, desc]) => desc),
    ].filter(Boolean);
    for (const text of textFields) {
      const outsideMath = removeMathSpans(renderRichText(text));
      assert.doesNotMatch(outsideMath, rawLatexLeakPattern, `${lectureId} formula ${index + 1} leaks raw LaTeX in rich text: ${text}`);
    }
  }
}

const l06VarChecks = enhancements.L06.formulas;
const olsVars = formulaVarItems(l06VarChecks.find((formula) => formula.tag === 'OLS normal equation')).map(([symbol]) => symbol);
assert.ok(olsVars.includes('RSS'), 'OLS formula variables should include residual sum of squares');
const gwrVars = formulaVarItems(l06VarChecks.find((formula) => formula.tag === 'GWR local model')).map(([symbol]) => symbol);
assert.ok(gwrVars.includes('\\varepsilon_i'), 'GWR formula variables should include the local error term');

assert.ok(appSource.includes('formulaVarItems'), 'formula cards should render merged variable explanations');
assert.ok(appSource.includes('variableGlossary'), 'formula cards should have fallback explanations for common symbols');
for (const requiredInlineToken of ['Moran’s I', 'K(d)=πd²', 'F=(R²/k)', 'IoU=TP/(TP+FP+FN)', 'PSNR=10log10']) {
  assert.ok(appSource.includes(requiredInlineToken), `rich text should know how to render ${requiredInlineToken}`);
}
for (const requiredGuideToken of ['ANN：R = r̄ₒ / r̄ₑ', 'r = Σ[(xᵢ−x̄)(yᵢ−ȳ)]', 'r=0', 'I = [n / S₀]', 'yᵢ = a + bxᵢ + eᵢ', 'SSE = Σₖ Σₓ∈Cₖ', 'H(S)=−Σp(c)log₂p(c)', 'z = Σwᵢxᵢ+b；a=f(z)', 'a=f(Σwᵢxᵢ+b)']) {
  assert.ok(appSource.includes(requiredGuideToken), `guide rich text should know how to render ${requiredGuideToken}`);
}
assert.ok(appSource.includes('calc-solution-steps'), 'calculation explanations should be split into readable steps');
assert.ok(appSource.includes('data-kernel-control'), 'kernel function visual should be interactive and switchable');
assert.ok(appSource.includes('openVisualModal'), 'formula visuals should be viewable in a standalone enlarged modal');
assert.ok(stylesSource.includes('text-indent: 2em'), 'Chinese prose should use two-character first-line indentation');
assert.ok(stylesSource.includes('.key-point'), 'important terms should have bold/color emphasis');

const labNotes = sandbox.window.LAB_DEMO_NOTES;
assert.ok(labNotes, 'labs should have supplemental explanation data');
const labNames = [...new Set(lectures.map((lecture) => lecture.lab))];
assert.equal(labNames.length, 10, '10 lectures should cover 10 different lab demos');

for (const labName of labNames) {
  const note = labNotes[labName];
  assert.ok(note, `${labName} lab is missing supplemental explanation`);
  assert.equal(typeof note.latex, 'string', `${labName} lab should include a core formula`);
  assert.ok(mathCommandPattern.test(note.latex), `${labName} lab formula should use mathematical layout commands`);
  assert.ok(Array.isArray(note.steps) && note.steps.length >= 3, `${labName} lab should provide at least 3 operation steps`);
  assert.ok(Array.isArray(note.observe) && note.observe.length >= 2, `${labName} lab should provide at least 2 observation points`);
  assert.ok(typeof note.takeaway === 'string' && note.takeaway.length >= 18, `${labName} lab should explain the method takeaway`);
}

assert.ok(appSource.includes('renderLabSupplement'), 'lab page should render a supplemental explanation panel');
assert.ok(appSource.includes('lab-equation'), 'lab page should include a KaTeX-ready equation area');
assert.ok(appSource.includes('renderMathBlocks'), 'formula and lab pages should render KaTeX math');
