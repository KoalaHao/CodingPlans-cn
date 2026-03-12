import { getProviderIcon, getIcon, getBenchmarkPercentage, GLOBAL_BENCHMARKS } from './config.js';

export class Renderer {
  constructor() {
    this.root = document.getElementById('root');
  }

  renderHomePage(providers, filters, onFilterChange, onProviderClick, onToggleCompare, selectedProviders, onModelCompareClick) {
    const filteredProviders = this.getFilteredProviders(providers, filters);

    this.root.innerHTML = `
      <div class="app-container">
        <header class="header">
          <div class="header-content">
            <h1>AI Coding Plan 对比平台</h1>
            <p>对比主流AI编码服务的价格、额度和功能</p>
          </div>
        </header>

        <main class="content">
          <div class="tabs">
            <button class="tab active" data-tab="home">首页</button>
            <button class="tab" data-tab="compare">套餐对比</button>
            <button class="tab" data-tab="model-compare">模型对比</button>
          </div>

          <div class="filter-bar">
            <div class="filter-section">
              <label class="filter-label">排序方式</label>
              <select id="sort-select" class="filter-select">
                <option value="default" ${filters.sortBy === 'default' ? 'selected' : ''}>默认</option>
                <option value="priceAsc" ${filters.sortBy === 'priceAsc' ? 'selected' : ''}>价格从低到高</option>
                <option value="priceDesc" ${filters.sortBy === 'priceDesc' ? 'selected' : ''}>价格从高到低</option>
                <option value="quotaAsc" ${filters.sortBy === 'quotaAsc' ? 'selected' : ''}>额度从低到高</option>
                <option value="quotaDesc" ${filters.sortBy === 'quotaDesc' ? 'selected' : ''}>额度从高到低</option>
              </select>
            </div>
          </div>

          <div class="providers-grid">
            ${filteredProviders.map(provider => this.renderProviderCard(provider, selectedProviders.includes(provider.id), onToggleCompare)).join('')}
          </div>

          ${filteredProviders.length === 0 ? '<div class="empty-state">没有找到符合条件的服务商</div>' : ''}
        </main>
      </div>
    `;

    this.bindHomeEvents(onFilterChange, onProviderClick, onToggleCompare, onModelCompareClick);
  }

