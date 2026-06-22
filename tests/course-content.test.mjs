import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const dataSource = readFileSync(new URL('../data.js', import.meta.url), 'utf8');
const enhancementSource = readFileSync(new URL('../enhancements.js', import.meta.url), 'utf8');
const formulaSource = readFileSync(new URL('../formula-upgrades.js', import.meta.url), 'utf8');
const appSource = readFileSync(new URL('../app.js', import.meta.url), 'utf8');

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
