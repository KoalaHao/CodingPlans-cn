import { formatBenchmarkScore, getBenchmarkPercentage, getIcon } from './config.js';

export class ModelPopup {
  constructor() {
    this.popup = null;
    this.currentTarget = null;
    this.showDelay = 200;
    this.hideDelay = 100;
    this.showTimeout = null;
    this.hideTimeout = null;
    this.init();
  }

  init() {
    this.createPopupElement();
    this.bindGlobalEvents();
  }

  createPopupElement() {
    this.popup = document.createElement('div');
    this.popup.className = 'model-popup';
    this.popup.style.cssText = `
      position: fixed;
      z-index: 10000;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.2s ease, visibility 0.2s ease;
      pointer-events: none;
    `;
    document.body.appendChild(this.popup);

    // 添加 popup 的鼠标离开事件
    this.popup.addEventListener('mouseleave', () => {
      this.hide();
    });

    // 添加 popup 的鼠标进入事件，取消隐藏计时
    this.popup.addEventListener('mouseenter', () => {
      clearTimeout(this.hideTimeout);
    });
  }

  bindGlobalEvents() {
    document.addEventListener('mouseover', (e) => {
      const modelTag = e.target.closest('[data-model-info]');
      if (modelTag) {
        this.handleMouseEnter(modelTag);
      }
    });

    document.addEventListener('mouseout', (e) => {
      const modelTag = e.target.closest('[data-model-info]');
      if (modelTag) {
        this.handleMouseLeave(modelTag);
      }
    });
  }

  handleMouseEnter(target) {
    this.currentTarget = target;
    
    clearTimeout(this.hideTimeout);
    
    this.showTimeout = setTimeout(() => {
      if (this.currentTarget === target) {
        this.show(target);
      }
    }, this.showDelay);
  }

  handleMouseLeave(target) {
    clearTimeout(this.showTimeout);

    this.hideTimeout = setTimeout(() => {
      // 检查鼠标是否不在 popup 上
      if (!this.popup.matches(':hover')) {
        this.hide();
      }
    }, this.hideDelay);
  }

  show(target) {
    const modelData = JSON.parse(target.dataset.modelInfo);
    this.renderContent(modelData);
    this.position(target);
    
    this.popup.style.opacity = '1';
    this.popup.style.visibility = 'visible';
    this.popup.style.pointerEvents = 'auto';
  }

  hide() {
    this.popup.style.opacity = '0';
    this.popup.style.visibility = 'hidden';
    this.popup.style.pointerEvents = 'none';
    this.currentTarget = null;
  }

  renderContent(model) {
    const info = model.info;
    const estimatedBenchmarks = model.estimatedBenchmarks || [];
    
    const formatNumber = (num) => {
      if (num === null || num === undefined) return '-';
      if (num >= 1000) return (num / 1000).toFixed(0) + 'K';
      return num.toString();
    };

    const formatModalities = (modalities) => {
      if (!modalities || modalities.length === 0) return '-';
      const icons = {
        text: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7V4h16v3M9 20h6M12 4v16"/></svg>',
        image: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>',
        audio: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M2 10v4M22 10v4M6 6l12 12M18 6L6 18"/></svg>',
        video: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M10 12l5-3v6l-5-3z"/></svg>'
      };
      return modalities.map(m => icons[m] || m).join(' ');
    };

    const modelIcon = model.icon ? getIcon(model.icon, 'lg') : '';

    this.popup.innerHTML = `
      <div class="model-popup-header">
        ${modelIcon ? `<span class="model-popup-icon">${modelIcon}</span>` : ''}
        <span class="model-popup-name">${model.name}</span>
      </div>
      <div class="model-popup-content">
        <div class="model-popup-row">
          <span class="model-popup-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
            Context Window
          </span>
          <span class="model-popup-value">${formatNumber(info.contextWindow)}</span>
        </div>
        <div class="model-popup-row">
          <span class="model-popup-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v6l4 2"/>
            </svg>
            Modalities
          </span>
          <span class="model-popup-value">${formatModalities(info.modalities)}</span>
        </div>
        <div class="model-popup-row">
          <span class="model-popup-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2a10 10 0 1 0 10 10H12V2z"/>
              <path d="M12 2a10 10 0 0 1 10 10"/>
            </svg>
            Thinking
          </span>
          <span class="model-popup-value">${info.thinking ? 
            '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#52c41a" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Yes' : 
            '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ff4d4f" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> No'}</span>
        </div>
        ${info.thinking && info.maxThinkingLength ? `
        <div class="model-popup-row">
          <span class="model-popup-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
            </svg>
            Max Thinking
          </span>
          <span class="model-popup-value">${formatNumber(info.maxThinkingLength)}</span>
        </div>
        ` : ''}
        <div class="model-popup-row benchmark-row">
          <span class="model-popup-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
              <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
              <path d="M4 22h16"/>
              <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
              <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
              <path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/>
            </svg>
            SWE-bench
          </span>
          <span class="model-popup-value benchmark-value">
            ${this.renderBenchmarkWithBar(info.sweBench, 'sweBench', estimatedBenchmarks.includes('sweBench'))}
          </span>
        </div>
        <div class="model-popup-row benchmark-row">
          <span class="model-popup-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
              <line x1="8" y1="21" x2="16" y2="21"/>
              <line x1="12" y1="17" x2="12" y2="21"/>
            </svg>
            LiveCodeBench
          </span>
          <span class="model-popup-value benchmark-value">
            ${this.renderBenchmarkWithBar(info.liveCodeBench, 'liveCodeBench', estimatedBenchmarks.includes('liveCodeBench'))}
          </span>
        </div>
        <div class="model-popup-row">
          <span class="model-popup-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
            Parameters
          </span>
          <span class="model-popup-value">${info.parameters || '-'}</span>
        </div>
      </div>
    `;
  }

  renderBenchmarkWithBar(score, benchmarkType, isEstimated) {
    if (score === null || score === undefined) return '-';

    const formattedScore = formatBenchmarkScore(score, benchmarkType);
    const percentage = getBenchmarkPercentage(score, benchmarkType);

    let barColor = '#ff4d4f';  // red for low
    if (percentage >= 80) barColor = '#52c41a';  // green for high
    else if (percentage >= 60) barColor = '#faad14';  // yellow for medium
    else if (percentage >= 40) barColor = '#fa8c16';  // orange

    const scoreClass = isEstimated ? 'benchmark-score estimated' : 'benchmark-score';
    const titleAttr = isEstimated ? ' title="预估值"' : '';

    return `
      <div class="benchmark-container">
        <span class="${scoreClass}"${titleAttr}>${formattedScore}</span>
        <div class="benchmark-bar-bg">
          <div class="benchmark-bar-fill" style="width: ${percentage}%; background-color: ${barColor};"></div>
        </div>
      </div>
    `;
  }

  position(target) {
    const rect = target.getBoundingClientRect();
    const popupRect = this.popup.getBoundingClientRect();
    
    let top = rect.top - popupRect.height - 8;
    let left = rect.left + (rect.width / 2) - (popupRect.width / 2);
    
    if (top < 10) {
      top = rect.bottom + 8;
    }
    
    if (left < 10) {
      left = 10;
    } else if (left + popupRect.width > window.innerWidth - 10) {
      left = window.innerWidth - popupRect.width - 10;
    }
    
    this.popup.style.top = `${top}px`;
    this.popup.style.left = `${left}px`;
  }
}
