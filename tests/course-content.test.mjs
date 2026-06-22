import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../enhancements.js', import.meta.url), 'utf8');
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(source, sandbox, { filename: 'enhancements.js' });

const enhancements = sandbox.window.COURSE_ENHANCEMENTS;
const lectureIds = Object.keys(enhancements).filter((id) => /^L\d{2}$/.test(id));

const advancedPattern = /检验|假设|显著|p\s*[值=]|p-value|z[-\s]?score|z\s*=|t\s*=|F\s*=|χ²|卡方|置信|标准误|自由度|临界值|置换|Mann|Kendall|F1|Recall|Precision|PSNR|SSIM|RMSE|均方|误差矩阵/iu;
const formulaPattern = /=|Σ|√|χ²|β|SE|SD|MSE|RMSE|PSNR|F1|Precision|Recall|p\s*[值=]|z\s*=|t\s*=|F\s*=/iu;

assert.equal(lectureIds.length, 10, '应覆盖 Lect.4 到 Lect.13 的 10 讲增强内容');

for (const lectureId of lectureIds) {
  const calculations = enhancements[lectureId].calculations;
  assert.equal(calculations.length, 2, `${lectureId} 应保持 2 道输入型计算题`);

  const hasAdvancedCalculation = calculations.some((calculation) =>
    advancedPattern.test(`${calculation.title} ${calculation.stem} ${calculation.hint} ${calculation.explanation}`),
  );
  assert.ok(hasAdvancedCalculation, `${lectureId} 至少应有一道计算题考察检验、显著性或高级评价统计量`);

  for (const [index, calculation] of calculations.entries()) {
    const text = `${calculation.title} ${calculation.stem} ${calculation.hint} ${calculation.explanation}`;
    assert.equal(typeof calculation.answer, 'number', `${lectureId} 第 ${index + 1} 题必须提供数值答案`);
    assert.ok(Number.isFinite(calculation.answer), `${lectureId} 第 ${index + 1} 题答案必须是有限数`);
    assert.ok(formulaPattern.test(text), `${lectureId} 第 ${index + 1} 题应明确给出或引用公式`);
    assert.ok(calculation.explanation.length >= 36, `${lectureId} 第 ${index + 1} 题解释应包含计算过程和结果含义`);
  }
}

