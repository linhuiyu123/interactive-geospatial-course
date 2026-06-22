/* =========================================================================
   course-plus-stats.js — 检验依据 + 变量定义/性质 + 更多计算题（自包含附加模块）
   1) 公式页顶部：z / t / F / χ² 怎么选 的总则 + 核心量小词典（定义+性质）
   2) 每张“含检验”的公式卡：H0/H1、选取依据、为什么服从该分布、自由度、决策 + 本式新增量的定义与性质
   3) 自测页：补充计算题（含详细分步讲解）
   prose 一律用中文/Unicode，公式一律走 data-tex 经 KaTeX 渲染（不产生裸 LaTeX）。
   ========================================================================= */
(() => {
  'use strict';
  const CP = window.CoursePlus;
  const el = (CP && CP.el) || ((html)=>{const t=document.createElement('template');t.innerHTML=String(html).trim();return t.content.firstElementChild;});
  function renderMath(root){
    if(!window.katex||!root) return;
    root.querySelectorAll('[data-tex]').forEach(n=>{ if(n.dataset.cpDone==='1')return; try{window.katex.render(n.getAttribute('data-tex'),n,{throwOnError:false,strict:'ignore',displayMode:n.classList.contains('cp-block')});n.dataset.cpDone='1';}catch(_){} });
  }
  const tex=(t,block)=>`<span class="${block?'cp-block ':''}cp-tex" data-tex="${t.replace(/"/g,'&quot;')}"></span>`;

  /* ---------- 总则：z / t / F / χ² 怎么选 ---------- */
  const PRIMER = {
    title: '先判断该用哪种检验：z / t / F / χ²',
    lead: '选择检验的唯一依据，是“这个统计量在零假设成立时服从什么抽样分布”。下面四条是判别口诀，再配一个核心量的“定义 + 性质”小词典。',
    rules: [
      ['z 检验', '统计量 = (估计 − 零假设期望) / 标准误，且标准误来自总体/理论方差或大样本近似时用它。', '零假设下近似标准正态 N(0,1)；双侧 5% 临界值 ±1.96；不依赖自由度。'],
      ['t 检验', '形式同 z，但标准误用样本估计的方差（要扣自由度）时用它。', '服从自由度 df 的 t 分布；尾部比正态厚，样本越大越接近 z。'],
      ['F 检验', '比较两个“均方”（方差估计）之比时用它，常用于多个参数的联合/整体检验。', '非负、右偏；由分子、分母两个自由度 (df₁, df₂) 共同决定形状。'],
      ['χ² 检验', '统计量是“标准化偏差的平方和”或对计数方差的度量时用它。', '非负、右偏；自由度 df 决定形状，df 大时趋于正态。'],
    ],
    dict: [
      ['\\text{df}', '自由度：参与估计的独立信息个数 = 样本量 − 已用掉的约束/参数个数。', '决定 t / χ² / F 的形状；它把“样本有限”写进分布，是 t 区别于 z 的根本原因。'],
      ['\\mathrm{SE}', '标准误：估计量自身抽样分布的标准差。', '随样本量增大而减小（约与 1/√n 成正比）；作用是把“差异”换算成“几个随机波动单位”。'],
      ['p', 'p 值：零假设为真时，出现当前或更极端结果的概率。', '取值 [0,1]，越小越不像随机产生；它不是“零假设为真的概率”。'],
    ],
  };

  /* ---------- 每张含检验公式卡的“检验依据 + 新增量” ---------- */
  const q = (t,def,prop)=>[t,def,prop];
  const RATIONALE = {
    'VMR 与样方卡方检验': { dist:'χ²',
      h0:'完全空间随机 CSR：点落入各等面积样方相互独立，计数服从泊松分布，此时“方差 ≈ 均值”（VMR=1）。',
      h1:'VMR ≠ 1：大于 1 表示少数样方点很多、多数为空（聚集）；小于 1 表示各样方点数接近（规则）。',
      basis:'泊松计数的核心性质是“方差 = 均值”。把样本方差对均值的比 VMR 乘以自由度，就得到对“方差是否偏离期望”的检验。',
      why:'统计量 (m−1)·s²/x̄ 本质是“标准化偏差的平方和”，在 CSR 下近似服从自由度 m−1 的 χ² 分布——这正是用 χ²（而非 z/t/F）的原因：它度量的是计数的方差，不是均值差、也不是方差比。',
      df:'自由度 = 样方数 m − 1。',
      decide:'χ² 超过上侧临界值则拒绝 CSR，再用 VMR 的方向判断聚集还是规则。',
      vars:[ q('\\mathrm{VMR}=\\dfrac{s^2}{\\bar{x}}','方差均值比：样方计数的样本方差除以样本均值。','无量纲；CSR 下≈1，>1 聚集、<1 规则；对样方尺度高度敏感，必须报告格网大小。'),
        q('\\chi^2','卡方统计量：标准化偏差的平方和。','非负、右偏；只反映偏离强度、不含方向，需配 VMR 看方向。'),
        q('m','等面积样方（格网）的数量。','决定自由度 m−1；m 太大→很多空格，m 太小→热点被平均掉。') ] },
    'Average Nearest Neighbor 指数与 z 检验': { dist:'z',
      h0:'CSR：观测平均最近邻距离等于随机期望 d̄ₑ = 1 / (2√λ)，λ = n/A。',
      h1:'点比随机更近（R<1，聚集）或更远（R>1，规则）。',
      basis:'大量点的“平均最近邻距离”近似正态（中心极限），且 CSR 下其标准误有解析式 SE = 0.26136 / √(nλ)。',
      why:'标准误来自理论（已知）方差、且样本量大，所以标准化后服从标准正态——用 z 而不是 t（t 用于标准误由样本残差估计、自由度有限的情形）。',
      df:'z 检验不需要自由度（标准正态）。',
      decide:'R<1 且 z<−1.96 → 显著聚集；R>1 且 z>1.96 → 显著规则。',
      vars:[ q('R=\\dfrac{\\bar{d}_O}{\\bar{d}_E}','最近邻指数：观测平均最近邻距离 / 随机期望距离。','正数；<1 聚集、=1 随机、>1 规则；受研究区边界与面积口径影响。'),
        q('\\bar{d}_E=\\dfrac{1}{2\\sqrt{\\lambda}}','CSR 下的期望最近邻距离。','只由点密度 λ 决定；λ 越大期望距离越短。'),
        q('z=\\dfrac{\\bar{d}_O-\\bar{d}_E}{\\mathrm{SE}}','把距离差标准化的检验量。','标准正态；|z|>1.96 对应双侧 5% 显著。') ] },
    'Ripley K 与 L 函数': { dist:'蒙特卡洛包络',
      h0:'CSR：任意距离 d 内的邻居规模等于理论值 K(d)=πd²（即 L(d)=0）。',
      h1:'某些尺度 d 上邻居偏多（L(d)>0，聚集）或偏少（L(d)<0，规则）。',
      basis:'K(d) 是多尺度统计量，没有简洁的解析抽样分布，因此用蒙特卡洛模拟：在窗口内反复生成 CSR 点集，得到每个 d 的上下包络。',
      why:'它不是 z/t/F/χ² 检验，而是用随机模拟构造参考分布——观测曲线超出包络才算该尺度显著。这说明：当解析分布不可得时，模拟是通用替代。',
      df:'无自由度概念；分辨率由模拟次数决定。',
      decide:'观测 L(d) 高于上包络→该尺度聚集；低于下包络→该尺度规则；落在包络内→不能拒绝 CSR。',
      vars:[ q('\\hat{K}(d)','到距离 d 为止、单位强度下的期望邻居数。','随 d 单调增；需边界校正，否则靠边点邻居被低估。'),
        q('L(d)=\\sqrt{\\dfrac{K(d)}{\\pi}}-d','把 K 线性化、并以 0 为基线的判别量。','>0 聚集、<0 规则；比 K 更易读，因为基线是水平线。'),
        q('\\pi d^2','CSR 下半径 d 圆的期望面积（理论基线）。','只与 d 有关，是判断聚集/规则的参照。') ] },
    'Pearson 相关系数与显著性': { dist:'t',
      h0:'总体相关系数 ρ = 0（两变量无线性相关）。',
      h1:'ρ ≠ 0。',
      basis:'在 ρ=0 且双变量近似正态时，统计量 t = r·√((n−2)/(1−r²)) 精确服从自由度 n−2 的 t 分布。',
      why:'分母里的标准误依赖样本估计（1−r² 与样本量），自由度有限，所以用 t 而非 z；n 很大时 t 分布趋近正态。',
      df:'自由度 = n − 2。',
      decide:'|t| 超过 t₍α/2, n−2₎ 临界值则拒绝 ρ=0；注意“显著”不等于“相关强”，还要看 |r| 本身。',
      vars:[ q('r','线性相关系数：协方差除以两变量标准差之积。','范围 [−1,1]；只刻画线性关系，弯曲关系可能让 r≈0。'),
        q('t=r\\sqrt{\\dfrac{n-2}{1-r^2}}','检验 ρ=0 的统计量。','服从 t₍n−2₎；同一个 r，样本越大越显著。'),
        q('n-2','自由度。','两个参数（截距、斜率/相关）被估计后剩下的独立信息。') ] },
    '复相关系数与回归 F 检验': { dist:'F',
      h0:'所有解释变量的总体系数同时为 0（模型整体无解释力）。',
      h1:'至少一个系数不为 0。',
      basis:'把总变异分解为“被模型解释（SSR）”与“残差（SSE）”，各自除以自由度得到均方，构造比值 F = (R²/k)/((1−R²)/(n−k−1))。',
      why:'F 是两个方差估计（均方）之比；正态误差下分子分母是两个独立 χ² 各除以自由度，其比服从 F(k, n−k−1)。多个系数的“联合”检验天然用 F，而不是逐个 z/t。',
      df:'分子自由度 k（解释变量个数），分母自由度 n−k−1。',
      decide:'F 大且 p 小→模型整体显著；但整体显著不代表每个变量都显著（那要看各自的 t）。',
      vars:[ q('R^2=\\dfrac{SSR}{SST}','决定系数：被模型解释的变异占总变异的比例。','范围 [0,1]；变量越多普通 R² 只增不减，要同时看调整 R²。'),
        q('F=\\dfrac{R^2/k}{(1-R^2)/(n-k-1)}','整体显著性统计量。','非负、右偏；由 (k, n−k−1) 两个自由度决定形状。'),
        q('k','解释变量个数（不含截距）。','作为分子自由度；也是普通 R² 被抬高的来源。') ] },
    "Global Moran's I": { dist:'z',
      h0:'空间随机：属性值与位置无关，理论上 E[I] = −1/(n−1)（并非 0）。',
      h1:'I 显著大于期望（正自相关、成片）或显著小于期望（负自相关、交错）。',
      basis:'在随机化/正态假设下，I 的均值与方差有解析式，I 近似正态；也可用置换检验得到经验分布。',
      why:'用解析方差（已知）+ 大样本把 I 标准化为 z = (I − E[I])/√Var[I]，所以是 z 检验；小样本或方差难求时改用置换。',
      df:'z 检验无自由度。',
      decide:'z>1.96 正自相关；z<−1.96 负自相关；否则不能拒绝随机。务必减去 E[I] 而不是减 0。',
      vars:[ q("I","全局 Moran 指数：邻居偏差加权乘积的标准化和。","约在 [−1,1]；其零假设期望是 −1/(n−1) 而非 0。"),
        q('E[I]=-\\dfrac{1}{n-1}','随机假设下 I 的期望值。','n 大时才接近 0；小样本必须显式减它。'),
        q('w_{ij}','空间权重：刻画 i 与 j 是否/多大程度上相邻。','由邻接或距离定义；换 W 会改变 I，必须事先说明。') ] },
    "Local Moran's I_i": { dist:'置换伪 p',
      h0:'位置 i 的局部关联不强于随机重排：把其它单元的值随机打乱，Iᵢ 不会更极端。',
      h1:'Iᵢ 异常大/小，形成 HH、LL（聚集）或 HL、LH（空间离群）。',
      basis:'局部统计量的解析分布不可靠，改用置换：固定权重结构、反复随机打乱属性值，得到 Iᵢ 的参考分布。',
      why:'用经验（模拟）分布而非 z/t/F/χ²，因为局部样本小、还存在多重比较；伪 p 做 +1 修正避免出现 p=0。',
      df:'无自由度；分辨率由置换次数 R 决定。',
      decide:'伪 p 小说明该局部模式不像随机排列产生；解释多个位置时要控制多重比较。',
      vars:[ q('I_i=\\dfrac{z_i}{m_2}\\sum_j w_{ij}z_j','局部 Moran：目标偏差 × 邻域加权偏差。','同号且显著→HH/LL；异号且显著→空间离群。'),
        q('p_i=\\dfrac{1+\\#\\{|I_i^{(r)}|\\ge|I_i^{obs}|\\}}{R+1}','置换伪 p 值。','+1 修正避免 0；R 越大分辨率越高。'),
        q('R','置换次数。','越大伪 p 越精细，但计算更久。') ] },
    'Getis-Ord Gi* 热点统计量': { dist:'z',
      h0:'位置 i 邻域内的加权属性和等于随机期望（不是热点也不是冷点）。',
      h1:'邻域加权和显著高于期望（热点）或显著低于期望（冷点）。',
      basis:'把“邻域加权和 − 随机期望”除以其标准误，得到可直接当作 z-score 读的统计量。',
      why:'标准误用全局均值、标准差与权重的解析式（已知方差），所以是 z；它回答“高值或低值是否成片”，与 Local Moran 关注的“离群”不同。',
      df:'z 检验无自由度。',
      decide:'Gi*>1.96 热点、<−1.96 冷点；p 越小聚集证据越强。',
      vars:[ q('G_i^{*}','热点/冷点的 z-score。','正大为热点、负大为冷点；本身就是标准化量。'),
        q('\\bar{X},\\ S','全局均值与全局标准差。','构成随机期望与标准误，是“显著高于平均”的参照。'),
        q('w_{ij}','i 的邻域权重（通常含自身）。','距离带/邻接规则要与研究尺度匹配。') ] },
    '回归平方和分解与 F 检验': { dist:'F',
      h0:'所有斜率系数同时为 0。',
      h1:'至少一个斜率不为 0。',
      basis:'SST = SSR + SSE；把 SSR、SSE 各除以自由度得到均方 MSR、MSE，F = MSR/MSE。',
      why:'两个均方都是方差估计，其比在正态误差下服从 F(k, n−k−1)——这正是“整体模型是否显著”用 F 的根本原因。',
      df:'(k, n−k−1)。',
      decide:'F 显著说明模型整体解释力不太可能来自随机；空间残差有自相关时普通 F 会偏乐观，需做残差诊断。',
      vars:[ q('F=\\dfrac{SSR/k}{SSE/(n-k-1)}','回归均方与残差均方之比。','非负、右偏；分子分母自由度共同决定形状。'),
        q('SSR,\\ SSE,\\ SST','回归/残差/总平方和。','三者满足 SST=SSR+SSE，是 R² 与 F 的共同来源。'),
        q('s_e=\\sqrt{\\dfrac{SSE}{n-k-1}}','估计标准误差：残差的均方根。','对误差项标准差的估计；越小预测越准，全部点落在线上时为 0。') ] },
    '回归系数 t 检验与置信区间': { dist:'t',
      h0:'某个系数 βⱼ = 0（在控制其它变量后，xⱼ 对 y 无线性贡献）。',
      h1:'βⱼ ≠ 0。',
      basis:'用残差估计误差方差，进而得到系数标准误 SE(β̂ⱼ)，构造 t = (β̂ⱼ − 0)/SE(β̂ⱼ)。',
      why:'标准误来自样本残差（估计方差、自由度 n−k−1 有限），所以是 t 而非 z；多重共线性会放大 SE，使 t 变小、系数不稳。',
      df:'自由度 = n − k − 1。',
      decide:'|t| 大且 p 小→该变量在控制其它变量后仍显著；置信区间不含 0 等价于 5% 下显著。',
      vars:[ q('t_j=\\dfrac{\\hat{\\beta}_j-0}{\\mathrm{SE}(\\hat{\\beta}_j)}','单个系数的检验统计量。','服从 t₍n−k−1₎；共线性会抬高 SE 从而压低 t。'),
        q('\\mathrm{SE}(\\hat{\\beta}_j)','系数估计的标准误。','随样本量、残差方差、自变量离散度变化；越小估计越稳。'),
        q('n-k-1','残差自由度。','样本量减去（截距 + k 个斜率）个被估参数。') ] },
    'Mann-Kendall 趋势检验': { dist:'z（非参数）',
      h0:'序列无单调趋势：任意两期先后大小关系是随机的。',
      h1:'存在上升或下降的单调趋势。',
      basis:'统计所有时间对的符号和 S；S 在零假设下均值为 0、方差 Var(S) 有解析式，大样本下 S 近似正态。',
      why:'用 (S − sign(S))/√Var(S) 标准化为 Z，所以是 z 型；它基于秩符号、不要求数据正态或线性，是非参数方法。',
      df:'无自由度；连续修正项 sign(S) 用于离散校正。',
      decide:'Z>1.96 上升、<−1.96 下降；强自相关序列需预白化或修正方差。',
      vars:[ q('S=\\sum_{i<j}\\operatorname{sgn}(x_j-x_i)','趋势方向的秩统计量。','正值后期更大、负值后期更小；只看大小关系、不看具体数值。'),
        q('Z=\\dfrac{S-\\operatorname{sgn}(S)}{\\sqrt{\\operatorname{Var}(S)}}','标准化趋势统计量。','近似标准正态；样本越长越灵敏。'),
        q('\\operatorname{Var}(S)','S 的零假设方差（含并列校正）。','把样本长度与并列值写进显著性判断。') ] },
    '新兴热点的 Gi* 时间序列': { dist:'z（逐期）',
      h0:'每个时间步内，某位置邻域加权和等于该期随机期望。',
      h1:'某些时间步该位置显著为热点或冷点。',
      basis:'对每个时间步单独做 Gi*（用该期的全局均值、标准差标准化），得到一条随时间变化的 z-score 序列。',
      why:'每一期都是一次 z 检验；把多期 z 串起来再按规则（连续显著、近期出现等）归类为新增、持续、减弱等热点类型。',
      df:'逐期 z 检验无自由度。',
      decide:'连续多期显著高→持续热点；近期才显著→新兴热点。',
      vars:[ q('G^{*}_{g,t}','位置 g 在第 t 期的热点 z-score。','逐期标准化，可跨时间比较强弱。'),
        q('\\bar{X}_t,\\ S_t','第 t 期的全局均值与标准差。','每期各自计算，保证不同期可比。'),
        q('w_{gj}','空间邻域权重。','整个时空立方体内应保持一致。') ] },
    'Mann-Kendall 热点趋势检验': { dist:'z（非参数）',
      h0:'某位置的 Gi* 时间序列无单调趋势（热点强度不随时间系统变化）。',
      h1:'热点强度随时间显著增强或减弱。',
      basis:'对该位置的 Gi* 序列计算符号秩和 Sg，再用其解析方差标准化为 Zg。',
      why:'与普通 Mann-Kendall 同理，是基于秩符号的非参数 z 型检验，只是被检验的序列换成了逐期 Gi*。',
      df:'无自由度。',
      decide:'Zg>0 且显著→热点增强（intensifying）；Zg<0 且显著→减弱（diminishing）。',
      vars:[ q('S_g=\\sum_{t<u}\\operatorname{sgn}(G^{*}_{g,u}-G^{*}_{g,t})','位置 g 的趋势秩统计量。','作用对象是逐期 z-score，而不是原始计数。'),
        q('Z_g','标准化趋势统计量。','近似正态；是“new/intensifying/diminishing”标签的依据。'),
        q('T','时间步数。','序列越长趋势判断越稳。') ] },
    'Local Moran 置换 p 值': { dist:'置换伪 p',
      h0:'局部关联不强于随机重排。',
      h1:'局部出现显著 HH/LL/HL/LH 模式。',
      basis:'固定空间权重、随机打乱属性值，反复重算 Iᵢ，统计比观测更极端的比例。',
      why:'空间软件里常见的 pseudo p-value 来自随机化，而不是查解析分布表；这是局部、多重比较情形下更稳妥的做法。',
      df:'无自由度；分辨率由置换次数 R 决定。',
      decide:'伪 p 小→该局部模式不像随机排列产生；多位置解释要控制多重比较。',
      vars:[ q('p_i=\\dfrac{1+\\sum_{r}\\mathbb{1}(|I_i^{(r)}|\\ge|I_i^{obs}|)}{R+1}','置换伪 p 值。','+1 修正避免 0；R 决定精度。'),
        q('I_i^{obs}','观测到的局部 Moran 值。','与置换分布比较得显著性。'),
        q('R','置换次数。','常取 999 / 9999，越大越精细。') ] },
  };

  window.CoursePlusStats = { PRIMER, RATIONALE, renderMath, el, tex };
})();