  renderProviderCard(provider, isSelected, onToggleCompare) {
    const minPrice = this.getMinPrice(provider);
    const maxQuota = this.getMaxQuota(provider);
    const providerIcon = provider.icon ? getProviderIcon(provider.icon) : getProviderIcon('default');
    const updatedDate = provider.updatedAt ? this.formatDate(provider.updatedAt) : '';

    return `
      <div class="provider-card ${isSelected ? 'selected' : ''}" data-provider-id="${provider.id}">
        <div class="provider-header">
          <div class="provider-title">
            <span class="provider-icon">${providerIcon}</span>
            <h3 class="provider-name">${provider.name}</h3>
          </div>
          <a href="${provider.url}" target="_blank" rel="noopener noreferrer" class="provider-link" onclick="event.stopPropagation()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15 3 21 3 21 9"/>
              <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
          </a>
        </div>

        <div class="provider-price">
          ${minPrice !== null ? `¥${minPrice}<span class="price-unit">/月起</span>` : '价格未公开'}
        </div>

        <div class="provider-quota">
          ${maxQuota !== null ? `最高 ${this.formatNumber(maxQuota)} 请求/月` : '额度未公开'}
        </div>

        ${updatedDate ? `<div class="provider-updated">更新于 ${updatedDate}</div>` : ''}

        <div class="provider-models">
          <div class="models-label">支持模型</div>
          <div class="models-list">
            ${provider.models.map(model => {
              const modelIcon = model.icon ? getIcon(model.icon) : '';
              return `
                <span class="model-tag" data-model-info='${JSON.stringify(model).replace(/'/g, "&#39;")}'>
                  ${modelIcon ? `<span class="model-tag-icon">${modelIcon}</span>` : ''}
                  ${model.name}
                </span>
              `;
            }).join('')}
          </div>
        </div>

        <div class="provider-plans-preview">
          <div class="plans-label">可用套餐</div>
          <div class="plans-list">
            ${provider.plans.map(plan => `
              <span class="plan-tag" data-plan-info='${JSON.stringify(plan).replace(/'/g, "&#39;")}'>${plan.name}</span>
            `).join('')}
          </div>
        </div>

        <button class="compare-toggle ${isSelected ? 'selected' : ''}" data-provider-id="${provider.id}">
          ${isSelected ? '已选择对比' : '加入对比'}
        </button>
      </div>
    `;
  }

  renderComparePage(providers, selectedProviderIds, onToggleCompare, onBack) {
    const selectedProviders = providers.filter(p => selectedProviderIds.includes(p.id));

    this.root.innerHTML = `
      <div class="app-container">
        <header class="header">
          <div class="header-content">
            <h1>AI Coding Plan 对比平台</h1>
            <p>对比主流AI编码服务的价格、额度和功能</p>
          </div>
        </header>

        <main class="content">
          <div class="tabs">
            <button class="tab" data-tab="home">首页</button>
            <button class="tab active" data-tab="compare">套餐对比</button>
            <button class="tab" data-tab="model-compare">模型对比</button>
          </div>

          <div class="compare-section">
            <h3 class="compare-title">选择要对比的服务商</h3>
            <div class="compare-selector-grid">
              ${providers.map(provider => {
                const providerIcon = provider.icon ? getProviderIcon(provider.icon) : getProviderIcon('default');
                return `
                  <div class="compare-selector-card ${selectedProviderIds.includes(provider.id) ? 'selected' : ''}" data-provider-id="${provider.id}">
                    <div class="selector-icon">${providerIcon}</div>
                    <div class="selector-name">${provider.name}</div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          ${selectedProviders.length > 0 ? this.renderComparisonTable(selectedProviders) : '<div class="empty-state">请选择至少一个服务商进行对比</div>'}
        </main>
      </div>
    `;

    this.bindCompareEvents(onToggleCompare, onBack);
  }

  renderComparisonTable(providers) {
    const allPlans = providers.map(p => p.plans).flat();
    const allModels = providers.map(p => p.models).flat();

    return `
      <div class="comparison-table-container">
        <table class="comparison-table">
          <thead>
            <tr>
              <th>对比项</th>
              ${providers.map(p => `<th>${p.name}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="row-label">最低价格</td>
              ${providers.map(p => {
                const minPrice = this.getMinPrice(p);
                return `<td>${minPrice !== null ? `¥${minPrice}/月` : '-'}</td>`;
              }).join('')}
            </tr>
            <tr>
              <td class="row-label">最高月限额</td>
              ${providers.map(p => {
                const maxQuota = this.getMaxQuota(p);
                return `<td>${maxQuota !== null ? this.formatNumber(maxQuota) : '-'}</td>`;
              }).join('')}
            </tr>
            <tr>
              <td class="row-label">支持模型</td>
              ${providers.map(p => `
                <td>
                  <div class="table-models">
                    ${p.models.map(model => {
                      const modelIcon = model.icon ? getIcon(model.icon) : '';
                      return `
                        <span class="model-tag small" data-model-info='${JSON.stringify(model).replace(/'/g, "&#39;")}'>
                          ${modelIcon ? `<span class="model-tag-icon">${modelIcon}</span>` : ''}
                          ${model.name}
                        </span>
                      `;
                    }).join('')}
                  </div>
                </td>
              `).join('')}
            </tr>
            <tr>
              <td class="row-label">套餐数量</td>
              ${providers.map(p => `<td>${p.plans.length} 个</td>`).join('')}
            </tr>
          </tbody>
        </table>

        <h3 class="plans-comparison-title">套餐详细对比</h3>
        <table class="comparison-table plans-table">
          <thead>
            <tr>
              <th>服务商</th>
              <th>套餐</th>
              <th>首购价</th>
              <th>续费价</th>
              <th>常规价</th>
              <th>5小时限额</th>
              <th>周限额</th>
              <th>月限额</th>
            </tr>
          </thead>
          <tbody>
            ${providers.map(provider =>
              provider.plans.map((plan, index) => `
                <tr>
                  ${index === 0 ? `<td rowspan="${provider.plans.length}" class="provider-cell">${provider.name}</td>` : ''}
                  <td class="plan-name-cell">${plan.name}</td>
                  <td>${plan.price.firstBuy !== null ? `¥${plan.price.firstBuy}` : '-'}</td>
                  <td>${plan.price.firstRenew !== null ? `¥${plan.price.firstRenew}` : '-'}</td>
                  <td>${plan.price.regular !== null ? `¥${plan.price.regular}` : '-'}</td>
                  <td>${plan.limits.per5hours !== null ? this.formatNumber(plan.limits.per5hours) : '-'}</td>
                  <td>${plan.limits.perWeek !== null ? this.formatNumber(plan.limits.perWeek) : '-'}</td>
                  <td>${plan.limits.perMonth !== null ? this.formatNumber(plan.limits.perMonth) : '-'}</td>
                </tr>
              `).join('')
            ).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  renderDetailPage(provider, onBack) {
    const providerIcon = provider.icon ? getProviderIcon(provider.icon) : getProviderIcon('default');
    const updatedDate = provider.updatedAt ? this.formatDate(provider.updatedAt) : '';

    this.root.innerHTML = `
      <div class="app-container">
        <header class="header">
          <div class="header-content">
            <h1>AI Coding Plan 对比平台</h1>
            <p>对比主流AI编码服务的价格、额度和功能</p>
          </div>
        </header>

        <main class="content">
          <button class="back-button" id="back-button">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="19" y1="12" x2="5" y2="12"/>
              <polyline points="12 19 5 12 12 5"/>
            </svg>
            返回首页
          </button>

          <div class="detail-page">
            <div class="detail-header">
              <div class="detail-title-wrapper">
                <span class="detail-icon">${providerIcon}</span>
                <h2 class="detail-title">${provider.name}</h2>
              </div>
              <div class="detail-meta">
                ${updatedDate ? `<span class="detail-updated">更新于 ${updatedDate}</span>` : ''}
                <a href="${provider.url}" target="_blank" rel="noopener noreferrer" class="detail-link">
                  访问官网
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                    <polyline points="15 3 21 3 21 9"/>
                    <line x1="10" y1="14" x2="21" y2="3"/>
                  </svg>
                </a>
              </div>
            </div>

            <div class="detail-section">
              <h3 class="section-title">支持模型</h3>
              <div class="detail-models">
                ${provider.models.map(model => {
                  const modelIcon = model.icon ? getIcon(model.icon, 'lg') : '';
                  return `
                    <div class="detail-model-card">
                      <span class="model-tag large" data-model-info='${JSON.stringify(model).replace(/'/g, "&#39;")}'>
                        ${modelIcon ? `<span class="model-tag-icon">${modelIcon}</span>` : ''}
                        ${model.name}
                      </span>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>

            <div class="detail-section">
              <h3 class="section-title">套餐详情</h3>
              <div class="detail-plans">
                ${provider.plans.map(plan => this.renderPlanCard(plan)).join('')}
              </div>
            </div>
          </div>
        </main>
      </div>
    `;

    this.bindDetailEvents(onBack);
  }

  renderPlanCard(plan) {
    return `
      <div class="plan-card">
        <div class="plan-header">
          <h4 class="plan-name">${plan.name}</h4>
        </div>

        <div class="plan-prices">
          <div class="price-row">
            <span class="price-label">首购价</span>
            <span class="price-value highlight">¥${plan.price.firstBuy !== null ? plan.price.firstBuy : '-'}</span>
          </div>
          <div class="price-row">
            <span class="price-label">续费价</span>
            <span class="price-value">¥${plan.price.firstRenew !== null ? plan.price.firstRenew : '-'}</span>
          </div>
          <div class="price-row">
            <span class="price-label">常规价</span>
            <span class="price-value">¥${plan.price.regular !== null ? plan.price.regular : '-'}</span>
          </div>
        </div>

        ${plan.price.extraInfo ? `<div class="plan-extra-info">${plan.price.extraInfo}</div>` : ''}

        <div class="plan-limits">
          <div class="limit-row">
            <span class="limit-label">5小时限额</span>
            <span class="limit-value">${plan.limits.per5hours !== null ? this.formatNumber(plan.limits.per5hours) : '-'}</span>
          </div>
          <div class="limit-row">
            <span class="limit-label">每周限额</span>
            <span class="limit-value">${plan.limits.perWeek !== null ? this.formatNumber(plan.limits.perWeek) : '-'}</span>
          </div>
          <div class="limit-row">
            <span class="limit-label">每月限额</span>
            <span class="limit-value">${plan.limits.perMonth !== null ? this.formatNumber(plan.limits.perMonth) : '-'}</span>
          </div>
        </div>
      </div>
    `;
  }

  bindHomeEvents(onFilterChange, onProviderClick, onToggleCompare, onModelCompareClick) {
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        onFilterChange({ sortBy: e.target.value });
      });
    }

    document.querySelectorAll('.provider-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (!e.target.closest('.compare-toggle') && !e.target.closest('.provider-link')) {
          const providerId = card.dataset.providerId;
          onProviderClick(providerId);
        }
      });
    });

    document.querySelectorAll('.compare-toggle').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const providerId = btn.dataset.providerId;
        onToggleCompare(providerId);
      });
    });

    document.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const tabName = e.target.dataset.tab;
        if (tabName === 'compare') {
          onFilterChange({ currentTab: 'compare' });
        } else if (tabName === 'model-compare') {
          onFilterChange({ currentTab: 'model-compare' });
        }
      });
    });
  }

  bindCompareEvents(onToggleCompare, onBack) {
    document.querySelectorAll('.compare-selector-card').forEach(card => {
      card.addEventListener('click', () => {
        const providerId = card.dataset.providerId;
        onToggleCompare(providerId);
      });
    });

    document.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const tabName = e.target.dataset.tab;
        if (tabName === 'home') {
          onBack();
        } else if (tabName === 'model-compare') {
          onBack();
          setTimeout(() => {
            const event = new CustomEvent('switchTab', { detail: { tab: 'model-compare' } });
            document.dispatchEvent(event);
          }, 0);
        }
      });
    });
  }

  bindDetailEvents(onBack) {
    const backButton = document.getElementById('back-button');
    if (backButton) {
      backButton.addEventListener('click', onBack);
    }
  }

  renderModelComparePage(modelCompare, onModelToggle, onSortChange, onFilterChange, onBack) {
    const filteredModels = modelCompare.getFilteredAndSortedModels();
    const selectedModels = modelCompare.getSelectedModels();

    this.root.innerHTML = `
      <div class="app-container">
        <header class="header">
          <div class="header-content">
            <h1>AI 模型对比</h1>
            <p>对比主流AI编程模型的性能指标和能力</p>
          </div>
        </header>

        <main class="content">
          <button class="back-button" id="back-button">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="19" y1="12" x2="5" y2="12"/>
              <polyline points="12 19 5 12 12 5"/>
            </svg>
            返回首页
          </button>

          <div class="model-compare-filters">
            <div class="filter-group">
              <label class="filter-label">排序方式</label>
              <select id="model-sort-select" class="filter-select">
                <option value="sweBench" ${modelCompare.sortBy === 'sweBench' ? 'selected' : ''}>SWE-Bench</option>
                <option value="liveCodeBench" ${modelCompare.sortBy === 'liveCodeBench' ? 'selected' : ''}>LiveCodeBench</option>
                <option value="contextWindow" ${modelCompare.sortBy === 'contextWindow' ? 'selected' : ''}>上下文窗口</option>
              </select>
            </div>
            <div class="filter-group">
              <label class="filter-label">推理能力</label>
              <select id="thinking-filter" class="filter-select">
                <option value="all" ${modelCompare.filterThinking === 'all' ? 'selected' : ''}>全部</option>
                <option value="yes" ${modelCompare.filterThinking === 'yes' ? 'selected' : ''}>支持</option>
                <option value="no" ${modelCompare.filterThinking === 'no' ? 'selected' : ''}>不支持</option>
              </select>
            </div>
            <div class="filter-group">
              <label class="filter-label">模态</label>
              <select id="modalities-filter" class="filter-select">
                <option value="all" ${modelCompare.filterModalities === 'all' ? 'selected' : ''}>全部</option>
                <option value="text" ${modelCompare.filterModalities === 'text' ? 'selected' : ''}>文本</option>
                <option value="image" ${modelCompare.filterModalities === 'image' ? 'selected' : ''}>图像</option>
                <option value="audio" ${modelCompare.filterModalities === 'audio' ? 'selected' : ''}>音频</option>
                <option value="video" ${modelCompare.filterModalities === 'video' ? 'selected' : ''}>视频</option>
              </select>
            </div>
          </div>

          ${selectedModels.length > 0 ? this.renderModelComparisonTable(selectedModels, modelCompare) : ''}

          <div class="models-table-section">
            <h3 class="section-title">点击选择模型进行对比 (最多4个)</h3>
            ${this.renderModelsTable(filteredModels, modelCompare)}
          </div>
        </main>
      </div>
    `;

    this.bindModelCompareEvents(onModelToggle, onSortChange, onFilterChange, onBack);
  }

  renderSortIndicator(column, currentSort, direction) {
    if (currentSort !== column) {
      return '<span class="sort-icon">⇅</span>';
    }
    return direction === 'desc' ? '<span class="sort-icon active">↓</span>' : '<span class="sort-icon active">↑</span>';
  }

  renderModelsTable(models, modelCompare) {
    return `
      <div class="models-table-container">
        <table class="models-table">
          <thead>
            <tr>
              <th class="select-col">选择</th>
              <th class="model-name-col sortable" data-sort="name">模型 ${this.renderSortIndicator('name', modelCompare.sortBy, modelCompare.sortDirection)}</th>
              <th class="params-col sortable" data-sort="parameters">参数量 ${this.renderSortIndicator('parameters', modelCompare.sortBy, modelCompare.sortDirection)}</th>
              <th class="context-col sortable" data-sort="contextWindow">上下文 ${this.renderSortIndicator('contextWindow', modelCompare.sortBy, modelCompare.sortDirection)}</th>
              <th class="modalities-col">模态</th>
              <th class="thinking-col sortable" data-sort="thinking">推理 ${this.renderSortIndicator('thinking', modelCompare.sortBy, modelCompare.sortDirection)}</th>
              <th class="benchmark-col sortable" data-sort="sweBench">SWE-Bench ${this.renderSortIndicator('sweBench', modelCompare.sortBy, modelCompare.sortDirection)}</th>
              <th class="benchmark-col sortable" data-sort="liveCodeBench">LiveCode ${this.renderSortIndicator('liveCodeBench', modelCompare.sortBy, modelCompare.sortDirection)}</th>
            </tr>
          </thead>
          <tbody>
            ${models.map(model => {
              const isSelected = modelCompare.selectedModelIds.includes(model.id);
              const sweBenchPct = getBenchmarkPercentage(model.info.sweBench, 'sweBench');
              const liveCodePct = getBenchmarkPercentage(model.info.liveCodeBench, 'liveCodeBench');
              const modelIcon = model.icon ? getIcon(model.icon) : getIcon('default');
              const isSweEstimated = modelCompare.isEstimatedScore(model, 'sweBench');
              const isLiveEstimated = modelCompare.isEstimatedScore(model, 'liveCodeBench');

              return `
                <tr class="model-table-row ${isSelected ? 'selected' : ''}" data-model-id="${model.id}">
                  <td class="select-cell">
                    <div class="checkbox ${isSelected ? 'checked' : ''}">
                      ${isSelected ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>' : ''}
                    </div>
                  </td>
                  <td class="model-name-cell">
                    <div class="model-name-wrapper">
                      <span class="model-table-icon">${modelIcon}</span>
                      <span class="model-table-name">${model.name}</span>
                    </div>
                  </td>
                  <td class="params-cell">${model.info.parameters || '-'}</td>
                  <td class="context-cell">${modelCompare.formatNumber(model.info.contextWindow)}</td>
                  <td class="modalities-cell">
                    <div class="modalities-list">
                      ${model.info.modalities.map(m => `<span class="modality-tag">${m}</span>`).join('')}
                    </div>
                  </td>
                  <td class="thinking-cell">
                    ${model.info.thinking ? '<span class="thinking-yes">✓</span>' : '<span class="thinking-no">-</span>'}
                  </td>
                  <td class="benchmark-cell">
                    <div class="benchmark-table-cell">
                      <span class="benchmark-score ${isSweEstimated ? 'estimated' : ''}" style="color: ${modelCompare.getBenchmarkColor(sweBenchPct)}" ${isSweEstimated ? 'title="预估分数"' : ''}>${model.info.sweBench ?? '-'}% ${isSweEstimated ? '<span class="estimated-badge">~</span>' : ''}</span>
                      <div class="benchmark-bar-bg">
                        <div class="benchmark-bar-fill ${isSweEstimated ? 'estimated' : ''}" style="width: ${sweBenchPct}%; background: ${modelCompare.getBenchmarkColor(sweBenchPct)}"></div>
                      </div>
                    </div>
                  </td>
                  <td class="benchmark-cell">
                    <div class="benchmark-table-cell">
                      <span class="benchmark-score ${isLiveEstimated ? 'estimated' : ''}" style="color: ${modelCompare.getBenchmarkColor(liveCodePct)}" ${isLiveEstimated ? 'title="预估分数"' : ''}>${model.info.liveCodeBench ?? '-'}% ${isLiveEstimated ? '<span class="estimated-badge">~</span>' : ''}</span>
                      <div class="benchmark-bar-bg">
                        <div class="benchmark-bar-fill ${isLiveEstimated ? 'estimated' : ''}" style="width: ${liveCodePct}%; background: ${modelCompare.getBenchmarkColor(liveCodePct)}"></div>
                      </div>
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  renderModelComparisonTable(selectedModels, modelCompare) {
    const benchmarkTypes = [
      { key: 'sweBench', label: 'SWE-Bench', desc: '软件工程基准测试' },
      { key: 'liveCodeBench', label: 'LiveCodeBench', desc: '实时代码生成' }
    ];

    return `
      <div class="model-comparison-section">
        <div class="comparison-header">
          <h3 class="section-title">模型对比 (${selectedModels.length}/4)</h3>
          <button class="clear-selection-btn" id="clear-selection">清除选择</button>
        </div>
        <div class="model-comparison-table-container">
          <table class="model-comparison-table">
            <thead>
              <tr>
                <th class="feature-column">特性</th>
                ${selectedModels.map(m => `
                  <th class="model-column">
                    <div class="model-header-cell">
                      <span class="model-header-icon">${m.icon ? getIcon(m.icon) : getIcon('default')}</span>
                      <span class="model-header-name">${m.name}</span>
                    </div>
                  </th>
                `).join('')}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="feature-name">参数量</td>
                ${selectedModels.map(m => `<td class="model-value">${m.info.parameters || '-'}</td>`).join('')}
              </tr>
              <tr>
                <td class="feature-name">上下文窗口</td>
                ${selectedModels.map(m => `<td class="model-value">${modelCompare.formatNumber(m.info.contextWindow)}</td>`).join('')}
              </tr>
              <tr>
                <td class="feature-name">支持模态</td>
                ${selectedModels.map(m => `<td class="model-value">${m.info.modalities.join(', ')}</td>`).join('')}
              </tr>
              <tr>
                <td class="feature-name">推理能力</td>
                ${selectedModels.map(m => `<td class="model-value">${m.info.thinking ? '✓' : '✗'}</td>`).join('')}
              </tr>
              <tr>
                <td class="feature-name">最大推理长度</td>
                ${selectedModels.map(m => `<td class="model-value">${m.info.maxThinkingLength ? modelCompare.formatNumber(m.info.maxThinkingLength) : '-'}</td>`).join('')}
              </tr>
              ${benchmarkTypes.map(benchmark => `
                <tr class="benchmark-row">
                  <td class="feature-name">
                    <div class="benchmark-header">
                      <span class="benchmark-name">${benchmark.label}</span>
                      <span class="benchmark-desc">${benchmark.desc}</span>
                    </div>
                  </td>
                  ${selectedModels.map(m => {
                    const score = m.info[benchmark.key];
                    const pct = getBenchmarkPercentage(score, benchmark.key);
                    const color = modelCompare.getBenchmarkColor(pct);
                    return `
                      <td class="model-value benchmark-cell">
                        <div class="benchmark-score-large" style="color: ${color}">${score ?? '-'}%</div>
                        <div class="benchmark-bar-bg">
                          <div class="benchmark-bar-fill-large" style="width: ${pct}%; background: ${color}"></div>
                        </div>
                      </td>
                    `;
                  }).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  bindModelCompareEvents(onModelToggle, onSortChange, onFilterChange, onBack) {
    const backButton = document.getElementById('back-button');
    if (backButton) {
      backButton.addEventListener('click', onBack);
    }

    const sortSelect = document.getElementById('model-sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        onSortChange(e.target.value);
      });
    }

    const thinkingFilter = document.getElementById('thinking-filter');
    if (thinkingFilter) {
      thinkingFilter.addEventListener('change', (e) => {
        onFilterChange('thinking', e.target.value);
      });
    }

    const modalitiesFilter = document.getElementById('modalities-filter');
    if (modalitiesFilter) {
      modalitiesFilter.addEventListener('change', (e) => {
        onFilterChange('modalities', e.target.value);
      });
    }

    document.querySelectorAll('.model-table-row').forEach(row => {
      row.addEventListener('click', () => {
        const modelId = row.dataset.modelId;
        onModelToggle(modelId);
      });
    });

    document.querySelectorAll('.models-table th.sortable').forEach(th => {
      th.addEventListener('click', () => {
        const sortKey = th.dataset.sort;
        if (sortKey) {
          onSortChange(sortKey);
        }
      });
    });

    const clearBtn = document.getElementById('clear-selection');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        onFilterChange('clear', null);
      });
    }
  }

  getFilteredProviders(providers, filters) {
    let filtered = [...providers];

    switch (filters.sortBy) {
      case 'priceAsc':
        filtered.sort((a, b) => (this.getMinPrice(a) || Infinity) - (this.getMinPrice(b) || Infinity));
        break;
      case 'priceDesc':
        filtered.sort((a, b) => (this.getMinPrice(b) || -Infinity) - (this.getMinPrice(a) || -Infinity));
        break;
      case 'quotaAsc':
        filtered.sort((a, b) => (this.getMaxQuota(a) || -Infinity) - (this.getMaxQuota(b) || -Infinity));
        break;
      case 'quotaDesc':
        filtered.sort((a, b) => (this.getMaxQuota(b) || -Infinity) - (this.getMaxQuota(a) || -Infinity));
        break;
    }

    return filtered;
  }

  getMinPrice(provider) {
    if (!provider.plans || provider.plans.length === 0) return null;
    const prices = provider.plans
      .map(plan => plan.price.regular)
      .filter(price => price !== null && price !== undefined);
    return prices.length > 0 ? Math.min(...prices) : null;
  }

  getMaxQuota(provider) {
    if (!provider.plans || provider.plans.length === 0) return null;
    const quotas = provider.plans
      .map(plan => plan.limits.perMonth)
      .filter(quota => quota !== null && quota !== undefined);
    return quotas.length > 0 ? Math.max(...quotas) : null;
  }

  formatNumber(num) {
    if (num === null || num === undefined) return '-';
    if (num >= 10000) return (num / 10000).toFixed(1) + '万';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString();
  }

  formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    const now = new Date();
    const diffTime = now - date;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return '今天';
    if (diffDays === 1) return '昨天';
    if (diffDays < 7) return `${diffDays}天前`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}周前`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}个月前`;

    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }
}
