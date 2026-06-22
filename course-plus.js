/* =========================================================================
   course-plus.js  —  自包含学习增强模块（不修改原有文件，作为附加脚本加载）
   1) 在“详细讲解”每节文字之间注入概念配图（原创 SVG + 课件截图）
   2) 在“互动实验”页追加新的交互演示（DBSCAN / 决策树信息增益 / Moran 散点 / 超分质量）
   依赖：window.LECTURES、window.katex（均已由原页面加载）。
   ========================================================================= */
(() => {
  'use strict';
  const PAL = { ink:'#1d4257', sub:'#4e6b7a', line:'#d3e3ea', soft:'#f3f9fb',
    a:'#1e6f95', b:'#d46a57', c:'#2f9e8f', d:'#7463b6', warn:'#e0903e', dim:'#9fb6c1' };
  const accentOf = (lid) => (window.LECTURES || []).find(l => l.id === lid)?.accent || PAL.a;
  const el = (html) => { const t = document.createElement('template'); t.innerHTML = String(html).trim(); return t.content.firstElementChild; };
  function renderMath(root) {
    if (!window.katex || !root) return;
    root.querySelectorAll('[data-tex]').forEach((node) => {
      if (node.dataset.cpDone === '1') return;
      try { window.katex.render(node.getAttribute('data-tex'), node, { throwOnError:false, strict:'ignore', displayMode: node.classList.contains('cp-block') }); node.dataset.cpDone = '1'; } catch (_) {}
    });
  }

  /* ----------------------------- 原创 SVG 概念图库 ----------------------------- */
  const wrap = (vb, inner) => `<svg viewBox="${vb}" role="img" class="cp-svg" preserveAspectRatio="xMidYMid meet">${inner}</svg>`;
  const dots = (arr, r, fill) => arr.map(p => `<circle cx="${p[0]}" cy="${p[1]}" r="${r}" fill="${fill}"/>`).join('');

  const FIG = {
    pointPatterns() {
      const cl=[[60,60],[80,52],[72,80],[95,70],[58,92],[88,96],[110,58]];
      const rnd=[[210,55],[255,120],[230,80],[300,60],[280,150],[315,110],[200,140],[330,150]];
      const rg=[]; for(let r=0;r<4;r++)for(let c=0;c<4;c++) rg.push([430+c*32,46+r*32]);
      const panel=(x,t)=>`<rect x="${x}" y="22" width="170" height="170" rx="10" fill="${PAL.soft}" stroke="${PAL.line}"/><text x="${x+85}" y="212" text-anchor="middle" font-size="14" font-weight="700" fill="${PAL.sub}">${t}</text>`;
      return wrap('0 0 620 230',
        panel(30,'聚集 Clustered')+panel(225,'随机 Random')+panel(420,'规则 Dispersed')+
        dots(cl.map(p=>[p[0]-5,p[1]-5+25]),5,PAL.b)+
        dots(rnd.map(p=>[p[0]-25,p[1]-25+25]),5,PAL.a)+
        dots(rg.map(p=>[p[0]-5,p[1]+0]),5,PAL.c));
    },
    quadratGrid() {
      const counts=[2,0,1,0, 0,3,1,0, 1,0,4,2, 0,1,0,1];
      let cells='';
      for(let i=0;i<16;i++){const r=Math.floor(i/4),c=i%4,v=counts[i];
        cells+=`<rect x="${40+c*52}" y="${30+r*40}" width="52" height="40" fill="${v? `rgba(30,111,149,${0.12+0.18*v})`:'#fff'}" stroke="${PAL.line}"/>`+
        `<text x="${66+c*52}" y="${55+r*40}" text-anchor="middle" font-size="13" fill="${PAL.sub}">${v}</text>`;}
      const pts=[[55,45],[60,60],[150,80],[95,110],[100,118],[200,95],[205,150],[150,150],[210,160],[120,165],[250,55],[252,120]];
      return wrap('0 0 520 220', cells+dots(pts,3.4,PAL.b)+
        `<g transform="translate(300,40)"><text x="0" y="0" font-size="14" font-weight="700" fill="${PAL.ink}">样方计数 → 方差/均值</text>`+
        `<text x="0" y="34" font-size="13" fill="${PAL.sub}">VMR &gt; 1：少数格很多、多数格空</text>`+
        `<text x="0" y="58" font-size="13" fill="${PAL.sub}">→ 方差被拉大，倾向聚集</text>`+
        `<text x="0" y="92" font-size="13" fill="${PAL.sub}">VMR ≈ 1 随机；&lt; 1 规则</text>`+
        `<rect x="0" y="112" width="190" height="2" fill="${PAL.line}"/>`+
        `<text x="0" y="138" font-size="12" fill="${PAL.dim}">同一批点换格网尺度，VMR 会变</text></g>`);
    },
    kernelDecay() {
      const W=520,H=210,x0=58,x1=470,y0=170,y1=30,cx=(x0+x1)/2;
      const curve=(f,col,w)=>{let d='';for(let i=0;i<=80;i++){const u=-1+2*i/80;const px=cx+u*((x1-x0)/2);const py=y0-(y0-y1)*f(u);d+=(i?'L':'M')+px.toFixed(1)+' '+py.toFixed(1)+' ';}return `<path d="${d}" fill="none" stroke="${col}" stroke-width="${w}"/>`;};
      return wrap(`0 0 ${W} ${H}`,
        `<line x1="${x0}" y1="${y0}" x2="${x1}" y2="${y0}" stroke="${PAL.dim}" stroke-width="1.5"/>`+
        `<line x1="${cx}" y1="${y0}" x2="${cx}" y2="${y1}" stroke="${PAL.line}" stroke-width="1"/>`+
        curve(u=>Math.abs(u)<=1?1-u*u:0,PAL.a,3)+
        curve(u=>Math.abs(u)<=1?(1-u*u)*(1-u*u):0,PAL.d,2.5)+
        curve(u=>Math.abs(u)<=1?Math.max(0,1-Math.abs(u)):0,PAL.b,2)+
        `<text x="${cx}" y="${y0+20}" text-anchor="middle" font-size="12" fill="${PAL.sub}">中心 u=0</text>`+
        `<text x="${x0-6}" y="${y0+20}" font-size="12" fill="${PAL.sub}">−h</text>`+
        `<text x="${x1-6}" y="${y0+20}" font-size="12" fill="${PAL.sub}">+h</text>`+
        `<text x="20" y="${y1+6}" font-size="12" fill="${PAL.sub}">权重</text>`+
        `<g font-size="12" font-weight="700"><text x="330" y="44" fill="${PAL.a}">— Epanechnikov</text><text x="330" y="64" fill="${PAL.d}">— Biweight</text><text x="330" y="84" fill="${PAL.b}">— 三角核</text></g>`+
        `<text x="60" y="22" font-size="13" font-weight="700" fill="${PAL.ink}">核函数：离中心越远，贡献越小</text>`);
    },
    annRipley() {
      const pts=[[70,150],[95,120],[120,160],[150,110],[180,150],[140,180],[100,90]];
      let links='';for(let i=0;i<pts.length;i++){let bj=-1,bd=1e9;for(let j=0;j<pts.length;j++){if(i===j)continue;const d=Math.hypot(pts[i][0]-pts[j][0],pts[i][1]-pts[j][1]);if(d<bd){bd=d;bj=j;}}links+=`<line x1="${pts[i][0]}" y1="${pts[i][1]}" x2="${pts[bj][0]}" y2="${pts[bj][1]}" stroke="${PAL.b}" stroke-width="1.4" opacity=".55"/>`;}
      const rings=[24,46,70].map(r=>`<circle cx="380" cy="135" r="${r}" fill="none" stroke="${PAL.a}" stroke-width="1.4" stroke-dasharray="4 4" opacity=".7"/>`).join('');
      const ringPts=[[380,135],[360,120],[405,128],[350,150],[420,150],[395,170],[345,118],[430,118]];
      return wrap('0 0 520 230',
        `<text x="60" y="24" font-size="13" font-weight="700" fill="${PAL.ink}">ANN：只连最近一个邻居</text>`+
        `<text x="312" y="24" font-size="13" font-weight="700" fill="${PAL.ink}">Ripley K：多距离数邻居</text>`+
        links+dots(pts,4,PAL.ink)+rings+dots(ringPts,3.6,PAL.ink)+
        `<text x="60" y="210" font-size="12" fill="${PAL.sub}">R = 观测均距 / 随机期望</text>`+
        `<text x="312" y="210" font-size="12" fill="${PAL.sub}">K(d) 与 πd² 比较，看尺度</text>`);
    },
    scatterTypes() {
      const mk=(ox,sign,noise,t)=>{let s=`<rect x="${ox}" y="24" width="150" height="130" rx="9" fill="${PAL.soft}" stroke="${PAL.line}"/>`;for(let i=0;i<26;i++){const x=Math.random();const base=sign===0?Math.random():(sign>0?x:1-x);const y=Math.min(1,Math.max(0,base+(Math.random()-0.5)*noise));s+=`<circle cx="${ox+12+x*126}" cy="${148-y*120}" r="3" fill="${sign===0?PAL.dim:(sign>0?PAL.a:PAL.b)}"/>`;}return s+`<text x="${ox+75}" y="174" text-anchor="middle" font-size="13" font-weight="700" fill="${PAL.sub}">${t}</text>`;};
      return wrap('0 0 520 190', mk(20,1,0.25,'r ≈ +0.9 正相关')+mk(185,-1,0.25,'r ≈ −0.9 负相关')+mk(350,0,1,'r ≈ 0 无线性相关'));
    },
    moranGrid() {
      let g='';const v=[3,3,2,0,0, 3,3,1,0,0, 2,1,1,0,1, 0,0,0,3,3, 0,0,1,3,3];
      for(let i=0;i<25;i++){const r=Math.floor(i/5),c=i%5;const hi=v[i]>=2;g+=`<rect x="${30+c*34}" y="${34+r*30}" width="34" height="30" fill="${hi?PAL.b:'#bcd6e2'}" opacity="${0.45+0.16*v[i]}" stroke="#fff"/>`;}
      return wrap('0 0 520 220', g+
        `<rect x="30" y="34" width="34" height="30" fill="none" stroke="${PAL.ink}" stroke-width="2.5"/>`+
        `<rect x="64" y="34" width="34" height="30" fill="none" stroke="${PAL.warn}" stroke-width="2"/>`+
        `<rect x="30" y="64" width="34" height="30" fill="none" stroke="${PAL.warn}" stroke-width="2"/>`+
        `<g transform="translate(250,40)"><text x="0" y="0" font-size="13" font-weight="700" fill="${PAL.ink}">Moran's I：邻居偏差相乘求和</text>`+
        `<text x="0" y="30" font-size="13" fill="${PAL.sub}">黑框=目标格，橙框=它的邻居</text>`+
        `<text x="0" y="54" font-size="13" fill="${PAL.sub}">高邻高 / 低邻低 → I 为正</text>`+
        `<text x="0" y="78" font-size="13" fill="${PAL.sub}">高低交错（棋盘）→ I 为负</text>`+
        `<text x="0" y="110" font-size="12" fill="${PAL.dim}">没有权重矩阵 W，就没有空间自相关</text></g>`);
    },
    olsResiduals() {
      const pts=[];for(let i=0;i<16;i++){const x=0.06+i*0.058;const y=0.18+x*0.62+(Math.random()-0.5)*0.22;pts.push([x,Math.min(0.96,Math.max(0.04,y))]);}
      const X=x=>40+x*300,Y=y=>180-y*150;
      let sticks='';pts.forEach(p=>{const ly=0.18+p[0]*0.62;sticks+=`<line x1="${X(p[0])}" y1="${Y(p[1])}" x2="${X(p[0])}" y2="${Y(ly)}" stroke="${PAL.b}" stroke-width="1.4" opacity=".6"/>`;});
      return wrap('0 0 520 210',
        `<line x1="40" y1="180" x2="360" y2="180" stroke="${PAL.dim}"/><line x1="40" y1="30" x2="40" y2="180" stroke="${PAL.dim}"/>`+
        `<line x1="${X(0)}" y1="${Y(0.18)}" x2="${X(0.96)}" y2="${Y(0.18+0.96*0.62)}" stroke="${PAL.a}" stroke-width="3"/>`+
        sticks+dots(pts.map(p=>[X(p[0]),Y(p[1])]),3.6,PAL.ink)+
        `<g transform="translate(380,46)"><text x="0" y="0" font-size="13" font-weight="700" fill="${PAL.ink}">OLS：让残差²之和最小</text>`+
        `<text x="0" y="30" font-size="12" fill="${PAL.b}">红线段 = 残差 eᵢ</text>`+
        `<text x="0" y="52" font-size="12" fill="${PAL.sub}">大残差被平方后惩罚更重</text>`+
        `<text x="0" y="80" font-size="12" fill="${PAL.dim}">R² = 被解释变异 / 总变异</text></g>`);
    },
    gwrLocal() {
      let g='';for(let r=0;r<4;r++)for(let c=0;c<5;c++){const slope=(c/4-0.5)*1.2+(r-1.5)*0.1;const ang=Math.atan(slope);const cx=50+c*70,cy=44+r*44;const dx=Math.cos(ang)*16,dy=-Math.sin(ang)*16;g+=`<rect x="${cx-30}" y="${cy-20}" width="60" height="40" rx="6" fill="${PAL.soft}" stroke="${PAL.line}"/><line x1="${cx-dx}" y1="${cy-dy}" x2="${cx+dx}" y2="${cy+dy}" stroke="${slope>=0?PAL.a:PAL.b}" stroke-width="3" stroke-linecap="round"/>`;}
      return wrap('0 0 520 220', g+`<text x="40" y="210" font-size="13" fill="${PAL.sub}">GWR：每个位置一条局部斜率——全局一条线会掩盖区域差异</text>`);
    },
    distanceMetrics() {
      return wrap('0 0 520 200',
        `<rect x="30" y="24" width="220" height="150" rx="9" fill="${PAL.soft}" stroke="${PAL.line}"/>`+
        `<line x1="70" y1="150" x2="210" y2="60" stroke="${PAL.a}" stroke-width="3"/>`+
        `<path d="M70 150 H210 V60" fill="none" stroke="${PAL.b}" stroke-width="3" stroke-dasharray="6 5"/>`+
        `<circle cx="70" cy="150" r="5" fill="${PAL.ink}"/><circle cx="210" cy="60" r="5" fill="${PAL.ink}"/>`+
        `<text x="120" y="110" font-size="12" fill="${PAL.a}" transform="rotate(-30 120 110)">欧氏 d₂</text>`+
        `<text x="135" y="166" font-size="12" fill="${PAL.b}">曼哈顿 d₁</text>`+
        `<g transform="translate(280,52)"><text x="0" y="0" font-size="13" font-weight="700" fill="${PAL.ink}">距离 = 相似度的定义</text>`+
        `<text x="0" y="30" font-size="12" fill="${PAL.sub}">Minkowski：p=2 欧氏，p=1 曼哈顿</text>`+
        `<text x="0" y="52" font-size="12" fill="${PAL.sub}">量纲不同要先标准化</text>`+
        `<text x="0" y="80" font-size="12" fill="${PAL.dim}">距离变了，聚类结果就变</text></g>`);
    },
    clusterShapes() {
      const blob=(cx,cy,col)=>{let s='';for(let i=0;i<14;i++){const a=Math.random()*6.28,r=Math.random()*22;s+=`<circle cx="${cx+Math.cos(a)*r}" cy="${cy+Math.sin(a)*r}" r="3.2" fill="${col}"/>`;}return s;};
      let moon='';for(let i=0;i<22;i++){const a=Math.PI*(i/21);moon+=`<circle cx="${300+Math.cos(a)*60}" cy="${120-Math.sin(a)*40}" r="3.2" fill="${PAL.d}"/>`;}
      const noise=[[250,60],[420,70],[400,160],[260,150]];
      return wrap('0 0 520 210',
        `<text x="30" y="22" font-size="13" font-weight="700" fill="${PAL.ink}">K-means：球状、需指定 K</text>`+
        blob(80,80,PAL.a)+blob(120,150,PAL.c)+`<circle cx="80" cy="80" r="26" fill="none" stroke="${PAL.a}" stroke-dasharray="4 4"/><circle cx="120" cy="150" r="26" fill="none" stroke="${PAL.c}" stroke-dasharray="4 4"/>`+
        `<text x="250" y="22" font-size="13" font-weight="700" fill="${PAL.ink}">DBSCAN：任意形状 + 噪声</text>`+
        moon+dots(noise,3.2,PAL.dim)+`<text x="248" y="190" font-size="12" fill="${PAL.dim}">灰点=噪声（不归入任何簇）</text>`);
    },
    entropySplit() {
      const bar=(x,y,p,t)=>{const H=-(p>0&&p<1?(p*Math.log2(p)+(1-p)*Math.log2(1-p)):0);return `<rect x="${x}" y="${y}" width="120" height="16" rx="8" fill="#e6eef2"/><rect x="${x}" y="${y}" width="${120*H}" height="16" rx="8" fill="${PAL.a}"/><text x="${x+130}" y="${y+13}" font-size="12" fill="${PAL.sub}">${t} H=${H.toFixed(2)}</text>`;};
      return wrap('0 0 520 200',
        `<text x="24" y="22" font-size="13" font-weight="700" fill="${PAL.ink}">信息增益 = 分裂前熵 − 分裂后加权熵</text>`+
        bar(24,44,0.5,'父节点 (5/5)')+
        `<line x1="84" y1="70" x2="60" y2="96" stroke="${PAL.line}" stroke-width="2"/><line x1="84" y1="70" x2="300" y2="96" stroke="${PAL.line}" stroke-width="2"/>`+
        bar(24,100,0.83,'左 (5/1)')+bar(264,100,0.0,'右 (0/4)')+
        `<text x="24" y="150" font-size="12" fill="${PAL.c}" font-weight="700">右子集纯净 H=0；整体不纯度下降 → 这是好的划分</text>`+
        `<text x="24" y="174" font-size="12" fill="${PAL.dim}">决策树就挑“让熵下降最多”的特征</text>`);
    },
    convolution() {
      let inp='';for(let r=0;r<5;r++)for(let c=0;c<5;c++){const k=(r>=1&&r<=3&&c>=1&&c<=3);inp+=`<rect x="${30+c*30}" y="${40+r*30}" width="30" height="30" fill="${k? 'rgba(94,76,161,.18)':'#fff'}" stroke="${PAL.line}"/>`;}
      let ker='';for(let r=0;r<3;r++)for(let c=0;c<3;c++){ker+=`<rect x="${30+(c+1)*30}" y="${40+(r+1)*30}" width="30" height="30" fill="none" stroke="${PAL.d}" stroke-width="2.5"/>`;}
      let out='';for(let r=0;r<3;r++)for(let c=0;c<3;c++){const v=(r===1||c===1)?0.5:0.15;out+=`<rect x="${330+c*30}" y="${70+r*30}" width="30" height="30" fill="rgba(30,111,149,${v})" stroke="#fff"/>`;}
      return wrap('0 0 520 210',
        `<text x="30" y="28" font-size="13" font-weight="700" fill="${PAL.ink}">输入 5×5　·　3×3 核滑动　→　输出 3×3</text>`+
        inp+ker+`<path d="M195 115 H320" stroke="${PAL.d}" stroke-width="3"/><polygon points="320,115 308,108 308,122" fill="${PAL.d}"/>`+out+
        `<text x="30" y="200" font-size="12" fill="${PAL.sub}">核在每个位置做加权求和；同一组权重在全图共享（权重共享）</text>`);
    },
    pansharpen() {
      let lo='';for(let r=0;r<5;r++)for(let c=0;c<5;c++){lo+=`<rect x="${30+c*22}" y="${44+r*22}" width="22" height="22" fill="${(c+r)%2?'#9ec6da':'#cfe3ec'}" stroke="#fff"/>`;}
      let hi='';for(let r=0;r<10;r++)for(let c=0;c<10;c++){hi+=`<rect x="${330+c*13}" y="${44+r*13}" width="13" height="13" fill="${(Math.floor(c/2)+Math.floor(r/2))%2?'#8fbccf':'#d3e6ee'}" stroke="#fff"/>`;}
      return wrap('0 0 520 210',
        `<text x="30" y="30" font-size="13" font-weight="700" fill="${PAL.ink}">多光谱(低分,彩色)</text>`+lo+
        `<text x="180" y="120" font-size="13" font-weight="700" fill="${PAL.b}">+ 全色 P</text>`+
        `<path d="M250 115 H318" stroke="${PAL.b}" stroke-width="3"/><polygon points="318,115 306,108 306,122" fill="${PAL.b}"/>`+
        `<text x="330" y="30" font-size="13" font-weight="700" fill="${PAL.ink}">融合(高分,保色)</text>`+hi+
        `<text x="30" y="196" font-size="12" fill="${PAL.dim}">更清晰 ≠ 一定真实：需检查光谱保真</text>`);
    },
    qualityMetrics() {
      const grid=(ox,jit,t,col)=>{let s=`<text x="${ox+55}" y="26" text-anchor="middle" font-size="13" font-weight="700" fill="${PAL.ink}">${t}</text>`;for(let r=0;r<6;r++)for(let c=0;c<6;c++){const edge=(c===3);const base=edge?0.2:0.85;const v=Math.min(1,Math.max(0,base+(Math.random()-0.5)*jit));s+=`<rect x="${ox+c*18}" y="${36+r*18}" width="18" height="18" fill="rgba(40,70,90,${1-v})" stroke="#fff" stroke-width="0.5"/>`;}return s;};
      return wrap('0 0 520 180',
        grid(24,0,'参考 (Reference)',PAL.a)+grid(180,0.5,'重建 (Reconstruction)',PAL.b)+
        `<g transform="translate(360,44)" font-size="12" fill="${PAL.sub}"><text x="0" y="0" font-weight="700" fill="${PAL.ink}">逐像素 + 结构</text>`+
        `<text x="0" y="26">MSE↓ / RMSE↓</text><text x="0" y="48">PSNR↑ (dB)</text><text x="0" y="70">SSIM↑ (亮度·对比·结构)</text>`+
        `<text x="0" y="98" fill="${PAL.dim}">PSNR 高 ≠ 视觉/结构一定好</text></g>`);
    },
  };

  const slideFig = (src, cap) => ({ type:'slide', src, cap });
  const svgFig = (key, cap) => ({ type:'svg', key, cap });

  /* 每讲 4 节的配图（原创 SVG 与课件截图结合） */
  const GUIDE_FIGURES = {
    L04: [svgFig('pointPatterns','聚集 / 随机 / 规则：先用眼睛分清三种点模式，再用统计量验证'),
          svgFig('quadratGrid','样方分析：把“点不均匀”变成可计算的均值与方差比 VMR'),
          svgFig('kernelDecay','核函数：距离中心越远，单个点对密度的贡献越小'),
          svgFig('annRipley','ANN 看最近邻一个尺度，Ripley K 看多个距离尺度')],
    L05: [svgFig('scatterTypes','相关系数 r 的三种典型形态：正相关、负相关、无线性相关'),
          svgFig('moranGrid','空间自相关：邻居偏差相乘求和，由权重矩阵 W 决定谁是邻居'),
          slideFig('assets/slides/L05/page_43.jpg','课件原页：局部 Moran / LISA 的 HH、LL、HL、LH 四象限'),
          slideFig('assets/slides/L05/page_56.jpg','课件原页：Getis-Ord Gi* 热点 / 冷点识别')],
    L06: [svgFig('olsResiduals','OLS 通过最小化残差平方和拟合直线，红线段就是残差 eᵢ'),
          slideFig('assets/slides/L06/page_17.jpg','课件原页：决定系数 R² 与方差分解（SST = SSR + SSE）'),
          slideFig('assets/slides/L06/page_50.jpg','课件原页：残差的空间结构提示模型遗漏了空间机制'),
          svgFig('gwrLocal','GWR：允许回归系数随位置变化，捕捉空间非平稳性')],
    L08: [svgFig('distanceMetrics','欧氏 vs 曼哈顿：先定义“距离”，才有“相似”和聚类'),
          svgFig('clusterShapes','K-means 偏好球状簇；DBSCAN 按密度连通，能识别任意形状与噪声'),
          slideFig('assets/slides/L08/page_30.jpg','课件原页：层次聚类树状图与不同 linkage 规则'),
          slideFig('assets/slides/L08/page_46.jpg','课件原页：DBSCAN 的核心点 / 边界点 / 噪声点')],
    L09: [slideFig('assets/slides/L09/page_11.jpg','课件原页：常用光谱指数（NDVI/NDWI 等）的波段运算'),
          svgFig('entropySplit','信息增益：选择能让子节点熵下降最多的划分特征'),
          slideFig('assets/slides/L09/page_41.jpg','课件原页：决策树到随机森林的集成思想'),
          slideFig('assets/slides/L09/page_50.jpg','课件原页：随机森林的 Bagging 与 OOB 误差')],
    L11: [slideFig('assets/slides/L11/page_13.jpg','课件原页：从多层感知机到卷积网络的结构演进'),
          svgFig('convolution','卷积：3×3 核在影像上滑动做加权求和，权重在全图共享'),
          slideFig('assets/slides/L11/page_39.jpg','课件原页：卷积 / 池化 / 步幅如何改变特征图尺寸'),
          slideFig('assets/slides/L11/page_50.jpg','课件原页：分类与分割的精度评价指标')],
    L13: [svgFig('pansharpen','全色锐化：用高分辨率全色波段把多光谱影像变清晰'),
          slideFig('assets/slides/L13/page_11.jpg','课件原页：Brovey / IHS 等融合变换流程'),
          svgFig('qualityMetrics','超分质量：逐像素的 PSNR 与结构相似的 SSIM 一起看'),
          slideFig('assets/slides/L13/page_20.jpg','课件原页：超分辨率重建与质量评价')],
  };

  function buildFigure(spec, lid) {
    if (!spec) return null;
    const inner = spec.type === 'svg'
      ? (FIG[spec.key] ? FIG[spec.key]() : '')
      : `<img loading="lazy" src="${spec.src}" alt="${spec.cap}"/>`;
    if (!inner) return null;
    const fig = el(`<figure class="cp-figure cp-figure-${spec.type}" data-cp-figure="1">
        <div class="cp-figure-body">${inner}</div>
        <figcaption><span class="cp-figure-tag">${spec.type==='svg'?'图解':'课件'}</span>${spec.cap}</figcaption>
      </figure>`);
    fig.style.setProperty('--cp-accent', accentOf(lid));
    return fig;
  }

  function enhanceGuide(lid) {
    const specs = GUIDE_FIGURES[lid];
    if (!specs) return;
    const cards = document.querySelectorAll('#tabContent .lesson-card');
    cards.forEach((card, i) => {
      const body = card.querySelector('.lesson-body');
      if (!body || body.querySelector('[data-cp-figure]')) return;
      const fig = buildFigure(specs[i], lid);
      if (!fig) return;
      const formula = body.querySelector('.lesson-formula');
      const anchor = formula || body.querySelector('.lesson-core');
      if (anchor && anchor.parentNode === body) anchor.insertAdjacentElement('afterend', fig);
      else body.insertBefore(fig, body.firstChild);
    });
  }

  // expose for tests / later parts
  window.CoursePlus = { FIG, GUIDE_FIGURES, buildFigure, enhanceGuide, renderMath, el, accentOf, PAL };
})();

