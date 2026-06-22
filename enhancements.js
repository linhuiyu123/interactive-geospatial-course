/* v2 学习增强内容：公式聚焦、中文导读、真实案例与计算自测 */
window.COURSE_ENHANCEMENTS = {
  L04: {
    chineseLead: '这一讲不只是问“点多不多”，而是要把地图上零散的点变成可检验的空间规律：它们是聚集、随机，还是有规则地分散？',
    formulas: [
      { tag: '核心判断', name: '方差—均值比（样方分析）', expression: 'VMR = s<sup>2</sup> / x̄', read: '把每个格网内点数的方差，除以每格平均点数。', vars: [['s²','格网点数的方差'],['x̄','格网内平均点数']], decision: 'VMR &lt; 1：倾向离散；VMR ≈ 1：倾向随机；VMR &gt; 1：倾向聚集。', why: '随机点在等面积格网中的计数常可近似为泊松分布，其“均值≈方差”。因此 VMR 用来判断波动是否比随机更小或更大。' },
      { tag: '距离尺度', name: '平均最近邻指数', expression: 'R = R<sub>o</sub> / R<sub>e</sub>，R<sub>e</sub> = 1 / (2√λ)，λ = n / A', read: '把实际平均最近邻距离与随机条件下的期望距离相比。', vars: [['Rₒ','观察到的平均最近邻距离'],['Rₑ','随机分布的期望距离'],['λ','点密度，等于点数 n / 研究区面积 A']], decision: 'R &lt; 1：点更近，倾向聚集；R ≈ 1：近似随机；R &gt; 1：点更远，倾向离散。', why: '它只看“最近的一个邻居”，因此适合全局快速判断；若想看多尺度，要继续用 Ripley’s K。' },
      { tag: '多尺度判断', name: 'Ripley’s K 随机基线', expression: 'K<sub>CSR</sub>(d) = πd<sup>2</sup>', read: '在完全空间随机（CSR）条件下，距离 d 内的理论邻居规模。', vars: [['d','分析距离（例如 500 m、1 km）'],['K(d)','真实点模式在距离 d 内的邻居规模']], decision: '若 K(d) &gt; πd²，说明该距离尺度上邻居偏多、倾向聚集；反之倾向离散。', why: '它的价值在于“多尺度”：500 m 聚集不代表 10 km 也聚集。' }
    ],
    terms: [['quadrat','样方／等面积格网'],['point density','点密度'],['kernel density','核密度'],['average nearest neighbor','平均最近邻'],['complete spatial randomness, CSR','完全空间随机'],['clustered / dispersed','聚集／离散'],['Ripley’s K function','Ripley K 函数']],
    caseIds: ['usgs-landcover-grid','nasa-urban-heat'],
    extraQuiz: [
      { q: '样方分析中，若每个格子的点数都几乎一样，最可能看到哪种结果？', options: ['VMR 明显小于 1，倾向离散', 'VMR 明显大于 1，倾向聚集', 'VMR 必定等于 5', '不能判断'], answer: 0, why: '格间点数越接近，方差越小；当方差小于均值，VMR < 1。' },
      { q: 'R=0.62 的平均最近邻结果首先说明什么？', options: ['实际最近邻距离比随机期望更小', '点比随机更均匀', '一定没有显著性', '研究区面积为 0.62'], answer: 0, why: 'R=Rₒ/Rₑ，小于 1 表示实际点间最近邻距离更短，倾向聚集。' },
      { q: '在 d=2 km 时，若 K(d) 高于 πd²，正确解释是？', options: ['2 km 尺度上倾向聚集', '2 km 尺度上必然均匀', '所有尺度都聚集', '只能说明点密度为 0'], answer: 0, why: 'K 函数的判断必须带上距离尺度；高于 CSR 基线表示这一距离内邻居偏多。' },
      { q: '为什么同一份点数据换一个格网尺寸，VMR 可能变化？', options: ['因为方差和均值会随聚合尺度改变', '因为坐标会自动变成经纬度', '因为点数会被删除', '因为 VMR 与格网无关'], answer: 0, why: '样方分析本质是对点按格网聚合；格网大小直接影响格内计数分布。' },
      { q: '核密度与普通点密度最关键的差异是什么？', options: ['核密度让距离更近的点贡献更大且平滑衰减', '核密度只适合线数据', '普通点密度不能输出地图', '二者没有差异'], answer: 0, why: '普通点密度通常采用硬边界计数；核密度采用距离衰减权重。' }
    ],
    calculations: [
      { title: '计算 1：样方卡方检验统计量', stem: '12 个等面积样方的格内点数均值 x̄=4.2，样本方差 s²=8.4。用 χ²=(m−1)s²/x̄ 检验 CSR 假设，请计算 χ² 统计量。', hint: '先求 VMR=s²/x̄，再乘以自由度 m−1。', answer: 22, tolerance: 0.02, unit: '', explanation: 'VMR=8.4/4.2=2.00；χ²=(12−1)×2.00=22.00。若 df=11 的 5% 上侧临界值约为 19.68，则可拒绝随机分布，支持聚集倾向。' },
      { title: '计算 2：平均最近邻 z 检验', stem: '某设施的观察平均最近邻距离 Rₒ=140 m，CSR 期望距离 Rₑ=200 m，标准误 SE=25 m。用 z=(Rₒ−Rₑ)/SE 检验聚集性，请计算 z。', hint: '先算观察值与期望值的差，再除以标准误。', answer: -2.4, tolerance: 0.02, unit: '', explanation: 'z=(140−200)/25=−60/25=−2.40。z 小于 −1.96，说明最近邻距离显著短于随机期望，可判为显著聚集。' }
    ]
  },
  L05: {
    chineseLead: '传统相关只比较变量的共同变化；空间相关进一步追问：高值与低值是否在地图上成片出现，邻居之间是否系统性相似？',
    formulas: [
      { tag: '线性相关', name: 'Pearson 相关系数', expression: 'r = Σ[(xᵢ−x̄)(yᵢ−ȳ)] / √{Σ(xᵢ−x̄)² · Σ(yᵢ−ȳ)²}', read: '把协方差标准化，使结果位于 −1 到 +1。', vars: [['r','线性相关方向与强度'],['xᵢ, yᵢ','第 i 个观测的两个变量值'],['x̄, ȳ','两个变量的均值']], decision: 'r 接近 +1：强正线性相关；接近 −1：强负线性相关；接近 0：无线性相关。', why: '“无相关”不等于“无关系”，弯曲关系或共同驱动因素可能让 r 接近 0。' },
      { tag: '空间统计核心', name: 'Global Moran’s I', expression: 'I = [n / S<sub>0</sub>] · [ΣᵢΣⱼ wᵢⱼzᵢzⱼ / Σᵢzᵢ²]，zᵢ=xᵢ−x̄', read: '用空间权重 wᵢⱼ 将相邻单元的“偏离均值程度”相乘并汇总。', vars: [['wᵢⱼ','i 与 j 的空间权重'],['zᵢ','第 i 个单元相对均值的偏差'],['S₀','全部空间权重之和'],['n','空间单元数量']], decision: '显著且 z-score 为正：同类值聚集；显著且 z-score 为负：高低交错、倾向离散；不显著：不能拒绝随机空间过程。', why: 'Moran’s I 既由数值决定，也由“谁是邻居”的 W 决定。没有 W，就没有明确的空间自相关。' },
      { tag: '随机参照', name: 'Moran’s I 的期望值', expression: 'E[I] = −1 / (n−1)', read: '在随机化假设下，Moran’s I 的理论期望值并非严格等于 0。', vars: [['n','空间单元数量']], decision: '实际 I 必须结合期望值、方差、z-score 和 p 值解释，不能只看 I 的正负。', why: '当 n 较大时，−1/(n−1) 才接近 0；样本较小时更要避免把 0 当作唯一基线。' }
    ],
    terms: [['correlation','相关'],['covariance','协方差'],['spatial autocorrelation','空间自相关'],['spatial weights matrix, W','空间权重矩阵'],['contiguity','邻接关系'],['Global Moran’s I','全局 Moran I'],['Local Moran’s I / LISA','局部 Moran I／局部空间关联'],['hot spot / cold spot','热点／冷点']],
    caseIds: ['esri-moran','nasa-urban-heat'],
    extraQuiz: [
      { q: 'Pearson r=0 最稳妥的解释是什么？', options: ['没有线性关联', '完全没有任何关系', '不存在因果关系', '样本一定随机'], answer: 0, why: 'Pearson r 只度量线性关系；非线性关系仍可能很强。' },
      { q: '在 Queen 邻接中，两个行政区只共享一个角点，它们通常是否算邻居？', options: ['算', '不算', '取决于变量单位', '只有 p<0.05 才算'], answer: 0, why: 'Queen 邻接将共享边或节点（角点）的多边形都视为邻居。' },
      { q: 'Global Moran’s I 显著且 z-score 为正，最贴近的解释是？', options: ['相似高/低值在空间上成片出现', '高低值严格交替', '不存在空间结构', '因变量一定由邻居导致'], answer: 0, why: '正 z-score 对应比随机更强的空间聚集；不能由此直接断言因果。' },
      { q: 'LISA 的 HL 类型通常指什么？', options: ['高值被低值邻居包围', '高值被高值邻居包围', '低值被低值邻居包围', '无显著性区域'], answer: 0, why: 'HL=High-Low，是局部空间离群。' },
      { q: '为什么不能把多个 W 试一遍后只报告最显著的一个？', options: ['会产生选择性报告，且掩盖邻居定义假设', '因为 W 永远不可改变', '因为 Moran I 不需要 W', '因为 p 值只能是 1'], answer: 0, why: 'W 是研究假设的一部分，应依据空间过程预先说明并做稳健性讨论。' }
    ],
    calculations: [
      { title: '计算 1：置换检验 pseudo p 值', stem: 'Global Moran’s I 的 999 次置换中，有 6 次模拟统计量不小于观测值。用右尾 pseudo p=(r+1)/(999+1) 计算 p 值。', hint: '置换检验要把观测结果本身也计入分子和分母。', answer: 0.007, tolerance: 0.001, unit: '', explanation: 'p=(6+1)/(999+1)=7/1000=0.007。若显著性水平 α=0.05，可拒绝空间随机假设，认为存在正空间自相关证据。' },
      { title: '计算 2：Moran’s I 标准化检验', stem: '某县域变量的 Moran’s I=0.420，随机期望 E[I]=−0.034，Var[I]=0.0180。用 z=(I−E[I])/√Var[I] 计算 z-score。', hint: '先求 √0.0180，再注意 I−E[I] 是减去负数。', answer: 3.38, tolerance: 0.02, unit: '', explanation: '√0.0180≈0.134；z=(0.420−(−0.034))/0.134≈3.38。该 z 值远高于 1.96，说明正空间自相关高度显著。' }
    ]
  },
  L06: {
    chineseLead: '回归不是“画一条线”而已，而是把“解释什么、控制什么、残差还剩什么空间结构”完整说清楚。',
    formulas: [
      { tag: '模型骨架', name: '简单线性回归', expression: 'ŷᵢ = β<sub>0</sub> + β<sub>1</sub>xᵢ；eᵢ = yᵢ − ŷᵢ', read: '预测值等于截距加斜率乘以自变量；残差是真实值与预测值的差。', vars: [['β₀','截距：x=0 时的预测基线'],['β₁','斜率：x 每增加 1 单位，ŷ 的条件变化'],['eᵢ','第 i 个观测的未解释部分']], decision: 'β₁ 的符号说明关联方向；是否可解释为因果还取决于研究设计、遗漏变量与反向因果等问题。', why: 'OLS 通过最小化 Σe² 来选择系数；大残差会被平方后更重地惩罚。' },
      { tag: '拟合度', name: '决定系数 R²', expression: 'R<sup>2</sup> = SSR / SST = 1 − SSE / SST', read: '总变异中被模型解释的比例。', vars: [['SST','y 相对均值的总平方和'],['SSR','回归解释的平方和'],['SSE','残差平方和']], decision: 'R² 越高，样本内拟合越好；它不是因果强度，也不等于在新地区/新年份上的预测能力。', why: '必须配合残差诊断、交叉验证、理论机制和空间自相关检验。' },
      { tag: '地理异质性', name: '地理加权回归（GWR）', expression: 'yᵢ = β<sub>0</sub>(uᵢ,vᵢ) + Σβ<sub>k</sub>(uᵢ,vᵢ)x<sub>ik</sub> + εᵢ', read: '允许回归系数随空间位置 (uᵢ,vᵢ) 改变。', vars: [['(uᵢ,vᵢ)','第 i 个位置的坐标'],['βₖ(uᵢ,vᵢ)','该位置的局部系数'],['带宽','决定多大邻域参与局部估计']], decision: 'GWR 的系数图只表示局部估计，仍需检查带宽、局部共线性、残差与显著性。', why: '一条全局 OLS 线可能掩盖不同地区不同机制；但 GWR 也可能因小带宽产生不稳定估计。' }
    ],
    terms: [['dependent / response variable','因变量／响应变量'],['independent / explanatory variable','自变量／解释变量'],['ordinary least squares, OLS','普通最小二乘'],['residual','残差'],['coefficient of determination, R²','决定系数'],['multicollinearity','多重共线性'],['spatial nonstationarity','空间非平稳性'],['geographically weighted regression, GWR','地理加权回归']],
    caseIds: ['nasa-urban-heat','esri-moran'],
    extraQuiz: [
      { q: '若 β₁<0，最准确的描述是？', options: ['在模型设定下，x 增加通常对应预测 y 降低', 'x 一定导致 y 降低', '模型必然错误', 'R² 必定为负'], answer: 0, why: '回归系数描述条件关联方向；因果还需要研究设计与机制支撑。' },
      { q: '若残差地图显示城市中心持续为正、外围持续为负，优先怀疑什么？', options: ['模型遗漏了系统性空间机制或变量', '数据没有坐标', 'R² 一定等于 1', '所有系数必定为 0'], answer: 0, why: '残差有空间结构意味着误差不是纯随机，模型尚未解释完重要信息。' },
      { q: '多元回归中，β₂ 的正确读法是？', options: ['控制其它已纳入变量后，x₂ 增加一单位对应 y 的条件变化', 'x₂ 与 y 的绝对因果效应', 'x₂ 的标准差', '模型的总样本量'], answer: 0, why: '多元系数是“其它自变量保持不变”条件下的边际关联。' },
      { q: 'GWR 的带宽过小最常见的风险是什么？', options: ['局部样本过少，系数不稳定', '自动消除共线性', '让所有系数相同', '不需要坐标'], answer: 0, why: '带宽太小时，每个局部模型可用的邻近观测太少，方差会升高。' },
      { q: 'R² 高但残差仍显著 Moran’s I，最合理的下一步是？', options: ['诊断空间遗漏、变量、模型形式或空间模型', '立刻宣布因果成立', '忽略残差', '删除所有空间变量'], answer: 0, why: '拟合度与误差独立性是不同维度；空间残差提示模型需要进一步诊断。' }
    ],
    calculations: [
      { title: '计算 1：回归系数 t 检验', stem: 'OLS 中 NDVI 系数 β=-0.62，标准误 SE=0.18。检验 H₀:β=0 时，t=β/SE。请计算 t 值。', hint: '系数为负，t 值也应为负；保留两位小数。', answer: -3.44, tolerance: 0.02, unit: '', explanation: 't=-0.62/0.18≈−3.44。若自由度较大，|t|>1.96，说明该负相关系数在 5% 水平下显著。' },
      { title: '计算 2：整体模型 F 检验', stem: '一个多元回归样本量 n=48，自变量个数 k=3，R²=0.42。用 F=(R²/k)/[(1−R²)/(n−k−1)] 计算整体 F 统计量。', hint: '分子是 0.42/3，分母是 0.58/44。', answer: 10.62, tolerance: 0.03, unit: '', explanation: 'F=(0.42/3)/(0.58/44)=0.14/0.01318≈10.62。F 值较大时，说明整体模型相对只用均值预测有显著改进。' }
    ]
  },
  L07: {
    chineseLead: '项目讲最重要的不是“把工具串起来”，而是每一步都要回到研究问题：你为什么需要这个数据、这个指标、这个模型和这张图？',
    formulas: [
      { tag: '项目框架', name: 'PPDAC 研究闭环', expression: 'Problem → Plan → Data → Analysis → Conclusion', read: '从问题到方案、数据、分析、结论的完整证据链。', vars: [['Problem','明确对象、范围、时间与要回答的问题'],['Plan','确定分析单位、指标、对比与验证策略'],['Data','记录来源、时间、精度、偏差'],['Analysis','把数据转换为可检验的证据'],['Conclusion','回答问题并说明局限']], decision: '一张图、一段代码、一项指标都要能对应 PPDAC 中的一个位置。', why: '项目质量通常不取决于算法数量，而取决于问题、数据、方法和结论是否闭合。' },
      { tag: '指标构造', name: '加权综合指数（通用形式）', expression: 'Index = Σ w<sub>k</sub> · z<sub>k</sub>，且 Σw<sub>k</sub>=1', read: '把多个标准化指标按权重加总为一个综合评分。', vars: [['zₖ','第 k 个标准化后的子指标'],['wₖ','子指标权重']], decision: '权重必须有理论、政策或数据驱动依据；不同权重方案应做敏感性分析。', why: '综合指数很适合表达复杂概念，但最容易隐藏权重选择带来的主观性。' }
    ],
    terms: [['problem statement','研究问题'],['study area','研究区'],['spatial unit','空间分析单元'],['indicator','指标'],['technical route','技术路线'],['validation','验证'],['uncertainty','不确定性'],['poster / presentation','海报／答辩展示']],
    caseIds: ['tokyo-project','usgs-landcover-grid'],
    extraQuiz: [
      { q: 'PPDAC 中，先明确“研究对象、范围、时间、决策价值”属于哪一步？', options: ['Problem', 'Data', 'Analysis', 'Conclusion'], answer: 0, why: '这是把宽泛兴趣转成可回答研究问题的阶段。' },
      { q: '在技术路线中加入“精度验证/敏感性分析”，最主要作用是什么？', options: ['评估结果是否稳健可信', '让流程图更复杂', '替代数据来源说明', '保证结果一定显著'], answer: 0, why: '验证不能保证结论正确，但能量化或识别不确定性与参数敏感性。' },
      { q: '若使用 POI 数据研究餐饮可达性，首先应在数据部分交代什么？', options: ['数据时间、覆盖与潜在缺失/分类偏差', '只需写地图颜色', '无需说明来源', '只需展示结果'], answer: 0, why: 'POI 并非完整普查，时效性与平台偏差会影响结论。' },
      { q: '一个项目结果图很好看，但没有解释方法为何适用于问题，主要缺什么？', options: ['方法与研究问题之间的论证', '更多渐变色', '更大的标题', '更多软件截图'], answer: 0, why: '项目不是工具展示；必须说明方法解决了什么证据问题。' },
      { q: '对于综合指数，最稳妥的报告方式是什么？', options: ['说明标准化、权重依据并做敏感性讨论', '隐藏权重避免质疑', '只报告最高地区', '默认所有权重正确'], answer: 0, why: '综合指数的关键不确定性常来自指标选择与权重。' }
    ],
    calculations: [
      { title: '计算 1：综合指数差异 z 检验', stem: '方案 A 的综合指数为 0.64，方案 B 为 0.58，bootstrap 得到差值标准误 SE=0.025。检验 H₀:A−B=0，用 z=(A−B)/SE 计算 z。', hint: '先算指数差 0.64−0.58，再除以标准误。', answer: 2.4, tolerance: 0.02, unit: '', explanation: 'z=(0.64−0.58)/0.025=0.06/0.025=2.40。若采用双侧 5% 阈值，差异达到显著水平，说明权重方案下 A 高于 B 的证据较强。' },
      { title: '计算 2：验证准确率置信区间', stem: '项目验证中 60 个独立样点有 42 个与结果一致。令 p̂=42/60，SE=√[p̂(1−p̂)/n]，95% 下限为 p̂−1.96SE。请计算下限。', hint: '先算 p̂=0.70，再算标准误，最后减去 1.96SE。', answer: 0.58, tolerance: 0.01, unit: '', explanation: 'SE=√(0.70×0.30/60)≈0.059；下限=0.70−1.96×0.059≈0.58。报告项目结果时应同时给出这种不确定性，而不是只报一个准确率。' }
    ]
  },
  L08: {
    chineseLead: '聚类是在“特征空间”里找相似对象；空间聚类则还会追问这些对象在地图上是否连片、是否被邻域约束。',
    formulas: [
      { tag: '相似性', name: '欧氏距离', expression: 'd(i,j) = √Σ<sub>k</sub>(x<sub>ik</sub>−x<sub>jk</sub>)<sup>2</sup>', read: '把两个对象在多个变量上的差异合成为一条直线距离。', vars: [['xᵢₖ, xⱼₖ','对象 i、j 在第 k 个变量上的数值'],['d(i,j)','不相似度：越小越相似']], decision: '变量量纲不同前要标准化，否则量纲大的变量会主导距离。', why: '“距离”并非唯一选择：分类变量、序数变量、文本和网络关系需要不同的相似性定义。' },
      { tag: 'K-means 目标', name: '簇内平方和（SSE）', expression: 'SSE = Σ<sub>k</sub> Σ<sub>x∈Cₖ</sub> ||x−μₖ||<sup>2</sup>', read: '衡量每个对象离所属簇中心有多远，并把所有距离平方后求和。', vars: [['Cₖ','第 k 个簇'],['μₖ','第 k 个簇的中心']], decision: 'K-means 尝试让 SSE 尽量小，但 SSE 随 k 增大通常会下降，因此不能只凭 SSE 选择 k。', why: '还应看肘部法、轮廓系数、稳定性与每一簇的地理/业务解释。' },
      { tag: '密度聚类', name: 'DBSCAN 两个关键参数', expression: 'ε（邻域半径） + MinPts（最小点数）', read: '若一个点的 ε 邻域内至少有 MinPts 个点，则可成为核心点。', vars: [['ε','多远以内算邻域'],['MinPts','邻域内至少需要多少点']], decision: 'ε 太大容易把不同簇粘在一起；太小会把许多点判为噪声。', why: 'DBSCAN 能识别任意形状簇和噪声，但对不同密度簇不够稳定；HDBSCAN/OPTICS 更适合密度差异大时。' }
    ],
    terms: [['cluster','簇／类别'],['intra-class similarity','类内相似度'],['inter-class dissimilarity','类间差异'],['partitioning clustering','划分聚类'],['hierarchical clustering','层次聚类'],['density-based clustering','基于密度的聚类'],['DBSCAN','基于密度的带噪声聚类'],['spatially constrained clustering','空间约束聚类']],
    caseIds: ['cluster-story','usgs-landcover-grid'],
    extraQuiz: [
      { q: '为什么多变量聚类前通常需要标准化？', options: ['避免量纲大的变量支配距离', '让所有样本变成同一类别', '删除空间坐标', '保证 k=3'], answer: 0, why: '例如人口（万人）和绿地率（0–1）若不标准化，人口数的数值范围会压过绿地率。' },
      { q: 'K-means 的簇中心通常是什么？', options: ['该簇样本的均值向量', '最远的样本', '随机选的行政区', '变量最大值'], answer: 0, why: 'K-means 反复更新每一簇的均值作为新的中心。' },
      { q: 'DBSCAN 相比 K-means 的明显优势是什么？', options: ['可识别噪声并适应非球形簇', '不需要任何参数', '必须指定 k', '只能做栅格'], answer: 0, why: 'DBSCAN 通过密度连接识别簇，能将稀疏点作为噪声。' },
      { q: '普通 K-means 的聚类结果在地图上不连片，是否一定错误？', options: ['不一定；它优化的是特征相似，不是空间连通', '一定错误', '说明坐标不是经纬度', '只能改用回归'], answer: 0, why: '若研究目标要求连片区域，才需要空间约束聚类。' },
      { q: '选择簇数 k 时，最合理的做法是？', options: ['结合指标、稳定性和可解释性', '总是取最大 k', '只按喜欢的颜色数量', '只看一次随机初始化'], answer: 0, why: '聚类没有唯一正确 k，统计诊断与领域解释必须共同判断。' }
    ],
    calculations: [
      { title: '计算 1：聚类稳定性置换 p 值', stem: '观测聚类的簇内 SSE 很小。999 次随机打乱标签中，有 24 次得到的 SSE 不大于观测 SSE。用 pseudo p=(r+1)/(999+1) 计算 p 值。', hint: '这是左尾置换检验：越小的 SSE 表示越紧凑。', answer: 0.025, tolerance: 0.002, unit: '', explanation: 'p=(24+1)/(999+1)=25/1000=0.025。若 α=0.05，可认为观测聚类紧凑性显著强于随机标签。' },
      { title: '计算 2：Calinski-Harabasz 指数', stem: 'n=60 个样本被分为 k=3 类，类间平方和 B=180，类内平方和 W=90。用 CH=(B/(k−1))/(W/(n−k)) 计算 CH 指数。', hint: '先算 B/(k−1)，再算 W/(n−k)。', answer: 57, tolerance: 0.05, unit: '', explanation: 'CH=(180/2)/(90/57)=90/1.579≈57.0。CH 越大通常表示类间分离更强、类内更紧凑，但仍需结合地图连通性和解释性。' }
    ]
  },
  L09: {
    chineseLead: '机器学习分类要把“训练得很好”和“对新区域也可靠”区分开：训练样本、特征、模型、验证集和误差类型缺一不可。',
    formulas: [
      { tag: '分类评价', name: '总体精度（Overall Accuracy）', expression: 'OA = (TP + TN) / (TP + TN + FP + FN)', read: '预测正确的样本数除以全部验证样本数。', vars: [['TP','真实为正且预测为正'],['TN','真实为负且预测为负'],['FP','误报：真实为负却预测为正'],['FN','漏报：真实为正却预测为负']], decision: '类别极不平衡时，OA 可能具有迷惑性；还要看各类别精度、召回率与 F1。', why: '例如 95% 都是背景，全部预测为背景也有 95% OA，却没有识别任何目标。' },
      { tag: '类别精度', name: 'Precision、Recall 与 F1', expression: 'Precision = TP/(TP+FP)；Recall = TP/(TP+FN)；F1 = 2PR/(P+R)', read: 'Precision 关注“判为该类的有多少是真的”；Recall 关注“真实该类抓到了多少”。', vars: [['Precision','查准率'],['Recall','召回率／查全率'],['F1','二者的调和平均']], decision: '对稀有目标（如温室、火点、道路裂缝）通常不能只报 OA。', why: 'Precision 与 Recall 往往有权衡：阈值放宽会抓到更多目标，也可能带来更多误报。' },
      { tag: '集成思想', name: '随机森林的多数投票', expression: 'ŷ = mode{T<sub>1</sub>(x), T<sub>2</sub>(x), …, T<sub>B</sub>(x)}', read: '许多略有差异的决策树分别投票，票数最多的类别为最终预测。', vars: [['Tᵦ(x)','第 b 棵树对样本 x 的类别预测'],['mode','众数／最多票的类别']], decision: '单棵树容易对训练样本过拟合；多棵随机树的投票通常更稳健。', why: '但随机森林仍受训练样本代表性、特征质量、标签噪声和空间迁移差异制约。' }
    ],
    terms: [['training sample','训练样本'],['validation / test set','验证集／测试集'],['feature','特征'],['decision tree','决策树'],['ensemble learning','集成学习'],['random forest','随机森林'],['confusion matrix','混淆矩阵'],['overfitting','过拟合']],
    caseIds: ['usgs-landcover-grid','forest-story'],
    extraQuiz: [
      { q: '为什么应将训练样本与测试样本分开？', options: ['检验模型对未见样本的泛化能力', '让样本数看起来更多', '避免计算混淆矩阵', '保证 OA=100%'], answer: 0, why: '用训练数据评估会高估性能；测试集应尽量独立。' },
      { q: '对稀有类别，哪一组指标比只报告 OA 更有信息？', options: ['Precision、Recall、F1', '只有总样本量', '坐标系名称', '栅格颜色'], answer: 0, why: '它们可揭示误报与漏报，尤其适合目标稀少时。' },
      { q: '随机森林中每棵树“略有不同”的来源主要包括什么？', options: ['Bootstrap 样本与随机特征子集', '每棵树使用同一数据且无随机性', '只改变地图颜色', '删除验证集'], answer: 0, why: '两种随机性降低树之间的相关性，使投票更稳健。' },
      { q: '训练集精度很高、测试集明显较低，最常见担忧是什么？', options: ['过拟合或训练/测试分布不一致', '模型一定完美', '数据已不需要检查', '分类类别过少'], answer: 0, why: '模型可能记住训练样本细节而不是学习可迁移规律。' },
      { q: '在遥感分类中，为什么要重视样本空间分布？', options: ['避免相邻像元泄漏使精度虚高，并覆盖不同地物条件', '只为了让地图更漂亮', '让 NDVI 恒定', '替代现场核验'], answer: 0, why: '同一影像中相邻像元高度相似，随机切分可能造成空间泄漏。' }
    ],
    calculations: [
      { title: '计算 1：稀有类别 F1 分数', stem: '温室识别中 TP=36，FP=12，FN=9。Precision=TP/(TP+FP)，Recall=TP/(TP+FN)，F1=2PR/(P+R)。请计算 F1。', hint: '先分别计算 Precision 和 Recall，再代入 F1。', answer: 0.77, tolerance: 0.01, unit: '', explanation: 'Precision=36/48=0.75；Recall=36/45=0.80；F1=2×0.75×0.80/(0.75+0.80)≈0.77。F1 比 OA 更能反映稀有类别的识别质量。' },
      { title: '计算 2：两模型 McNemar 检验', stem: '同一测试集上，模型 A 错而模型 B 对的样本 n₀₁=18，模型 A 对而模型 B 错的样本 n₁₀=6。用连续性校正 χ²=(|n₀₁−n₁₀|−1)²/(n₀₁+n₁₀) 计算统计量。', hint: '只使用两个模型预测不一致的样本数。', answer: 5.04, tolerance: 0.03, unit: '', explanation: 'χ²=(|18−6|−1)²/(18+6)=11²/24≈5.04。与 df=1 的 5% 临界值 3.84 比较，模型差异达到显著水平。' }
    ]
  },
  L10: {
    chineseLead: '时空分析把“哪里”与“何时”放在同一张证据表里：一个地方当期是热点，不代表它在时间上是新出现、持续还是强化。',
    formulas: [
      { tag: '数据组织', name: '时空立方体的 bin 数量', expression: '总 bin 数 = 空间格网数 × 时间步数', read: '把空间位置与时间切片交叉，得到一组“空间格 × 时间段”的条柱（bin）。', vars: [['空间格网数','行×列，或定义位置的数量'],['时间步数','月、周、日或其它聚合周期']], decision: '空间 bin 和时间 bin 过小会稀疏、噪声大；过大则会掩盖局部与短期变化。', why: 'bin 尺寸不是纯参数，而是研究尺度假设，应该与事件频率和过程速度匹配。' },
      { tag: '趋势判断', name: '热点“新兴”并非单期高值', expression: '每个 bin 先做 Gi* → 再对时序热点结果做趋势检验', read: '先问每个时空 bin 是否是热点/冷点，再判断这种状态是否随时间出现趋势。', vars: [['Gi*','每个 bin 的热点/冷点统计'],['Mann–Kendall','非参数时间趋势检验']], decision: '新出现、持续、强化、减弱、历史热点等类型取决于时序显著性和趋势，不只取决于最后一期是否很高。', why: '这使时空热点分析比“逐年画八张热点图”更能描述过程。' }
    ],
    terms: [['spatio-temporal','时空'],['space-time cube','时空立方体'],['bin','时空条柱／单元'],['emerging hot spot','新兴热点'],['persistent hot spot','持续热点'],['intensifying hot spot','强化热点'],['Mann–Kendall trend test','Mann–Kendall 趋势检验'],['change point','变化点']],
    caseIds: ['spacetime-story','nasa-ecostress'],
    extraQuiz: [
      { q: '时空立方体中的一个 bin 最准确是什么？', options: ['一个空间位置在一个时间段内的聚合观测', '一张完整卫星影像', '一个行政区名称', '一个随机森林节点'], answer: 0, why: 'bin 将“空间单元”和“时间步”组合成可统计的基本单元。' },
      { q: '为什么不应只看最后一期热点图就称为“强化热点”？', options: ['强化热点还要求时序上的显著趋势', '最后一期不能有数值', 'Gi* 只用于回归', '热点不能随时间变化'], answer: 0, why: '新兴热点分析会对热点/冷点状态随时间的演化进行趋势判断。' },
      { q: '若时间 bin 设置得过细而事件非常稀少，常见后果是什么？', options: ['很多空 bin，统计不稳定', '趋势一定更准确', '不需要显著性检验', '空间单元自动消失'], answer: 0, why: '过细聚合会让事件数稀疏，噪声和零值比例增大。' },
      { q: '时空分析相对“多期静态地图”的主要增益是什么？', options: ['能显式描述位置与时间变化的联合结构', '不再需要数据时间戳', '自动提供因果结论', '总能减少数据量'], answer: 0, why: '它将变化过程作为研究对象，而不只是并排展示多张地图。' },
      { q: '变化点检测更接近回答哪类问题？', options: ['某位置的时间序列何时发生统计性质变化', '哪个点离谁最近', '分类树有几层', '影像放大多少倍'], answer: 0, why: '变化点检测关注均值、趋势或波动等时序性质在何时发生改变。' }
    ],
    calculations: [
      { title: '计算 1：Mann-Kendall S 统计量', stem: '某位置 5 期热点强度序列为 2、3、5、4、7。逐对比较后，若后一期大于前一期记 +1，小于记 −1。请计算 Mann-Kendall S。', hint: '共有 10 个时间对；数出正号个数和负号个数，S=正号数−负号数。', answer: 8, tolerance: 0.01, unit: '', explanation: '10 个时间对中有 9 个为正、1 个为负，因此 S=9−1=8。S 为正说明总体上升，但是否显著还要继续标准化为 z。' },
      { title: '计算 2：趋势检验 z 值', stem: '某时空 bin 的 Mann-Kendall S=14，Var(S)=28.33。无并列值时，S>0 可用 z=(S−1)/√Var(S)。请计算 z。', hint: '先求 √28.33，再用 13 除以它。', answer: 2.44, tolerance: 0.02, unit: '', explanation: 'z=(14−1)/√28.33=13/5.32≈2.44。该值超过 1.96，说明热点强度存在显著上升趋势，可支持“强化”解释。' }
    ]
  },
  L11: {
    chineseLead: '深度学习的关键不是“网络层数多”，而是从样本、标签、损失函数到验证指标形成一个可重复的学习与检验过程。',
    formulas: [
      { tag: '卷积尺寸', name: '卷积输出边长', expression: 'N<sub>out</sub> = ⌊(N + 2P − F) / S⌋ + 1', read: '输入大小 N 经卷积核 F、填充 P、步长 S 后的输出大小。', vars: [['N','输入特征图边长'],['F','卷积核大小'],['P','padding 填充'],['S','stride 步长']], decision: '步长变大或不做填充通常会使输出更小；这决定网络中的空间分辨率变化。', why: '卷积不是“自动放大影像”，它在局部窗口上提取特征；检测/分割还需解码、上采样或候选框机制。' },
      { tag: '一次局部计算', name: '卷积的加权求和', expression: 'feature(i,j) = Σ<sub>u,v</sub> image(i+u,j+v) · kernel(u,v)', read: '卷积核与局部像素窗口逐元素相乘后求和，得到一个特征值。', vars: [['image','输入影像或上一层特征图'],['kernel','可学习的局部权重'],['feature','输出特征图']], decision: '不同卷积核会对边缘、纹理、角点或复杂语义模式产生不同响应。', why: '训练的本质是用反向传播调整卷积核与偏置，使预测误差下降。' },
      { tag: '监督学习目标', name: '交叉熵损失（分类）', expression: 'L = −Σ<sub>c</sub> y<sub>c</sub> log(p<sub>c</sub>)', read: '真实类别 y 与模型预测概率 p 的差异越大，损失越大。', vars: [['yᶜ','真实 one-hot 标签'],['pᶜ','模型对类别 c 的预测概率']], decision: '训练集损失下降不等于模型泛化好；必须看独立验证集与类别级指标。', why: '遥感中的类别不平衡、标签噪声、域偏移和空间泄漏都会造成“看似高精度”的风险。' }
    ],
    terms: [['artificial intelligence, AI','人工智能'],['machine learning, ML','机器学习'],['deep learning, DL','深度学习'],['convolutional neural network, CNN','卷积神经网络'],['feature map','特征图'],['convolution','卷积'],['pooling','池化'],['object detection / semantic segmentation','目标检测／语义分割']],
    caseIds: ['cnn-story','usgs-landcover-grid'],
    extraQuiz: [
      { q: 'CNN 的“局部感受野”主要意味着什么？', options: ['每个卷积核先看局部窗口，再在全图滑动', '每层必须看整幅图像', '不需要输入影像', '只能处理 1 个像元'], answer: 0, why: '卷积核共享权重并在各位置扫描局部模式。' },
      { q: '目标检测与语义分割的主要区别是什么？', options: ['检测输出目标框/类别；语义分割为像元赋类', '二者完全相同', '检测不能使用 CNN', '分割不需要标签'], answer: 0, why: '二者都可能使用 CNN，但输出粒度不同。' },
      { q: '训练集损失很低、验证集损失升高常提示什么？', options: ['过拟合', '模型一定泛化更好', '无需验证', '标签完全一致'], answer: 0, why: '模型可能记住训练数据细节，未能迁移到未见样本。' },
      { q: '为什么遥感深度学习常需数据增强？', options: ['提高对旋转、光照、尺度等变化的鲁棒性', '让标签消失', '替代独立验证', '避免使用影像'], answer: 0, why: '适度增强可扩展训练分布，但不应产生违背地物物理规律的样本。' },
      { q: '像素级分类训练标签通常是什么形态？', options: ['与影像对齐的类别掩膜', '只有一个整图类别', '没有任何标签', '一条回归直线'], answer: 0, why: '语义分割要求每个像元/区域对应类别标签。' }
    ],
    calculations: [
      { title: '计算 1：语义分割 IoU', stem: '建筑物分割验证中 TP=420 个像元，FP=80，FN=100。IoU=TP/(TP+FP+FN)。请计算 IoU。', hint: 'IoU 不使用 TN，因为大量背景像元会掩盖目标类表现。', answer: 0.7, tolerance: 0.01, unit: '', explanation: 'IoU=420/(420+80+100)=420/600=0.70。对分割任务，IoU 往往比总体精度更能反映目标边界和漏检问题。' },
      { title: '计算 2：验证精度两比例 z 检验', stem: '模型 A 在 100 个独立样本中对 88 个，模型 B 对 78 个。用 pooled p=(88+78)/200，SE=√[p(1−p)(1/100+1/100)]，z=(0.88−0.78)/SE。请计算 z。', hint: '先算 pooled p=0.83，再算标准误。', answer: 1.88, tolerance: 0.02, unit: '', explanation: 'SE=√[0.83×0.17×0.02]≈0.053；z=0.10/0.053≈1.88。它接近但未超过 1.96，说明 5% 双侧检验下证据还不充分。' }
    ]
  },
  L12: {
    chineseLead: '地理空间大数据不只意味着“文件很大”，更意味着数据生成快、来源杂、质量不均、处理需要分布式策略，而且结果仍要可解释。',
    formulas: [
      { tag: '核心特征', name: '地理空间大数据的 Five V', expression: 'Volume · Velocity · Variety · Veracity · Value', read: '数据量、生成速度、类型多样、真实性/可信度与可提取价值。', vars: [['Volume','规模大'],['Velocity','更新/流入快'],['Variety','栅格、矢量、轨迹、文本、传感器等异构'],['Veracity','质量、偏差、缺失、不确定性'],['Value','能否形成有效知识与决策价值']], decision: '“数据多”并不自动产生价值；地理大数据项目往往最难的是 Veracity 与代表性。', why: '例如社交媒体/POI 数据可能更新快、覆盖广，却可能对某些人群或地区系统性缺失。' },
      { tag: '并行直觉', name: '理想任务波次', expression: '理想波次 = ⌈任务数 / worker 数⌉', read: '在任务完全均匀、没有调度和 I/O 开销的理想条件下，需要多少轮完成。', vars: [['任务数','可独立分割的空间块/时间块'],['worker','并行执行单元']], decision: '真实加速比通常低于理想值：数据读取、网络、倾斜分区和汇总会成为瓶颈。', why: '因此“大数据”方法不仅是换更多电脑，还包括分区、索引、数据格式、算子和质量控制。' }
    ],
    terms: [['geospatial big data','地理空间大数据'],['Volume / Velocity / Variety / Veracity / Value','五个 V'],['distributed computing','分布式计算'],['parallel processing','并行处理'],['spatial partitioning','空间分区'],['data skew','数据倾斜'],['cloud computing','云计算'],['reproducibility','可复现性']],
    caseIds: ['landsat-open','usgs-landcover-grid'],
    extraQuiz: [
      { q: 'Five V 中 Veracity 最接近什么问题？', options: ['数据质量、偏差、缺失与可信度', '数据颜色', '服务器品牌', '地图投影名称'], answer: 0, why: '大规模数据往往并不等于高质量数据，Veracity 是关键约束。' },
      { q: '空间分区后某一分区含 80% 数据、其它分区很少，称为什么？', options: ['数据倾斜', '标准化', '过拟合', '池化'], answer: 0, why: '数据倾斜会让少数 worker 成为瓶颈，拖慢整体任务。' },
      { q: '为什么分布式计算不一定线性加速？', options: ['存在 I/O、网络、调度和汇总开销', 'worker 数无关', '数据自动消失', '并行只能处理表格'], answer: 0, why: '增加 worker 会减少计算波次，但也可能增加协调成本。' },
      { q: '大规模 POI 数据最需要额外说明的质量问题之一是？', options: ['平台覆盖与用户/商家代表性偏差', '文件名长度', '只要点足够多就没有偏差', '无需时间戳'], answer: 0, why: '数据来源机制会影响谁被记录、何时更新、哪些地区缺失。' },
      { q: '可复现的大数据分析至少应保留什么？', options: ['数据版本、处理参数、代码/流程与运行环境说明', '只保留最终地图截图', '只记录结论', '删除中间步骤'], answer: 0, why: '大数据处理流程复杂，版本与参数记录是复现和审计的基础。' }
    ],
    calculations: [
      { title: '计算 1：POI 准确率单样本 z 检验', stem: '抽样核验 100 个 POI，有 84 个位置和类别均正确。若历史基准准确率 p₀=0.75，用 z=(p̂−p₀)/√[p₀(1−p₀)/n] 检验是否提高，请计算 z。', hint: '先算 p̂=0.84，再用原假设 p₀ 计算标准误。', answer: 2.08, tolerance: 0.02, unit: '', explanation: 'z=(0.84−0.75)/√(0.75×0.25/100)=0.09/0.043≈2.08。z 超过 1.96，说明样本支持 POI 准确率高于历史基准。' },
      { title: '计算 2：Amdahl 加速比', stem: '一个地理大数据流程中 20% 无法并行，80% 可并行。使用 8 个 worker 时，Amdahl 公式 S=1/(f+(1−f)/p)。请计算理论加速比。', hint: '令 f=0.20，p=8；分母为 0.20+0.80/8。', answer: 3.33, tolerance: 0.02, unit: '倍', explanation: 'S=1/(0.20+0.80/8)=1/0.30≈3.33 倍。即使 worker 很多，串行部分和 I/O 仍会限制大数据处理的真实加速。' }
    ]
  },
  L13: {
    chineseLead: '超分辨率真正要解决的不是“看起来更锐”，而是“细节是否可信、光谱是否失真、下游识别是否真的受益”。',
    formulas: [
      { tag: '评价指标', name: '峰值信噪比（PSNR）', expression: 'PSNR = 10 log<sub>10</sub>(MAX<sup>2</sup> / MSE)', read: '用重建图像与参考高分辨率图像的均方误差 MSE 评价像素重建质量。', vars: [['MAX','像素最大值，例如 8-bit 时为 255'],['MSE','重建与真值的均方误差']], decision: 'PSNR 越大通常表示像素误差更小，但它不能单独保证边缘、纹理或光谱物理真实性。', why: '遥感超分还要看 SSIM、光谱角、几何一致性，以及分类/检测等下游任务是否改善。' },
      { tag: '分辨率尺度', name: '空间分辨率与缩放倍率', expression: '目标像元大小 = 原像元大小 / 缩放倍率', read: '例如把 10 m 影像做 2× 重建，输出像元网格可写为 5 m。', vars: [['原像元大小','传感器原始采样间隔'],['缩放倍率','2×、4× 等']], decision: '输出网格更细不等于传感器真实信息量等价提升；必须避免将“生成细节”误认为“观测细节”。', why: '超分模型应尽量在配对数据或可信退化模型下训练，并进行外部验证。' },
      { tag: '传统全色锐化', name: 'Brovey 变换（RGB 简化形式）', expression: 'R<sub>out</sub> = [R<sub>in</sub> / (R<sub>in</sub>+G<sub>in</sub>+B<sub>in</sub>)] · Pan', read: '用高分辨率全色亮度调制低分辨率多光谱波段。', vars: [['R,G,B','低分辨率多光谱波段'],['Pan','高分辨率全色波段']], decision: 'Brovey 常使视觉更锐利，但可能产生光谱失真，因此并非所有定量任务都适合。', why: '选择方法时要区分“视觉展示”与“定量反演/分类”对光谱保真的不同要求。' }
    ],
    terms: [['super-resolution, SR','超分辨率'],['single-image SR, SISR','单幅影像超分'],['multi-image / multi-frame SR','多影像／多帧超分'],['pan-sharpening','全色锐化'],['PSNR','峰值信噪比'],['SSIM','结构相似性'],['spectral fidelity','光谱保真性'],['hallucinated detail','伪细节／幻觉细节']],
    caseIds: ['superres-story','landsat-open'],
    extraQuiz: [
      { q: '将 10 m 影像重采样为 5 m 网格，最稳妥的说法是？', options: ['输出采样更细，但不自动等于真实空间信息翻倍', '传感器一定获得了新的地面观测', '分类精度必定提高', '不再需要验证'], answer: 0, why: '重采样/超分输出更细，但真实性要通过参考数据与下游任务验证。' },
      { q: '为什么仅比较“看起来更清晰”不足以评价遥感超分？', options: ['可能出现光谱失真或伪细节，影响定量任务', '人眼无法看到影像', 'PSNR 永远相同', '遥感没有像元'], answer: 0, why: '视觉锐化与物理/光谱真实性不是同一件事。' },
      { q: 'PSNR 中 MSE 变小通常意味着什么？', options: ['PSNR 变大', 'PSNR 一定变小', '影像没有变化', '无需参考图像'], answer: 0, why: 'PSNR=10log10(MAX²/MSE)，分母越小，比例越大。' },
      { q: '全色锐化最常见的基本输入组合是什么？', options: ['高分辨率 Pan + 低分辨率多光谱 MS', '两张行政区表', '一个随机森林模型', '只有地面照片'], answer: 0, why: 'Pan 提供空间细节，MS 提供多光谱信息。' },
      { q: '对于下游地物分类任务，评估超分是否有效还应看什么？', options: ['分类/检测精度及光谱、几何一致性', '只看图片是否锐利', '只看文件大小', '只看缩放倍率'], answer: 0, why: '超分的实用价值应体现为可靠的下游性能，而不只是展示效果。' }
    ],
    calculations: [
      { title: '计算 1：PSNR 提升的配对 t 检验', stem: '10 个独立测试区中，超分模型相对基线的平均 PSNR 提升为 1.8 dB，提升值的标准误 SE=0.6。检验 H₀:平均提升=0，用 t=mean/SE 计算 t。', hint: '配对检验看的是每个测试区的提升差值。', answer: 3, tolerance: 0.02, unit: '', explanation: 't=1.8/0.6=3.00。若 df=9，双侧 5% 临界值约 2.26，说明 PSNR 提升在统计上显著。' },
      { title: '计算 2：PSNR 增益', stem: '同一 8-bit 测试集上，基线 MSE=100，新模型 MSE=64。PSNR 增益可写为 10log10(MSE_baseline/MSE_new)。请计算增益。', hint: 'MAX² 会在两种方法相减时抵消，只需计算 10log10(100/64)。', answer: 1.94, tolerance: 0.03, unit: 'dB', explanation: '10log10(100/64)=10log10(1.5625)≈1.94 dB。PSNR 增益需要再结合 SSIM、光谱保真和下游任务检验。' }
    ]
  }
};

