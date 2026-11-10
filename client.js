window.__ModuleLoader__.load({
  id: '@local/model-price-radar',
  factory(require) {
    const React = require('react')
    // Flatten child arrays so spread-built lists of tags/cards render on the
    // real React build and under the test harness alike.
    const h = (type, props, ...children) => React.createElement(
      type,
      props,
      ...children.flat(Infinity).filter((child) => child !== null && child !== undefined && child !== false),
    )
    const { useCallback, useEffect, useMemo, useRef, useState } = React

    const API = '/price-radar'
    const NS = 'model-price-radar'
    const CACHE_KEY = 'dsh.model-price-radar.v2'

    const DICT = {
      en: {
        title: 'Model price radar',
        subtitle: 'Live prices · scenario fit · one model at a time',
        refresh: 'Refresh',
        refreshing: 'Refreshing…',
        updated: 'updated',
        baseline: 'bundled snapshot',
        live: 'live',
        partial: 'partial sources',
        error: 'offline data',
        models: 'models',
        providers: 'providers',
        filters: 'Vendors',
        fx: 'FX',
        arena: 'Arena',
        noArena: 'no leaderboard data',
        search: 'Search a model, use case, or keyword',
        empty: 'No model matches these filters',
        selectAll: 'Select all',
        deselectAll: 'Clear all',
        showAll: 'Show all vendors',
        hideAll: 'Hide every vendor',
        recommendations: 'Recommendations',
        back: 'Back to list',
        groupFlagship: 'Flagships',
        groupQuality: 'Strongest',
        groupValue: 'Fully capable · best value',
        groupBudget: 'Good enough · lowest price',
        flagshipHint: 'each vendor at its best',
        qualityHint: 'strongest sub-flagship',
        valueHint: 'most capability per yuan among A/B',
        budgetHint: 'cheapest that still works',
        typicalTask: 'Typical task',
        perMillion: 'per 1M tokens',
        input: 'Input',
        output: 'Output',
        context: 'Context',
        maxOutput: 'Max output',
        tier: 'Tier',
        released: 'Released',
        openWeights: 'Open weights',
        modalities: 'Inputs',
        cacheRead: 'Cache read',
        cacheWrite: 'Cache write',
        priceSource: 'Price source',
        overview: 'Overview',
        priceCompare: 'Price comparison',
        officialApi: 'Official API',
        openRouterApi: 'OpenRouter',
        notListed: 'not listed on OpenRouter',
        priceNote: 'Price notes',
        peakOffPeak: 'Peak / off-peak price',
        peak: 'Peak',
        offPeak: 'Off-peak',
        peakHours: 'Peak hours',
        promo: 'Promotion',
        caps: 'Capabilities',
        scenarios: 'Best-fit scenarios',
        bestFor: 'Best for',
        useCases: 'Use cases',
        howToUse: 'How to get the best results',
        pros: 'Strengths',
        cons: 'Watch out for',
        sources: 'Sources',
        grade: 'Grade',
        noGrade: 'not rated',
        confidence: 'Confidence',
        taskCostFor: 'Typical %s request ≈',
        estimate: 'estimate',
        disclaimer: 'Prices follow the public sources and are converted to CNY at the FX rate above; the vendor invoice may differ slightly. OpenRouter prices are for reference only.',
        translated: 'Description translated to Chinese by the current harness model.',
        notTranslated: 'English description, no Chinese translation yet',
        all: 'All',
        channel: 'Channel',
        compareLine: 'Same typical request',
        loading: 'Loading prices…',
        tags: { tool: 'Tools', reasoning: 'Reasoning', vision: 'Vision', openWeights: 'Open weights', structured: 'Structured' },
      },
      zh: {
        title: '模型价格雷达',
        subtitle: '实时比价 · 场景选型 · 逐款细看',
        refresh: '刷新',
        refreshing: '刷新中…',
        updated: '更新于',
        baseline: '内置快照',
        live: '实时',
        partial: '部分来源',
        error: '离线数据',
        models: '个模型',
        providers: '家厂商',
        filters: '厂商',
        fx: '汇率',
        arena: '榜单',
        noArena: '暂无榜单数据',
        search: '搜索模型、场景或关键词',
        empty: '没有符合筛选条件的模型',
        selectAll: '全选',
        deselectAll: '全不选',
        showAll: '显示全部厂商',
        hideAll: '隐藏全部厂商',
        recommendations: '推荐',
        back: '返回列表',
        groupFlagship: '旗舰模型',
        groupQuality: '效果最好',
        groupValue: '完美胜任 · 性价比高',
        groupBudget: '基本满足 · 价格最低',
        flagshipHint: '各家最新最强的顶级型号',
        qualityHint: '各家次旗舰里能力最强',
        valueHint: 'A/B 评级里每元能力最大',
        budgetHint: '够用前提下价格从低到高',
        typicalTask: '典型任务',
        perMillion: '每百万 token 单价',
        input: '输入',
        output: '输出',
        context: '上下文',
        maxOutput: '最大输出',
        tier: '档位',
        released: '发布',
        openWeights: '开源权重',
        modalities: '输入模态',
        cacheRead: '缓存读',
        cacheWrite: '缓存写',
        priceSource: '价格来源',
        overview: '中文简介',
        priceCompare: '价格对照',
        officialApi: '官方 API',
        openRouterApi: 'OpenRouter',
        notListed: '未上架该型号',
        priceNote: '价格说明',
        peakOffPeak: '峰时 / 闲时价格',
        peak: '峰时',
        offPeak: '闲时',
        peakHours: '峰时时段',
        promo: '促销提醒',
        caps: '能力特点',
        scenarios: '适合的使用场景',
        bestFor: '最合适',
        useCases: '使用案例',
        howToUse: '如何用得更好',
        pros: '优点',
        cons: '注意事项',
        sources: '资料来源',
        grade: '评级',
        noGrade: '暂无评级',
        confidence: '证据强度',
        taskCostFor: '按「%s」典型请求估算',
        estimate: '估算',
        disclaimer: '价格取自公开数据源，按上方汇率换算为人民币，与厂商账单可能略有差异；OpenRouter 价格仅作参照。',
        translated: '介绍由当前 harness 模型翻译为中文。',
        notTranslated: '英文介绍，暂无中文翻译',
        all: '全部',
        channel: '渠道',
        compareLine: '同一典型请求',
        loading: '正在读取价格表…',
        tags: { tool: '工具', reasoning: '推理', vision: '视觉', openWeights: '开源权重', structured: '结构化输出' },
      },
    }

    /** Work scenarios: what the user actually does, and what it costs to do it. */
    const SCENARIOS = [
      { id: 'quick', name: '快问快答', nameEn: 'Quick answers', hint: '日常问答与快速改写', inputTokens: 5000, outputTokens: 1000, weights: { cost: 0.4, quality: 0.6 } },
      { id: 'writing', name: '中文写作', nameEn: 'Chinese writing', hint: '写作、翻译、润色', inputTokens: 3000, outputTokens: 2000, weights: { cost: 0.2, quality: 0.8 } },
      { id: 'docs', name: '文档办公', nameEn: 'Documents', hint: 'PPT / Word / Excel / MD / 思维导图', inputTokens: 8000, outputTokens: 8000, weights: { cost: 0.25, quality: 0.75 } },
      { id: 'code', name: '代码工具', nameEn: 'Code & tools', hint: '写代码、改文件、做网页', inputTokens: 20000, outputTokens: 4000, weights: { cost: 0.3, quality: 0.7 } },
      { id: 'ops', name: '运维排障', nameEn: 'Ops', hint: '服务器维护与命令解释', inputTokens: 15000, outputTokens: 2000, weights: { cost: 0.15, quality: 0.85 } },
      { id: 'agent', name: '智能体任务', nameEn: 'Agent tasks', hint: '多步自动任务与批量处理', inputTokens: 50000, outputTokens: 5000, weights: { cost: 0.2, quality: 0.8 } },
      { id: 'talk', name: '深度讨论', nameEn: 'Long discussion', hint: '长对话、查资料、研究', inputTokens: 100000, outputTokens: 3000, weights: { cost: 0.2, quality: 0.8 } },
    ]

    /** Arena boards that speak to a scenario. */
    const SCENARIO_BOARDS = {
      quick: ['text'],
      writing: ['text', 'document'],
      docs: ['document'],
      code: ['code'],
      ops: ['text', 'code'],
      agent: ['agent', 'code'],
      talk: ['text', 'search'],
    }

    /** Recommendation shelves: flagships first, then four cards per shelf. */
    const GROUPS = [
      { id: 'flagship', labelKey: 'groupFlagship', hintKey: 'flagshipHint' },
      { id: 'quality', labelKey: 'groupQuality', hintKey: 'qualityHint' },
      { id: 'value', labelKey: 'groupValue', hintKey: 'valueHint' },
      { id: 'budget', labelKey: 'groupBudget', hintKey: 'budgetHint' },
    ]

    const CASE_LIBRARY = {
      quick: [
        '把一段会议录音转写稿压缩成 5 条待办，并标出负责人。',
        '把一封英文邮件改写成礼貌、简短的中文回复。',
        '让它解释一段报错信息，并给出排查顺序。',
        '把一页产品说明概括成三句话，发给不熟悉业务的同事。',
      ],
      writing: [
        '把产品参数整理成一篇 800 字中文评测，保留关键数字。',
        '把口语化的草稿润色成可以直接发出的周报。',
        '同一段文案写三个语气版本：正式、轻松、强硬。',
        '把一篇英文新闻改写成适合公众号的中文短文。',
      ],
      docs: [
        '根据会议纪要生成 10 页 PPT 大纲和每页要点。',
        '把 30 页 PDF 提取成结构化 Word 纪要，附行动项。',
        '把一张表格的数据整理成 Excel 公式与图表建议。',
        '把一份方案改写成思维导图的三级节点。',
      ],
      code: [
        '把一个旧脚本交给它重构，要求先补测试再改实现。',
        '给它报错日志和相关文件，让它定位问题并给出补丁。',
        '从零搭一个带前后端的内部小工具，先交出可运行的最小版本。',
        '让它 review 一个 PR，按严重程度列出问题。',
      ],
      ops: [
        '给它 nginx 配置和 502 日志，定位上游超时原因。',
        '把一段 shell 命令逐行解释，并标出危险操作。',
        '规划一次零停机迁移的步骤、检查点和回滚方案。',
        '根据监控截图判断是带宽、连接数还是慢查询的问题。',
      ],
      agent: [
        '让它读一遍仓库，列出可以自动化的重复任务。',
        '给一个目标，让它自己拆步骤、调用工具、交付结果。',
        '批量处理 200 条工单：分类、分派、生成回复草稿。',
        '每天定时抓取竞品更新，汇总成一页简报。',
      ],
      talk: [
        '把一份 5 万字报告丢给它，连续追问结论和反例。',
        '和它做多轮辩论，检验一个商业假设的薄弱处。',
        '让它基于长对话整理研究提纲和资料清单。',
        '把几篇互相矛盾的论文放进去，让它列出一致与冲突之处。',
      ],
    }

    const CSS = `
.mpr-root {
  --mpr-canvas: #FAF9F5;
  --mpr-surface: #FFFFFF;
  --mpr-surface-2: #F3F1EA;
  --mpr-surface-3: #EAE7DD;
  --mpr-border: #E6E2D7;
  --mpr-border-strong: #D2CDC0;
  --mpr-text: #1F1E1D;
  --mpr-muted: #75716A;
  --mpr-accent: #D97757;
  --mpr-accent-dark: #C2603F;
  --mpr-accent-soft: #F8EBE4;
  --mpr-good: #46795A;
  --mpr-warn: #96671B;
  --mpr-bad: #A8412A;
  --mpr-shadow: 0 1px 2px rgba(31, 30, 29, .04);
  --mpr-serif: "Iowan Old Style", "Palatino Linotype", Palatino, Georgia, "Songti SC", "Noto Serif CJK SC", serif;
  --mpr-sans: ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  background: var(--mpr-canvas);
  color: var(--mpr-text);
  font-family: var(--mpr-sans);
  font-size: 13px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}
.mpr-root--dark {
  --mpr-canvas: #1F1E1D;
  --mpr-surface: #262625;
  --mpr-surface-2: #2E2D2A;
  --mpr-surface-3: #383632;
  --mpr-border: #3C3A36;
  --mpr-border-strong: #57544D;
  --mpr-text: #F2F0EA;
  --mpr-muted: #A19C92;
  --mpr-accent: #E08363;
  --mpr-accent-dark: #D97757;
  --mpr-accent-soft: #3B2A23;
  --mpr-good: #8BB798;
  --mpr-warn: #D3A75F;
  --mpr-bad: #E08A72;
  --mpr-shadow: 0 1px 2px rgba(0, 0, 0, .28);
}
.mpr-root *, .mpr-root *::before, .mpr-root *::after { box-sizing: border-box; }
.mpr-root ::-webkit-scrollbar { width: 8px; height: 8px; }
.mpr-root ::-webkit-scrollbar-thumb { background: var(--mpr-border-strong); border-radius: 4px; }
.mpr-root ::-webkit-scrollbar-track { background: transparent; }
.mpr-head { flex: 0 0 auto; display: flex; align-items: center; gap: 12px; padding: 12px 20px; border-bottom: 1px solid var(--mpr-border); }
.mpr-brand { display: flex; align-items: center; gap: 10px; min-width: 0; }
.mpr-mark { width: 30px; height: 30px; flex: 0 0 auto; border-radius: 9px; background: var(--mpr-accent); color: #fff; display: flex; align-items: center; justify-content: center; }
.mpr-title { margin: 0; font-family: var(--mpr-serif); font-size: 17px; font-weight: 600; line-height: 1.2; letter-spacing: .01em; }
.mpr-sub { margin-top: 1px; font-size: 11px; color: var(--mpr-muted); }
.mpr-head-right { margin-left: auto; display: flex; align-items: center; gap: 10px; }
.mpr-status { display: flex; align-items: center; gap: 6px; font-size: 11px; color: var(--mpr-muted); white-space: nowrap; }
.mpr-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--mpr-muted); }
.mpr-dot--live { background: var(--mpr-good); }
.mpr-dot--baseline { background: var(--mpr-warn); }
.mpr-dot--error { background: var(--mpr-bad); }
.mpr-btn { height: 30px; padding: 0 12px; border-radius: 8px; border: 1px solid var(--mpr-border-strong); background: var(--mpr-surface); color: var(--mpr-text); font: inherit; font-size: 12px; cursor: pointer; white-space: nowrap; }
.mpr-btn:hover { border-color: var(--mpr-accent); color: var(--mpr-accent); }
.mpr-btn:disabled { opacity: .55; cursor: default; }
.mpr-btn--primary { background: var(--mpr-accent); border-color: var(--mpr-accent); color: #fff; }
.mpr-btn--primary:hover { background: var(--mpr-accent-dark); border-color: var(--mpr-accent-dark); color: #fff; }
.mpr-body { flex: 1 1 auto; min-height: 0; display: flex; }
.mpr-main { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; }
.mpr-tabs { flex: 0 0 auto; display: flex; gap: 4px; padding: 16px 20px 0; overflow-x: auto; scrollbar-width: none; }
.mpr-tabs::-webkit-scrollbar { display: none; }
.mpr-tab { flex: 0 0 auto; height: 28px; padding: 0 11px; border-radius: 8px; border: 1px solid transparent; background: transparent; color: var(--mpr-muted); font: inherit; font-size: 12px; cursor: pointer; white-space: nowrap; }
.mpr-tab:hover { color: var(--mpr-text); }
.mpr-tab.is-on { background: var(--mpr-surface); color: var(--mpr-text); border-color: var(--mpr-border); font-weight: 600; }
.mpr-scenario { display: flex; align-items: center; gap: 14px; padding: 18px 20px 4px; }
.mpr-scenario-title { margin: 0; font-family: var(--mpr-serif); font-size: 19px; font-weight: 600; line-height: 1.2; letter-spacing: .005em; }
.mpr-scenario-count { font-size: 11px; color: var(--mpr-muted); white-space: nowrap; font-variant-numeric: tabular-nums; }
.mpr-search { margin-left: auto; flex: 0 1 190px; height: 30px; padding: 0 10px; border-radius: 8px; border: 1px solid transparent; background: var(--mpr-surface-2); color: var(--mpr-text); font: inherit; font-size: 11.5px; }
.mpr-search::placeholder { color: var(--mpr-muted); }
.mpr-search:focus { outline: none; border-color: var(--mpr-border-strong); background: var(--mpr-surface); }
.mpr-count { margin-left: auto; font-size: 11px; color: var(--mpr-muted); white-space: nowrap; }
.mpr-scroll { flex: 1 1 auto; min-height: 0; overflow: auto; padding: 0 20px 28px; }
.mpr-group { margin-top: 26px; }
.mpr-group-head { margin-bottom: 10px; }
.mpr-group-no { display: none; }
.mpr-group-title { margin: 0; font-family: var(--mpr-sans); font-size: 10.5px; font-weight: 600; letter-spacing: .14em; text-transform: uppercase; color: var(--mpr-muted); }
.mpr-group-hint { display: none; }
.mpr-cards { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; }
.mpr-card { position: relative; display: flex; flex-direction: column; gap: 7px; padding: 12px 14px 13px; border-radius: 14px; border: 1px solid var(--mpr-border); background: var(--mpr-surface); box-shadow: none; cursor: pointer; text-align: left; font: inherit; color: inherit; transition: border-color .12s ease, background .12s ease; min-width: 0; }
.mpr-card:hover { border-color: var(--mpr-border-strong); background: var(--mpr-surface); }
.mpr-card:focus-visible { outline: 2px solid var(--mpr-accent); outline-offset: 1px; }
.mpr-card-head { display: flex; align-items: baseline; gap: 8px; min-width: 0; }
.mpr-card-cost-row { display: none; }
.mpr-card-rank { display: none; }
.mpr-name { flex: 1 1 auto; font-size: 13px; font-weight: 600; letter-spacing: -.01em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0; }
.mpr-card-price { display: flex; align-items: baseline; justify-content: space-between; flex-wrap: wrap; gap: 2px 8px; }
.mpr-price-row { display: flex; align-items: baseline; gap: 2px; font-variant-numeric: tabular-nums; }
.mpr-price-in b, .mpr-price-out b { font-size: 16px; font-weight: 600; letter-spacing: -.02em; color: var(--mpr-text); }
.mpr-price-lbl { font-style: normal; font-size: 9px; color: var(--mpr-muted); margin-right: 2px; }
.mpr-price-sep { font-size: 12px; color: var(--mpr-border-strong); margin: 0 1px; }
.mpr-price { display: none; }
.mpr-price-unit { font-size: 10px; color: var(--mpr-muted); margin-left: 1px; }
.mpr-cost { flex: 0 0 auto; font-size: 10px; color: var(--mpr-muted); white-space: nowrap; font-variant-numeric: tabular-nums; }
.mpr-cost.is-warn { color: var(--mpr-warn); }
.mpr-tags { display: none; }
.mpr-tag { display: none; }
.mpr-card-summary { margin: 0; font-size: 11px; line-height: 1.6; color: var(--mpr-muted); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.mpr-card-note { font-size: 10px; line-height: 1.3; color: var(--mpr-muted); white-space: nowrap; }
.mpr-warn { display: none; }
.mpr-group-empty { padding: 14px 2px; font-size: 12px; color: var(--mpr-muted); }
.mpr-empty { padding: 48px 16px; text-align: center; font-size: 12px; color: var(--mpr-muted); }
.mpr-error { margin: 10px 20px 0; padding: 8px 10px; border-radius: 8px; border: 1px solid var(--mpr-bad); color: var(--mpr-bad); font-size: 12px; }
.mpr-note { margin-top: 20px; padding-top: 12px; border-top: 1px dashed var(--mpr-border); font-size: 11px; line-height: 1.6; color: var(--mpr-muted); }
.mpr-loading { flex: 1 1 auto; display: flex; align-items: center; justify-content: center; color: var(--mpr-muted); font-size: 12px; }
.mpr-detail { flex: 1 1 auto; min-height: 0; display: flex; flex-direction: column; }
.mpr-detail-bar { flex: 0 0 auto; display: flex; align-items: center; gap: 12px; padding: 9px 20px; border-bottom: 1px solid var(--mpr-border); background: var(--mpr-surface-2); }
.mpr-back { display: inline-flex; align-items: center; gap: 6px; height: 28px; padding: 0 10px; border-radius: 8px; border: 1px solid var(--mpr-border-strong); background: var(--mpr-surface); color: var(--mpr-text); font: inherit; font-size: 12px; cursor: pointer; }
.mpr-back:hover { border-color: var(--mpr-accent); color: var(--mpr-accent); }
.mpr-crumb { min-width: 0; font-size: 11px; color: var(--mpr-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.mpr-detail-scroll { flex: 1 1 auto; min-height: 0; overflow: auto; }
.mpr-detail-inner { max-width: 900px; margin: 0 auto; padding: 28px 28px 56px; }
.mpr-detail-head h1 { margin: 0; font-family: var(--mpr-serif); font-size: 27px; font-weight: 600; line-height: 1.2; letter-spacing: .005em; }
.mpr-detail-tagline { margin: 7px 0 0; font-size: 13.5px; color: var(--mpr-muted); }
.mpr-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 14px; }
.mpr-chip { font-size: 10.5px; padding: 2px 8px; border-radius: 999px; border: 1px solid var(--mpr-border); color: var(--mpr-muted); background: transparent; }
.mpr-detail-grid { display: grid; grid-template-columns: minmax(0, 1.5fr) minmax(210px, 1fr); gap: 36px; margin-top: 24px; align-items: start; }
.mpr-detail-side { position: sticky; top: 0; display: flex; flex-direction: column; gap: 10px; }
.mpr-sec { padding: 22px 0; border-top: 1px solid var(--mpr-border); }
.mpr-detail-main .mpr-sec:first-child { border-top: 0; padding-top: 0; }
.mpr-sec-title { margin: 0 0 10px; font-family: var(--mpr-sans); font-size: 10.5px; font-weight: 600; letter-spacing: .14em; text-transform: uppercase; color: var(--mpr-muted); }
.mpr-prose { margin: 0; font-size: 13px; line-height: 1.85; }
.mpr-meta-line { display: none; }
.mpr-table { border: 1px solid var(--mpr-border); border-radius: 10px; overflow: hidden; background: var(--mpr-surface); }
.mpr-tr { display: grid; grid-template-columns: 1.2fr 1fr 1fr 1fr; gap: 8px; align-items: center; padding: 9px 12px; font-size: 12px; border-top: 1px solid var(--mpr-border); font-variant-numeric: tabular-nums; }
.mpr-tr:first-child { border-top: 0; }
.mpr-tr--head { background: var(--mpr-surface-2); color: var(--mpr-muted); font-size: 11px; }
.mpr-tr--muted { color: var(--mpr-muted); }
.mpr-tr--muted .mpr-span-3 { grid-column: 2 / span 3; }
.mpr-tr-name { display: flex; align-items: center; gap: 6px; min-width: 0; }
.mpr-tr-name b { font-weight: 600; }
.mpr-tr-sub { font-size: 10px; color: var(--mpr-muted); }
.mpr-callout { margin-top: 10px; padding: 10px 12px; border-radius: 10px; background: var(--mpr-accent-soft); border: 1px solid var(--mpr-border); }
.mpr-callout-title { font-size: 12px; font-weight: 600; }
.mpr-callout p { margin: 5px 0 0; font-size: 12px; line-height: 1.6; }
.mpr-peak-row { display: flex; flex-wrap: wrap; gap: 4px 18px; margin-top: 6px; font-size: 12px; font-variant-numeric: tabular-nums; }
.mpr-fine { margin: 5px 0 0; font-size: 11px; line-height: 1.55; color: var(--mpr-muted); }
.mpr-fine--warn { color: var(--mpr-warn); }
.mpr-fit { display: grid; gap: 7px; }
.mpr-fit-row { display: grid; grid-template-columns: 84px 26px 1fr; align-items: center; gap: 8px; font-size: 12px; }
.mpr-fit-grade { font-weight: 700; font-size: 11px; }
.mpr-fit-grade--a { color: var(--mpr-good); }
.mpr-fit-grade--b { color: var(--mpr-accent); }
.mpr-fit-grade--c { color: var(--mpr-muted); }
.mpr-fit-grade--d { color: var(--mpr-bad); }
.mpr-fit-bar { height: 6px; border-radius: 3px; background: var(--mpr-surface-3); overflow: hidden; }
.mpr-fit-bar i { display: block; height: 100%; background: var(--mpr-accent); border-radius: 3px; }
.mpr-cases { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; }
.mpr-case { display: flex; gap: 12px; padding: 10px 12px; border: 1px solid var(--mpr-border); border-radius: 10px; background: var(--mpr-surface); }
.mpr-case-no { flex: 0 0 auto; font-family: var(--mpr-serif); font-size: 18px; line-height: 1.1; color: var(--mpr-accent); }
.mpr-case-scenario { margin-bottom: 2px; font-size: 10px; letter-spacing: .06em; color: var(--mpr-muted); }
.mpr-case-text { margin: 0; font-size: 12.5px; line-height: 1.65; }
.mpr-bullets { margin: 0; padding-left: 18px; }
.mpr-bullets li { font-size: 12.5px; line-height: 1.7; margin: 3px 0; }
.mpr-proscons { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.mpr-pc { border: 1px solid var(--mpr-border); border-radius: 10px; padding: 10px 12px; background: var(--mpr-surface); }
.mpr-pc h3 { margin: 0 0 6px; font-size: 11px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; color: var(--mpr-muted); }
.mpr-pc ul { margin: 0; padding-left: 16px; }
.mpr-pc li { font-size: 12px; line-height: 1.65; margin: 3px 0; }
.mpr-params { border: 1px solid var(--mpr-border); border-radius: 10px; overflow: hidden; background: var(--mpr-surface); }
.mpr-param { display: flex; gap: 10px; padding: 7px 12px; border-top: 1px solid var(--mpr-border); font-size: 12px; }
.mpr-param:first-child { border-top: 0; }
.mpr-param-k { flex: 0 0 76px; color: var(--mpr-muted); }
.mpr-param-v { flex: 1 1 auto; min-width: 0; word-break: break-word; }
.mpr-links { display: flex; flex-direction: column; gap: 4px; }
.mpr-a { color: var(--mpr-accent); text-decoration: none; font-size: 12px; word-break: break-all; }
.mpr-a:hover { text-decoration: underline; }
.mpr-side-card { border: 1px solid var(--mpr-border); border-radius: 10px; padding: 12px; background: var(--mpr-surface); }
.mpr-side-card h3 { margin: 0 0 6px; font-size: 11px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; color: var(--mpr-muted); }
.mpr-side-big { font-family: var(--mpr-serif); font-size: 22px; font-weight: 600; font-variant-numeric: tabular-nums; }
.mpr-side-line { margin-top: 4px; font-size: 11.5px; color: var(--mpr-muted); }
@media (max-width: 880px) {
  .mpr-detail-grid { grid-template-columns: 1fr; }
  .mpr-detail-side { position: static; }
}
@media (max-width: 720px) {
  .mpr-side { flex-basis: 150px; }
  .mpr-proscons { grid-template-columns: 1fr; }
}
`

    function installStyles() {
      for (const stale of document.querySelectorAll('style[data-mpr]')) stale.remove()
      const node = document.createElement('style')
      node.setAttribute('data-mpr', '')
      node.textContent = CSS
      document.head.appendChild(node)
      return () => node.remove()
    }

    function makeT(ctx) {
      return function t(key) {
        let locale = 'zh'
        try {
          const snapshot = ctx.locale.getLocale()
          if (snapshot && snapshot.active) locale = String(snapshot.active)
        } catch {
          /* fall back to Chinese */
        }
        const dict = locale.toLowerCase().startsWith('zh') ? DICT.zh : DICT.en
        return Object.prototype.hasOwnProperty.call(dict, key) ? dict[key] : key
      }
    }

    function useLocaleTick(ctx) {
      const [, force] = useState(0)
      useEffect(() => {
        if (!ctx.locale || typeof ctx.locale.subscribe !== 'function') return undefined
        return ctx.locale.subscribe(() => force((value) => value + 1))
      }, [])
    }

    // ---------------------------------------------------------------- helpers

    const usd = (value) => (Number.isFinite(value) ? value : 0)

    function money(value, digits = 2) {
      if (!Number.isFinite(value)) return '—'
      if (value === 0) return '0'
      if (value < 0.01) return value.toPrecision(2)
      if (value < 1) return value.toFixed(3).replace(/0+$/, '').replace(/\.$/, '')
      if (value < 10) return value.toFixed(digits)
      return value.toFixed(value < 100 ? 1 : 0)
    }

    /** USD per 1M tokens -> CNY per 1M tokens, as a bare number string. */
    function yuan(value, rate) {
      return money(usd(value) * (Number.isFinite(rate) ? rate : 7.1))
    }

    /**
     * Official CNY list price when the vendor publishes one, otherwise the USD
     * base converted at the live rate. DeepSeek quotes CNY directly, so using
     * it avoids a rounding drift (¥2 becomes ¥2.01 after an FX round trip).
     */
    function cnyPrice(value, rate, official) {
      if (Number.isFinite(official)) return money(official)
      return yuan(value, rate)
    }

    /** Every cost stays in yuan; tiny amounts just trade decimals for precision. */
    function yuanCost(value, rate) {
      const amount = usd(value) * (Number.isFinite(rate) ? rate : 7.1)
      if (!Number.isFinite(amount)) return '—'
      if (amount === 0) return '¥0'
      if (amount >= 0.1) return `¥${amount.toFixed(2)}`
      if (amount >= 0.01) return `¥${amount.toFixed(3).replace(/0+$/, '').replace(/\.$/, '')}`
      return `¥${amount.toPrecision(2)}`
    }

    /** Rewrite quoted USD amounts inside research prose into CNY. */
    function cnyText(value, rate) {
      if (typeof value !== 'string') return value
      const fx = Number.isFinite(rate) ? rate : 7.1
      return value.replace(/\$\s?(\d[\d,]*(?:\.\d+)?)/g, (whole, raw) => {
        const amount = Number(String(raw).replace(/,/g, ''))
        if (!Number.isFinite(amount)) return whole
        return `¥${money(amount * fx)}`
      })
    }

    /** Price at a given request size, honouring models.dev context tiers. */
    function unitPrice(price, kind, tokens) {
      if (!price) return 0
      let value = kind === 'output' ? usd(price.output) : usd(price.input)
      if (Array.isArray(price.tiers)) {
        for (const tier of price.tiers) {
          if (tokens >= tier.over) value = kind === 'output' ? usd(tier.output) : usd(tier.input)
        }
      }
      return value
    }

    function taskCost(model, inputTokens, outputTokens) {
      if (!model || !model.price) return 0
      return (unitPrice(model.price, 'input', inputTokens) * inputTokens
        + unitPrice(model.price, 'output', outputTokens) * outputTokens) / 1e6
    }

    function contextLabel(tokens) {
      if (!Number.isFinite(tokens) || tokens <= 0) return '—'
      if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(tokens % 1_000_000 === 0 ? 0 : 1)}M`
      return `${Math.round(tokens / 1000)}K`
    }

    function fmtDate(value) {
      if (!value) return '—'
      const text = String(value)
      if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text
      const parsed = Date.parse(text)
      if (Number.isNaN(parsed)) return text
      return new Date(parsed).toISOString().slice(0, 10)
    }

    function fmtTime(value) {
      const parsed = Date.parse(value || '')
      if (Number.isNaN(parsed)) return '—'
      const date = new Date(parsed)
      const pad = (n) => String(n).padStart(2, '0')
      return `${String(date.getFullYear()).slice(2)}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
    }

    function hashOf(text) {
      let hash = 0
      for (const char of String(text || '')) hash = (hash * 31 + char.codePointAt(0)) >>> 0
      return hash
    }

    function qualityScore(model) {
      const caps = model.capabilities || {}
      let score = 0.32
      if (caps.reasoning) score += 0.24
      if (caps.tool) score += 0.2
      if (caps.vision) score += 0.08
      if (caps.structured) score += 0.04
      if ((model.context || 0) >= 1_000_000) score += 0.06
      else if ((model.context || 0) >= 256_000) score += 0.04
      else if ((model.context || 0) < 64_000) score -= 0.06
      if (/opus|fable|astra|sol|pro|max|prime/i.test(model.name)) score += 0.06
      if (/flash|mini|lite|nano|air|small|haiku/i.test(model.name)) score -= 0.04
      return Math.max(0, Math.min(1, score))
    }

    function affordability(relative) {
      if (!Number.isFinite(relative)) return 0.5
      if (relative <= 0) return 1
      // 1 / (1 + relative): a price at the sample's median scores 0.67,
      // a tenth of the median scores 0.91, ten times the median scores 0.09.
      return Math.min(1, 1 / (1 + Math.max(0, relative)))
    }

    function gradeOf(score) {
      if (score >= 0.82) return 'A'
      if (score >= 0.68) return 'B'
      if (score >= 0.52) return 'C'
      return 'D'
    }

    /**
     * Rank the catalogue for one scenario, returning cost-aware grades.
     *
     * Quality is intrinsic capability plus, when present, the model's arena
     * placement on the boards that speak to the scenario. Cost is scored
     * relative to the filtered set's median task price, so the recommendation
     * says "best value for this work", never "absolutely strongest".
     */
    function rankScenario(models, scenario, boards, research) {
      const costs = models.map((model) => taskCost(model, scenario.inputTokens, scenario.outputTokens))
      const sorted = [...costs].sort((a, b) => a - b)
      const median = sorted.length ? sorted[Math.floor(sorted.length / 2)] : 0
      const scenarioBoards = SCENARIO_BOARDS[scenario.id] || ['text']
      const rows = models.map((model, index) => {
        const cost = costs[index]
        const relative = median > 0 ? cost / median : 0
        // A researched grade is the primary quality signal. Without one, fall
        // back to capability flags plus arena placement.
        const rated = findRating(model, research)
        let quality = rated && rated.ratings && rated.ratings[scenario.id]
          ? gradeToQuality(rated.ratings[scenario.id])
          : qualityScore(model)
        const intrinsic = quality
        let arenaBest = null
        if (!rated || !rated.ratings || !rated.ratings[scenario.id]) {
          for (const board of scenarioBoards) {
            const hit = boardRank(model, board, boards)
            if (!hit) continue
            const total = boards[board] && boards[board].models ? boards[board].models.length : 0
            if (!total) continue
            // Top of the board approaches a +0.12 quality bonus; the tail adds ~0.
            const percentile = 1 - Math.min(1, Math.max(0, (hit.rank - 1) / Math.max(1, total - 1)))
            const bonus = 0.12 * percentile
            if (!arenaBest || bonus > arenaBest.bonus) arenaBest = { board, bonus, rank: hit.rank }
          }
          if (arenaBest) quality = Math.min(1, quality + arenaBest.bonus)
        }
        const score = quality * scenario.weights.quality + affordability(relative) * scenario.weights.cost
        const curatedStudy = Boolean(rated && rated.ratings && rated.ratings[scenario.id])
        return {
          model,
          cost,
          relative,
          quality,
          intrinsic,
          score,
          arena: arenaBest,
          study: curatedStudy ? rated : null,
          grade: gradeOf(score),
        }
      })
      rows.sort((a, b) => b.score - a.score || a.cost - b.cost)
      // Flag a same-vendor tier that is both cheaper and better graded: buying
      // the pricier one is the common expensive mistake this panel prevents.
      for (const row of rows) {
        const better = rows.find((other) => other !== row
          && other.model.provider === row.model.provider
          && other.cost < row.cost * 0.9
          && gradeRank(other.grade) > gradeRank(row.grade))
        if (better) {
          row.warning = `${better.model.name}（${better.grade}）更便宜且评级更高`
        }
      }
      return rows
    }

    function gradeRank(grade) {
      return { A: 4, B: 3, C: 2, D: 1 }[grade] || 0
    }

    function gradeToQuality(grade) {
      return { A: 0.95, B: 0.75, C: 0.5, D: 0.25 }[grade] || 0.5
    }

    /** Strip speed/size suffixes so a variant can inherit its base model's study. */
    function baseName(name) {
      return String(name || '')
        .toLowerCase()
        .replace(/\s*(highspeed|high[\s-]*speed|contributor|preview|custom\s*tools)\s*$/i, '')
        .replace(/\s+/g, ' ')
        .trim()
    }

    /**
     * Resolve the researched entry for a model.
     *
     * Exact name wins. Variants such as "Kimi K3.1 Pro Highspeed" inherit the
     * base model's study; a same-name row hosted by another platform does too,
     * because the capability findings are about the model, not the reseller.
     */
    function findRating(model, research) {
      if (!research || !Array.isArray(research.entries)) return null
      const entries = research.entries
      const byName = new Map()
      const byBase = new Map()
      for (const entry of entries) {
        if (!entry || !entry.name) continue
        byName.set(entry.name.toLowerCase(), entry)
        const base = baseName(entry.name)
        if (!byBase.has(base)) byBase.set(base, entry)
      }
      const exact = byName.get(String(model.name || '').toLowerCase())
      if (exact) return exact
      const inherited = byBase.get(baseName(model.name))
      return inherited || null
    }

    function normalise(value) {
      return String(value || '')
        .toLowerCase()
        .replace(/\((x?high|max|medium|low|search|grounding|thinking|reasoning)\)/g, ' ')
        .replace(/[^a-z0-9.]+/g, '-')
        .replace(/^-+|-+$/g, '')
    }

    function boardRank(model, board, boards) {
      const payload = boards && boards[board]
      if (!payload || !Array.isArray(payload.models)) return null
      const keys = new Set([normalise(model.name), normalise(model.id.split('/').slice(-1)[0])])
      for (const row of payload.models) {
        if (keys.has(normalise(row.key)) || keys.has(normalise(row.model))) return row
      }
      return null
    }

    /**
     * Split a scenario's ranked rows into the four recommendation shelves.
     *
     * 0. flagships: one per vendor, the best/newest tier each vendor makes;
     * 1. strongest sub-flagship, by capability score;
     * 2. best value (capability per yuan) among models graded A or B;
     * 3. cheapest that still works (grade C or better), cheapest first.
     *
     * Flagships never leak into shelves 1-3: "效果最好" deliberately names the
     * step below the flagship (Opus beside Fable), so the two shelves answer
     * different questions instead of repeating the same model.
     */
    function recommendGroups(ranked, limit = 4) {
      const byQuality = (a, b) => b.quality - a.quality || b.intrinsic - a.intrinsic || a.cost - b.cost
      const byValue = (a, b) => valueScore(b) - valueScore(a) || byQuality(a, b)
      const byCost = (a, b) => a.cost - b.cost || b.quality - a.quality

      const flagships = [...ranked]
        .filter((row) => row.model.tier === 'flagship')
        .sort(byQuality)
      const chosen = new Set(flagships.map((row) => row.model.id))

      const take = (compare, accept) => {
        const out = []
        for (const row of [...ranked].sort(compare)) {
          if (out.length >= limit) break
          if (chosen.has(row.model.id)) continue
          if (row.model.tier === 'flagship') continue
          if (accept && !accept(row)) continue
          chosen.add(row.model.id)
          out.push(row)
        }
        return out
      }

      const strongest = take(byQuality)
      let value = take(byValue, (row) => gradeRank(row.grade) >= 3)
      if (value.length < limit) value = value.concat(take(byValue, (row) => gradeRank(row.grade) >= 2))
      let budget = take(byCost, (row) => gradeRank(row.grade) >= 2)
      if (budget.length < limit) budget = budget.concat(take(byCost))
      return [
        { id: 'flagship', rows: flagships },
        { id: 'quality', rows: strongest },
        { id: 'value', rows: value },
        { id: 'budget', rows: budget },
      ]
    }

    function valueScore(row) {
      const cost = Math.max(row.cost, 0.0005)
      return row.quality / cost
    }

    function peakNoteOf(model) {
      return (model.priceNotes || []).find((note) => note && note.kind === 'peak') || null
    }

    function offPeakOf(price, note) {
      if (!price || !note) return null
      const ratio = Number.isFinite(note.offPeakRatio) ? note.offPeakRatio : 0.5
      return { input: usd(price.input) * ratio, output: usd(price.output) * ratio }
    }

    function casesFor(model, fitted) {
      const picks = fitted.length ? fitted.slice(0, 4) : SCENARIOS.slice(0, 4)
      const offset = hashOf(model.name) % 3
      return picks.map((scenario, index) => {
        const library = CASE_LIBRARY[scenario.id] || CASE_LIBRARY.quick
        return {
          scenario: scenario.name,
          text: library[(offset + index) % library.length],
        }
      })
    }

    function tipsForModel(model) {
      const caps = model.capabilities || {}
      const tips = []
      if (caps.reasoning) tips.push('先让它列出步骤和验收标准再执行；简单任务把思考强度调低，省 token 也更快。')
      if ((model.context || 0) >= 200_000) {
        tips.push(`把规范、示例和验收标准一次性放进同一条消息（它支持 ${contextLabel(model.context)} 上下文），减少来回。`)
      }
      if (caps.tool) tips.push('接上文件、终端或搜索工具，让它先查证再回答，比只靠记忆可靠。')
      if (caps.vision) tips.push('截图、表格和报错页面直接作为图片输入，比文字转述更准确。')
      if (caps.structured) tips.push('需要固定格式时用 JSON Schema / 结构化输出，避免解析失败后的重试。')
      if (model.price && Number.isFinite(model.price.cacheRead)) {
        tips.push('把固定的长前缀（系统提示、代码库说明）放在开头，命中缓存能明显降低输入成本。')
      }
      if (peakNoteOf(model)) tips.push('批量任务放到闲时跑，价格是高峰的一半。')
      if (caps.openWeights) tips.push('可以本地部署或微调，敏感数据不必出内网。')
      if (tips.length < 4) tips.push('先用一个小样本试跑，确认输出风格后再批量处理。')
      return tips.slice(0, 5)
    }

    function prosForModel(model, research, rate) {
      if (research && typeof research.facts === 'string' && research.facts.trim()) return [cnyText(research.facts.trim(), rate)]
      if (research && Array.isArray(research.facts) && research.facts.length) return research.facts.slice(0, 4).map((item) => cnyText(item, rate))
      const caps = model.capabilities || {}
      const out = []
      if (model.context) out.push(`上下文 ${contextLabel(model.context)}，适合长文档与多轮任务。`)
      if (caps.reasoning) out.push('支持推理模式，复杂问题可以先把步骤想清楚。')
      if (caps.tool) out.push('支持工具调用，能读写文件、跑命令、查资料。')
      if (caps.vision) out.push('支持图片输入，截图和表格可以直接交给它。')
      if (caps.structured) out.push('支持结构化输出，方便接进程序。')
      if (out.length === 0) out.push('价格来自官方公开报价，适合作为日常备选。')
      return out.slice(0, 4)
    }

    function consForModel(model, research, rate) {
      const weak = research ? research.weaknesses : null
      const raw = typeof weak === 'string' && weak.trim()
        ? [weak.trim()]
        : Array.isArray(weak) ? [...weak] : []
      const out = raw.map((item) => cnyText(item, rate))
      for (const note of model.priceNotes || []) {
        if (note && note.kind === 'promo') out.push(cnyText(note.text, rate))
      }
      if (out.length === 0) out.push('公开资料里没有明显的短板记录；建议先用小样本试跑再放量。')
      return out.slice(0, 4)
    }

    function modalitiesOf(model) {
      const caps = model.capabilities || {}
      const list = ['文本']
      if (caps.vision) list.push('图片')
      if (caps.audio) list.push('音频')
      return list.join(' · ')
    }

    // ------------------------------------------------------------ theme + data

    function parseColor(value) {
      if (typeof value !== 'string') return null
      const text = value.trim()
      const hex = /^#([0-9a-f]{6})$/i.exec(text) || /^#([0-9a-f]{3})$/i.exec(text)
      if (hex) {
        const raw = hex[1].length === 3
          ? hex[1].split('').map((c) => c + c).join('')
          : hex[1]
        return [0, 2, 4].map((i) => parseInt(raw.slice(i, i + 2), 16))
      }
      const rgb = /rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/i.exec(text)
      if (rgb) return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])]
      return null
    }

    /**
     * Follow the host colour scheme.
     *
     * The panel paints its own palette, so it has to know whether the app is
     * light or dark. Prefer the host's own background token; fall back to theme
     * attributes and finally the page background.
     */
    function useThemeMode() {
      const [dark, setDark] = useState(false)
      useEffect(() => {
        const root = typeof document !== 'undefined' ? document.documentElement : null
        const read = () => {
          try {
            if (typeof getComputedStyle === 'function' && document.body) {
              const style = getComputedStyle(document.body)
              const token = parseColor(style.getPropertyValue('--dsw-alias-bg-base'))
                || parseColor(style.backgroundColor)
              if (token) {
                const [r, g, b] = token
                return (r * 299 + g * 587 + b * 114) / 1000 < 118
              }
            }
          } catch {
            /* fall through to attributes */
          }
          try {
            if (root) {
              const attr = `${root.getAttribute('data-theme') || ''} ${root.getAttribute('data-color-scheme') || ''} ${root.className || ''}`.toLowerCase()
              if (/dark/.test(attr)) return true
              if (/light/.test(attr)) return false
            }
          } catch {
            /* default to light */
          }
          return false
        }
        setDark(read())
        if (typeof MutationObserver !== 'function' || !root) return undefined
        const observer = new MutationObserver(() => setDark(read()))
        observer.observe(root, { attributes: true, attributeFilter: ['data-theme', 'data-color-scheme', 'class', 'style'] })
        return () => observer.disconnect()
      }, [])
      return dark
    }

    function readStored() {
      try {
        const raw = localStorage.getItem(CACHE_KEY)
        return raw ? JSON.parse(raw) : null
      } catch {
        return null
      }
    }

    function writeStored(payload) {
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), payload }))
      } catch {
        /* storage can be full or blocked; the in-memory copy still works */
      }
    }

    function useCatalogue() {
      const [payload, setPayload] = useState(() => {
        const stored = readStored()
        return stored && stored.payload ? stored.payload : null
      })
      const [loading, setLoading] = useState(false)
      const [error, setError] = useState(null)
      const [refreshing, setRefreshing] = useState(false)
      const mounted = useRef(true)

      useEffect(() => () => { mounted.current = false }, [])

      const load = useCallback(async (force) => {
        if (force) setRefreshing(true)
        else setLoading(true)
        setError(null)
        try {
          const response = await fetch(`${API}/${force ? 'refresh' : 'catalog'}`, force
            ? { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' }
            : { method: 'GET' })
          if (!response.ok) throw new Error(`HTTP ${response.status}`)
          const next = await response.json()
          if (!mounted.current) return
          setPayload(next)
          writeStored(next)
        } catch (err) {
          if (mounted.current) setError(String(err && err.message ? err.message : err))
        } finally {
          if (mounted.current) {
            setLoading(false)
            setRefreshing(false)
          }
        }
      }, [])

      useEffect(() => { load(false) }, [load])

      return { payload, loading, error, refreshing, refresh: () => load(true) }
    }

    // -------------------------------------------------------------- components

    function Tags({ model, t }) {
      const caps = model.capabilities || {}
      const labels = t('tags') || {}
      const list = []
      if (caps.reasoning) list.push(labels.reasoning)
      if (caps.tool) list.push(labels.tool)
      if (caps.vision) list.push(labels.vision)
      if (caps.structured) list.push(labels.structured)
      if (caps.openWeights) list.push(labels.openWeights)
      return h('div', { className: 'mpr-tags' }, list.map((label, index) => h('span', {
        key: `${label}-${index}`,
        className: 'mpr-tag',
      }, label)))
    }

    function PriceLine({ price, cny, rate, t }) {
      const peak = cny || null
      return h('div', {
        className: 'mpr-price-row',
        title: `${t('input')} / ${t('output')} · ${t('perMillion')}`,
      },
      h('span', { className: 'mpr-price-in' }, h('i', { className: 'mpr-price-lbl' }, '入'), h('b', null, `¥${cnyPrice(price && price.input, rate, peak && peak.input)}`)),
      h('span', { className: 'mpr-price-sep' }, '/'),
      h('span', { className: 'mpr-price-out' }, h('i', { className: 'mpr-price-lbl' }, '出'), h('b', null, `¥${cnyPrice(price && price.output, rate, peak && peak.output)}`)),
      h('span', { className: 'mpr-price-unit' }, '/M'))
    }

    function ModelCard({ row, rate, t, onOpen }) {
      const model = row.model
      const peak = peakNoteOf(model)
      const off = offPeakOf(model.price, peak)
      const cny = (model.price && model.price.cny) || null
      const offCny = (model.price && model.price.cnyOffPeak) || null
      // Chinese only: a card never falls back to the English source blurb.
      const summary = model.descriptionZh
        || (model.research && model.research.tagline)
        || ''
      return h('article', {
        className: 'mpr-card',
        role: 'button',
        tabIndex: 0,
        onClick: () => onOpen(model),
        onKeyDown: (event) => {
          if (event && (event.key === 'Enter' || event.key === ' ')) onOpen(model)
        },
      },
      h('div', { className: 'mpr-card-head' },
        h('span', { className: 'mpr-name', title: model.name }, model.name),
        h('span', {
          className: `mpr-cost${row.warning ? ' is-warn' : ''}`,
          title: row.warning ? `${t('typicalTask')} · ${row.warning}` : t('typicalTask'),
        }, yuanCost(row.cost, rate))),
      h('div', { className: 'mpr-card-price' },
        h(PriceLine, { price: model.price, cny, rate, t }),
        peak && off
          ? h('span', { className: 'mpr-card-note' },
            `峰谷价 · ${t('offPeak')} ¥${cnyPrice(off.input, rate, offCny && offCny.input)}/¥${cnyPrice(off.output, rate, offCny && offCny.output)}`)
          : null),
      summary ? h('p', { className: 'mpr-card-summary' }, summary) : null)
    }

    function GroupSection({ group, index, rate, t, onOpen }) {
      const meta = GROUPS.find((entry) => entry.id === group.id) || GROUPS[0]
      return h('section', { className: 'mpr-group' },
        h('div', { className: 'mpr-group-head' },
          h('h3', { className: 'mpr-group-title', title: t(meta.hintKey) }, t(meta.labelKey))),
        group.rows.length
          ? h('div', { className: 'mpr-cards' }, group.rows.map((row, position) => h(ModelCard, {
            key: row.model.id,
            row,
            rank: position + 1,
            rate,
            t,
            onOpen,
          })))
          : h('p', { className: 'mpr-group-empty' }, t('empty')))
    }

    function ScenarioTabs({ value, onChange, t }) {
      return h('div', { className: 'mpr-tabs', role: 'tablist' },
        SCENARIOS.map((scenario) => h('button', {
          key: scenario.id,
          type: 'button',
          role: 'tab',
          'aria-selected': scenario.id === value,
          className: `mpr-tab${scenario.id === value ? ' is-on' : ''}`,
          onClick: () => onChange(scenario.id),
        }, scenario.name)))
    }

    function PriceTable({ model, t, rate, scenario }) {
      const official = model.price || {}
      const officialCny = official.cny || null
      const router = model.referencePrice || null
      const routerCost = router ? taskCost({ price: router }, scenario.inputTokens, scenario.outputTokens) : null
      const officialCost = taskCost(model, scenario.inputTokens, scenario.outputTokens)
      const officialSum = usd(official.input) + usd(official.output)
      const deviation = router && officialSum > 0
        ? (usd(router.input) + usd(router.output)) / officialSum
        : null
      const odd = Number.isFinite(deviation) && (deviation < 0.5 || deviation > 2)
      return h('div', null,
        h('div', { className: 'mpr-table' },
          h('div', { className: 'mpr-tr mpr-tr--head' },
            h('span', null, t('channel')),
            h('span', null, `${t('input')} ¥/M`),
            h('span', null, `${t('output')} ¥/M`),
            h('span', null, `${t('cacheRead')} ¥/M`)),
          h('div', { className: 'mpr-tr' },
            h('span', { className: 'mpr-tr-name' }, h('b', null, t('officialApi'))),
            h('span', null, `¥${cnyPrice(official.input, rate, officialCny && officialCny.input)}`),
            h('span', null, `¥${cnyPrice(official.output, rate, officialCny && officialCny.output)}`),
            h('span', null, Number.isFinite(official.cacheRead) ? `¥${cnyPrice(official.cacheRead, rate, officialCny && officialCny.cacheRead)}` : '—')),
          router
            ? h('div', { className: 'mpr-tr' },
              h('span', { className: 'mpr-tr-name' }, h('b', null, t('openRouterApi'))),
              h('span', null, `¥${yuan(router.input, rate)}`),
              h('span', null, `¥${yuan(router.output, rate)}`),
              h('span', null, Number.isFinite(router.cacheRead) ? `¥${yuan(router.cacheRead, rate)}` : '—'))
            : h('div', { className: 'mpr-tr mpr-tr--muted' },
              h('span', { className: 'mpr-tr-name' }, h('b', null, t('openRouterApi'))),
              h('span', { className: 'mpr-span-3' }, t('notListed')))),
        odd
          ? h('p', { className: 'mpr-fine mpr-fine--warn' },
            `OpenRouter 挂牌价约为官方的 ${deviation < 1 ? `${Math.round(deviation * 100)}%` : `${deviation.toFixed(1)} 倍`}，差异较大，可能是平台补贴、渠道折扣或数据延迟；下单前请以官方渠道为准。`)
          : null)
    }

    function PriceNotes({ model, rate, t }) {
      const notes = model.priceNotes || []
      const peak = notes.find((note) => note && note.kind === 'peak')
      const promos = notes.filter((note) => note && note.kind === 'promo')
      const others = notes.filter((note) => note && note.kind !== 'peak' && note.kind !== 'promo')
      if (!peak && promos.length === 0 && others.length === 0) return null
      const off = offPeakOf(model.price, peak)
      const peakCny = (model.price && model.price.cny) || null
      const offCny = (model.price && model.price.cnyOffPeak) || null
      return h('div', null,
        peak
          ? h('div', { className: 'mpr-callout' },
            h('div', { className: 'mpr-callout-title' }, t('peakOffPeak')),
            h('p', null, cnyText(peak.text, rate)),
            off
              ? h('div', { className: 'mpr-peak-row' },
                h('span', null, `${t('peak')} ¥${cnyPrice(model.price.input, rate, peakCny && peakCny.input)} / ¥${cnyPrice(model.price.output, rate, peakCny && peakCny.output)}`),
                h('span', null, `${t('offPeak')} ¥${cnyPrice(off.input, rate, offCny && offCny.input)} / ¥${cnyPrice(off.output, rate, offCny && offCny.output)}`))
              : null,
            peak.peakHours ? h('p', { className: 'mpr-fine' }, `${t('peakHours')}：${peak.peakHours}`) : null,
            peak.source ? h('a', { className: 'mpr-a', href: peak.source, target: '_blank', rel: 'noreferrer' }, peak.source) : null)
          : null,
        promos.map((note, index) => h('div', { className: 'mpr-callout', key: `promo-${index}` },
          h('div', { className: 'mpr-callout-title' }, t('promo')),
          h('p', null, cnyText(note.text, rate)),
          note.until ? h('p', { className: 'mpr-fine' }, `截止 ${note.until}`) : null)),
        others.map((note, index) => h('div', { className: 'mpr-callout', key: `note-${index}` },
          h('div', { className: 'mpr-callout-title' }, t('priceNote')),
          h('p', null, cnyText(note.text, rate)))))
    }

    function CapabilityBlock({ model, t }) {
      const caps = model.capabilities || {}
      const parts = []
      parts.push(`上下文 ${contextLabel(model.context)}${model.maxOutput ? `，单次最多输出 ${contextLabel(model.maxOutput)}` : ''}`)
      if (caps.tool) parts.push('可调用工具')
      if (caps.reasoning) parts.push('可调思考强度')
      if (caps.vision) parts.push('可直接读图')
      if (caps.structured) parts.push('支持结构化输出')
      if (caps.openWeights) parts.push('开放权重')
      return h('div', null,
        h('p', { className: 'mpr-prose' }, `${parts.join('、')}。`),
        h(Tags, { model, t }))
    }

    function ScenarioFit({ model, t }) {
      const research = model.research || null
      const ratings = (research && research.ratings) || {}
      return h('div', { className: 'mpr-fit' }, SCENARIOS.map((scenario) => {
        const grade = ratings[scenario.id] || null
        return h('div', { className: 'mpr-fit-row', key: scenario.id },
          h('span', null, scenario.name),
          h('span', { className: `mpr-fit-grade${grade ? ` mpr-fit-grade--${grade.toLowerCase()}` : ''}` }, grade || '—'),
          h('div', { className: 'mpr-fit-bar' },
            h('i', { style: { width: grade ? `${gradeRank(grade) * 25}%` : '0%' } })),
          h('span', { className: 'mpr-fine' }, scenario.hint))
      }))
    }

    function ModelDetail({ model, row, payload, scenario, rate, t, onBack }) {
      const research = model.research || findRating(model, payload.research)
      const rated = SCENARIOS.map((entry) => ({
        ...entry,
        grade: research && research.ratings ? research.ratings[entry.id] : null,
      }))
      const fitted = rated.filter((entry) => entry.grade)
        .sort((a, b) => gradeRank(b.grade) - gradeRank(a.grade))
      const cases = casesFor(model, fitted)
      const tips = tipsForModel(model)
      const pros = prosForModel(model, research, rate)
      const cons = consForModel(model, research, rate)
      const sources = []
      const push = (url) => {
        if (typeof url === 'string' && url && !sources.includes(url)) sources.push(url)
      }
      for (const url of (research && research.sources) || []) push(url)
      push(model.sourceUrl)
      if (model.referencePrice && model.referencePrice.url) push(model.referencePrice.url)
      const description = model.descriptionZh || ''

      return h('div', { className: 'mpr-detail' },
        h('div', { className: 'mpr-detail-bar' },
          h('button', { type: 'button', className: 'mpr-back', onClick: onBack }, `← ${t('back')}`),
          h('span', { className: 'mpr-crumb' }, `${t('recommendations')} / ${scenario.name} / ${model.name}`)),
        h('div', { className: 'mpr-detail-scroll' },
          h('div', { className: 'mpr-detail-inner' },
            h('header', { className: 'mpr-detail-head' },
              h('h1', null, model.name),
              h('p', { className: 'mpr-detail-tagline' }, (research && research.tagline) || description || ''),
              h('div', { className: 'mpr-chips' },
                h('span', { className: 'mpr-chip' }, `${t('tier')} · ${model.slotLabel || '—'}`),
                h('span', { className: 'mpr-chip' }, `${contextLabel(model.context)} ${t('context')}`),
                model.releaseDate ? h('span', { className: 'mpr-chip' }, `${t('released')} ${fmtDate(model.releaseDate)}`) : null,
                model.capabilities && model.capabilities.openWeights
                  ? h('span', { className: 'mpr-chip' }, t('openWeights'))
                  : null)),
            h('div', { className: 'mpr-detail-grid' },
              h('div', { className: 'mpr-detail-main' },
                h(Section, { title: t('overview') },
                  h('p', { className: 'mpr-prose' },
                    (research && research.position ? `${research.position}档。` : ''),
                    description || '暂无中文简介。')),
                h(Section, { title: t('priceCompare') },
                  h(PriceTable, { model, t, rate, scenario }),
                  h(PriceNotes, { model, rate, t })),
                h(Section, { title: t('caps') }, h(CapabilityBlock, { model, t })),
                h(Section, { title: t('scenarios') },
                  research
                    ? h(ScenarioFit, { model, t })
                    : h('p', { className: 'mpr-fine' }, '这款模型还没有人工调研评级，推荐依据是能力参数与榜单名次。')),
                h(Section, { title: t('useCases') },
                  h('ol', { className: 'mpr-cases' }, cases.map((item, index) => h('li', {
                    key: `${item.scenario}-${index}`,
                    className: 'mpr-case',
                  },
                  h('span', { className: 'mpr-case-no' }, String(index + 1).padStart(2, '0')),
                  h('div', null,
                    h('div', { className: 'mpr-case-scenario' }, item.scenario),
                    h('p', { className: 'mpr-case-text' }, item.text)))))),
                h(Section, { title: t('howToUse') },
                  h('ul', { className: 'mpr-bullets' }, tips.map((tip, index) => h('li', { key: index }, tip)))),
                h(Section, { title: `${t('pros')} / ${t('cons')}` },
                  h('div', { className: 'mpr-proscons' },
                    h('div', { className: 'mpr-pc' },
                      h('h3', null, t('pros')),
                      h('ul', null, pros.map((item, index) => h('li', { key: index }, item)))),
                    h('div', { className: 'mpr-pc' },
                      h('h3', null, t('cons')),
                      h('ul', null, cons.map((item, index) => h('li', { key: index }, item)))))),
                h(Section, { title: t('sources') },
                  h('div', { className: 'mpr-links' }, sources.map((url, index) => h('a', {
                    key: index,
                    className: 'mpr-a',
                    href: url,
                    target: '_blank',
                    rel: 'noreferrer',
                  }, url))))),
              h('aside', { className: 'mpr-detail-side' },
                h('div', { className: 'mpr-side-card' },
                  h('h3', null, `${scenario.name} · ${t('typicalTask')}`),
                  h('div', { className: 'mpr-side-big' }, yuanCost(row ? row.cost : taskCost(model, scenario.inputTokens, scenario.outputTokens), rate)),
                  h('div', { className: 'mpr-side-line' }, `${contextLabel(scenario.inputTokens)} 输入 + ${contextLabel(scenario.outputTokens)} 输出`),
                  row && row.warning
                    ? h('div', { className: 'mpr-side-line' }, `⚠ ${row.warning}`)
                    : null),
                h('div', { className: 'mpr-params' },
                  paramRow(t('tier'), model.slotLabel || '—'),
                  paramRow(t('context'), contextLabel(model.context)),
                  paramRow(t('maxOutput'), contextLabel(model.maxOutput)),
                  paramRow(t('released'), fmtDate(model.releaseDate)),
                  paramRow(t('modalities'), modalitiesOf(model)),
                  paramRow(t('openWeights'), model.capabilities && model.capabilities.openWeights ? '是' : '否'),
                  paramRow(t('cacheRead'), Number.isFinite(model.price && model.price.cacheRead) ? `¥${cnyPrice(model.price.cacheRead, rate, model.price.cny && model.price.cny.cacheRead)}/M` : '—'),
                  paramRow(t('cacheWrite'), Number.isFinite(model.price && model.price.cacheWrite) ? `¥${cnyPrice(model.price.cacheWrite, rate, model.price.cny && model.price.cny.cacheWrite)}/M` : '—'),
                  paramRow(t('confidence'), research && research.confidence ? research.confidence : '—')),
                h('p', { className: 'mpr-fine' }, t('disclaimer')))))))
    }

    function paramRow(key, value) {
      return h('div', { className: 'mpr-param', key },
        h('span', { className: 'mpr-param-k' }, key),
        h('span', { className: 'mpr-param-v' }, value))
    }

    function Section({ title, children, note }) {
      return h('section', { className: 'mpr-sec' },
        h('h2', { className: 'mpr-sec-title' }, title),
        note ? h('p', { className: 'mpr-fine' }, note) : null,
        children)
    }

    function RadarMark() {
      return h('svg', {
        viewBox: '0 0 24 24',
        width: 18,
        height: 18,
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 1.8,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        'aria-hidden': true,
      },
      h('circle', { cx: 12, cy: 12, r: 8.6, opacity: 0.6 }),
      h('circle', { cx: 12, cy: 12, r: 4.2, opacity: 0.4 }),
      h('path', { d: 'M12 12l6-4' }),
      h('circle', { cx: 12, cy: 12, r: 1.6, fill: 'currentColor', stroke: 'none' }))
    }

    function TopBar({ payload, refreshing, onRefresh, t, dark, onToggleTheme }) {
      const status = payload ? payload.status : 'baseline'
      return h('header', { className: 'mpr-head' },
        h('div', { className: 'mpr-brand' },
          h('div', { className: 'mpr-mark' }, h(RadarMark)),
          h('h1', { className: 'mpr-title' }, t('title'))),
        h('div', { className: 'mpr-head-right' },
          h('span', { className: 'mpr-status' },
            h('span', { className: `mpr-dot mpr-dot--${status}` }),
            payload
              ? `${t(status)} · ${t('updated')} ${fmtTime(payload.refreshedAt)}`
              : t('loading')),
          h('button', {
            type: 'button',
            className: 'mpr-btn mpr-btn--primary',
            onClick: onRefresh,
            disabled: refreshing,
          }, refreshing ? t('refreshing') : t('refresh'))))
    }

    function Panel() {
      const ctx = useRadarContext()
      const t = useMemo(() => makeT(ctx), [ctx])
      useLocaleTick(ctx)
      const dark = useThemeMode()
      const { payload, loading, error, refreshing, refresh } = useCatalogue()
      const [scenarioId, setScenarioId] = useState('quick')
      const [query, setQuery] = useState('')
      const [openId, setOpenId] = useState(null)

      const rate = payload && payload.fx && Number.isFinite(payload.fx.usdToCny) ? payload.fx.usdToCny : 7.1
      const boards = payload && payload.arena ? payload.arena.boards : null
      const scenario = SCENARIOS.find((entry) => entry.id === scenarioId) || SCENARIOS[0]

      const visible = useMemo(() => {
        if (!payload) return []
        const needle = query.trim().toLowerCase()
        return (payload.models || []).filter((model) => {
          if (!needle) return true
          const rating = findRating(model, payload.research)
          const hay = `${model.name} ${model.id} ${rating ? rating.tagline : ''} ${model.descriptionZh || ''}`.toLowerCase()
          return hay.includes(needle)
        })
      }, [payload, query])

      const ranked = useMemo(
        () => (payload ? rankScenario(visible, scenario, boards, payload.research) : []),
        [payload, visible, scenario, boards],
      )
      const groups = useMemo(() => recommendGroups(ranked), [ranked])
      const open = openId && payload ? (payload.models || []).find((model) => model.id === openId) : null
      const openRow = open
        ? ranked.find((row) => row.model.id === open.id)
          || rankScenario([open], scenario, boards, payload && payload.research)[0]
        : null

      const total = payload ? (payload.models || []).length : 0

      return h('div', { className: `mpr-root${dark ? ' mpr-root--dark' : ''}` },
        h(TopBar, { payload, refreshing, onRefresh: refresh, t, dark }),
        error ? h('div', { className: 'mpr-error' }, error) : null,
        !payload
          ? h('div', { className: 'mpr-loading' }, loading ? t('loading') : t('empty'))
          : open
            ? h(ModelDetail, {
              model: open,
              row: openRow,
              payload,
              scenario,
              rate,
              t,
              onBack: () => setOpenId(null),
            })
            : h('div', { className: 'mpr-body' },
              h('div', { className: 'mpr-main' },
                h(ScenarioTabs, { value: scenario.id, onChange: setScenarioId, t }),
                h('div', { className: 'mpr-scenario' },
                  h('h2', { className: 'mpr-scenario-title' }, scenario.name),
                  h('div', { className: 'mpr-scenario-count' }, `${visible.length}/${total} 款`),
                  h('input', {
                    className: 'mpr-search',
                    type: 'search',
                    value: query,
                    placeholder: t('search'),
                    onChange: (event) => setQuery(event && event.target ? event.target.value : ''),
                  })),
                h('div', { className: 'mpr-scroll' },
                  groups.map((group, index) => h(GroupSection, {
                    key: group.id,
                    group,
                    index,
                    rate,
                    t,
                    onOpen: (model) => setOpenId(model.id),
                  })),
                  h('p', { className: 'mpr-note' },
                    `${rate.toFixed(2)} · ${payload.arena && payload.arena.date ? payload.arena.date : t('noArena')} · ${t('disclaimer')}`)))))
    }

    // ---------------------------------------------------------------- wiring

    let radarContext = null

    function useRadarContext() {
      return radarContext
    }

    function createSurfaces(ctx) {
      radarContext = ctx
      function RadarIcon(props) {
        const size = props && Number.isFinite(props.size) ? props.size : 18
        return h('svg', {
          viewBox: '0 0 24 24',
          width: size,
          height: size,
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 1.7,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          'aria-hidden': true,
        },
        h('circle', { cx: 12, cy: 12, r: 9, opacity: 0.55 }),
        h('path', { d: 'M12 3v18M3 12h18', opacity: 0.35 }),
        h('path', { d: 'M12 12l6.4-4.2' }),
        h('circle', { cx: 12, cy: 12, r: 1.7, fill: 'currentColor', stroke: 'none' }))
      }
      return { RadarIcon, RadarPanel: Panel }
    }

    return {
      inject: ['slots', 'locale'],
      /** Pure helpers exposed for the render smoke test; the loader ignores extras. */
      __test: {
        SCENARIOS,
        normalise,
        rankScenario,
        recommendGroups,
        taskCost,
        qualityScore,
        ModelDetail,
        findRating,
      },
      apply(ctx) {
        ctx.effect(() => installStyles())
        ctx.effect(() => ctx.locale.register(NS, 'en', DICT.en))
        ctx.effect(() => ctx.locale.register(NS, 'zh', DICT.zh))

        const { RadarIcon, RadarPanel } = createSurfaces(ctx)

        const label = () => {
          try {
            return String(ctx.locale.getLocale().active).toLowerCase().startsWith('zh')
              ? DICT.zh.title
              : DICT.en.title
          } catch {
            return DICT.zh.title
          }
        }

        ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
          name: 'sidebar.panellist',
          id: 'model-price-radar',
          order: 40,
          label,
        }, RadarIcon))

        ctx.slots.inject('main', () => ctx.slots.register({
          name: 'main',
          key: 'model-price-radar',
        }, RadarPanel))
      },
    }
  },
})