/* ============================ 新增交互演示（自包含） ============================ */
(() => {
  'use strict';
  const CP = window.CoursePlus; if (!CP) return;
  const { el, renderMath, accentOf } = CP;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  /* ---------- 纯逻辑（可单元测试，挂到 window.CoursePlusLogic） ---------- */
  function dbscan(points, eps, minPts) {
    const n = points.length, labels = new Array(n).fill(-2), core = new Array(n).fill(false); // -2 未访问, -1 噪声
    const region = (i) => { const r = []; for (let j=0;j<n;j++){ if (Math.hypot(points[i][0]-points[j][0], points[i][1]-points[j][1]) <= eps) r.push(j); } return r; };
    let cid = -1;
    for (let i=0;i<n;i++) {
      if (labels[i] !== -2) continue;
      const nb = region(i);
      if (nb.length < minPts) { labels[i] = -1; continue; }
      cid++; labels[i] = cid; core[i] = true;
      const seeds = nb.filter(j => j !== i);
      for (let k=0;k<seeds.length;k++){
        const q = seeds[k];
        if (labels[q] === -1) labels[q] = cid;
        if (labels[q] !== -2) continue;
        labels[q] = cid;
        const nbq = region(q);
        if (nbq.length >= minPts) { core[q] = true; nbq.forEach(x=>{ if(!seeds.includes(x)) seeds.push(x); }); }
      }
    }
    return { labels, core, clusters: cid + 1, noise: labels.filter(l=>l===-1).length };
  }
  function entropy(pos, neg) { const n = pos+neg; if (!n) return 0; const p = pos/n, q = neg/n; let h = 0; if (p>0) h -= p*Math.log2(p); if (q>0) h -= q*Math.log2(q); return h; }
  function infoGain(items, t) { // items: [{x,cls(0/1)}]
    const L = items.filter(d=>d.x<t), R = items.filter(d=>d.x>=t);
    const pe = entropy(items.filter(d=>d.cls===1).length, items.filter(d=>d.cls===0).length);
    const le = entropy(L.filter(d=>d.cls===1).length, L.filter(d=>d.cls===0).length);
    const re = entropy(R.filter(d=>d.cls===1).length, R.filter(d=>d.cls===0).length);
    const w = items.length || 1;
    return { parent: pe, left: le, right: re, gain: pe - (L.length/w)*le - (R.length/w)*re, nL:L.length, nR:R.length };
  }
  function moranIofGrid(v, n) { // v: length n*n, queen-ish rook neighbors
    const mean = v.reduce((a,b)=>a+b,0)/v.length;
    const z = v.map(x=>x-mean);
    let num=0, W=0; const den = z.reduce((a,b)=>a+b*b,0) || 1e-9;
    const at=(r,c)=>z[r*n+c];
    for (let r=0;r<n;r++) for (let c=0;c<n;c++){
      [[r-1,c],[r+1,c],[r,c-1],[r,c+1]].forEach(([rr,cc])=>{ if(rr>=0&&rr<n&&cc>=0&&cc<n){ num += at(r,c)*at(rr,cc); W++; } });
    }
    return { I: (v.length/W)*(num/den), z, mean };
  }
  function makeAutocorrField(n, rho) {
    if (rho < 0) {
      const a = Math.min(1, -rho);
      return Array.from({length:n*n}, (_,i)=>{ const r=Math.floor(i/n),c=i%n; const base=(r+c)%2?1:0; return a*base + (1-a)*Math.random(); });
    }
    let v = Array.from({length:n*n}, ()=>Math.random());
    const iters = Math.max(1, Math.round(1 + rho*7));
    for (let it=0; it<iters; it++){
      const nv = v.slice();
      for (let r=0;r<n;r++) for (let c=0;c<n;c++){
        let s=0,k=0; [[r-1,c],[r+1,c],[r,c-1],[r,c+1]].forEach(([rr,cc])=>{ if(rr>=0&&rr<n&&cc>=0&&cc<n){ s+=v[rr*n+cc]; k++; } });
        const nbMean = k? s/k : v[r*n+c];
        nv[r*n+c] = rho*nbMean + (1-rho)*v[r*n+c];
      }
      v = nv;
    }
    return v;
  }
  window.CoursePlusLogic = { dbscan, entropy, infoGain, moranIofGrid, makeAutocorrField };

  const card = (title, why, bodyHTML) => el(`<article class="cp-demo" data-cp-demo="1">
      <div class="cp-demo-head"><span class="cp-demo-pill">交互</span><h4>${title}</h4></div>
      <p class="cp-demo-why">${why}</p>
      <div class="cp-demo-body">${bodyHTML}</div>
    </article>`);
  const ctrl = (label, id, min, max, step, val) => `<label class="cp-ctrl"><span>${label}：<b id="${id}-v">${val}</b></span><input id="${id}" type="range" min="${min}" max="${max}" step="${step}" value="${val}"></label>`;
  const metricRow = (items) => `<div class="cp-metrics">${items.map(([k,id])=>`<div><span>${k}</span><strong id="${id}">—</strong></div>`).join('')}</div>`;

  /* ---------- DBSCAN（Lect.8） ---------- */
  function demoDBSCAN(lid) {
    const acc = accentOf(lid);
    const c = card('DBSCAN：用密度发现任意形状的簇', '调节邻域半径 ε 与最小点数 MinPts，观察核心点、边界点与噪声如何变化——它不需要预先指定簇数。',
      `<div class="cp-demo-grid"><div class="cp-canvas-wrap"><canvas width="440" height="300"></canvas></div>
       <div class="cp-controls">${ctrl('邻域半径 ε','cp-db-eps',12,46,1,24)}${ctrl('MinPts','cp-db-min',2,8,1,4)}
       <button type="button" class="cp-btn" data-act="regen">重新生成点</button>
       ${metricRow([['簇数','cp-db-k'],['核心点','cp-db-core'],['噪声点','cp-db-noise']])}
       <p class="cp-note">蓝/绿/紫=不同簇，描边=核心点，灰=噪声。ε 太小→全是噪声；ε 太大→簇被并成一团。</p></div></div>`);
    let pts = [];
    const gen = () => { pts = []; const moon=(cx,cy,sx,sy,f)=>{ for(let i=0;i<26;i++){ const a=Math.PI*(i/25); pts.push([cx+Math.cos(a)*70*sx+(Math.random()-0.5)*14, cy - f*Math.sin(a)*46*sy+(Math.random()-0.5)*14]); } };
      moon(150,140,1,1,1); moon(250,170,1,1,-1); for(let i=0;i<10;i++) pts.push([30+Math.random()*380, 30+Math.random()*240]); };
    const draw = () => {
      const cv=c.querySelector('canvas'), x=cv.getContext('2d'); const eps=+c.querySelector('#cp-db-eps').value, mp=+c.querySelector('#cp-db-min').value;
      c.querySelector('#cp-db-eps-v').textContent=eps; c.querySelector('#cp-db-min-v').textContent=mp;
      const res=dbscan(pts,eps,mp); const cols=[acc,'#2f9e8f','#d46a57','#7463b6','#e0903e','#3f7cad'];
      x.clearRect(0,0,cv.width,cv.height); x.fillStyle='#fbfdfe'; x.fillRect(0,0,cv.width,cv.height);
      pts.forEach((p,i)=>{ const l=res.labels[i]; x.beginPath(); x.arc(p[0],p[1],res.core[i]?6:4.5,0,7); x.fillStyle = l<0? '#b9c6cd' : cols[l%cols.length]; x.fill(); if(res.core[i]){ x.lineWidth=2; x.strokeStyle='#13384a'; x.stroke(); } });
      c.querySelector('#cp-db-k').textContent=res.clusters; c.querySelector('#cp-db-core').textContent=res.core.filter(Boolean).length; c.querySelector('#cp-db-noise').textContent=res.noise;
    };
    c.addEventListener('input', draw); c.addEventListener('click', e=>{ if(e.target.dataset.act==='regen'){ gen(); draw(); } });
    requestAnimationFrame(()=>{ gen(); draw(); });
    return c;
  }

  /* ---------- 决策树信息增益（Lect.9） ---------- */
  function demoEntropy(lid) {
    const acc = accentOf(lid);
    const c = card('决策树：移动阈值，看信息增益', '拖动分裂阈值，观察两类样本被分到左右子集后“不纯度（熵）”如何变化，信息增益最大处就是最佳划分点。',
      `<div class="cp-demo-grid"><div class="cp-canvas-wrap"><canvas width="440" height="220"></canvas></div>
       <div class="cp-controls">${ctrl('分裂阈值 t','cp-en-t',5,95,1,50)}<button type="button" class="cp-btn" data-act="best">跳到最佳阈值</button>
       ${metricRow([['父熵','cp-en-p'],['加权子熵','cp-en-c'],['信息增益','cp-en-g']])}
       <p class="cp-note cp-en-read">蓝=A 类，橙=B 类。两类重叠越少，越容易找到高信息增益的切分。</p></div></div>`);
    const items = []; for(let i=0;i<22;i++) items.push({x: clamp(25+Math.random()*25,0,100), cls:0}); for(let i=0;i<22;i++) items.push({x: clamp(55+Math.random()*30,0,100), cls:1});
    const draw = () => {
      const cv=c.querySelector('canvas'), x=cv.getContext('2d'); const t=+c.querySelector('#cp-en-t').value; c.querySelector('#cp-en-t-v').textContent=t;
      const X=v=>30+v/100*380; x.clearRect(0,0,cv.width,cv.height); x.fillStyle='#fbfdfe'; x.fillRect(0,0,cv.width,cv.height);
      x.strokeStyle='#cfdde4'; x.beginPath(); x.moveTo(30,150); x.lineTo(410,150); x.stroke();
      items.forEach(d=>{ x.beginPath(); x.arc(X(d.x), 150-(d.cls?18:-18)-(Math.random()*0), 5,0,7); x.fillStyle=d.cls?'#d46a57':acc; x.globalAlpha=.85; x.fill(); x.globalAlpha=1; });
      x.strokeStyle='#13384a'; x.lineWidth=2; x.setLineDash([5,4]); x.beginPath(); x.moveTo(X(t),24); x.lineTo(X(t),176); x.stroke(); x.setLineDash([]);
      x.fillStyle='#52707e'; x.font='12px system-ui'; x.fillText('A 类',34,206); x.fillText('B 类',34,30);
      const g=infoGain(items,t);
      c.querySelector('#cp-en-p').textContent=g.parent.toFixed(2); c.querySelector('#cp-en-c').textContent=((g.nL/items.length)*g.left+(g.nR/items.length)*g.right).toFixed(2); c.querySelector('#cp-en-g').textContent=g.gain.toFixed(3);
    };
    c.addEventListener('input', draw);
    c.addEventListener('click', e=>{ if(e.target.dataset.act==='best'){ let bt=50,bg=-1; for(let t=5;t<=95;t++){ const g=infoGain(items,t).gain; if(g>bg){bg=g;bt=t;} } c.querySelector('#cp-en-t').value=bt; draw(); } });
    requestAnimationFrame(draw); return c;
  }

  /* ---------- Moran 散点图（Lect.5） ---------- */
  function demoMoran(lid) {
    const acc = accentOf(lid); const n=8;
    const c = card("Moran's I 散点图：空间自相关有多强", '拖动“自相关强度”，左侧栅格的高低值分布会改变，右侧散点（值 vs 邻居均值）的斜率就是 Moran’s I。',
      `<div class="cp-demo-grid"><div class="cp-canvas-wrap"><canvas width="440" height="240"></canvas></div>
       <div class="cp-controls">${ctrl('自相关强度 ρ','cp-mo-r',-60,90,5,60)}<button type="button" class="cp-btn" data-act="regen">重新生成</button>
       ${metricRow([["Moran's I",'cp-mo-i'],['解读','cp-mo-t']])}
       <p class="cp-note">左：深色高值。ρ&gt;0 时同类成片、散点正斜率；ρ&lt;0 时高低交错、负斜率。</p></div></div>`);
    let field=null;
    const regen=()=>{ const rho=+c.querySelector('#cp-mo-r').value/100; field=CP_make(n,rho); };
    const draw=()=>{ const cv=c.querySelector('canvas'), x=cv.getContext('2d'); const rho=+c.querySelector('#cp-mo-r').value/100; c.querySelector('#cp-mo-r-v').textContent=rho.toFixed(2);
      if(!field) regen(); const v=field; const {I,z}=moranIofGrid(v,n);
      x.clearRect(0,0,cv.width,cv.height); x.fillStyle='#fbfdfe'; x.fillRect(0,0,cv.width,cv.height);
      const cell=22, ox=14, oy=24; const mn=Math.min(...v), mx=Math.max(...v);
      for(let r=0;r<n;r++)for(let cc=0;cc<n;cc++){ const t=(v[r*n+cc]-mn)/((mx-mn)||1); x.fillStyle=`rgba(30,111,149,${0.12+0.8*t})`; x.fillRect(ox+cc*cell, oy+r*cell, cell-1, cell-1); }
      x.fillStyle='#52707e'; x.font='12px system-ui'; x.fillText('栅格值（深=高）', ox, oy-8);
      // scatter
      const sx0=210, sy0=200, sw=210, sh=170; x.strokeStyle='#cfdde4'; x.strokeRect(sx0,sy0-sh,sw,sh);
      const lag=z.map((_,i)=>{ const r=Math.floor(i/n),cc=i%n; let s=0,k=0; [[r-1,cc],[r+1,cc],[r,cc-1],[r,cc+1]].forEach(([rr,c2])=>{if(rr>=0&&rr<n&&c2>=0&&c2<n){s+=z[rr*n+c2];k++;}}); return k?s/k:0; });
      const zmax=Math.max(...z.map(Math.abs))||1, lmax=Math.max(...lag.map(Math.abs))||1;
      const PX=zz=>sx0+ (zz/zmax/2+0.5)*sw, PY=ll=>sy0 - (ll/lmax/2+0.5)*sh;
      x.strokeStyle='#dde7ec'; x.beginPath(); x.moveTo(sx0,PY(0)); x.lineTo(sx0+sw,PY(0)); x.moveTo(PX(0),sy0); x.lineTo(PX(0),sy0-sh); x.stroke();
      z.forEach((zz,i)=>{ x.beginPath(); x.arc(PX(zz),PY(lag[i]),3.2,0,7); x.fillStyle=acc; x.globalAlpha=.8; x.fill(); x.globalAlpha=1; });
      // slope line = I
      x.strokeStyle='#d46a57'; x.lineWidth=2.4; x.beginPath(); x.moveTo(PX(-zmax), PY(-I*zmax*(lmax?1:1))); x.lineTo(PX(zmax), PY(I*zmax)); x.stroke();
      x.fillStyle='#52707e'; x.font='12px system-ui'; x.fillText('值 zᵢ', sx0+sw-34, sy0+14); x.save(); x.translate(sx0-6,sy0-sh+30); x.rotate(-Math.PI/2); x.fillText('邻居均值', 0,0); x.restore();
      c.querySelector('#cp-mo-i').textContent=I.toFixed(3); c.querySelector('#cp-mo-t').textContent = I>0.15?'正自相关·成片':(I<-0.15?'负自相关·交错':'接近随机');
    };
    const CP_make = window.CoursePlusLogic.makeAutocorrField;
    c.addEventListener('input', e=>{ if(e.target.id==='cp-mo-r'){ regen(); } draw(); });
    c.addEventListener('click', e=>{ if(e.target.dataset.act==='regen'){ regen(); draw(); } });
    requestAnimationFrame(()=>{ regen(); draw(); }); return c;
  }

  /* ---------- 超分质量 PSNR/SSIM（Lect.13） ---------- */
  function demoPSNR(lid) {
    const acc = accentOf(lid); const N=24;
    const c = card('超分辨率质量：清晰 ≠ 真实', '给重建图叠加噪声或模糊，观察 MSE / PSNR 的变化——视觉“更锐利”不一定带来更高的客观质量。',
      `<div class="cp-demo-grid"><div class="cp-canvas-wrap cp-psnr-wrap"><canvas width="200" height="200"></canvas><canvas width="200" height="200"></canvas></div>
       <div class="cp-controls">${ctrl('退化程度','cp-ps-n',0,80,2,24)}<label class="cp-ctrl-line"><span>方式</span><select id="cp-ps-mode"><option value="noise">加噪声</option><option value="blur">模糊</option></select></label>
       ${metricRow([['MSE','cp-ps-mse'],['PSNR(dB)','cp-ps-psnr']])}
       <p class="cp-note">左=参考，右=重建。噪声越大 MSE 越高、PSNR 越低；模糊会抹掉边缘细节。</p></div></div>`);
    const ref=[]; for(let i=0;i<N*N;i++){ const r=Math.floor(i/N),cc=i%N; ref.push((cc<N/2? 60:200) + (r%6<3?10:-10)); }
    const paint=(cv,arr)=>{ const x=cv.getContext('2d'), s=cv.width/N; for(let i=0;i<arr.length;i++){ const r=Math.floor(i/N),cc=i%N,val=clamp(arr[i],0,255)|0; x.fillStyle=`rgb(${val},${val},${val})`; x.fillRect(cc*s,r*s,s+0.5,s+0.5); } };
    const draw=()=>{ const lv=+c.querySelector('#cp-ps-n').value, mode=c.querySelector('#cp-ps-mode').value; c.querySelector('#cp-ps-n-v').textContent=lv;
      let rec=ref.slice();
      if(mode==='noise'){ rec=rec.map(v=>v+(Math.random()-0.5)*lv*2); }
      else { const t=lv/80; const blurred=ref.map((v,i)=>{ const r=Math.floor(i/N),cc=i%N; let s=0,k=0; for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){const rr=r+dr,c2=cc+dc; if(rr>=0&&rr<N&&c2>=0&&c2<N){s+=ref[rr*N+c2];k++;}} return s/k; }); rec=ref.map((v,i)=>v*(1-t)+blurred[i]*t); }
      const cvs=c.querySelectorAll('canvas'); paint(cvs[0],ref); paint(cvs[1],rec);
      let mse=0; for(let i=0;i<ref.length;i++){ const d=ref[i]-rec[i]; mse+=d*d; } mse/=ref.length;
      const psnr = mse<=0? 99 : 10*Math.log10(255*255/mse);
      c.querySelector('#cp-ps-mse').textContent=mse.toFixed(1); c.querySelector('#cp-ps-psnr').textContent=psnr.toFixed(1);
    };
    c.addEventListener('input', draw); c.addEventListener('change', draw); requestAnimationFrame(draw); return c;
  }

  const EXTRA = { L05:[demoMoran], L08:[demoDBSCAN], L09:[demoEntropy], L13:[demoPSNR] };

  function enhanceLab(lid) {
    const demos = EXTRA[lid]; if (!demos) return;
    const shell = document.querySelector('#tabContent .lab-shell'); if (!shell || shell.querySelector('[data-cp-lab]')) return;
    const sec = el(`<section class="cp-lab-extra" data-cp-lab="1"><div class="cp-lab-extra-head"><p class="eyebrow">课程外补充 · 交互演示</p><h3>再多动手几个关键机制</h3></div></section>`);
    sec.style.setProperty('--cp-accent', accentOf(lid));
    demos.forEach(fn => { try { sec.appendChild(fn(lid)); } catch(_){} });
    shell.appendChild(sec); renderMath(sec);
  }

  /* ------------------------------- 运行与观测 ------------------------------- */
  const curLid = () => document.querySelector('#lectureNav [data-nav-id].is-current')?.dataset.navId;
  const curTab = () => document.querySelector('.tab.is-active')?.dataset.tab;
  let raf = 0;
  function run() {
    const lid = curLid(), tab = curTab(); if (!lid) return;
    if (tab === 'guide') { CP.enhanceGuide(lid); const root=document.getElementById('tabContent'); CP.renderMath(root); }
    else if (tab === 'lab') enhanceLab(lid);
  }
  function schedule(){ cancelAnimationFrame(raf); raf = requestAnimationFrame(run); }
  function start() {
    const tc = document.getElementById('tabContent'); if (!tc) { setTimeout(start, 200); return; }
    new MutationObserver(schedule).observe(tc, { childList: true });
    schedule();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