/* ============ 注入逻辑 + 更多计算题 ============ */
(() => {
  'use strict';
  const S = window.CoursePlusStats; if (!S) return;
  const { PRIMER, RATIONALE, renderMath, el, tex } = S;

  /* ---------- 更多计算题（答案均已用 Node 核验） ---------- */
  const step = (label, html) => ({ label, html });
  const EXTRA_CALC = {
    L04: [
      { title:'样方卡方检验（自由度更大）', answer:38, unit:'', tol:0.05,
        stem:`某研究区划为 ${tex('m=20')} 个等面积样方，格内点数均值 ${tex('\\bar{x}=2.5')}、样本方差 ${tex('s^2=5.0')}。用 ${tex('\\chi^2=(m-1)\\,s^2/\\bar{x}')} 检验 CSR，求 ${tex('\\chi^2')} 统计量。`,
        steps:[ step('公式与代入', `先算方差均值比 ${tex('\\mathrm{VMR}=s^2/\\bar{x}=5.0/2.5=2.0')}。`),
          step('计算结果', `${tex('\\chi^2=(20-1)\\times 2.0=38.0')}。`),
          step('统计判断', `自由度 ${tex('df=19')}，5% 上侧临界值约 ${tex('\\chi^2_{0.05,19}\\approx30.1')}；38.0 > 30.1，拒绝 CSR。`),
          step('空间含义', '方差远大于均值，点呈聚集倾向；但结论依赖样方尺度，应换尺度做敏感性检查。') ] },
      { title:'平均最近邻指数 R', answer:0.80, unit:'', tol:0.01,
        stem:`某城市 ${tex('n=128')} 个设施落在 ${tex('A=2\\,\\mathrm{km}^2')} 内，观测平均最近邻距离 ${tex('\\bar{d}_O=50\\,\\mathrm{m}')}。求最近邻指数 ${tex('R')}。`,
        steps:[ step('公式与代入', `点密度 ${tex('\\lambda=n/A=128/2{,}000{,}000=6.4\\times10^{-5}/\\mathrm{m}^2')}；期望距离 ${tex('\\bar{d}_E=1/(2\\sqrt{\\lambda})=62.5\\,\\mathrm{m}')}。`),
          step('计算结果', `${tex('R=\\bar{d}_O/\\bar{d}_E=50/62.5=0.80')}。`),
          step('统计判断', `${tex('R<1')} 提示聚集；其标准误 ${tex('\\mathrm{SE}=0.26136/\\sqrt{n\\lambda}\\approx2.89\\,\\mathrm{m}')}，则 ${tex('z=(50-62.5)/2.89\\approx-4.33')}，远小于 −1.96，显著聚集。`),
          step('空间含义', 'R 只给方向、z 才给显著性；面积口径与边界会影响期望距离，需固定研究窗口。') ] },
    ],
    L05: [
      { title:'Pearson 相关显著性（t 检验）', answer:2.52, unit:'', tol:0.02,
        stem:`样本量 ${tex('n=27')}，相关系数 ${tex('r=0.45')}。用 ${tex('t=r\\sqrt{(n-2)/(1-r^2)}')} 检验 ${tex('\\rho=0')}，求 ${tex('t')}。`,
        steps:[ step('公式与代入', `${tex('1-r^2=1-0.2025=0.7975')}，${tex('(n-2)/(1-r^2)=25/0.7975\\approx31.35')}。`),
          step('计算结果', `${tex('t=0.45\\times\\sqrt{31.35}\\approx0.45\\times5.60=2.52')}。`),
          step('统计判断', `自由度 ${tex('df=25')}，双侧 5% 临界 ${tex('t_{0.025,25}\\approx2.06')}；2.52 > 2.06，拒绝 ${tex('\\rho=0')}。`),
          step('空间含义', '显著只说明“线性相关不为 0”，强度仍看 |r|=0.45（中等）；这是迈向空间自相关前的基准。') ] },
      { title:"Global Moran's I 标准化（z 检验）", answer:2.91, unit:'', tol:0.02,
        stem:`某变量 ${tex("I=0.30")}，单元数 ${tex('n=50')}，方差 ${tex('\\operatorname{Var}[I]=0.0121')}。用 ${tex('z=(I-E[I])/\\sqrt{\\operatorname{Var}[I]}')} 求 z（注意 ${tex('E[I]=-1/(n-1)')}）。`,
        steps:[ step('公式与代入', `${tex('E[I]=-1/49\\approx-0.0204')}，${tex('\\sqrt{0.0121}=0.11')}。`),
          step('计算结果', `${tex('z=(0.30-(-0.0204))/0.11=0.3204/0.11\\approx2.91')}。`),
          step('统计判断', `${tex('z>1.96')}，拒绝空间随机，存在正空间自相关。`),
          step('空间含义', '关键是减去 E[I]=−0.0204 而非 0；正自相关意味着相似值在空间上成片出现。') ] },
    ],
    L06: [
      { title:'整体模型 F 检验', answer:17.42, unit:'', tol:0.05,
        stem:`多元回归 ${tex('n=62')}，解释变量 ${tex('k=4')}，${tex('R^2=0.55')}。用 ${tex('F=(R^2/k)/((1-R^2)/(n-k-1))')} 求整体 F。`,
        steps:[ step('公式与代入', `分子 ${tex('R^2/k=0.55/4=0.1375')}；分母 ${tex('(1-R^2)/(n-k-1)=0.45/57\\approx0.00789')}。`),
          step('计算结果', `${tex('F=0.1375/0.00789\\approx17.42')}。`),
          step('统计判断', `自由度 ${tex('(4,57)')}，临界 ${tex('F_{0.05}(4,57)\\approx2.53')}；17.42 ≫ 2.53，模型整体显著。`),
          step('空间含义', 'F 检验整体解释力；若残差仍有空间自相关，普通 F 会偏乐观，应做残差诊断或空间模型。') ] },
      { title:'回归系数 t 检验', answer:-3.00, unit:'', tol:0.02,
        stem:`某系数估计 ${tex('\\hat{\\beta}=-0.9')}，标准误 ${tex('\\mathrm{SE}=0.30')}。检验 ${tex('H_0:\\beta=0')}，求 ${tex('t')}。`,
        steps:[ step('公式与代入', `${tex('t=(\\hat{\\beta}-0)/\\mathrm{SE}=-0.9/0.30')}。`),
          step('计算结果', `${tex('t=-3.00')}。`),
          step('统计判断', `自由度大时 ${tex('|t|>1.96')}，在 5% 下显著；系数为负说明该变量与 y 负相关。`),
          step('空间含义', '系数解释要“控制其它变量不变”；多重共线性会放大 SE、压低 |t|，使本应显著的变量变得不显著。') ] },
    ],
    L08: [
      { title:'欧氏距离与曼哈顿距离', answer:5.0, unit:'', tol:0.02,
        stem:`两样本特征 ${tex('\\mathbf{x}=(1,2,2)')}、${tex('\\mathbf{y}=(4,2,6)')}。求欧氏距离 ${tex('d_2')}（顺带比较曼哈顿 ${tex('d_1')}）。`,
        steps:[ step('公式与代入', `逐维差 ${tex('(1-4,\\,2-2,\\,2-6)=(-3,0,-4)')}。`),
          step('计算结果', `${tex('d_2=\\sqrt{9+0+16}=\\sqrt{25}=5.0')}；${tex('d_1=3+0+4=7')}。`),
          step('含义', '同两点，d₂=5 与 d₁=7 不同——“相似”取决于距离定义；聚类前必须先选距离并标准化各维。') ] },
    ],
    L09: [
      { title:'决策树信息增益', answer:0.28, unit:'', tol:0.02,
        stem:`父节点 10 正 10 负；按某特征分裂为左 ${tex('(8,2)')}、右 ${tex('(2,8)')}。用 ${tex('IG=H(S)-\\sum_v \\tfrac{|S_v|}{|S|}H(S_v)')} 求信息增益（${tex('H=-\\sum p\\log_2 p')}）。`,
        steps:[ step('公式与代入', `父熵 ${tex('H=-(0.5\\log_2 0.5)\\times2=1.0')}；子熵 ${tex('H(8,2)=H(2,8)\\approx0.722')}。`),
          step('计算结果', `加权子熵 ${tex('0.5\\times0.722+0.5\\times0.722=0.722')}；${tex('IG=1.0-0.722\\approx0.28')}。`),
          step('含义', '熵下降 0.28 bit 说明该特征有分类价值；决策树就选 IG 最大的特征划分，但要配合剪枝防过拟合。') ] },
    ],
    L11: [
      { title:'卷积输出尺寸', answer:30, unit:'', tol:0.5,
        stem:`输入 ${tex('H=32')}，卷积核 ${tex('K=3')}，填充 ${tex('P=0')}，步幅 ${tex('S=1')}。用 ${tex('H_{out}=\\lfloor (H+2P-K)/S\\rfloor+1')} 求输出高。`,
        steps:[ step('公式与代入', `${tex('(H+2P-K)/S=(32+0-3)/1=29')}。`),
          step('计算结果', `${tex('H_{out}=\\lfloor 29\\rfloor+1=30')}。`),
          step('含义', '无填充会让每过一层尺寸缩小；要保持尺寸需 P=(K−1)/2（K=3 时 P=1）。') ] },
    ],
    L13: [
      { title:'重建质量 PSNR', answer:34.15, unit:'dB', tol:0.05,
        stem:`8-bit 影像（${tex('MAX=255')}）重建后 ${tex('\\mathrm{MSE}=25')}。用 ${tex('\\mathrm{PSNR}=10\\log_{10}(MAX^2/\\mathrm{MSE})')} 求 PSNR。`,
        steps:[ step('公式与代入', `${tex('MAX^2/\\mathrm{MSE}=255^2/25=65025/25=2601')}。`),
          step('计算结果', `${tex('\\mathrm{PSNR}=10\\log_{10}(2601)\\approx10\\times3.415=34.15\\,\\mathrm{dB}')}。`),
          step('含义', 'PSNR 越高像素误差越小；但它对结构不敏感，需与 SSIM、光谱一致性一起评估“清晰是否真实”。') ] },
    ],
  };
  window.CoursePlusStats.EXTRA_CALC = EXTRA_CALC;

  const curLid = () => document.querySelector('#lectureNav [data-nav-id].is-current')?.dataset.navId;
  const curTab = () => document.querySelector('.tab.is-active')?.dataset.tab;
  const enh = (lid) => (window.COURSE_ENHANCEMENTS || {})[lid] || {};

  function buildPrimer() {
    const sec = el(`<section class="cp-primer" data-cp-primer="1">
      <div class="cp-primer-head"><p class="eyebrow">检验依据 · 先判断该用哪种检验</p><h3>${PRIMER.title}</h3></div>
      <p class="cp-primer-lead">${PRIMER.lead}</p>
      <div class="cp-primer-grid">${PRIMER.rules.map(([k,d,p])=>`<article><h4>${k}</h4><p><em>什么时候用</em>${d}</p><p><em>分布性质</em>${p}</p></article>`).join('')}</div>
      <div class="cp-dict"><h4>核心量小词典（定义 + 性质）</h4>${PRIMER.dict.map(([t,d,p])=>`<div class="cp-dict-row"><b>${tex(t)}</b><div><p><em>定义</em>${d}</p><p><em>性质</em>${p}</p></div></div>`).join('')}</div>
    </section>`);
    return sec;
  }
  function buildRationale(r) {
    return el(`<section class="cp-rationale" data-cp-rationale="1">
      <div class="cp-rationale-head"><span class="cp-dist-badge">${r.dist} 检验</span><h5>检验依据：为什么用 ${r.dist} 检验</h5></div>
      <div class="cp-rationale-grid">
        <div><span>零假设 H₀</span><p>${r.h0}</p></div>
        <div><span>备择 H₁</span><p>${r.h1}</p></div>
        <div><span>选取依据</span><p>${r.basis}</p></div>
        <div><span>为什么服从 ${r.dist} 分布</span><p>${r.why}</p></div>
        <div><span>自由度</span><p>${r.df}</p></div>
        <div><span>决策规则</span><p>${r.decide}</p></div>
      </div>
      <div class="cp-qty"><h6>本式新增量：定义与性质</h6>${r.vars.map(([t,d,p])=>`<div class="cp-qty-row"><b>${tex(t)}</b><div><p><em>定义</em>${d}</p><p><em>性质</em>${p}</p></div></div>`).join('')}</div>
    </section>`);
  }
  function enhanceFormula(lid) {
    const page = document.querySelector('#tabContent .formula-page'); if (!page) return;
    if (!page.querySelector('[data-cp-primer]')) {
      const primer = buildPrimer();
      const stack = page.querySelector('.formula-stack');
      if (stack) stack.parentNode.insertBefore(primer, stack); else page.appendChild(primer);
      renderMath(primer);
    }
    const formulas = enh(lid).formulas || [];
    const cards = page.querySelectorAll('.formula-card');
    cards.forEach((card, i) => {
      if (card.querySelector('[data-cp-rationale]')) return;
      const f = formulas[i]; if (!f) return;
      const r = RATIONALE[f.name]; if (!r) return;
      const node = buildRationale(r);
      const why = card.querySelector('.formula-why');
      if (why) card.insertBefore(node, why); else card.appendChild(node);
      renderMath(node);
    });
  }

  function buildCalc(p, idx) {
    const art = el(`<article class="cp-calc">
      <div class="cp-calc-title"><span class="cp-calc-no">补充计算 ${idx+1}</span><h4>${p.title}</h4></div>
      <p class="cp-calc-stem">${p.stem}</p>
      <div class="cp-calc-row"><input type="text" inputmode="decimal" placeholder="例如 ${p.answer}${p.unit||''}" /><button type="button" class="cp-btn cp-calc-check">核对答案</button></div>
      <div class="cp-calc-result"></div>
      <details class="cp-calc-sol"><summary>查看详细讲解</summary><ol>${p.steps.map(s=>`<li><span>${s.label}</span><p>${s.html}</p></li>`).join('')}</ol></details>
    </article>`);
    const input = art.querySelector('input'), btn = art.querySelector('.cp-calc-check'), res = art.querySelector('.cp-calc-result'), sol = art.querySelector('.cp-calc-sol');
    btn.addEventListener('click', () => {
      const v = Number(String(input.value).trim().replace(/，/g,'.').replace(/%/g,''));
      if (!Number.isFinite(v)) { res.className='cp-calc-result is-show is-wrong'; res.textContent='请输入一个有效数字。'; return; }
      const ok = Math.abs(v - p.answer) <= (p.tol ?? 0.01);
      res.className = `cp-calc-result is-show ${ok?'is-right':'is-wrong'}`;
      res.textContent = `${ok?'✓ 正确。':'✗ 再核对一下。'} 参考答案：${p.answer}${p.unit||''}`;
      sol.open = true;
    });
    return art;
  }
  function enhanceQuiz(lid) {
    const probs = EXTRA_CALC[lid]; if (!probs) return;
    const card = document.querySelector('#tabContent .quiz-card'); if (!card || card.querySelector('[data-cp-calc]')) return;
    const sec = el(`<section class="cp-calc-extra" data-cp-calc="1"><div class="cp-calc-extra-head"><p class="eyebrow">补充练习 · 含详细讲解</p><h3>再多算几道（统计量 → 代入 → 判断 → 含义）</h3></div></section>`);
    probs.forEach((p,i)=>{ const a=buildCalc(p,i); sec.appendChild(a); renderMath(a); });
    const area = card.querySelector('.calculation-area');
    if (area) area.appendChild(sec); else card.appendChild(sec);
  }

  let raf = 0;
  function run() {
    const lid = curLid(), tab = curTab(); if (!lid) return;
    if (tab === 'formula') enhanceFormula(lid);
    else if (tab === 'quiz') enhanceQuiz(lid);
  }
  function schedule(){ cancelAnimationFrame(raf); raf = requestAnimationFrame(run); }
  function start(){ const tc=document.getElementById('tabContent'); if(!tc){setTimeout(start,200);return;} new MutationObserver(schedule).observe(tc,{childList:true}); schedule(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