window.REAL_CASES = {
  'nasa-urban-heat': {
    title: 'NASA：城市热岛的卫星温度对比', kicker: '真实遥感案例 · 用于模式、相关、回归和时空讨论', images: ['assets/cases/nasa_buffalo_urban_heat.jpg','assets/cases/nasa_providence_urban_heat.jpg'],
    alt: ['Buffalo 城市热岛卫星图','Providence 城市热岛卫星图'],
    text: 'NASA Earth Observatory 对比了 Buffalo 与 Providence 的 Landsat 7 温度图。它非常适合练习：先看温度高值的空间模式，再思考建成环境、植被与温度的相关/回归关系，最后扩展到多期热浪的时空过程。',
    prompt: '学习任务：不要直接说“高温由建筑造成”。请列出至少 3 个可能的混杂因素，并说明你会怎样用回归或空间自相关进一步检验。',
    sourceName: 'NASA Earth Observatory · Urban Heat Islands', sourceUrl: 'https://science.nasa.gov/earth/earth-observatory/urban-heat-islands-47704/', credit: '图像：NASA Earth Observatory（Buffalo / Providence，Landsat 7）'
  },
  'nasa-ecostress': {
    title: 'NASA ECOSTRESS：北京地表热环境图', kicker: '真实遥感案例 · 适合热岛、热点与时空分析', image: 'assets/cases/nasa_ecostress_beijing_heat.png', alt: 'NASA ECOSTRESS 北京热环境缩略图',
    text: 'ECOSTRESS 的城市热环境图库收录了北京等多个城市的热环境图。它可作为“单期空间格局”和“多时相热浪过程”之间差别的直观入口：一张热图告诉你哪里热，连续时间序列才可能说明热点如何出现、持续或强化。',
    prompt: '学习任务：若要判断某商业区是“强化热点”而不只是“某天很热”，你至少还需要哪些时间信息和统计步骤？',
    sourceName: 'NASA/JPL ECOSTRESS · Urban Heat Gallery', sourceUrl: 'https://ecostress.jpl.nasa.gov/urban_gallery', credit: '图像：NASA/JPL ECOSTRESS（北京，缩略图）'
  },
  'usgs-landcover-grid': {
    title: 'USGS：从影像到土地利用/覆盖图的工作流', kicker: '真实遥感案例 · 网格、分类、项目设计与大数据', image: 'assets/cases/usgs_rlcm_landcover.jpg', alt: 'USGS 从 Landsat 影像到土地利用覆盖图的工作流程',
    text: 'USGS 用“影像 → 点网格 → 解译赋类 → 土地利用/覆盖图”展示了一个完整的空间数据生产链。它可以衔接样方格网、项目 PPDAC、机器学习分类、时序制图与大数据质量控制：每一步都在把原始观测转化为可检验的空间证据。',
    prompt: '学习任务：请指出这个工作流里至少 2 个可能产生误差的环节，并分别给出一个验证或质量控制办法。',
    sourceName: 'USGS EROS · RLCM land-cover workflow', sourceUrl: 'https://www.usgs.gov/media/images/steps-making-a-land-use-and-land-cover-map-using-rlcm-tool', credit: '图像：USGS，Public Domain'
  },
  'esri-moran': {
    title: 'ArcGIS Pro：Global Moran’s I 的真实分析逻辑', kicker: '官方工具案例 · 从“指标”到“显著性”', svg: 'moran',
    text: 'ArcGIS Pro 的 Global Moran’s I 同时使用要素位置和属性值，返回 I、期望值、方差、z-score 与 p-value。这个案例提醒我们：Moran’s I 不应只看正负，必须在随机空间过程这一原假设下结合显著性解释。',
    prompt: '学习任务：为县域 NDVI 设计一套 W：你选择 Queen 邻接、距离阈值还是 k 近邻？为什么这种“邻居”定义更贴近过程？',
    sourceName: 'Esri ArcGIS Pro · Global Moran’s I documentation', sourceUrl: 'https://pro.arcgis.com/en/pro-app/latest/tool-reference/spatial-statistics/h-how-spatial-autocorrelation-moran-s-i-spatial-st.htm', credit: '图示：本网站重绘；方法说明参考 Esri 官方文档'
  },
  'tokyo-project': {
    title: '东京可持续外出就餐可及性：把多维概念变成空间指标', kicker: '课程项目案例 · PPDAC 与综合指数', svg: 'project',
    text: '课件案例以营养、环境影响、餐厅多样性、价格竞争力与拥挤度等维度构建可持续外出就餐指数，再评估空间不平等。它特别适合练习：如何让“复杂概念”经过指标选择、标准化、权重、敏感性分析后变成可解释的地图。',
    prompt: '学习任务：任选一个主题（医疗、绿地、充电站），设计 3 个可量化子指标，并说明各指标的来源与方向性。',
    sourceName: '课程 PDF 中引用的项目案例（Huang et al., Nature Cities, 2025）', sourceUrl: 'sources/L07.pdf', credit: '图示：本网站原创信息图；案例来自课程材料'
  },
  'cluster-story': {
    title: '从“相似”到“连片”：聚类的两套空间逻辑', kicker: '原创图解 · 适合 K-means、DBSCAN 与空间约束聚类', svg: 'cluster',
    text: 'K-means 会把特征相似的对象分到一起，却不保证地图连片；空间约束聚类增加邻接约束；DBSCAN 则以密度连接识别簇和噪声。选择方法前先问：你要的是“属性相似”、 “空间成团”，还是“两者兼有”？',
    prompt: '学习任务：把“街区收入、人口密度、绿地率”聚成 4 类时，若要求每一类必须连片，你会选择普通 K-means 还是空间约束聚类？说明理由。',
    sourceName: '本网站原创图解', sourceUrl: '', credit: '图示：本网站原创'
  },
  'forest-story': {
    title: '随机森林：多棵不完全相同的树如何投票', kicker: '原创图解 · 适合分类流程和不确定性理解', svg: 'forest',
    text: '单棵树容易受训练样本扰动影响；随机森林通过 Bootstrap 样本和随机特征子集训练多棵树，再由多数投票给出类别。它不等于“没有错误”，而是通过集成降低单树不稳定性。',
    prompt: '学习任务：若 9 棵树中 5 棵投“植被”、4 棵投“建设用地”，请说明最终类别与这个结果的不确定性。',
    sourceName: '本网站原创图解', sourceUrl: '', credit: '图示：本网站原创'
  },
  'spacetime-story': {
    title: '从静态热点到新兴热点：位置 × 时间的证据链', kicker: '原创图解 · 适合时空立方体和趋势解释', svg: 'spacetime',
    text: '把同一空间格在连续时间步的事件强度堆叠起来，才形成时空立方体。新兴热点分析不是“后期颜色更红”这么简单，而是每个时空 bin 的热点显著性再加时间趋势的联合判别。',
    prompt: '学习任务：请为“校园周边夜间交通事故”选择一个空间 bin 和时间 bin，并说明太大、太小分别会造成什么问题。',
    sourceName: '本网站原创图解', sourceUrl: '', credit: '图示：本网站原创'
  },
  'cnn-story': {
    title: '卷积网络如何从局部纹理走向遥感语义', kicker: '原创图解 · 适合 CNN、检测与像元分类', svg: 'cnn',
    text: '遥感 CNN 会先从局部边缘、纹理和形状抽取特征，再逐层组合为更高层的地物语义。目标检测关心“在哪里有什么”，像元分类关心“每个像元是什么”，两者的标签和输出都不同。',
    prompt: '学习任务：对于温室检测和土地利用语义分割，分别应该标注什么类型的样本？为什么不能直接复用同一种标签？',
    sourceName: '本网站原创图解', sourceUrl: '', credit: '图示：本网站原创'
  },
  'landsat-open': {
    title: 'Landsat：长期开放的地表观测数据链', kicker: '真实数据案例 · 适合大数据、时序与超分任务', svg: 'landsat',
    text: 'USGS 说明 Landsat 等长期遥感数据可用于土地覆盖、土地变化和城市扩张等研究。对课程学习而言，它把“单景影像处理”连接到“跨年份、跨区域、跨传感器”的大数据与时空分析问题。',
    prompt: '学习任务：若要比较 2015、2020、2025 的城市扩张，除了下载三景影像，还要控制哪些因素（季节、云、传感器、分辨率、分类方案等）？',
    sourceName: 'USGS EROS · Satellite Imagery', sourceUrl: 'https://www.usgs.gov/centers/eros/satellite-imagery', credit: '图示：本网站原创；背景资料参考 USGS'
  },
  'superres-story': {
    title: '超分辨率的边界：更清晰不等于更真实', kicker: '原创图解 · 适合超分、全色锐化与评价指标', svg: 'superres',
    text: '把一个低分辨率边界变锐利，可以帮助视觉解释，却也可能生成没有观测支持的伪纹理。遥感超分要同时衡量像素误差、结构相似、光谱保真、几何一致性和下游任务改善。',
    prompt: '学习任务：若你的超分图让道路边缘更清晰，但 NDVI 与原始影像差异显著变大，这张图适合做什么、不适合做什么？',
    sourceName: '本网站原创图解', sourceUrl: '', credit: '图示：本网站原创'
  }
};
